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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [resumeIsOnboardingOpen, setResumeIsOnboardingOpen] = useState(true);
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
    return () => { resizeObserver.disconnect(); window.removeEventListener("resize", updateHeight); };
  }, [resumeIsStatusExpanded]);

  useEffect(() => {
    if (activeTab === "resume") {
      const element = resumeBuilderStatusRef.current;
      if (element) setResumeBuilderStatusHeight(element.offsetHeight);
    }
  }, [activeTab]);

  const handleResumeReset = () => {
    resumeReset(createResumeBuilderContent());
    setResumeActiveSection("resumePages");
    toast.success("Builder reset to the current Resume.tsx defaults.");
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

  const handleLinksReset = () => {
    linksReset(createLinkBuilderContent());
    toast.success("Builder reset to the current links.ts defaults.");
  };

  // ── Shared: Generate dropdown ────────────────────────────────────────────
  const handleDownloadResume = () => {
    downloadResumeTsx(resumeContent, resumeCurrentSource);
    toast.success("Resume.tsx downloaded.");
  };

  const handleDownloadLinks = () => {
    downloadLinksTs(linksContentRef.current);
    toast.success("links.ts downloaded.");
  };

  // ── Shared: Combined publish ──────────────────────────────────────────────
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishToken, setPublishToken] = useState("");

  const isPublishing = isResumePublishing || isLinksPublishing;

  const handlePublishDialogChange = (open: boolean) => {
    setIsPublishOpen(open);
    if (!open) {
      setPublishToken("");
      resumeResetPublish();
      linksResetPublish();
    }
  };

  const handleCombinedPublish = async () => {
    const token = publishToken.trim();
    if (!token) { toast.error("Enter a GitHub token before publishing."); return; }

    const resumeSource = buildResumeTsx(resumeContent, resumeCurrentSource);
    const linksSource = buildLinksTs(linksContentRef.current);

    const [resumeOutcome, linksOutcome] = await Promise.allSettled([
      resumePublish(token, resumeSource),
      linksPublish(token, linksSource),
    ]);

    setPublishToken("");

    const resumeOk = resumeOutcome.status === "fulfilled" && resumeOutcome.value !== null;
    const linksOk = linksOutcome.status === "fulfilled" && linksOutcome.value !== null;

    if (resumeOk && linksOk) toast.success("Both files published successfully.");
    else if (resumeOk) toast.warning("Resume.tsx published, but links.ts failed.");
    else if (linksOk) toast.warning("links.ts published, but Resume.tsx failed.");
    else toast.error("Both publishes failed. Review details in the dialog.");
  };

  // ── Shared toolbar ────────────────────────────────────────────────────────
  const generateDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:opacity-90 md:text-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Generate
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem onClick={handleDownloadResume}>
          Download Resume.tsx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadLinks}>
          Download links.ts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const publishButton = (
    <button
      type="button"
      onClick={() => setIsPublishOpen(true)}
      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
    >
      <Send className="h-3.5 w-3.5" />
      Publish
    </button>
  );

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
      {generateDropdown}
      {publishButton}
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
      {generateDropdown}
      {publishButton}
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

      {/* ── Combined publish dialog ───────────────────────────────── */}
      <Dialog open={isPublishOpen} onOpenChange={handlePublishDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish to GitHub</DialogTitle>
            <DialogDescription>
              Publishes both <span className="font-medium text-foreground">Resume.tsx</span> and <span className="font-medium text-foreground">links.ts</span> to your fork simultaneously. The token is used in-memory only and cleared when this dialog closes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">GitHub personal access token</span>
              <Input
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={publishToken}
                onChange={(e) => setPublishToken(e.target.value)}
                placeholder="ghp_..."
                disabled={isPublishing}
              />
            </label>

            {/* Resume status */}
            {(resumePublishState !== "idle" || resumePublishError || resumePublishResult) && (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resume.tsx</p>
                {resumePublishStatusLabel && <p className="text-sm text-muted-foreground">{resumePublishStatusLabel}</p>}
                {resumePublishError && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm">
                    <p className="font-medium text-foreground">{resumePublishError.message}</p>
                    {resumePublishError.details && <p className="mt-1 text-muted-foreground">{resumePublishError.details}</p>}
                    {resumePublishError.code === "network_or_cors" && (
                      <p className="mt-2 text-muted-foreground">Use Generate → Download Resume.tsx to get the file manually.</p>
                    )}
                  </div>
                )}
                {resumePublishResult && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground">
                        {publishModeLabels[resumePublishResult.publishMode]}
                      </span>
                      <span className="text-muted-foreground text-xs">Branch: {resumePublishResult.branch}</span>
                    </div>
                    <a href={resumePublishResult.commitUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-card">
                      View commit
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Links status */}
            {(linksPublishState !== "idle" || linksPublishError || linksPublishResult) && (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">links.ts</p>
                {linksPublishStatusLabel && <p className="text-sm text-muted-foreground">{linksPublishStatusLabel}</p>}
                {linksPublishError && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm">
                    <p className="font-medium text-foreground">{linksPublishError.message}</p>
                    {linksPublishError.details && <p className="mt-1 text-muted-foreground">{linksPublishError.details}</p>}
                    {linksPublishError.code === "network_or_cors" && (
                      <p className="mt-2 text-muted-foreground">Use Generate → Download links.ts to get the file manually.</p>
                    )}
                  </div>
                )}
                {linksPublishResult && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground">
                        {publishModeLabels[linksPublishResult.publishMode]}
                      </span>
                      <span className="text-muted-foreground text-xs">Branch: {linksPublishResult.branch}</span>
                    </div>
                    <a href={linksPublishResult.commitUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-card">
                      View commit
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <button type="button" onClick={() => handlePublishDialogChange(false)} disabled={isPublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60">
              Close
            </button>
            <button type="button" onClick={handleCombinedPublish} disabled={isPublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {isPublishing ? "Publishing..." : "Publish Both to GitHub"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Resume onboarding ─────────────────────────────────────── */}
      <Dialog open={resumeIsOnboardingOpen && activeTab === "resume"} onOpenChange={setResumeIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Resume Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your resume page.</DialogDescription>
          </DialogHeader>
          <ol className="space-y-2 pl-5 text-sm leading-relaxed text-foreground/90 list-decimal">
            <li>Edit your resume content in this builder.</li>
            <li>Use <span className="font-medium text-foreground">Generate → Download Resume.tsx</span> to download the file manually.</li>
            <li>Use <span className="font-medium text-foreground">Publish</span> to send both files to GitHub directly at once.</li>
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

      {/* ── Links onboarding ──────────────────────────────────────── */}
      <Dialog open={linksIsOnboardingOpen && activeTab === "links"} onOpenChange={setLinksIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Link Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your own links page.</DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li>Edit your links content in this builder.</li>
            <li>Use <span className="font-medium text-foreground">Generate → Download links.ts</span> to download the file manually.</li>
            <li>Use <span className="font-medium text-foreground">Publish</span> to send both files to GitHub directly at once.</li>
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
