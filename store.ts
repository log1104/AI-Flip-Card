import { createWithEqualityFn } from 'zustand/traditional';
import { supabase } from './supabaseClient';
import type {
  AppSettings,
  CardData,
  CardFace,
  CardRow,
  Deck,
  DeckRow,
  PendingMutation,
  StudySession,
} from './types';

const QUEUE_STORAGE_KEY = 'flip-card-pending-mutations';

const defaultSettings: AppSettings = {
  theme: 'light',
  shuffle: false,
  startFace: 'front',
};

const SETTINGS_STORAGE_KEY = 'flip-card-settings';

type StoredTheme = 'light' | 'dark' | 'system';

const loadSettings = (): AppSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as {
      theme?: StoredTheme;
      shuffle?: AppSettings['shuffle'];
      startFace?: AppSettings['startFace'];
    };
    let theme: 'light' | 'dark' = 'light';
    if (parsed.theme === 'dark') {
      theme = 'dark';
    } else if (parsed.theme === 'system') {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const shuffle = typeof parsed.shuffle === 'boolean' ? parsed.shuffle : defaultSettings.shuffle;
    const startFace = parsed.startFace === 'back' ? 'back' : 'front';
    return { theme, shuffle, startFace };
  } catch {
    return defaultSettings;
  }
};

const persistSettings = (settings: AppSettings) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
};

const shuffleCards = (cards: CardData[]) => {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildStudySession = (deck: Deck, settings: AppSettings): StudySession | null => {
  if (!deck.cards.length) return null;
  const orderedCards = settings.shuffle ? shuffleCards(deck.cards) : [...deck.cards];
  return {
    deckId: deck.id,
    cards: orderedCards,
    currentIndex: 0,
    showingFront: settings.startFace !== 'back',
    startedAt: new Date().toISOString(),
  };
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const loadQueue = (): PendingMutation[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as PendingMutation[] : [];
  } catch {
    return [];
  }
};

const persistQueue = (queue: PendingMutation[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
};

const normalizeFace = (face: unknown): CardFace => {
  if (face && typeof face === 'object') {
    const maybeFace = face as Partial<CardFace>;
    return {
      title: typeof maybeFace.title === 'string' ? maybeFace.title : '',
      content: typeof maybeFace.content === 'string' ? maybeFace.content : '',
    };
  }
  if (typeof face === 'string') {
    return { title: '', content: face };
  }
  return { title: '', content: '' };
};

const mapCardRow = (row: CardRow): CardData => ({
  id: row.id,
  deckId: row.deck_id,
  front: normalizeFace(row.front),
  back: normalizeFace(row.back),
  createdAt: row.created_at ?? undefined,
});

const mapDeckRow = (row: DeckRow): Deck => ({
  id: row.id,
  title: row.title,
  description: row.description ?? null,
  createdAt: row.created_at ?? undefined,
  cards: Array.isArray(row.cards) ? row.cards.map(mapCardRow) : [],
});

const createMutation = (type: PendingMutation['type'], payload: Record<string, unknown>): PendingMutation => ({
  id: generateId(),
  type,
  payload,
  createdAt: Date.now(),
});

const executeMutation = async (mutation: PendingMutation, userId: string): Promise<boolean> => {
  try {
    switch (mutation.type) {
      case 'deck:create': {
        const deck = mutation.payload.deck as { id: string; title: string; description?: string | null };
        const { error } = await supabase
          .from('decks')
          .upsert([{ id: deck.id, title: deck.title, description: deck.description ?? null, user_id: userId }], {
            onConflict: 'id',
          });
        if (error) throw error;
        return true;
      }
      case 'deck:update': {
        const { deckId, updates } = mutation.payload as { deckId: string; updates: { title?: string; description?: string | null } };
        const { error } = await supabase
          .from('decks')
          .update({
            title: updates.title,
            description: updates.description ?? null,
          })
          .eq('id', deckId)
          .eq('user_id', userId);
        if (error) throw error;
        return true;
      }
      case 'deck:delete': {
        const { deckId } = mutation.payload as { deckId: string };
        const { error } = await supabase.from('decks').delete().eq('id', deckId).eq('user_id', userId);
        if (error) throw error;
        return true;
      }
      case 'card:create': {
        const card = mutation.payload.card as { id: string; deckId: string; front: CardFace; back: CardFace };
        const { error } = await supabase
          .from('cards')
          .upsert(
            [
              {
                id: card.id,
                deck_id: card.deckId,
                front: card.front,
                back: card.back,
              },
            ],
            { onConflict: 'id' }
          );
        if (error) throw error;
        return true;
      }
      case 'card:update': {
        const { cardId, updates } = mutation.payload as { cardId: string; updates: { front?: CardFace; back?: CardFace } };
        const { error } = await supabase
          .from('cards')
          .update({
            front: updates.front,
            back: updates.back,
          })
          .eq('id', cardId);
        if (error) throw error;
        return true;
      }
      case 'card:delete': {
        const { cardId } = mutation.payload as { cardId: string };
        const { error } = await supabase.from('cards').delete().eq('id', cardId);
        if (error) throw error;
        return true;
      }
      default:
        return true;
    }
  } catch {
    return false;
  }
};

const fetchDecks = async (userId: string): Promise<Deck[]> => {
  const { data, error } = await supabase
    .from('decks')
    .select('id,title,description,created_at,cards(id,front,back,deck_id,created_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data as DeckRow[] | null) ?? [];
  return rows.map(mapDeckRow);
};

export interface AppState {
  decks: Deck[];
  activeDeckId: string | null;
  currentUserId: string | null;
  appSettings: AppSettings;
  isInitialized: boolean;
  isSyncing: boolean;
  error: string | null;
  pendingMutations: PendingMutation[];
  studySession: StudySession | null;
  actions: {
    initialize: (userId: string) => Promise<void>;
    reset: () => void;
    setActiveDeck: (deckId: string | null) => void;
    createDeck: (input: { title: string; description?: string | null }) => Promise<void>;
    updateDeck: (deckId: string, updates: { title?: string; description?: string | null }) => Promise<void>;
    deleteDeck: (deckId: string) => Promise<void>;
    createCard: (deckId: string, input: { front: CardFace; back: CardFace }) => Promise<void>;
    updateCard: (deckId: string, cardId: string, input: { front?: CardFace; back?: CardFace }) => Promise<void>;
    deleteCard: (deckId: string, cardId: string) => Promise<void>;
    updateSettings: (settings: Partial<AppSettings>) => void;
    processPending: () => Promise<void>;
    refreshDecks: () => Promise<void>;
    startStudySession: (deckId: string) => void;
    endStudySession: () => void;
    nextStudyCard: () => void;
    prevStudyCard: () => void;
    flipStudyCard: () => void;
  };
}

const initialState: Omit<AppState, 'actions'> = {
  decks: [],
  activeDeckId: null,
  currentUserId: null,
  appSettings: loadSettings(),
  isInitialized: false,
  isSyncing: false,
  error: null,
  pendingMutations: [],
  studySession: null,
};

const useStore = createWithEqualityFn<AppState>()((set, get) => ({
  ...initialState,
  actions: {
    initialize: async (userId: string) => {
      const queue = loadQueue();
      set({
        currentUserId: userId,
        pendingMutations: queue,
        isSyncing: true,
        error: null,
      });
      try {
        const decks = await fetchDecks(userId);
        set((state) => ({
          decks,
          activeDeckId: state.activeDeckId && decks.some((deck) => deck.id === state.activeDeckId)
            ? state.activeDeckId
            : decks[0]?.id ?? null,
          isInitialized: true,
          isSyncing: false,
          error: null,
        }));
      } catch (error) {
        set({
          isInitialized: true,
          isSyncing: false,
          error: error instanceof Error ? error.message : 'Unable to load decks',
        });
      }
      await get().actions.processPending();
    },
    reset: () => {
      set({ ...initialState });
    },
    setActiveDeck: (deckId) => {
      set({ activeDeckId: deckId });
    },
    createDeck: async ({ title, description }) => {
      const { currentUserId, actions } = get();
      if (!currentUserId) return;

      const deckId = generateId();
      const optimisticDeck: Deck = {
        id: deckId,
        title,
        description: description ?? null,
        createdAt: new Date().toISOString(),
        cards: [],
      };

      set((state) => ({
        decks: [...state.decks, optimisticDeck],
        activeDeckId: optimisticDeck.id,
        error: null,
      }));

      const mutation = createMutation('deck:create', {
        deck: {
          id: deckId,
          title,
          description: description ?? null,
        },
      });

      if (!navigator.onLine) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return { pendingMutations: queue };
        });
        return;
      }

      const success = await executeMutation(mutation, currentUserId);
      if (!success) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return {
            pendingMutations: queue,
            error: 'Deck will sync when you are back online.',
          };
        });
        return;
      }

      await actions.refreshDecks();
    },
    updateDeck: async (deckId, updates) => {
      const { currentUserId, actions } = get();
      if (!currentUserId) return;

      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === deckId
            ? { ...deck, title: updates.title ?? deck.title, description: updates.description ?? deck.description }
            : deck
        ),
        error: null,
      }));

      const mutation = createMutation('deck:update', {
        deckId,
        updates,
      });

      if (!navigator.onLine) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return { pendingMutations: queue };
        });
        return;
      }

      const success = await executeMutation(mutation, currentUserId);
      if (!success) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return {
            pendingMutations: queue,
            error: 'Deck update will sync when you are back online.',
          };
        });
        return;
      }

      await actions.refreshDecks();
    },
    deleteDeck: async (deckId) => {
      const { currentUserId, actions } = get();
      if (!currentUserId) return;

        set((state) => {
          const remainingDecks = state.decks.filter((deck) => deck.id !== deckId);
          return {
            decks: remainingDecks,
            activeDeckId: state.activeDeckId === deckId ? remainingDecks[0]?.id ?? null : state.activeDeckId,
            error: null,
            studySession: state.studySession?.deckId === deckId ? null : state.studySession,
          };
        });

      const mutation = createMutation('deck:delete', { deckId });

      if (!navigator.onLine) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return { pendingMutations: queue };
        });
        return;
      }

      const success = await executeMutation(mutation, currentUserId);
      if (!success) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return {
            pendingMutations: queue,
            error: 'Deck removal will sync when you are back online.',
          };
        });
        return;
      }

      await actions.refreshDecks();
    },
    createCard: async (deckId, { front, back }) => {
      const { currentUserId, actions } = get();
      if (!currentUserId) return;

      const cardId = generateId();
      const optimisticCard: CardData = {
        id: cardId,
        deckId,
        front,
        back,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === deckId ? { ...deck, cards: [...deck.cards, optimisticCard] } : deck
        ),
        error: null,
      }));

      const mutation = createMutation('card:create', {
        card: {
          id: cardId,
          deckId,
          front,
          back,
        },
      });

      if (!navigator.onLine) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return { pendingMutations: queue };
        });
        return;
      }

      const success = await executeMutation(mutation, currentUserId);
      if (!success) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return {
            pendingMutations: queue,
            error: 'Card will sync when you are back online.',
          };
        });
        return;
      }

      await actions.refreshDecks();
    },
    updateCard: async (deckId, cardId, { front, back }) => {
      const { currentUserId, actions } = get();
      if (!currentUserId) return;

      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === deckId
            ? {
                ...deck,
                cards: deck.cards.map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        front: front ?? card.front,
                        back: back ?? card.back,
                      }
                    : card
                ),
              }
            : deck
        ),
        error: null,
      }));

      const mutation = createMutation('card:update', {
        cardId,
        updates: {
          front,
          back,
        },
      });

      if (!navigator.onLine) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return { pendingMutations: queue };
        });
        return;
      }

      const success = await executeMutation(mutation, currentUserId);
      if (!success) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return {
            pendingMutations: queue,
            error: 'Card update will sync when you are back online.',
          };
        });
        return;
      }

      await actions.refreshDecks();
    },
    deleteCard: async (deckId, cardId) => {
      const { currentUserId, actions } = get();
      if (!currentUserId) return;

      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === deckId ? { ...deck, cards: deck.cards.filter((card) => card.id !== cardId) } : deck
        ),
        error: null,
      }));

      const mutation = createMutation('card:delete', { cardId });

      if (!navigator.onLine) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return { pendingMutations: queue };
        });
        return;
      }

      const success = await executeMutation(mutation, currentUserId);
      if (!success) {
        set((state) => {
          const queue = [...state.pendingMutations, mutation];
          persistQueue(queue);
          return {
            pendingMutations: queue,
            error: 'Card removal will sync when you are back online.',
          };
        });
        return;
      }

      await actions.refreshDecks();
    },
    updateSettings: (settings) => {
      set((state) => {
        const next = { ...state.appSettings, ...settings } as AppSettings;
        persistSettings(next);
        return { appSettings: next };
      });
    },
      processPending: async () => {
        const { pendingMutations, currentUserId, actions } = get();
        if (!currentUserId || pendingMutations.length === 0) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      let didSync = false;
      const remaining: PendingMutation[] = [];
      for (const mutation of pendingMutations) {
        const success = await executeMutation(mutation, currentUserId);
        if (success) {
          didSync = true;
        } else {
          remaining.push(mutation);
        }
      }

      set({ pendingMutations: remaining });
      persistQueue(remaining);

      if (didSync) {
        await actions.refreshDecks();
      }
    },
    refreshDecks: async () => {
      const { currentUserId } = get();
      if (!currentUserId) return;
      set({ isSyncing: true });
      try {
        const decks = await fetchDecks(currentUserId);
        set((state) => ({
          decks,
          activeDeckId: state.activeDeckId && decks.some((deck) => deck.id === state.activeDeckId)
            ? state.activeDeckId
            : decks[0]?.id ?? null,
          isSyncing: false,
          error: null,
        }));
        } catch (error) {
          set({
            isSyncing: false,
            error: error instanceof Error ? error.message : 'Unable to refresh decks',
          });
        }
      },
      startStudySession: (deckId) => {
        const { decks, appSettings } = get();
        const deck = decks.find((d) => d.id === deckId);
        if (!deck) return;
        const session = buildStudySession(deck, appSettings);
        if (!session) return;
        set({ studySession: session });
      },
      endStudySession: () => {
        set({ studySession: null });
      },
      nextStudyCard: () => {
        const { studySession, appSettings } = get();
        if (!studySession || studySession.cards.length === 0) return;
        const nextIndex = (studySession.currentIndex + 1) % studySession.cards.length;
        set({
          studySession: {
            ...studySession,
            currentIndex: nextIndex,
            showingFront: appSettings.startFace !== 'back',
          },
        });
      },
      prevStudyCard: () => {
        const { studySession, appSettings } = get();
        if (!studySession || studySession.cards.length === 0) return;
        const total = studySession.cards.length;
        const prevIndex = (studySession.currentIndex - 1 + total) % total;
        set({
          studySession: {
            ...studySession,
            currentIndex: prevIndex,
            showingFront: appSettings.startFace !== 'back',
          },
        });
      },
      flipStudyCard: () => {
        const { studySession } = get();
        if (!studySession) return;
        set({
          studySession: {
            ...studySession,
            showingFront: !studySession.showingFront,
          },
        });
      },
    },
  }));

export default useStore;
