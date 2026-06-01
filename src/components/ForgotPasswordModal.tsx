import { useState } from 'react';
import { X, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: Props) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?reset=true`,
      });

      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-vault-900 border border-vault-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-vault-800">
          <h2 className="text-xl font-serif text-white">Recover Access</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isSent ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-vault-950 border border-vault-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Transmission Sent</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                If an account exists for <span className="text-white font-medium">{email}</span>, a secure recovery protocol has been dispatched to your inbox.
              </p>
              <button onClick={onClose} className="mt-4 w-full py-3 bg-white text-black text-sm font-medium rounded-xl hover:scale-[1.02] transition-transform">
                Return to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter the email address associated with your vault. We will send you a secure link to bypass the lock and reset your credentials.
              </p>

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Vault Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-vault-950 text-white pl-11 pr-4 py-3 rounded-xl border border-vault-800 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Enter your email..."
                    required
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black text-sm font-medium rounded-xl disabled:opacity-50 hover:scale-[1.02] transition-transform"
              >
                {isSubmitting ? 'Initiating Protocol...' : 'Send Recovery Link'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};