import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Sparkles, BrainCircuit } from 'lucide-react';
import type { Memory } from '../types';

interface Props {
  memories: Memory[];
}

// We assign a psychological "weight" to each mood to chart the trajectory
const MOOD_SCORES: Record<string, number> = {
  hopeful: 5,
  grateful: 4,
  peaceful: 3,
  nostalgic: 2,
  overwhelmed: 1,
  lost: 0,
};

export const MoodAnalytics = ({ memories }: Props) => {
  const chartData = useMemo(() => {
    // We reverse the memories so the timeline goes from oldest (left) to newest (right)
    return [...memories].reverse().map(memory => {
      const date = new Date(memory.created_at);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: MOOD_SCORES[memory.mood] || 2,
        mood: memory.mood,
        title: memory.title
      };
    });
  }, [memories]);

  // Calculate top mood
  const topMood = useMemo(() => {
    if (memories.length === 0) return 'None';
    const counts = memories.reduce((acc, curr) => {
      acc[curr.mood] = (acc[curr.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }, [memories]);

  if (memories.length < 3) {
    return (
      <div className="py-12 text-center border border-dashed border-vault-800 rounded-3xl bg-vault-900/20">
        <BrainCircuit className="w-8 h-8 mx-auto text-zinc-600 mb-3" />
        <p className="text-sm text-zinc-400">Record at least 3 memories to unlock your emotional trajectory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insight Card 1 */}
        <div className="p-6 rounded-3xl bg-vault-900/40 border border-vault-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Total Entries</p>
            <p className="text-3xl font-serif text-white">{memories.length}</p>
          </div>
          <div className="p-4 bg-vault-950 rounded-full border border-vault-800">
            <BrainCircuit className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
        
        {/* Insight Card 2 */}
        <div className="p-6 rounded-3xl bg-vault-900/40 border border-vault-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Dominant State</p>
            <p className="text-2xl font-serif text-white capitalize">{topMood}</p>
          </div>
          <div className="p-4 bg-vault-950 rounded-full border border-vault-800">
            <Sparkles className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* The Cinematic Chart */}
      <div className="p-6 md:p-8 rounded-3xl bg-vault-900/40 border border-vault-800">
        <h3 className="text-sm font-medium text-zinc-400 tracking-widest uppercase mb-8">Emotional Trajectory</h3>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4d4d8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4d4d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#52525b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                hide={true} 
                domain={[0, 6]} // Pad the top of the chart
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-vault-950 border border-vault-800 p-4 rounded-xl shadow-2xl">
                        <p className="text-white font-medium text-sm">{payload[0].payload.title}</p>
                        <p className="text-zinc-400 text-xs mt-1 capitalize">{payload[0].payload.mood}</p>
                        <p className="text-zinc-600 text-xs mt-2">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#e4e4e7" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};