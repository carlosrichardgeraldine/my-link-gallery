import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ResumeToolsPanel from "@/components/ResumeToolsPanel";

const Tools = () => (
  <div className="relative isolate min-h-screen bg-background text-foreground">
    <MonochromePlusBackground />
    <div className="page-base-glass" aria-hidden="true" />
    <ResumeToolsPanel />
  </div>
);

export default Tools;
