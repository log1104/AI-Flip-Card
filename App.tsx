import React, { useEffect, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';
import ThemeManager from './components/ThemeManager';
import CardView from './components/CardView';
import AddCardModal from './components/AddCardModal';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import StudySession from './components/StudySession';
import DeckDrawer from './components/DeckDrawer';
import SettingsPanel from './components/SettingsPanel';
import useStore from './store';
import { useAuth } from './auth/AuthContext';
import type { CardData, CardFace } from './types';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const {
    decks,
    activeDeckId,
    isInitialized,
    isSyncing,
    pendingCount,
    error,
    initialize,
    reset,
    createCard,
    updateCard,
    deleteCard,
    processPending,
    appSettings,
    studySession,
    startStudySession,
    endStudySession,
    nextStudyCard,
    prevStudyCard,
    flipStudyCard,
    updateSettings,
  } = useStore(
    (state) => ({
      decks: state.decks,
      activeDeckId: state.activeDeckId,
      isInitialized: state.isInitialized,
      isSyncing: state.isSyncing,
      pendingCount: state.pendingMutations.length,
      error: state.error,
      initialize: state.actions.initialize,
      reset: state.actions.reset,
      createCard: state.actions.createCard,
      updateCard: state.actions.updateCard,
      deleteCard: state.actions.deleteCard,
      processPending: state.actions.processPending,
      appSettings: state.appSettings,
      studySession: state.studySession,
      startStudySession: state.actions.startStudySession,
      endStudySession: state.actions.endStudySession,
      nextStudyCard: state.actions.nextStudyCard,
      prevStudyCard: state.actions.prevStudyCard,
      flipStudyCard: state.actions.flipStudyCard,
      updateSettings: state.actions.updateSettings,
    }),
    shallow
  );

  const activeDeck = useMemo(() => decks.find((deck) => deck.id === activeDeckId) ?? null, [decks, activeDeckId]);

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const syncMessage = useMemo(() => {
    if (pendingCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-white/70">
          <span className="material-icons text-xs">cloud_upload</span>
          {pendingCount} pending sync
        </span>
      );
    }
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1 text-white/70">
          <span className="material-icons text-xs animate-spin">autorenew</span>
          Syncing&hellip;
        </span>
      );
    }
    return <span className="text-white/70">Synced</span>;
  }, [isSyncing, pendingCount]);

  useEffect(() => {
    if (loading) return;
    if (user) {
      initialize(user.id);
    } else if (isInitialized) {
      reset();
    }
  }, [user, loading, initialize, reset, isInitialized]);

  useEffect(() => {
    if (!user) return;
    const handleOnline = () => {
      processPending();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, processPending]);

  useEffect(() => {
    if (user) {
      processPending();
    }
  }, [user, processPending]);

  useEffect(() => {
    if (isDrawerOpen) {
      setDrawerOpen(false);
    }
  }, [activeDeckId]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingCard(null);
    setModalOpen(true);
  };

  const handleEditCard = (card: CardData) => {
    setModalMode('edit');
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!activeDeckId) return;
    const confirmed = window.confirm('Delete this card?');
    if (!confirmed) return;
    await deleteCard(activeDeckId, cardId);
  };

  const handleSubmitCard = async (front: CardFace, back: CardFace) => {
    if (!activeDeckId) {
      throw new Error('Select a deck before adding cards.');
    }

    if (modalMode === 'create') {
      await createCard(activeDeckId, { front, back });
    } else if (editingCard) {
      await updateCard(activeDeckId, editingCard.id, { front, back });
    }
  };

  const handleStartStudySession = () => {
    if (activeDeck && activeDeck.cards.length > 0) {
      startStudySession(activeDeck.id);
    }
  };

  const deckTitle = activeDeck?.title ?? 'AI Flip Cards';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <span className="material-icons text-5xl text-blue-500 animate-spin">autorenew</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center px-4 py-16">
        <ThemeManager />
        <div className="mx-auto w-full max-w-5xl space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">AI Flip Cards</h1>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Study smarter with synchronized decks, offline support, and a clean interface built on Supabase.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,400px),minmax(0,320px)] items-start justify-center">
            <div className="w-full flex justify-center">{authView === 'login' ? <LoginForm /> : <RegisterForm />}</div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-5 shadow-sm text-sm text-left space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Why sign in?</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-base text-blue-500 mt-0.5">sync</span>
                  <span>Keep decks synchronized across devices with Supabase.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-base text-blue-500 mt-0.5">cloud_done</span>
                  <span>Offline changes are queued automatically and replayed when you reconnect.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-base text-blue-500 mt-0.5">security</span>
                  <span>Your data stays private&mdash;row level security ensures only you can access your decks.</span>
                </li>
              </ul>
              <button
                onClick={() => setAuthView((prev) => (prev === 'login' ? 'register' : 'login'))}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
              >
                <span className="material-icons text-base">swap_horiz</span>
                {authView === 'login' ? 'Need an account? Create one' : 'Have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeManager />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className="app-header bg-blue-600 text-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="rounded-full p-2 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label="Open deck drawer"
              >
                <span className="material-icons">menu</span>
              </button>
              <div className="flex flex-col">
                <span className="text-lg font-semibold leading-tight truncate max-w-[220px] sm:max-w-[360px]">
                  {deckTitle}
                </span>
                <span className="text-[11px] uppercase tracking-widest">{syncMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSettingsOpen(true)}
                className="rounded-full p-2 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label="Open settings"
              >
                <span className="material-icons">settings</span>
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
            <div className="mx-auto max-w-6xl px-6 py-3 text-sm text-red-700 dark:text-red-200">{error}</div>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-6 py-12 space-y-8">
          {activeDeck && (
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-5 shadow-sm transition-colors">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    onClick={handleStartStudySession}
                    disabled={activeDeck.cards.length === 0}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                      activeDeck.cards.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <span className="material-icons text-base">play_circle</span>
                    Start study session
                  </button>
                  <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:border-blue-800/40 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:focus:ring-offset-gray-900"
                  >
                    <span className="material-icons text-base">add</span>
                    Add card
                  </button>
                  {/** session options removed per request **/}
                </div>
                {/** card counter removed per request **/}
              </div>
            </section>
          )}

          {activeDeck && (
            <CardView
              deck={activeDeck}
              onAddCard={handleOpenCreateModal}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
            />
          )}
        </main>
      </div>

      <AddCardModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitCard}
        initialFront={editingCard?.front}
        initialBack={editingCard?.back}
      />

      {studySession && (
        <StudySession
          session={studySession}
          deck={decks.find((deck) => deck.id === studySession.deckId) ?? null}
          onClose={endStudySession}
          onFlip={flipStudyCard}
          onNext={nextStudyCard}
          onPrev={prevStudyCard}
        />
      )}

      <DeckDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={appSettings}
        onUpdateSettings={updateSettings}
      />
    </>
  );
};

export default App;
