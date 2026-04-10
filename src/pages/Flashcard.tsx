import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  RefreshCw,
  Shuffle,
  Tag,
  Upload,
  X,
} from "lucide-react";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { defaultDeck, exportDeck, parseDeckJson, type Flashcard, type FlashcardDeck } from "@/data/flashcards";
import { toast } from "sonner";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FlipCard({
  card,
  flipped,
  onFlip,
}: {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="flashcard-scene"
      onClick={onFlip}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onFlip()}
      role="button"
      tabIndex={0}
      aria-label={flipped ? "Card back — click to flip to front" : "Card front — click to flip to back"}
    >
      <div className={`flashcard${flipped ? " flashcard--flipped" : ""}`}>
        {/* Front */}
        <div className="flashcard-face flashcard-face--front rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center md:p-10">
            <div className="flex flex-wrap justify-center gap-1.5">
              {card.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {t}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-foreground md:text-3xl">{card.term}</h2>
            <p className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Click to reveal definition
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="flashcard-face flashcard-face--back rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center md:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Definition
            </p>
            <p className="text-sm leading-relaxed text-foreground md:text-base">{card.definition}</p>
            {card.hint && (
              <p className="mt-2 rounded-xl border border-border bg-muted px-4 py-2 text-xs italic text-muted-foreground">
                💡 {card.hint}
              </p>
            )}
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Click to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardPage() {
  const [deck, setDeck] = useState<FlashcardDeck>(defaultDeck);
  const [queue, setQueue] = useState<Flashcard[]>(defaultDeck.cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const importInputRef = useRef<HTMLInputElement>(null);

  const allTags = Array.from(new Set(deck.cards.flatMap((c) => c.tags))).sort();

  const filtered = selectedTags.length === 0
    ? deck.cards
    : deck.cards.filter((c) => selectedTags.some((t) => c.tags.includes(t)));

  useEffect(() => {
    const base = selectedTags.length === 0 ? deck.cards : deck.cards.filter((c) => selectedTags.some((t) => c.tags.includes(t)));
    setQueue(isShuffled ? shuffle(base) : base);
    setIndex(0);
    setFlipped(false);
  }, [selectedTags, deck, isShuffled]);

  const currentCard = queue[index] ?? null;

  const goTo = useCallback((next: number) => {
    setFlipped(false);
    setTimeout(() => setIndex(next), 80);
  }, []);

  const handlePrev = () => index > 0 && goTo(index - 1);
  const handleNext = () => index < queue.length - 1 && goTo(index + 1);

  const handleShuffle = () => {
    setIsShuffled((s) => !s);
  };

  const handleReset = () => {
    setIndex(0);
    setFlipped(false);
    setIsShuffled(false);
    setSelectedTags([]);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleExport = () => {
    exportDeck(deck);
    toast.success("Deck exported as JSON");
  };

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const parsed = parseDeckJson(raw);
      if (!parsed) {
        toast.error("Invalid flashcard JSON file");
        return;
      }
      setDeck(parsed);
      setSelectedTags([]);
      setIsShuffled(false);
      setIndex(0);
      setFlipped(false);
      toast.success(`Imported "${parsed.meta.name}" — ${parsed.cards.length} cards`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === " " || e.key === "Enter") setFlipped((f) => !f);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-base font-semibold text-foreground md:text-xl">Flashcard</h1>
              <span className="hidden text-xs text-muted-foreground md:inline">— {deck.meta.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleImportClick}
                title="Import deck from JSON"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                title="Export deck as JSON"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportFile}
          aria-label="Import flashcard deck JSON file"
        />

        <div className="container mx-auto px-4 pt-5 pb-28 md:py-8">
          {/* Deck info row */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span>
              <span>card{filtered.length !== 1 ? "s" : ""}</span>
              {selectedTags.length > 0 && (
                <span className="text-xs">(filtered from {deck.cards.length})</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShuffle}
                title={isShuffled ? "Restore original order" : "Shuffle cards"}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isShuffled
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Shuffle className="h-3.5 w-3.5" />
                Shuffle
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset deck"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
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
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-2.5 w-2.5" />
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Card area */}
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 py-20 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-foreground">No cards match the selected tags</p>
              <button
                onClick={() => setSelectedTags([])}
                className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {/* Card */}
              {currentCard && (
                <FlipCard
                  key={currentCard.id}
                  card={currentCard}
                  flipped={flipped}
                  onFlip={() => setFlipped((f) => !f)}
                />
              )}

              {/* Navigation */}
              <div className="flex w-full max-w-2xl items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={index === 0}
                  aria-label="Previous card"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {index + 1} <span className="text-muted-foreground font-normal">/ {queue.length}</span>
                  </span>
                  <div className="flex gap-1">
                    {queue.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Go to card ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          i === index
                            ? "w-4 bg-foreground"
                            : "w-1.5 bg-border hover:bg-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    ← → to navigate · Space to flip
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={index === queue.length - 1}
                  aria-label="Next card"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
