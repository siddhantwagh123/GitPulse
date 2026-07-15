# Walkthrough - Storytelling Analytics & Layout Corrections

I have fully implemented the visual storytelling components, corrected the PDF layouts, heatmap colors, Recharts clipping, theme adaptation, metric labels, interactive language legend highlights, credits footers with LinkedIn integration, URL footer suppression, print header emulation, multi-page layout overlap spacing, sharing links, and **backend/frontend search rate-limiting controls**.

---

## Rate Limiting & Cooldown Session Features

### 1. Backend Custom Sliding-Window Rate Limiter
- **Middleware File**: [rateLimiter.js](file:///e:/Github%20analyzer/gitpulse-backend/services/rateLimiter.js)
- **Details**: Built an in-memory, IP-bound rate limiting middleware that enforces:
  - **Quota limit**: Maximum **5 searches per minute** per client IP.
  - **Attempts Tracking headers**: Sets `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` in all HTTP headers.
  - **No-consume GET route**: Added a GET route `/api/analyze/limit-status` which reports remaining attempts and reset times to the client *without* consuming an active attempt.
  - **POST rate limiting protection**: Restricts queries to the POST `/api/analyze` profile scrape endpoint. Returns `HTTP 429 Too Many Requests` when exhausted, carrying the reset time in the JSON payload.

### 2. Header Remaining Attempts Counter
- **Components**: [Header.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/components/Header.jsx) & [App.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/App.jsx)
- **Details**: Displays a premium searches remaining tracker badge in the top-right corner of the header, directly next to the theme switcher:
  - **Visual Indicator**: Styled in theme-matching blue (`Searches Left: X` with a pulsing blue signal dot).
  - **Dynamic alert**: Automatically transforms to warning rose pink with a pulsing red dot when searches reach `0` to signal lock-out status.
  - **Syncs instantly**: Updates attempts counter instantly from backend response headers on page load, profile search completions, and errors.

### 3. Client Cooldown Countdown Banner
- **Components**: [Landing.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Landing.jsx) & [App.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/App.jsx)
- **Details**: Protects backend APIs and guides user behavior when attempts are exhausted:
  - **Disables input**: The username search input box and submit button are completely disabled when attempts reach `0`, preventing repetitive button spamming.
  - **Pulsing Cooldown Banner**: Displays an animated warning banner underneath the search box: `Search limit reached. Please wait for cooldown. Reset in Xs` (where `Xs` is a live countdown timer updating every second).
  - **Auto-refreshes**: Once the countdown timer reaches `0`, the frontend automatically triggers a quiet status sync with the backend to restore attempts to `5/5` and unlocks the search fields instantly.

---

## Visual Storytelling Features

### 1. Visualized Developer Story & Badges (Infographic Grid)
- **Component**: [Dashboard.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Dashboard.jsx)
- **Details**: The storytelling engine (`getStoryBadges`) dynamically parses data to display **6 visual infographic cards** matching the Acts of the guide. Each card features its own **custom colored icon**, **conversational simplified description**, **category tag** (`STACK`, `VELOCITY`, `SCHEDULE`, `REACH`, `STATUS`, `VOLUME`), and a **dedicated sub-visualization**:
  - **Stack Focus (Act 3)**: A horizontal progress bar representing the exact codebase coverage of their primary language.
  - **Streak / Output (Act 2)**: A horizontal orange progress bar tracking active streak progress relative to a 30-day target.
  - **Weekday vs. Weekend Split (Act 4)**: A dual-colored progress bar (Blue for weekdays, Purple for weekends) showing their coding schedule percentage balance.
  - **Community Trust (Act 5)**: A visual **5-star feedback rating row** corresponding to stars and followers.
  - **Momentum Check (Act 6)**: A pulsing radar signal dot (green for active, amber for semi-active, grey for dormant) representing live presence.
  - **Project Count Strength (Act 1 & 6)**: A progress bar mapping repository counts relative to a 30-project capacity indicator.
- **UI Design**: Rendered in a card titled **DEVELOPER STORY & ACHIEVEMENTS** in a responsive 3x2 grid. Employs soft theme-colored background gradients (`from-blue-50/40`, `from-orange-50/40`, etc.), bordered category tags, and zoom hover transitions.

### 2. Day of the Week Coder Habits Chart (Act 4)
- **Component**: [Dashboard.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Dashboard.jsx)
- **Details**: Built an aggregator (`getDayOfWeekAggregation`) that maps the 365 daily contributions logs to their corresponding days of the week (Sunday - Saturday).
- **UI Render**: Displayed as a clean Recharts `<BarChart>` inside a card titled **Weekly Coding Patterns**. Sunday and Saturday bars are styled in **Purple** (`#8b5cf6`) to denote weekend hobby code, while weekdays are in **Blue** (`#3b82f6`) to represent professional routine commits.

### 3. Dynamic Activity Status Badge
- **Component**: [Dashboard.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Dashboard.jsx)
- **Details**: Computes the elapsed time since the user's last public GitHub activity event.
- **UI Render**: Displays a dynamic status indicator pill under their avatar:
  - `🟢 Active` (last coded within 2 days)
  - `🟡 Semi-active` (last coded within 7 days)
  - `🔴 Dormant` (last event was over 7 days ago)

### 4. Interactive Language Donut Spotlight Focus
- **Component**: [Dashboard.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Dashboard.jsx)
- **Details**: Added interactive hover hooks between the Languages donut chart and its sidebar legends list.
  - **Legend Highlight**: Hovering over a language item in the list highlights the text, enlarges it (`scale-[1.02]`), and styles it blue (`text-blue-600 dark:text-blue-400`).
  - **Spotlight Dimming**: Hovering over a slice or list item automatically dims all other pie segments down to `0.4` opacity, spotlighting the target language slice at `1.0` opacity.
  - **Dynamic Center Label**: The donut chart's central text overlay dynamically updates to display the hovered language's exact percentage ratio (e.g. `45.8%`), reverting back to the total composition value on mouse leave.

---

## Layout & Link Corrections

### 1. Corrected Share Profile Links
- **Details**: Fixed a bug where clicking the "Copy Link" button copied the display name (e.g. `?user=Siddhant Wagh`) which caused API load crashes. Now, it correctly extracts and copies the user's unique GitHub **username handle** (e.g. `?user=siddhantwagh123`), which loads profiles immediately.

### 2. PDF Print Layout Formatting (`@media print`)
- **Details**: Added comprehensive styles to [index.css](file:///e:/Github%20analyzer/gitpulse-frontend/src/index.css) to optimize prints and print-to-pdf:
  - **A4 Portrait Alignment**: Sets standard page geometry to prevent content from cutting off.
  - **Avoid Vertical Splits**: Adds `page-break-inside: avoid` to all cards so sections don't break in half across page edges.
  - **Hides Interactive Controls**: Added the `no-print` class in [Dashboard.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Dashboard.jsx) to hide search headers, navigation tabs, follow button containers, and bottom action footers.
  - **Scales wide elements**: Scales the 53-week heatmap calendar grid (`transform: scale(0.85)`) to cleanly fit A4 sheet widths.
  - **Preserves Column Grids**: Keeps CSS Grid layout active (`display: grid !important; gap: 16px !important;`) so elements layout side-by-side, preventing card stretching.

### 3. Theme-Aware Printing & Readability
- **Details**: Fixed a bug where exporting as a PDF while the app was in Dark Mode forced all card text to render in near-black color, rendering text invisible against the dark navy card backgrounds.
- **Solution**: Split print rules in [index.css](file:///e:/Github%20analyzer/gitpulse-frontend/src/index.css) using `html.dark` modifiers and deleted the universal dark text override (`h1, h2, h3, h4, p, span, div { color: #0f172a !important }`).
  - **Light Mode Print**: Background color is forced to clean white and text colors inherit standard dark slate.
  - **Dark Mode Print**: Background color is forced to dark slate (`#0f172a`) and text colors inherit light grays (`#f8fafc`) natively, rendering dark-mode exports with perfect readability.

### 4. Print Heatmap Color Visibility
- **Details**: Fixed a bug where contribution calendar boxes printed as blank white slots when browser background graphic printing was turned off.
- **Solution**: Implemented a CSS printing hack utilizing **inset box shadows** (`box-shadow: inset 0 0 0 10px #color !important`) on the heatmap cell levels. Inset box shadows are treated as graphics, forcing the browser to print the green intensity colors 100% of the time, regardless of printer background settings.

### 5. Corrected Recharts Sizing in Print
- **Details**: Fixed a bug where the `Saturday` column was dropped from the weekly coding habits chart. During print triggers, Recharts' `<ResponsiveContainer>` fails to capture window widths and defaults to a narrow aspect ratio, clipping the rightmost column.
- **Solution**: Added chart wrapper classes (`.weekly-chart-container`, `.sparkline-container`, `.pie-chart-container`) in [Dashboard.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Dashboard.jsx) and styled them with print-specific fixed widths in [index.css](file:///e:/Github%20analyzer/gitpulse-frontend/src/index.css) to guarantee all columns (including Saturday) render in the PDF.

### 6. Substituted Growth Percentage with Label
- **Details**: Removed the fake `↑ +12% from last year` growth metric badge and replaced it with a simple, honest **"contributions this year"** text label. This label cleanly matches the total contribution count next to it.

### 7. Universal Footer & Built-by Credits
- **Component**: [App.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/App.jsx)
- **Details**: Injected a global, responsive footer element aligned at the page baseline.
  - **Credits label**: Displays *"Designed & Built by Siddhant Wagh"* in clean typography.
  - **Social connections**: Adds a clickable SVG GitHub link pointing to Siddhant's GitHub profile and a clickable SVG LinkedIn vector link pointing to his LinkedIn profile.
  - **Branding**: Displays the brand shorthand icon `GP`, current copyright year, and build label `GitPulse v1.0` aligned in dark-mode compatible text. Hides automatically during PDF export via the `no-print` class modifier.

### 8. URL Footer Suppression & Header Emulation
- **Details**: Prevented default browser footers (displaying url strings like `localhost:5173/?user=...`) from printing on the PDF document while keeping/emulating the top header elements.
- **Solution**: 
  - **Strips Browser Strings**: Applied a zero-page-margin override (`@page { margin: 0 !important; }`) inside [index.css](file:///e:/Github%20analyzer/gitpulse-frontend/src/index.css) to completely strip all browser-added margins (hiding both native headers and footer URLs).
  - **Custom Header Emulation**: Injected a custom, styled static-fixed HTML print header (`.print-only-header`) inside [Dashboard.jsx](file:///e:/Github%20analyzer/gitpulse-frontend/src/pages/Dashboard.jsx). It displays the localized current date/time on the left and the site title `"GitPulse Analytics | Visualize Your GitHub Journey"` on the right.

### 9. Multi-Page Spacing Table Layout Wrapper
- **Details**: Fixed a layout bug where Page 2's content (`Weekly Coding Patterns` card title and subtext) started at the absolute top of the page, overlapping directly with the fixed custom top print header.
- **Solution**: Wrapped the dashboard content structure inside an HTML `<table>` layout grid where:
  - **Repeated Top Spacers**: The `<thead>` element repeats a `25mm` height empty spacing cell at the top of **every printed page** by default.
  - **Margin Safety**: The content in `tbody` cell starts exactly below this `25mm` spacer, providing a clean margin for the fixed print header and guaranteeing no overlaps occur on any page.
  - **Left/Right Margins**: Handled margins inside the `.print-content-cell` class (`padding-left: 15mm !important; padding-right: 15mm !important;`) rather than `body` padding, maintaining alignment consistency across splits.

---

## Verification & Validation

### 1. Build Verification
- Proactively ran `npm run build` inside `gitpulse-frontend` directory. The project successfully built all CSS and JS chunks in **17.98s** with **zero errors**.
