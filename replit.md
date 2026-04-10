# My Link Gallery

A frontend-only React + Vite web application serving as a personal link hub (similar to Linktree) and a styled resume page.

## Tech Stack

- **Frontend Framework:** React 18 (TypeScript)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS with `tailwindcss-animate` and `@tailwindcss/typography`
- **UI Components:** Radix UI primitives (via shadcn/ui)
- **Routing:** React Router DOM v6
- **State Management:** React Hooks and TanStack Query
- **Forms:** React Hook Form with Zod validation
- **Package Manager:** npm

## Project Structure

- `src/pages/` — Main route components (Index, Resume, Docs pages, Legal, NotFound)
- `src/components/ui/` — Reusable shadcn/ui primitives
- `src/components/index/` — Link gallery components (search, filters)
- `src/hooks/` — Shared custom hooks
- `src/data/` — Single merged `data.json` (resume + links combined), TypeScript accessor files (`links.ts`)
- `src/lib/` — Utility functions
- `public/` — Static assets
- `docs/` — Project documentation

## Data Architecture

All content is stored in a **single merged JSON file**:

- **`src/data/data.json`** — Single source of truth for both resume and links content. Top-level keys: `resume` (all resume fields) and `links` (settings + link items). `Resume.tsx` reads from `data.resume`, `links.ts` reads from `data.links`.

The psychometric section in `Resume.tsx` (Big Five, DISC, linguistic scores, etc.) is intentionally kept static (hardcoded).

## Key Routes

- `/` — Resume page
- `/links` — Link gallery
- `/pomodoro` — Pomodoro timer tool
- `/explore` — ExploreIT (IT roles directory)
- `/flashcard` — Interactive flashcard app (flip cards, shuffle, tag filters, import/export JSON)
- `/docs` — Documentation hub
- `/legal` — Legal / Privacy

## Flashcard Feature

- Data: `src/data/flashcards-data.json` (15 cloud computing terms seed deck) + `src/data/flashcards.ts` (types, export/import helpers)
- Page: `src/pages/Flashcard.tsx` — card flip animation (CSS 3D `rotateY`), prev/next navigation, keyboard shortcuts (← → Space), shuffle, tag filters, progress dots
- Export: downloads the current in-memory deck as JSON
- Import: accepts any compatible JSON deck file and replaces the current deck in memory

## Notes

- "Build your own" buttons on the Resume and Links pages link externally to `https://build.carlosgeraldine.eu.org`
- Builder tool code (pages, features, hooks, generators) has been removed from this branch

## Development

```bash
npm install
npm run dev
```

The dev server runs on port 5000 (`0.0.0.0`) with all hosts allowed for the Replit proxy.

## Deployment

Configured as a **static** site deployment:
- Build command: `npm run build`
- Public directory: `dist`
