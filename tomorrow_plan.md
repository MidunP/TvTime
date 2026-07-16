# Tomorrow's Plan: Frontend Verification & Backend Kickoff

Once we verify these final frontend capabilities, we will immediately move to the **backend server implementation** (which will link up everything we built today to database records).

---

## Part 1: Frontend Final Verification (Tomorrow Morning)

Before hooking up the database, let's confirm the visual flows behave exactly like the TV Time app using our cached mock session:

### 1. Show Interactions
- [ ] **Search & Add**: Go to **Explore**, search for a show (e.g., "Breaking Bad"), click the yellow `[+]` button, and ensure it immediately changes to a green checkmark.
- [ ] **Watch List Refresh**: Go back to the **Shows** tab (Home) and verify the newly added show appears in the **Haven't Started** grid.
- [ ] **Marking Progress**: Open the show detail, expand a season, and click a checkmark on an episode. Ensure the progress bar updates both on the season level and the main show hero.

### 2. State & Styling Transitions
- [ ] **Status Toggles**: Change a show's status (e.g., from Watching to Completed) and verify it shifts categories in the **Library** (from Watching to Finished) and updates the colored progress bars.
- [ ] **Profile Check**: Check the profile page to make sure the "TV Time" stat card dynamically calculates months/days/hours watched based on the checked episodes.

---

## Part 2: Backend Kickoff (Connecting the Data)

Since the UI is ready, we can immediately begin writing backend routes and database schemas. Here is our backend roadmap:

### 1. Database Setup
- [ ] **MongoDB Integration**: Swap the placeholder URI in `server/.env` with your local MongoDB instance or Atlas cluster URI.
- [ ] **Verify Schemas**: Review Mongoose models (`User`, `Show`, `Episode`, `List`) to match the client-side state format we mapped out.

### 2. TMDb API Configuration
- [ ] Add your **TMDb API Key** to `server/.env` to power real show metadata queries instead of mock placeholders.
- [ ] Test the backend search and show detail controllers locally to verify server responses match frontend expectations.

### 3. Connecting Frontend to Backend
- [ ] Once the backend controllers are live, disable the localStorage mock fallback in `authService.js` and verify real sessions write to the MongoDB database.
