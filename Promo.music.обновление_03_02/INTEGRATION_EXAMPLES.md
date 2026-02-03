# 🔧 ПРАКТИЧЕСКИЕ ПРИМЕРЫ ИНТЕГРАЦИИ
## promo.music - Supabase Integration Code Examples

---

## 📋 ОГЛАВЛЕНИЕ

1. [Authentication Flow](#authentication-flow)
2. [Profile Management](#profile-management)
3. [Tracks CRUD](#tracks-crud)
4. [File Upload](#file-upload)
5. [Real-time Messages](#real-time-messages)
6. [Donations Flow](#donations-flow)
7. [Analytics Tracking](#analytics-tracking)
8. [Notifications System](#notifications-system)

---

## 🔐 AUTHENTICATION FLOW

### Login Component

```typescript
// src/app/components/login-page.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Успешный вход
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Вход в promo.music
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Войдите, чтобы продолжить
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-400/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                  placeholder="artist@promo.music"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </motion.button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/95 text-gray-400">Или</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Войти через Google
            </button>
          </div>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Нет аккаунта?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
```

### Auth Callback Handler

```typescript
// src/app/components/auth-callback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Загрузка...</div>
    </div>
  );
}
```

---

## 👤 PROFILE MANAGEMENT

### Fetch and Update Profile

```typescript
// src/hooks/useProfile.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
```

### Profile Settings Component

```typescript
// src/app/components/profile-settings.tsx
import { useState } from 'react';
import { useAuthContext } from '@/app/components/auth-provider';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';

export function ProfileSettings() {
  const { user } = useAuthContext();
  const { profile, updateProfile } = useProfile(user?.id);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    phone: profile?.phone || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        alert('Ошибка сохранения: ' + error);
      } else {
        alert('Профиль обновлен!');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        placeholder="Имя"
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
      />
      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        placeholder="Username"
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
      />
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="О себе"
        rows={4}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold disabled:opacity-50"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}
```

---

## 🎵 TRACKS CRUD

### Fetch Tracks Hook

```typescript
// src/hooks/useTracks.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Track = Database['public']['Tables']['tracks']['Row'];

export function useTracks(userId?: string) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, [userId]);

  const fetchTracks = async () => {
    try {
      let query = supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTrack = async (track: Omit<Track, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .insert(track)
        .select()
        .single();

      if (error) throw error;
      setTracks((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const updateTrack = async (id: string, updates: Partial<Track>) => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTracks((prev) => prev.map((t) => (t.id === id ? data : t)));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const deleteTrack = async (id: string) => {
    try {
      const { error } = await supabase.from('tracks').delete().eq('id', id);
      if (error) throw error;
      setTracks((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return { tracks, loading, createTrack, updateTrack, deleteTrack, refetch: fetchTracks };
}
```

### Track Upload Form

```typescript
// src/app/components/track-upload-form.tsx
import { useState } from 'react';
import { useAuthContext } from '@/app/components/auth-provider';
import { useTracks } from '@/hooks/useTracks';
import { supabase } from '@/lib/supabase';
import { Upload, Music, Image } from 'lucide-react';

export function TrackUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuthContext();
  const { createTrack } = useTracks(user?.id);

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !user) return;

    setUploading(true);
    setProgress(0);

    try {
      // Upload audio file
      const audioFileName = `${user.id}/${Date.now()}-${audioFile.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('audio-files')
        .upload(audioFileName, audioFile, {
          onUploadProgress: (progress) => {
            setProgress((progress.loaded / progress.total) * 50);
          }
        });

      if (audioError) throw audioError;

      const { data: audioUrl } = supabase.storage
        .from('audio-files')
        .getPublicUrl(audioFileName);

      // Upload cover (optional)
      let coverUrl = null;
      if (coverFile) {
        const coverFileName = `${user.id}/${Date.now()}-${coverFile.name}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('track-covers')
          .upload(coverFileName, coverFile, {
            onUploadProgress: (progress) => {
              setProgress(50 + (progress.loaded / progress.total) * 30);
            }
          });

        if (coverError) throw coverError;

        const { data: coverUrlData } = supabase.storage
          .from('track-covers')
          .getPublicUrl(coverFileName);

        coverUrl = coverUrlData.publicUrl;
      }

      setProgress(80);

      // Create track record
      const { error: createError } = await createTrack({
        user_id: user.id,
        title,
        genre,
        audio_url: audioUrl.publicUrl,
        cover_url: coverUrl,
        is_public: true,
        plays_count: 0,
        likes_count: 0
      });

      if (createError) throw new Error(createError);

      setProgress(100);
      alert('Трек успешно загружен!');
      
      // Reset form
      setTitle('');
      setGenre('');
      setAudioFile(null);
      setCoverFile(null);
      
      onSuccess?.();
    } catch (error: any) {
      alert('Ошибка загрузки: ' + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white font-semibold mb-2">Название трека</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
          placeholder="Мой новый трек"
        />
      </div>

      <div>
        <label className="block text-white font-semibold mb-2">Жанр</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          <option value="">Выберите жанр</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="hip-hop">Hip-Hop</option>
          <option value="electronic">Electronic</option>
          <option value="jazz">Jazz</option>
        </select>
      </div>

      <div>
        <label className="block text-white font-semibold mb-2">Аудио файл</label>
        <div className="relative">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            required
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="flex items-center justify-center gap-3 w-full px-4 py-8 rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-cyan-400/50 cursor-pointer transition-all duration-300"
          >
            <Music className="w-8 h-8 text-cyan-400" />
            <span className="text-white">
              {audioFile ? audioFile.name : 'Выберите аудио файл'}
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-white font-semibold mb-2">Обложка (опционально)</label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="hidden"
            id="cover-upload"
          />
          <label
            htmlFor="cover-upload"
            className="flex items-center justify-center gap-3 w-full px-4 py-8 rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-purple-400/50 cursor-pointer transition-all duration-300"
          >
            <Image className="w-8 h-8 text-purple-400" />
            <span className="text-white">
              {coverFile ? coverFile.name : 'Выберите обложку'}
            </span>
          </label>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Загрузка...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || !audioFile}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Upload className="w-5 h-5" />
        {uploading ? 'Загрузка...' : 'Загрузить трек'}
      </button>
    </form>
  );
}
```

---

## 📁 FILE UPLOAD

### Avatar Upload Component

```typescript
// src/app/components/avatar-upload.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera } from 'lucide-react';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatarUrl);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 5 МБ');
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUploadSuccess(urlData.publicUrl);
      alert('Аватар обновлен!');
    } catch (error: any) {
      alert('Ошибка загрузки: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-cyan-400/30">
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
            {userId[0].toUpperCase()}
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="avatar-upload"
      />

      <label
        htmlFor="avatar-upload"
        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
      >
        <Camera className="w-8 h-8 text-white" />
      </label>

      {uploading && (
        <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
          <div className="text-white text-sm">Загрузка...</div>
        </div>
      )}
    </div>
  );
}
```

---

## 💬 REAL-TIME MESSAGES

### Messages Hook with Realtime

```typescript
// src/hooks/useMessages.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type Message = Database['public']['Tables']['messages']['Row'];

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const newChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    setChannel(newChannel);
  };

  const sendMessage = async (text: string, senderId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          text
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return { messages, loading, sendMessage, markAsRead };
}
```

### Chat Component

```typescript
// src/app/components/chat.tsx
import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/app/components/auth-provider';
import { useMessages } from '@/hooks/useMessages';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatProps {
  conversationId: string;
}

export function Chat({ conversationId }: ChatProps) {
  const { user } = useAuthContext();
  const { messages, sendMessage } = useMessages(conversationId);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setSending(true);
    try {
      await sendMessage(inputText, user.id);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString('ru', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 💰 DONATIONS FLOW

### Donation Form Component

```typescript
// src/app/components/donation-form.tsx
import { useState } from 'react';
import { useAuthContext } from '@/app/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Heart, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface DonationFormProps {
  recipientId: string;
  recipientName: string;
}

export function DonationForm({ recipientId, recipientName }: DonationFormProps) {
  const { user } = useAuthContext();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);

  const presetAmounts = [100, 300, 500, 1000, 2000, 5000];

  const handleDonate = async () => {
    if (!amount || Number(amount) < 10) {
      alert('Минимальная сумма доната: 10 ₽');
      return;
    }

    setProcessing(true);

    try {
      // Create donation record
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          donor_id: user?.id || null,
          recipient_id: recipientId,
          amount: Number(amount),
          currency: 'RUB',
          message,
          is_anonymous: isAnonymous,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (donationError) throw donationError;

      // В реальном приложении здесь был бы вызов платежного API
      // Например, Stripe или YooKassa
      // const paymentIntent = await createPaymentIntent(donation.id, amount);

      // Для демо просто обновляем статус
      await supabase
        .from('donations')
        .update({ payment_status: 'completed' })
        .eq('id', donation.id);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'donation',
        title: 'Новый донат!',
        message: `Вы получили ${amount} ₽${message ? ': ' + message : ''}`,
        actor_id: user?.id,
        entity_type: 'donation',
        entity_id: donation.id
      });

      alert('Спасибо за поддержку!');
      setAmount('');
      setMessage('');
    } catch (error: any) {
      alert('Ошибка: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <Heart className="w-12 h-12 text-pink-400 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white mb-2">Поддержать {recipientName}</h3>
        <p className="text-gray-400">Отправьте донат артисту</p>
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-3 gap-2">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset.toString())}
            className={`py-3 rounded-xl font-semibold transition-all duration-300 ${
              amount === preset.toString()
                ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {preset} ₽
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Или введите сумму</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="10"
            placeholder="100"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Сообщение (опционально)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Спасибо за вашу музыку!"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50 resize-none"
        />
      </div>

      {/* Anonymous */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          id="anonymous"
          className="w-5 h-5 rounded bg-white/10 border-white/20"
        />
        <label htmlFor="anonymous" className="text-gray-300 text-sm">
          Отправить анонимно
        </label>
      </div>

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDonate}
        disabled={!amount || processing}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Heart className="w-5 h-5" />
        {processing ? 'Обработка...' : `Отправить ${amount ? amount + ' ₽' : 'донат'}`}
      </motion.button>
    </div>
  );
}
```

---

## 📊 ANALYTICS TRACKING

### Track Play Event

```typescript
// src/lib/analytics.ts
import { supabase } from '@/lib/supabase';

export async function trackPlay(
  trackId: string,
  listenerId?: string,
  options?: {
    duration?: number;
    completed?: boolean;
    source?: string;
    deviceType?: string;
  }
) {
  try {
    // Insert play event
    await supabase.from('play_events').insert({
      track_id: trackId,
      listener_id: listenerId || null,
      duration_played: options?.duration,
      completed: options?.completed || false,
      source: options?.source || 'player',
      device_type: options?.deviceType || detectDeviceType()
    });

    // Increment play count (через trigger)
    // Trigger автоматически увеличит plays_count в таблице tracks
  } catch (error) {
    console.error('Error tracking play:', error);
  }
}

function detectDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// В компоненте аудиоплеера:
/*
const handlePlay = () => {
  trackPlay(track.id, user?.id, {
    source: 'profile',
    deviceType: detectDeviceType()
  });
};

const handleEnded = () => {
  trackPlay(track.id, user?.id, {
    duration: audioDuration,
    completed: true
  });
};
*/
```

---

## 🔔 NOTIFICATIONS SYSTEM

### Notifications Hook

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Notification = Database['public']['Tables']['notifications']['Row'];

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Show toast notification
          showToast(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}

function showToast(notification: Notification) {
  // Показать toast уведомление
  // Можно использовать библиотеку типа react-hot-toast или sonner
  console.log('New notification:', notification.title);
}
```

---

## 🎯 ГОТОВО!

Эти примеры покрывают основные use-cases интеграции с Supabase. Используйте их как starting point для реализации полного функционала promo.music!

**Следующие шаги:**
1. Скопируйте примеры в свой проект
2. Адаптируйте под свои нужды
3. Добавьте обработку ошибок
4. Оптимизируйте производительность
5. Добавьте unit тесты

🚀 **Happy coding!**
