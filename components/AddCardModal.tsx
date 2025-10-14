import React, { useEffect, useState } from 'react';
import type { CardFace } from '../types';

interface AddCardModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (front: CardFace, back: CardFace) => void;
  initialFront?: CardFace;
  initialBack?: CardFace;
}

const defaultFace: CardFace = { title: '', content: '' };

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, mode, onClose, onSubmit, initialFront, initialBack }) => {
  const [front, setFront] = useState<CardFace>(initialFront ?? defaultFace);
  const [back, setBack] = useState<CardFace>(initialBack ?? defaultFace);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFront(initialFront ?? defaultFace);
      setBack(initialBack ?? defaultFace);
      setError(null);
    }
  }, [isOpen, initialFront, initialBack]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!front.content.trim() || !back.content.trim()) {
      setError('Front and back content are required.');
      return;
    }

    setIsSubmitting(true);
    Promise.resolve(
      onSubmit(
        { title: front.title.trim(), content: front.content.trim() },
        { title: back.title.trim(), content: back.content.trim() }
      )
    )
      .then(() => {
        setIsSubmitting(false);
        onClose();
      })
      .catch((err) => {
        setIsSubmitting(false);
        setError(err instanceof Error ? err.message : 'Unable to save card');
      });
  };

  const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-60';
  const secondaryButton =
    'inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {mode === 'create' ? 'Add new card' : 'Edit card'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Both sides support markdown-style content.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            aria-label="Close modal"
            type="button"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Front</h4>
              <input
                type="text"
                value={front.title}
                onChange={(event) => setFront((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Title (optional)"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={front.content}
                onChange={(event) => setFront((prev) => ({ ...prev, content: event.target.value }))}
                required
                rows={5}
                placeholder="What is React?"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Back</h4>
              <input
                type="text"
                value={back.title}
                onChange={(event) => setBack((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Title (optional)"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={back.content}
                onChange={(event) => setBack((prev) => ({ ...prev, content: event.target.value }))}
                required
                rows={5}
                placeholder="React is a JavaScript library for building user interfaces..."
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className={secondaryButton}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={primaryButton}>
              <span className="material-icons text-base">{mode === 'create' ? 'add_task' : 'save'}</span>
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Add card' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;
