import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Memory } from '../types';

interface MemoryStore {
  recentMemories: Memory[];
  fetchMemories: () => Promise<void>;
  addMemory: (memory: Omit<Memory, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  // 1. Added to the interface here:
  deleteMemory: (id: string) => Promise<void>; 
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  recentMemories: [], 

  fetchMemories: async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) return;

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching vault:', error);
    } else if (data) {
      set({ recentMemories: data });
    }
  },

  addMemory: async (newMemoryData) => {
    const { data: session } = await supabase.auth.getSession();
    const activeUserId = session.session?.user.id;

    if (!activeUserId) {
      console.error('No secure session found.');
      return;
    }
    
    const { data, error } = await supabase
      .from('memories')
      .insert([{ 
        ...newMemoryData, 
        user_id: activeUserId 
      }])
      .select()
      .single();

    if (error) {
      console.error('Error securing memory:', error);
    } else if (data) {
      set((state) => ({
        recentMemories: [data, ...state.recentMemories]
      }));
    }
  }, // <-- Notice the comma added here before the new function

  // 2. Added the actual delete logic here at the bottom:
  deleteMemory: async (id: string) => {
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
      
      // Instantly remove it from the UI
      set((state) => ({
        recentMemories: state.recentMemories.filter((m) => m.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }
}));