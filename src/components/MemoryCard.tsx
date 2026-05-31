import { Calendar, Trash2, Image as ImageIcon, Mic, Lock } from 'lucide-react';
import type { Memory } from '../types';
import { useMemoryStore } from '../store/useMemoryStore';

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

  const formattedDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Calculate if the memory is currently sealed
  const isLocked = memory.unlock_date ? new Date(memory.unlock_date) > new Date() : false;
  
  const formattedUnlockDate = memory.unlock_date 
    ? new Date(memory.unlock_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div 
      onClick={isLocked ? undefined : onClick} // Disable clicking if locked
      className={`group relative p-5 md:p-6 rounded-3xl bg-vault-900/40 border border-vault-800 transition-all flex flex-col gap-3 overflow-hidden ${
        isLocked ? 'cursor-not-allowed opacity-90' : 'hover:bg-vault-800/60 hover:border-vault-700 cursor-pointer'
      }`}
    >
      {/* If locked, overlay a frosted glass effect */}
      {isLocked && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-vault-950/40 flex flex-col items-center justify-center border border-vault-800/50 rounded-3xl">
          <div className="p-4 bg-vault-900/80 rounded-full mb-3 shadow-2xl border border-vault-700">
            <Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium tracking-widest text-zinc-300 uppercase">Sealed Vault</p>
          <p className="text-xs text-zinc-500 mt-1">Unlocks on {formattedUnlockDate}</p>
          
          {/* Keep the delete button accessible even when locked */}
          <button 
            onClick={handleDelete}
            className="absolute top-6 right-6 text-zinc-600 hover:text-red-400 transition-colors z-20"
          >
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

      {/* We blur the text behind the frosted glass if locked */}
      <h3 className={`text-xl font-serif text-white ${isLocked ? 'blur-sm' : ''}`}>{memory.title}</h3>
      <p className={`text-sm text-zinc-400 line-clamp-2 leading-relaxed ${isLocked ? 'blur-sm' : ''}`}>{memory.reflection}</p>

      {/* Media Indicators */}
      {(memory.image_url || memory.audio_url) && !isLocked && (
        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-vault-800/50 text-zinc-500">
          {memory.image_url && <ImageIcon className="w-4 h-4" />}
          {memory.audio_url && <Mic className="w-4 h-4" />}
        </div>
      )}
    </div>
  );
};