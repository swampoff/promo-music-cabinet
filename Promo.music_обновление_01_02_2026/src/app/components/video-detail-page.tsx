import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Download, 
  MoreVertical, 
  Clock, 
  Calendar, 
  Video, 
  Tag, 
  User, 
  Building2, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  ArrowLeft, 
  ExternalLink,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  List,
  Award,
  Zap,
  TrendingUp,
  Film,
  AlertCircle,
  Loader2,
  SkipBack,
  SkipForward,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface VideoData {
  id: number;
  title: string;
  artist: string;
  artistId?: string;          // ID артиста для ссылки на профиль
  artistAvatar?: string;      // Аватар артиста
  artistSubscribers?: number; // Количество подписчиков артиста
  album?: string;
  thumbnail: string;
  videoUrl: string;
  genre: string;
  description: string;
  tags: string[];
  year: string;
  director: string;
  duration: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  uploadedAt: string;
  releaseDate?: string;
  credits?: {
    role: string;
    name: string;
  }[];
  isLiked?: boolean;
  isInPlaylist?: boolean;
}

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface VideoDetailPageProps {
  videoId: number;
  onBack: () => void;
  onNavigate?: (section: string) => void;
  profileData?: {
    name: string;
    avatar: string;
  };
}

export function VideoDetailPage({ videoId, onBack, onNavigate, profileData }: VideoDetailPageProps) {
  // Mock database of videos - в production это будет загружаться из API/Supabase
  const videosDatabase: { [key: number]: VideoData } = {
    1: {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Александр Иванов',
      artistId: 'aleksandr-ivanov',
      artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      artistSubscribers: 123000,
      album: 'Night Sessions',
      thumbnail: 'https://images.unsplash.com/photo-1561740129-4bf8e6d4513a?w=1200&h=675&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      genre: 'Electronic',
      description: 'Официальный музыкальный клип на трек "Midnight Dreams". Съемки проходили в течение трех дней в самых живописных локациях города. В клипе показана история о поиске себя в ночном городе, где каждый кадр наполнен символизмом и глубоким смыслом.',
      tags: ['musicvideo', 'electronic', 'ambient', 'cinematic', 'artfilm'],
      year: '2026',
      director: 'Анна Кинорежиссер',
      duration: '3:45',
      views: 125430,
      likes: 8920,
      shares: 1256,
      comments: 342,
      uploadedAt: '2 дня назад',
      releaseDate: '15 января 2026',
      credits: [
        { role: 'Режиссер', name: 'Анна Кинорежиссер' },
        { role: 'Оператор', name: 'Сергей Камеров' },
        { role: 'Монтаж', name: 'Мария Монтажова' },
        { role: 'Продюсер', name: 'Александр Иванов' },
        { role: 'Цветокоррекция', name: 'Color Studio Pro' },
        { role: 'VFX', name: 'Visual Effects Team' }
      ],
      isLiked: false,
      isInPlaylist: false
    },
    2: {
      id: 2,
      title: 'Electric Soul',
      artist: 'DJ Midnight',
      artistId: 'dj-midnight',
      artistAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      artistSubscribers: 245000,
      album: 'Digital Vibes',
      thumbnail: 'https://images.unsplash.com/photo-1758200519616-56bac165cb33?w=1200&h=675&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      genre: 'House',
      description: 'Клип снят на живом выступлении в одном из крупнейших клубов Москвы. Энергия танцпола и невероятная атмосфера.',
      tags: ['liveperformance', 'house', 'electronic', 'dance'],
      year: '2026',
      director: 'Live Production Team',
      duration: '4:12',
      views: 89200,
      likes: 6540,
      shares: 892,
      comments: 234,
      uploadedAt: '5 дней назад',
      releaseDate: '10 января 2026',
      credits: [
        { role: 'Режиссер', name: 'Live Production Team' },
        { role: 'Оператор', name: 'Multi-cam Setup' },
        { role: 'Монтаж', name: 'DJ Midnight' },
        { role: 'Звук', name: 'Club Sound System' }
      ],
      isLiked: false,
      isInPlaylist: false
    },
    3: {
      id: 3,
      title: 'Neon Nights',
      artist: 'Neon Artist',
      artistId: 'neon-artist',
      artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      artistSubscribers: 87500,
      album: 'City Lights',
      thumbnail: 'https://images.unsplash.com/photo-1719759644679-05b1dad07577?w=1200&h=675&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      genre: 'Synthwave',
      description: 'Визуальная одиссея в стиле 80-х с неоновыми огнями и ретро-футуристическими локациями.',
      tags: ['synthwave', 'retro', '80s', 'neon', 'aesthetic'],
      year: '2026',
      director: 'Retro Vision Studio',
      duration: '4:55',
      views: 76300,
      likes: 5120,
      shares: 678,
      comments: 198,
      uploadedAt: '1 неделю назад',
      releaseDate: '5 января 2026',
      credits: [
        { role: 'Режиссер', name: 'Retro Vision Studio' },
        { role: 'Оператор', name: 'Viktor Retro' },
        { role: 'Монтаж', name: 'Synthwave Edit Team' },
        { role: 'Цветокоррекция', name: 'Neon Color Grading' },
        { role: 'VFX', name: '80s Effects Lab' }
      ],
      isLiked: false,
      isInPlaylist: false
    },
    4: {
      id: 4,
      title: 'Urban Dreams',
      artist: 'City Beats',
      artistId: 'city-beats',
      artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      artistSubscribers: 156000,
      album: 'Metro Sounds',
      thumbnail: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?w=1200&h=675&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      genre: 'Lo-Fi Hip Hop',
      description: 'Анимированный клип в стиле lo-fi с урбанистическими пейзажами и уютной атмосферой.',
      tags: ['lofi', 'hiphop', 'animated', 'chill', 'urban'],
      year: '2026',
      director: 'Animation Collective',
      duration: '3:38',
      views: 102500,
      likes: 7890,
      shares: 934,
      comments: 267,
      uploadedAt: '3 дня назад',
      releaseDate: '12 января 2026',
      credits: [
        { role: 'Режиссер', name: 'Animation Collective' },
        { role: 'Анимация', name: 'Lo-Fi Animation Studio' },
        { role: 'Художник', name: 'Urban Art Team' },
        { role: 'Монтаж', name: 'City Beats' },
        { role: 'Композитинг', name: 'Digital Layers Pro' }
      ],
      isLiked: false,
      isInPlaylist: false
    }
  };

  // База комментариев для каждого видео
  const commentsDatabase: { [key: number]: Comment[] } = {
    1: [
      {
        id: 1,
        user: {
          name: 'Мария Соколова',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Невероятная операторская работа! Каждый кадр - произведение искусства 🎬✨',
        timestamp: '2 часа назад',
        likes: 56
      },
      {
        id: 2,
        user: {
          name: 'Дмитрий Волков',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        text: 'Потрясающая атмосфера! Смотрел на одном дыхании',
        timestamp: '5 часов назад',
        likes: 34
      },
      {
        id: 3,
        user: {
          name: 'Анна Петрова',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Когда следующий клип? Ждем еще! 🔥',
        timestamp: '1 день назад',
        likes: 78
      }
    ],
    2: [
      {
        id: 1,
        user: {
          name: 'Максим Танцор',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Энергия просто зашкаливает! Лучший сет этого года 🔊💥',
        timestamp: '1 час назад',
        likes: 92
      },
      {
        id: 2,
        user: {
          name: 'Катя Музыка',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        },
        text: 'Был на этом выступлении - незабываемые эмоции!',
        timestamp: '3 часа назад',
        likes: 45
      }
    ],
    3: [
      {
        id: 1,
        user: {
          name: 'Retro Fan',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
        },
        text: 'Ностальгия по 80-м! Визуал просто космос 🌟',
        timestamp: '4 часа назад',
        likes: 67
      },
      {
        id: 2,
        user: {
          name: 'Synthwave Lover',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Лучший synthwave клип что я видел!',
        timestamp: '6 часов назад',
        likes: 54
      }
    ],
    4: [
      {
        id: 1,
        user: {
          name: 'Chill Vibes',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        text: 'Идеально для учебы и работы! Спасибо 📚✨',
        timestamp: '30 минут назад',
        likes: 41
      },
      {
        id: 2,
        user: {
          name: 'Lo-Fi Head',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Анимация огонь! Добавил в свой плейлист 🎨',
        timestamp: '2 часа назад',
        likes: 38
      }
    ]
  };

  // Track state - изменяется при выборе похожего видео
  const [video, setVideo] = useState<VideoData>(videosDatabase[videoId] || videosDatabase[1]);

  // Читаем URL параметры при загрузке компонента
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoIdFromUrl = urlParams.get('video');
    
    if (videoIdFromUrl) {
      const videoIdNumber = parseInt(videoIdFromUrl, 10);
      const videoFromUrl = videosDatabase[videoIdNumber];
      
      if (videoFromUrl && videoFromUrl.id !== video.id) {
        setVideo(videoFromUrl);
        setIsLiked(videoFromUrl.isLiked || false);
        setLikesCount(videoFromUrl.likes);
        setIsInPlaylist(videoFromUrl.isInPlaylist || false);
        setActiveTab('about');
        setVideoError(false);
        setCurrentTime(0);
        setIsPlaying(false);
        setCommentsList(commentsDatabase[videoIdNumber] || []); // Обновляем комментарии
      }
    }
  }, []); // Запускается только при монтировании

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(225); // 3:45 in seconds
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'comments' | 'credits'>('about');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(video.isInPlaylist);
  const [isDownloading, setIsDownloading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>(commentsDatabase[video.id] || []);
  const [showDownloadNotification, setShowDownloadNotification] = useState(false);
  const [showPlaylistNotification, setShowPlaylistNotification] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Video player controls
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => setCurrentTime(videoElement.currentTime);
    const updateDuration = () => setDuration(videoElement.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => setIsVideoLoading(false);
    const handleError = () => {
      setVideoError(true);
      setIsPlaying(false);
      setIsVideoLoading(false);
    };
    const handleLoadStart = () => setIsVideoLoading(true);

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    if (showShareMenu || showMoreMenu || showQualityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu, showMoreMenu, showQualityMenu]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setShowDownloadNotification(true);
    setShowMoreMenu(false);
    
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `${video.artist} - ${video.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setIsDownloading(false);
      setTimeout(() => setShowDownloadNotification(false), 2000);
    }, 1500);
  };

  const handleAddToPlaylist = () => {
    setIsInPlaylist(!isInPlaylist);
    setShowPlaylistNotification(true);
    setShowMoreMenu(false);
    setTimeout(() => setShowPlaylistNotification(false), 2000);
  };

  const handleSkipBack = () => {
    if (videoRef.current) {
      // Если прошло меньше 3 секунд, перейти к предыдущему видео
      // Иначе вернуться к началу текущего видео или перемотать на 10 сек назад
      if (videoRef.current.currentTime < 3) {
        // В production здесь будет логика перехода к предыдущему видео
        console.log('Skip to previous video');
        // Пока просто возвращаемся к началу
        videoRef.current.currentTime = 0;
      } else if (videoRef.current.currentTime < 10) {
        // Если меньше 10 секунд, просто к началу
        videoRef.current.currentTime = 0;
      } else {
        // Иначе перематываем на 10 секунд назад
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
      }
    }
  };

  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: commentsList.length + 1,
        user: {
          name: profileData?.name || 'Вы',
          avatar: profileData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          verified: false
        },
        text: commentText,
        timestamp: 'Только что',
        likes: 0
      };
      setCommentsList([newComment, ...commentsList]);
      setCommentText('');
    }
  };

  const handleShare = (platform: 'copy' | 'vk' | 'telegram' | 'twitter') => {
    // Генерируем уникальную ссылку с ID видео
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?video=${video.id}`;
    const text = `${video.title} - ${video.artist}`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    } else {
      const shareUrls = {
        vk: `https://vk.com/share.php?url=${encodeURIComponent(url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
      };
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const handlePlayRelatedVideo = (videoId: number) => {
    const newVideo = videosDatabase[videoId];
    if (newVideo) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      setVideo(newVideo);
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLiked(newVideo.isLiked || false);
      setLikesCount(newVideo.likes);
      setIsInPlaylist(newVideo.isInPlaylist || false);
      setActiveTab('about');
      setVideoError(false);
      setCommentsList(commentsDatabase[videoId] || []); // Обновляем комментарии
      setCommentText(''); // Очищаем текст комментария
      
      // Обновляем URL в браузере для шеринга
      window.history.pushState({}, '', `?video=${videoId}`);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load(); // Перезагружаем видео
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 300);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Динамический список похожих видео - исключаем текущее и берем первые 3
  const relatedVideos = Object.values(videosDatabase)
    .filter(v => v.id !== video.id)
    .slice(0, 3)
    .map(v => ({
      id: v.id,
      title: v.title,
      artist: v.artist,
      thumbnail: v.thumbnail,
      duration: v.duration,
      views: v.views
    }));

  return (
    <div className="min-h-screen pb-20 sm:pb-24 md:pb-8">
      {/* Header with back button - улучшенный адаптив */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between sticky top-0 z-40 py-3 sm:py-4 backdrop-blur-xl bg-gradient-to-b from-gray-900/95 to-gray-900/80 border-b border-white/5 -mx-4 sm:mx-0 px-4 sm:px-0">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-sm sm:text-base">Назад к видео</span>
          <span className="inline sm:hidden text-sm">Назад</span>
        </motion.button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Share button */}
          <div className="relative" ref={shareMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 sm:p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 touch-manipulation"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 sm:w-56 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-xl p-2 shadow-2xl z-50"
                >
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <Copy className="w-5 h-5" />
                    <span>Копировать ссылку</span>
                  </button>
                  <button
                    onClick={() => handleShare('vk')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>ВКонтакте</span>
                  </button>
                  <button
                    onClick={() => handleShare('telegram')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Telegram</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Twitter</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* More menu */}
          <div className="relative" ref={moreMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 sm:p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 touch-manipulation"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 sm:w-56 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-xl p-2 shadow-2xl z-50"
                >
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                    <span>Скачать видео</span>
                  </button>
                  <button
                    onClick={handleAddToPlaylist}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <List className="w-5 h-5" />
                    <span>Добавить в плейлист</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notifications - адаптивные */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 backdrop-blur-xl bg-green-500/20 border border-green-400/30 rounded-xl px-4 sm:px-6 py-3 flex items-center justify-center sm:justify-start gap-2"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <span className="text-white font-semibold text-sm sm:text-base">Ссылка скопирована!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDownloadNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 backdrop-blur-xl bg-cyan-500/20 border border-cyan-400/30 rounded-xl px-4 sm:px-6 py-3 flex items-center justify-center sm:justify-start gap-2"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-white font-semibold text-sm sm:text-base">Видео загружается...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPlaylistNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 backdrop-blur-xl bg-purple-500/20 border border-purple-400/30 rounded-xl px-4 sm:px-6 py-3 flex items-center justify-center sm:justify-start gap-2"
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-white font-semibold text-sm sm:text-base">
              {isInPlaylist ? 'Добавлено в плейлист!' : 'Удалено из плейлиста'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {videoError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-xl px-4 sm:px-6 py-3 flex items-center justify-center sm:justify-start gap-2"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            <span className="text-white font-semibold text-sm sm:text-base">Ошибка загрузки видео</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Video player - улучшенный адаптив */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-visible -mx-4 sm:mx-0"
          >
            <div
              ref={playerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              className="relative aspect-video bg-black group cursor-pointer rounded-t-2xl sm:rounded-t-3xl overflow-hidden"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full h-full"
                poster={video.thumbnail}
              />

              {/* Loading overlay */}
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                </div>
              )}

              {/* Play button overlay */}
              {!isPlaying && !isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30"
                  >
                    <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
                  </motion.div>
                </div>
              )}

              {/* Video controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4 space-y-2 sm:space-y-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Progress bar - адаптивный */}
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 sm:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer touch-manipulation [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-cyan-300"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
                        {/* Skip back */}
                        <button
                          onClick={handleSkipBack}
                          className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/20 transition-all touch-manipulation"
                        >
                          <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Play/Pause - больше на мобильных */}
                        <button
                          onClick={togglePlay}
                          className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/20 transition-all touch-manipulation"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </button>

                        {/* Skip forward */}
                        <button
                          onClick={handleSkipForward}
                          className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/20 transition-all touch-manipulation"
                        >
                          <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Time - компактный на мобильных */}
                        <div className="text-xs sm:text-sm text-white font-medium hidden xs:block">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                        <div className="text-xs text-white font-medium block xs:hidden">
                          {formatTime(currentTime)}
                        </div>

                        {/* Volume - скрыт на маленьких экранах */}
                        <div className="hidden lg:flex items-center gap-2">
                          <button onClick={toggleMute} className="p-2 rounded-lg text-white hover:bg-white/20 transition-all touch-manipulation">
                            {isMuted || volume === 0 ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        {/* Volume на мобильных - только иконка */}
                        <button onClick={toggleMute} className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/20 transition-all touch-manipulation lg:hidden">
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>

                        {/* Quality selector - скрыт на очень маленьких экранах */}
                        <div className="relative hidden sm:block" ref={qualityMenuRef}>
                          <button
                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                            className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-1 touch-manipulation"
                          >
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm hidden md:inline">{selectedQuality}</span>
                          </button>

                          <AnimatePresence>
                            {showQualityMenu && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full right-0 mb-2 w-32 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-xl p-2 shadow-2xl z-[9999]"
                              >
                                {['2160p', '1440p', '1080p', '720p', '480p', '360p'].map((quality) => (
                                  <button
                                    key={quality}
                                    onClick={() => {
                                      setSelectedQuality(quality);
                                      setShowQualityMenu(false);
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                                      selectedQuality === quality
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-white hover:bg-white/20'
                                    }`}
                                  >
                                    {quality}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Fullscreen */}
                        <button
                          onClick={toggleFullscreen}
                          className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/20 transition-all touch-manipulation"
                        >
                          {isFullscreen ? (
                            <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Video info - адаптивный */}
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                {video.title}
              </h1>
              <p className="text-base sm:text-lg text-gray-300 mb-4">{video.artist}</p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 text-xs sm:text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(video.views)} просмотров</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{video.uploadedAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{video.duration}</span>
                </div>
              </div>

              {/* Action buttons - адаптивные */}
              <div className="relative z-[100] flex flex-wrap items-center gap-2 sm:gap-3 pt-4 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 touch-manipulation ${
                    isLiked
                      ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg shadow-pink-500/30'
                      : 'backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-white' : ''}`} />
                  <span>{formatNumber(likesCount)}</span>
                </motion.button>

                <div className="relative" ref={shareMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 font-semibold text-sm sm:text-base transition-all duration-300 touch-manipulation"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Поделиться</span>
                    <span className="inline sm:hidden">Share</span>
                  </motion.button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 top-full mt-2 w-56 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-xl p-2 shadow-2xl z-[9999]"
                      >
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                        >
                          <Copy className="w-5 h-5" />
                          <span>Копировать ссылку</span>
                        </button>
                        <button
                          onClick={() => handleShare('vk')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>ВКонтакте</span>
                        </button>
                        <button
                          onClick={() => handleShare('telegram')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>Telegram</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>Twitter</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 font-semibold text-sm sm:text-base transition-all duration-300 touch-manipulation"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Скачать</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToPlaylist}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 font-semibold text-sm sm:text-base transition-all duration-300 touch-manipulation"
                >
                  <List className="w-5 h-5" />
                  <span className="hidden sm:inline">В плейлист</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Eye, label: 'Просмотров', value: formatNumber(video.views), color: 'cyan' },
              { icon: Heart, label: 'Лайков', value: formatNumber(likesCount), color: 'pink' },
              { icon: Share2, label: 'Репостов', value: formatNumber(video.shares), color: 'purple' },
              { icon: MessageCircle, label: 'Комментариев', value: video.comments, color: 'blue' }
            ].map((stat, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
          >
            {/* Tab headers - адаптивные */}
            <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
              {[
                { id: 'about', label: 'О видео', icon: Video, shortLabel: 'О видео' },
                { id: 'comments', label: 'Комментарии', icon: MessageCircle, shortLabel: 'Комменты' },
                { id: 'credits', label: 'Создатели', icon: Award, shortLabel: 'Титры' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all duration-300 whitespace-nowrap touch-manipulation ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-cyan-400 bg-white/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.shortLabel}</span>
                  {tab.id === 'comments' && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400 text-xs">
                      {video.comments}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content - адаптивный padding */}
            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Описание</h3>
                      <p className="text-gray-300 leading-relaxed">{video.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Исполнитель</div>
                            <div className="font-semibold">{video.artist}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Film className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Режиссер</div>
                            <div className="font-semibold">{video.director}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Video className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Жанр</div>
                            <div className="font-semibold">{video.genre}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Релиз</div>
                            <div className="font-semibold">{video.releaseDate}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Длительность</div>
                            <div className="font-semibold">{video.duration}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Eye className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Просмотры</div>
                            <div className="font-semibold">{formatNumber(video.views)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-400 mb-3">Теги</h4>
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-lg backdrop-blur-md bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'comments' && (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Comment form */}
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
                      <textarea
                        placeholder="Оставьте комментарий..."
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 resize-none transition-all duration-300"
                      />
                      <div className="flex justify-end mt-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSubmitComment}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Отправить</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-4">
                      {commentsList.map((comment) => (
                        <div
                          key={comment.id}
                          className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex gap-3">
                            <ImageWithFallback
                              src={comment.user.avatar}
                              alt={comment.user.name}
                              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white">{comment.user.name}</span>
                                {comment.user.verified && (
                                  <Check className="w-4 h-4 text-cyan-400" />
                                )}
                                <span className="text-sm text-gray-400">{comment.timestamp}</span>
                              </div>
                              <p className="text-gray-300 mb-2">{comment.text}</p>
                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{comment.likes}</span>
                                </button>
                                <button className="text-sm text-gray-400 hover:text-white transition-colors">
                                  Ответить
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'credits' && (
                  <motion.div
                    key="credits"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {video.credits && video.credits.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-white mb-4">Над видео работали</h3>
                        {video.credits.map((credit, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                          >
                            <div>
                              <div className="text-sm text-gray-400">{credit.role}</div>
                              <div className="font-semibold text-white">{credit.name}</div>
                            </div>
                            <Award className="w-5 h-5 text-yellow-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Информация о создателях пока не добавлена</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Right - адаптивная */}
        <div className="space-y-4 sm:space-y-6">
          {/* Artist card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Исполнитель</h3>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <ImageWithFallback
                src={profileData?.avatar || video.artistAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                alt={video.artist}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full ring-2 ring-cyan-400/50 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white mb-1 text-sm sm:text-base truncate">{profileData?.name || video.artist}</div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {video.artistSubscribers 
                    ? `${(video.artistSubscribers / 1000).toFixed(video.artistSubscribers >= 1000000 ? 1 : 0)}${video.artistSubscribers >= 1000000 ? 'M' : 'K'} подписчиков`
                    : '123K подписчиков'
                  }
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Переход на публичную страницу артиста
                if (video.artistId) {
                  window.open(`/artist/${video.artistId}`, '_blank');
                } else {
                  onNavigate?.('profile');
                }
              }}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm sm:text-base hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 touch-manipulation"
            >
              <span className="hidden sm:inline">Перейти в профиль</span>
              <span className="inline sm:hidden">В профиль</span>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          </motion.div>

          {/* Related videos - адаптивная */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white">Похожие видео</h3>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              {relatedVideos.map((relatedVideo, index) => (
                <motion.div
                  key={relatedVideo.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handlePlayRelatedVideo(relatedVideo.id)}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group touch-manipulation"
                >
                  <div className="relative flex-shrink-0">
                    <ImageWithFallback
                      src={relatedVideo.thumbnail}
                      alt={relatedVideo.title}
                      className="w-20 h-12 sm:w-24 sm:h-14 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs">
                      {relatedVideo.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-xs sm:text-sm truncate mb-0.5 sm:mb-1">
                      {relatedVideo.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate mb-0.5 sm:mb-1">
                      {relatedVideo.artist}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(relatedVideo.views)} просмотров
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Promotion card - адаптивная */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6"
          >
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1 text-sm sm:text-base">Продвинуть видео</h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  Получите больше просмотров и лайков
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm sm:text-base hover:from-purple-600 hover:to-pink-700 transition-all duration-300 touch-manipulation"
            >
              Продвинуть
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}