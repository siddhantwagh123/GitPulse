const axios = require('axios');
require('dotenv').config();

const GITHUB_API = 'https://api.github.com';

// GraphQL Query for high-performance Option A
const GITHUB_GRAPHQL_QUERY = `
query ($username: String!) {
  user(login: $username) {
    avatarUrl
    name
    bio
    login
    url
    followers {
      totalCount
    }
    repositories(first: 100, privacy: PUBLIC, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        name
        description
        url
        forkCount
        stargazerCount
        updatedAt
        primaryLanguage {
          name
          color
        }
        languages(first: 10) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            color
          }
        }
      }
    }
  }
}
`;

/**
 * Fetch user analytics using GraphQL API (Requires GITHUB_PAT)
 */
async function fetchWithGraphQL(username, token) {
  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query: GITHUB_GRAPHQL_QUERY,
        variables: { username }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'GitPulse-Analytics-App'
        }
      }
    );

    if (response.data.errors) {
      const errorMsg = response.data.errors[0]?.message || 'GraphQL Error';
      if (errorMsg.includes('Could not resolve to a User')) {
        throw new Error('User not found');
      }
      throw new Error(errorMsg);
    }

    const userData = response.data.data.user;
    if (!userData) {
      throw new Error('User not found');
    }

    // Parse profile
    const profile = {
      avatar_url: userData.avatarUrl,
      name: userData.name || userData.login,
      bio: userData.bio || '',
      followers: userData.followers.totalCount,
      public_repos: userData.repositories.totalCount,
      profile_url: userData.url
    };

    // Parse repositories (Top 10 for display, rest for lang aggregation)
    const allRepos = userData.repositories.nodes.map(repo => ({
      name: repo.name,
      description: repo.description || '',
      url: repo.url,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      language: repo.primaryLanguage ? repo.primaryLanguage.name : null,
      language_color: repo.primaryLanguage ? repo.primaryLanguage.color : null,
      updated_at: repo.updatedAt
    }));

    const topRepositories = allRepos.slice(0, 10);

    // Aggregate languages by byte sizes across all repos
    const langBytes = {};
    userData.repositories.nodes.forEach(repo => {
      repo.languages.edges.forEach(edge => {
        const langName = edge.node.name;
        langBytes[langName] = (langBytes[langName] || 0) + edge.size;
      });
    });

    const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0);
    const languages = {};
    if (totalBytes > 0) {
      Object.entries(langBytes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([lang, bytes]) => {
          languages[lang] = parseFloat(((bytes / totalBytes) * 100).toFixed(1));
        });
    }

    // Flatten contribution days & calculate streaks
    const contributions = [];
    const calendar = userData.contributionsCollection.contributionCalendar;
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        contributions.push({
          date: day.date,
          count: day.contributionCount
        });
      });
    });

    // Sort contributions chronologically (should already be sorted, but let's be safe)
    contributions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate streaks
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    contributions.forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });

    // Current streak (backward checking)
    let streakActive = true;
    let i = contributions.length - 1;
    while (i >= 0 && streakActive) {
      const day = contributions[i];
      if (day.count > 0) {
        currentStreak++;
        i--;
      } else {
        // Allow today to be 0 if yesterday was active
        if (i === contributions.length - 1) {
          i--;
        } else {
          streakActive = false;
        }
      }
    }

    return {
      profile,
      repositories: topRepositories,
      languages,
      contributions,
      stats: {
        total_contributions: calendar.totalContributions,
        longest_streak: longestStreak,
        current_streak: currentStreak
      }
    };
  } catch (error) {
    console.error('GraphQL API error:', error.message);
    throw error;
  }
}

/**
 * Fetch profile + repos from REST API + Scrape heatmap (Option B fallback)
 */
async function fetchWithRest(username) {
  try {
    const headers = { 'User-Agent': 'GitPulse-Analytics-App' };

    // 1. Get user profile
    const profileRes = await axios.get(`${GITHUB_API}/users/${username}`, { headers });
    const profileData = profileRes.data;

    const profile = {
      avatar_url: profileData.avatar_url,
      name: profileData.name || profileData.login,
      bio: profileData.bio || '',
      followers: profileData.followers,
      public_repos: profileData.public_repos,
      profile_url: profileData.html_url
    };

    // 2. Get user repositories (sorted by stars, max 100)
    const reposRes = await axios.get(
      `${GITHUB_API}/users/${username}/repos?per_page=100&sort=stars&order=desc`,
      { headers }
    );
    
    const allRepos = reposRes.data.map(repo => ({
      name: repo.name,
      description: repo.description || '',
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      language_color: null, // REST doesn't provide color easily
      updated_at: repo.updated_at
    }));

    const topRepositories = allRepos.slice(0, 10);

    // 3. Aggregate languages using primary language counts (fallback)
    const langCounts = {};
    allRepos.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });

    const totalReposWithLang = Object.values(langCounts).reduce((a, b) => a + b, 0);
    const languages = {};
    if (totalReposWithLang > 0) {
      Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([lang, count]) => {
          languages[lang] = parseFloat(((count / totalReposWithLang) * 100).toFixed(1));
        });
    }

    // 4. Scrape contribution heatmap from GitHub web interface
    let contributions = [];
    let totalContributions = 0;
    try {
      const contribPage = await axios.get(`https://github.com/users/${username}/contributions`, { headers });
      const html = contribPage.data;

      // Extract all contribution calendar days: data-date and data-level
      const tdRegex = /<td[^>]+data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
      let match;
      const countMap = [0, 1, 4, 8, 12]; // Approximate count mappings for level 0-4

      while ((match = tdRegex.exec(html)) !== null) {
        const date = match[1];
        const level = parseInt(match[2]);
        const count = countMap[level] || 0;
        contributions.push({ date, count });
        totalContributions += count;
      }

      // Sort contributions chronologically
      contributions.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (scrapingErr) {
      console.warn('Scraping contribution heatmap failed. Falling back to empty array.', scrapingErr.message);
      // Fallback: fill last 365 days with 0s
      for (let i = 364; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        contributions.push({
          date: date.toISOString().split('T')[0],
          count: 0
        });
      }
    }

    // Calculate streaks
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    contributions.forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });

    let streakActive = true;
    let i = contributions.length - 1;
    while (i >= 0 && streakActive) {
      const day = contributions[i];
      if (day.count > 0) {
        currentStreak++;
        i--;
      } else {
        if (i === contributions.length - 1) {
          i--;
        } else {
          streakActive = false;
        }
      }
    }

    return {
      profile,
      repositories: topRepositories,
      languages,
      contributions,
      stats: {
        total_contributions: totalContributions,
        longest_streak: longestStreak,
        current_streak: currentStreak
      }
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }
}

/**
 * Fetch public events to populate recent activities feed (REST API, authenticated if token exists)
 */
async function fetchRecentActivity(username, token) {
  try {
    const headers = { 'User-Agent': 'GitPulse-Analytics-App' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(
      `${GITHUB_API}/users/${username}/events/public?per_page=15`,
      { headers }
    );

    // Map raw events to cleaner timeline logs matching screen2.png
    return response.data.map(event => {
      let description = '';
      let detail = null;
      
      switch (event.type) {
        case 'PushEvent':
          const commitCount = event.payload.commits ? event.payload.commits.length : 1;
          const repoName = event.repo.name.split('/').pop();
          description = `Committed to ${repoName}`;
          if (event.payload.commits && event.payload.commits.length > 0) {
            detail = event.payload.commits[0].message; // Show first commit message
          }
          break;
        case 'PullRequestEvent':
          const prNumber = event.payload.number;
          const prTitle = event.payload.pull_request?.title || 'PR';
          const prRepo = event.repo.name.split('/').pop();
          const action = event.payload.action === 'closed' && event.payload.pull_request?.merged ? 'Merged' : event.payload.action;
          description = `${action.charAt(0).toUpperCase() + action.slice(1)} PR #${prNumber} in ${prRepo}`;
          detail = prTitle;
          break;
        case 'WatchEvent':
          const starRepo = event.repo.name.split('/').pop();
          description = `Starred ${event.repo.name}`;
          break;
        case 'CreateEvent':
          const createdType = event.payload.ref_type;
          const createdRepo = event.repo.name.split('/').pop();
          description = `Created ${createdType} in ${createdRepo}`;
          if (createdType === 'repository') {
            description = `Created repository ${event.repo.name}`;
          }
          break;
        default:
          description = `${event.type.replace('Event', '')} in ${event.repo.name}`;
      }

      return {
        id: event.id,
        type: event.type,
        description,
        detail,
        created_at: event.created_at
      };
    });
  } catch (error) {
    console.warn(`Could not fetch recent activity for ${username}:`, error.message);
    return [];
  }
}

/**
 * Main orchestrator: decides to use GraphQL or REST, gets activity timeline
 */
async function getUserAnalytics(username) {
  const token = process.env.GITHUB_PAT;
  let data;

  if (token && token.trim() !== '') {
    console.log(`Using Option A (GraphQL) for user: ${username}`);
    data = await fetchWithGraphQL(username, token);
  } else {
    console.log(`Using Option B (REST + Scraper) for user: ${username}`);
    data = await fetchWithRest(username);
  }

  // Fetch recent activity to populate timeline
  const activity = await fetchRecentActivity(username, token);
  
  return {
    ...data,
    activity
  };
}

module.exports = { getUserAnalytics };
