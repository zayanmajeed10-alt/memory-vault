import { X, Lock, ScanFace, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  email: string | undefined;
}

export const SettingsModal = ({ isOpen, onClose, email }: Props) => {
  if (!isOpen) return null;

  const handleLinkFaceID = async () => {
    try {
      const { error } = await supabase.auth.registerPasskey();
      if (error) throw error;
      alert("Biometrics successfully locked in.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLockVault = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error locking vault:', error.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-vault-900 border border-vault-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-vault-800">
          <h2 className="text-xl font-serif text-white">Vault Settings</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Info */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Account</p>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-vault-950 border border-vault-800">
              <div className="p-2 bg-vault-800 rounded-full text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <p className="text-sm text-zinc-300 truncate">{email || 'Encrypted User'}</p>
            </div>
          </div>

          {/* Security Actions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Security</p>
            
            <button 
              onClick={handleLinkFaceID}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-vault-950 border border-vault-800 hover:bg-vault-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3 text-zinc-300 group-hover:text-white">
                <ScanFace className="w-5 h-5" />
                <span className="text-sm font-medium">Register Face ID</span>
              </div>
            </button>

            <button 
              onClick={handleLockVault}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-vault-950 border border-vault-800 hover:bg-red-500/10 hover:border-red-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3 text-red-400">
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Lock & Exit Vault</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};