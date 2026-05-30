import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './components/Auth';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check if the user is already logged in when the app opens
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Listen for log in or log out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-vault-950 flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-vault-800 border-t-white rounded-full animate-spin" />
    </div>;
  }

  // If no secure session, show the lock screen. Otherwise, show the vault.
  return !session ? <Auth /> : <Dashboard />;
}