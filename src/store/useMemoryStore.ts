import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Memory } from '../types';

interface MemoryStore {
  recentMemories: Memory[];
  fetchMemories: () => Promise<void>;
  addMemory: (memory: Omit<Memory, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  recentMemories: [], 

  fetchMemories: async () => {
    // Only fetch if a user is logged in
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
    // 1. Get the actual user ID from the active secure session
    const { data: session } = await supabase.auth.getSession();
    const activeUserId = session.session?.user.id;

    if (!activeUserId) {
      console.error('No secure session found.');
      return;
    }
    
    // 2. Insert the memory attached to the real user ID
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
  }
}));