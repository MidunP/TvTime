# CineTrack Backend Checklist
Tick these off as you go. Ordered by priority — top items matter even if you only get 30 min some days.

---

## 🔴 Phase 1 — Security Must-Fix (2–3 hrs total, do first)
- [x] Remove hardcoded admin fallback (`midun` / `changeme123`) in `server.js` — require env vars, crash on boot if missing
- [x] Add env validation at startup (`envalid`) for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MONGODB_URI`
- [x] Add `express-rate-limit` on `/api/auth/login` and `/api/auth/register`
- [x] Fix CORS — read allowed origins from `CLIENT_URLS` env var, remove hardcoded Vercel URL
- [x] Confirm `.env` is gitignored AND was never committed in git history (`git log --all --full-history -- .env`)
- [x] Add input validation (`zod`) on register/login at minimum

## 🟡 Phase 2 — Stability (before real users touch it)
- [x] Add pagination to `getFeed`, `getFollowers`, `getFollowing`, show search
- [x] Decide fate of mock/localStorage fallback logic — one `USE_MOCK` flag or delete it
- [x] Add `helmet`, `hpp`, `express-mongo-sanitize` (NoSQL injection protection)
- [ ] Replace scattered `console.log` with structured logging (`pino`) (Phase 3 with Sentry)
- [x] Run `npm audit` and fix any high/critical vulnerabilities

## 🟢 Phase 3 — Production Infra (before deploying live)
- [ ] Swap in-memory cache → Redis (`ioredis` + Upstash free tier)
- [ ] Add Sentry for error tracking
- [x] Write `server/Dockerfile`, confirm `docker build` + `docker run` works
- [x] Add GitHub Actions CI (lint + build on push)
- [ ] Add circuit breaker (`opossum`) around TMDb calls with existing mock as fallback

## 🚀 Phase 4 — Deploy
- [ ] MongoDB Atlas free tier (M0) — migrate off local Mongo
- [ ] Deploy backend to Render or Railway
- [ ] Point frontend (Vercel) at deployed backend URL, update CORS
- [x] Verify `/health` endpoint responds (Tested & working on http://localhost:5000/health)
- [ ] Smoke test: register, login, add show, mark episode, check feed

## 📱 Phase 5 — Play Store (after backend is stable)
- [ ] Wrap frontend with Capacitor (`@capacitor/core`, `@capacitor/android`)
- [ ] Test on Android emulator
- [ ] Handle safe-area insets, back button, splash/icons
- [ ] Play Console: signing key, data safety form, closed testing track
