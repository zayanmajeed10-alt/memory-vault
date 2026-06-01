import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ScanFace } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AmbientBackground } from './AmbientBackground';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NEW: State to control the Forgot Password Modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handlePasswordAuth = async (e: React.FormEvent) => {
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
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        // Unlock with existing FaceID/TouchID using the correct Beta method
        const { error } = await supabase.auth.signInWithPasskey();
        if (error) throw error;
      } else {
        // Enforce the Supabase rule: You must be logged in to register a new biometric key
        setError("To use Face ID, please Create a Vault with a password first. You can link your biometrics afterwards.");
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
        className="w-full max-w-md bg-vault-900/60 backdrop-blur-md border border-vault-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif tracking-tight text-white mb-2">Memory Vault</h1>
          <p className="text-zinc-400 text-sm">A quiet place for your thoughts.</p>
        </div>

        <form onSubmit={handlePasswordAuth} className="space-y-5">
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-vault-950/50 text-white placeholder:text-zinc-600 px-4 py-3 rounded-xl border border-vault-800 focus:outline-none focus:border-zinc-500 transition-colors pr-12"
                required={!isLogin} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* NEW: Forgot Password Button (Only shows during Login) */}
            {isLogin && (
              <div className="flex justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-vault-800 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:bg-vault-700 transition-colors"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Unlock with Password' : 'Create with Password')}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-vault-800 flex-1"></div>
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Or</span>
          <div className="h-px bg-vault-800 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={handleBiometricAuth}
          disabled={isLoading}
          className="w-full py-3 flex items-center justify-center gap-2 bg-white text-black text-sm font-medium rounded-xl disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <ScanFace className="w-4 h-4" />
          {isLogin ? 'Unlock with Face ID' : 'Register Face ID'}
        </button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            {isLogin ? "Don't have a vault? Create one." : "Already have a vault? Unlock it."}
          </button>
        </div>
      </motion.div>

      {/* NEW: The Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
      />
    </div>
  );
};