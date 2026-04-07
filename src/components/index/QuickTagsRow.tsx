type QuickTagsRowProps = {
  quickTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

const QuickTagsRow = ({ quickTags, selectedTags, onToggleTag }: QuickTagsRowProps) => {
  return (
    <div className="index-tag-recommendations mb-4 flex flex-wrap gap-2">
      {quickTags.map((tag) => {
        const active = selectedTags.includes(tag);

        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleTag(tag)}
            className={`hover-chroma-pill rounded-full border px-2.5 py-0.5 text-[10px] font-medium opacity-80 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-sm ${
              active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default QuickTagsRow;
