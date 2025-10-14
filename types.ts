export interface CardFace {
  title: string;
  content: string;
}

export interface CardData {
  id: string;
  deckId: string;
  front: CardFace;
  back: CardFace;
  createdAt?: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string | null;
  createdAt?: string;
  cards: CardData[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  shuffle: boolean;
  startFace: 'front' | 'back';
}

export interface StudySession {
  deckId: string;
  cards: CardData[];
  currentIndex: number;
  showingFront: boolean;
  startedAt: string;
}

export type PendingMutationType =
  | 'deck:create'
  | 'deck:update'
  | 'deck:delete'
  | 'card:create'
  | 'card:update'
  | 'card:delete';

export interface PendingMutation {
  id: string;
  type: PendingMutationType;
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface DeckRow {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string | null;
  cards?: CardRow[] | null;
}

export interface CardRow {
  id: string;
  deck_id: string;
  front: unknown;
  back: unknown;
  created_at: string | null;
}
