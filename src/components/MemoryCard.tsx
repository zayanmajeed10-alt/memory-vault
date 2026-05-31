import { Calendar, Trash2, Image as ImageIcon, Mic, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Memory } from '../types';
import { useMemoryStore } from '../store/useMemoryStore';
import { playPremiumClick, playDeepHum } from '../lib/sounds'; // The new sound engine

interface Props {
  memory: Memory;
  onClick: () => void;
}

export const MemoryCard = ({ memory, onClick }: Props) => {
  const deleteMemory = useMemoryStore((state) => state.deleteMemory);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this memory?")) {
      deleteMemory(memory.id);
    }
  };

  const handleCardClick = () => {
    playPremiumClick();
    onClick();
  };

  const handleLockedClick = () => {
    playDeepHum(); // Plays a low error-style rumble when clicking a locked capsule
  };

  const formattedDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const isLocked = memory.unlock_date ? new Date(memory.unlock_date) > new Date() : false;
  
  const formattedUnlockDate = memory.unlock_date 
    ? new Date(memory.unlock_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    // Spring physics added here: whileHover and whileTap!
    <motion.div 
      whileHover={isLocked ? {} : { scale: 0.98 }}
      whileTap={isLocked ? { scale: 0.99 } : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={isLocked ? handleLockedClick : handleCardClick}
      className={`group relative p-5 md:p-6 rounded-3xl bg-vault-900/40 border border-vault-800 flex flex-col gap-3 overflow-hidden ${
        isLocked ? 'cursor-not-allowed opacity-90' : 'hover:bg-vault-800/60 hover:border-vault-700 cursor-pointer'
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 z-10 backdrop-blur-2xl bg-vault-950/60 flex flex-col items-center justify-center border border-vault-800/50 rounded-3xl transition-all duration-500 hover:backdrop-blur-3xl">
          <div className="p-4 bg-vault-900/80 rounded-full mb-3 shadow-2xl border border-vault-700">
            <Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium tracking-widest text-zinc-300 uppercase">Sealed Vault</p>
          <p className="text-xs text-zinc-500 mt-1">Unlocks on {formattedUnlockDate}</p>
          
          <button onClick={handleDelete} className="absolute top-6 right-6 text-zinc-600 hover:text-red-400 transition-colors z-20">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-vault-950 text-zinc-400">
          {memory.mood}
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <button 
            onClick={handleDelete}
            className={`text-zinc-600 hover:text-red-400 transition-opacity p-1 ${isLocked ? 'hidden' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className={`text-xl font-serif text-white ${isLocked ? 'blur-md' : ''}`}>{memory.title}</h3>
      <p className={`text-sm text-zinc-400 line-clamp-2 leading-relaxed ${isLocked ? 'blur-md' : ''}`}>{memory.reflection}</p>

      {(memory.image_url || memory.audio_url) && !isLocked && (
        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-vault-800/50 text-zinc-500">
          {memory.image_url && <ImageIcon className="w-4 h-4" />}
          {memory.audio_url && <Mic className="w-4 h-4" />}
        </div>
      )}
    </motion.div>
  );
};