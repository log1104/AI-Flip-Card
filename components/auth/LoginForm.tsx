import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

const LoginForm: React.FC = () => {
  const { signInWithEmail, signInWithProvider, oauthProviders } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGoogleEnabled = oauthProviders.google;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-6 shadow-md space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Welcome back</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to continue studying your decks.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-60"
        >
          <span className="material-icons text-base">login</span>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {isGoogleEnabled && (
        <>
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">or continue with</span>
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          <button
            type="button"
            onClick={async () => {
              setError(null);
              try {
                await signInWithProvider('google');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to sign in with Google');
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          >
            <span className="material-icons text-base">g_translate</span>
            Sign in with Google
          </button>
        </>
      )}
    </div>
  );
};

export default LoginForm;
