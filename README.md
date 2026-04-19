# System Design Bible

An interactive, in-depth learning resource for system design interview questions. Built with React, Vite, Tailwind CSS, and Framer Motion.

## ✨ Features

- **Deep-dive explanations** — not surface-level summaries. Each question covers the architecture, trade-offs, deep concepts, and production considerations.
- **Interactive diagrams** — sliders, hash visualizers, consensus simulators, timeline scrubbers.
- **Animated flows** — see writes land in LSM memtables, connections flow through pools, quorum votes propagate.
- **Extensible architecture** — adding a new question is just dropping a new folder into `src/questions/`.

## 📚 Current Questions

- ✅ Design a URL Shortener (TinyURL / Bit.ly)
- 🔜 More coming soon

## 🚀 Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## 📦 Build

```bash
npm run build
npm run preview
```

## 🌍 Deploying to Vercel

The easiest way:

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), import your repo.
3. Vercel auto-detects Vite. Click Deploy.

That's it — no config needed. `vercel.json` is included for client-side routing.

### Deploying to Netlify

1. Push to GitHub.
2. Go to [netlify.com](https://netlify.com), import.
3. Build command: `npm run build`
4. Publish directory: `dist`

### Deploying to GitHub Pages

1. `npm run build`
2. Push the `dist/` folder contents to a `gh-pages` branch.

## 🧱 Architecture

```
src/
├── components/
│   ├── Layout.jsx           # Shared layout with navbar
│   ├── HomePage.jsx         # List of all questions
│   └── ui/                  # Reusable primitives (Section, Callout, Code, etc.)
├── data/
│   └── questions.js         # Registry of all questions
├── questions/               # One folder per question — self-contained
│   └── url-shortener/
│       ├── index.jsx        # Main page
│       └── diagrams/        # Question-specific interactive diagrams
└── main.jsx
```

### Adding a new question

1. Create `src/questions/<slug>/index.jsx` exporting a default component.
2. Add an entry to `src/data/questions.js`:
   ```js
   {
     slug: 'design-twitter',
     title: 'Design Twitter',
     difficulty: 'Hard',
     frequency: 'Very High',
     tags: ['Feed', 'Fanout', 'Timeline'],
     summary: 'How Twitter builds home timelines at scale...',
     status: 'available',
     component: () => import('../questions/design-twitter/index.jsx'),
   }
   ```
3. Create diagrams in `src/questions/<slug>/diagrams/` and import them.

## 🎨 Design System

Color tokens in `tailwind.config.js`:
- `cream` — background surfaces (warm neutral)
- `ink` — text and borders (neutral grays)
- `rust` — primary accent (warm orange-red)
- `teal` — secondary accent (cool)

Typography:
- `font-sans` — Inter (UI, body text)
- `font-serif` — Fraunces (display headings)
- `font-mono` — JetBrains Mono (code)

## 📝 License

MIT — use freely for your own learning or teaching.
