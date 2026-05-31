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
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] max-w-3xl bg-transparent md:bg-vault-900/20 md:border border-vault-800/50 md:rounded-[2.5rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Minimalist Cinematic Header */}
        <div className="flex items-center justify-between p-6 md:p-8">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 text-xs font-medium uppercase tracking-widest rounded-full border border-vault-800 text-zinc-400">
              {memory.mood}
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-500 font-medium tracking-wide">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>
          <button onClick={onClose} className="p-3 bg-vault-900/50 rounded-full text-zinc-400 hover:text-white hover:bg-vault-800 transition-all cursor-pointer backdrop-blur-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editorial Content Area */}
        <div className="p-6 md:p-12 overflow-y-auto space-y-10 scrollbar-hide">
          <h2 className="text-4xl md:text-5xl font-serif text-white/90 leading-tight tracking-tight">
            {memory.title}
          </h2>
          
          <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap text-lg md:text-xl font-light">
            {memory.reflection}
          </p>

          {/* Secure Media Injection with Slow Pan */}
          {(memory.image_url || memory.audio_url) && (
            <div className="pt-8 space-y-6">
              {isLoadingMedia ? (
                <div className="text-sm text-zinc-600 animate-pulse tracking-widest uppercase">Decrypting...</div>
              ) : (
                <>
                  {imageUrl && (
                    <div className="rounded-2xl overflow-hidden bg-black relative group">
                      <img 
                        src={imageUrl} 
                        alt="Memory attachment" 
                        className="w-full h-auto max-h-[600px] object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2000ms] ease-out" 
                      />
                    </div>
                  )}
                  
                  {audioUrl && (
                    <div className="flex items-center gap-4 p-4 rounded-3xl border border-vault-800/50 bg-vault-900/30 backdrop-blur-md">
                      <div className="p-4 bg-black rounded-full text-zinc-400 shadow-inner">
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