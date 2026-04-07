import { BookText, ClipboardList, Rocket, Settings, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const manualSections = [
  {
    title: "Purpose",
    icon: BookText,
    items: [
      "Provide a single high-level source of truth for how the app is structured.",
      "Help contributors navigate from routes to feature modules quickly.",
      "Document expected local workflow using npm commands only.",
    ],
  },
  {
    title: "Environment Setup",
    icon: Rocket,
    items: [
      "Install dependencies with npm install.",
      "Run the app with npm run dev.",
      "Create production output with npm run build.",
    ],
  },
  {
    title: "Architecture Walkthrough",
    icon: ClipboardList,
    items: [
      "App shell and routing are in src/App.tsx with lazy-loaded pages.",
      "Page-level orchestration is in src/pages.",
      "Resume builder domain logic is modularized under src/features/resume-builder.",
      "Reusable UI primitives are in src/components/ui.",
    ],
  },
  {
    title: "Customization Guide",
    icon: Settings,
    items: [
      "Update data source content under src/data for links and resume defaults.",
      "Adjust visual patterns via existing components first before adding new ones.",
      "Keep page-level files focused on composition and move heavy logic into features.",
    ],
  },
  {
    title: "Maintenance Checklist",
    icon: Wrench,
    items: [
      "Run npm run build after each feature or refactor change.",
      "Run npm run lint and npm run test before finalizing.",
      "Keep documentation route list updated when adding pages.",
    ],
  },
];

const DocsOverviewManual = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <BookText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Overview Manual</h1>
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Detailed manual</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Documentation Playbook</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              This page expands the overview documentation with practical setup, architecture navigation, and a maintenance checklist for ongoing updates.
            </p>
          </section>

          <section className="space-y-4">
            {manualSections.map((section) => {
              const Icon = section.icon;

              return (
                <article key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground md:text-xl">{section.title}</h3>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground md:text-base">
                        {item}
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

export default DocsOverviewManual;
