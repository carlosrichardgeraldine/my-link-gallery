# My Link Gallery

A frontend-only React + Vite web application serving as a personal link hub (similar to Linktree), a styled resume page, and an in-browser resume builder.

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

- `src/pages/` — Main route components (Index, Resume, ResumeBuilder)
- `src/features/` — Resume builder editors and configuration
- `src/components/ui/` — Reusable shadcn/ui primitives
- `src/components/index/` — Link gallery components (search, filters)
- `src/hooks/` — Shared custom hooks
- `src/data/` — Single merged `data.json` (resume + links combined), TypeScript type/accessor files (`resumeBuilderContent.ts`, `linkBuilderContent.ts`, `links.ts`)
- `src/lib/` — Utility functions and generators (`dataGenerator.ts`, `dataPublishService.ts`)
- `public/` — Static assets
- `docs/` — Project documentation

## Data Architecture

All content is stored in a **single merged JSON file**:

- **`src/data/data.json`** — Single source of truth for both resume and links content. Top-level keys: `resume` (all resume fields) and `links` (settings + link items). `Resume.tsx` reads from `data.resume`, `links.ts` reads from `data.links`.

The builder generates and publishes one combined file:
- Both builders → generate a single `data.json` via `buildDataJson` / `downloadDataJson` (`src/lib/dataGenerator.ts`)
- Publishing commits `src/data/data.json` once via `dataPublishService.ts` and `useDataPublish` hook

The psychometric section in `Resume.tsx` (Big Five, DISC, linguistic scores, etc.) is intentionally kept static (hardcoded) as it is not editable via the builder.

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
