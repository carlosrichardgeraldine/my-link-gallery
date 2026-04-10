import { useState } from "react";
import { ChevronRight, ChevronsLeft, ChevronsRight, ExternalLink, Search, X } from "lucide-react";
import { itRoles, roleMap, type ITRole } from "@/data/exploreIT";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExploreITFilters } from "@/hooks/useExploreITFilters";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ThemeToggle from "@/components/ThemeToggle";
import ExploreITFilterSidebar from "@/components/explore-it/ExploreITFilterSidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ITEMS_DESKTOP = 10;
const ITEMS_MOBILE = 6;

const QUICK_TAGS = ["Web", "Python", "APIs", "Cloud", "Security", "Linux", "SQL", "ML", "JavaScript", "Testing"];

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

  const {
    search,
    setSearch,
    selectedTags,
    toggleTag,
    clearAll,
    filtered,
    paged,
    totalPages,
    currentPage,
    setCurrentPage,
    hasFilters,
    activeFilters,
  } = useExploreITFilters(itRoles, pageSize);

  const [selectedRole, setSelectedRole] = useState<ITRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openRole(role: ITRole) {
    setSelectedRole(role);
    setDialogOpen(true);
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <h1 className="text-base font-semibold text-foreground md:text-xl">exploreIT</h1>
            <ThemeToggle />
          </div>
        </header>

        <div className="container mx-auto px-4 pt-4 pb-24 md:py-6">
          {/* Search bar */}
          <div className="mb-4 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, summary, or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Quick tags */}
          <div className="index-tag-recommendations mb-4 flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`hover-chroma-pill rounded-full border px-2.5 py-0.5 text-[10px] font-medium opacity-80 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-sm ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Active filters bar */}
          <div className="index-active-filters-row mb-4 flex min-h-8 items-center gap-2 overflow-hidden">
            <span className="shrink-0 text-sm font-medium text-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>

            <div className="index-active-filters-scroll relative z-0 min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
              <div className="flex items-center gap-2 pr-16">
                {activeFilters.map((filter) => (
                  <span
                    key={filter.label}
                    className="hover-chroma-pill inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs font-medium text-background"
                  >
                    {filter.label}
                    <button onClick={() => toggleTag(filter.value)} className="ml-0.5 hover:opacity-70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear all
                </button>
              )}

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Next page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main layout: sidebar + list */}
          <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
            <aside className="w-full shrink-0 lg:w-56">
              <ExploreITFilterSidebar selectedTags={selectedTags} onToggleTag={toggleTag} />
            </aside>

            <main className="flex-1">
              {paged.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 py-16 text-center backdrop-blur-sm">
                  <p className="text-sm font-medium text-foreground">No roles match your search</p>
                  <button
                    onClick={clearAll}
                    className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
                  {paged.map((role) => (
                    <li key={role.id}>
                      <button
                        type="button"
                        onClick={() => openRole(role)}
                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="text-sm font-semibold text-foreground">{role.title}</span>
                          <span className="text-xs text-muted-foreground">{role.summary}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </main>
          </div>
        </div>
      </div>

      <RoleDialog
        role={selectedRole}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onNavigate={(role) => setSelectedRole(role)}
      />
    </div>
  );
}
