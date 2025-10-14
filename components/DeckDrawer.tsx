import React, { useEffect } from 'react';
import DeckList from './DeckList';

interface DeckDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeckDrawer: React.FC<DeckDrawerProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <aside className="relative h-full w-screen max-w-[320px] overflow-hidden border-r border-gray-200/70 bg-white text-gray-800 shadow-2xl dark:border-gray-800/70 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="rounded-full bg-gray-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 dark:bg-gray-800/70 dark:text-gray-200">
            Decks
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:hover:text-gray-200 dark:focus:ring-offset-gray-900"
            aria-label="Close deck drawer"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>
        <div className="h-full overflow-y-auto px-5 pb-6">
          <DeckList />
        </div>
      </aside>
      <div className="flex-1 bg-black/50" onClick={onClose} aria-hidden="true" />
    </div>
  );
};

export default DeckDrawer;
