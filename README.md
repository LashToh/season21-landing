# MU Online Season 21 — The Crusader Awakens

AAA-quality promotional landing page for MU Online Season 21, featuring the new **Crusader** class.

## Tech Stack

- **React 18** + **Vite 6**
- **SCSS** — modular design system with tokens
- **GSAP** + ScrollTrigger — scroll-driven animations
- **Framer Motion** — component transitions and hover effects
- **Lenis** — smooth scroll
- **React Icons** — icon library

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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
│   ├── Footer/
│   └── Embers/
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

Dark fantasy palette inspired by AAA game studios. Original design — not affiliated with Webzen.

## License

MIT — See [LICENSE](LICENSE)
