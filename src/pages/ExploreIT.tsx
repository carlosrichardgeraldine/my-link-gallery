import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { itRoles, roleMap, type ITRole } from "@/data/exploreIT";
import { useIsMobile } from "@/hooks/use-mobile";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ITEMS_DESKTOP = 10;
const ITEMS_MOBILE = 6;

function RolePill({
  roleId,
  onNavigate,
}: {
  roleId: string;
  onNavigate: (role: ITRole) => void;
}) {
  const role = roleMap.get(roleId);
  const exists = !!role;

  if (exists) {
    return (
      <button
        type="button"
        onClick={() => onNavigate(role)}
        className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-card"
      >
        {role.title}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-destructive bg-muted px-3 py-1 text-xs font-medium text-muted-foreground line-through">
      {roleId}
    </span>
  );
}

function RoleDialog({
  role,
  open,
  onOpenChange,
  onNavigate,
}: {
  role: ITRole | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate: (role: ITRole) => void;
}) {
  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{role.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {role.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-foreground">{role.description}</p>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {role.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Related Roles
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {role.relatedRoles.length > 0 ? (
                role.relatedRoles.map((id) => (
                  <RolePill key={id} roleId={id} onNavigate={(r) => { onNavigate(r); }} />
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None listed</span>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Roadmap
            </h3>
            <a
              href={role.roadmapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              View on roadmap.sh
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ExploreIT() {
  const isMobile = useIsMobile();
  const pageSize = isMobile ? ITEMS_MOBILE : ITEMS_DESKTOP;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<ITRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalPages = Math.ceil(itRoles.length / pageSize);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return itRoles.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  function openRole(role: ITRole) {
    setSelectedRole(role);
    setDialogOpen(true);
  }

  function goTo(page: number) {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-foreground md:text-xl">exploreIT</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto flex flex-1 flex-col px-4 py-4 md:py-6">
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
            <p className="text-sm text-muted-foreground">
              {itRoles.length} IT roles — select one to explore its description, skills, and learning path.
            </p>
            {totalPages > 1 && (
              <div className="inline-flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <ul className="flex-1 divide-y divide-border rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
            {paged.map((role) => (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => openRole(role)}
                  className="flex w-full flex-col gap-0.5 px-4 py-3.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:flex-row md:items-center md:gap-4 md:py-3"
                >
                  <span className="text-sm font-semibold text-foreground md:w-56 md:shrink-0">
                    {role.title}
                  </span>
                  <span className="text-xs text-muted-foreground md:text-sm">{role.summary}</span>
                </button>
              </li>
            ))}
          </ul>

        </main>
      </div>

      <RoleDialog
        role={selectedRole}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onNavigate={(role) => {
          setSelectedRole(role);
        }}
      />
    </div>
  );
}
