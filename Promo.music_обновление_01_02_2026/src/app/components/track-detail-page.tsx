import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Download, 
  MoreVertical, 
  Clock, 
  Calendar, 
  Music2, 
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
  Repeat,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Shuffle,
  List,
  Radio,
  Disc3,
  Mic2,
  TrendingUp,
  Award,
  Zap,
  Music,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface Track {
  id: number;
  title: string;
  artist: string;
  artistId?: string;          // ID артиста для ссылки на профиль
  artistAvatar?: string;      // Аватар артиста
  artistSubscribers?: number; // Количество подписчиков артиста
  album?: string;
  cover: string;
  audioUrl: string;
  genre: string;
  description: string;
  tags: string[];
  year: string;
  label: string;
  authors: string;
  duration: string;
  plays: number;
  likes: number;
  shares: number;
  comments: number;
  uploadedAt: string;
  releaseDate?: string;
  lyrics?: string;
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

interface TrackDetailPageProps {
  trackId: number;
  onBack: () => void;
  onNavigate?: (section: string) => void;
  profileData?: {
    name: string;
    avatar: string;
  };
}

export function TrackDetailPage({ trackId, onBack, onNavigate, profileData }: TrackDetailPageProps) {
  // Mock database of tracks - в production это будет загружаться из API/Supabase
  const tracksDatabase: { [key: number]: Track } = {
    1: {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Александр Иванов',
      artistId: 'aleksandr-ivanov',
      artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      artistSubscribers: 123000,
      album: 'Night Sessions',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      genre: 'Electronic',
      description: 'Атмосферный электронный трек с глубоким басом и мечтательными синтезаторами. Создан для ночных поездок и глубоких размышлений. Трек включает элементы ambient, downtempo и chillwave, создавая уникальное звучание.',
      tags: ['electronic', 'ambient', 'chill', 'downtempo', 'synthwave'],
      year: '2026',
      label: 'Independent',
      authors: 'Александр Иванов',
      duration: '3:45',
      plays: 45230,
      likes: 3420,
      shares: 856,
      comments: 124,
      uploadedAt: '2 дня назад',
      releaseDate: '15 января 2026',
      lyrics: `Verse 1:\nIn the silence of the night\nDreams are dancing in the light\nMidnight whispers soft and low\nWhere the shadows dare to go\n\nChorus:\nMidnight dreams, calling me\nThrough the stars, wild and free\nIn this moment, I believe\nMidnight dreams, won't let me leave\n\nVerse 2:\nCity lights are fading out\nNo more fear, no more doubt\nIn this space between the hours\nFinding all my hidden powers`,
      credits: [
        { role: 'Продюсер', name: 'Александр Иванов' },
        { role: 'Звукорежиссер', name: 'Михаил Петров' },
        { role: 'Мастеринг', name: 'Sound Studio Pro' },
        { role: 'Artwork', name: 'Anna Designova' }
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
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      genre: 'House',
      description: 'Энергичный хаус-трек с мощным басом и захватывающими синтезаторами. Идеален для вечеринок и танцполов.',
      tags: ['house', 'electronic', 'dance', 'energy'],
      year: '2026',
      label: 'Electronic Beats',
      authors: 'DJ Midnight',
      duration: '4:12',
      plays: 32100,
      likes: 2850,
      shares: 654,
      comments: 89,
      uploadedAt: '5 дней назад',
      releaseDate: '10 января 2026',
      lyrics: `Intro:\\nFeel the bass, feel the sound\\nOn the floor, spinning round\\n\\nVerse 1:\\nElectric soul in the night\\nDancing under neon light\\nBass is pumping through my veins\\nMusic breaking all the chains\\n\\nChorus:\\nElectric soul, set me free\\nIn this moment, wild and free\\nFeel the rhythm, feel the beat\\nElectric soul, can't be beat\\n\\nVerse 2:\\nLost in sound, lost in time\\nEvery beat, every rhyme\\nHands up high, touch the sky\\nElectric soul will never die`,
      credits: [
        { role: 'Продюсер', name: 'DJ Midnight' },
        { role: 'Звукорежиссер', name: 'Club Mix Pro' },
        { role: 'Мастеринг', name: 'Electronic Masters' }
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
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      genre: 'Synthwave',
      description: 'Ретро-футуристический синтвейв трек с ностальгическими мелодиями и яркими синтезаторами 80-х.',
      tags: ['synthwave', 'retro', '80s', 'neon'],
      year: '2026',
      label: 'Retro Wave Records',
      authors: 'Neon Artist',
      duration: '4:55',
      plays: 28500,
      likes: 2340,
      shares: 512,
      comments: 76,
      uploadedAt: '1 неделю назад',
      releaseDate: '5 января 2026',
      lyrics: `Intro:\\nNeon lights, retro nights\\n\\nVerse 1:\\nDriving through the city glow\\nSynthwave on the radio\\nNeon signs are calling me\\nBack to 1983\\n\\nChorus:\\nNeon nights, take me back\\nTo the future on this track\\nRetro dreams in modern times\\nNeon nights, the stars align\\n\\nVerse 2:\\nPurple skies and pink sunsets\\nMemories I can't forget\\nSynthesizers paint the scene\\nLiving in a neon dream`,
      credits: [
        { role: 'Продюсер', name: 'Neon Artist' },
        { role: 'Звукорежиссер', name: 'Retro Sound Lab' },
        { role: 'Мастеринг', name: 'Synthwave Masters' },
        { role: 'Синтезаторы', name: 'Vintage Synth Collection' }
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
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      genre: 'Lo-Fi Hip Hop',
      description: 'Расслабляющий lo-fi хип-хоп бит с урбанистическими сэмплами и мягкими джазовыми аккордами.',
      tags: ['lofi', 'hiphop', 'chill', 'beats'],
      year: '2026',
      label: 'Chill Beats Co',
      authors: 'City Beats',
      duration: '3:38',
      plays: 41200,
      likes: 3890,
      shares: 723,
      comments: 102,
      uploadedAt: '3 дня назад',
      releaseDate: '12 января 2026',
      lyrics: `Intro:\\n[Lo-fi beats and rain sounds]\\n\\nVerse 1:\\nCity streets in morning haze\\nCoffee shop and rainy days\\nJazzy chords and mellow vibes\\nUrban dreams where peace resides\\n\\nChorus:\\nUrban dreams, take me away\\nTo a place where I can stay\\nLo-fi beats and gentle rain\\nUrban dreams ease the pain\\n\\nVerse 2:\\nSkateboard rolling down the street\\nHeadphones playing steady beat\\nSunset paints the city gold\\nUrban dreams never grow old`,
      credits: [
        { role: 'Продюсер', name: 'City Beats' },
        { role: 'Звукорежиссер', name: 'Lo-Fi Productions' },
        { role: 'Мастеринг', name: 'Chill Masters Studio' },
        { role: 'Семплы', name: 'Urban Sound Library' }
      ],
      isLiked: false,
      isInPlaylist: false
    }
  };

  // База комментариев для каждого трека
  const commentsDatabase: { [key: number]: Comment[] } = {
    1: [
      {
        id: 1,
        user: {
          name: 'Мария Соколова',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Невероятный трек! Слушаю на повторе уже неделю. Особенно нравится звучание на 2:30 💙',
        timestamp: '2 часа назад',
        likes: 24
      },
      {
        id: 2,
        user: {
          name: 'Дмитрий Волков',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        text: 'Шикарная атмосфера! Это именно то, что нужно для вечерних прогулок',
        timestamp: '5 часов назад',
        likes: 18
      },
      {
        id: 3,
        user: {
          name: 'Анна Петрова',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Когда будет альбом? С нетерпением жду новых треков в этом стиле! 🎵',
        timestamp: '1 день назад',
        likes: 42
      }
    ],
    2: [
      {
        id: 1,
        user: {
          name: 'Рейвер Иван',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Бас просто разносит! Включил на максималках - соседи счастливы 😄🔊',
        timestamp: '1 час назад',
        likes: 67
      },
      {
        id: 2,
        user: {
          name: 'Dance Queen',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        },
        text: 'Это же хит! Играли вчера в клубе - весь зал танцевал!',
        timestamp: '4 часа назад',
        likes: 51
      }
    ],
    3: [
      {
        id: 1,
        user: {
          name: 'Synthwave Kid',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
        },
        text: 'Ощущение что я в 1985-м за рулем DeLorean! Идеально! ⚡',
        timestamp: '3 часа назад',
        likes: 43
      },
      {
        id: 2,
        user: {
          name: 'Retro Lover',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Лучший synthwave трек этого года, без вариантов!',
        timestamp: '7 часов назад',
        likes: 38
      }
    ],
    4: [
      {
        id: 1,
        user: {
          name: 'Study Buddy',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        text: 'Делаю под этот трек всю курсовую. Концентрация 200%! 📚✨',
        timestamp: '45 минут назад',
        likes: 29
      },
      {
        id: 2,
        user: {
          name: 'Chill Master',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
          verified: true
        },
        text: 'Добавил в мой рабочий плейлист. Спасибо за вайб! 🎧',
        timestamp: '2 часа назад',
        likes: 35
      }
    ]
  };

  // Track state - изменяется при выборе похожего трека
  const [track, setTrack] = useState<Track>(tracksDatabase[trackId] || tracksDatabase[1]);

  // Читаем URL параметры при загрузке компонента
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackIdFromUrl = urlParams.get('track');
    
    if (trackIdFromUrl) {
      const trackIdNumber = parseInt(trackIdFromUrl, 10);
      const trackFromUrl = tracksDatabase[trackIdNumber];
      
      if (trackFromUrl && trackFromUrl.id !== track.id) {
        setTrack(trackFromUrl);
        setIsLiked(trackFromUrl.isLiked || false);
        setLikesCount(trackFromUrl.likes);
        setIsInPlaylist(trackFromUrl.isInPlaylist || false);
        setActiveTab('about');
        setAudioError(false);
        setCurrentTime(0);
        setIsPlaying(false);
        setCommentsList(commentsDatabase[trackIdNumber] || []); // Обновляем комментарии
      }
    }
  }, []); // Запускается только при монтировании

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(225); // 3:45 in seconds
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(track.isLiked);
  const [likesCount, setLikesCount] = useState(track.likes);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'lyrics' | 'comments' | 'credits'>('about');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(track.isInPlaylist);
  const [isDownloading, setIsDownloading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>(commentsDatabase[track.id] || []);
  const [showDownloadNotification, setShowDownloadNotification] = useState(false);
  const [showPlaylistNotification, setShowPlaylistNotification] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Audio player controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };
    const handleCanPlay = () => setIsAudioLoading(false);
    const handleError = () => {
      setAudioError(true);
      setIsPlaying(false);
      setIsAudioLoading(false);
    };
    const handleLoadStart = () => setIsAudioLoading(true);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [isRepeat]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showShareMenu || showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu, showMoreMenu]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
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
    
    // Создаем временную ссылку и инициируем скачивание
    const link = document.createElement('a');
    link.href = track.audioUrl;
    link.download = `${track.artist} - ${track.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Симуляция процесса скачивания для UI
    setTimeout(() => {
      setIsDownloading(false);
      setTimeout(() => setShowDownloadNotification(false), 2000);
    }, 1500);
  };

  const handleAddToPlaylist = () => {
    setIsInPlaylist(!isInPlaylist);
    setShowPlaylistNotification(true);
    setTimeout(() => setShowPlaylistNotification(false), 2000);
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      // Если прошло меньше 3 секунд, перейти к предыдущему треку
      // Иначе вернуться к началу текущего трека
      if (audioRef.current.currentTime < 3) {
        // В production здесь будет логика перехода к предыдущему треку
        console.log('Skip to previous track');
      } else {
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handleSkipForward = () => {
    // В production здесь будет логика перехода к следующему треку
    console.log('Skip to next track');
    // Пока просто перематываем на 10 секунд вперед
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
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
    // Генерируем уникальную ссылку с ID трека
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?track=${track.id}`;
    const text = `${track.title} - ${track.artist}`;

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

  // Handle playing related track
  const handlePlayRelatedTrack = (trackId: number) => {
    const newTrack = tracksDatabase[trackId];
    if (newTrack) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Update track and reset states
      setTrack(newTrack);
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLiked(newTrack.isLiked || false);
      setLikesCount(newTrack.likes);
      setIsInPlaylist(newTrack.isInPlaylist || false);
      setActiveTab('about');
      setAudioError(false);
      setCommentsList(commentsDatabase[trackId] || []); // Обновляем комментарии
      setCommentText(''); // Очищаем текст комментария
      
      // Обновляем URL в браузере для шеринга
      window.history.pushState({}, '', `?track=${trackId}`);
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Auto-play new track after a short delay
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load(); // Перезагружаем аудио
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 300);
    }
  };

  // Динамический список похожих треков - исключаем текущий и берем первые 3
  const relatedTracks = Object.values(tracksDatabase)
    .filter(t => t.id !== track.id)
    .slice(0, 3)
    .map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      artistAvatar: t.artistAvatar,
      artistId: t.artistId,
      cover: t.cover,
      duration: t.duration,
      plays: t.plays
    }));

  return (
    <div className="min-h-screen pb-32 md:pb-8">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={track.audioUrl} preload="metadata" />

      {/* Header with back button */}
      <div className="mb-6 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Назад к трекам</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {/* Share button */}
          <div className="relative" ref={shareMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-xl p-2 shadow-2xl z-[9999]"
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

          {/* More menu */}
          <div className="relative" ref={moreMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-xl p-2 shadow-2xl z-[9999]"
                >
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                    <span>Скачать трек</span>
                  </button>
                  <button
                    onClick={handleAddToPlaylist}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                  >
                    <List className="w-5 h-5" />
                    <span>Добавить в плейлист</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300">
                    <Radio className="w-5 h-5" />
                    <span>Радио по треку</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Copy notification */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 backdrop-blur-xl bg-green-500/20 border border-green-400/30 rounded-xl px-6 py-3 flex items-center gap-2"
          >
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold">Ссылка скопирована!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download notification */}
      <AnimatePresence>
        {showDownloadNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 backdrop-blur-xl bg-cyan-500/20 border border-cyan-400/30 rounded-xl px-6 py-3 flex items-center gap-2"
          >
            <Download className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold">Трек загружается...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist notification */}
      <AnimatePresence>
        {showPlaylistNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 backdrop-blur-xl bg-purple-500/20 border border-purple-400/30 rounded-xl px-6 py-3 flex items-center gap-2"
          >
            <List className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">
              {isInPlaylist ? 'Добавлено в плейлист!' : 'Удале��о из плейлиста'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio error notification */}
      <AnimatePresence>
        {audioError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-xl px-6 py-3 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-white font-semibold">Ошибка загрузки аудио</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Left & Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero section with cover and player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Cover image */}
            <div className="relative aspect-video md:aspect-[21/9] overflow-hidden group">
              <img
                src={track.cover}
                alt={track.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Share and More buttons in top right */}
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                  >
                    <Share2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </motion.button>
                </div>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                  >
                    <MoreVertical className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Track info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-end gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 truncate">
                      {track.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-3 truncate">
                      {track.artist}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{track.year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Music2 className="w-4 h-4" />
                        <span>{track.genre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{track.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Player controls */}
            <div className="p-4 md:p-5 space-y-3 backdrop-blur-2xl bg-white/[0.02] border-t border-white/5">
              {/* Progress bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-cyan-300 transition-all"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Secondary controls */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isShuffle ? 'text-cyan-400 bg-cyan-400/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>

                  {/* Main controls */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSkipBack}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>

                  {/* Play/Pause button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 flex items-center justify-center transition-all duration-300 shadow-lg shadow-cyan-500/20"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
                    ) : (
                      <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white ml-0.5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSkipForward}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isRepeat ? 'text-cyan-400 bg-cyan-400/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Repeat className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                </div>

                {/* Right side - Volume and action buttons */}
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Volume control - visible on all screens */}
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMute}
                      className="text-gray-400 hover:text-white transition-all duration-300"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </motion.button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 md:w-20 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-cyan-300 transition-all"
                    />
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-6 bg-white/10"></div>

                  {/* Like and Playlist buttons */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLike}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isLiked ? 'text-pink-400 bg-pink-400/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-pink-400' : ''}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddToPlaylist}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isInPlaylist ? 'text-cyan-400 bg-cyan-400/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <List className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </motion.button>
                </div>
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
              { icon: Eye, label: 'Прослушиваний', value: formatNumber(track.plays), color: 'cyan' },
              { icon: Heart, label: 'Лайков', value: formatNumber(likesCount), color: 'pink' },
              { icon: Share2, label: 'Репостов', value: formatNumber(track.shares), color: 'purple' },
              { icon: MessageCircle, label: 'Комментариев', value: track.comments, color: 'blue' }
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
            {/* Tab headers */}
            <div className="flex border-b border-white/10 overflow-x-auto">
              {[
                { id: 'about', label: 'О треке', icon: Music },
                { id: 'lyrics', label: 'Текст', icon: Mic2 },
                { id: 'comments', label: 'Комментарии', icon: MessageCircle },
                { id: 'credits', label: 'Авторы', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-cyan-400 bg-white/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.id === 'comments' && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400 text-xs">
                      {track.comments}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
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
                      <p className="text-gray-300 leading-relaxed">{track.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Исполнитель</div>
                            <div className="font-semibold">{track.artist}</div>
                          </div>
                        </div>
                        {track.album && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Disc3 className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-400">Альбом</div>
                              <div className="font-semibold">{track.album}</div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-gray-300">
                          <Music2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Жанр</div>
                            <div className="font-semibold">{track.genre}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Релиз</div>
                            <div className="font-semibold">{track.releaseDate}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Лейбл</div>
                            <div className="font-semibold">{track.label}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Длительность</div>
                            <div className="font-semibold">{track.duration}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-400 mb-3">Теги</h4>
                      <div className="flex flex-wrap gap-2">
                        {track.tags.map((tag, index) => (
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

                {activeTab === 'lyrics' && (
                  <motion.div
                    key="lyrics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {track.lyrics ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4">Текст песни</h3>
                        <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {track.lyrics}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Mic2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Текст песни пока не добавлен</p>
                      </div>
                    )}
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
                    {track.credits && track.credits.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-white mb-4">Над треком работали</h3>
                        {track.credits.map((credit, index) => (
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
                        <p>Информация об авторах пока не добавлена</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Right */}
        <div className="space-y-6">
          {/* Artist card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Исполнитель</h3>
            <div className="flex items-center gap-4 mb-4">
              <ImageWithFallback
                src={profileData?.avatar || track.artistAvatar || 'https://i.pravatar.cc/100?img=33'}
                alt={track.artist}
                className="w-16 h-16 rounded-full ring-2 ring-cyan-400/50 object-cover"
              />
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">{profileData?.name || track.artist}</div>
                <div className="text-sm text-gray-400">
                  {track.artistSubscribers 
                    ? `${(track.artistSubscribers / 1000).toFixed(track.artistSubscribers >= 1000000 ? 1 : 0)}${track.artistSubscribers >= 1000000 ? 'M' : 'K'} подписчиков`
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
                if (track.artistId) {
                  window.open(`/artist/${track.artistId}`, '_blank');
                } else {
                  onNavigate?.('profile');
                }
              }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Перейти в профиль
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Related tracks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Похожие треки</h3>
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-3">
              {relatedTracks.map((relatedTrack, index) => (
                <motion.div
                  key={relatedTrack.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                >
                  {/* Cover with play overlay */}
                  <div 
                    className="relative flex-shrink-0 cursor-pointer"
                    onClick={() => handlePlayRelatedTrack(relatedTrack.id)}
                  >
                    <ImageWithFallback
                      src={relatedTrack.cover}
                      alt={relatedTrack.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  {/* Track info - clickable to play */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handlePlayRelatedTrack(relatedTrack.id)}
                  >
                    <div className="font-semibold text-white text-sm truncate">
                      {relatedTrack.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {relatedTrack.duration}
                    </div>
                  </div>

                  {/* Artist info - clickable to navigate */}
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (relatedTrack.artistId) {
                        window.open(`/artist/${relatedTrack.artistId}`, '_blank');
                      } else {
                        onNavigate?.('profile');
                      }
                    }}
                  >
                    {relatedTrack.artistAvatar && (
                      <ImageWithFallback
                        src={relatedTrack.artistAvatar}
                        alt={relatedTrack.artist}
                        className="w-8 h-8 rounded-full object-cover border border-white/20"
                      />
                    )}
                    <div className="hidden sm:flex flex-col items-start min-w-0">
                      <div className="text-xs text-gray-300 truncate max-w-[100px]">
                        {relatedTrack.artist}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(relatedTrack.plays)} plays
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Promotion card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-3xl p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Продвинуть трек</h3>
                <p className="text-sm text-gray-300">
                  Получите больше прослушиваний и лайков
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
            >
              Продвинуть
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}