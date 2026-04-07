import { type DragEvent, type KeyboardEvent, useState } from "react";
import { GripVertical, X } from "lucide-react";

import type { OverviewDetailItem, ResumePageContent } from "@/data/resumeBuilderContent";

type KeywordRowsEditorProps = {
  rows: string[][];
  onChange: (next: string[][]) => void;
};

const KEYWORD_ROW_LIMIT = 12;
const KEYWORD_ITEMS_PER_ROW_LIMIT = 8;

const normalizeKeywordRows = (rows: string[][]) => {
  const normalizedRows = rows
    .slice(0, KEYWORD_ROW_LIMIT)
    .map((row) => row.map((item) => item.trim()).filter(Boolean).slice(0, KEYWORD_ITEMS_PER_ROW_LIMIT));

  while (normalizedRows.length < KEYWORD_ROW_LIMIT) {
    normalizedRows.push([]);
  }

  return normalizedRows;
};

const reorderArray = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const KeywordPillInputRow = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");

  const commitPill = (rawValue: string) => {
    const value = rawValue.trim();

    if (!value || items.length >= KEYWORD_ITEMS_PER_ROW_LIMIT) {
      return;
    }

    onChange([...items, value]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "," || event.key === "Enter") {
      event.preventDefault();
      commitPill(draft);
      setDraft("");
      return;
    }

    if ((event.key === "Backspace" || event.key === "Delete") && !draft.trim() && items.length > 0) {
      event.preventDefault();
      onChange(items.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (!draft.trim()) {
      return;
    }

    commitPill(draft);
    setDraft("");
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");

    if (!pasted) {
      return;
    }

    const tokens = pasted
      .split(/[\n,]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      return;
    }

    event.preventDefault();

    const availableSlots = Math.max(0, KEYWORD_ITEMS_PER_ROW_LIMIT - items.length);
    const nextItems = [...items, ...tokens.slice(0, availableSlots)];
    onChange(nextItems);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-border bg-background p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, itemIndex) => (
          <span
            key={`${item}-${itemIndex}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== itemIndex))}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={items.length >= KEYWORD_ITEMS_PER_ROW_LIMIT ? "Line is full" : "Type and press comma"}
          className="min-w-[140px] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          disabled={items.length >= KEYWORD_ITEMS_PER_ROW_LIMIT}
        />
      </div>
    </div>
  );
};

export const KeywordRowsEditor = ({ rows, onChange }: KeywordRowsEditorProps) => {
  const [dragState, setDragState] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: "before" | "after" } | null>(null);
  const normalizedRows = normalizeKeywordRows(rows);

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

  const handleDropReorder = (event: DragEvent<HTMLDivElement>, targetIndex: number, position: "before" | "after") => {
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

    if (nextIndex > normalizedRows.length - 1) {
      nextIndex = normalizedRows.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(normalizedRows, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-foreground">Pills wall</div>
      <p className="text-xs text-muted-foreground">
        Customize the scrolling pills text. Type a word and press comma to create a pill. You can remove pills with Backspace/Delete in an empty input or by clicking X on each pill. Limits: {KEYWORD_ROW_LIMIT} lines and {KEYWORD_ITEMS_PER_ROW_LIMIT} pills per line.
      </p>
      <div className="grid gap-3">
        {normalizedRows.map((row, rowIndex) => (
          <div
            key={`keyword-row-${rowIndex}`}
            className="relative flex items-start gap-1.5"
            onDragOver={(event) => handleDragOverRow(event, rowIndex)}
            onDrop={(event) =>
              handleDropReorder(
                event,
                rowIndex,
                dropTarget?.index === rowIndex ? dropTarget.position : "before"
              )
            }
          >
            {dropTarget?.index === rowIndex && dropTarget.position === "before" ? (
              <div className="pointer-events-none absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
            ) : null}
            {dropTarget?.index === rowIndex && dropTarget.position === "after" ? (
              <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
            ) : null}
            <button
              type="button"
              draggable
              onDragStart={() => setDragState(rowIndex)}
              onDragEnd={() => {
                setDropTarget(null);
                setDragState(null);
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder line"
              title="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1">
              <KeywordPillInputRow
                items={row}
                onChange={(nextItems) => {
                  const nextRows = normalizeKeywordRows(rows);
                  nextRows[rowIndex] = nextItems.slice(0, KEYWORD_ITEMS_PER_ROW_LIMIT);
                  onChange(nextRows);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
