# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server on :5173
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
```

There is no test suite, linter, or formatter configured. Verification is done by running `npm run build` (catches import errors, JSX errors, missing modules).

`scripts/extract-questions.mjs` regenerates `src/data/questions.js` by parsing the sibling `../system_design_bible.html` standalone file. Run it only when intentionally re-syncing question metadata from the HTML source — it will overwrite hand-edited fields. Invoke with `node scripts/extract-questions.mjs`.

## High-level architecture

This is a Vite + React 18 + React Router 6 SPA. State is local; persistent user progress (XP, streak, studied/mastered) lives in `localStorage` via the hooks in `src/hooks/`.

### Two-tier question system (important)

Every question has a generic listing card backed by `src/data/questions.js`. Most route to the **generic `QuestionPage`** which renders a summary view from the data record. A small number have a **bespoke deep-dive page** under `src/questions/<slug>/`.

The route table in `src/App.jsx` is the source of truth for which slugs are deep dives. The order matters — explicit `/q/<slug>` routes must appear **before** the `/q/:slug` fallback, or React Router will dispatch to `QuestionPage` first.

Promoting a question from generic to deep-dive requires **three coordinated edits**:

1. Create `src/questions/<slug>/index.jsx` exporting a default component (use `DeepDiveLayout`).
2. Import it in `src/App.jsx` and add `<Route path="/q/<slug>" element={<Component />} />` **above** the `:slug` fallback.
3. In `src/data/questions.js`:
   - Make sure `slug` matches the route exactly (existing entries often have long auto-generated slugs like `design-uber-ride-sharing-service` — shorten to match the route).
   - Set `status: "available"`. **If `status` is anything other than `"available"`, the HomePage renders the card as locked with a "Soon" badge and the link does nothing** — this is the most common "I added a deep dive but the card still says coming soon" bug.

The README's instructions for adding a question reference a `component: () => import(...)` field — that field is not actually used by the code. Ignore it; follow the three-step process above.

### Deep-dive page composition

Deep-dive pages compose a fixed set of UI primitives from `src/components/ui/`:

- `DeepDiveLayout` — sticky section nav + reading-progress bar + prev/next. Takes a `sections` array (`{id, label}[]`) that must match the `id`s of `<Section>` blocks in the page. `theme` is `'blue'` or `'rust'` (preset gradients + accent colors).
- `Section` — numbered section with eyebrow / title / intro / body. Uses `framer-motion` for in-view fade.
- `Callout` — variants: `info`, `insight`, `warning`, `success`, `interview` (each has its own icon and color scheme).
- `Code` — `inline` prop for inline code; otherwise a dark code block with optional `lang` label.
- `Stat` — large numeric tile; `accent` prop colors it rust.

### Diagram conventions

Each deep dive owns its diagrams under `src/questions/<slug>/diagrams/`. Two distinct patterns are used in the codebase — choose deliberately:

- **`@xyflow/react` flow charts** (see `url-shortener/diagrams/ArchitectureDiagram.jsx`) for node-and-edge architectures with custom node/edge components, animated particles via `<animateMotion>`, and lane backgrounds. Heavier; appropriate for true graph layouts.
- **Pure SVG + `framer-motion`** (see `uber/diagrams/*.jsx`) for hand-laid-out visualizations like honeycombs, state machines, and timelines. Lighter and easier to animate with `motion.*` elements.

Both patterns must support **dark mode**. Use the `useDark` hook (`src/hooks/useDark.js`) to swap between light and dark palette objects rather than relying solely on Tailwind classes inside SVGs (CSS variables don't always interpolate cleanly in SVG attributes).

### Styling system

Tailwind with `darkMode: 'class'`. Custom color palettes in `tailwind.config.js`:
- `cream` — light-mode surfaces
- `night` — dark-mode surfaces
- `ink` — neutral grayscale (text + borders)
- `rust` — primary accent (warm orange)
- `teal` — secondary accent

Fonts: Inter (sans), Fraunces (serif, used for headings via `font-serif`), JetBrains Mono (mono).

### Routing & deployment

`vite.config.js` sets `base: './'` for portable static hosting. `vercel.json` rewrites unknown paths to `index.html` so client-side routing works on Vercel. The same pattern is required on any other host (Netlify `_redirects`, etc.).

### Relationship to the standalone HTML

The parent directory contains `system_design_bible.html` — a single-file standalone version of the same question set with its own animations and styles. The Vite app's `questions.js` is derived from that HTML via the extract script. **The two are independent runtime artifacts** — edits to the HTML do not flow into the React app unless the extract script is re-run, and edits to React deep-dive pages don't affect the HTML.
