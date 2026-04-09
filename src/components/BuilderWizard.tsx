import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WizardPath = "first-time" | "returning";
type WizardPage = "choice" | "pat-setup" | "pat-next" | "returning";

interface StepProps {
  number: number;
  text: React.ReactNode;
}

const Step = ({ number, text }: StepProps) => (
  <li className="flex gap-3">
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
      {number}
    </span>
    <span className="text-sm leading-relaxed text-foreground/85">{text}</span>
  </li>
);

const SubStep = ({ letter, text }: { letter: string; text: React.ReactNode }) => (
  <li className="flex gap-2 pl-4">
    <span className="mt-0.5 shrink-0 text-xs font-semibold text-muted-foreground">{letter}.</span>
    <span className="text-sm leading-relaxed text-foreground/80">{text}</span>
  </li>
);

interface BuilderWizardProps {
  open: boolean;
  onClose: () => void;
}

const BuilderWizard = ({ open, onClose }: BuilderWizardProps) => {
  const [page, setPage] = useState<WizardPage>("choice");
  const [_path, setPath] = useState<WizardPath | null>(null);

  const handleChoice = (path: WizardPath) => {
    setPath(path);
    setPage(path === "first-time" ? "pat-setup" : "returning");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setTimeout(() => {
        setPage("choice");
        setPath(null);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Choice page ──────────────────────────────────────── */}
        {page === "choice" && (
          <>
            <DialogHeader>
              <DialogTitle>Welcome to the Builder</DialogTitle>
              <DialogDescription>
                How would you like to get started?
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              <button
                type="button"
                onClick={() => handleChoice("first-time")}
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-left transition-colors hover:bg-muted/40 hover:border-foreground/40"
              >
                <p className="text-sm font-semibold text-foreground">Setting up for the first time</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  I don't have a fork yet. Walk me through creating a GitHub token, editing my content, publishing, and deploying to Azure.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleChoice("returning")}
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-left transition-colors hover:bg-muted/40 hover:border-foreground/40"
              >
                <p className="text-sm font-semibold text-foreground">Already set up — just editing</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  I already have a forked repo and Azure Static Web Apps connected. I'm here to update my content.
                </p>
              </button>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                Skip
              </button>
            </DialogFooter>
          </>
        )}

        {/* ── First-timer: GitHub PAT setup (steps 1–11) ────────── */}
        {page === "pat-setup" && (
          <>
            <DialogHeader>
              <DialogTitle>Step 1 of 2 — Create a GitHub Token</DialogTitle>
              <DialogDescription>
                You'll need a fine-grained Personal Access Token (PAT) to publish your changes to GitHub.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1">
              <ol className="space-y-4 py-2">
                <Step number={1} text={<>Go to <span className="font-medium text-foreground">GitHub</span>, click your profile icon at the top-right, then select <span className="font-medium text-foreground">Settings</span>.</>} />
                <Step number={2} text={<>Scroll down the left menu to <span className="font-medium text-foreground">Developer settings</span>.</>} />
                <Step number={3} text={<>Select <span className="font-medium text-foreground">Personal access tokens</span> then <span className="font-medium text-foreground">Fine-grained tokens</span>.</>} />
                <Step number={4} text={<>Click <span className="font-medium text-foreground">Generate new token</span>.</>} />
                <Step number={5} text={<>Give it a clear name, e.g. <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">My Links Gallery Publishing Token</span>.</>} />
                <Step number={6} text={<>Choose an expiration date. GitHub recommends not using <em>No expiration</em>.</>} />
                <Step number={7} text={<>Select your <span className="font-medium text-foreground">personal account</span> as the Resource Owner.</>} />
                <Step number={8} text={<>Choose <span className="font-medium text-foreground">Only select repositories</span>, then pick the repo you just forked — <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">yourusername/my-links-gallery</span>.</>} />
                <Step number={9} text={<>Set the following Required Permissions:</>} />
                <ul className="space-y-1.5 pl-4">
                  <SubStep letter="a" text={<><span className="font-medium text-foreground">Contents</span> — set to Read &amp; Write</>} />
                  <SubStep letter="b" text={<><span className="font-medium text-foreground">Pull requests</span> — set to Read &amp; Write</>} />
                  <SubStep letter="c" text={<><span className="font-medium text-foreground">Issues</span> — set to Read &amp; Write</>} />
                </ul>
                <Step number={10} text={<>Scroll down and click <span className="font-medium text-foreground">Generate token</span>.</>} />
                <Step number={11} text={<>Copy the token immediately to a notepad or password manager — GitHub will <span className="font-medium text-foreground">not show it again</span>.</>} />
              </ol>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <button
                type="button"
                onClick={() => setPage("choice")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setPage("pat-next")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </DialogFooter>
          </>
        )}

        {/* ── First-timer: Edit & publish (steps 12–13) ─────────── */}
        {page === "pat-next" && (
          <>
            <DialogHeader>
              <DialogTitle>Step 2 of 2 — Edit &amp; Publish</DialogTitle>
              <DialogDescription>
                Now that you have your token, customize your content and publish to GitHub.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1">
              <ol className="space-y-4 py-2" start={12}>
                <Step number={12} text={<>Go back to the builder and edit all your details — fill in your <span className="font-medium text-foreground">resume</span> and your <span className="font-medium text-foreground">links</span>.</>} />
                <Step number={13} text={<>Click <span className="font-medium text-foreground">Publish</span> and enter the GitHub PAT you just created. The publisher will automatically fork the repo and commit your changes.</>} />
              </ol>

              <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">After publishing</p>
                <p className="mt-1 text-sm text-foreground/80">
                  Once you click <span className="font-medium text-foreground">Publish to GitHub</span> and it succeeds, you'll see step-by-step instructions for deploying your site to Azure Static Web Apps directly in the publish dialog.
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <button
                type="button"
                onClick={() => setPage("pat-setup")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" />
                Got it — Go to Builder
              </button>
            </DialogFooter>
          </>
        )}

        {/* ── Returning user ─────────────────────────────────────── */}
        {page === "returning" && (
          <>
            <DialogHeader>
              <DialogTitle>Update Your Content</DialogTitle>
              <DialogDescription>
                Since your repo and deployment are already set up, here's all you need to do.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1">
              <ol className="space-y-4 py-2">
                <Step number={1} text={<>Visit your own published page to see your current live content.</>} />
                <Step number={2} text={<>Come back to this builder.</>} />
                <Step number={3} text={<>Edit your details — update your <span className="font-medium text-foreground">resume</span> and your <span className="font-medium text-foreground">links</span> as needed.</>} />
                <Step number={4} text={<>Click <span className="font-medium text-foreground">Publish</span> and enter the GitHub PAT you created for the account with the forked repo.</>} />
                <Step number={5} text={<>The publisher will automatically commit the changes to your fork.</>} />
                <Step number={6} text={<>Since CI/CD is already set up by Azure, just wait a few minutes for your site to update.</>} />
              </ol>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <button
                type="button"
                onClick={() => setPage("choice")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" />
                Got it — Go to Builder
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuilderWizard;

export const AzureDeploySteps = () => (
  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-3">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next step — Deploy to Azure</p>
      <p className="mt-1 text-xs text-muted-foreground">Follow these steps to host your site for free on Azure Static Web Apps.</p>
    </div>
    <ol className="space-y-2.5">
      {[
        <>Make sure you have an Azure account. If not, register for the <a href="https://azure.microsoft.com/en-us/free" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-foreground underline underline-offset-2 hover:opacity-80">Azure Free Trial <ExternalLink className="h-3 w-3" /></a> or <a href="https://azure.microsoft.com/en-us/free/students" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-foreground underline underline-offset-2 hover:opacity-80">Azure for Students <ExternalLink className="h-3 w-3" /></a>.</>,
        <>Open the <a href="https://portal.azure.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-foreground underline underline-offset-2 hover:opacity-80">Azure Portal <ExternalLink className="h-3 w-3" /></a> in a new tab.</>,
        <>Search for <span className="font-medium text-foreground">Static Web Apps</span> and click <span className="font-medium text-foreground">Create</span>.</>,
        <>Select your active subscription.</>,
        <>Leave Resource Group empty, or set one if you prefer.</>,
        <>Give the resource a name, e.g. <span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">my-links-gallery</span>.</>,
        <><span className="font-medium text-foreground">IMPORTANT:</span> Select <span className="font-medium text-foreground">Free</span> as the Plan type.</>,
        <>Pick <span className="font-medium text-foreground">GitHub</span> as the Source and connect your GitHub account.</>,
        <>In the dropdowns, select your <span className="font-medium text-foreground">username</span> (Organization), the <span className="font-medium text-foreground">my-links-gallery</span> repository, and the <span className="font-medium text-foreground">public-prod</span> branch.</>,
        <>Leave all other settings as-is and click <span className="font-medium text-foreground">Review + create</span>, then <span className="font-medium text-foreground">Create</span>.</>,
        <>When deployment is complete, click <span className="font-medium text-foreground">Go to Resource</span> to find your site URL.</>,
        <>Wait 5–10 minutes for the first build to finish — then your site is live!</>,
      ].map((text, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground/15 text-[9px] font-bold text-foreground">
            {i + 14}
          </span>
          <span className="text-xs leading-relaxed text-foreground/85">{text}</span>
        </li>
      ))}
    </ol>
  </div>
);
