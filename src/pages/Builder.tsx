import { ChevronDown, Download, Redo2, RotateCcw, Send, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import LinkItemsEditor from "@/components/link-builder/LinkItemsEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createResumeBuilderContent, type ResumeBuilderContent } from "@/data/resumeBuilderContent";
import { createLinkBuilderContent, type LinkBuilderContent } from "@/data/linkBuilderContent";
import { BuilderPanel } from "@/features/resume-builder/BuilderPanel";
import { sections, type SectionId } from "@/features/resume-builder/config";
import { useHistoryState } from "@/hooks/useHistoryState";
import { useResumePublish } from "@/hooks/useResumePublish";
import { useLinkPublish } from "@/hooks/useLinkPublish";
import { buildResumeTsx, downloadResumeTsx, parseResumeContentFromSource } from "@/lib/resumeBuilderGenerator";
import { buildLinksTs, downloadLinksTs, parseLinkBuilderContentFromSource } from "@/lib/linkBuilderGenerator";
import resumeCurrentSource from "@/pages/Resume.tsx?raw";
import linksCurrentSource from "@/data/links.ts?raw";
import { toast } from "sonner";

type ActiveTab = "resume" | "links";

const cx = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");

const publishModeLabels: Record<"used_existing_fork" | "created_new_fork" | "owner_mode_upstream", string> = {
  used_existing_fork: "used existing fork",
  created_new_fork: "created new fork",
  owner_mode_upstream: "owner mode (upstream)",
};

const Builder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: ActiveTab = searchParams.get("tab") === "links" ? "links" : "resume";

  const setActiveTab = (tab: ActiveTab) => {
    setSearchParams(tab === "resume" ? {} : { tab }, { replace: true });
  };

  // ── Resume builder state ─────────────────────────────────────────────────
  const {
    value: resumeContent,
    setWithHistory: setResumeWithHistory,
    undo: resumeUndo,
    redo: resumeRedo,
    reset: resumeReset,
    canUndo: resumeCanUndo,
    canRedo: resumeCanRedo,
  } = useHistoryState<ResumeBuilderContent>(() => {
    const parsed = parseResumeContentFromSource(resumeCurrentSource);
    return parsed ?? createResumeBuilderContent();
  });

  const [resumeActiveSection, setResumeActiveSection] = useState<SectionId>("resumePages");
  const [resumeIsStatusExpanded, setResumeIsStatusExpanded] = useState(false);
  const [resumeIsSectionsExpanded, setResumeIsSectionsExpanded] = useState(false);
  const [resumeIsNotesOpen, setResumeIsNotesOpen] = useState(false);
  const [resumeIsOnboardingOpen, setResumeIsOnboardingOpen] = useState(true);
  const [resumeIsPublishOpen, setResumeIsPublishOpen] = useState(false);
  const [resumePublishToken, setResumePublishToken] = useState("");
  const [resumeBuilderStatusHeight, setResumeBuilderStatusHeight] = useState(0);
  const resumeBuilderStatusRef = useRef<HTMLElement | null>(null);
  const resumeEditorScrollRef = useRef<HTMLDivElement | null>(null);

  const {
    state: resumePublishState,
    error: resumePublishError,
    result: resumePublishResult,
    statusLabel: resumePublishStatusLabel,
    publish: resumePublish,
    reset: resumeResetPublish,
  } = useResumePublish();

  const isResumePublishing =
    resumePublishState === "validating" ||
    resumePublishState === "preparing" ||
    resumePublishState === "committing";

  useEffect(() => {
    const element = resumeBuilderStatusRef.current;
    if (!element) return;

    const updateHeight = () => setResumeBuilderStatusHeight(element.offsetHeight);
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [resumeIsStatusExpanded]);

  useEffect(() => {
    if (activeTab === "resume") {
      const element = resumeBuilderStatusRef.current;
      if (element) setResumeBuilderStatusHeight(element.offsetHeight);
    }
  }, [activeTab]);

  const handleResumeGenerate = () => {
    downloadResumeTsx(resumeContent, resumeCurrentSource);
    setResumeIsNotesOpen(true);
    toast.success("Resume.tsx downloaded.");
  };

  const handleResumeReset = () => {
    resumeReset(createResumeBuilderContent());
    setResumeActiveSection("resumePages");
    toast.success("Builder reset to the current Resume.tsx defaults.");
  };

  const handleResumePublish = async () => {
    const token = resumePublishToken.trim();
    if (!token) { toast.error("Enter a GitHub token before publishing."); return; }
    const generatedSource = buildResumeTsx(resumeContent, resumeCurrentSource);
    const outcome = await resumePublish(token, generatedSource);
    setResumePublishToken("");
    if (outcome) toast.success("Publish completed and deployment started.");
    else toast.error("Publish failed. Review details in the dialog.");
  };

  const handleResumePublishDialogChange = (open: boolean) => {
    setResumeIsPublishOpen(open);
    if (!open) { setResumePublishToken(""); resumeResetPublish(); }
  };

  const resumeSectionButtons = sections.map((section) => {
    const active = resumeActiveSection === section.id;
    return (
      <button
        key={section.id}
        type="button"
        onClick={() => setResumeActiveSection(section.id)}
        className={cx(
          "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-foreground hover:bg-muted/40"
        )}
      >
        <div className="text-sm font-semibold">{section.label}</div>
        <div className={cx("mt-1 text-xs leading-relaxed", active ? "text-background/80" : "text-muted-foreground")}>
          {section.description}
        </div>
      </button>
    );
  });

  // ── Links builder state ──────────────────────────────────────────────────
  const {
    value: linksContent,
    setWithHistory: setLinksWithHistory,
    undo: linksUndo,
    redo: linksRedo,
    reset: linksReset,
    canUndo: linksCanUndo,
    canRedo: linksCanRedo,
  } = useHistoryState<LinkBuilderContent>(() => {
    const parsed = parseLinkBuilderContentFromSource(linksCurrentSource);
    return parsed ?? createLinkBuilderContent();
  });

  const [linksIsOnboardingOpen, setLinksIsOnboardingOpen] = useState(true);
  const [linksIsGeneratedNotesOpen, setLinksIsGeneratedNotesOpen] = useState(false);
  const [linksIsPublishOpen, setLinksIsPublishOpen] = useState(false);
  const [linksPublishToken, setLinksPublishToken] = useState("");
  const linksContentRef = useRef(linksContent);

  const {
    state: linksPublishState,
    error: linksPublishError,
    result: linksPublishResult,
    statusLabel: linksPublishStatusLabel,
    publish: linksPublish,
    reset: linksResetPublish,
  } = useLinkPublish();

  const isLinksPublishing =
    linksPublishState === "validating" ||
    linksPublishState === "preparing" ||
    linksPublishState === "committing";

  useEffect(() => {
    linksContentRef.current = linksContent;
  }, [linksContent]);

  const updateLinksContent = (updater: (current: LinkBuilderContent) => LinkBuilderContent) => {
    setLinksWithHistory((current) => {
      const next = updater(current);
      linksContentRef.current = next;
      return next;
    });
  };

  const handleLinksGenerate = () => {
    downloadLinksTs(linksContentRef.current);
    setLinksIsGeneratedNotesOpen(true);
    toast.success("links.ts downloaded.");
  };

  const handleLinksReset = () => {
    linksReset(createLinkBuilderContent());
    toast.success("Builder reset to the current links.ts defaults.");
  };

  const handleLinksPublish = async () => {
    const token = linksPublishToken.trim();
    if (!token) { toast.error("Enter a GitHub token before publishing."); return; }
    const generatedSource = buildLinksTs(linksContentRef.current);
    const outcome = await linksPublish(token, generatedSource);
    setLinksPublishToken("");
    if (outcome) toast.success("Publish completed and PR is ready.");
    else toast.error("Publish failed. Review details in the dialog.");
  };

  const handleLinksPublishDialogChange = (open: boolean) => {
    setLinksIsPublishOpen(open);
    if (!open) { setLinksPublishToken(""); linksResetPublish(); }
  };

  // ── Shared toolbar controls per tab ──────────────────────────────────────
  const resumeControls = (
    <>
      <button type="button" onClick={resumeUndo} disabled={!resumeCanUndo}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Undo" title="Undo">
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={resumeRedo} disabled={!resumeCanRedo}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Redo" title="Redo">
        <Redo2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={handleResumeReset}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm">
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
      <button type="button" onClick={handleResumeGenerate}
        className="inline-flex items-center gap-1.5 rounded-xl border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:opacity-90 md:text-sm">
        <Download className="h-3.5 w-3.5" /> Generate
      </button>
      <button type="button" onClick={() => setResumeIsPublishOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm">
        <Send className="h-3.5 w-3.5" /> Publish
      </button>
    </>
  );

  const linksControls = (
    <>
      <button type="button" onClick={linksUndo} disabled={!linksCanUndo}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Undo" title="Undo">
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={linksRedo} disabled={!linksCanRedo}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Redo" title="Redo">
        <Redo2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={handleLinksReset}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm">
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
      <button type="button" onClick={handleLinksGenerate}
        className="inline-flex items-center gap-1.5 rounded-xl border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:opacity-90 md:text-sm">
        <Download className="h-3.5 w-3.5" /> Generate
      </button>
      <button type="button" onClick={() => setLinksIsPublishOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm">
        <Send className="h-3.5 w-3.5" /> Publish
      </button>
    </>
  );

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10 flex h-screen flex-col overflow-hidden">

        {/* ── Shared header ─────────────────────────────────────── */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">

            {/* Tab toggle */}
            <div className="flex items-center rounded-xl border border-border bg-muted/40 p-0.5 text-sm shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("resume")}
                className={cx(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-colors md:text-sm",
                  activeTab === "resume"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("links")}
                className={cx(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-colors md:text-sm",
                  activeTab === "links"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Links
              </button>
            </div>

            {/* Active tab controls */}
            <div className="flex items-center gap-2">
              {activeTab === "resume" ? resumeControls : linksControls}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Content area ──────────────────────────────────────── */}
        <div className="relative flex-1 min-h-0">

          {/* Resume builder */}
          <div className={cx("absolute inset-0 overflow-hidden", activeTab !== "resume" && "hidden")}>
            <main className="container mx-auto grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden px-4 py-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:grid-rows-1 lg:py-8">

              <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm max-h-[38vh] overflow-hidden lg:h-full lg:max-h-none">
                <div className="flex h-full min-h-0 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sections</p>
                    <button
                      type="button"
                      onClick={() => setResumeIsSectionsExpanded((v) => !v)}
                      className="inline-flex items-center text-foreground transition-colors hover:opacity-80 lg:hidden"
                      aria-expanded={resumeIsSectionsExpanded}
                      aria-label="Toggle sections"
                    >
                      <ChevronDown className={cx("h-4 w-4 transition-transform duration-200", resumeIsSectionsExpanded ? "rotate-180" : "rotate-0")} />
                    </button>
                  </div>
                  <nav className="mt-4 hidden flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 lg:block">{resumeSectionButtons}</nav>
                  {resumeIsSectionsExpanded && (
                    <nav className="mt-4 flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 lg:hidden">{resumeSectionButtons}</nav>
                  )}
                </div>
              </aside>

              <div className="relative min-w-0 h-full">
                <section ref={resumeBuilderStatusRef} className="absolute inset-x-0 top-0 z-20 rounded-3xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setResumeIsStatusExpanded((v) => !v)}
                    className="flex w-full items-center justify-between text-left"
                    aria-expanded={resumeIsStatusExpanded}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Builder status</p>
                    <ChevronDown className={cx("h-4 w-4 text-muted-foreground transition-transform duration-200", resumeIsStatusExpanded ? "rotate-180" : "rotate-0")} />
                  </button>
                  {resumeIsStatusExpanded && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <div className="text-sm text-muted-foreground">Editable pages</div>
                        <div className="mt-1 text-2xl font-bold">{resumeContent.resumePages.length}</div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <div className="text-sm text-muted-foreground">Projects</div>
                        <div className="mt-1 text-2xl font-bold">{resumeContent.projectItems.length}</div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <div className="text-sm text-muted-foreground">Credentials</div>
                        <div className="mt-1 text-2xl font-bold">{resumeContent.highlightedCredentials.length}</div>
                      </div>
                    </div>
                  )}
                </section>

                <div ref={resumeEditorScrollRef} className="h-full overflow-y-auto pr-1 space-y-6" style={{ paddingTop: `${resumeBuilderStatusHeight + 24}px` }}>
                  <BuilderPanel activeSection={resumeActiveSection} content={resumeContent} setContent={(next) => setResumeWithHistory(next)} />
                </div>
              </div>

            </main>
          </div>

          {/* Links builder */}
          <div className={cx("absolute inset-0 overflow-hidden", activeTab !== "links" && "hidden")}>
            <main className="container mx-auto grid h-full min-h-0 gap-6 overflow-hidden px-4 py-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:py-8">

              <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sections</p>
                <nav className="mt-4 space-y-2">
                  <button type="button" className="w-full rounded-2xl border border-foreground bg-foreground px-4 py-3 text-left text-background transition-colors">
                    <div className="text-sm font-semibold">Links</div>
                    <div className="mt-1 text-xs leading-relaxed text-background/80">Full CRUD and reorder for all link cards.</div>
                  </button>
                </nav>
              </aside>

              <div className="min-w-0 overflow-y-auto pr-1">
                <LinkItemsEditor
                  links={linksContent.links}
                  onChange={(next) => updateLinksContent((current) => ({ ...current, links: next }))}
                />
              </div>

            </main>
          </div>

        </div>
      </div>

      {/* ── Resume dialogs ────────────────────────────────────────── */}
      <Dialog open={resumeIsNotesOpen} onOpenChange={setResumeIsNotesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Generated Resume.tsx downloaded</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>The Generate button downloads a full <span className="font-medium text-foreground">Resume.tsx</span> file. It does not write to the workspace or commit anything.</p>
            <p>Replace your source file manually after reviewing the download.</p>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setResumeIsNotesOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card">
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resumeIsPublishOpen} onOpenChange={handleResumePublishDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish Resume.tsx to GitHub</DialogTitle>
            <DialogDescription>
              This flow uses your fork when available, creates one automatically when needed, and falls back to the existing repository when the token belongs to the upstream owner. It commits directly to the deployment branch so CI/CD starts immediately without a merge step. The token is used in-memory only and cleared when this dialog closes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">GitHub personal access token</span>
              <Input type="password" autoComplete="off" spellCheck={false} value={resumePublishToken}
                onChange={(e) => setResumePublishToken(e.target.value)} placeholder="ghp_..." disabled={isResumePublishing} />
            </label>
            {resumePublishStatusLabel && <p className="text-sm text-muted-foreground">{resumePublishStatusLabel}</p>}
            {resumePublishError && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground">
                <p className="font-medium">{resumePublishError.message}</p>
                {resumePublishError.details && <p className="mt-1 text-muted-foreground">{resumePublishError.details}</p>}
                {resumePublishError.code === "network_or_cors" && (
                  <p className="mt-2 text-muted-foreground">Fallback: use Generate to download Resume.tsx, commit it to your fork manually, then open a pull request.</p>
                )}
              </div>
            )}
            {resumePublishResult && (
              <div className="rounded-2xl border border-border/70 bg-background p-3 text-sm">
                <p className="font-medium text-foreground">Publish complete</p>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">{publishModeLabels[resumePublishResult.publishMode]}</span>
                </div>
                <p className="mt-1 text-muted-foreground">Fork: {resumePublishResult.fork.fullName}</p>
                <p className="mt-1 text-muted-foreground">Branch: {resumePublishResult.branch}</p>
                <p className="mt-1 text-muted-foreground">Deployment has been triggered automatically from this publish.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={resumePublishResult.commitUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm">
                    View commit
                  </a>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <button type="button" onClick={() => handleResumePublishDialogChange(false)} disabled={isResumePublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60">
              Close
            </button>
            <button type="button" onClick={handleResumePublish} disabled={isResumePublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {isResumePublishing ? "Publishing..." : "Publish to GitHub"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resumeIsOnboardingOpen && activeTab === "resume"} onOpenChange={setResumeIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Resume Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your resume page.</DialogDescription>
          </DialogHeader>
          <ol className="space-y-2 pl-5 text-sm leading-relaxed text-foreground/90 list-decimal">
            <li>Edit your resume content in this builder.</li>
            <li>Use Generate to download Resume.tsx for manual workflows.</li>
            <li>Use Publish to send generated Resume.tsx to GitHub directly.</li>
            <li>Publish auto-detects your fork, creates one if needed, or uses upstream owner mode.</li>
            <li>Publish commits directly to the deployment branch and triggers CI/CD immediately.</li>
          </ol>
          <DialogFooter>
            <button type="button" onClick={() => setResumeIsOnboardingOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card">
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Links dialogs ─────────────────────────────────────────── */}
      <Dialog open={linksIsGeneratedNotesOpen} onOpenChange={setLinksIsGeneratedNotesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generated links.ts downloaded</DialogTitle>
            <DialogDescription>Replace your source links data file manually after reviewing the download.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setLinksIsGeneratedNotesOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card">
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linksIsPublishOpen} onOpenChange={handleLinksPublishDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish links.ts to GitHub</DialogTitle>
            <DialogDescription>
              This flow uses your fork when available, creates one automatically when needed, and falls back to the existing repository when the token belongs to the upstream owner. It commits directly to the deployment branch so CI/CD starts immediately without a merge step. The token is used in-memory only and cleared when this dialog closes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">GitHub personal access token</span>
              <Input type="password" autoComplete="off" spellCheck={false} value={linksPublishToken}
                onChange={(e) => setLinksPublishToken(e.target.value)} placeholder="ghp_..." disabled={isLinksPublishing} />
            </label>
            {linksPublishStatusLabel && <p className="text-sm text-muted-foreground">{linksPublishStatusLabel}</p>}
            {linksPublishError && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground">
                <p className="font-medium">{linksPublishError.message}</p>
                {linksPublishError.details && <p className="mt-1 text-muted-foreground">{linksPublishError.details}</p>}
                {linksPublishError.code === "network_or_cors" && (
                  <p className="mt-2 text-muted-foreground">Fallback: use Generate to download links.ts, commit it to your fork manually, then open a pull request.</p>
                )}
              </div>
            )}
            {linksPublishResult && (
              <div className="rounded-2xl border border-border/70 bg-background p-3 text-sm">
                <p className="font-medium text-foreground">Publish complete</p>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">{publishModeLabels[linksPublishResult.publishMode]}</span>
                </div>
                <p className="mt-1 text-muted-foreground">Fork: {linksPublishResult.fork.fullName}</p>
                <p className="mt-1 text-muted-foreground">Branch: {linksPublishResult.branch}</p>
                <p className="mt-1 text-muted-foreground">Deployment has been triggered automatically from this publish.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={linksPublishResult.commitUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm">
                    View commit
                  </a>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <button type="button" onClick={() => handleLinksPublishDialogChange(false)} disabled={isLinksPublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60">
              Close
            </button>
            <button type="button" onClick={handleLinksPublish} disabled={isLinksPublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {isLinksPublishing ? "Publishing..." : "Publish to GitHub"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linksIsOnboardingOpen && activeTab === "links"} onOpenChange={setLinksIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Link Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your own links page.</DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li>Edit your links content in this builder.</li>
            <li>Use Generate to download links.ts for manual workflows.</li>
            <li>Use Publish to send generated links.ts to GitHub directly.</li>
            <li>Publish auto-detects your fork, creates one if needed, or uses upstream owner mode.</li>
            <li>Publish commits directly to the deployment branch and triggers CI/CD immediately.</li>
          </ol>
          <DialogFooter>
            <button type="button" onClick={() => setLinksIsOnboardingOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card">
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Builder;
