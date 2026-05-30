import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMemoryStore } from '../store/useMemoryStore';
import type { Mood } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MOODS: Mood[] = ['peaceful', 'nostalgic', 'lost', 'grateful', 'hopeful', 'overwhelmed'];

export const CreateMemoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const addMemory = useMemoryStore((state) => state.addMemory);
  
  const [title, setTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState<Mood>('peaceful');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reflection.trim()) return;

    addMemory({ title, reflection, mood });
    
    // Reset and close
    setTitle('');
    setReflection('');
    setMood('peaceful');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-1/4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl bg-vault-900 border border-vault-800 p-6 md:p-8 rounded-3xl z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif text-white">Preserve a Memory</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Give this moment a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-xl text-white placeholder:text-zinc-600 focus:outline-none border-b border-vault-800 pb-2 focus:border-zinc-500 transition-colors"
                autoFocus
              />
              
              <textarea
                placeholder="What are you thinking about?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full bg-transparent text-zinc-300 placeholder:text-zinc-600 focus:outline-none resize-none h-32 leading-relaxed"
              />

              <div className="pt-4 border-t border-vault-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Current Mood</p>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                        mood === m 
                          ? 'bg-white text-black' 
                          : 'bg-vault-800 text-zinc-400 hover:bg-vault-800/80'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={!title.trim() || !reflection.trim()}
                  className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};