import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Sparkles, LayoutGrid, LineChart } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { MemoryCard } from '../components/MemoryCard';
import { useMemoryStore } from '../store/useMemoryStore';
import { CreateMemoryModal } from '../components/CreateMemoryModal';
import { ViewMemoryModal } from '../components/ViewMemoryModal';
import { SettingsModal } from '../components/SettingsModal';
import { MoodAnalytics } from '../components/MoodAnalytics'; // NEW: Import the Analytics
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
  
  // NEW: State to toggle between the Vault list and the Analytics chart
  const [activeView, setActiveView] = useState<'vault' | 'insights'>('vault');

  useEffect(() => {
    fetchMemories();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email);
    });
  }, [fetchMemories]);

  const today = new Date();
  const onThisDayMemories = useMemo(() => {
    return memories.filter(memory => {
      const memDate = new Date(memory.created_at);
      return (
        memDate.getDate() === today.getDate() &&
        memDate.getMonth() === today.getMonth() &&
        memDate.getFullYear() !== today.getFullYear()
      );
    });
  }, [memories, today]);

  const regularMemories = useMemo(() => {
    return memories.filter(m => !onThisDayMemories.includes(m));
  }, [memories, onThisDayMemories]);

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
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
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

        {/* NEW: View Toggle */}
        <div className="flex items-center gap-2 mb-8 bg-vault-950/40 p-1.5 rounded-2xl border border-vault-800/50 w-fit">
          <button 
            onClick={() => setActiveView('vault')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeView === 'vault' ? 'bg-vault-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutGrid className="w-4 h-4" /> The Vault
          </button>
          <button 
            onClick={() => setActiveView('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeView === 'insights' ? 'bg-vault-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LineChart className="w-4 h-4" /> Insights
          </button>
        </div>

        <section className="space-y-12">
          {activeView === 'insights' ? (
            <MoodAnalytics memories={memories} />
          ) : (
            <>
              {onThisDayMemories.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-2 mb-6 text-amber-500">
                    <Sparkles className="w-4 h-4" />
                    <h2 className="text-xs font-medium tracking-widest uppercase">On This Day</h2>
                  </div>
                  <div className="space-y-4">
                    {onThisDayMemories.map((memory) => (
                      <div key={memory.id} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative">
                          <MemoryCard memory={memory} onClick={() => setSelectedMemory(memory)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {onThisDayMemories.length > 0 && (
                  <h2 className="text-xs font-medium text-zinc-500 tracking-wider uppercase mb-6">
                    Recent Archives
                  </h2>
                )}
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                  {regularMemories.length === 0 && onThisDayMemories.length === 0 ? (
                    <motion.div className="py-12 text-center border border-dashed border-vault-800 rounded-3xl bg-vault-900/20">
                      <p className="text-sm text-zinc-500">Your vault is empty. Begin writing.</p>
                    </motion.div>
                  ) : (
                    regularMemories.map((memory) => (
                      <MemoryCard key={memory.id} memory={memory} onClick={() => setSelectedMemory(memory)} />
                    ))
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </section>
      </main>

      <CreateMemoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} email={userEmail} />
      <ViewMemoryModal memory={selectedMemory} isOpen={!!selectedMemory} onClose={() => setSelectedMemory(null)} />
    </div>
  );
};