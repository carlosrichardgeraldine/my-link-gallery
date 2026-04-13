import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  GraduationCap,
  RefreshCw,
  Search,
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

/* ─── Helpers ────────────────────────────────────────────────────────────── */

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

const MOBILE_PAGE_SIZE = 8;
const DESKTOP_PAGE_SIZE = 9;

function DeckPicker({
  onSelect,
  onImport,
}: {
  onSelect: (id: string) => void;
  onImport: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mobilePage, setMobilePage] = useState(0);
  const [desktopPage, setDesktopPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const quickTags = useMemo(() => {
    const all = Array.from(new Set(flashcardSetsCatalog.flatMap((e) => e.tags)));
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 5);
  }, []);

  const q = search.toLowerCase();
  const filtered = flashcardSetsCatalog.filter((e) => {
    const matchesSearch =
      q === "" ||
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q));
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((t) => e.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  const hasFilters = search !== "" || selectedTags.length > 0;

  // Reset pages when filters change
  useEffect(() => {
    setMobilePage(0);
    setDesktopPage(0);
    setExpandedId(null);
  }, [search, selectedTags]);

  const mobilePageCount = Math.ceil(filtered.length / MOBILE_PAGE_SIZE);
  const desktopPageCount = Math.ceil(filtered.length / DESKTOP_PAGE_SIZE);

  const mobileItems = filtered.slice(
    mobilePage * MOBILE_PAGE_SIZE,
    (mobilePage + 1) * MOBILE_PAGE_SIZE,
  );
  const desktopItems = filtered.slice(
    desktopPage * DESKTOP_PAGE_SIZE,
    (desktopPage + 1) * DESKTOP_PAGE_SIZE,
  );

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const clearAll = () => {
    setSearch("");
    setSelectedTags([]);
  };

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="container mx-auto px-4 pt-6 pb-28 md:py-8">
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Choose a Deck</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select a flashcard set to start studying</p>
      </div>

      {/* Search bar */}
      <div className="mb-4 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, description, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Quick tag pills — 5 random tags per session */}
      <div className="mb-4 flex flex-wrap gap-2">
        {quickTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
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
      </div>

      {/* Active filters bar */}
      <div className="index-active-filters-row mb-4 flex min-h-8 items-center gap-2 overflow-hidden">
        <span className="shrink-0 text-sm font-medium text-foreground">
          {filtered.length} deck{filtered.length !== 1 ? "s" : ""}
        </span>

        <div className="index-active-filters-scroll relative z-0 min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2 pr-16">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="hover-chroma-pill inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs font-medium text-background"
              >
                {tag}
                <button onClick={() => toggleTag(tag)} className="ml-0.5 hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
          {hasFilters && (
            <button
              onClick={clearAll}
              className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile layout (hidden sm+) ─────────────────────────────────── */}
      <div className="sm:hidden">
        {mobileItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No decks match your search.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {mobileItems.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
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
        )}

        {/* Mobile pagination */}
        {mobilePageCount > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setMobilePage((p) => p - 1); setExpandedId(null); }}
              disabled={mobilePage === 0}
              className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              {mobilePage + 1} / {mobilePageCount}
            </span>
            <button
              type="button"
              onClick={() => { setMobilePage((p) => p + 1); setExpandedId(null); }}
              disabled={mobilePage === mobilePageCount - 1}
              className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}

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
        {desktopItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No decks match your search.</p>
        ) : (
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

            {/* Import card on last page */}
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
        )}

        {/* Desktop pagination */}
        {desktopPageCount > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setDesktopPage((p) => p - 1)}
              disabled={desktopPage === 0}
              className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              {desktopPage + 1} / {desktopPageCount}
            </span>
            <button
              type="button"
              onClick={() => setDesktopPage((p) => p + 1)}
              disabled={desktopPage === desktopPageCount - 1}
              className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
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
  const [cardSearch, setCardSearch] = useState("");
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
      setCardSearch("");
      setIsShuffled(false);
    }
  }, [selectedSetId]);

  const allTags = deck
    ? Array.from(new Set(deck.cards.flatMap((c) => c.tags))).sort()
    : [];

  const q = cardSearch.toLowerCase();
  const filtered = !deck
    ? []
    : deck.cards.filter((c) => {
        const matchesSearch =
          q === "" ||
          c.term.toLowerCase().includes(q) ||
          c.definition.toLowerCase().includes(q) ||
          (c.hint ?? "").toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q));
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.some((t) => c.tags.includes(t));
        return matchesSearch && matchesTags;
      });

  const hasFilters = cardSearch !== "" || selectedTags.length > 0;

  useEffect(() => {
    if (!deck) return;
    setQueue(isShuffled ? shuffle(filtered) : filtered);
    setIndex(0);
    setFlipped(false);
  }, [cardSearch, selectedTags, deck, isShuffled]);

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
    setCardSearch("");
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearAll = () => {
    setSelectedTags([]);
    setCardSearch("");
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
      setCardSearch("");
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
          <div className="container mx-auto px-4 pt-4 pb-28 md:py-6">
            {/* Search bar */}
            <div className="mb-4 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by term, definition, or tag..."
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Tag filter pills */}
            {allTags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
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
              </div>
            )}

            {/* Active filters bar */}
            <div className="index-active-filters-row mb-4 flex min-h-8 items-center gap-2 overflow-hidden">
              <span className="shrink-0 text-sm font-medium text-foreground">
                {filtered.length} card{filtered.length !== 1 ? "s" : ""}
                {hasFilters && deck && (
                  <span className="ml-1 font-normal text-muted-foreground text-xs">
                    of {deck.cards.length}
                  </span>
                )}
              </span>

              <div className="index-active-filters-scroll relative z-0 min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
                <div className="flex items-center gap-2 pr-16">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="hover-chroma-pill inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs font-medium text-background"
                    >
                      {tag}
                      <button onClick={() => handleToggleTag(tag)} className="ml-0.5 hover:opacity-70">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
                {hasFilters && (
                  <button
                    onClick={handleClearAll}
                    className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleShuffle}
                  title={isShuffled ? "Restore original order" : "Shuffle cards"}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isShuffled
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <Shuffle className="h-3 w-3" />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset deck"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Card area */}
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 py-20 text-center backdrop-blur-sm">
                <p className="text-sm font-medium text-foreground">No cards match your filters</p>
                <button
                  onClick={handleClearAll}
                  className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
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
                      {index + 1}{" "}
                      <span className="font-normal text-muted-foreground">/ {queue.length}</span>
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
