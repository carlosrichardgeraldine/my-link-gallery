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

- Catalog: `src/data/flashcard-sets.json` — editable registry listing all available decks (id, name, description, file, cardCount, tags)
- Decks: `src/data/decks/` — one JSON file per deck:
  - `cloud-computing-fundamentals.json` (45 cards)
  - `aws-saa.json` (10 cards — AWS Solutions Architect Associate)
  - `az-900.json` (10 cards — Azure Fundamentals)
- Types + helpers: `src/data/flashcards.ts` — FlashcardDeck/FlashcardSetEntry types, deckRegistry map, export/import helpers
- Page: `src/pages/Flashcard.tsx` — deck picker grid → study view with card flip (CSS 3D `rotateY`), prev/next navigation, keyboard shortcuts (← → Space), shuffle, tag filters, import/export JSON
- Export: downloads the current in-memory deck as JSON
- Import: accepts any compatible JSON deck file and loads it as a custom deck
- To add a new deck: add a JSON file to `src/data/decks/`, add an entry to `flashcard-sets.json`, and add the import + registry entry to `flashcards.ts`

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
