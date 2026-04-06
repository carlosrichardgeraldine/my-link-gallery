import { ChevronDown, Download, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createResumeBuilderContent,
  type AwardItem,
  type EducationDetails,
  type OtherWorkingExperience,
  type ResumeBuilderContent,
  type ResumePageContent,
  type SkillGroups,
  type ToolsGroups,
} from "@/data/resumeBuilderContent";
import { downloadResumeTsx } from "@/lib/resumeBuilderGenerator";
import { toast } from "sonner";

type SectionId =
  | "resumePages"
  | "projectItems"
  | "otherWorkingExperiences"
  | "educationDetails"
  | "honorsAndAwards"
  | "keySkills"
  | "toolsAndEquipment"
  | "highlightedCredentials";

const sections: Array<{ id: SectionId; label: string; description: string }> = [
  { id: "resumePages", label: "Resume Pages", description: "Create, edit, and remove page records." },
  { id: "projectItems", label: "Project Items", description: "Edit the project item list." },
  {
    id: "otherWorkingExperiences",
    label: "Other Working Experience",
    description: "Manage the additional work history cards.",
  },
  { id: "educationDetails", label: "Education Details", description: "Update the single education record." },
  { id: "honorsAndAwards", label: "Honors and Awards", description: "Manage certification and award entries." },
  { id: "keySkills", label: "Key Skills", description: "Edit the skill bands by proficiency level." },
  { id: "toolsAndEquipment", label: "Tools and Equipment", description: "Edit the tool bands by proficiency level." },
  { id: "highlightedCredentials", label: "Highlighted Credentials", description: "Edit the credential list." },
];

const classNames = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinLines = (items: string[]) => items.join("\n");

const createBlankPage = (index: number): ResumePageContent => ({
  id: `new-page-${index + 1}`,
  title: "New Page",
  subtitle: "",
  summary: "",
  body: [],
  highlights: [],
  accent: "",
  borderClass: "",
  noCard: false,
});

const createBlankExperience = (): OtherWorkingExperience => ({
  title: "New Working Experience",
  subtitle: "",
  tags: [],
});

const createBlankAward = (): AwardItem => ({
  title: "New Award",
  issuer: "",
  note: "",
});

const updatePage = (
  pages: ResumePageContent[],
  index: number,
  patch: Partial<ResumePageContent>
) => pages.map((page, pageIndex) => (pageIndex === index ? { ...page, ...patch } : page));

const updateExperience = (
  experiences: OtherWorkingExperience[],
  index: number,
  patch: Partial<OtherWorkingExperience>
) => experiences.map((experience, experienceIndex) => (experienceIndex === index ? { ...experience, ...patch } : experience));

const updateAward = (awards: AwardItem[], index: number, patch: Partial<AwardItem>) =>
  awards.map((award, awardIndex) => (awardIndex === index ? { ...award, ...patch } : award));

const lockedResumePageIds = new Set([
  "other-working-experience",
  "projects",
  "key-skills",
  "tools-equipment",
  "highlighted-credentials",
  "linguistic-psychometrics",
  "education-honors",
  "contact",
]);

const stringArrayRow = (
  items: string[],
  index: number,
  onChange: (next: string) => void,
  onDelete: () => void
) => (
  <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/90 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
    <textarea
      value={items[index]}
      onChange={(event) => onChange(event.target.value)}
      rows={2}
      className="min-h-[54px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
    />
    <button
      type="button"
      onClick={onDelete}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
    >
      <Trash2 className="h-4 w-4" />
      Remove
    </button>
  </div>
);

const StringArrayEditor = ({
  title,
  description,
  items,
  onChange,
  emptyLabel,
  placeholder,
}: {
  title: string;
  description: string;
  items: string[];
  onChange: (next: string[]) => void;
  emptyLabel: string;
  placeholder: string;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${title}-${index}`} className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Item {index + 1}</div>
              {stringArrayRow(
                items,
                index,
                (nextValue) => onChange(items.map((current, currentIndex) => (currentIndex === index ? nextValue : current))),
                () => onChange(items.filter((_, currentIndex) => currentIndex !== index))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{placeholder}</p>
    </section>
  );
};

const ProjectItemsTableEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Project Items</h2>
          <p className="mt-1 text-sm text-muted-foreground">Edit the project item list in a compact table layout.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add row
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/90">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              <tr className="border-b border-border/70 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <th className="w-16 px-4 py-3">#</th>
                <th className="px-4 py-3">Project item</th>
                <th className="w-24 px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${index}-${item}`} className="border-b border-border/60 last:border-b-0 align-top">
                  <td className="px-4 py-3 text-sm font-medium text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3">
                    <textarea
                      value={item}
                      onChange={(event) =>
                        onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))
                      }
                      rows={2}
                      className="min-h-[56px] w-full resize-y rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No project items yet. Add a row to begin.
        </div>
      ) : null}
    </section>
  );
};

const HighlightedCredentialsTableEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Highlighted Credentials</h2>
          <p className="mt-1 text-sm text-muted-foreground">Edit the credential list in a compact table layout.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add row
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/90">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              <tr className="border-b border-border/70 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <th className="w-16 px-4 py-3">#</th>
                <th className="px-4 py-3">Credential</th>
                <th className="w-24 px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${index}-${item}`} className="border-b border-border/60 last:border-b-0 align-top">
                  <td className="px-4 py-3 text-sm font-medium text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3">
                    <textarea
                      value={item}
                      onChange={(event) =>
                        onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))
                      }
                      rows={2}
                      className="min-h-[56px] w-full resize-y rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No highlighted credentials yet. Add a row to begin.
        </div>
      ) : null}
    </section>
  );
};

const ResumePagesEditor = ({
  items,
  onChange,
}: {
  items: ResumePageContent[];
  onChange: (next: ResumePageContent[]) => void;
}) => {
  const [openPage, setOpenPage] = useState<string>(items[0] ? "overview" : "");
  const overviewPage = items[0];
  const jobDescriptionPages = items.filter(
    (page) => page.id !== "overview" && !lockedResumePageIds.has(page.id)
  );
  const lockedPages = items.filter((page) => lockedResumePageIds.has(page.id));

  const handleAddPage = () => {
    const nextPage = createBlankPage(items.length);
    const nextPages = [items[0], nextPage, ...items.slice(1)];

    onChange(nextPages);
    setOpenPage("job-description");
  };

  const handleDeletePage = (pageIndex: number) => {
    const nextPages = items.filter((_, currentIndex) => currentIndex !== pageIndex);
    onChange(nextPages);
    setOpenPage("job-description");
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Resume Pages</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, read, update, and delete the page objects from the resume file.</p>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        value={openPage}
        onValueChange={(value) => setOpenPage(value)}
        className="rounded-2xl border border-border/70 bg-background/90"
      >
        <AccordionItem value="overview" className="px-4">
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
            <div className="min-w-0 text-left">
              {/* <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</div> */}
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Overview</div>
              {/* <div className="mt-1 truncate text-sm text-muted-foreground">Editable values only. No delete action.</div> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            {overviewPage ? (
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview page</p>
                    <p className="text-sm text-muted-foreground">Edit values only. This page cannot be deleted.</p>
                  </div> */}
                  {/* <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Fixed
                  </span> */}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">ID</span>
                    <input
                      value={overviewPage.id}
                      onChange={(event) => onChange(updatePage(items, 0, { id: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      value={overviewPage.title}
                      onChange={(event) => onChange(updatePage(items, 0, { title: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Subtitle</span>
                    <input
                      value={overviewPage.subtitle}
                      onChange={(event) => onChange(updatePage(items, 0, { subtitle: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="job-description" className="px-4">
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
            <div className="min-w-0 text-left">
              {/* <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contents</div> */}
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Job Description</div>
              {/* <div className="mt-1 truncate text-sm text-muted-foreground">Full CRUD for editable job pages.</div> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pages</p>
                  <p className="text-sm text-muted-foreground">Create, read, update, and delete these pages.</p> */}
                </div>
                <button
                  type="button"
                  onClick={handleAddPage}
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
                  aria-label="Add page"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Accordion type="single" collapsible className="space-y-2">
                {jobDescriptionPages.map((page) => {
                  const index = items.findIndex((item) => item === page);
                  const value = `job-${index}`;

                  return (
                    <AccordionItem key={page.id || `job-${index}`} value={value} className="rounded-2xl border border-border/70 bg-background px-4">
                      <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
                        <div className="min-w-0 text-left">
                          <div className="truncate text-lg font-semibold text-foreground">{page.title || "Untitled page"}</div>
                          <div className="mt-1 truncate text-sm text-muted-foreground">{page.subtitle || "No subtitle"}</div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-4 pt-2">
                        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Job page</p>
                              <p className="text-sm text-muted-foreground">Full CRUD is enabled for this page.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeletePage(index)}
                              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">ID</span>
                              <input
                                value={page.id}
                                onChange={(event) => onChange(updatePage(items, index, { id: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Title</span>
                              <input
                                value={page.title}
                                onChange={(event) => onChange(updatePage(items, index, { title: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Subtitle</span>
                              <input
                                value={page.subtitle}
                                onChange={(event) => onChange(updatePage(items, index, { subtitle: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Summary</span>
                              <textarea
                                value={page.summary ?? ""}
                                onChange={(event) => onChange(updatePage(items, index, { summary: event.target.value }))}
                                rows={3}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Body lines</span>
                              <textarea
                                value={joinLines(page.body ?? [])}
                                onChange={(event) => onChange(updatePage(items, index, { body: splitLines(event.target.value) }))}
                                rows={4}
                                placeholder="One line per body entry"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Highlights</span>
                              <textarea
                                value={joinLines(page.highlights ?? [])}
                                onChange={(event) => onChange(updatePage(items, index, { highlights: splitLines(event.target.value) }))}
                                rows={3}
                                placeholder="One highlight per line"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Accent class</span>
                              <input
                                value={page.accent ?? ""}
                                onChange={(event) => onChange(updatePage(items, index, { accent: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Border class</span>
                              <input
                                value={page.borderClass ?? ""}
                                onChange={(event) => onChange(updatePage(items, index, { borderClass: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground md:col-span-2">
                              <input
                                type="checkbox"
                                checked={Boolean(page.noCard)}
                                onChange={(event) => onChange(updatePage(items, index, { noCard: event.target.checked }))}
                                className="h-4 w-4 rounded border-border"
                              />
                              No card layout
                            </label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="locked" className="px-4">
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
            <div className="min-w-0 text-left">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Locked</div>
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Others</div>
              {/* <div className="mt-1 truncate text-sm text-muted-foreground">Read-only page info here.</div> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <Accordion type="single" collapsible className="space-y-2">
                {lockedPages.map((page) => {
                  const index = items.findIndex((item) => item === page);
                  const value = `locked-${index}`;

                  return (
                    <AccordionItem key={page.id || `locked-${index}`} value={value} className="rounded-2xl border border-border/70 bg-background px-4">
                      <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
                        <div className="min-w-0 text-left">
                          <div className="truncate text-lg font-semibold text-foreground">{page.title || "Untitled page"}</div>
                          <div className="mt-1 truncate text-sm text-muted-foreground">{page.subtitle || "No subtitle"}</div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-4 pt-2">
                        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 text-sm text-foreground/90">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">ID</p>
                            <p className="mt-1">{page.id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Title</p>
                            <p className="mt-1 font-medium text-foreground">{page.title}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Subtitle</p>
                            <p className="mt-1 text-muted-foreground">{page.subtitle || "No subtitle"}</p>
                          </div>
                          {page.summary ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Summary</p>
                              <p className="mt-1 leading-relaxed text-foreground/90">{page.summary}</p>
                            </div>
                          ) : null}
                          {page.body?.length ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Body lines</p>
                              <ul className="mt-2 space-y-2">
                                {page.body.map((line) => (
                                  <li key={line} className="rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground/90">
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {page.highlights?.length ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Highlights</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {page.highlights.map((highlight) => (
                                  <span key={highlight} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No resume pages yet. Add a page to begin.
        </div>
      ) : null}
    </section>
  );
};

const ExperienceEditor = ({
  items,
  onChange,
}: {
  items: OtherWorkingExperience[];
  onChange: (next: OtherWorkingExperience[]) => void;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Other Working Experience</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, read, update, and delete the extra experience cards.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, createBlankExperience()])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add experience
        </button>
      </div>

      <div className="space-y-4">
        {items.map((experience, index) => (
          <article key={`${experience.title}-${index}`} className="rounded-3xl border border-border/70 bg-background/90 p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Experience {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{experience.title || "Untitled experience"}</h3>
              </div>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Title</span>
                <input
                  value={experience.title}
                  onChange={(event) => onChange(updateExperience(items, index, { title: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Subtitle</span>
                <input
                  value={experience.subtitle}
                  onChange={(event) => onChange(updateExperience(items, index, { subtitle: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Tags</span>
                <textarea
                  value={joinLines(experience.tags)}
                  onChange={(event) => onChange(updateExperience(items, index, { tags: splitLines(event.target.value) }))}
                  rows={3}
                  placeholder="One tag per line"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const AwardEditor = ({
  items,
  onChange,
}: {
  items: AwardItem[];
  onChange: (next: AwardItem[]) => void;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Honors and Awards</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, read, update, and delete the award entries.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, createBlankAward()])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add award
        </button>
      </div>

      <div className="space-y-4">
        {items.map((award, index) => (
          <article key={`${award.title}-${index}`} className="rounded-3xl border border-border/70 bg-background/90 p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Award {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{award.title || "Untitled award"}</h3>
              </div>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Title</span>
                <input
                  value={award.title}
                  onChange={(event) => onChange(updateAward(items, index, { title: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Issuer</span>
                <input
                  value={award.issuer}
                  onChange={(event) => onChange(updateAward(items, index, { issuer: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">Note</span>
                <textarea
                  value={award.note}
                  onChange={(event) => onChange(updateAward(items, index, { note: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const EducationEditor = ({
  value,
  onChange,
}: {
  value: EducationDetails;
  onChange: (next: EducationDetails) => void;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Education Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Edit the single education record used by the resume.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Institution</span>
          <input
            value={value.institution}
            onChange={(event) => onChange({ ...value, institution: event.target.value })}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Degree</span>
          <input
            value={value.degree}
            onChange={(event) => onChange({ ...value, degree: event.target.value })}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Period</span>
          <input
            value={value.period}
            onChange={(event) => onChange({ ...value, period: event.target.value })}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Grade</span>
          <input
            value={value.grade}
            onChange={(event) => onChange({ ...value, grade: event.target.value })}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-foreground">Focus</span>
          <textarea
            value={value.focus}
            onChange={(event) => onChange({ ...value, focus: event.target.value })}
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
          />
        </label>
      </div>
    </section>
  );
};

const SkillGroupsEditor = <T extends SkillGroups | ToolsGroups>({
  title,
  description,
  value,
  onChange,
  groups,
}: {
  title: string;
  description: string;
  value: T;
  onChange: (next: T) => void;
  groups: Array<{ key: keyof T; label: string }>;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const items = value[group.key] as string[];

          return (
            <label key={String(group.key)} className="space-y-2 rounded-2xl border border-border/70 bg-background/90 p-4">
              <span className="text-sm font-medium text-foreground">{group.label}</span>
              <textarea
                value={joinLines(items)}
                onChange={(event) =>
                  onChange({
                    ...value,
                    [group.key]: splitLines(event.target.value),
                  } as T)
                }
                rows={8}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
              />
              <p className="text-xs text-muted-foreground">One item per line. Empty lines are removed automatically.</p>
            </label>
          );
        })}
      </div>
    </section>
  );
};

const BuilderPanel = ({
  activeSection,
  content,
  setContent,
}: {
  activeSection: SectionId;
  content: ResumeBuilderContent;
  setContent: (next: ResumeBuilderContent) => void;
}) => {
  if (activeSection === "resumePages") {
    return <ResumePagesEditor items={content.resumePages} onChange={(next) => setContent({ ...content, resumePages: next })} />;
  }

  if (activeSection === "projectItems") {
    return (
      <ProjectItemsTableEditor
        items={content.projectItems}
        onChange={(next) => setContent({ ...content, projectItems: next })}
      />
    );
  }

  if (activeSection === "otherWorkingExperiences") {
    return (
      <ExperienceEditor
        items={content.otherWorkingExperiences}
        onChange={(next) => setContent({ ...content, otherWorkingExperiences: next })}
      />
    );
  }

  if (activeSection === "educationDetails") {
    return <EducationEditor value={content.educationDetails} onChange={(next) => setContent({ ...content, educationDetails: next })} />;
  }

  if (activeSection === "honorsAndAwards") {
    return <AwardEditor items={content.honorsAndAwards} onChange={(next) => setContent({ ...content, honorsAndAwards: next })} />;
  }

  if (activeSection === "keySkills") {
    return (
      <SkillGroupsEditor
        title="Key Skills"
        description="Edit each proficiency band with one skill per line."
        value={content.keySkills}
        onChange={(next) => setContent({ ...content, keySkills: next as SkillGroups })}
        groups={[
          { key: "proficient", label: "Proficient" },
          { key: "fluent", label: "Fluent" },
          { key: "entryLevel", label: "Entry-level" },
        ]}
      />
    );
  }

  if (activeSection === "toolsAndEquipment") {
    return (
      <SkillGroupsEditor
        title="Tools and Equipment"
        description="Edit each proficiency band with one tool per line."
        value={content.toolsAndEquipment}
        onChange={(next) => setContent({ ...content, toolsAndEquipment: next as ToolsGroups })}
        groups={[
          { key: "proficient", label: "Proficient" },
          { key: "fluent", label: "Fluent" },
          { key: "entryLevel", label: "Entry-level" },
          { key: "introductory", label: "Introductory" },
        ]}
      />
    );
  }

  return (
    <HighlightedCredentialsTableEditor
      items={content.highlightedCredentials}
      onChange={(next) => setContent({ ...content, highlightedCredentials: next })}
    />
  );
};

const ResumeBuilder = () => {
  const [content, setContent] = useState<ResumeBuilderContent>(() => createResumeBuilderContent());
  const [activeSection, setActiveSection] = useState<SectionId>("resumePages");
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const [isSectionsExpanded, setIsSectionsExpanded] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [builderStatusHeight, setBuilderStatusHeight] = useState(0);
  const builderStatusRef = useRef<HTMLElement | null>(null);
  const editorScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = builderStatusRef.current;

    if (!element) {
      return;
    }

    const updateHeight = () => {
      setBuilderStatusHeight(element.offsetHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isStatusExpanded]);

  const handleReset = () => {
    setContent(createResumeBuilderContent());
    setActiveSection("resumePages");
    toast.success("Builder reset to the current Resume.tsx defaults.");
  };

  const handleGenerate = () => {
    downloadResumeTsx(content);
    setIsNotesOpen(true);
    toast.success("Resume.tsx downloaded.");
  };

  const sectionButtons = sections.map((section) => {
    const active = activeSection === section.id;

    return (
      <button
        key={section.id}
        type="button"
        onClick={() => setActiveSection(section.id)}
        className={classNames(
          "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-foreground hover:bg-muted/40"
        )}
      >
        <div className="text-sm font-semibold">{section.label}</div>
        <div className={classNames("mt-1 text-xs leading-relaxed", active ? "text-background/80" : "text-muted-foreground")}>
          {section.description}
        </div>
      </button>
    );
  });

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10 flex h-screen flex-col overflow-hidden">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <h1 className="text-base font-semibold text-foreground md:text-xl">Resume.tsx Builder (beta)</h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:opacity-90 md:text-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Generate
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto grid h-[calc(100vh-3rem)] min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden px-4 py-6 md:h-[calc(100vh-3.5rem)] lg:grid-cols-[18rem_minmax(0,1fr)] lg:grid-rows-1 lg:py-8">
          <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm max-h-[38vh] overflow-hidden lg:h-full lg:max-h-none">
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sections</p>
                <button
                  type="button"
                  onClick={() => setIsSectionsExpanded((current) => !current)}
                  className="inline-flex items-center text-foreground transition-colors hover:opacity-80 lg:hidden"
                  aria-expanded={isSectionsExpanded}
                  aria-label="Toggle sections"
                >
                  <ChevronDown
                    className={classNames(
                      "h-4 w-4 transition-transform duration-200",
                      isSectionsExpanded ? "rotate-180" : "rotate-0"
                    )}
                  />
                </button>
              </div>

              <nav className="mt-4 hidden flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 lg:block">{sectionButtons}</nav>

              {isSectionsExpanded ? (
                <nav className="mt-4 flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 lg:hidden">{sectionButtons}</nav>
              ) : null}
            </div>
          </aside>

          <div className="relative min-w-0 h-full">
            <section ref={builderStatusRef} className="absolute inset-x-0 top-0 z-20 rounded-3xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setIsStatusExpanded((current) => !current)}
                className="flex w-full items-center justify-between text-left"
                aria-expanded={isStatusExpanded}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Builder status</p>
                <ChevronDown
                  className={classNames(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isStatusExpanded ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              {isStatusExpanded ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="text-sm text-muted-foreground">Editable pages</div>
                    <div className="mt-1 text-2xl font-bold">{content.resumePages.length}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="text-sm text-muted-foreground">Projects</div>
                    <div className="mt-1 text-2xl font-bold">{content.projectItems.length}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="text-sm text-muted-foreground">Credentials</div>
                    <div className="mt-1 text-2xl font-bold">{content.highlightedCredentials.length}</div>
                  </div>
                </div>
              ) : null}
            </section>

            <div ref={editorScrollRef} className="h-full overflow-y-auto pr-1 space-y-6" style={{ paddingTop: `${builderStatusHeight + 24}px` }}>
              <BuilderPanel activeSection={activeSection} content={content} setContent={setContent} />

            </div>
          </div>
        </main>
      </div>

      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generated Resume.tsx downloaded</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              The Generate button downloads a full <span className="font-medium text-foreground">Resume.tsx</span> file.
              It does not write to the workspace or commit anything.
            </p>
            <p>Replace your source file manually after reviewing the download.</p>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsNotesOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeBuilder;
