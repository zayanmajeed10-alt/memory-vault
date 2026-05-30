import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { AmbientBackground } from './AmbientBackground';

export const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Auto-login after signup is usually handled by Supabase if email confirmation is off
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 text-vault-100 font-sans selection:bg-zinc-800">
      <AmbientBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-vault-900/60 backdrop-blur-md border border-vault-800 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif tracking-tight text-white mb-2">Memory Vault</h1>
          <p className="text-zinc-400 text-sm">A quiet place for your thoughts.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-vault-950/50 text-white placeholder:text-zinc-600 px-4 py-3 rounded-xl border border-vault-800 focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-vault-950/50 text-white placeholder:text-zinc-600 px-4 py-3 rounded-xl border border-vault-800 focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white text-black text-sm font-medium rounded-xl disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Unlock Vault' : 'Create Vault')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            {isLogin ? "Don't have a vault? Create one." : "Already have a vault? Unlock it."}
          </button>
        </div>
      </motion.div>
    </div>
  );
};