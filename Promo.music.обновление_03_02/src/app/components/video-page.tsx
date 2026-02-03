import { Video, Play, Upload, Trash2, Eye, Heart, Share2, X, Check, Clock, XCircle, Coins, AlertCircle, TrendingUp, Users, MessageCircle, ExternalLink, Loader2, Film, Image as ImageIcon, Search, Filter, Calendar, Edit2, Pause, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { VideoPitchingModal } from '@/app/components/video-pitching-modal';
import { useSubscription, subscriptionHelpers } from '@/contexts/SubscriptionContext';
import { VideoUploadModal } from '@/app/components/video-upload-modal';
import { VideoDetailPage } from '@/app/components/video-detail-page';
import { getVideoInfo, isValidVideoUrl } from '@/utils/video-utils';
import { useData, type Video as VideoType, type VideoStatus as VideoStatusType } from '@/contexts/DataContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type VideoStatus = VideoStatusType;
type VideoSource = 'file' | 'link';

interface VideoCreators {
  director: string; // Режиссер (обязательно)
  lightingDirector?: string; // Художник по свету
  scriptwriter?: string; // Сценарист
  sfxArtist?: string; // SFX Artist
  cinematographer?: string; // Оператор
  editor?: string; // Монтажер
  producer?: string; // Продюсер
}

// VideoItem теперь совпадает с VideoType из DataContext
type VideoItem = VideoType;

const categories = [
  'Музыкальный клип', 'Лирик-видео', 'Live выступление', 'Behind the scenes',
  'Интервью', 'Vlog', 'Короткое видео', 'Другое'
];

interface VideoPageProps {
  userCoins?: number;
  onCoinsUpdate?: (coins: number) => void;
}

export function VideoPage({ 
  userCoins = 0, 
  onCoinsUpdate = () => {} 
}: VideoPageProps) {
  // Получаем данные из глобального контекста
  const { videos: globalVideos, addVideo, updateVideo, deleteVideo, getVideosByUser } = useData();
  const { userId } = useCurrentUser();
  
  // Получаем видео текущего пользователя
  const userVideos = getVideosByUser(userId);
  
  // Демо-данные для первого запуска (если нет видео)
  const demoVideos: VideoItem[] = [
    {
      id: 1,
      title: 'Midnight Dreams - Official Music Video',
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      category: 'Музыкальный клип',
      description: 'Визуальная одиссея в стиле 80-х с неоновыми огнями и ретро-футуристическими локациями. Погружение в атмосферу синтвейв культуры с элементами киберпанка.',
      tags: ['musicvideo', 'official', 'electronic', 'synthwave', '80s'],
      duration: '3:45',
      views: 15400,
      likes: 1850,
      status: 'approved' as VideoStatus,
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isPaid: true,
      videoSource: 'file' as VideoSource,
      artist: 'Neon Pulse',
      genre: 'Synthwave / Electronic',
      releaseDate: '2024-01-20',
      creators: {
        director: 'Алексей Смирнов',
        lightingDirector: 'Мария Волкова',
        scriptwriter: 'Дмитрий Козлов',
        sfxArtist: 'Иван Петров',
        cinematographer: 'Анна Сергеева',
        editor: 'Михаил Новиков',
        producer: 'Елена Белова'
      },
      userId
    },
    {
      id: 2,
      title: 'Electric Soul - Behind The Scenes',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
      category: 'Behind the scenes',
      description: 'Эксклюзивный взгляд за кулисы съемок музыкального клипа Electric Soul. Процесс создания от идеи до финального кадра.',
      tags: ['bts', 'making', 'studio', 'production'],
      duration: '8:20',
      views: 8200,
      likes: 920,
      status: 'approved' as VideoStatus,
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isPaid: false,
      videoSource: 'file' as VideoSource,
      artist: 'Urban Echo',
      genre: 'Alternative Rock',
      releaseDate: '2024-01-15',
      creators: {
        director: 'Сергей Иванов',
        cinematographer: 'Ольга Морозова',
        editor: 'Павел Соколов',
        producer: 'Наталья Кузнецова'
      },
      userId
    },
    {
      id: 3,
      title: 'Live Performance @ Moscow',
      thumbnail: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      category: 'Live выступление',
      description: 'Живое выступление на главной сцене московского фестиваля MusicPulse. Энергичный сет с лучшими треками.',
      tags: ['live', 'concert', 'moscow', 'festival'],
      duration: '45:12',
      views: 0,
      likes: 0,
      status: 'pending' as VideoStatus,
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isPaid: false,
      videoSource: 'file' as VideoSource,
      artist: 'DJ Spectrum',
      genre: 'Electronic / House',
      releaseDate: '2024-01-18',
      creators: {
        director: 'Андрей Лебедев',
        lightingDirector: 'Виктор Попов',
        cinematographer: 'Светлана Федорова',
        editor: 'Константин Орлов'
      },
      userId
    },
  ];

  // Используем видео пользователя или демо-данные
  const videos = userVideos.length > 0 ? userVideos : demoVideos;

  // Get subscription limits
  const { subscription } = useSubscription();
  const currentVideoCount = videos.length;
  const canUploadMore = subscriptionHelpers.canUploadVideo(subscription, currentVideoCount);
  const videoLimit = subscription?.limits.videos ?? 5;
  const isUnlimited = videoLimit === -1;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPitchingModal, setShowPitchingModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<VideoStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [detailVideoId, setDetailVideoId] = useState<number | null>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    description: '',
    tags: '',
  });

  const [videoSource, setVideoSource] = useState<VideoSource>('file');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Фильтрация видео
  const filteredVideos = videos.filter(video => {
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Статистика
  const stats = {
    total: videos.length,
    approved: videos.filter(v => v.status === 'approved').length,
    pending: videos.filter(v => v.status === 'pending').length,
    rejected: videos.filter(v => v.status === 'rejected').length,
    draft: videos.filter(v => v.status === 'draft').length,
    totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
    totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0),
  };

  // Обработка загрузки превью
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер изображения не должен превышать 5МБ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Обработка загрузки видео
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Пожалуйста, выберите видео файл');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      alert('Размер видео не должен превышать 500МБ');
      return;
    }

    setVideoFileName(file.name);
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!uploadForm.title.trim()) {
      errors.title = 'Введите название видео';
    }
    if (!uploadForm.category) {
      errors.category = 'Выберите категорию';
    }
    if (!thumbnailPreview) {
      errors.thumbnail = 'Загрузите превью';
    }
    if (!videoFileName && videoSource === 'file') {
      errors.video = 'Загрузите видео файл';
    }
    if (!videoUrl && videoSource === 'link') {
      errors.video = 'Введите ссылку на видео';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Загрузка видео
  const handleUploadVideo = async (data: {
    title: string;
    category: string;
    description: string;
    tags: string;
    thumbnail: string | null;
    videoFileName: string | null;
    videoUrl: string;
    videoSource: VideoSource;
  }, isDraft: boolean = false) => {
    const newVideo: VideoItem = {
      id: Date.now(),
      title: data.title,
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      category: data.category,
      description: data.description,
      tags: data.tags.split(',').map(t => t.trim()).filter(t => t),
      duration: '3:45', // В реальности определяется из видео
      views: 0,
      likes: 0,
      status: isDraft ? 'draft' : 'pending',
      uploadDate: new Date().toISOString(),
      isPaid: false,
      videoSource: data.videoSource,
      videoUrl: data.videoSource === 'link' ? data.videoUrl : undefined,
      artist: 'Unknown Artist',
      genre: 'Unknown Genre',
      releaseDate: 'Unknown Date',
      creators: {
        director: 'Unknown Director',
        lightingDirector: 'Unknown Lighting Director',
        scriptwriter: 'Unknown Scriptwriter',
        sfxArtist: 'Unknown SFX Artist',
        cinematographer: 'Unknown Cinematographer',
        editor: 'Unknown Editor',
        producer: 'Unknown Producer'
      },
      userId
    };

    addVideo(newVideo);
  };

  // Оплата продвижения
  const handlePayPromotion = (video: VideoItem) => {
    setSelectedVideo(video);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedVideo) return;

    const cost = 1500; // Стоимость продвижения видео в коинах
    
    if (userCoins < cost) {
      alert('Недостаточно коинов!')
      return;
    }

    onCoinsUpdate(userCoins - cost);
    
    // Обновляем видео в контексте
    updateVideo(selectedVideo.id, { isPaid: true });

    setShowPaymentModal(false);
    setSelectedVideo(null);
  };

  // Удаление видео
  const handleDeleteVideo = (videoId: number) => {
    if (confirm('Вы уверены, что хотите удалить это видео?')) {
      deleteVideo(videoId);
    }
  };

  // Получение статуса и его стилей
  const getStatusConfig = (status: VideoStatus) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Черновик',
          icon: Edit2,
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/30',
        };
      case 'pending':
        return {
          label: 'На модерации',
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-400/30',
        };
      case 'approved':
        return {
          label: 'Одобрено',
          icon: Check,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-400/30',
        };
      case 'rejected':
        return {
          label: 'Отклонено',
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-400/30',
        };
    }
  };

  // Обработка изменения URL видео
  const handleVideoUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    // Очищаем ошибку при начале ввода
    if (validationErrors.video) {
      setValidationErrors(prev => {
        const { video, ...rest } = prev;
        return rest;
      });
    }
    
    // Если URL валидный, загружаем превью
    if (url && isValidVideoUrl(url)) {
      setIsLoadingThumbnail(true);
      
      try {
        const videoInfo = getVideoInfo(url);
        
        if (videoInfo) {
          // Загружаем превью
          setThumbnailPreview(videoInfo.thumbnailUrl);
          
          // Очищаем ошибку превью
          if (validationErrors.thumbnail) {
            setValidationErrors(prev => {
              const { thumbnail, ...rest } = prev;
              return rest;
            });
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки превью:', error);
      } finally {
        setIsLoadingThumbnail(false);
      }
    }
  };

  // Определение текущей платформы видео
  const getCurrentPlatform = () => {
    if (!videoUrl || !isValidVideoUrl(videoUrl)) return null;
    const videoInfo = getVideoInfo(videoUrl);
    return videoInfo?.platform || null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0 pt-16 lg:pt-0">
      {/* Header - адаптивный */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8"
      >
        <div className="w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">Мои видео</h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg">Управляйте видеоконтентом</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 flex-1 sm:flex-none">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-white font-semibold text-sm sm:text-base">{(userCoins || 0).toLocaleString()}</span>
            <span className="text-gray-400 text-xs sm:text-sm hidden xs:inline">коинов</span>
          </div>
          
          <motion.button
            whileHover={{ scale: canUploadMore ? 1.05 : 1 }}
            whileTap={{ scale: canUploadMore ? 0.95 : 1 }}
            onClick={() => {
              if (!canUploadMore) {
                alert(`Достигнут лимит видео (${videoLimit})! Улучшите подписку для загрузки большего количества видео.`);
                return;
              }
              setShowUploadModal(true);
            }}
            disabled={!canUploadMore}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl ${
              canUploadMore 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/15' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            } text-white font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation whitespace-nowrap`}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            {canUploadMore ? (
              <>
                <span className="hidden sm:inline">Загрузить видео</span>
                <span className="inline sm:hidden">Загрузить</span>
              </>
            ) : (
              <span>Лимит ({currentVideoCount}/{videoLimit})</span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats - адаптивные */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
            canUploadMore 
              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
              : 'bg-orange-500/10 border-orange-400/30 hover:bg-orange-500/20'
          }`}
        >
          <div className={`text-xs sm:text-sm mb-1 sm:mb-2 ${canUploadMore ? 'text-gray-400' : 'text-orange-400'}`}>
            {isUnlimited ? 'Видео (без лимита)' : `Видео (${currentVideoCount}/${videoLimit})`}
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.total}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-green-500/10 border border-green-400/30 hover:bg-green-500/20 transition-all duration-300"
        >
          <div className="text-green-400 text-xs sm:text-sm mb-1 sm:mb-2">Одобрено</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.approved}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/30 hover:bg-yellow-500/20 transition-all duration-300"
        >
          <div className="text-yellow-400 text-xs sm:text-sm mb-1 sm:mb-2">На модерации</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.pending}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Просмотры</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalViews || 0).toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Лайки</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalLikes || 0).toLocaleString()}</div>
        </motion.div>
      </div>

      {/* Filters - адаптивные */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 touch-manipulation"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as VideoStatus | 'all')}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 cursor-pointer touch-manipulation"
          >
            <option value="all">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
      </motion.div>

      {/* Videos Grid - адаптивная */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {filteredVideos.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-4">
              {searchQuery ? 'Видео не найдены' : 'У вас пока нет видео'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold transition-all duration-300"
              >
                Загрузить первое видео
              </motion.button>
            )}
          </div>
        ) : (
          filteredVideos.map((video, index) => {
            const statusConfig = getStatusConfig(video.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className="group rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden"
              >
                {/* Thumbnail */}
                <div 
                  className="relative aspect-video overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (video.status === 'approved') {
                      setDetailVideoId(video.id);
                      setShowVideoDetail(true);
                    }
                  }}
                >
                  <ImageWithFallback
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Button Overlay */}
                  {video.status === 'approved' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPlayingId(playingId === video.id ? null : video.id)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      {playingId === video.id ? (
                        <Pause className="w-12 h-12 text-white" fill="white" />
                      ) : (
                        <Play className="w-12 h-12 text-white" fill="white" />
                      )}
                    </motion.button>
                  )}

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs font-semibold">
                    {video.duration}
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-2 left-2 px-3 py-1 rounded-lg ${statusConfig.bg} border ${statusConfig.border} backdrop-blur-sm`}>
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                      <span className={`text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 
                      onClick={() => {
                        if (video.status === 'approved') {
                          setDetailVideoId(video.id);
                          setShowVideoDetail(true);
                        }
                      }}
                      className={`text-white font-bold text-lg mb-1 line-clamp-2 ${
                        video.status === 'approved' 
                          ? 'cursor-pointer hover:text-cyan-400 transition-colors duration-300' 
                          : ''
                      }`}
                    >
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{video.category}</p>
                  </div>

                  {/* Description */}
                  {video.description && (
                    <p className="text-gray-300 text-sm line-clamp-2">{video.description}</p>
                  )}

                  {/* Tags */}
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {video.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  {video.status === 'approved' && (
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {(video.views || 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {(video.likes || 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {video.uploadedAt}
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {video.status === 'rejected' && video.rejectionReason && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-red-400 text-xs">{video.rejectionReason}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {video.status === 'approved' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowPitchingModal(true);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Питчинг
                        </motion.button>

                        {!video.isPaid && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePayPromotion(video)}
                            className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <Coins className="w-4 h-4" />
                            Продвижение
                          </motion.button>
                        )}

                        {video.isPaid && (
                          <div className="flex-1 px-3 py-2 rounded-xl bg-green-500/20 border border-green-400/30 text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            Продвигается
                          </div>
                        )}
                      </>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* UPLOAD MODAL */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadVideo}
      />

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentModal && selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-400/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Оплата продвижения</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              {/* Video Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">{selectedVideo.title}</div>
                    <div className="text-gray-400 text-sm">{selectedVideo.category}</div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-300">Стоимость продвижения:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold text-xl">1,500</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-300">Ваш баланс:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold text-xl">{userCoins.toLocaleString()}</span>
                  </div>
                </div>

                {userCoins < 1500 && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/30">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-red-400 text-sm">
                        Недостаточно коинов! Пополните баланс в разделе "Коины"
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30">
                  <div className="text-purple-400 font-semibold mb-2">Что включено:</div>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>✓ Рекомендации на видеоплатформах</li>
                    <li>✓ Продвижение в соцсетях</li>
                    <li>✓ Увеличение охвата</li>
                    <li>✓ Детальная аналитика</li>
                  </ul>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmPayment}
                disabled={userCoins < 1500}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-yellow-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userCoins < 1500 ? 'Недостаточно коинов' : 'Подтвердить оплату'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PITCHING MODAL */}
      <AnimatePresence>
        {showPitchingModal && selectedVideo && (
          <VideoPitchingModal
            video={selectedVideo}
            isOpen={showPitchingModal}
            onClose={() => setShowPitchingModal(false)}
            userCoins={userCoins}
            onCoinsUpdate={onCoinsUpdate}
          />
        )}
      </AnimatePresence>

      {/* VIDEO DETAIL MODAL */}
      <AnimatePresence>
        {showVideoDetail && detailVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-y-auto"
          >
            <VideoDetailPage
              videoId={detailVideoId}
              onBack={() => setShowVideoDetail(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}