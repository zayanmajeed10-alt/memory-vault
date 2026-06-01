import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './components/Auth';
import { UpdatePasswordModal } from './components/UpdatePasswordModal'; // Added Import
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false); // Added State

  useEffect(() => {
    // 1. Check if the user is already logged in when the app opens
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Listen for log in, log out, or password recovery events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      // 3. Trigger the new password modal if returning from a reset email
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-950 flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-vault-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* If no secure session, show the lock screen. Otherwise, show the vault. */}
      {!session ? <Auth /> : <Dashboard />}
      
      {/* The Password Recovery Modal injected at the root level */}
      <UpdatePasswordModal 
        isOpen={isRecoveryMode} 
        onSuccess={() => setIsRecoveryMode(false)} 
      />
    </>
  );
}