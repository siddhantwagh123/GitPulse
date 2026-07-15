# Technical Requirements Document (TRD)
## GitHub Contribution Analytics Dashboard

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Recharts)                        │
│  - Input form                                       │
│  - Charts & visualizations                          │
│  - Responsive UI                                    │
│  Deploy: Vercel                                     │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
                   ↓
┌─────────────────────────────────────────────────────┐
│  Backend (Node.js + Express)                        │
│  - GitHub API integration                           │
│  - Data aggregation & processing                    │
│  - MongoDB caching                                  │
│  - Rate limiting                                    │
│  Deploy: Render (free tier)                         │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      ↓            ↓            ↓
   GitHub API   MongoDB      Cache
   (Public)     (Free tier)   (In-memory)
```

---

## 2. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React 18 | Fast, component-based |
| **Charting** | Recharts | Easy, React-native charts |
| **Styling** | Tailwind CSS | Utility-first, responsive |
| **Backend** | Node.js + Express | JavaScript full-stack, fast |
| **Database** | MongoDB (Atlas free tier) | Flexible schema, caching |
| **API** | GitHub REST API v3 | Public, no auth required for public data |
| **Deployment** | Vercel + Render | Both free, fast, reliable |
| **Environment** | dotenv | Manage secrets safely |
| **HTTP Client** | Axios | Clean API calls |

---

## 3. GitHub API Integration

### API Endpoints Used

**1. Get User Profile**
```
GET https://api.github.com/users/{username}
Returns: avatar_url, bio, followers, public_repos, created_at, etc.
Rate Limit: 60 requests/hour (unauthenticated)
```

**2. Get User Repositories**
```
GET https://api.github.com/users/{username}/repos?per_page=100&page=1
Returns: name, stars, forks, language, updated_at, etc.
Rate Limit: 60 requests/hour
Note: Paginate if user has > 100 repos
```

**3. Get Repository Languages**
```
GET https://api.github.com/repos/{username}/{repo}/languages
Returns: { "JavaScript": 50000, "Python": 30000, ... }
Rate Limit: 60 requests/hour
Note: Bytes written in each language
```

**4. Get User Events (Contributions)**
```
GET https://api.github.com/users/{username}/events/public
Returns: Event type, created_at, repo, push events with commits
Rate Limit: 60 requests/hour
Note: Max 300 events returned, use for last ~3 months
```

### Rate Limiting Strategy
- **Don't authenticate yet** (free public tier is enough for MVP)
- **Cache responses for 1 hour** in MongoDB
- **Show rate limit status** to user ("Updated 5 mins ago")
- **If rate limited:** Return cached data + "Data from X hours ago"

---

## 4. Database Schema (MongoDB)

### Collection: `github_cache`

```javascript
{
  _id: ObjectId,
  username: "siddhantwagh123",
  
  // User profile
  profile: {
    avatar_url: "https://...",
    name: "Siddhant Wagh",
    bio: "...",
    followers: 45,
    public_repos: 11,
    profile_url: "https://github.com/siddhantwagh123",
    created_at: "2021-01-15T00:00:00Z"
  },
  
  // All repos
  repositories: [
    {
      name: "repo-name",
      stars: 25,
      forks: 3,
      issues: 1,
      language: "JavaScript",
      updated_at: "2026-06-20T00:00:00Z",
      url: "https://github.com/..."
    }
  ],
  
  // Language distribution (aggregated)
  languages: {
    "JavaScript": 150000,
    "Python": 80000,
    "React": 50000
  },
  
  // Contributions heatmap (last 12 months)
  contributions: [
    { date: "2025-06-23", count: 5 },
    { date: "2025-06-22", count: 0 },
    // ... 365 days
  ],
  
  // Commit activity by day of week
  commit_activity_by_day: {
    "Monday": 25,
    "Tuesday": 20,
    "Wednesday": 18,
    // ... etc
  },
  
  // Metadata
  last_updated: "2026-06-23T15:30:00Z",
  expires_at: "2026-06-23T16:30:00Z"  // TTL index: 1 hour
}
```

### TTL Index (auto-delete after 1 hour)
```javascript
db.github_cache.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
```

---

## 5. Backend API Endpoints

### 1. Analyze User
```
POST /api/analyze
Content-Type: application/json

Request:
{
  "username": "siddhantwagh123"
}

Response (200):
{
  "success": true,
  "data": {
    "profile": { ... },
    "repositories": [ ... ],
    "languages": { ... },
    "contributions": [ ... ],
    "commit_activity": { ... }
  },
  "cached": false,
  "rate_limit": {
    "remaining": 45,
    "reset_at": "2026-06-23T16:30:00Z"
  }
}

Error Response (404):
{
  "success": false,
  "error": "User not found or private repositories"
}

Error Response (429):
{
  "success": false,
  "error": "Rate limited. Returning cached data.",
  "data": { ... },
  "cached": true
}
```

### 2. Health Check
```
GET /api/health

Response (200):
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2026-06-23T15:30:00Z"
}
```

---

## 6. Data Processing Logic (Backend)

### Step 1: Fetch User Profile
```javascript
const userProfile = await axios.get(`https://api.github.com/users/${username}`)
```

### Step 2: Fetch All Repositories
```javascript
// Paginate through all repos
let repos = [];
for (let page = 1; page <= maxPages; page++) {
  const response = await axios.get(
    `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`
  );
  repos = repos.concat(response.data);
}
```

### Step 3: Fetch Language Distribution
```javascript
// For each repo, get languages
let languages = {};
for (const repo of repos) {
  const langResponse = await axios.get(
    `https://api.github.com/repos/${username}/${repo.name}/languages`
  );
  Object.keys(langResponse.data).forEach(lang => {
    languages[lang] = (languages[lang] || 0) + langResponse.data[lang];
  });
}
// Normalize to percentages
```

### Step 4: Fetch Events (Contributions & Commits)
```javascript
const events = await axios.get(
  `https://api.github.com/users/${username}/events/public?per_page=300`
);

// Extract contribution dates
const contributionMap = {};
events.forEach(event => {
  const date = event.created_at.split('T')[0]; // YYYY-MM-DD
  contributionMap[date] = (contributionMap[date] || 0) + 1;
});

// Fill missing dates with 0 (last 365 days)
const contributions = [];
for (let i = 364; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  contributions.push({
    date: dateStr,
    count: contributionMap[dateStr] || 0
  });
}
```

### Step 5: Extract Commit Activity by Day of Week
```javascript
// From events, count PushEvents by day of week
const activityByDay = {
  Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0,
  Friday: 0, Saturday: 0, Sunday: 0
};

events.forEach(event => {
  if (event.type === 'PushEvent') {
    const dayName = new Date(event.created_at).toLocaleDateString('en-US', { weekday: 'long' });
    activityByDay[dayName]++;
  }
});
```

### Step 6: Cache in MongoDB
```javascript
await db.collection('github_cache').updateOne(
  { username },
  { 
    $set: {
      profile,
      repositories,
      languages,
      contributions,
      commit_activity_by_day: activityByDay,
      last_updated: new Date(),
      expires_at: new Date(Date.now() + 3600000) // 1 hour
    }
  },
  { upsert: true }
);
```

---

## 7. Frontend Components Structure

```
src/
├── components/
│   ├── InputForm.jsx          // Username input + button
│   ├── ProfileCard.jsx        // User avatar, name, stats
│   ├── ContributionHeatmap.jsx // Calendar heatmap (using recharts)
│   ├── LanguagePie.jsx        // Language distribution pie chart
│   ├── RepositoryTable.jsx    // Top repos table
│   ├── CommitActivity.jsx     // Bar chart by day of week
│   ├── GrowthChart.jsx        // Line chart trend (optional)
│   ├── TabNav.jsx             // Tab navigation between sections
│   └── LoadingSpinner.jsx     // Loading state
├── pages/
│   ├── Dashboard.jsx          // Main dashboard page
│   └── Home.jsx               // Landing page
├── services/
│   └── api.js                 // Axios instance + API calls
├── hooks/
│   └── useGitHub.js           // Custom hook for API logic
├── App.jsx
└── index.css                  // Tailwind + custom styles
```

### Key Component: Input Form
```jsx
function InputForm({ onAnalyze, loading }) {
  const [username, setUsername] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onAnalyze(username);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter GitHub username (e.g., siddhantwagh123)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
}
```

### Key Component: Contribution Heatmap
```jsx
// Use a library like recharts + custom grid
// OR simple approach: CSS grid with color-coded cells
function ContributionHeatmap({ data }) {
  return (
    <div className="heatmap-grid">
      {data.map((day) => (
        <div
          key={day.date}
          className={`heatmap-cell level-${getLevel(day.count)}`}
          title={`${day.date}: ${day.count} contributions`}
        />
      ))}
    </div>
  );
}

function getLevel(count) {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}
```

---

## 8. Deployment Steps

### Frontend (Vercel)
```bash
# 1. Create Vercel account (free)
# 2. Connect GitHub repo
# 3. Set environment variables:
#    REACT_APP_API_URL=https://your-backend.onrender.com
# 4. Deploy (automatic on push to main)
```

### Backend (Render)
```bash
# 1. Create Render account (free)
# 2. Connect GitHub repo
# 3. Create Web Service:
#    - Runtime: Node
#    - Build: npm install
#    - Start: node server.js
# 4. Set environment variables:
#    - MONGO_URI=mongodb+srv://...
#    - PORT=10000
# 5. Deploy
```

### MongoDB (Atlas Free Tier)
```bash
# 1. Create Atlas account
# 2. Create free cluster (512 MB)
# 3. Whitelist all IPs (0.0.0.0/0)
# 4. Create database connection string
# 5. Add to Render environment variables
```

---

## 9. Error Handling

### Backend Error Cases
1. **Invalid username** → 404 "User not found"
2. **Rate limited** → 429 + return cached data if available
3. **GitHub API down** → 503 + return cached data
4. **Missing MongoDB connection** → 500 "Database error"
5. **Timeout (> 10 seconds)** → 504 "Request timeout"

### Frontend Error Handling
```jsx
if (error.response?.status === 404) {
  setError('User not found. Check the username and try again.');
}
if (error.response?.status === 429) {
  setError('Rate limited. Showing cached data from earlier.');
}
if (error.code === 'ECONNABORTED') {
  setError('Request timeout. Please try again.');
}
```

---

## 10. Performance Optimization

1. **Caching:** 1-hour TTL in MongoDB
2. **Pagination:** Only fetch top 100 repos (most users don't have more)
3. **Debouncing:** Debounce search input (300ms)
4. **Lazy Loading:** Load charts only when section is visible
5. **Image Optimization:** Compress profile avatars
6. **API Response Compression:** gzip on backend

---

## 11. Testing Checklist

- [ ] Input "siddhantwagh123" → Dashboard loads correctly
- [ ] All charts render without console errors
- [ ] Mobile view is readable (test on phone)
- [ ] Empty state (0 repos) handles gracefully
- [ ] Rate limit scenario shows cached data
- [ ] Invalid username shows error message
- [ ] Loading spinner shows while fetching
- [ ] "Updated X mins ago" shows correctly

---

## 12. Future Enhancements (Phase 2)

1. User authentication (OAuth with GitHub)
2. Compare two users side-by-side
3. Export dashboard as image/PDF
4. Email reports
5. Advanced filters (date range, language)
6. Dark mode
7. Organization analytics
8. Detailed commit history

---

## 13. Dev Environment Setup (Quick Start)

### Backend
```bash
# 1. Clone repo
git clone <repo>
cd github-analytics-backend

# 2. Install dependencies
npm install

# 3. Create .env file
echo "MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/github_analytics?retryWrites=true&w=majority" > .env
echo "PORT=5000" >> .env

# 4. Run locally
npm run dev

# 5. Test: curl http://localhost:5000/api/health
```

### Frontend
```bash
# 1. Create React app
npx create-react-app github-analytics-frontend
cd github-analytics-frontend

# 2. Install dependencies
npm install recharts axios tailwindcss

# 3. Create .env
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# 4. Run
npm start

# 5. Open http://localhost:3000
```

---

## 14. File Size / Load Time Targets

- **Frontend bundle:** < 200 KB (gzipped)
- **API response:** < 50 KB
- **First Contentful Paint:** < 2 seconds
- **Time to Interactive:** < 3 seconds

---

## 15. Security Considerations

- **No sensitive data:** GitHub API doesn't require authentication for public data
- **CORS:** Enable on backend for Vercel domain only
- **Rate limiting:** Implement per-IP rate limiting on backend
- **Input validation:** Sanitize username input (alphanumeric, dash, underscore only)
- **HTTPS only:** Enforced by default on Vercel + Render

---

## Summary: Implementation Priority

**Must Have (MVP):**
- [ ] User lookup endpoint
- [ ] Repository fetching + language aggregation
- [ ] Contribution heatmap
- [ ] Language pie chart
- [ ] Repository table
- [ ] Commit activity bar chart
- [ ] Responsive frontend
- [ ] Deployment to Vercel + Render

**Nice to Have (Phase 2):**
- [ ] Growth chart
- [ ] Download as image
- [ ] Dark mode
- [ ] User comparison

---

**Estimated Development Time: 5-7 days**
