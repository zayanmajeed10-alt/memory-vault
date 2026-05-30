import { useEffect, useState } from 'react';
import { X, Calendar, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Memory } from '../types';

interface Props {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewMemoryModal = ({ memory, isOpen, onClose }: Props) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  useEffect(() => {
    if (!memory) return;

    const fetchSecureMedia = async () => {
      setIsLoadingMedia(true);
      
      // Request secure, temporary decryption links for the private bucket
      if (memory.image_url) {
        const { data } = await supabase.storage.from('vault-media').createSignedUrl(memory.image_url, 3600);
        if (data) setImageUrl(data.signedUrl);
      } else {
        setImageUrl(null);
      }

      if (memory.audio_url) {
        const { data } = await supabase.storage.from('vault-media').createSignedUrl(memory.audio_url, 3600);
        if (data) setAudioUrl(data.signedUrl);
      } else {
        setAudioUrl(null);
      }
      
      setIsLoadingMedia(false);
    };

    fetchSecureMedia();
  }, [memory]);

  if (!isOpen || !memory) return null;

  const formattedDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-vault-900 border border-vault-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cinematic Header */}
        <div className="flex items-center justify-between p-6 border-b border-vault-800">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-vault-800 text-zinc-300`}>
              {memory.mood}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          <h2 className="text-3xl font-serif text-white tracking-tight">{memory.title}</h2>
          
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
            {memory.reflection}
          </p>

          {/* Secure Media Injection */}
          {(memory.image_url || memory.audio_url) && (
            <div className="pt-6 border-t border-vault-800/50 space-y-4">
              {isLoadingMedia ? (
                <div className="text-sm text-zinc-500 animate-pulse">Decrypting secure media vault...</div>
              ) : (
                <>
                  {imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-vault-800 bg-vault-950">
                      <img src={imageUrl} alt="Memory attachment" className="w-full h-auto max-h-[500px] object-cover" />
                    </div>
                  )}
                  
                  {audioUrl && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-vault-800 bg-vault-950">
                      <div className="p-3 bg-vault-800 rounded-full text-zinc-400">
                        <Mic className="w-5 h-5" />
                      </div>
                      <audio src={audioUrl} controls className="w-full accent-white" />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};