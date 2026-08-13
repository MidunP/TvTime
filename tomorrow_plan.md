# Tomorrow's Plan: Frontend Verification & Backend Kickoff

Once we verify these final frontend capabilities, we will immediately move to the **backend server implementation** (which will link up everything we built today to database records).

---

## Part 1: Frontend Final Verification (Completed)

Before hooking up the database, let's confirm the visual flows behave exactly like the TV Time app using our cached mock session:

### 1. Show Interactions
- [x] **Search & Add**: Go to **Explore**, search for a show (e.g., "Breaking Bad"), click the yellow `[+]` button, and ensure it immediately changes to a green checkmark.
- [x] **Watch List Refresh**: Go back to the **Shows** tab (Home) and verify the newly added show appears in the **Haven't Started** grid.
- [x] **Marking Progress**: Open the show detail, expand a season, and click a checkmark on an episode. Ensure the progress bar updates both on the season level and the main show hero.

### 2. State & Styling Transitions
- [x] **Status Toggles**: Change a show's status (e.g., from Watching to Completed) and verify it shifts categories in the **Library** (from Watching to Finished) and updates the colored progress bars.
- [x] **Profile Check**: Check the profile page to make sure the "TV Time" stat card dynamically calculates months/days/hours watched based on the checked episodes.

---

## Part 2: Backend Kickoff (Connecting the Data)

Since the UI is ready, we can immediately begin writing backend routes and database schemas. Here is our backend roadmap:

### 1. Database Setup
- [x] **MongoDB Integration**: Configured `server/.env` with local MongoDB URI fallback (`mongodb://127.0.0.1:27017/cinetrack`) and robust connection error handling in `db.js`.
- [x] **Verify Schemas**: Reviewed and validated Mongoose models (`User`, `WatchlistItem`, `WatchedEpisode`, `CustomList`) to perfectly match the client-side state schema.

### 2. TMDb API Configuration
- [x] Add your **TMDb API Key** to `server/.env` to power real show metadata queries; updated `tmdbService.js` with fallback mock data when key is pending.
- [x] Test the backend search and show detail controllers locally to verify server responses match frontend expectations.

### 3. Connecting Frontend to Backend
- [x] Integrated `showService`, `listService`, and `authService` with automatic backend detection (`checkBackend()`) and seamless fallback to `mockShowService` / `mockAuthService` when offline, ensuring full dual-mode support (localStorage & MongoDB).
