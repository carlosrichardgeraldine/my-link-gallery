import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { itRoles } from "@/data/exploreIT";
import { Checkbox } from "@/components/ui/checkbox";

interface ExploreITFilterSidebarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const allTags = Array.from(new Set(itRoles.flatMap((r) => r.tags))).sort();

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
  titleClassName = "",
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  titleClassName?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between py-1 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors ${titleClassName}`}
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
};

const ExploreITFilterSidebar = ({ selectedTags, onToggleTag }: ExploreITFilterSidebarProps) => {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(orientation: portrait)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(orientation: portrait)");
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return (
    <div className="hover-chroma-border rounded-lg border border-border bg-card p-4">
      <FilterSection
        key={`all-tags-${isPortrait ? "portrait" : "landscape"}`}
        title="All Tags"
        defaultOpen={!isPortrait}
        titleClassName="mb-3 text-base font-semibold text-foreground font-sans"
      >
        {allTags.map((tag) => (
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
      </FilterSection>
    </div>
  );
};

export default ExploreITFilterSidebar;
