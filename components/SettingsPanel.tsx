import React from 'react';
import type { AppSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const themeOptions: Array<{ label: string; value: AppSettings['theme'] }> = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1" onClick={onClose} aria-hidden="true" />
      <div className="relative mr-6 mt-20 w-80 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
            aria-label="Close settings panel"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>
        <div className="px-5 py-4 space-y-6 text-sm text-gray-600 dark:text-gray-300">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Theme</h3>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdateSettings({ theme: option.value })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950 ${
                    settings.theme === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Shuffle</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Randomize cards when starting a study session.</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ shuffle: !settings.shuffle })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.shuffle ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                aria-pressed={settings.shuffle}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.shuffle ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Start face</h3>
            <div className="flex gap-2">
              {(['front', 'back'] as Array<AppSettings['startFace']>).map((face) => (
                <button
                  key={face}
                  onClick={() => onUpdateSettings({ startFace: face })}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950 ${
                    settings.startFace === face
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {face}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
