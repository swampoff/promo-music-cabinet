import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music, Loader2, CheckCircle, Play, Pause, Volume2, Image as ImageIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  coverImage: string;
  audioUrl?: string;
}

interface NewTrackTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tracks?: Track[];
}

export function NewTrackTestModal({ isOpen, onClose, onSuccess, tracks = [] }: NewTrackTestModalProps) {
  const [step, setStep] = useState<'select' | 'upload' | 'confirm' | 'payment' | 'success'>('select');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Upload state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: '',
    genre: '',
    audioFile: null as File | null,
    coverFile: null as File | null,
    audioPreview: null as string | null,
    coverPreview: null as string | null
  });

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    setStep('confirm');
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Файл слишком большой. Максимум 50MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setUploadForm(prev => ({
        ...prev,
        audioFile: file,
        audioPreview: url
      }));
      setError(null);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Изображение слишком большое. Максимум 5MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setUploadForm(prev => ({
        ...prev,
        coverFile: file,
        coverPreview: url
      }));
      setError(null);
    }
  };

  const handleUploadSubmit = () => {
    // Валидация
    if (!uploadForm.title.trim()) {
      setError('Введите название трека');
      return;
    }
    if (!uploadForm.artist.trim()) {
      setError('Введите имя артиста');
      return;
    }
    if (!uploadForm.audioFile) {
      setError('Загрузите аудио файл');
      return;
    }

    // Создаем временный трек для подтверждения
    const newTrack: Track = {
      id: Date.now(),
      title: uploadForm.title,
      artist: uploadForm.artist,
      genre: uploadForm.genre || 'Не указан',
      coverImage: uploadForm.coverPreview || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
      audioUrl: uploadForm.audioPreview || undefined
    };

    setSelectedTrack(newTrack);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!selectedTrack) return;

    try {
      setLoading(true);
      setError(null);

      // Создание заявки
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/track-test/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: 'demo-user-123',
            track_id: selectedTrack.id.toString(),
            track_title: selectedTrack.title,
            artist_name: selectedTrack.artist,
            genre: selectedTrack.genre,
            guest_track_url: selectedTrack.audioUrl,
            guest_cover_url: selectedTrack.coverImage
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      const data = await response.json();
      
      if (data.success) {
        // Симуляция оплаты
        await handlePayment(data.request_id);
      } else {
        throw new Error(data.error || 'Failed to create request');
      }

    } catch (err) {
      console.error('Error creating track test request:', err);
      setError(err instanceof Error ? err.message : 'Не удалось создать заявку');
      setLoading(false);
    }
  };

  const handlePayment = async (requestId: string) => {
    try {
      setStep('payment');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/track-test/payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            request_id: requestId,
            payment_method: 'card',
            transaction_id: `TXN_${Date.now()}`
          })
        }
      );

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        throw new Error(data.error || 'Payment failed');
      }

    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Ошибка оплаты');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedTrack(null);
    setError(null);
    setLoading(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Очистка upload form
    setUploadForm({
      title: '',
      artist: '',
      genre: '',
      audioFile: null,
      coverFile: null,
      audioPreview: null,
      coverPreview: null
    });
    onClose();
  };

  // Mock треки для демонстрации с аудио
  const demoTracks: Track[] = tracks.length > 0 ? tracks : [
    {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Александр Иванов',
      genre: 'Electronic',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: 2,
      title: 'Summer Vibes',
      artist: 'Александр Иванов',
      genre: 'House',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
      id: 3,
      title: 'Urban Pulse',
      artist: 'Александр Иванов',
      genre: 'Techno',
      coverImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {step === 'select' && 'Выберите трек'}
                  {step === 'upload' && 'Загрузить трек'}
                  {step === 'confirm' && 'Подтверждение'}
                  {step === 'payment' && 'Обработка оплаты...'}
                  {step === 'success' && 'Успешно!'}
                </h3>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm sm:text-base"
                >
                  {error}
                </motion.div>
              )}

              {/* Select Step */}
              {step === 'select' && (
                <div className="space-y-4">
                  <p className="text-gray-400 mb-4 text-sm md:text-base">
                    Выберите трек из вашей библиотеки для профессиональной оценки
                  </p>

                  <div className="space-y-3">
                    {demoTracks.map((track) => (
                      <motion.div
                        key={track.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          {/* Cover with Play button overlay */}
                          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg flex-shrink-0 group cursor-pointer">
                            <div
                              className="w-full h-full rounded-lg bg-cover bg-center"
                              style={{ backgroundImage: `url(${track.coverImage})` }}
                            />
                            {track.audioUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (audioRef.current) {
                                    if (isPlaying && currentTrackUrl === track.audioUrl) {
                                      audioRef.current.pause();
                                      setIsPlaying(false);
                                      setCurrentTrackUrl(null);
                                    } else {
                                      audioRef.current.src = track.audioUrl;
                                      setCurrentTrackUrl(track.audioUrl);
                                      audioRef.current.play().then(() => {
                                        setIsPlaying(true);
                                      }).catch(err => {
                                        console.error('Error playing audio:', err);
                                        setError('Не удалось воспроизвести трек');
                                      });
                                    }
                                  }
                                }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                              >
                                {isPlaying && currentTrackUrl === track.audioUrl ? (
                                  <Pause className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
                                ) : (
                                  <Play className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm md:text-base truncate">
                              {track.title}
                            </h4>
                            <p className="text-xs md:text-sm text-gray-400 truncate">{track.artist}</p>
                            <p className="text-xs text-gray-500 truncate">{track.genre}</p>
                          </div>

                          {/* Select Button */}
                          <button
                            onClick={() => handleSelectTrack(track)}
                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors text-sm md:text-base flex-shrink-0"
                          >
                            Выбрать
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Audio Player */}
                  <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => {
                      setIsPlaying(false);
                      setCurrentTrackUrl(null);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Player Controls */}
                  {isPlaying && duration > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 md:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <button
                          onClick={handlePlayPause}
                          className="p-1.5 md:p-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors flex-shrink-0"
                        >
                          {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 md:h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 md:[&::-webkit-slider-thumb]:w-4 md:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                          />
                        </div>
                        <span className="text-xs md:text-sm text-gray-400 flex-shrink-0 min-w-[70px] md:min-w-[90px] text-right">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0 hidden sm:block" />
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <button 
                      onClick={() => setStep('upload')}
                      className="w-full px-4 py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <Upload className="w-4 h-4 md:w-5 md:h-5" />
                      Загрузить новый трек
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Step */}
              {step === 'upload' && (
                <div className="space-y-4">
                  <p className="text-gray-400 mb-4">
                    Загрузите свой трек для профессиональной оценки
                  </p>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Название трека *
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Введите название"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Artist */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Артист *
                    </label>
                    <input
                      type="text"
                      value={uploadForm.artist}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="Введите имя артиста"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Жанр
                    </label>
                    <input
                      type="text"
                      value={uploadForm.genre}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="Например: Electronic, House, Techno"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Audio Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Аудио файл * (MP3, WAV, до 50MB)
                    </label>
                    <label className="block cursor-pointer">
                      <div className="p-6 rounded-xl bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/30 transition-colors text-center">
                        {uploadForm.audioFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <Music className="w-5 h-5 text-purple-400" />
                            <span className="text-white">{uploadForm.audioFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400">Нажмите для загрузки аудио</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="audio/mp3,audio/wav,audio/mpeg"
                        onChange={handleAudioFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Cover Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Обложка (JPG, PNG, до 5MB)
                    </label>
                    <label className="block cursor-pointer">
                      <div className="p-6 rounded-xl bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/30 transition-colors">
                        {uploadForm.coverPreview ? (
                          <div className="flex items-center justify-center gap-4">
                            <img
                              src={uploadForm.coverPreview}
                              alt="Cover preview"
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <span className="text-white">{uploadForm.coverFile?.name}</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400">Нажмите для загрузки обложки</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleCoverFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setStep('select')}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleUploadSubmit}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                      Продолжить
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Step */}
              {step === 'confirm' && selectedTrack && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg flex-shrink-0 group cursor-pointer">
                      <div
                        className="w-full h-full rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${selectedTrack.coverImage})` }}
                      />
                      {/* Play button overlay on cover */}
                      {selectedTrack.audioUrl && (
                        <button
                          onClick={() => {
                            if (audioRef.current && selectedTrack.audioUrl) {
                              if (isPlaying && currentTrackUrl === selectedTrack.audioUrl) {
                                audioRef.current.pause();
                                setIsPlaying(false);
                              } else {
                                audioRef.current.src = selectedTrack.audioUrl;
                                setCurrentTrackUrl(selectedTrack.audioUrl);
                                audioRef.current.play().then(() => {
                                  setIsPlaying(true);
                                }).catch(err => {
                                  console.error('Error playing audio:', err);
                                  setError('Не удалось воспроизвести трек');
                                });
                              }
                            }
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {isPlaying && currentTrackUrl === selectedTrack.audioUrl ? (
                            <Pause className="w-8 h-8 text-white drop-shadow-lg" />
                          ) : (
                            <Play className="w-8 h-8 text-white drop-shadow-lg" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg">{selectedTrack.title}</h4>
                      <p className="text-gray-400">{selectedTrack.artist}</p>
                      <p className="text-sm text-gray-500">{selectedTrack.genre}</p>
                    </div>
                  </div>

                  {/* Audio element */}
                  <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => {
                      setIsPlaying(false);
                      setCurrentTrackUrl(null);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Audio Player Controls - показывается когда играет */}
                  {isPlaying && currentTrackUrl === selectedTrack.audioUrl && duration > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayPause}
                          className="p-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors flex-shrink-0"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <div className="flex-1">
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                          />
                        </div>
                        <span className="text-sm text-gray-400 flex-shrink-0">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Что входит в тест:</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Оценка от 5-10 независимых экспертов</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Детальный анализ по 4 критериям (сведение, аранжировка, оригинальность, коммерческий потенциал)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Профессиональные рекомендации по улучшению</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Срок выполнения: 3-5 рабочих дней</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Стоимость:</span>
                      <span className="text-2xl font-bold text-purple-400">1000 ₽</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('select')}
                      disabled={loading}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        'Оплатить и отправить'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <div className="py-12 text-center">
                  <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold mb-2">
                    Обработка платежа...
                  </p>
                  <p className="text-gray-400">
                    Пожалуйста, подождите
                  </p>
                </div>
              )}

              {/* Success Step */}
              {step === 'success' && (
                <div className="py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-white text-lg font-semibold mb-2">
                    Заявка успешно создана!
                  </p>
                  <p className="text-gray-400">
                    Эксперты начнут оценку в ближайшее время
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}