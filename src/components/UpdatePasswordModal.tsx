import { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
}

export const UpdatePasswordModal = ({ isOpen, onSuccess }: Props) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to secure new password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-vault-900 border border-vault-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-8">
        <div className="w-12 h-12 bg-vault-950 border border-vault-800 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-white" />
        </div>
        
        <h2 className="text-2xl font-serif text-white mb-2">Secure New Password</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          Your identity has been verified. Please establish a new master password for your vault.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-vault-950 text-white px-4 py-3 rounded-xl border border-vault-800 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="Minimum 6 characters..."
              required
            />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black text-sm font-medium rounded-xl disabled:opacity-50 hover:scale-[1.02] transition-transform"
          >
            {isSubmitting ? 'Encrypting...' : 'Lock Vault'}
            {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};