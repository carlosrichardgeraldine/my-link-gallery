import { Component, Layers3, Paintbrush } from "lucide-react";
import { Link } from "react-router-dom";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ThemeToggle from "@/components/ThemeToggle";

const projectVisualComponents = [
  {
    name: "MonochromePlusBackground",
    path: "src/components/MonochromePlusBackground.tsx",
    purpose: "Shared atmospheric page background used across core pages and docs pages.",
  },
  {
    name: "ThemeToggle",
    path: "src/components/ThemeToggle.tsx",
    purpose: "Theme switch control placed in headers for global appearance changes.",
  },
  {
    name: "BackgroundColorToggle",
    path: "src/components/BackgroundColorToggle.tsx",
    purpose: "Provides user control for background palette variation.",
  },
  {
    name: "NavLink",
    path: "src/components/NavLink.tsx",
    purpose: "Reusable navigation link presentation for top-level route actions.",
  },
  {
    name: "LinkCard",
    path: "src/components/LinkCard.tsx",
    purpose: "Card renderer for link gallery entries with title, metadata, and actions.",
  },
  {
    name: "FilterSidebar",
    path: "src/components/FilterSidebar.tsx",
    purpose: "Sidebar filter surface with grouped toggles for the link list.",
  },
  {
    name: "ResumePageNavigation",
    path: "src/components/ResumePageNavigation.tsx",
    purpose: "Navigation and paging controls for multi-page resume content.",
  },
];

const uiPrimitiveComponents = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "input-otp",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toaster",
  "toggle",
  "toggle-group",
  "tooltip",
] as const;

const credits = [
  {
    name: "Project Author",
    creator: "Carlos R. Geraldine",
    note: "Original creator and maintainer of My Link Gallery.",
  },
  {
    name: "shadcn/ui",
    creator: "shadcn and contributors",
    note: "Base component patterns and generated UI files in src/components/ui.",
  },
  {
    name: "Radix UI",
    creator: "Radix UI contributors",
    note: "Accessible primitive foundation used by many shadcn/ui components.",
  },
  {
    name: "Tailwind CSS",
    creator: "Tailwind Labs and contributors",
    note: "Utility-first styling system for layout, spacing, typography, and theme tokens.",
  },
  {
    name: "Lucide",
    creator: "Lucide contributors",
    note: "Icon library used throughout controls, headers, and section markers.",
  },
];

const DocsVisualComponents = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <Component className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Visual Components</h1>
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
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Visual Component Documentation</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              This catalog documents visual building blocks used by this project, covering custom components and the UI primitive set available in the codebase.
            </p>
          </section>

          <section className="space-y-4">
            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground md:text-xl">Project Visual Components</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {projectVisualComponents.map((component) => (
                  <li key={component.name} className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    <p className="text-sm font-semibold text-foreground md:text-base">{component.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground md:text-sm">{component.path}</p>
                    <p className="mt-2 text-sm text-muted-foreground md:text-base">{component.purpose}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground md:text-xl">UI Primitive Catalog</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Installed primitives in src/components/ui. Use these as the standard visual foundation before introducing new custom controls.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {uiPrimitiveComponents.map((name) => (
                  <div key={name} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground md:text-base">
                    {name}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground md:text-xl">Credits</h3>
              <ul className="mt-4 space-y-2">
                {credits.map((credit) => (
                  <li key={credit.name} className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    <p className="text-sm font-semibold text-foreground md:text-base">{credit.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">Creator: {credit.creator}</p>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">{credit.note}</p>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocsVisualComponents;
