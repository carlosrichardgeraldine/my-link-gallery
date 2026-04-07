import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, type ErrorInfo, type ReactNode, lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Clarity from "@microsoft/clarity";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = lazy(() => import("./pages/Index.tsx"));
const Resume = lazy(() => import("./pages/Resume.tsx"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder.tsx"));
const LinkBuilder = lazy(() => import("./pages/LinkBuilder.tsx"));
const Docs = lazy(() => import("./pages/Docs.tsx"));
const DocsOverviewManual = lazy(() => import("./pages/DocsOverviewManual.tsx"));
const DocsArchitecture = lazy(() => import("./pages/DocsArchitecture.tsx"));
const DocsRoutes = lazy(() => import("./pages/DocsRoutes.tsx"));
const DocsDataFlow = lazy(() => import("./pages/DocsDataFlow.tsx"));
const DocsDevelopment = lazy(() => import("./pages/DocsDevelopment.tsx"));
const DocsNotes = lazy(() => import("./pages/DocsNotes.tsx"));
const DocsUiUx = lazy(() => import("./pages/DocsUiUx.tsx"));
const DocsVisualComponents = lazy(() => import("./pages/DocsVisualComponents.tsx"));
const DocsDeployment = lazy(() => import("./pages/DocsDeployment.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();
const ATTRIBUTION_LEAD = "Originally made by Carlos R. Geraldine ☆ ";
export const ATTRIBUTION_URL = "https://github.com/carlosrichardgeraldine/my-link-gallery";
export const ATTRIBUTION_DOCUMENTATION_LABEL = "Documentation";
export const ATTRIBUTION_TEXT = `${ATTRIBUTION_LEAD}${ATTRIBUTION_URL} ☆ ${ATTRIBUTION_DOCUMENTATION_LABEL}`;
export const ATTRIBUTION_MARK = "𖤐";
const ATTRIBUTION_FOOTER_ID = "origin-attribution-footer";
const OWNER_NAME = "Carlos Richard Geraldine";

const routeTitles: Record<string, string> = {
  "/": "Resume",
  "/resume": "Resume",
  "/links": "Links",
  "/resume-builder": "Resume Builder",
  "/links-builder": "Links Builder",
  "/docs": "Documentation",
  "/docs/overview-manual": "Overview Manual",
  "/docs/architecture": "Architecture",
  "/docs/routes": "Routes",
  "/docs/data-flow": "Data Flow",
  "/docs/development": "Development",
  "/docs/deployment": "Deployment",
  "/docs/notes": "Notes",
  "/docs/ui-ux": "UI/UX",
  "/docs/visual-components": "Visual Components",
};

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName = routeTitles[location.pathname] ?? "";
    document.title = pageName ? `${OWNER_NAME} | ${pageName}` : OWNER_NAME;
    Clarity.setTag("app", "my-link-gallery");
    Clarity.setTag("page", location.pathname);

    if (pageName) {
      Clarity.setTag("page_name", pageName);
    }
  }, [location.pathname]);

  return null;
};

type RootErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unknown runtime error",
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Root runtime error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-lg font-semibold md:text-2xl">The app hit a runtime error</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Reload the page. If this keeps happening, share this error message so it can be fixed quickly.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-border/70 bg-background p-3 text-xs text-foreground/90">
              {this.state.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AttributionFooter = () => {
  const [integrityTick, setIntegrityTick] = useState(0);

  useEffect(() => {
    const isCompromised = () => {
      const footer = document.getElementById(ATTRIBUTION_FOOTER_ID);

      if (!footer) {
        return true;
      }

      const text = footer.textContent?.trim() ?? "";
      const mark = footer.getAttribute("data-origin-mark");

      return text !== ATTRIBUTION_TEXT || mark !== ATTRIBUTION_MARK;
    };

    const observer = new MutationObserver(() => {
      if (isCompromised()) {
        setIntegrityTick((current) => current + 1);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-origin-mark"],
    });

    if (isCompromised()) {
      setIntegrityTick((current) => current + 1);
    }

    return () => {
      observer.disconnect();
    };
  }, [integrityTick]);

  return (
    <p
      id={ATTRIBUTION_FOOTER_ID}
      key={integrityTick}
      data-origin-mark={ATTRIBUTION_MARK}
      data-testid="attribution-footer"
      className="fixed inset-x-0 bottom-2 z-[2147483647] text-center text-[11px] font-medium text-muted-foreground/90"
    >
      {ATTRIBUTION_LEAD}
      <a
        href={ATTRIBUTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto underline decoration-muted-foreground/70 underline-offset-2 hover:text-foreground"
      >
        {ATTRIBUTION_URL}
      </a>
      {" ☆ "}
      <Link to="/docs" className="pointer-events-auto underline decoration-muted-foreground/70 underline-offset-2 hover:text-foreground">
        {ATTRIBUTION_DOCUMENTATION_LABEL}
      </Link>
    </p>
  );
};

const App = () => (
  <RootErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="relative">
            <TitleManager />
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
                  Loading...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Resume />} />
                <Route path="/links" element={<Index />} />
                <Route path="/resume" element={<Navigate to="/" replace />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/links-builder" element={<LinkBuilder />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/docs/overview-manual" element={<DocsOverviewManual />} />
                <Route path="/docs/architecture" element={<DocsArchitecture />} />
                <Route path="/docs/routes" element={<DocsRoutes />} />
                <Route path="/docs/data-flow" element={<DocsDataFlow />} />
                <Route path="/docs/development" element={<DocsDevelopment />} />
                <Route path="/docs/deployment" element={<DocsDeployment />} />
                <Route path="/docs/notes" element={<DocsNotes />} />
                <Route path="/docs/ui-ux" element={<DocsUiUx />} />
                <Route path="/docs/visual-components" element={<DocsVisualComponents />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            <AttributionFooter />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </RootErrorBoundary>
);

export default App;
