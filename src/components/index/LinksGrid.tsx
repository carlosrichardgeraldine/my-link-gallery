import LinkCard from "@/components/LinkCard";
import type { LinkItem } from "@/data/links";

type LinksGridProps = {
  filtered: LinkItem[];
  paginatedLinks: LinkItem[];
  placeholderCount: number;
  onClearAll: () => void;
};

const LinksGrid = ({ filtered, paginatedLinks, placeholderCount, onClearAll }: LinksGridProps) => {
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center">
        <p className="text-lg font-medium text-foreground">No links found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your tags or search term.</p>
        <button
          onClick={onClearAll}
          className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Clear tags
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paginatedLinks.map((link, index) => (
        <LinkCard key={`${link.title}-${index}`} link={link} />
      ))}

      {Array.from({ length: placeholderCount }).map((_, index) => (
        <div key={`placeholder-${index}`} aria-hidden="true" className="invisible block rounded-lg border border-border bg-card p-5">
          <h3 className="mb-1.5 text-lg font-semibold font-sans">Placeholder</h3>
          <p className="mb-4 text-sm leading-relaxed">Placeholder.</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">Tag</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LinksGrid;
