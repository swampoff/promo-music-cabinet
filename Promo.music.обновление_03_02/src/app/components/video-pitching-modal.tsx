import { X, Target, Users, TrendingUp, Sparkles, Calendar, Coins, Check, AlertCircle, Info, ChevronRight, Lock, Zap, Video, Play, Share2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface VideoCreators {
  director: string; // Режиссер (обязательно)
  lightingDirector?: string; // Художник по свету
  scriptwriter?: string; // Сценарист
  sfxArtist?: string; // SFX Artist
  cinematographer?: string; // Оператор
  editor?: string; // Монтажер
  producer?: string; // Продюсер
}

interface VideoItem {
  id: number;
  title: string;
  thumbnail: string;
  category: string;
  duration: string;
  description: string;
  artist: string;
  genre: string;
  releaseDate: string;
  views: number;
  tags: string[];
  creators: VideoCreators;
}

interface VideoPitchingModalProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  onCoinsUpdate: (coins: number) => void;
}

type PlatformStatus = 'idle' | 'pending' | 'accepted' | 'rejected';

interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  cost: number;
  time: string;
  reach: string;
  status: PlatformStatus;
}

const platformCategories = {
  video: {
    name: 'Видеоплатформы',
    icon: Play,
    platforms: [
      {
        id: 'youtube',
        name: 'YouTube',
        icon: Play,
        color: 'text-red-500',
        cost: 600,
        time: '7-14 дней',
        reach: '50K-500K просмотров',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'youtube-shorts',
        name: 'YouTube Shorts',
        icon: TrendingUp,
        color: 'text-red-400',
        cost: 550,
        time: '5-10 дней',
        reach: '100K-1M просмотров',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'vk-video',
        name: 'VK Видео',
        icon: Play,
        color: 'text-blue-500',
        cost: 400,
        time: '3-7 дней',
        reach: '30K-300K просмотров',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'rutube',
        name: 'RuTube',
        icon: Play,
        color: 'text-blue-400',
        cost: 350,
        time: '5-10 дней',
        reach: '20K-150K просмотров',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'yandex-zen',
        name: 'Яндекс.Дзен Видео',
        icon: Play,
        color: 'text-yellow-500',
        cost: 400,
        time: '3-7 дней',
        reach: '25K-200K просмотров',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'ok-video',
        name: 'OK Видео',
        icon: Play,
        color: 'text-orange-500',
        cost: 300,
        time: '3-7 дней',
        reach: '15K-120K просмотров',
        status: 'idle' as PlatformStatus
      },
    ]
  },
  social: {
    name: 'Социальные сети',
    icon: Users,
    platforms: [
      {
        id: 'instagram-reels',
        name: 'Instagram Reels',
        icon: Target,
        color: 'text-pink-500',
        cost: 700,
        time: '5-10 дней',
        reach: '80K-800K пользователей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        icon: Video,
        color: 'text-cyan-500',
        cost: 800,
        time: '7-14 дней',
        reach: '150K-1.5M пользователей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'vk-clips',
        name: 'VK Клипы',
        icon: Play,
        color: 'text-blue-500',
        cost: 450,
        time: '3-7 дней',
        reach: '40K-400K пользователей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'telegram-video',
        name: 'Telegram Видео',
        icon: Share2,
        color: 'text-sky-500',
        cost: 400,
        time: '2-5 дней',
        reach: '30K-250K подписчиков',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'snapchat',
        name: 'Snapchat Spotlight',
        icon: TrendingUp,
        color: 'text-yellow-400',
        cost: 650,
        time: '5-10 дней',
        reach: '60K-600K пользователей',
        status: 'idle' as PlatformStatus
      },
    ]
  },
  music: {
    name: 'Музыкальные платформы',
    icon: Video,
    platforms: [
      {
        id: 'spotify-canvas',
        name: 'Spotify Canvas',
        icon: Video,
        color: 'text-green-500',
        cost: 500,
        time: '7-14 дней',
        reach: '20K-200K слушателей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'apple-music-video',
        name: 'Apple Music Video',
        icon: Play,
        color: 'text-pink-600',
        cost: 550,
        time: '5-10 дней',
        reach: '15K-150K слушателей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'yandex-music-video',
        name: 'Яндекс.Музыка Видео',
        icon: Video,
        color: 'text-yellow-500',
        cost: 450,
        time: '3-7 дней',
        reach: '25K-250K слушателей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'vk-music-video',
        name: 'VK Музыка Видео',
        icon: Play,
        color: 'text-blue-500',
        cost: 350,
        time: '3-5 дней',
        reach: '18K-180K слушателей',
        status: 'idle' as PlatformStatus
      },
    ]
  },
  tv: {
    name: 'ТВ и Медиа',
    icon: Target,
    platforms: [
      {
        id: 'mtv-ru',
        name: 'MTV Россия',
        icon: Target,
        color: 'text-pink-500',
        cost: 1500,
        time: '14-30 дней',
        reach: '500K+ зрителей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'muz-tv',
        name: 'МУЗ-ТВ',
        icon: Target,
        color: 'text-purple-500',
        cost: 1200,
        time: '10-20 дней',
        reach: '400K+ зрителей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'ru-music',
        name: 'RU.TV',
        icon: Target,
        color: 'text-blue-500',
        cost: 1000,
        time: '10-20 дней',
        reach: '300K+ зрителей',
        status: 'idle' as PlatformStatus
      },
      {
        id: 'bridge-tv',
        name: 'BRIDGE TV',
        icon: Target,
        color: 'text-cyan-500',
        cost: 900,
        time: '7-14 дней',
        reach: '250K+ зрителей',
        status: 'idle' as PlatformStatus
      },
    ]
  }
};

export function VideoPitchingModal({ video, isOpen, onClose, userCoins, onCoinsUpdate }: VideoPitchingModalProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof platformCategories>('video');
  const [platforms, setPlatforms] = useState(platformCategories);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Переключение выбора платформы
  const togglePlatform = (categoryKey: keyof typeof platformCategories, platformId: string) => {
    const platform = platforms[categoryKey].platforms.find(p => p.id === platformId);
    if (!platform || platform.status !== 'idle') return;

    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  // Подсчет общей стоимости
  const totalCost = selectedPlatforms.reduce((sum, platformId) => {
    for (const category of Object.values(platforms)) {
      const platform = category.platforms.find(p => p.id === platformId);
      if (platform) return sum + platform.cost;
    }
    return sum;
  }, 0);

  // Отправка на питчинг
  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0) return;
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
    const updatedPlatforms = { ...platforms };
    selectedPlatforms.forEach(platformId => {
      for (const category of Object.values(updatedPlatforms)) {
        const platformIndex = category.platforms.findIndex(p => p.id === platformId);
        if (platformIndex !== -1) {
          category.platforms[platformIndex].status = 'pending';
        }
      }
    });
    setPlatforms(updatedPlatforms);

    // Списание коинов
    onCoinsUpdate(userCoins - totalCost);

    setIsSubmitting(false);
    setShowSuccess(true);

    // Автозакрытие
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedPlatforms([]);
      onClose();
    }, 2000);
  };

  // Подсчет статусов для бейджей
  const getCategoryCounts = (categoryKey: keyof typeof platformCategories) => {
    const category = platforms[categoryKey];
    const pending = category.platforms.filter(p => p.status === 'pending').length;
    const accepted = category.platforms.filter(p => p.status === 'accepted').length;
    return { pending, accepted };
  };

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
        className="w-full max-w-6xl my-4 md:my-8 rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-400/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-white/10">
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Питчинг видео</h2>
                <p className="text-gray-300 text-sm md:text-base hidden sm:block">Отправьте видео на популярные платформы</p>
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

          {/* Video Info Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-32 h-20 md:w-40 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base md:text-lg mb-1">{video.title}</h3>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-400 mb-2">
                  <span>{video.category}</span>
                  <span>•</span>
                  <span>{video.duration}</span>
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Description */}
              <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-2 mb-2">
                  <Film className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="text-purple-400 text-sm font-semibold mb-1">Описание</div>
                    <p className="text-gray-300 text-sm">{video.description}</p>
                  </div>
                </div>
              </div>

              {/* Artist */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-cyan-400" />
                  <div className="text-cyan-400 text-sm font-semibold">Исполнитель</div>
                </div>
                <div className="text-white font-semibold">{video.artist}</div>
              </div>

              {/* Director */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Clapperboard className="w-4 h-4 text-pink-400" />
                  <div className="text-pink-400 text-sm font-semibold">Режиссер</div>
                </div>
                <div className="text-white font-semibold">{video.creators.director}</div>
              </div>

              {/* Genre */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <MusicIcon className="w-4 h-4 text-green-400" />
                  <div className="text-green-400 text-sm font-semibold">Жанр</div>
                </div>
                <div className="text-white font-semibold">{video.genre}</div>
              </div>

              {/* Release Date */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <div className="text-orange-400 text-sm font-semibold">Релиз</div>
                </div>
                <div className="text-white font-semibold">{new Date(video.releaseDate).toLocaleDateString('ru-RU')}</div>
              </div>

              {/* Duration */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div className="text-blue-400 text-sm font-semibold">Длительность</div>
                </div>
                <div className="text-white font-semibold">{video.duration}</div>
              </div>

              {/* Views */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-yellow-400" />
                  <div className="text-yellow-400 text-sm font-semibold">Просмотры</div>
                </div>
                <div className="text-white font-semibold">{video.views.toLocaleString()}</div>
              </div>

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-purple-400" />
                    <div className="text-purple-400 text-sm font-semibold">Теги</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Creators Section */}
              <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div className="text-purple-400 font-semibold">Команда создателей</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {video.creators.cinematographer && (
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Оператор</div>
                        <div className="text-white text-sm font-semibold">{video.creators.cinematographer}</div>
                      </div>
                    </div>
                  )}
                  {video.creators.lightingDirector && (
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Художник по свету</div>
                        <div className="text-white text-sm font-semibold">{video.creators.lightingDirector}</div>
                      </div>
                    </div>
                  )}
                  {video.creators.scriptwriter && (
                    <div className="flex items-center gap-2">
                      <Pen className="w-4 h-4 text-pink-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Сценарист</div>
                        <div className="text-white text-sm font-semibold">{video.creators.scriptwriter}</div>
                      </div>
                    </div>
                  )}
                  {video.creators.sfxArtist && (
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-gray-400 text-xs">SFX Artist</div>
                        <div className="text-white text-sm font-semibold">{video.creators.sfxArtist}</div>
                      </div>
                    </div>
                  )}
                  {video.creators.editor && (
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Мон��ажер</div>
                        <div className="text-white text-sm font-semibold">{video.creators.editor}</div>
                      </div>
                    </div>
                  )}
                  {video.creators.producer && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="text-gray-400 text-xs">Продюсер</div>
                        <div className="text-white text-sm font-semibold">{video.creators.producer}</div>
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
            {Object.entries(platformCategories).map(([key, category]) => {
              const counts = getCategoryCounts(key as keyof typeof platformCategories);
              const CategoryIcon = category.icon;
              
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(key as keyof typeof platformCategories)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-sm md:text-base ${
                    activeCategory === key
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <CategoryIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategory === key ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {category.platforms.length}
                  </span>
                  {counts.pending > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      {counts.pending}
                    </span>
                  )}
                  {counts.accepted > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      {counts.accepted}
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
            {platforms[activeCategory].platforms.map((platform, index) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              const isDisabled = platform.status !== 'idle';
              const PlatformIcon = platform.icon;

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !isDisabled && togglePlatform(activeCategory, platform.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isDisabled
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-400/50'
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
                      {platform.status === 'accepted' && 'Размещен'}
                      {platform.status === 'rejected' && 'Отклонен'}
                    </div>
                  )}

                  {/* Checkbox */}
                  {!isDisabled && (
                    <div className={`absolute top-4 right-4 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-white/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center ${platform.color}`}>
                      <PlatformIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">{platform.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">{platform.cost}</span>
                          <span>коинов</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          {platform.time}
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
                <div className="text-xl md:text-2xl font-bold text-white">{selectedPlatforms.length}</div>
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
              disabled={selectedPlatforms.length === 0 || userCoins < totalCost || isSubmitting}
              className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-600 text-sm md:text-base"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить на питчинг'}
            </motion.button>
          </div>

          {/* Submit Progress */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 font-semibold">Отправка на платформы...</span>
                <span className="text-white font-semibold">{submitProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${submitProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                />
              </div>
            </motion.div>
          )}

          {userCoins < totalCost && selectedPlatforms.length > 0 && (
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
                <p className="text-gray-300">Видео отправлено на {selectedPlatforms.length} {selectedPlatforms.length === 1 ? 'платформу' : 'платформы'}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}