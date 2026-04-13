import ccDeck from "@/data/decks/cc.json";
import pmDeck from "@/data/decks/pm.json";
import baDeck from "@/data/decks/ba.json";
import seDeck from "@/data/decks/se.json";
import az900Deck from "@/data/decks/az-900.json";
import ai900Deck from "@/data/decks/ai-900.json";
import dp900Deck from "@/data/decks/dp-900.json";
import ms900Deck from "@/data/decks/ms-900.json";
import sc900Deck from "@/data/decks/sc-900.json";
import pl900Deck from "@/data/decks/pl-900.json";
import mb910Deck from "@/data/decks/mb-910.json";
import mb920Deck from "@/data/decks/mb-920.json";
import ab900Deck from "@/data/decks/ab-900.json";
import ab730Deck from "@/data/decks/ab-730.json";
import ab731Deck from "@/data/decks/ab-731.json";
import gh900Deck from "@/data/decks/gh-900.json";
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
  "cc": ccDeck as FlashcardDeck,
  "pm": pmDeck as FlashcardDeck,
  "ba": baDeck as FlashcardDeck,
  "se": seDeck as FlashcardDeck,
  "az-900": az900Deck as FlashcardDeck,
  "ai-900": ai900Deck as FlashcardDeck,
  "dp-900": dp900Deck as FlashcardDeck,
  "ms-900": ms900Deck as FlashcardDeck,
  "sc-900": sc900Deck as FlashcardDeck,
  "pl-900": pl900Deck as FlashcardDeck,
  "mb-910": mb910Deck as FlashcardDeck,
  "mb-920": mb920Deck as FlashcardDeck,
  "ab-900": ab900Deck as FlashcardDeck,
  "ab-730": ab730Deck as FlashcardDeck,
  "ab-731": ab731Deck as FlashcardDeck,
  "gh-900": gh900Deck as FlashcardDeck,
};
