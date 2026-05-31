import { useState, useRef } from 'react';
import { X, Image, Mic, Square, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion'; 
import { useMemoryStore } from '../store/useMemoryStore';
import { supabase } from '../lib/supabase';
import type { Mood } from '../types';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOODS: Mood[] = ['peaceful', 'nostalgic', 'lost', 'grateful', 'hopeful', 'overwhelmed'];

export const CreateMemoryModal = ({ isOpen, onClose }: CreateMemoryModalProps) => {
  const addMemory = useMemoryStore((state) => state.addMemory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Original Form State
  const [title, setTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState<Mood>('peaceful');

  // Time Capsule State
  const [isSealed, setIsSealed] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');

  // Media Files State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Audio Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const actualMimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualMimeType });
        
        setAudioBlob(blob);
        setAudioPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadMediaFile = async (fileOrBlob: File | Blob, folder: 'images' | 'audio', extension: string) => {
    const fileName = `${Math.random()}.${extension}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('vault-media')
      .upload(filePath, fileOrBlob);

    if (error) throw error;
    return filePath; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reflection.trim()) return;
    setIsSubmitting(true);

    try {
      let image_url = undefined;
      let audio_url = undefined;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        image_url = await uploadMediaFile(imageFile, 'images', ext);
      }
      
      if (audioBlob) {
        const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
        audio_url = await uploadMediaFile(audioBlob, 'audio', ext);
      }
      
      await addMemory({
        title,
        reflection,
        mood,
        image_url,
        audio_url,
        unlock_date: isSealed && unlockDate ? new Date(unlockDate).toISOString() : null, 
      });

      // Reset state and close
      setTitle('');
      setReflection('');
      setMood('peaceful');
      setImageFile(null);
      setImagePreview(null);
      setAudioBlob(null);
      setAudioPreview(null);
      setIsSealed(false);
      setUnlockDate('');
      onClose();
    } catch (err) {
      console.error('Error saving memory:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Responsive background: pushes content to bottom on mobile, centers on desktop
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center bg-black/80 backdrop-blur-md md:p-4 animate-in fade-in duration-300">
      
      {/* Responsive Modal: 100dvh (Full height) on mobile, auto height on desktop */}
      <div className="w-full h-[100dvh] md:h-auto md:max-h-[90vh] max-w-lg bg-vault-900 md:border border-vault-800 md:rounded-3xl flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 duration-500 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-6 border-b border-vault-800 shrink-0 bg-vault-900 z-10">
          <h2 className="text-xl font-serif text-white">Preserve a Memory</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Area with extra bottom padding for mobile keyboard */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide pb-32 md:pb-6">
          <div>
            <input
              type="text"
              placeholder="Give this moment a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl text-white placeholder:text-zinc-600 focus:outline-none border-b border-vault-800 pb-2 focus:border-zinc-500 transition-colors"
              autoFocus
              required
            />
          </div>

          <div>
            <textarea
              placeholder="What are you thinking about?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-zinc-300 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed"
              required
            />
          </div>

          {/* Media Previews Panel */}
          {(imagePreview || audioPreview || isRecording) && (
            <div className="p-4 bg-vault-950/40 border border-vault-800 rounded-xl space-y-3">
              {imagePreview && (
                <div className="relative group rounded-lg overflow-hidden border border-vault-800 max-h-48">
                  <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="flex items-center justify-between py-2 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Recording audio...</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium"
                  >
                    <Square className="w-4 h-4" /> Stop
                  </button>
                </div>
              )}

              {audioPreview && !isRecording && (
                <div className="flex items-center justify-between py-1">
                  <audio src={audioPreview} controls className="h-8 w-2/3 accent-white" />
                  <button
                    type="button"
                    onClick={() => { setAudioBlob(null); setAudioPreview(null); }}
                    className="text-zinc-500 hover:text-white p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Media Actions */}
          <div className="flex items-center gap-3 border-t border-b border-vault-800/50 py-3">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-vault-950/50 px-3 py-2 rounded-xl border border-vault-800 transition-colors"
            >
              <Image className="w-4 h-4" /> Attach Image
            </button>

            {!isRecording && !audioPreview && (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-vault-950/50 px-3 py-2 rounded-xl border border-vault-800 transition-colors"
              >
                <Mic className="w-4 h-4" /> Record Voice Memo
              </button>
            )}
          </div>

          {/* Time Capsule Toggle UI */}
          <div className="p-4 rounded-2xl bg-vault-950/50 border border-vault-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-white">Seal as Time Capsule</span>
              <input 
                type="checkbox" 
                checked={isSealed}
                onChange={(e) => setIsSealed(e.target.checked)}
                className="w-4 h-4 accent-white bg-vault-900 border-vault-700 rounded"
              />
            </label>
            
            {isSealed && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mt-4"
              >
                <input
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} 
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full bg-vault-950 text-white px-4 py-3 rounded-xl border border-vault-800 focus:outline-none focus:border-zinc-500"
                  required={isSealed}
                />
                <p className="text-xs text-zinc-500 mt-2">
                  This memory will be locked and unreadable until this date.
                </p>
              </motion.div>
            )}
          </div>

          <div className="pt-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Current Mood</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    mood === m 
                      ? 'bg-white text-black' 
                      : 'bg-vault-800 text-zinc-400 hover:bg-vault-800/80'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !reflection.trim()}
              className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Securing Media...' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};