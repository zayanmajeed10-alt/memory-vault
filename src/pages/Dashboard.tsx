import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { MemoryCard } from '../components/MemoryCard';
import { useMemoryStore } from '../store/useMemoryStore';
import { CreateMemoryModal } from '../components/CreateMemoryModal';
import { ViewMemoryModal } from '../components/ViewMemoryModal';
import { SettingsModal } from '../components/SettingsModal'; // We import the new Settings Panel
import { supabase } from '../lib/supabase';
import type { Memory } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

export const Dashboard = () => {
  const memories = useMemoryStore((state) => state.recentMemories);
  const fetchMemories = useMemoryStore((state) => state.fetchMemories);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    fetchMemories();
    // This grabs the logged-in user's email to show inside the settings panel
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email);
    });
  }, [fetchMemories]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "The quiet hours are when the best things are forged.";
    if (hour < 12) return "A quiet morning. A blank canvas.";
    if (hour < 17) return "Keep the momentum going.";
    if (hour < 21) return "Evening thoughts. Time to reflect.";
    return "The day is done, but the mind is still awake.";
  }, []);

  return (
    <div className="min-h-screen text-vault-100 font-sans selection:bg-zinc-800">
      <AmbientBackground />
      
      <main className="max-w-2xl mx-auto px-5 pt-12 pb-32 md:pt-32">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            <p className="text-zinc-500 text-xs md:text-sm font-medium tracking-wide uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-white leading-tight">
              {greeting}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* The new Settings Gear Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-vault-900/50 backdrop-blur-md border border-vault-800 text-zinc-400 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-3 h-12 rounded-full bg-white text-black text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Preserve
            </button>
          </div>
        </motion.header>

        <section>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
              Recent Archives
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
                className="py-12 text-center border border-dashed border-vault-800 rounded-3xl bg-vault-900/20"
              >
                <p className="text-sm text-zinc-500">Your vault is empty. Begin writing.</p>
              </motion.div>
            ) : (
              memories.map((memory) => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  onClick={() => setSelectedMemory(memory)} 
                />
              ))
            )}
          </motion.div>
        </section>
      </main>

      <CreateMemoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} email={userEmail} />
      <ViewMemoryModal memory={selectedMemory} isOpen={!!selectedMemory} onClose={() => setSelectedMemory(null)} />
    </div>
  );
};