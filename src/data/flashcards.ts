import cloudComputingDeck from "@/data/decks/cloud-computing-fundamentals.json";
import awsSaaDeck from "@/data/decks/aws-saa.json";
import az900Deck from "@/data/decks/az-900.json";
import ai900Deck from "@/data/decks/ai-900.json";
import dp900Deck from "@/data/decks/dp-900.json";
import ms900Deck from "@/data/decks/ms-900.json";
import sc900Deck from "@/data/decks/sc-900.json";
import pl900Deck from "@/data/decks/pl-900.json";
import mb910Deck from "@/data/decks/mb-910.json";
import mb920Deck from "@/data/decks/mb-920.json";
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
  "ai-900": ai900Deck as FlashcardDeck,
  "dp-900": dp900Deck as FlashcardDeck,
  "ms-900": ms900Deck as FlashcardDeck,
  "sc-900": sc900Deck as FlashcardDeck,
  "pl-900": pl900Deck as FlashcardDeck,
  "mb-910": mb910Deck as FlashcardDeck,
  "mb-920": mb920Deck as FlashcardDeck,
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
