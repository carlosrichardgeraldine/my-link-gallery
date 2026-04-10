import builtinData from "@/data/flashcards-data.json";

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

export const defaultDeck: FlashcardDeck = builtinData as FlashcardDeck;

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
