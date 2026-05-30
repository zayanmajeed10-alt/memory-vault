import React from 'react';
import { motion } from 'framer-motion';
import { Play, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Memory } from '../types';

interface MemoryCardProps {
  memory: Memory;
  onClick: (id: string) => void;
}

const moodColors: Record<string, string> = {
  peaceful: 'text-emerald-400/80 bg-emerald-400/10',
  nostalgic: 'text-amber-400/80 bg-amber-400/10',
  lost: 'text-indigo-400/80 bg-indigo-400/10',
  grateful: 'text-rose-400/80 bg-rose-400/10',
  hopeful: 'text-sky-400/80 bg-sky-400/10',
  overwhelmed: 'text-zinc-400/80 bg-zinc-400/10',
};

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onClick }) => {
  return (
    <motion.button
      onClick={() => onClick(memory.id)}
      layoutId={`memory-card-${memory.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(28, 28, 31, 0.7)' }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left flex flex-col gap-4 p-5 md:p-6 rounded-2xl bg-vault-900/40 backdrop-blur-md border border-vault-800/50 transition-colors duration-300"
    >
      <div className="flex justify-between items-start w-full">
        <span className={`px-2.5 py-1 text-xs tracking-wider uppercase rounded-full font-medium ${moodColors[memory.mood]}`}>
          {memory.mood}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(memory.created_at), 'MMM d, yyyy')}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-serif text-vault-100 font-medium tracking-tight">
          {memory.title}
        </h3>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-3">
          {memory.reflection}
        </p>
      </div>

      {(memory.location || memory.audio_url) && (
        <div className="flex items-center gap-4 mt-2 pt-4 border-t border-vault-800/50 w-full">
          {memory.location && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <MapPin className="w-3.5 h-3.5" />
              {memory.location}
            </div>
          )}
          {memory.audio_url && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Play className="w-3.5 h-3.5" />
              Voice Note
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
};