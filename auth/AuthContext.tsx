import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

type OAuthProvider = 'google';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  oauthProviders: {
    google: boolean;
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const googleEnabled = import.meta.env.VITE_SUPABASE_GOOGLE_ENABLED !== 'false';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    init();

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    if (provider === 'google' && !googleEnabled) {
      throw new Error('Google sign-in is not enabled.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signOut,
    oauthProviders: {
      google: googleEnabled,
    },
  }), [user, session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
