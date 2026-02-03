/**
 * TRACK UPLOAD PAGE
 * Страница загрузки трека на модерацию
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music2, Image, Check, AlertCircle, Info, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface UploadStats {
  current: number;
  limit: number;
  remaining: number;
  subscription: string;
}

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Dance',
  'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass',
  'Jazz', 'Blues', 'Classical', 'Country', 'Folk',
  'Reggae', 'Metal', 'Punk', 'Indie', 'Alternative',
  'Soul', 'Funk', 'Disco', 'Gospel', 'Latin', 'World'
];

export function TrackUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    coverImage: null as File | null,
    audioFile: null as File | null,
    duration: 0,
    yandex_music_url: '',
    youtube_url: '',
    spotify_url: '',
    apple_music_url: ''
  });

  const [previews, setPreviews] = useState({
    cover: '',
    audio: ''
  });

  // Загрузить статистику
  useEffect(() => {
    fetchUploadStats();
  }, []);

  const fetchUploadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/track-moderation/uploadStats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUploadStats(data);
      }
    } catch (error) {
      console.error('Error fetching upload stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Обработка выбора файлов
  const handleFileSelect = (type: 'cover' | 'audio', file: File) => {
    if (type === 'cover') {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер обложки не должен превышать 5 МБ');
        return;
      }
      setFormData({ ...formData, coverImage: file });
      setPreviews({ ...previews, cover: URL.createObjectURL(file) });
    } else {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Размер аудиофайла не должен превышать 50 МБ');
        return;
      }

      // Получить длительность
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        setFormData(prev => ({ ...prev, audioFile: file, duration: Math.floor(audio.duration) }));
        setPreviews(prev => ({ ...prev, audio: URL.createObjectURL(file) }));
      });
    }
  };

  // Загрузить файл в Supabase Storage
  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    
    // В реальности здесь должна быть загрузка в Supabase Storage
    // Для демо возвращаем фейковый URL
    return `https://example.com/${bucket}/${fileName}`;
  };

  // Отправить форму
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coverImage || !formData.audioFile) {
      toast.error('Загрузите обложку и аудиофайл');
      return;
    }

    if (!formData.title || !formData.artist || !formData.genre) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setUploading(true);

    try {
      // 1. Загрузить файлы
      toast.loading('Загрузка файлов...');
      const coverUrl = await uploadFile(formData.coverImage, 'covers');
      const audioUrl = await uploadFile(formData.audioFile, 'tracks');

      // 2. Отправить данные на сервер
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/track-moderation/submitTrack`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            artist: formData.artist,
            cover_image_url: coverUrl,
            audio_file_url: audioUrl,
            duration: formData.duration,
            genre: formData.genre,
            yandex_music_url: formData.yandex_music_url || null,
            youtube_url: formData.youtube_url || null,
            spotify_url: formData.spotify_url || null,
            apple_music_url: formData.apple_music_url || null
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('✅ Трек отправлен на модерацию!');
        
        // Очистить форму
        setFormData({
          title: '',
          artist: '',
          genre: '',
          coverImage: null,
          audioFile: null,
          duration: 0,
          yandex_music_url: '',
          youtube_url: '',
          spotify_url: '',
          apple_music_url: ''
        });
        setPreviews({ cover: '', audio: '' });
        
        // Обновить статистику
        fetchUploadStats();
      } else if (data.upgrade_required) {
        toast.error(data.message, { duration: 5000 });
      } else {
        toast.error(data.error || 'Ошибка загрузки');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка при загрузке трека');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Загрузить трек</h1>
          <p className="text-gray-400">Отправьте свой трек на модерацию</p>
        </motion.div>

        {/* Upload Stats */}
        {!loadingStats && uploadStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white font-medium">
                    Использовано: {uploadStats.current} / {uploadStats.limit} треков в этом месяце
                  </p>
                  <p className="text-sm text-gray-400">
                    Осталось: {uploadStats.remaining} {uploadStats.remaining === 1 ? 'трек' : 'треков'}
                  </p>
                </div>
              </div>
              {uploadStats.subscription === 'basic' && (
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                  <Crown className="w-4 h-4" />
                  Обновить план
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Cover & Audio Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover Image */}
            <div className="relative group">
              <label className="block text-white font-medium mb-3">
                Обложка трека <span className="text-red-400">*</span>
              </label>
              <div
                className={`relative h-64 rounded-xl border-2 border-dashed ${
                  previews.cover ? 'border-cyan-400' : 'border-white/20'
                } bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer overflow-hidden`}
              >
                {previews.cover ? (
                  <img src={previews.cover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">JPG, PNG, GIF или WebP</p>
                    <p className="text-gray-500 text-xs mt-1">Макс 5 МБ</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect('cover', e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Audio File */}
            <div className="relative group">
              <label className="block text-white font-medium mb-3">
                Аудиофайл <span className="text-red-400">*</span>
              </label>
              <div
                className={`relative h-64 rounded-xl border-2 border-dashed ${
                  formData.audioFile ? 'border-purple-400' : 'border-white/20'
                } bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer`}
              >
                {formData.audioFile ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Check className="w-12 h-12 text-green-400 mb-2" />
                    <p className="text-white font-medium">{formData.audioFile.name}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Длительность: {Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Music2 className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">MP3 или WAV</p>
                    <p className="text-gray-500 text-xs mt-1">Макс 50 МБ</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="audio/mpeg,audio/wav"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect('audio', e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Информация о треке</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Название трека <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Введите название"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Исполнитель <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Имя артиста"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Жанр <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">Выберите жанр</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre} className="bg-gray-800">
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Streaming Links */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-white font-medium mb-3">Ссылки на стриминговые платформы (опционально)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  value={formData.yandex_music_url}
                  onChange={(e) => setFormData({ ...formData, yandex_music_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Яндекс.Музыка"
                />
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="YouTube"
                />
                <input
                  type="url"
                  value={formData.spotify_url}
                  onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Spotify"
                />
                <input
                  type="url"
                  value={formData.apple_music_url}
                  onChange={(e) => setFormData({ ...formData, apple_music_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Apple Music"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !formData.coverImage || !formData.audioFile}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Отправить на модерацию
              </>
            )}
          </button>

          {/* Info */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">После отправки:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>Ваш трек попадет в очередь модерации</li>
                  <li>Модератор проверит качество и соответствие правилам</li>
                  <li>Вы получите уведомление о результате</li>
                  <li>При одобрении вы получите 50 Promo-коинов 🪙</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}