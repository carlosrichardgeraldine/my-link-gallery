import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import type { ActiveFilter } from "@/hooks/useLinkFilters";

type ActiveFiltersBarProps = {
  filteredCount: number;
  activeFilters: ActiveFilter[];
  hasFilters: boolean;
  onToggleTag: (tag: string) => void;
  onClearAll: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

const ActiveFiltersBar = ({
  filteredCount,
  activeFilters,
  hasFilters,
  onToggleTag,
  onClearAll,
  currentPage,
  totalPages,
  onPageChange,
}: ActiveFiltersBarProps) => {
  return (
    <div className="index-active-filters-row mb-4 flex min-h-8 items-center gap-2 overflow-hidden">
      <span className="shrink-0 text-sm font-medium text-foreground">
        {filteredCount} result{filteredCount !== 1 ? "s" : ""}
      </span>

      <div className="index-active-filters-scroll relative z-0 min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 pr-16">
          {activeFilters.map((filter) => (
            <span
              key={filter.label}
              className="hover-chroma-pill inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs font-medium text-background"
            >
              {filter.label}
              <button onClick={() => onToggleTag(filter.value)} className="ml-0.5 hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
        {hasFilters ? (
          <button
            onClick={onClearAll}
            className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear all
          </button>
        ) : null}

        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ActiveFiltersBar;
