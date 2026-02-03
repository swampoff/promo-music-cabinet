import { X, Target, Users, TrendingUp, Sparkles, Calendar, Coins, Check, AlertCircle, Info, ChevronRight, Lock, Zap, Music2, Radio, Share2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

type PitchingCategory = 'streaming' | 'social' | 'venues' | 'radio';
type PitchingStatus = 'idle' | 'pending' | 'accepted' | 'rejected';

interface PitchingPlatform {
  id: string;
  name: string;
  category: PitchingCategory;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  cost: number;
  processingTime: string;
  reach: string;
  status: PitchingStatus;
}

interface TrackCredits {
  musicComposer: string;      // Автор музыки (обязательно)
  lyricist?: string;          // Автор стихов/текста
  mixing?: string;            // Сведение
  mastering?: string;         // Мастеринг
  producer?: string;          // Продюсер
  arranger?: string;          // Аранжировщик
  soundEngineer?: string;     // Звукорежиссер
}

interface TrackRights {
  copyright: string;          // Авторские права (©)
  phonographicCopyright: string; // Смежные права (℗)
  publisher?: string;         // Издатель
  isrc?: string;             // ISRC код
  upc?: string;              // UPC код
}

interface Track {
  id: number;
  title: string;
  cover: string;
  authors: string;
  genre: string;
  duration: string;
  description: string;
  label: string;
  year: string;
  releaseDate: string;
  plays: number;
  likes: number;
  tags: string[];
  credits: TrackCredits;
  rights: TrackRights;
}

interface TrackPitchingModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  onCoinsUpdate: (newBalance: number) => void;
}

export function TrackPitchingModal({ track, isOpen, onClose, userCoins, onCoinsUpdate }: TrackPitchingModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<PitchingCategory>('streaming');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { id: 'streaming' as PitchingCategory, label: 'Стриминги', icon: Music2, count: 6 },
    { id: 'social' as PitchingCategory, label: 'Соцсети', icon: Users, count: 5 },
    { id: 'venues' as PitchingCategory, label: 'Площадки', icon: Target, count: 4 },
    { id: 'radio' as PitchingCategory, label: 'Радио', icon: Radio, count: 5 }
  ];

  const [platforms, setPlatforms] = useState<PitchingPlatform[]>([
    // Streaming
    {
      id: 'spotify',
      name: 'Spotify Editorial',
      category: 'streaming',
      icon: Music2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30',
      description: 'Плейлисты Spotify',
      cost: 500,
      processingTime: '7-14 дней',
      reach: '100K+ слушателей',
      status: 'idle'
    },
    {
      id: 'apple-music',
      name: 'Apple Music',
      category: 'streaming',
      icon: Music2,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-400/30',
      description: 'Плейлисты Apple Music',
      cost: 450,
      processingTime: '5-10 дней',
      reach: '80K+ слушателей',
      status: 'idle'
    },
    {
      id: 'yandex-music',
      name: 'Яндекс.Музыка',
      category: 'streaming',
      icon: Music2,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-400/30',
      description: 'Подборки Яндекс.Музыки',
      cost: 400,
      processingTime: '3-7 дней',
      reach: '60K+ слушателей',
      status: 'idle'
    },
    {
      id: 'vk-music',
      name: 'VK Музыка',
      category: 'streaming',
      icon: Music2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
      description: 'Рекомендации VK',
      cost: 350,
      processingTime: '3-5 дней',
      reach: '50K+ слушателей',
      status: 'idle'
    },
    {
      id: 'deezer',
      name: 'Deezer',
      category: 'streaming',
      icon: Music2,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-400/30',
      description: 'Плейлисты Deezer',
      cost: 300,
      processingTime: '5-10 дней',
      reach: '40K+ слушателей',
      status: 'idle'
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      category: 'streaming',
      icon: Music2,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-400/30',
      description: 'Промо на SoundCloud',
      cost: 250,
      processingTime: '2-5 дней',
      reach: '30K+ слушателей',
      status: 'idle'
    },

    // Social
    {
      id: 'instagram',
      name: 'Instagram Reels',
      category: 'social',
      icon: Share2,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-400/30',
      description: 'Промо в Reels',
      cost: 600,
      processingTime: '3-7 дней',
      reach: '150K+ пользователей',
      status: 'idle'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      category: 'social',
      icon: Music2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-400/30',
      description: 'Промо в TikTok',
      cost: 700,
      processingTime: '5-10 дней',
      reach: '200K+ пользователей',
      status: 'idle'
    },
    {
      id: 'youtube-shorts',
      name: 'YouTube Shorts',
      category: 'social',
      icon: Play,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-400/30',
      description: 'Промо в Shorts',
      cost: 550,
      processingTime: '5-10 дней',
      reach: '120K+ зрителей',
      status: 'idle'
    },
    {
      id: 'vk-clips',
      name: 'VK Клипы',
      category: 'social',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
      description: 'Промо в VK',
      cost: 400,
      processingTime: '2-5 дней',
      reach: '80K+ пользователей',
      status: 'idle'
    },
    {
      id: 'telegram',
      name: 'Telegram Каналы',
      category: 'social',
      icon: Share2,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-400/30',
      description: 'Музыкальные каналы',
      cost: 350,
      processingTime: '1-3 дня',
      reach: '50K+ подписчиков',
      status: 'idle'
    },

    // Venues
    {
      id: 'bars-clubs',
      name: 'Бары и клубы',
      category: 'venues',
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30',
      description: 'Ротация в заведениях',
      cost: 800,
      processingTime: '10-20 дней',
      reach: '50+ заведений',
      status: 'idle'
    },
    {
      id: 'festivals',
      name: 'Фестивали',
      category: 'venues',
      icon: Users,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-400/30',
      description: 'Подача на фестивали',
      cost: 1200,
      processingTime: '30-60 дней',
      reach: '10K+ зрителей',
      status: 'idle'
    },
    {
      id: 'retail',
      name: 'Retail сети',
      category: 'venues',
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-400/30',
      description: 'Музыка в магазинах',
      cost: 600,
      processingTime: '7-14 дней',
      reach: '100+ магазинов',
      status: 'idle'
    },
    {
      id: 'gyms',
      name: 'Фитнес-клубы',
      category: 'venues',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30',
      description: 'Плейлисты для спорта',
      cost: 450,
      processingTime: '5-10 дней',
      reach: '50+ клубов',
      status: 'idle'
    },

    // Radio
    {
      id: 'radio-energy',
      name: 'Energy FM',
      category: 'radio',
      icon: Radio,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-400/30',
      description: 'Топ радиостанция',
      cost: 1500,
      processingTime: '14-30 дней',
      reach: '500K+ слушателей',
      status: 'idle'
    },
    {
      id: 'radio-record',
      name: 'Record FM',
      category: 'radio',
      icon: Radio,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30',
      description: 'Электронная музыка',
      cost: 1200,
      processingTime: '10-20 дней',
      reach: '400K+ слушателей',
      status: 'idle'
    },
    {
      id: 'europa-plus',
      name: 'Европа Плюс',
      category: 'radio',
      icon: Radio,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
      description: 'Поп музыка',
      cost: 1300,
      processingTime: '14-30 дней',
      reach: '600K+ слушателей',
      status: 'idle'
    },
    {
      id: 'russian-radio',
      name: 'Русское Радио',
      category: 'radio',
      icon: Radio,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-400/30',
      description: 'Русская музыка',
      cost: 1100,
      processingTime: '10-20 дней',
      reach: '450K+ слушателей',
      status: 'idle'
    },
    {
      id: 'monte-carlo',
      name: 'Монте-Карло',
      category: 'radio',
      icon: Radio,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-400/30',
      description: 'Лёгкая музыка',
      cost: 900,
      processingTime: '7-14 дней',
      reach: '300K+ слушателей',
      status: 'idle'
    }
  ]);

  const togglePlatform = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform || platform.status !== 'idle') return;

    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platformId)) {
      newSelected.delete(platformId);
    } else {
      newSelected.add(platformId);
    }
    setSelectedPlatforms(newSelected);
  };

  const totalCost = Array.from(selectedPlatforms).reduce((sum, platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    return sum + (platform?.cost || 0);
  }, 0);

  const handleSubmit = async () => {
    if (selectedPlatforms.size === 0) return;
    if (userCoins < totalCost) {
      alert('Недостаточно коинов!');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    // Симуляция отправки
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSubmitProgress(i);
    }

    // Обновление статусов платформ
    setPlatforms(platforms.map(p => 
      selectedPlatforms.has(p.id)
        ? { ...p, status: 'pending' as PitchingStatus }
        : p
    ));

    // Списание коинов
    onCoinsUpdate(userCoins - totalCost);

    setIsSubmitting(false);
    setShowSuccess(true);
    setSelectedPlatforms(new Set());

    // Автозакрытие
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const filteredPlatforms = platforms.filter(p => p.category === selectedCategory);
  const categoryStats = categories.map(cat => ({
    ...cat,
    pending: platforms.filter(p => p.category === cat.id && p.status === 'pending').length,
    accepted: platforms.filter(p => p.category === cat.id && p.status === 'accepted').length
  }));

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl my-4 md:my-8 rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-white/10">
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Питчинг трека</h2>
                <p className="text-gray-300 text-sm md:text-base hidden sm:block">Отправьте трек на платформы и площадки</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </motion.button>
          </div>

          {/* Track Info Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={track.cover}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base md:text-lg mb-1">{track.title}</h3>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-400 mb-2">
                  <span>{track.authors}</span>
                  <span>•</span>
                  <span>{track.genre}</span>
                  <span>•</span>
                  <span>{track.duration}</span>
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Description */}
              <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="text-cyan-400 text-sm font-semibold mb-1">Описание</div>
                    <p className="text-gray-300 text-sm">{track.description}</p>
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-400" />
                  <div className="text-purple-400 text-sm font-semibold">Лейбл</div>
                </div>
                <div className="text-white font-semibold">{track.label}</div>
              </div>

              {/* Release Date */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <div className="text-orange-400 text-sm font-semibold">Дата релиза</div>
                </div>
                <div className="text-white font-semibold">{new Date(track.releaseDate).toLocaleDateString('ru-RU')}</div>
              </div>

              {/* Plays */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Headphones className="w-4 h-4 text-green-400" />
                  <div className="text-green-400 text-sm font-semibold">Прослушивания</div>
                </div>
                <div className="text-white font-semibold">{track.plays.toLocaleString()}</div>
              </div>

              {/* Likes */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-pink-400" />
                  <div className="text-pink-400 text-sm font-semibold">Лайки</div>
                </div>
                <div className="text-white font-semibold">{track.likes.toLocaleString()}</div>
              </div>

              {/* Tags */}
              {track.tags.length > 0 && (
                <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <div className="text-cyan-400 text-sm font-semibold">Теги</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {track.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credits Section */}
              <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <div className="text-cyan-400 font-semibold">Создатели трека</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-pink-400" />
                    <div>
                      <div className="text-gray-400 text-xs">Автор музыки</div>
                      <div className="text-white text-sm font-semibold">{track.credits.musicComposer}</div>
                    </div>
                  </div>
                  {track.credits.lyricist && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Автор стихов</div>
                        <div className="text-white text-sm font-semibold">{track.credits.lyricist}</div>
                      </div>
                    </div>
                  )}
                  {track.credits.producer && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Продюсер</div>
                        <div className="text-white text-sm font-semibold">{track.credits.producer}</div>
                      </div>
                    </div>
                  )}
                  {track.credits.mixing && (
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Сведение</div>
                        <div className="text-white text-sm font-semibold">{track.credits.mixing}</div>
                      </div>
                    </div>
                  )}
                  {track.credits.mastering && (
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Мастеринг</div>
                        <div className="text-white text-sm font-semibold">{track.credits.mastering}</div>
                      </div>
                    </div>
                  )}
                  {track.credits.arranger && (
                    <div className="flex items-center gap-2">
                      <Music2 className="w-4 h-4 text-yellow-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Аранжировщик</div>
                        <div className="text-white text-sm font-semibold">{track.credits.arranger}</div>
                      </div>
                    </div>
                  )}
                  {track.credits.soundEngineer && (
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Звукорежиссер</div>
                        <div className="text-white text-sm font-semibold">{track.credits.soundEngineer}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rights Section */}
              <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <Copyright className="w-5 h-5 text-purple-400" />
                  <div className="text-purple-400 font-semibold">Права и лицензирование</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Copyright className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="text-gray-400 text-xs">Авторские права</div>
                      <div className="text-white text-sm font-semibold">{track.rights.copyright}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Disc className="w-4 h-4 text-pink-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="text-gray-400 text-xs">Смежные права</div>
                      <div className="text-white text-sm font-semibold">{track.rights.phonographicCopyright}</div>
                    </div>
                  </div>
                  {track.rights.publisher && (
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-gray-400 text-xs">Издатель</div>
                        <div className="text-white text-sm font-semibold">{track.rights.publisher}</div>
                      </div>
                    </div>
                  )}
                  {track.rights.isrc && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-gray-400 text-xs">ISRC код</div>
                        <div className="text-white text-sm font-semibold font-mono">{track.rights.isrc}</div>
                      </div>
                    </div>
                  )}
                  {track.rights.upc && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-gray-400 text-xs">UPC код</div>
                        <div className="text-white text-sm font-semibold font-mono">{track.rights.upc}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 md:px-8 pt-4 md:pt-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categoryStats.map((cat) => {
              const CategoryIcon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-sm md:text-base ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <CategoryIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {cat.count}
                  </span>
                  {cat.pending > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      {cat.pending}
                    </span>
                  )}
                  {cat.accepted > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      {cat.accepted}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="p-4 md:p-8 max-h-[40vh] md:max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {filteredPlatforms.map((platform, index) => {
              const isSelected = selectedPlatforms.has(platform.id);
              const isDisabled = platform.status !== 'idle';
              const PlatformIcon = platform.icon;

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !isDisabled && togglePlatform(platform.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isDisabled
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/50'
                  }`}
                >
                  {/* Status Badge */}
                  {platform.status !== 'idle' && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      platform.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      platform.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {platform.status === 'pending' && <Clock className="w-3 h-3" />}
                      {platform.status === 'accepted' && <Check className="w-3 h-3" />}
                      {platform.status === 'pending' && 'На обработке'}
                      {platform.status === 'accepted' && 'Одобрено'}
                      {platform.status === 'rejected' && 'Отклонено'}
                    </div>
                  )}

                  {/* Checkbox */}
                  {!isDisabled && (
                    <div className={`absolute top-4 right-4 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-white/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center ${platform.color}`}>
                      <PlatformIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{platform.name}</h4>
                      <p className="text-gray-400 text-xs mb-2">{platform.description}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">{platform.cost}</span>
                          <span>коинов</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          {platform.processingTime}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <TrendingUp className="w-4 h-4" />
                          {platform.reach}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer with Summary */}
        <div className="p-4 md:p-8 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/0">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
            <div className="grid grid-cols-3 md:flex md:items-center gap-4 md:gap-6">
              <div>
                <div className="text-gray-400 text-xs md:text-sm mb-1">Выбрано</div>
                <div className="text-xl md:text-2xl font-bold text-white">{selectedPlatforms.size}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs md:text-sm mb-1">Стоимость</div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span className="text-xl md:text-2xl font-bold text-white">{totalCost.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs md:text-sm mb-1">Баланс</div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span className={`text-xl md:text-2xl font-bold ${userCoins >= totalCost ? 'text-white' : 'text-red-400'}`}>
                    {userCoins.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={selectedPlatforms.size === 0 || userCoins < totalCost || isSubmitting}
              className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-blue-600 text-sm md:text-base"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить на питчинг'}
            </motion.button>
          </div>

          {/* Submit Progress */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-semibold">Отправка на платформы...</span>
                <span className="text-white font-semibold">{submitProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${submitProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
            </motion.div>
          )}

          {userCoins < totalCost && selectedPlatforms.size > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-400 text-sm">
                  Недостаточно коинов! Необходимо: {totalCost.toLocaleString()}, доступно: {userCoins.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-2">Успешно отправлено!</h3>
                <p className="text-gray-300">Трек отправлен на {selectedPlatforms.size} {selectedPlatforms.size === 1 ? 'платформу' : 'платформы'}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}