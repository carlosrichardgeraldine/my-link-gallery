import type { ResumeBuilderContent } from "@/data/resumeBuilderContent";

export const resumeBuilderStorageKey = "my-link-gallery.resume-builder.draft.v1";

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

export const buildResumeTsx = (content: ResumeBuilderContent) => {
  const contentLiteral = formatJson(content);

  return `import React from "react";

const resumeBuilderContent = ${contentLiteral} as const;

const sectionLabel = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/Entry Level/g, "Entry-level");

const Resume = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8 lg:px-10">
        <header className="space-y-3 border-b border-border pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Resume.tsx
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {resumeBuilderContent.resumePages[0]?.title ?? "Resume"}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {resumeBuilderContent.resumePages[0]?.subtitle ?? ""}
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {resumeBuilderContent.resumePages.map((page) => (
            <article key={page.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{page.title}</h2>
                <p className="text-sm text-muted-foreground">{page.subtitle}</p>
                {page.summary ? <p className="text-sm leading-relaxed text-foreground/90">{page.summary}</p> : null}
              </div>
              {page.body?.length ? (
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
                  {page.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
              {page.highlights?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {page.highlights.map((highlight) => (
                    <span key={highlight} className="rounded-full border border-border bg-background px-3 py-1 text-xs">
                      {highlight}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">Projects</h2>
            <p className="text-sm text-muted-foreground">Selected implementations and practice portfolios.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {resumeBuilderContent.projectItems.map((item) => (
              <li key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold">Other Working Experience</h2>
            <div className="mt-4 space-y-4">
              {resumeBuilderContent.otherWorkingExperiences.map((experience) => (
                <div key={experience.title} className="rounded-2xl border border-border/70 bg-background p-4">
                  <h3 className="font-semibold">{experience.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{experience.subtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {experience.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold">Education & Honors</h2>
            <div className="mt-4 space-y-6">
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <h3 className="font-semibold">Education</h3>
                <p className="mt-2 text-sm">{resumeBuilderContent.educationDetails.institution}</p>
                <p className="text-sm text-muted-foreground">{resumeBuilderContent.educationDetails.degree}</p>
                <p className="text-sm text-muted-foreground">{resumeBuilderContent.educationDetails.period}</p>
                <p className="text-sm text-muted-foreground">{resumeBuilderContent.educationDetails.grade}</p>
                <p className="text-sm text-muted-foreground">{resumeBuilderContent.educationDetails.focus}</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Honors and Awards</h3>
                {resumeBuilderContent.honorsAndAwards.map((award) => (
                  <div key={award.title} className="rounded-2xl border border-border/70 bg-background p-4">
                    <p className="font-medium">{award.title}</p>
                    <p className="text-sm text-muted-foreground">{award.issuer}</p>
                    <p className="text-sm text-foreground/90">{award.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">Key Skills</h2>
            <p className="text-sm text-muted-foreground">Capability levels across business, technical, and delivery functions.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(resumeBuilderContent.keySkills).map(([level, items]) => (
              <div key={level} className="rounded-2xl border border-border/70 bg-background p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {sectionLabel(level)}
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {items.map((item) => (
                    <li key={item} className="rounded-full border border-border px-3 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">Tools and Equipment</h2>
            <p className="text-sm text-muted-foreground">Core platforms and tools grouped by proficiency level.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(resumeBuilderContent.toolsAndEquipment).map(([level, items]) => (
              <div key={level} className="rounded-2xl border border-border/70 bg-background p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {sectionLabel(level)}
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {items.map((item) => (
                    <li key={item} className="rounded-full border border-border px-3 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">Highlighted Credentials</h2>
            <p className="text-sm text-muted-foreground">Selected certifications and professional credentials.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {resumeBuilderContent.highlightedCredentials.map((item) => (
              <span key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm leading-relaxed">
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Resume;
`;
};

export const downloadResumeTsx = (content: ResumeBuilderContent) => {
  const file = new Blob([buildResumeTsx(content)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "Resume.tsx";
  anchor.rel = "noopener noreferrer";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
