# My Link Gallery

My Link Gallery is a front-end-only Vite + React application for a personal link hub, a resume page, and an in-browser resume builder. The app uses static content, local browser state, and generated files rather than a backend.

## Architecture

The project is organized by feature, with pages acting mostly as orchestration shells and the reusable logic moved into focused modules.

- `src/App.tsx` sets up routing, lazy-loaded pages, the attribution footer, and page title management.
- `src/pages/Index.tsx` renders the link gallery view.
- `src/pages/Resume.tsx` renders the public resume page.
- `src/pages/LinkBuilder.tsx` provides the link editing experience.
- `src/pages/ResumeBuilder.tsx` hosts the resume builder shell and delegates the actual editors to feature modules.
- `src/features/resume-builder/*` contains the extracted resume-builder editors and configuration.
- `src/components/index/*` contains the link-gallery search and filtering UI.
- `src/components/link-builder/*` contains link-builder specific editor pieces.
- `src/hooks/*` contains shared hooks such as history and filtering behavior.
- `src/data/*` holds the structured content used by the app.
- `src/lib/*` contains utility and generator logic.

This structure keeps page files thin and makes the domain-specific editor logic easier to maintain.

## Routes

- `/` - Resume page.
- `/links` - Link gallery.
- `/resume` - Redirects to `/`.
- `/resume-builder` - Resume builder.
- `/links-builder` - Link builder.
- Unknown routes fall back to the 404 page.

## Data Flow

The app does not use an API or database.

- Link content comes from `src/data/links.ts`.
- Resume builder defaults come from `src/data/resumeBuilderContent.ts`.
- The resume builder edits an in-memory copy of that content and can download a generated `Resume.tsx` file.
- Theme and background preferences are persisted in `localStorage`.

## Development

Use npm for all project commands.

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start the Vite development server.
- `npm run build` - Build the production bundle.
- `npm run build:dev` - Build using the development mode config.
- `npm run preview` - Preview the production build locally.
- `npm run lint` - Run ESLint.
- `npm run test` - Run Vitest once.
- `npm run test:watch` - Run Vitest in watch mode.

## Notes

- The repository currently includes `bun.lock` and `bun.lockb`, but the documented workflow here uses npm and `package-lock.json`.
- The resume builder downloads a generated file; it does not write changes back into the workspace automatically.
- The app is designed to run entirely in the browser, with no server-side API.
