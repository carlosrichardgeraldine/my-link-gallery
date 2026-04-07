import { Component, LayoutTemplate, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const sections = [
  {
    title: "UI Patterns",
    icon: LayoutTemplate,
    points: [
      "Use the shared page shell: MonochromePlusBackground, page-base-glass, and sticky header.",
      "Prefer rounded cards with border-border and bg-card for visual consistency.",
      "Keep section hierarchy predictable: page title, context paragraph, content cards.",
      "Apply responsive spacing with container + px-4 and md breakpoints for readability.",
    ],
  },
  {
    title: "Component Patterns",
    icon: Component,
    points: [
      "Use shadcn/ui primitives from src/components/ui for common interactions.",
      "Compose feature-level components in src/components and page-specific orchestration in src/pages.",
      "Use lucide-react icons with muted tone for support and foreground tone for emphasis.",
      "Preserve route-level lazy loading for heavy pages to keep initial load smaller.",
    ],
  },
  {
    title: "UX Guidelines",
    icon: Palette,
    points: [
      "Keep actions near context (header and card actions) and avoid duplicate CTAs in sidebars.",
      "Maintain theme parity using ThemeToggle and semantic color tokens (background, card, foreground).",
      "Prefer clear labels over decorative text so navigation remains scannable.",
      "For docs growth, add pages via contents links and keep each page focused on one topic.",
    ],
  },
];

const DocsUiUx = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <LayoutTemplate className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">UI/UX</h1>
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
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">UI/UX Documentation</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              This page captures shared interface patterns and interaction guidance used across My Link Gallery so future pages stay visually consistent and easier to navigate.
            </p>
          </section>

          <section className="space-y-4">
            {sections.map((section) => {
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

export default DocsUiUx;
