import { Download, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LinkItemsEditor from "@/components/link-builder/LinkItemsEditor";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createLinkBuilderContent, type LinkBuilderContent } from "@/data/linkBuilderContent";
import { useHistoryState } from "@/hooks/useHistoryState";
import { downloadLinksTs, parseLinkBuilderContentFromSource } from "@/lib/linkBuilderGenerator";
import linksCurrentSource from "@/data/links.ts?raw";
import { toast } from "sonner";

const LinkBuilder = () => {
  const {
    value: content,
    setWithHistory,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useHistoryState<LinkBuilderContent>(() => {
    const parsed = parseLinkBuilderContentFromSource(linksCurrentSource);
    return parsed ?? createLinkBuilderContent();
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isGeneratedNotesOpen, setIsGeneratedNotesOpen] = useState(false);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const updateContent = (updater: (current: LinkBuilderContent) => LinkBuilderContent) => {
    setWithHistory((current) => {
      const nextContent = updater(current);
      contentRef.current = nextContent;
      return nextContent;
    });
  };

  const handleGenerate = () => {
    downloadLinksTs(contentRef.current);
    setIsGeneratedNotesOpen(true);
    toast.success("links.ts downloaded.");
  };

  const handleReset = () => {
    reset(createLinkBuilderContent());
    toast.success("Builder reset to the current links.ts defaults.");
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10 flex h-screen flex-col overflow-hidden">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <h1 className="text-base font-semibold text-foreground md:text-xl">Links.ts Builder (beta)</h1>

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

        <main className="container mx-auto grid h-[calc(100vh-3rem)] min-h-0 flex-1 gap-6 overflow-hidden px-4 py-6 md:h-[calc(100vh-3.5rem)] lg:grid-cols-[18rem_minmax(0,1fr)] lg:py-8">
          <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sections</p>

            <nav className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => undefined}
                className="w-full rounded-2xl border border-foreground bg-foreground px-4 py-3 text-left text-background transition-colors"
              >
                <div className="text-sm font-semibold">Links</div>
                <div className="mt-1 text-xs leading-relaxed text-background/80">Full CRUD and reorder for all link cards.</div>
              </button>
            </nav>
          </aside>

          <div className="min-w-0 overflow-y-auto pr-1">
            <LinkItemsEditor links={content.links} onChange={(next) => updateContent((current) => ({ ...current, links: next }))} />
          </div>
        </main>
      </div>

      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Link Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your own links page.</DialogDescription>
          </DialogHeader>

          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li>Clone the git repo.</li>
            <li>Customize the links.ts file.</li>
            <li>Locate and replace the links.ts file in your project.</li>
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

      <Dialog open={isGeneratedNotesOpen} onOpenChange={setIsGeneratedNotesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generated links.ts downloaded</DialogTitle>
            <DialogDescription>
              Replace your source links data file manually after reviewing the download.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsGeneratedNotesOpen(false)}
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

export default LinkBuilder;
