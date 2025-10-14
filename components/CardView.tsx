import React from 'react';
import FlipCard from './FlipCard';
import type { CardData, Deck } from '../types';

interface CardViewProps {
  deck: Deck | null;
  onAddCard: () => void;
  onEditCard: (card: CardData) => void;
  onDeleteCard: (cardId: string) => void;
  isSyncing: boolean;
}

const CardView: React.FC<CardViewProps> = ({ deck, onAddCard, onEditCard, onDeleteCard, isSyncing }) => {
  const secondaryButton =
    'inline-flex items-center justify-center gap-2 rounded-md border border-blue-200 dark:border-blue-800/40 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900';

  if (!deck) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 backdrop-blur px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <span className="material-icons text-5xl text-blue-500">style</span>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Select a deck to begin</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a deck from the list on the left or create a new one to start studying.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (deck.cards.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 backdrop-blur px-4 sm:px-6 py-10 text-center shadow-sm">
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-8 py-10 text-center shadow-inner">
          <span className="material-icons text-6xl text-gray-300 dark:text-gray-600">inventory_2</span>
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">This deck doesn&rsquo;t have any cards yet.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Create your first card to kickstart a new study session.</p>
          <button onClick={onAddCard} className={`${secondaryButton} mt-6`}>
            <span className="material-icons text-base">add</span>
            Add your first card
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 backdrop-blur py-4 shadow-sm">
      <div className="mx-auto max-w-none px-3 sm:px-4 space-y-3">
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
          {deck.cards.map((card) => (
            <div key={card.id} className="flex justify-center">
              <FlipCard
                frontContent={
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900">{card.front.title || 'Question'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-700 whitespace-pre-wrap">{card.front.content}</p>
                    </div>
                  </div>
                }
                backContent={
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">{card.back.title || 'Answer'}</h3>
                      <p className="text-sm text-blue-50 whitespace-pre-wrap">{card.back.content}</p>
                    </div>
                  </div>
                }
                onEdit={() => onEditCard(card)}
                onDelete={() => onDeleteCard(card.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardView;
