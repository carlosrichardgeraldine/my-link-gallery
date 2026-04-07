import { Plus, Trash2 } from "lucide-react";

import type { ReactNode } from "react";

type StringArrayEditorProps = {
  title: string;
  description: string;
  items: string[];
  onChange: (next: string[]) => void;
  emptyLabel: string;
  placeholder: string;
};

const stringArrayRow = (
  items: string[],
  index: number,
  onChange: (next: string) => void,
  onDelete: () => void
) => (
  <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/90 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
    <textarea
      value={items[index]}
      onChange={(event) => onChange(event.target.value)}
      rows={2}
      className="min-h-[54px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
    />
    <button
      type="button"
      onClick={onDelete}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
    >
      <Trash2 className="h-4 w-4" />
      Remove
    </button>
  </div>
);

export const StringArrayEditor = ({
  title,
  description,
  items,
  onChange,
  emptyLabel,
  placeholder,
}: StringArrayEditorProps) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${title}-${index}`} className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Item {index + 1}</div>
              {stringArrayRow(
                items,
                index,
                (nextValue) => onChange(items.map((current, currentIndex) => (currentIndex === index ? nextValue : current))),
                () => onChange(items.filter((_, currentIndex) => currentIndex !== index))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{placeholder}</p>
    </section>
  );
};
