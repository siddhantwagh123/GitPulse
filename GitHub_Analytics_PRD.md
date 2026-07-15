# Product Requirements Document (PRD)
## GitHub Contribution Analytics Dashboard

---

## 1. Overview

**Product Name:** GitHub Analytics Dashboard

**One-liner:** Visualize your GitHub profile insights in real-time — contributions, language distribution, repository trends, and coding patterns.

**Target User:** Developers (students, freshers, professionals) who want to track and showcase their coding activity and skill distribution.

**Problem Statement:** GitHub shows a heatmap and basic stats, but there's no clean, comprehensive analytics dashboard that visualizes:
- Detailed contribution trends over time
- Language skill distribution
- Repository performance (stars, forks, issues)
- Personal coding patterns (busiest times/days)
- Growth trajectory

---

## 2. Goals & Success Metrics

### Product Goals
1. Users can input a GitHub username and instantly see their analytics
2. Analytics are visualized in an intuitive, shareable dashboard
3. Users can download/share their insights (optional: as image)
4. Dashboard is mobile-responsive and fast

### Success Metrics
- Page load time: < 3 seconds
- API response time: < 2 seconds (after caching)
- Mobile usability: 90%+ readable on mobile
- Can handle 100+ repositories without lag

---

## 3. Core Features (MVP)

### Feature 1: User Lookup
- **Input:** GitHub username (text field)
- **Validation:** Check if username exists via GitHub API
- **Output:** Profile picture, bio, follower count, profile link
- **Error Handling:** "User not found" or "Rate limit hit" messages

### Feature 2: Contribution Heatmap
- **Display:** Yearly contribution calendar (like GitHub's heatmap)
- **Data:** Last 12 months of contributions per day
- **Visualization:** Color-coded grid (green = more contributions, gray = zero)
- **Interaction:** Hover to show exact count for each day

### Feature 3: Language Distribution
- **Display:** Pie/Donut chart of programming languages across all repos
- **Calculation:** Sum of bytes written in each language from all user repos
- **Top 5:** Show top 5 languages with percentage
- **Visual:** Color-coded, interactive chart (Recharts)

### Feature 4: Repository Stats
- **Display:** Table/list of user's top 10 repositories
- **Columns:** Repo name, Stars, Forks, Issues, Language, Last update
- **Sorting:** By stars, forks, or last updated (user-selectable)
- **Links:** Each repo links to GitHub

### Feature 5: Commit Activity Patterns
- **Display:** Bar chart of commits by day of week (Mon-Sun)
- **Insight:** "Most active on Fridays" type statement
- **Data:** Last 3 months of commit history
- **Visual:** Simple bar chart (Recharts)

### Feature 6: Growth Trajectory (Optional for MVP)
- **Display:** Line chart of total contributions over last 6 months
- **Insight:** Show upward/downward trend
- **Visual:** Simple trend line (Recharts)

---

## 4. User Flow

```
User lands on page
    ↓
Enters GitHub username (e.g., "siddhantwagh123")
    ↓
Clicks "Analyze" button
    ↓
Backend fetches data from GitHub API
    ↓
Data is cached in MongoDB (optional)
    ↓
Frontend receives data and renders dashboard
    ↓
User sees: Heatmap, Languages, Repos, Commit patterns
    ↓
User can: 
  - View different data sections (tabs)
  - Download dashboard as image (optional)
  - Share link to dashboard (optional)
```

---

## 5. UI Layout (Text Wireframe)

```
┌─────────────────────────────────────────────────────┐
│  GitHub Analytics Dashboard                  [Logo] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Enter GitHub Username: [ siddhantwagh123 ] [Analyze] │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────┐            │
│  │ Profile                             │            │
│  │ [Avatar] Siddhant Wagh              │            │
│  │ Followers: 45 | Repos: 11           │            │
│  └─────────────────────────────────────┘            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Contributions] [Languages] [Repos] [Patterns]     │
│                                                     │
│  ┌─────────────────────────────────────┐            │
│  │         Contribution Heatmap        │            │
│  │  Jan Feb Mar Apr May Jun ...        │            │
│  │  ███ ███ ███ ███ ███ ███ ...       │            │
│  └─────────────────────────────────────┘            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Languages          │  Top Repositories            │
│  ┌──────────────┐   │  ┌──────────────────────┐   │
│  │ JavaScript:  │   │  │ Repo Name | ⭐ 25    │   │
│  │   40% ████   │   │  │ Repo Name | ⭐ 12    │   │
│  │ React: 30%   │   │  │ Repo Name | ⭐ 8     │   │
│  │ Python: 20%  │   │  │ Repo Name | ⭐ 5     │   │
│  │ CSS: 10%     │   │  └──────────────────────┘   │
│  └──────────────┘   │                             │
│                     │                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Commit Activity (Last 3 months)                    │
│  Mon Tue Wed Thu Fri Sat Sun                        │
│   15  12  18  25  30  8   5                         │
│   ▁   ▃   ▄   ▅   ██   ▂   ▁                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. Non-Functional Requirements

- **Performance:** Dashboard loads and renders in < 3 seconds
- **Scalability:** Can handle 1000+ concurrent users (within Render free tier limits)
- **Reliability:** 99.5% uptime
- **Responsiveness:** Mobile-first design, works on phones, tablets, desktops
- **Accessibility:** Basic accessibility (alt text, color contrast)
- **Caching:** Cache GitHub API responses for 1 hour to avoid rate limits

---

## 7. Out of Scope (Phase 2)

- User authentication / login
- Comparing two users side-by-side
- Exporting as PDF
- Email reports
- Detailed commit message analysis
- Organization analytics
- Advanced filtering (by date range, language, repo type)

---

## 8. Success Criteria for MVP

✅ User can enter GitHub username and see dashboard  
✅ All 5 core features render correctly  
✅ Mobile responsive  
✅ No console errors  
✅ Can demo in 30 seconds ("Enter username → See dashboard")  
✅ Deployed on Vercel + Render, publicly accessible  

---

## 9. Timeline

- **Day 1-2:** Backend setup + GitHub API integration
- **Day 3:** Database + caching logic
- **Day 4-5:** Frontend + charts
- **Day 6:** Mobile responsiveness + bug fixes
- **Day 7:** Deployment + testing

**Total: 5-7 days**
