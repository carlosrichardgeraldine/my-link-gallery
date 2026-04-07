import { AlertCircle, Info, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const noteGroups = [
  {
    title: "Behavior Notes",
    icon: Info,
    notes: [
      "The app is front-end only and does not require a backend.",
      "Builder exports are downloads; they do not overwrite workspace files automatically.",
      "Theme and appearance preferences are persisted in localStorage.",
    ],
  },
  {
    title: "Operational Notes",
    icon: ShieldCheck,
    notes: [
      "Route-level lazy loading is used for major pages, including docs pages.",
      "Unknown routes resolve to the shared NotFound page.",
      "Documentation pages should keep shell and styling consistent with core pages.",
    ],
  },
  {
    title: "Cautions",
    icon: AlertCircle,
    notes: [
      "Keep generated code edits isolated from unrelated refactors.",
      "Validate build after documentation route updates.",
      "Update docs contents links whenever new detailed pages are added.",
    ],
  },
];

const DocsNotes = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Notes</h1>
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
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Project Notes</h2>
          </section>

          <section className="space-y-4">
            {noteGroups.map((group) => {
              const Icon = group.icon;
              return (
                <article key={group.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground md:text-xl">{group.title}</h3>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {group.notes.map((note) => (
                      <li key={note} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground md:text-base">
                        {note}
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

export default DocsNotes;
