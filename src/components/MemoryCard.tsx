import { Calendar, Trash2, Image as ImageIcon, Mic } from 'lucide-react';
import type { Memory } from '../types';
import { useMemoryStore } from '../store/useMemoryStore';

interface Props {
  memory: Memory;
  onClick: () => void;
}

export const MemoryCard = ({ memory, onClick }: Props) => {
  const deleteMemory = useMemoryStore((state) => state.deleteMemory);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // This stops the click from opening the viewer!
    if (window.confirm("Are you sure you want to permanently delete this memory?")) {
      deleteMemory(memory.id);
    }
  };

  const formattedDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div 
      onClick={onClick}
      className="group relative p-5 md:p-6 rounded-3xl bg-vault-900/40 border border-vault-800 hover:bg-vault-800/60 hover:border-vault-700 transition-all cursor-pointer flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-vault-950 text-zinc-400">
          {memory.mood}
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          {/* Here is the new Delete Button */}
          <button 
  onClick={handleDelete}
  // We added md: to the opacity rules to target laptops, and left it visible for mobile
  className="text-zinc-600 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
>
  <Trash2 className="w-4 h-4" />
</button>
        </div>
      </div>

      <h3 className="text-xl font-serif text-white">{memory.title}</h3>
      <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{memory.reflection}</p>

      {/* Media Indicators */}
      {(memory.image_url || memory.audio_url) && (
        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-vault-800/50 text-zinc-500">
          {memory.image_url && <ImageIcon className="w-4 h-4" />}
          {memory.audio_url && <Mic className="w-4 h-4" />}
        </div>
      )}
    </div>
  );
};