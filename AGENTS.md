# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **MU Online Season 21 "The Crusader Awakens" landing page**: a React 18 + Vite 6 marketing site (`src/`) plus a small Express account‑registration API (`server/`) that inserts new accounts into a Microsoft SQL Server (`MEMB_INFO` table). It is a single npm package (no workspaces). Dependencies are installed by the update script (`npm install`).

### Services and how to run them

- Frontend (Vite dev server): `npm run dev` → http://localhost:5173
- Registration API (Express): `npm run server` → http://localhost:3001 (health: `GET /api/health`)
- Both together: `npm run dev:all` (uses `concurrently`)

Standard scripts live in `package.json` (`dev`, `server`, `dev:all`, `build`, `preview`). Setup/config details are in `README.md`.

### Environment file

- Copy `.env.example` → `.env` for local dev. `.env` is git‑ignored (do not commit it).
- `server/config.js` has placeholder fallbacks for DB vars, so the API process **boots even without a real DB**; `/api/health` works, but `POST /api/register` only succeeds against a reachable SQL Server with a `MEMB_INFO` table.

### Non‑obvious gotchas

- No lint and no test infrastructure exist (no ESLint/Prettier config, no test runner, no test files). The only build is the Vite frontend build (`npm run build`); the backend is plain Node ESM and runs directly with no build step.
- The DB is an **external MSSQL** dependency; the repo ships no docker‑compose/migrations/seed. To exercise registration end‑to‑end locally, run a throwaway SQL Server in Docker and point `.env` at it (`DB_SERVER=localhost`, `DB_USER=sa`), then create a `MuOnline` DB with a `MEMB_INFO` table containing at least: `memb___id`, `memb__pwd`, `memb_name`, `sno__numb`, `mail_addr`, `bloc_code`, `ctl1_code` (see the INSERT in `server/routes/register.js`). `HASH_METHOD=md5` (default) stores a 32‑char hex MD5 in `memb__pwd`.
- The API opens the DB pool lazily on the first `/api/register` request (`server/db.js`), so the server can start before the database is ready.
- Registration is rate‑limited (default 5 / 15 min per IP via `RATE_LIMIT_MAX`); raise `RATE_LIMIT_MAX` in `.env` if you need to test many registrations quickly.
- `CORS_ORIGIN` must match the frontend origin (`http://localhost:5173`) or the browser Register modal calls will fail.
