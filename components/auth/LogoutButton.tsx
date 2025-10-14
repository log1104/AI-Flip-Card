import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-900/70 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 shadow-sm transition-colors hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-60"
      >
        <span className="material-icons text-base">logout</span>
        {isProcessing ? 'Signing out…' : 'Sign out'}
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-300">{error}</span>}
    </div>
  );
};

export default LogoutButton;
