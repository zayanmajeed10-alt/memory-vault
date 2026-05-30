import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { MemoryCard } from '../components/MemoryCard';
import { useMemoryStore } from '../store/useMemoryStore';
import { CreateMemoryModal } from '../components/CreateMemoryModal';
import { ViewMemoryModal } from '../components/ViewMemoryModal'; // 1. We import the new viewer
import type { Memory } from '../types'; // 2. We import the Memory type

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const Dashboard = () => {
  const memories = useMemoryStore((state) => state.recentMemories);
  const fetchMemories = useMemoryStore((state) => state.fetchMemories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null); // 3. State to hold the clicked memory

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Late night reflections.";
    if (hour < 12) return "A quiet morning.";
    if (hour < 17) return "Good afternoon.";
    if (hour < 21) return "Evening thoughts.";
    return "Late night reflections.";
  }, []);

  return (
    <div className="min-h-screen text-vault-100 font-sans selection:bg-zinc-800">
      <AmbientBackground />
      
      <main className="max-w-2xl mx-auto px-5 pt-20 pb-32 md:pt-32">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="text-zinc-500 text-sm md:text-base font-medium tracking-wide uppercase mb-3">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white mb-6">
            {greeting}
          </h1>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" />
            Preserve a Memory
          </button>
        </motion.header>

        <section>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-sm font-medium text-zinc-500 tracking-wider uppercase">
              Recent Entries
            </h2>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {memories.length === 0 ? (
              <motion.div 
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                className="py-12 text-center border border-dashed border-vault-800 rounded-2xl"
              >
                <p className="text-zinc-500">Your vault is empty. Begin writing.</p>
              </motion.div>
            ) : (
              memories.map((memory) => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  // 4. Pass the clicked memory into the new state
                  onClick={() => setSelectedMemory(memory)} 
                />
              ))
            )}
          </motion.div>
        </section>
      </main>

      <CreateMemoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* 5. Drop the viewer into the screen */}
      <ViewMemoryModal 
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />
    </div>
  );
};