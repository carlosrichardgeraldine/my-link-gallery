import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChevronDown,
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
import {
  flashcardSetsCatalog,
  deckRegistry,
  exportDeck,
  parseDeckJson,
  type Flashcard,
  type FlashcardDeck,
  type FlashcardSetEntry,
} from "@/data/flashcards";
import { toast } from "sonner";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Flip Card ─────────────────────────────────────────────────────────── */

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

/* ─── Deck Picker ────────────────────────────────────────────────────────── */

const MOBILE_PAGE_SIZE = 5;
const DESKTOP_PAGE_SIZE = 9;

function PaginationBar({
  page,
  pageCount,
  onPrev,
  onNext,
  size = "md",
}: {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  size?: "sm" | "md";
}) {
  if (pageCount <= 1) return null;
  const btnClass =
    size === "sm"
      ? "flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
      : "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button type="button" onClick={onPrev} disabled={page === 0} className={btnClass}>
        <ChevronLeft className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
      </button>
      <span className={size === "sm" ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>
        {page + 1} / {pageCount}
      </span>
      <button type="button" onClick={onNext} disabled={page === pageCount - 1} className={btnClass}>
        <ChevronRight className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
      </button>
    </div>
  );
}

function DeckPicker({
  onSelect,
  onImport,
}: {
  onSelect: (id: string) => void;
  onImport: () => void;
}) {
  const [mobilePage, setMobilePage] = useState(0);
  const [desktopPage, setDesktopPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mobilePageCount = Math.ceil(flashcardSetsCatalog.length / MOBILE_PAGE_SIZE);
  const desktopPageCount = Math.ceil(flashcardSetsCatalog.length / DESKTOP_PAGE_SIZE);

  const mobileItems = flashcardSetsCatalog.slice(
    mobilePage * MOBILE_PAGE_SIZE,
    (mobilePage + 1) * MOBILE_PAGE_SIZE,
  );
  const desktopItems = flashcardSetsCatalog.slice(
    desktopPage * DESKTOP_PAGE_SIZE,
    (desktopPage + 1) * DESKTOP_PAGE_SIZE,
  );

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="container mx-auto px-4 pt-8 pb-28 md:py-12">
      <div className="mb-6 text-center md:mb-8">
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Choose a Deck</h2>
        <p className="mt-2 text-sm text-muted-foreground">Select a flashcard set to start studying</p>
      </div>

      {/* ── Mobile layout (hidden sm+) ─────────────────────────────────── */}
      <div className="sm:hidden">
        <div className="flex flex-col gap-2">
          {mobileItems.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                {/* Row — always visible */}
                <button
                  type="button"
                  onClick={() => toggleExpand(entry.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="truncate text-sm font-semibold text-foreground">
                    {entry.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {entry.cardCount}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                      {entry.description}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelect(entry.id)}
                      className="w-full rounded-xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      Start studying →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <PaginationBar
          page={mobilePage}
          pageCount={mobilePageCount}
          onPrev={() => { setMobilePage((p) => p - 1); setExpandedId(null); }}
          onNext={() => { setMobilePage((p) => p + 1); setExpandedId(null); }}
          size="sm"
        />

        {/* Import — always visible on mobile */}
        <button
          type="button"
          onClick={onImport}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-3 text-left transition-colors hover:bg-card"
        >
          <span className="text-sm font-semibold text-foreground">Import Custom Deck</span>
          <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* ── Desktop layout (hidden below sm) ──────────────────────────── */}
      <div className="hidden sm:block">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {desktopItems.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.id)}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground leading-snug">{entry.name}</h3>
                <span className="shrink-0 rounded-lg border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {entry.cardCount} cards
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                {entry.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-2 text-xs font-medium text-foreground/60 transition-colors group-hover:text-foreground">
                Start studying →
              </div>
            </button>
          ))}

          {/* Import card — always on last page */}
          {desktopPage === desktopPageCount - 1 && (
            <button
              type="button"
              onClick={onImport}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-card hover:shadow-md"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground leading-snug">
                  Import Custom Deck
                </h3>
                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Load your own flashcard deck from a JSON file exported from this app.
              </p>
              <div className="mt-auto pt-2 text-xs font-medium text-foreground/60 transition-colors group-hover:text-foreground">
                Browse file →
              </div>
            </button>
          )}
        </div>

        <PaginationBar
          page={desktopPage}
          pageCount={desktopPageCount}
          onPrev={() => setDesktopPage((p) => p - 1)}
          onNext={() => setDesktopPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function FlashcardPage() {
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const importInputRef = useRef<HTMLInputElement>(null);

  /* Load deck when a set is selected */
  useEffect(() => {
    if (!selectedSetId) {
      setDeck(null);
      setQueue([]);
      return;
    }
    const loaded = deckRegistry[selectedSetId] ?? null;
    if (loaded) {
      setDeck(loaded);
      setQueue(loaded.cards);
      setIndex(0);
      setFlipped(false);
      setSelectedTags([]);
      setIsShuffled(false);
    }
  }, [selectedSetId]);

  const allTags = deck ? Array.from(new Set(deck.cards.flatMap((c) => c.tags))).sort() : [];

  const filtered = !deck
    ? []
    : selectedTags.length === 0
    ? deck.cards
    : deck.cards.filter((c) => selectedTags.some((t) => c.tags.includes(t)));

  useEffect(() => {
    if (!deck) return;
    const base =
      selectedTags.length === 0
        ? deck.cards
        : deck.cards.filter((c) => selectedTags.some((t) => c.tags.includes(t)));
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

  const handleShuffle = () => setIsShuffled((s) => !s);

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
    if (!deck) return;
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
      setSelectedSetId("__custom__");
      setSelectedTags([]);
      setIsShuffled(false);
      setIndex(0);
      setFlipped(false);
      toast.success(`Imported "${parsed.meta.name}" — ${parsed.cards.length} cards`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBackToPicker = () => {
    setSelectedSetId(null);
    setDeck(null);
  };

  useEffect(() => {
    if (!deck) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === " " || e.key === "Enter") setFlipped((f) => !f);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const isStudying = !!deck;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex items-center gap-2">
              {isStudying ? (
                <button
                  type="button"
                  onClick={handleBackToPicker}
                  title="Back to deck selection"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Decks</span>
                </button>
              ) : (
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              )}
              <h1 className="text-base font-semibold text-foreground md:text-xl">Flashcard</h1>
              {isStudying && deck && (
                <span className="hidden text-xs text-muted-foreground md:inline">— {deck.meta.name}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isStudying && (
                <>
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
                </>
              )}
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

        {/* Picker or Study view */}
        {!isStudying ? (
          <DeckPicker onSelect={setSelectedSetId} onImport={handleImportClick} />
        ) : (
          <div className="container mx-auto px-4 pt-5 pb-28 md:py-8">
            {/* Deck info row */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filtered.length}</span>
                <span>card{filtered.length !== 1 ? "s" : ""}</span>
                {selectedTags.length > 0 && (
                  <span className="text-xs">(filtered from {deck!.cards.length})</span>
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
        )}
      </div>
    </div>
  );
}
