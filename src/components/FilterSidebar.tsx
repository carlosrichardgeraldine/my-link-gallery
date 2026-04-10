import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { links } from "@/data/links";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterSidebarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const allTags = Array.from(new Set(links.flatMap((l) => l.tags))).sort();

const TAGS_PER_PAGE = 10;
const totalPages = Math.ceil(allTags.length / TAGS_PER_PAGE);

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
  titleClassName = "",
  onOpenChange,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  titleClassName?: string;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className="border-b border-border pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={handleToggle}
        className={`flex w-full items-center justify-between py-1 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors ${titleClassName}`}
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({ selectedTags, onToggleTag }: FilterSidebarProps) => {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(orientation: portrait)").matches;
  });

  const [tagsPage, setTagsPage] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const portraitQuery = window.matchMedia("(orientation: portrait)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsPortrait(event.matches);
    };

    setIsPortrait(portraitQuery.matches);
    portraitQuery.addEventListener("change", handleChange);

    return () => {
      portraitQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const paginatedTags = allTags.slice(
    tagsPage * TAGS_PER_PAGE,
    (tagsPage + 1) * TAGS_PER_PAGE
  );

  const selectedOnOtherPages = selectedTags.filter(
    (t) => !paginatedTags.includes(t)
  ).length;

  return (
    <div className="hover-chroma-border rounded-lg border border-border bg-card p-4">
      <FilterSection
        key={`all-tags-${isPortrait ? "portrait" : "landscape"}`}
        title="All Tags"
        defaultOpen={!isPortrait}
        titleClassName="mb-3 text-base font-semibold text-foreground font-sans"
        onOpenChange={(open) => { if (!open) setTagsPage(0); }}
      >
        {paginatedTags.map((tag) => (
          <label
            key={tag}
            className="flex cursor-pointer items-center gap-2 py-1 text-sm text-foreground hover:text-foreground/70 transition-colors"
          >
            <Checkbox
              checked={selectedTags.includes(tag)}
              onCheckedChange={() => onToggleTag(tag)}
              className="h-3.5 w-3.5"
            />
            {tag}
          </label>
        ))}

        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-border">
            <button
              onClick={() => setTagsPage((p) => Math.max(0, p - 1))}
              disabled={tagsPage === 0}
              aria-label="Previous tags page"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {tagsPage + 1} / {totalPages}
              </span>
              {selectedOnOtherPages > 0 && (
                <span
                  title={`${selectedOnOtherPages} selected tag(s) on other pages`}
                  className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
                >
                  {selectedOnOtherPages}
                </span>
              )}
            </div>

            <button
              onClick={() => setTagsPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={tagsPage === totalPages - 1}
              aria-label="Next tags page"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </FilterSection>
    </div>
  );
};

export default FilterSidebar;
