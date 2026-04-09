import { GitBranch, Link2, Route } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const routeTable = [
  { path: "/", purpose: "Primary resume experience", notes: "Main landing page." },
  { path: "/links", purpose: "Link gallery", notes: "Search, filtering, and pagination." },
  { path: "/resume", purpose: "Legacy path", notes: "Redirects to /." },
  { path: "/docs", purpose: "Documentation hub", notes: "Top-level docs index." },
  { path: "/docs/overview-manual", purpose: "Manual", notes: "High-level setup and maintenance guide." },
  { path: "/docs/architecture", purpose: "Architecture docs", notes: "Feature and module boundaries." },
  { path: "/docs/routes", purpose: "Routes docs", notes: "This route reference page." },
  { path: "*", purpose: "Fallback", notes: "Renders the 404 page." },
];

const DocsRoutes = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <Route className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Routes</h1>
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
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Route Reference</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Canonical route list for behavior, redirects, and documentation endpoints.
            </p>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground md:text-xl">Route Map</h3>
            </div>

            <div className="space-y-2">
              {routeTable.map((route) => (
                <article key={route.path} className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground">{route.path}</span>
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5" />
                      {route.purpose}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{route.notes}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocsRoutes;
