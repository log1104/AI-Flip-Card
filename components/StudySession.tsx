import React, { useEffect, useRef } from 'react';
import type { Deck, StudySession } from '../types';
import StudyCard, { StudyCardHandle } from './StudyCard';

interface StudySessionProps {
  session: StudySession;
  deck: Deck | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFlip: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ session, deck, onClose, onNext, onPrev, onFlip }) => {
  const cardRef = useRef<StudyCardHandle>(null);
  const currentCard = session.cards[session.currentIndex];
  const totalCards = session.cards.length;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrev();
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        cardRef.current?.flip();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, onNext, onPrev]);

  if (!currentCard) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1d] text-white">
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold">This deck has no cards yet.</p>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-2 text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0f1d] text-white">
      <header className="flex items-center justify-end px-10 py-8">
        <button
          onClick={onClose}
          className="rounded-full p-2 text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Close study session"
        >
          <span className="material-icons text-2xl">close</span>
        </button>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="relative flex w-full max-w-5xl items-center justify-between">
          <button
            onClick={onPrev}
            className="rounded-full p-3 text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Previous card"
          >
            <span className="material-icons text-3xl">chevron_left</span>
          </button>
          <div className="mx-4 flex-1">
            <StudyCard
              ref={cardRef}
              className="w-full max-w-2xl h-[60vh]"
              initialFlipped={!session.showingFront}
              onFlip={onFlip}
              frontContent={
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-900">{currentCard.front.title || 'Question'}</h3>
                  <p className="text-base leading-relaxed text-gray-600">{currentCard.front.content}</p>
                </div>
              }
              backContent={
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-white">{currentCard.back.title || 'Answer'}</h3>
                  <p className="text-base leading-relaxed text-blue-50">{currentCard.back.content}</p>
                </div>
              }
            />
          </div>
          <button
            onClick={onNext}
            className="rounded-full p-3 text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Next card"
          >
            <span className="material-icons text-3xl">chevron_right</span>
          </button>
        </div>
        <p className="mt-8 text-sm font-medium tracking-wide text-white/70">
          {session.currentIndex + 1} / {totalCards}
          {deck ? ` - ${deck.title}` : ''}
        </p>
      </main>
    </div>
  );
};

export default StudySession;
