import React, { useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';
import useStore from '../store';

const DeckList: React.FC = () => {
  const {
    decks,
    activeDeckId,
    isSyncing,
    pendingCount,
    createDeck,
    updateDeck,
    deleteDeck,
    setActiveDeck,
  } = useStore(
    (state) => ({
      decks: state.decks,
      activeDeckId: state.activeDeckId,
      isSyncing: state.isSyncing,
      pendingCount: state.pendingMutations.length,
      createDeck: state.actions.createDeck,
      updateDeck: state.actions.updateDeck,
      deleteDeck: state.actions.deleteDeck,
      setActiveDeck: state.actions.setActiveDeck,
    }),
    shallow
  );

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-60';
  const iconButton =
    'inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900';
  const dangerIconButton =
    'inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900';

  const statusBadge = useMemo(() => {
    if (pendingCount > 0) {
      return (
        <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <span className="material-icons text-base">cloud_upload</span>
          {pendingCount} change{pendingCount > 1 ? 's' : ''} pending sync
        </span>
      );
    }
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <span className="material-icons text-base animate-spin">autorenew</span>
          Syncing with Supabase
        </span>
      );
    }
    return <span className="text-gray-500 dark:text-gray-400">All changes synced</span>;
  }, [isSyncing, pendingCount]);

  const handleCreateDeck = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await createDeck({ title: title.trim(), description: description.trim() || null });
    setTitle('');
    setDescription('');
    setIsCreating(false);
  };

  const handleStartEdit = (deckId: string, currentTitle: string, currentDescription: string | null) => {
    setEditingDeckId(deckId);
    setEditTitle(currentTitle);
    setEditDescription(currentDescription ?? '');
  };

  const handleUpdateDeck = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingDeckId || !editTitle.trim()) return;
    await updateDeck(editingDeckId, { title: editTitle.trim(), description: editDescription.trim() || null });
    setEditingDeckId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleDeleteDeck = async (deckId: string) => {
    const confirmed = window.confirm('Delete this deck and all associated cards?');
    if (!confirmed) return;
    await deleteDeck(deckId);
  };

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 shadow-sm backdrop-blur px-6 py-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Your Decks</h2>
          <p className="text-sm font-medium">{statusBadge}</p>
        </div>
        <button onClick={() => setIsCreating(true)} className={primaryButton}>
          <span className="material-icons text-base">add_circle</span>
          New Deck
        </button>
      </header>

      {isCreating && (
        <form
          onSubmit={handleCreateDeck}
          className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/70 p-4"
        >
          <div>
            <label htmlFor="create-deck-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              id="create-deck-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className={primaryButton}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {decks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium">No decks yet</p>
            <p className="mt-1">Create your first deck to get started.</p>
          </div>
        ) : (
          decks.map((deck) => (
            <div
              key={deck.id}
              className={`rounded-xl border transition-all ${
                deck.id === activeDeckId
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              {editingDeckId === deck.id ? (
                <form onSubmit={handleUpdateDeck} className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Title
                    </label>
                    <input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      required
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="submit" className={primaryButton}>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDeckId(null)}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveDeck(deck.id)}
                  className="w-full text-left p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          deck.id === activeDeckId ? 'text-blue-700 dark:text-blue-200' : 'text-gray-800 dark:text-gray-100'
                        }`}
                      >
                        {deck.title}
                      </p>
                      {deck.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                          {deck.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleStartEdit(deck.id, deck.title, deck.description);
                        }}
                        className={iconButton}
                        aria-label="Rename deck"
                      >
                        <span className="material-icons text-base">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteDeck(deck.id);
                        }}
                        className={dangerIconButton}
                        aria-label="Delete deck"
                      >
                        <span className="material-icons text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default DeckList;
