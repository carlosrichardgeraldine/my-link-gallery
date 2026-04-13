import cloudComputingDeck from "@/data/decks/cloud-computing-fundamentals.json";
import awsSaaDeck from "@/data/decks/aws-saa.json";
import az900Deck from "@/data/decks/az-900.json";
import setscatalog from "@/data/flashcard-sets.json";

export interface FlashcardMeta {
  version: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  hint?: string;
  tags: string[];
}

export interface FlashcardDeck {
  meta: FlashcardMeta;
  cards: Flashcard[];
}

export interface FlashcardSetEntry {
  id: string;
  name: string;
  description: string;
  file: string;
  cardCount: number;
  tags: string[];
}

export const flashcardSetsCatalog: FlashcardSetEntry[] = setscatalog.sets;

export const deckRegistry: Record<string, FlashcardDeck> = {
  "cloud-computing-fundamentals": cloudComputingDeck as FlashcardDeck,
  "aws-saa": awsSaaDeck as FlashcardDeck,
  "az-900": az900Deck as FlashcardDeck,
};

export const defaultDeck: FlashcardDeck = cloudComputingDeck as FlashcardDeck;

export function exportDeck(deck: FlashcardDeck): void {
  const json = JSON.stringify(deck, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${deck.meta.name.replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseDeckJson(raw: string): FlashcardDeck | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.meta &&
      Array.isArray(parsed.cards)
    ) {
      return parsed as FlashcardDeck;
    }
    return null;
  } catch {
    return null;
  }
}
