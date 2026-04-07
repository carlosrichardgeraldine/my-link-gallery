import { type DragEvent, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

const reorderArray = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

type TableEditorProps = {
  items: string[];
  onChange: (next: string[]) => void;
  title: string;
  description: string;
  emptyLabel: string;
  dragLabel: string;
};

const GenericTableEditor = ({
  items,
  onChange,
  title,
  description,
  emptyLabel,
  dragLabel,
}: TableEditorProps) => {
  const [dragState, setDragState] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: "before" | "after" } | null>(null);

  const handleDragOverRow = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();

    if (dragState === null) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: "before" | "after" = event.clientY < midpoint ? "before" : "after";

    setDropTarget({ index, position });
  };

  const handleDropReorder = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
    position: "before" | "after"
  ) => {
    event.preventDefault();

    if (dragState === null) {
      setDropTarget(null);
      return;
    }

    let nextIndex = position === "before" ? targetIndex : targetIndex + 1;

    if (dragState < nextIndex) {
      nextIndex -= 1;
    }

    if (nextIndex < 0) {
      nextIndex = 0;
    }

    if (nextIndex > items.length - 1) {
      nextIndex = items.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(items, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

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
          Add row
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="relative flex items-center gap-2 rounded-2xl"
              onDragOver={(event) => handleDragOverRow(event, index)}
              onDrop={(event) =>
                handleDropReorder(
                  event,
                  index,
                  dropTarget?.index === index ? dropTarget.position : "before"
                )
              }
            >
              <button
                type="button"
                draggable
                onDragStart={() => setDragState(index)}
                onDragEnd={() => {
                  setDropTarget(null);
                  setDragState(null);
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                aria-label={dragLabel}
                title="Drag to reorder"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>

              <div className="min-w-0 flex-1">
                <input
                  value={item}
                  onChange={(event) =>
                    onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                />
              </div>

              <button
                type="button"
                onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              {dropTarget?.index === index && dropTarget.position === "before" ? (
                <div className="pointer-events-none absolute inset-x-0 -top-1 h-0.5 rounded-full bg-foreground/70" />
              ) : null}
              {dropTarget?.index === index && dropTarget.position === "after" ? (
                <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-foreground/70" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : null}
    </section>
  );
};

export const ProjectItemsTableEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  return (
    <GenericTableEditor
      items={items}
      onChange={onChange}
      title="Project Items"
      description="Edit the project item list in a compact table layout."
      emptyLabel="No project items yet. Add a row to begin."
      dragLabel="Drag to reorder project item"
    />
  );
};

export const HighlightedCredentialsTableEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  return (
    <GenericTableEditor
      items={items}
      onChange={onChange}
      title="Highlighted Credentials"
      description="Edit the credential list in a compact table layout."
      emptyLabel="No highlighted credentials yet. Add a row to begin."
      dragLabel="Drag to reorder credential"
    />
  );
};
