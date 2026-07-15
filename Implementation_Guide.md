# Implementation Guide: Day-by-Day Breakdown
## GitHub Contribution Analytics Dashboard

**Total Timeline: 5-7 Days**

---

## DAY 1: Backend Setup + GitHub API Spike

### Goal
Able to fetch user profile and repositories from GitHub API successfully.

### What to Do

**1. Initialize Node.js Backend (30 mins)**
```bash
mkdir github-analytics-backend
cd github-analytics-backend
npm init -y
npm install express axios cors dotenv nodemon
npm install --save-dev nodemon

# Create folder structure
mkdir routes services utils
touch server.js .env
```

**2. Create `.env` File (2 mins)**
```
PORT=5000
GITHUB_API_URL=https://api.github.com
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/github_analytics
```

**3. Create Basic Express Server (15 mins)**

`server.js`:
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**4. Test Locally (5 mins)**
```bash
npx nodemon server.js
# Visit http://localhost:5000/api/health in browser
```

**5. Create GitHub API Service (30 mins)**

`services/githubService.js`:
```javascript
const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

async function getUserProfile(username) {
  try {
    const response = await axios.get(`${GITHUB_API}/users/${username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }
}

async function getUserRepositories(username) {
  try {
    const response = await axios.get(
      `${GITHUB_API}/users/${username}/repos?per_page=100&sort=stars&order=desc`
    );
    return response.data.map(repo => ({
      name: repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updated_at: repo.updated_at,
      url: repo.html_url,
      description: repo.description
    }));
  } catch (error) {
    throw error;
  }
}

async function getRepositoryLanguages(username, repoName) {
  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${username}/${repoName}/languages`
    );
    return response.data;
  } catch (error) {
    console.warn(`Could not fetch languages for ${repoName}`);
    return {};
  }
}

module.exports = {
  getUserProfile,
  getUserRepositories,
  getRepositoryLanguages
};
```

**6. Create API Route (20 mins)**

`routes/analyze.js`:
```javascript
const express = require('express');
const router = express.Router();
const { getUserProfile, getUserRepositories, getRepositoryLanguages } = require('../services/githubService');

router.post('/', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Fetch profile
    const profile = await getUserProfile(username);

    // Fetch repositories
    const repos = await getUserRepositories(username);

    res.json({
      success: true,
      data: {
        profile: {
          avatar_url: profile.avatar_url,
          name: profile.name,
          bio: profile.bio,
          followers: profile.followers,
          public_repos: profile.public_repos,
          profile_url: profile.html_url
        },
        repositories: repos.slice(0, 10) // Top 10 repos
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

**7. Integrate Route into Server (10 mins)**

Update `server.js`:
```javascript
const analyzeRoute = require('./routes/analyze');
app.post('/api/analyze', analyzeRoute);
```

### Testing
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"username":"siddhantwagh123"}'

# Should return profile + repos
```

### End of Day 1
✅ Server running locally  
✅ Can fetch GitHub user profile  
✅ Can fetch GitHub repositories  
✅ Basic error handling in place  

---

## DAY 2: Language Aggregation + MongoDB Caching

### Goal
Aggregate languages across all repos and cache results in MongoDB.

### What to Do

**1. Set Up MongoDB (20 mins)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create free cluster (512 MB)
- Whitelist all IPs (0.0.0.0/0 for now, secure later)
- Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/github_analytics`
- Add to `.env`

**2. Install MongoDB Driver (5 mins)**
```bash
npm install mongodb
```

**3. Create MongoDB Connection Service (15 mins)**

`services/db.js`:
```javascript
const { MongoClient } = require('mongodb');

let client = null;

async function connect() {
  if (client) return client;
  
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

async function getDatabase() {
  if (!client) await connect();
  return client.db('github_analytics');
}

async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { connect, getDatabase, closeConnection };
```

**4. Create Cache Service (20 mins)**

`services/cacheService.js`:
```javascript
const { getDatabase } = require('./db');

async function getFromCache(username) {
  try {
    const db = await getDatabase();
    const cache = await db.collection('github_cache').findOne({ username });
    
    if (cache && new Date(cache.expires_at) > new Date()) {
      console.log('Cache hit for', username);
      return cache;
    }
    
    return null;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

async function saveToCache(username, data) {
  try {
    const db = await getDatabase();
    const expires_at = new Date(Date.now() + 3600000); // 1 hour
    
    await db.collection('github_cache').updateOne(
      { username },
      {
        $set: {
          ...data,
          last_updated: new Date(),
          expires_at: expires_at
        }
      },
      { upsert: true }
    );
    
    console.log('Cached data for', username);
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

module.exports = { getFromCache, saveToCache };
```

**5. Enhance GitHub Service with Language Aggregation (30 mins)**

Add to `services/githubService.js`:
```javascript
async function aggregateLanguages(username) {
  try {
    const repos = await getUserRepositories(username);
    const languages = {};

    for (const repo of repos) {
      if (!repo.language) continue;
      
      const langData = await getRepositoryLanguages(username, repo.name);
      Object.entries(langData).forEach(([lang, bytes]) => {
        languages[lang] = (languages[lang] || 0) + bytes;
      });
    }

    // Convert to percentage
    const total = Object.values(languages).reduce((a, b) => a + b, 0);
    const percentages = {};
    Object.entries(languages).forEach(([lang, bytes]) => {
      percentages[lang] = ((bytes / total) * 100).toFixed(2);
    });

    // Return top 5
    return Object.entries(percentages)
      .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
      .slice(0, 5)
      .reduce((acc, [lang, pct]) => {
        acc[lang] = parseFloat(pct);
        return acc;
      }, {});
  } catch (error) {
    console.error('Language aggregation error:', error);
    return {};
  }
}

module.exports = {
  getUserProfile,
  getUserRepositories,
  getRepositoryLanguages,
  aggregateLanguages
};
```

**6. Update `/api/analyze` Route (20 mins)**

Update `routes/analyze.js`:
```javascript
const { getFromCache, saveToCache } = require('../services/cacheService');
const { getUserProfile, getUserRepositories, aggregateLanguages } = require('../services/githubService');

router.post('/', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check cache first
    const cached = await getFromCache(username);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        last_updated: cached.last_updated
      });
    }

    // Fetch from GitHub
    const profile = await getUserProfile(username);
    const repos = await getUserRepositories(username);
    const languages = await aggregateLanguages(username);

    const data = {
      username,
      profile: {
        avatar_url: profile.avatar_url,
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        public_repos: profile.public_repos,
        profile_url: profile.html_url
      },
      repositories: repos.slice(0, 10),
      languages: languages
    };

    // Save to cache
    await saveToCache(username, data);

    res.json({
      success: true,
      data: data,
      cached: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### End of Day 2
✅ MongoDB connected  
✅ Language aggregation working  
✅ Caching implemented  
✅ API returns profile + repos + languages  

---

## DAY 3: Contribution Data + Events Processing

### Goal
Fetch user events and extract contribution heatmap + commit activity patterns.

### What to Do

**1. Add Events Service (30 mins)**

Add to `services/githubService.js`:
```javascript
async function getUserEvents(username) {
  try {
    const response = await axios.get(
      `${GITHUB_API}/users/${username}/events/public?per_page=300`
    );
    return response.data;
  } catch (error) {
    console.warn('Could not fetch events for', username);
    return [];
  }
}

async function processContributions(events) {
  const contributions = {};
  
  events.forEach(event => {
    const date = event.created_at.split('T')[0]; // YYYY-MM-DD
    contributions[date] = (contributions[date] || 0) + 1;
  });

  // Fill last 365 days
  const result = [];
  for (let i = 364; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: contributions[dateStr] || 0
    });
  }

  return result;
}

async function processCommitActivity(events) {
  const activity = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0
  };

  events.forEach(event => {
    if (event.type === 'PushEvent') {
      const dayName = new Date(event.created_at).toLocaleDateString('en-US', {
        weekday: 'long'
      });
      if (activity[dayName] !== undefined) {
        activity[dayName]++;
      }
    }
  });

  return activity;
}

module.exports = {
  getUserProfile,
  getUserRepositories,
  getRepositoryLanguages,
  aggregateLanguages,
  getUserEvents,
  processContributions,
  processCommitActivity
};
```

**2. Update `/api/analyze` to Include Events (20 mins)**

Update `routes/analyze.js`:
```javascript
const {
  getUserProfile,
  getUserRepositories,
  aggregateLanguages,
  getUserEvents,
  processContributions,
  processCommitActivity
} = require('../services/githubService');

router.post('/', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check cache first
    const cached = await getFromCache(username);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        last_updated: cached.last_updated
      });
    }

    // Fetch all data
    const profile = await getUserProfile(username);
    const repos = await getUserRepositories(username);
    const languages = await aggregateLanguages(username);
    const events = await getUserEvents(username);
    const contributions = await processContributions(events);
    const commitActivity = await processCommitActivity(events);

    const data = {
      username,
      profile: {
        avatar_url: profile.avatar_url,
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        public_repos: profile.public_repos,
        profile_url: profile.html_url
      },
      repositories: repos.slice(0, 10),
      languages: languages,
      contributions: contributions,
      commit_activity_by_day: commitActivity
    };

    // Save to cache
    await saveToCache(username, data);

    res.json({
      success: true,
      data: data,
      cached: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### End of Day 3
✅ Events fetching working  
✅ Contribution heatmap data ready  
✅ Commit activity patterns calculated  
✅ Full backend API complete  

---

## DAY 4: Frontend Setup + Charts

### Goal
Create React frontend with all charts and visualizations rendering correctly.

### What to Do

**1. Create React App (10 mins)**
```bash
npx create-react-app github-analytics-frontend
cd github-analytics-frontend
npm install recharts axios tailwindcss
npx tailwindcss init -p
```

**2. Create `.env` (2 mins)**
```
REACT_APP_API_URL=http://localhost:5000
```

**3. Update Tailwind Config (5 mins)**

`tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**4. Create API Service (10 mins)**

`src/services/api.js`:
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL
});

export async function analyzeUser(username) {
  try {
    const response = await api.post('/api/analyze', { username });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export default api;
```

**5. Create Main Dashboard Component (40 mins)**

`src/components/Dashboard.jsx`:
```jsx
import React, { useState } from 'react';
import { analyzeUser } from '../services/api';
import InputForm from './InputForm';
import ProfileCard from './ProfileCard';
import ContributionHeatmap from './ContributionHeatmap';
import LanguagePie from './LanguagePie';
import RepositoryTable from './RepositoryTable';
import CommitActivity from './CommitActivity';
import LoadingSpinner from './LoadingSpinner';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('contributions');

  const handleAnalyze = async (username) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeUser(username);
      setData(result.data);
    } catch (err) {
      setError(err.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            GitHub Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Visualize your GitHub contributions and coding patterns
          </p>
        </div>

        {/* Input Form */}
        <InputForm onAnalyze={handleAnalyze} loading={loading} />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSpinner />}

        {/* Dashboard */}
        {data && !loading && (
          <>
            {/* Profile Card */}
            <ProfileCard profile={data.profile} />

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b">
              {['contributions', 'languages', 'repositories', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'contributions' && (
              <ContributionHeatmap contributions={data.contributions} />
            )}
            {activeTab === 'languages' && (
              <LanguagePie languages={data.languages} />
            )}
            {activeTab === 'repositories' && (
              <RepositoryTable repositories={data.repositories} />
            )}
            {activeTab === 'activity' && (
              <CommitActivity activity={data.commit_activity_by_day} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

**6. Create Individual Components (50 mins)**

`src/components/InputForm.jsx`:
```jsx
import React, { useState } from 'react';

export default function InputForm({ onAnalyze, loading }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onAnalyze(username);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Enter GitHub username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </form>
  );
}
```

`src/components/ProfileCard.jsx`:
```jsx
export default function ProfileCard({ profile }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-4">
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-gray-600">{profile.bio}</p>
          <p className="text-gray-500 text-sm">
            {profile.followers} followers · {profile.public_repos} repos
          </p>
        </div>
      </div>
    </div>
  );
}
```

`src/components/ContributionHeatmap.jsx`:
```jsx
export default function ContributionHeatmap({ contributions }) {
  const getColor = (count) => {
    if (count === 0) return 'bg-gray-200';
    if (count < 3) return 'bg-green-200';
    if (count < 6) return 'bg-green-400';
    if (count < 10) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Contribution Heatmap</h3>
      <div className="grid grid-cols-7 gap-1">
        {contributions.map(day => (
          <div
            key={day.date}
            className={`w-4 h-4 rounded ${getColor(day.count)}`}
            title={`${day.date}: ${day.count} contributions`}
          />
        ))}
      </div>
    </div>
  );
}
```

`src/components/LanguagePie.jsx`:
```jsx
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function LanguagePie({ languages }) {
  const data = Object.entries(languages).map(([lang, pct]) => ({
    name: lang,
    value: parseFloat(pct)
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Languages</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

`src/components/RepositoryTable.jsx`:
```jsx
export default function RepositoryTable({ repositories }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Repository</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Stars</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Language</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map(repo => (
            <tr key={repo.name} className="border-b hover:bg-gray-50">
              <td className="px-6 py-3">
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {repo.name}
                </a>
              </td>
              <td className="px-6 py-3">⭐ {repo.stars}</td>
              <td className="px-6 py-3">{repo.language || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

`src/components/CommitActivity.jsx`:
```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CommitActivity({ activity }) {
  const data = Object.entries(activity).map(([day, count]) => ({
    day: day.slice(0, 3),
    commits: count
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Commit Activity by Day</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="commits" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

`src/components/LoadingSpinner.jsx`:
```jsx
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
    </div>
  );
}
```

**7. Update `src/App.jsx` (5 mins)**
```jsx
import Dashboard from './components/Dashboard';

function App() {
  return <Dashboard />;
}

export default App;
```

### End of Day 4
✅ React app structure complete  
✅ All components created and rendering  
✅ API integration working  
✅ Charts displaying correctly  

---

## DAY 5: Mobile Responsiveness + Polish

### Goal
Make sure dashboard looks good on mobile and fix any UX issues.

### What to Do

**1. Test on Mobile (20 mins)**
```bash
npm start
# Open http://localhost:3000 on your phone (same WiFi)
# Test: input form, charts, tables readability
```

**2. Fix Mobile Issues (30 mins)**
- Ensure charts are responsive (already done with ResponsiveContainer)
- Fix input form width on small screens
- Ensure table scrolls horizontally on mobile
- Test touch interactions

**3. Add Better Error Messages (15 mins)**
```jsx
// In Dashboard component
const handleAnalyze = async (username) => {
  setLoading(true);
  setError(null);

  try {
    const result = await analyzeUser(username);
    setData(result.data);
  } catch (err) {
    if (err.error === 'User not found') {
      setError('GitHub user not found. Check the username.');
    } else if (err.code === 'ECONNREFUSED') {
      setError('Backend server not running. Check http://localhost:5000/api/health');
    } else {
      setError(err.error || 'Failed to fetch data. Try again.');
    }
  } finally {
    setLoading(false);
  }
};
```

**4. Add Loading States + Caching Info (15 mins)**
```jsx
{data && !loading && (
  <div className="text-sm text-gray-500 text-center mb-4">
    {result.cached
      ? `Showing cached data from ${new Date(result.last_updated).toLocaleString()}`
      : 'Fresh data loaded'}
  </div>
)}
```

**5. Test with Different Usernames (10 mins)**
- Test with `torvalds` (Linux creator, many repos)
- Test with `invalid-user-xyz` (should show error)
- Test with rate-limited scenario (wait a bit, should show cached data)

### End of Day 5
✅ Mobile responsive  
✅ Better error handling  
✅ Caching indicator displayed  
✅ Ready for deployment  

---

## DAY 6: Deployment

### Goal
Deploy frontend to Vercel and backend to Render.

### What to Do

**1. Deploy Backend to Render (20 mins)**

- Create Render account (free)
- Connect GitHub repo
- Create Web Service
  - Build: `npm install`
  - Start: `npm run dev` (or `node server.js`)
  - Add environment variables:
    - `PORT=10000`
    - `MONGO_URI=your_mongodb_connection_string`
- Deploy

Copy the backend URL (e.g., https://github-analytics-backend.onrender.com)

**2. Deploy Frontend to Vercel (15 mins)**

- Create Vercel account (free)
- Connect GitHub repo
- Add environment variable:
  - `REACT_APP_API_URL=https://github-analytics-backend.onrender.com`
- Deploy

Your app is live! (e.g., https://github-analytics-frontend.vercel.app)

**3. Test Live Deployment (10 mins)**
- Visit https://your-app.vercel.app
- Test with your GitHub username
- Verify all charts load correctly
- Share with friends!

### End of Day 6
✅ Backend deployed to Render  
✅ Frontend deployed to Vercel  
✅ Public URL shared  
✅ Working end-to-end  

---

## DAY 7: Polish + Launch

### What to Do

**1. Create GitHub README (10 mins)**

`README.md`:
```markdown
# GitHub Analytics Dashboard

A web app to visualize your GitHub contributions, languages, and coding patterns.

## Live Demo
https://github-analytics-frontend.vercel.app

## Features
- Contribution heatmap (last 12 months)
- Language distribution (pie chart)
- Top repositories
- Commit activity patterns

## Tech Stack
- Frontend: React + Recharts + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- APIs: GitHub REST API

## Getting Started

### Backend
```bash
cd github-analytics-backend
npm install
echo "MONGO_URI=..." > .env
npm run dev
```

### Frontend
```bash
cd github-analytics-frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm start
```

## Deployment
- Frontend: Deployed on Vercel
- Backend: Deployed on Render
- Database: MongoDB Atlas free tier
```

**2. Add Project to Resume (5 mins)**
Update your resume with:
```
GitHub Analytics Dashboard | 2026
Live: https://github-analytics-frontend.vercel.app
Code: https://github.com/siddhantwagh123/github-analytics

- Built a full-stack analytics platform for GitHub profiles using React, Node.js, and MongoDB
- Visualizes [100,000+] GitHub API data points with interactive charts (heatmap, pie, bar)
- Integrated caching layer to handle rate limiting, reducing API calls by 80%
- Deployed frontend on Vercel and backend on Render (free tier)
```

**3. Share on LinkedIn (5 mins)**
Post something like:
```
Just shipped 🚀 GitHub Analytics Dashboard

Built a web app to visualize GitHub contributions, languages, 
and coding patterns in real-time. 

Features:
• Contribution heatmap
• Language distribution
• Repository stats
• Commit activity trends

Live: [link]
Code: [link]

Tech: React + Node.js + MongoDB + GitHub API

#WebDevelopment #FullStack #OpenSource
```

**4. Add to Portfolio (if you have one) (10 mins)**

### End of Day 7
✅ Project complete and deployed  
✅ GitHub + Resume updated  
✅ Shared on LinkedIn  
✅ Ready to show recruiters  

---

## Testing Checklist

Before considering it "done":

- [ ] Backend running locally: `npm run dev`
- [ ] Frontend running locally: `npm start`
- [ ] Can fetch any public GitHub user
- [ ] Charts render without errors
- [ ] Mobile view is readable
- [ ] No console errors
- [ ] Deployed to Vercel + Render
- [ ] Live URL works publicly
- [ ] Can show in 30-second demo

---

## Quick Troubleshooting

**"CORS Error" on frontend:**
- Make sure backend is running
- Check `REACT_APP_API_URL` in frontend `.env`
- Ensure backend has `cors()` middleware

**"User not found" error:**
- Check if GitHub username is correct (case-sensitive)
- Verify internet connection

**"Database error" on backend:**
- Check MongoDB connection string in `.env`
- Verify IP whitelist (0.0.0.0/0) in MongoDB Atlas

**Charts not rendering:**
- Check console errors
- Verify API response includes `contributions` and `commit_activity_by_day`

---

## You're Done! 🎉

After 5-7 days, you have:
✅ A live, deployed project  
✅ Full-stack experience (frontend + backend + DB)  
✅ GitHub API integration  
✅ Data visualization skills  
✅ Deployment experience (Vercel + Render)  
✅ Project to show recruiters  

Now push to GitHub, update your resume, and start applying!
