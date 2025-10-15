import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeckList from './DeckList';
import { shallow } from 'zustand/shallow';
import useStore from '../store';

interface DeckDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ParsedRow = string[];

interface ColumnMap {
  frontTitle?: number;
  frontContent: number;
  backTitle?: number;
  backContent: number;
}

const sanitizeFileName = (input: string) => {
  const trimmed = input.trim() || 'deck';
  return trimmed.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
};

const escapeCsvValue = (value: string) => {
  if (!value.includes('"') && !value.includes(',') && !value.includes('\n') && !value.includes('\r')) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
};

const normalizeHeaderKey = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const parseCsv = (input: string): ParsedRow[] => {
  const rows: ParsedRow[] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentValue += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentValue += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if (char === '\n' || char === '\r') {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      currentRow.push(currentValue);
      currentValue = '';
      if (currentRow.length > 0) {
        const isEmptyRow = currentRow.every((cell) => cell.trim().length === 0);
        if (!isEmptyRow) {
          rows.push(currentRow);
        }
      }
      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (inQuotes) {
    throw new Error('CSV parse error: unmatched quote detected.');
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    const isEmptyRow = currentRow.every((cell) => cell.trim().length === 0);
    if (!isEmptyRow) {
      rows.push(currentRow);
    }
  }

  return rows;
};

const extractColumnMap = (rows: ParsedRow[]): { dataRows: ParsedRow[]; map: ColumnMap } => {
  if (rows.length === 0) {
    throw new Error('CSV file is empty.');
  }

  const headerRow = rows[0];
  const normalized = headerRow.map(normalizeHeaderKey);
  const headerMap = new Map<string, number>();
  normalized.forEach((key, index) => {
    if (key) {
      headerMap.set(key, index);
    }
  });

  const columnMap: ColumnMap = {
    frontContent: -1,
    backContent: -1,
  };

  const hasHeader =
    headerMap.has('fronttitle') ||
    headerMap.has('frontcontent') ||
    headerMap.has('front') ||
    headerMap.has('backtitle') ||
    headerMap.has('backcontent') ||
    headerMap.has('back');

  if (hasHeader) {
    columnMap.frontTitle = headerMap.get('fronttitle') ?? headerMap.get('frontheading') ?? undefined;
    columnMap.frontContent = headerMap.get('frontcontent') ?? headerMap.get('front') ?? -1;
    columnMap.backTitle = headerMap.get('backtitle') ?? headerMap.get('backheading') ?? undefined;
    columnMap.backContent = headerMap.get('backcontent') ?? headerMap.get('back') ?? -1;

    if (columnMap.frontContent < 0 || columnMap.backContent < 0) {
      throw new Error('CSV header must include columns for front and back content.');
    }

    return {
      dataRows: rows.slice(1),
      map: columnMap,
    };
  }

  const columnCount = headerRow.length;
  if (columnCount >= 4) {
    columnMap.frontTitle = 0;
    columnMap.frontContent = 1;
    columnMap.backTitle = 2;
    columnMap.backContent = 3;
  } else if (columnCount >= 2) {
    columnMap.frontContent = 0;
    columnMap.backContent = 1;
  } else {
    throw new Error('CSV rows must contain at least front and back content columns.');
  }

  return {
    dataRows: rows,
    map: columnMap,
  };
};

const getCellValue = (row: ParsedRow, index: number | undefined) => {
  if (typeof index !== 'number' || index < 0) {
    return '';
  }
  return index < row.length ? row[index].trim() : '';
};

const DeckDrawer: React.FC<DeckDrawerProps> = ({ isOpen, onClose }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isImporting, setImporting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { decks, activeDeckId, createDeck, createCard } = useStore(
    (state) => ({
      decks: state.decks,
      activeDeckId: state.activeDeckId,
      createDeck: state.actions.createDeck,
      createCard: state.actions.createCard,
    }),
    shallow
  );

  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId) ?? null,
    [decks, activeDeckId]
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    setMenuOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickAway = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [isMenuOpen]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleExportDeck = useCallback(() => {
    setMenuOpen(false);
    if (!activeDeck) {
      window.alert('Select a deck before exporting.');
      return;
    }
    if (activeDeck.cards.length === 0) {
      window.alert('The active deck has no cards to export.');
      return;
    }

    const header = ['front_title', 'front_content', 'back_title', 'back_content'];
    const rows = activeDeck.cards.map((card) => [
      escapeCsvValue(card.front.title ?? ''),
      escapeCsvValue(card.front.content ?? ''),
      escapeCsvValue(card.back.title ?? ''),
      escapeCsvValue(card.back.content ?? ''),
    ]);

    const csv = [header, ...rows].map((row) => row.join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const deckTitle = sanitizeFileName(activeDeck.title);
    link.href = URL.createObjectURL(blob);
    link.download = `${deckTitle || 'deck'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [activeDeck]);

  const handleTriggerImport = useCallback(() => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        const parsedRows = parseCsv(text);
        const { dataRows, map } = extractColumnMap(parsedRows);
        const cards = dataRows
          .map((row) => {
            const frontContent = getCellValue(row, map.frontContent);
            const backContent = getCellValue(row, map.backContent);
            if (!frontContent && !backContent) {
              return null;
            }
            return {
              front: {
                title: getCellValue(row, map.frontTitle),
                content: frontContent,
              },
              back: {
                title: getCellValue(row, map.backTitle),
                content: backContent,
              },
            };
          })
          .filter((card): card is { front: { title: string; content: string }; back: { title: string; content: string } } => {
            if (!card) return false;
            if (!card.front.content || !card.back.content) {
              return false;
            }
            return true;
          });

        if (cards.length === 0) {
          throw new Error('No valid cards found in the CSV file.');
        }

        const defaultTitle = file.name.replace(/\.[^.]+$/, '');
        const deckTitle = window.prompt('Enter a name for the imported deck:', defaultTitle) ?? '';
        if (!deckTitle.trim()) {
          throw new Error('Import cancelled: deck name is required.');
        }

        await createDeck({ title: deckTitle.trim(), description: null });
        const newDeckId = useStore.getState().activeDeckId;
        if (!newDeckId) {
          throw new Error('Unable to determine the new deck identifier.');
        }

        for (const card of cards) {
          // Ensure we await sequentially to keep ordering predictable.
          // eslint-disable-next-line no-await-in-loop
          await createCard(newDeckId, {
            front: { title: card.front.title, content: card.front.content },
            back: { title: card.back.title, content: card.back.content },
          });
        }

        window.alert(`Imported ${cards.length} cards into "${deckTitle.trim()}".`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Import failed due to an unexpected error.';
        window.alert(message);
      } finally {
        setImporting(false);
      }
    },
    [createCard, createDeck]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <aside className="relative h-full w-screen max-w-[320px] overflow-hidden border-r border-gray-200/70 bg-white text-gray-800 shadow-2xl dark:border-gray-800/70 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gray-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 dark:bg-gray-800/70 dark:text-gray-200">
              Decks
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:hover:text-gray-200 dark:focus:ring-offset-gray-900"
            aria-label="Close deck drawer"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>
        <div className="px-5 pb-3">
          <div className="relative inline-flex" ref={menuRef}>
            <button
              type="button"
              onClick={handleToggleMenu}
              className="rounded-full border border-gray-200 bg-white/90 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-offset-gray-900"
              aria-label="Import or export decks"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              disabled={isImporting}
            >
              <span className="material-icons text-lg">folder_open</span>
            </button>
            {isMenuOpen && (
              <div className="absolute left-0 mt-2 min-w-[12rem] max-w-[clamp(12rem,40vw,18rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800 dark:shadow-2xl dark:ring-white/10 z-50">
                <div className="py-1 text-sm text-gray-800 dark:text-gray-100">
                  <button
                    type="button"
                    onClick={handleTriggerImport}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isImporting}
                  >
                    <span className="material-icons text-base text-blue-600 dark:text-blue-300">file_upload</span>
                    Import deck (CSV)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDeck}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    disabled={!activeDeck || activeDeck.cards.length === 0}
                  >
                    <span className="material-icons text-base text-green-600 dark:text-green-300">file_download</span>
                    Export deck (CSV)
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>
        <div className="h-full overflow-y-auto px-5 pb-6">
          <DeckList />
        </div>
      </aside>
      <div className="flex-1 bg-black/50" onClick={onClose} aria-hidden="true" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
};

export default DeckDrawer;
