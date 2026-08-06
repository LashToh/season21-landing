# MU Online Season 21 — The Crusader Awakens

> 🇪🇸 [Leer en español](README.es.md)

AAA-quality promotional landing page for MU Online Season 21, featuring the new **Crusader** class.

## Tech Stack

- **React 18** + **Vite 6**
- **SCSS** — modular design system with tokens
- **GSAP** + ScrollTrigger — scroll-driven animations
- **Framer Motion** — component transitions and hover effects
- **Lenis** — smooth scroll
- **React Icons** — icon library

## Getting Started

**Requirement:** [Node.js LTS](https://nodejs.org) installed.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Registration API & MU Server Setup

This project includes a **Node.js backend** (`server/`) that registers accounts directly into your MuDevs Season 21 SQL Server database. Credentials never touch the React frontend.

### 1. Configure environment

Copy the example file and fill in your SQL Server details:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DB_SERVER` | SQL Server IP or hostname |
| `DB_PORT` | SQL port (default `1433`) |
| `DB_NAME` | Database name (`MuOnline`) |
| `DB_USER` / `DB_PASSWORD` | SQL login with INSERT on `MEMB_INFO` |
| `HASH_METHOD` | `plain`, `md5` (default), or `wz_md5` — must match JoinServer |
| `CORS_ORIGIN` | Frontend URL (default `http://localhost:5173`) |
| `VITE_API_URL` | API URL for the React app |
| `VITE_DOWNLOAD_URL` | Client download link |
| `VITE_DISCORD_URL` | Discord invite link |

### 2. SQL permissions

The database user needs at minimum:

- `SELECT`, `INSERT` on `MEMB_INFO`
- If `INSERT_VI_CURR_INFO=true`, also `INSERT` on `VI_CURR_INFO`
- If `HASH_METHOD=wz_md5`, execute permission on `dbo.fn_md5` (requires WZ MD5 DLL on SQL Server)

Enable remote connections and allow TCP port `1433` through your firewall.

### 3. Which HASH_METHOD to use?

In MuDevs Season 21, most servers store passwords in `MEMB_INFO.memb__pwd` as **hexadecimal MD5** (32 characters). That is why the project default is **`md5`**.

| Value | When to use it |
|-------|----------------|
| **`md5`** *(recommended)* | Standard MuDevs web registration. JoinServer with MD5 enabled and `memb__pwd` column as `varchar(32)`. |
| **`plain`** | Only if JoinServer has MD5 **disabled** and `memb__pwd` accepts plain text (`varchar(10–20)`). |
| **`wz_md5`** | Only if SQL Server has the `fn_md5` / WZ MD5 DLL and `memb__pwd` is `varbinary(16)`. |

**Recommendation:** leave `HASH_METHOD=md5` in `.env` unless you have verified a different configuration in JoinServer or the database.

Before changing the value, check the `memb__pwd` column type and the JoinServer MD5 option (e.g. `YlNeedMD5`).

### 4. Run frontend + API

**Option A — both at once:**

```bash
npm run dev:all
```

**Option B — separate terminals:**

```bash
npm run server   # API on http://localhost:3001
npm run dev      # Vite on http://localhost:5173
```

Test health: `GET http://localhost:3001/api/health`

### 5. Production notes

- Use **HTTPS** for both site and API in production
- Set `CORS_ORIGIN` to your real domain
- Never commit `.env` with real credentials
- Keep rate limiting enabled (default: 5 registrations / 15 min per IP)

## Live Server (VS Code)

Live Server **cannot** open the root `index.html` directly.
This stack uses React, JSX, and SCSS, which must be compiled first.

### Option A — Development (recommended)

Use the Vite dev server, not Live Server:

```bash
npm run dev
```

### Option B — Live Server with build

1. Build the project:
   ```bash
   npm run build
   ```
2. In VS Code, right-click `dist/index.html` → **Open with Live Server**
3. It will open at `http://127.0.0.1:5500`

The `.vscode/settings.json` file already points Live Server to `/dist`.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Navbar/
│   ├── Hero/
│   ├── Crusader/
│   ├── Weapons/
│   ├── Skills/
│   ├── Features/
│   ├── Gallery/
│   ├── Timeline/
│   ├── Download/
│   ├── Register/
│   ├── Footer/
│   └── Embers/
├── context/
│   └── RegisterContext.jsx
├── services/
│   └── api.js
├── hooks/
│   ├── useLenis.js
│   ├── useParallax.js
│   └── useGsapReveal.js
├── styles/
│   ├── _variables.scss
│   ├── _global.scss
│   ├── _components.scss
│   └── main.scss
├── App.jsx
└── main.jsx
server/
├── index.js
├── config.js
├── db.js
├── routes/
│   └── register.js
└── utils/
    └── hashPassword.js
public/
└── assets/
    ├── crusader-hero.svg
    ├── crusader-portrait.svg
    ├── war-hammer.svg
    └── shield.svg
```

## Sections

1. **Hero** — Fullscreen cinematic intro with parallax, embers, and Crusader silhouette
2. **Crusader** — Lore, history, and animated stat bars
3. **Weapons** — War Hammer & Shield with 3D hover cards
4. **Skills** — Holy skill cards with video preview support
5. **Features** — Season XXI feature grid
6. **Gallery** — Media gallery with lightbox
7. **Timeline** — Vertical release roadmap
8. **Download** — CTA with system requirements
9. **Footer** — Links and social

## Design

Dark fantasy palette inspired by AAA game studios. Original fan-made design — not affiliated with Webzen.

## License

MIT — See [LICENSE](LICENSE)
