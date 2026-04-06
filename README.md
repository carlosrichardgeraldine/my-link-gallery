# My Link Gallery

My Link Gallery is a client-side Vite + React application that combines a curated link hub with a resume-focused portfolio page and an in-browser resume builder. The project is built around static content in `src/data`, polished UI components from Radix/shadcn, and a light amount of local browser state for theme and appearance preferences.

## What It Does

- Presents a searchable, filterable gallery of personal links.
- Renders a styled resume page with work history, projects, skills, education, and credentials.
- Provides a resume builder that edits structured resume content in the browser and downloads a generated `Resume.tsx` file.
- Supports light/dark theme switching plus background tint selection.
- Uses a custom animated background and subtle hover effects for a more deliberate visual style.

## Routes

- `/` - Resume page.
- `/links` - Link gallery.
- `/resume` - Redirects to `/`.
- `/resume-builder` - Resume builder.
- Any unknown route falls back to the 404 page.

## Project Structure

- `src/App.tsx` wires up routing, shared providers, and the global attribution footer.
- `src/pages/Index.tsx` renders the link gallery with search, tag filtering, and pagination.
- `src/pages/Resume.tsx` renders the resume view from the content data.
- `src/pages/ResumeBuilder.tsx` provides the editing interface for resume content and the download action.
- `src/data/links.ts` holds the link gallery data.
- `src/data/resumeBuilderContent.ts` holds the default resume-builder content.
- `src/lib/resumeBuilderGenerator.ts` converts builder state into a downloadable `Resume.tsx` file.
- `src/components/*` contains shared UI, background, and filtering components.

## Tech Stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix UI primitives
- React Router
- TanStack Query
- Sonner for toasts
- Vitest and Testing Library for unit tests
- Playwright config is included for browser testing

## Content Model

The app does not use a backend. Most content is defined as TypeScript data and rendered directly from the source files:

- Link cards come from `src/data/links.ts`.
- Resume content comes from `src/data/resumeBuilderContent.ts`.
- The builder works from an in-memory copy of that data and can generate a standalone `Resume.tsx` download.

Theme selection and background tint are persisted in `localStorage` so the UI restores the last appearance settings on reload.

## Getting Started

Install dependencies and start the dev server:

```bash
bun install
bun dev
```

If you prefer another package manager, the standard Vite scripts also work.

## Scripts

- `bun dev` - Start the development server.
- `bun build` - Build the production bundle.
- `bun build:dev` - Build with the development mode config.
- `bun preview` - Preview the production build locally.
- `bun lint` - Run ESLint across the project.
- `bun test` - Run Vitest once.
- `bun test:watch` - Run Vitest in watch mode.

## Notes

- The resume builder downloads a file; it does not write changes back into the workspace automatically.
- The global attribution footer is intentionally enforced in the app shell.
- The project currently behaves as a front-end-only portfolio app with no server API.
