import { Database, GitFork, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const flowSections = [
  {
    title: "Sources",
    points: [
      "Link data is defined in src/data/links.ts.",
      "Resume builder defaults come from src/data/resumeBuilderContent.ts.",
      "UI state preferences (theme/background) are restored from localStorage.",
    ],
    icon: Database,
  },
  {
    title: "Transformation",
    points: [
      "Builder pages edit in-memory state using shared history hooks.",
      "Generator helpers in src/lib turn state into downloadable source files.",
      "UI components render derived views from filtered or normalized state.",
    ],
    icon: Repeat,
  },
  {
    title: "Output",
    points: [
      "Resume builder can export Resume.tsx content.",
      "Link builder can export links.ts content.",
      "No server persistence occurs by default in this workflow.",
    ],
    icon: GitFork,
  },
];

const DocsDataFlow = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Data Flow</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/docs" className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm">
                Back to Docs
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Detailed page</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Data Flow Reference</h2>
          </section>

          <section className="space-y-4">
            {flowSections.map((section) => {
              const Icon = section.icon;
              return (
                <article key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
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
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocsDataFlow;
