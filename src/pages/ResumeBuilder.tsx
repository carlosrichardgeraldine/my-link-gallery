import { ChevronDown, Download, Plus, Redo2, RotateCcw, Trash2, Undo2 } from "lucide-react";
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
  type ResumeBuilderContent,
} from "@/data/resumeBuilderContent";
import { BuilderPanel } from "@/features/resume-builder/BuilderPanel";
import { sections, type SectionId } from "@/features/resume-builder/config";
import { useHistoryState } from "@/hooks/useHistoryState";
import { downloadResumeTsx, parseResumeContentFromSource } from "@/lib/resumeBuilderGenerator";
import resumeCurrentSource from "@/pages/Resume.tsx?raw";
import { toast } from "sonner";

const classNames = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");

const ResumeBuilder = () => {
  const {
    value: content,
    setWithHistory,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useHistoryState<ResumeBuilderContent>(() => {
    const parsed = parseResumeContentFromSource(resumeCurrentSource);
    return parsed ?? createResumeBuilderContent();
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
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

  const updateContent = (nextContent: ResumeBuilderContent) => {
    setWithHistory(nextContent);
  };

  const handleReset = () => {
    reset(createResumeBuilderContent());
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
                onClick={undo}
                disabled={!canUndo}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Undo changes"
                title="Undo changes"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Redo changes"
                title="Redo changes"
              >
                <Redo2 className="h-4 w-4" />
              </button>
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
              <BuilderPanel activeSection={activeSection} content={content} setContent={updateContent} />

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

      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Resume Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your resume page.</DialogDescription>
          </DialogHeader>

          <ol className="space-y-2 pl-5 text-sm leading-relaxed text-foreground/90 list-decimal">
            <li>Clone the git repo.</li>
            <li>Customize the Resume.tsx.</li>
            <li>Locate and replace the Resume.tsx.</li>
            <li>Run the web app locally.</li>
            <li>Or deploy it to static web app hosting.</li>
          </ol>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeBuilder;
