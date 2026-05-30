export type Mood = 'peaceful' | 'nostalgic' | 'lost' | 'grateful' | 'hopeful' | 'overwhelmed';

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  reflection: string;
  mood: Mood;
  image_url?: string | null;
  audio_url?: string | null;
  location?: string | null;
  created_at: string;
}