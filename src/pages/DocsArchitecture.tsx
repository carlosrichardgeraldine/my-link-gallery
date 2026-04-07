import { Blocks, Layers, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const architectureSections = [
  {
    title: "System Shape",
    points: [
      "The app is a client-side Vite + React SPA with route-level lazy loading.",
      "Pages act as orchestration shells while feature modules hold domain logic.",
      "Static data in src/data powers content rendering and builder defaults.",
    ],
  },
  {
    title: "Layer Boundaries",
    points: [
      "src/pages: route entry points and high-level composition.",
      "src/features: feature-specific editors and configuration (for example resume-builder).",
      "src/components: reusable UI and route-specific component groups.",
      "src/hooks: shared behavior like history and filtering logic.",
      "src/lib: generation and utility logic.",
    ],
  },
  {
    title: "Resume Builder Architecture",
    points: [
      "Builder shell is in src/pages/ResumeBuilder.tsx.",
      "Section routing is centralized in src/features/resume-builder/BuilderPanel.tsx.",
      "Editors are split per concern under src/features/resume-builder/editors.",
      "Cross-editor concerns are extracted into reusable helpers and hooks.",
    ],
  },
  {
    title: "Guidelines",
    points: [
      "Keep page files focused on composition and shell behavior.",
      "Extract dense CRUD/editing logic into feature modules.",
      "Prefer shared hooks for cross-page behavior instead of duplicating local state logic.",
    ],
  },
];

const DocsArchitecture = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <Blocks className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Architecture</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/docs"
                className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
              >
                Back to Docs
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Detailed page</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Architecture Reference</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              This page describes how responsibilities are split across routes, features, components, hooks, and utilities.
            </p>
          </section>

          <section className="space-y-4">
            {architectureSections.map((section, index) => (
              <article key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  {index % 2 === 0 ? (
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <h3 className="text-lg font-semibold text-foreground md:text-xl">{section.title}</h3>
                </div>

                <ul className="mt-4 space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground md:text-base">
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocsArchitecture;
