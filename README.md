# My Link Gallery

My Link Gallery is a front-end-only Vite + React application that combines a curated link hub, a resume page, and an in-browser resume builder. The app uses static content, local browser state, and generated files rather than a backend.

## Architecture

The project is now organized by feature instead of by monolithic page files.

- `src/App.tsx` owns routing, lazy loading, page title updates, Clarity tags, and the attribution footer.
- `src/pages/Index.tsx` renders the link gallery view.
- `src/pages/Resume.tsx` renders the public resume page.
- `src/pages/LinkBuilder.tsx` provides the link editing experience.
- `src/pages/ResumeBuilder.tsx` is the resume-builder shell and delegates most editor logic to feature modules.
- `src/features/resume-builder/*` contains the extracted resume-builder editors and configuration.
- `src/components/index/*` contains the link-gallery search and filtering UI.
- `src/components/link-builder/*` contains link-builder specific editor pieces.
- `src/hooks/*` contains shared hooks such as history and filtering behavior.
- `src/data/*` holds the structured content used by the app.
- `src/lib/*` contains utility and generator logic.

## What It Does

- Presents a searchable, filterable gallery of personal links.
- Renders a styled resume page with work history, projects, skills, education, and credentials.
- Provides a resume builder that edits structured resume content in the browser and downloads a generated `Resume.tsx` file.
- Supports light and dark theme switching plus background tint selection.
- Uses a custom animated background and subtle hover effects for a more deliberate visual style.

## Routes

- `/` - Resume page.
- `/links` - Link gallery.
- `/resume` - Redirects to `/`.
- `/resume-builder` - Resume builder.
- `/links-builder` - Link builder.
- `/docs` - Documentation page.
- Any unknown route falls back to the 404 page.

## Content Model

The app does not use a backend. Most content is defined as TypeScript data and rendered directly from the source files:

- Link cards come from `src/data/links.ts`.
- Resume content comes from `src/data/resumeBuilderContent.ts`.
- The builder works from an in-memory copy of that data and can generate a standalone `Resume.tsx` download.

Theme selection and background tint are persisted in `localStorage` so the UI restores the last appearance settings on reload.

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start the development server.
- `npm run build` - Build the production bundle.
- `npm run build:dev` - Build with the development mode config.
- `npm run preview` - Preview the production build locally.
- `npm run lint` - Run ESLint across the project.
- `npm run test` - Run Vitest once.
- `npm run test:watch` - Run Vitest in watch mode.

## Notes

- The resume builder downloads a file; it does not write changes back into the workspace automatically.
- The global attribution footer is intentionally enforced in the app shell.
- The project currently behaves as a front-end-only portfolio app with no server API.
