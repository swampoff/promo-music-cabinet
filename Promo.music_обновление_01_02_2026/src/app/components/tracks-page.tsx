import { Play, Pause, Upload, Music, Image as ImageIcon, TrendingUp, Heart, Share2, Trash2, X, Check, Clock, XCircle, Coins, AlertCircle, Loader2, ChevronDown, Filter, Search, Edit2, Eye, EyeOff, Radio, Send, Building2, Users as UsersIcon, Sparkles, ExternalLink, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { TrackPitchingModal } from '@/app/components/track-pitching-modal';
import { useSubscription, subscriptionHelpers } from '@/contexts/SubscriptionContext';
import { useData } from '@/contexts/DataContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type TrackStatus = 'draft' | 'pending' | 'approved' | 'rejected';

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
  audioFile?: string;
  genre: string;
  description: string;
  tags: string[];
  year: string;
  label: string;
  authors: string;            // Основные исполнители
  duration: string;
  plays: number;
  likes: number;
  status: TrackStatus;
  rejectionReason?: string;
  uploadedAt: string;
  isPaid: boolean;
  releaseDate: string;        // Дата релиза
  credits: TrackCredits;      // Создатели
  rights: TrackRights;        // Права
}

const genres = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Jazz', 
  'Classical', 'Country', 'Reggae', 'Metal', 'Indie', 'Folk'
];

interface TracksPageProps {
  userCoins?: number;
  onCoinsUpdate?: (coins: number) => void;
  onTrackClick?: (trackId: number) => void;
  onOpenCoinsModal?: () => void;
}

export function TracksPage({ 
  userCoins = 0, 
  onCoinsUpdate = () => {}, 
  onTrackClick, 
  onOpenCoinsModal 
}: TracksPageProps) {
  // ==================== DATA CONTEXT ====================
  const { getTracksByUser, addTrack, updateTrack, deleteTrack, addTransaction } = useData();
  const { userId, userName } = useCurrentUser();
  
  // Get user's tracks from DataContext
  const userTracks = getTracksByUser(userId);
  
  // ==================== DEMO DATA (только если нет треков) ====================
  const demoTracks: Track[] = [
    { 
      id: 1, 
      title: 'Midnight Dreams', 
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      audioFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      genre: 'Electronic',
      description: 'Атмосферный электронный трек с глубоким басом',
      tags: ['electronic', 'ambient', 'chill'],
      year: '2026',
      label: 'Independent',
      authors: 'DJ Midnight',
      plays: 2400, 
      likes: 340, 
      duration: '3:45', 
      status: 'approved',
      uploadedAt: '2 дня назад',
      isPaid: true,
      releaseDate: '2026-06-15',
      credits: {
        musicComposer: 'DJ Midnight',
        lyricist: 'DJ Midnight',
        mixing: 'DJ Midnight',
        mastering: 'DJ Midnight',
        producer: 'DJ Midnight',
        arranger: 'DJ Midnight',
        soundEngineer: 'DJ Midnight'
      },
      rights: {
        copyright: '© 2026 DJ Midnight',
        phonographicCopyright: '℗ 2026 DJ Midnight',
        publisher: 'Independent',
        isrc: 'US-XYZ-26-00001',
        upc: '888888888888'
      }
    },
    { 
      id: 2, 
      title: 'Electric Soul', 
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      audioFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      genre: 'R&B',
      description: 'Душевный R&B с элементами фанка',
      tags: ['rnb', 'soul', 'funk'],
      year: '2026',
      label: 'Soul Records',
      authors: 'Soul Master',
      plays: 1800, 
      likes: 280, 
      duration: '4:12', 
      status: 'approved',
      uploadedAt: '5 дней назад',
      isPaid: false,
      releaseDate: '2026-06-15',
      credits: {
        musicComposer: 'Soul Master',
        lyricist: 'Soul Master',
        mixing: 'Soul Master',
        mastering: 'Soul Master',
        producer: 'Soul Master',
        arranger: 'Soul Master',
        soundEngineer: 'Soul Master'
      },
      rights: {
        copyright: '© 2026 Soul Master',
        phonographicCopyright: '℗ 2026 Soul Master',
        publisher: 'Soul Records',
        isrc: 'US-XYZ-26-00002',
        upc: '888888888889'
      }
    },
    { 
      id: 3, 
      title: 'Summer Vibes', 
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      genre: 'Pop',
      description: 'Летний поп-хит с позитивной энергией',
      tags: ['pop', 'summer', 'happy'],
      year: '2026',
      label: 'Sunshine Music',
      authors: 'Sunny Band',
      plays: 3100, 
      likes: 420, 
      duration: '3:28', 
      status: 'pending',
      uploadedAt: '1 день назад',
      isPaid: false,
      releaseDate: '2026-06-15',
      credits: {
        musicComposer: 'Sunny Band',
        lyricist: 'Sunny Band',
        mixing: 'Sunny Band',
        mastering: 'Sunny Band',
        producer: 'Sunny Band',
        arranger: 'Sunny Band',
        soundEngineer: 'Sunny Band'
      },
      rights: {
        copyright: '© 2026 Sunny Band',
        phonographicCopyright: '℗ 2026 Sunny Band',
        publisher: 'Sunshine Music',
        isrc: 'US-XYZ-26-00003',
        upc: '888888888890'
      }
    },
    { 
      id: 4, 
      title: 'Neon Nights', 
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      genre: 'Electronic',
      description: 'Энергичный синтвейв трек',
      tags: ['synthwave', 'retro', 'electronic'],
      year: '2025',
      label: 'Neon Records',
      authors: 'Neon Artist',
      plays: 0, 
      likes: 0, 
      duration: '4:55', 
      status: 'draft',
      uploadedAt: '3 дня назад',
      isPaid: false,
      releaseDate: '2026-06-15',
      credits: {
        musicComposer: 'Neon Artist',
        lyricist: 'Neon Artist',
        mixing: 'Neon Artist',
        mastering: 'Neon Artist',
        producer: 'Neon Artist',
        arranger: 'Neon Artist',
        soundEngineer: 'Neon Artist'
      },
      rights: {
        copyright: '© 2026 Neon Artist',
        phonographicCopyright: '℗ 2026 Neon Artist',
        publisher: 'Neon Records',
        isrc: 'US-XYZ-26-00004',
        upc: '888888888891'
      }
    },
    { 
      id: 5, 
      title: 'Urban Jungle', 
      cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      genre: 'Hip-Hop',
      description: 'Урбанистический хип-хоп бит',
      tags: ['hiphop', 'urban', 'beats'],
      year: '2026',
      label: 'Street Beats',
      authors: 'Urban Poet',
      plays: 0, 
      likes: 0, 
      duration: '3:33', 
      status: 'rejected',
      rejectionReason: 'Низкое качество аудио. Пожалуйста, загрузите файл с битрейтом не менее 320kbps.',
      uploadedAt: '1 неделю назад',
      isPaid: false,
      releaseDate: '2026-06-15',
      credits: {
        musicComposer: 'Urban Poet',
        lyricist: 'Urban Poet',
        mixing: 'Urban Poet',
        mastering: 'Urban Poet',
        producer: 'Urban Poet',
        arranger: 'Urban Poet',
        soundEngineer: 'Urban Poet'
      },
      rights: {
        copyright: '© 2026 Urban Poet',
        phonographicCopyright: '℗ 2026 Urban Poet',
        publisher: 'Street Beats',
        isrc: 'US-XYZ-26-00005',
        upc: '888888888892'
      }
    },
  ];

  // Use DataContext tracks or demo tracks
  const tracks = userTracks.length > 0 ? userTracks : demoTracks;

  // Get subscription limits
  const { subscription } = useSubscription();
  const currentTrackCount = tracks.length;
  const canUploadMore = subscriptionHelpers.canUploadTrack(subscription, currentTrackCount);
  const trackLimit = subscription?.limits.tracks ?? 10;
  const isUnlimited = trackLimit === -1;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPitchingModal, setShowPitchingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<TrackStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle audio playback
  const handlePlayPause = (trackId: number) => {
    if (playingId === trackId) {
      // Pause current track
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Create new audio element
      const track = tracks.find(t => t.id === trackId);
      if (track?.audioFile) {
        const audio = new Audio(track.audioFile);
        audioRef.current = audio;
        
        audio.play().catch(err => {
          console.error('Error playing audio:', err);
        });
        
        audio.onended = () => {
          setPlayingId(null);
        };
        
        setPlayingId(trackId);
      } else {
        // Demo: play a placeholder sound or show message
        console.log('No audio file available for this track');
        setPlayingId(trackId);
        // Auto-stop after 3 seconds for demo
        setTimeout(() => setPlayingId(null), 3000);
      }
    }
  };

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    genre: '',
    description: '',
    tags: '',
    year: new Date().getFullYear().toString(),
    label: '',
    authors: '',
    musicComposer: '',
    lyricist: '',
    arranger: '',
    performer: '',
    soundEngineer: '',
    masteringEngineer: '',
    producer: '',
    recordingStudio: '',
    // Авторские и смежные права
    copyrightHolder: '',
    publishingRights: '',
    masterRightsHolder: '',
    neighboringRights: '',
    isrc: '',
    upc: '',
    licenseType: 'all-rights-reserved',
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Фильтрация треков
  const filteredTracks = tracks.filter(track => {
    const matchesStatus = filterStatus === 'all' || track.status === filterStatus;
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Статистика
  const stats = {
    total: tracks.length,
    approved: tracks.filter(t => t.status === 'approved').length,
    pending: tracks.filter(t => t.status === 'pending').length,
    rejected: tracks.filter(t => t.status === 'rejected').length,
    draft: tracks.filter(t => t.status === 'draft').length,
    totalPlays: tracks.reduce((sum, t) => sum + (t.plays || 0), 0),
    totalLikes: tracks.reduce((sum, t) => sum + (t.likes || 0), 0),
  };

  // Обработка загрузки обложки
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Обработка загрузки аудио
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Пожалуйста, выберите аудио файл');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Размер аудио не должен превышать 50МБ');
      return;
    }

    setAudioFileName(file.name);
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!uploadForm.title.trim()) {
      errors.title = 'Введите название трека';
    }
    if (!uploadForm.genre) {
      errors.genre = 'Выберите жанр';
    }
    if (!uploadForm.authors.trim()) {
      errors.authors = 'Укажите авторов';
    }
    if (!coverPreview) {
      errors.cover = 'Загрузите обложку';
    }
    if (!audioFileName) {
      errors.audio = 'Загрузите аудио файл';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Загрузка трека
  const handleUploadTrack = async (isDraft: boolean = false) => {
    if (!validateForm() && !isDraft) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Симуляция загрузки
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    const newTrack: Track = {
      id: Date.now(),
      title: uploadForm.title,
      cover: coverPreview || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      genre: uploadForm.genre,
      description: uploadForm.description,
      tags: uploadForm.tags.split(',').map(t => t.trim()).filter(t => t),
      year: uploadForm.year,
      label: uploadForm.label,
      authors: uploadForm.authors,
      duration: '3:45', // В реальности определяется из аудио
      plays: 0,
      likes: 0,
      status: isDraft ? 'draft' : 'pending',
      uploadedAt: 'Только что',
      isPaid: false,
      releaseDate: '2026-06-15',
      credits: {
        musicComposer: uploadForm.authors,
        lyricist: uploadForm.authors,
        mixing: uploadForm.authors,
        mastering: uploadForm.authors,
        producer: uploadForm.authors,
        arranger: uploadForm.authors,
        soundEngineer: uploadForm.authors
      },
      rights: {
        copyright: `© 2026 ${uploadForm.authors}`,
        phonographicCopyright: `℗ 2026 ${uploadForm.authors}`,
        publisher: uploadForm.label,
        isrc: 'US-XYZ-26-00006',
        upc: '888888888893'
      }
    };

    // ==================== USE DATA CONTEXT ====================
    // Добавляем трек в глобальное хранилище
    addTrack({
      title: newTrack.title,
      artist: userName,
      cover: newTrack.cover,
      genre: newTrack.genre,
      duration: newTrack.duration,
      uploadDate: new Date().toISOString(),
      status: isDraft ? 'draft' : 'pending',
      plays: 0,
      likes: 0,
      userId: userId,
    });

    setIsUploading(false);
    setShowUploadModal(false);
    
    // Сброс формы
    setUploadForm({
      title: '',
      genre: '',
      description: '',
      tags: '',
      year: new Date().getFullYear().toString(),
      label: '',
      authors: '',
      musicComposer: '',
      lyricist: '',
      arranger: '',
      performer: '',
      soundEngineer: '',
      masteringEngineer: '',
      producer: '',
      recordingStudio: '',
      copyrightHolder: '',
      publishingRights: '',
      masterRightsHolder: '',
      neighboringRights: '',
      isrc: '',
      upc: '',
      licenseType: 'all-rights-reserved',
    });
    setCoverPreview(null);
    setAudioFileName(null);
    setUploadProgress(0);
    setValidationErrors({});
  };

  // Оплата продвижения
  const handlePayPromotion = (track: Track) => {
    setSelectedTrack(track);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedTrack) return;

    const cost = 1000; // Стоимость продвижения в коинах
    
    if (userCoins < cost) {
      alert('Недостаточно коинов!');
      return;
    }

    onCoinsUpdate(userCoins - cost);
    
    setTracks(tracks.map(t => 
      t.id === selectedTrack.id 
        ? { ...t, isPaid: true }
        : t
    ));

    setShowPaymentModal(false);
    setSelectedTrack(null);
  };

  // Удаление трека
  const handleDeleteTrack = (trackId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот трек?')) {
      setTracks(tracks.filter(t => t.id !== trackId));
    }
  };

  // Получение статуса и его стилей
  const getStatusConfig = (status: TrackStatus) => {
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
          label: 'Одобрен',
          icon: Check,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-400/30',
        };
      case 'rejected':
        return {
          label: 'Отклонен',
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-400/30',
        };
    }
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">Мои треки</h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg">Управляйте своей музыкой</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div 
            onClick={() => onOpenCoinsModal?.()}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer flex-1 sm:flex-none"
          >
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-white font-semibold text-sm sm:text-base">{(userCoins || 0).toLocaleString()}</span>
            <span className="text-gray-400 text-xs sm:text-sm hidden xs:inline">коинов</span>
          </div>
          
          <motion.button
            whileHover={{ scale: canUploadMore ? 1.05 : 1 }}
            whileTap={{ scale: canUploadMore ? 0.95 : 1 }}
            onClick={() => {
              if (!canUploadMore) {
                alert(`Достигнут лимит треков (${trackLimit})! Улучшите подписку для загрузки большего количества треков.`);
                return;
              }
              setShowUploadModal(true);
            }}
            disabled={!canUploadMore}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl ${
              canUploadMore 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/15' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            } text-white font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation whitespace-nowrap`}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            {canUploadMore ? (
              <>
                <span className="hidden sm:inline">Загрузить трек</span>
                <span className="inline sm:hidden">Загрузить</span>
              </>
            ) : (
              <span>Лимит ({currentTrackCount}/{trackLimit})</span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
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
            {isUnlimited ? 'Треков (без лимита)' : `Треков (${currentTrackCount}/${trackLimit})`}
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
          <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Прослушивания</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalPlays || 0).toLocaleString()}</div>
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

      {/* Filters */}
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
            placeholder="Поиск по названию или жанру..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 touch-manipulation"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TrackStatus | 'all')}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 cursor-pointer touch-manipulation"
          >
            <option value="all">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
      </motion.div>

      {/* Tracks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 md:space-y-6"
      >
        {filteredTracks.length === 0 ? (
          <div className="p-12 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-4">
              {searchQuery ? 'Треки не найдены' : 'У вас пока нет треков'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm sm:text-base font-semibold transition-all duration-300"
              >
                Загрузить первый трек
              </motion.button>
            )}
          </div>
        ) : (
          filteredTracks.map((track, index) => {
            const statusConfig = getStatusConfig(track.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05, duration: 0.3, ease: "easeOut" }}
                className="group p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6">
                  {/* Cover & Play Button */}
                  <div className="relative flex-shrink-0 w-full sm:w-auto">
                    <motion.div 
                      animate={playingId === track.id ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={{ duration: 1, repeat: playingId === track.id ? Infinity : 0 }}
                      className={`w-full sm:w-20 md:w-24 aspect-square rounded-lg sm:rounded-xl overflow-hidden ring-2 ${
                        playingId === track.id ? 'ring-cyan-400/50 shadow-lg shadow-cyan-400/30' : 'ring-white/10'
                      } transition-all duration-300`}
                    >
                      <ImageWithFallback
                        src={track.cover}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    {track.status === 'approved' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause(track.id);
                        }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg sm:rounded-xl"
                      >
                        {playingId === track.id ? (
                          <Pause className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="white" />
                        ) : (
                          <Play className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="white" />
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 
                          onClick={() => track.status === 'approved' && onTrackClick?.(track.id)}
                          className={`text-lg sm:text-xl font-bold mb-1 truncate flex items-center gap-2 ${
                            playingId === track.id ? 'text-cyan-400' : 'text-white'
                          } ${track.status === 'approved' ? 'cursor-pointer hover:text-cyan-400 transition-colors' : ''}`}
                        >
                          {playingId === track.id && (
                            <motion.span
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="flex items-center gap-0.5"
                            >
                              <span className="w-0.5 h-3 bg-cyan-400 rounded-full"></span>
                              <span className="w-0.5 h-4 bg-cyan-400 rounded-full"></span>
                              <span className="w-0.5 h-3 bg-cyan-400 rounded-full"></span>
                            </motion.span>
                          )}
                          <span className="truncate">{track.title}</span>
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2 truncate">{track.authors} • {track.genre}</p>
                        <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}>
                          <StatusIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusConfig.color} flex-shrink-0`} />
                          <span className={`text-xs sm:text-sm font-semibold ${statusConfig.color} whitespace-nowrap`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                        {track.status === 'approved' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedTrack(track);
                              setShowPitchingModal(true);
                            }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-purple-500/15 whitespace-nowrap"
                          >
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Питчинг</span>
                          </motion.button>
                        )}
                        
                        {track.status === 'approved' && !track.isPaid && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePayPromotion(track)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-yellow-500/15 whitespace-nowrap"
                          >
                            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Продвижение</span>
                            <span className="sm:hidden">Промо</span>
                          </motion.button>
                        )}

                        {track.status === 'approved' && track.isPaid && (
                          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-green-500/20 border border-green-400/30 text-green-400 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Продвигается</span>
                            <span className="sm:hidden">Активно</span>
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTrack(track.id)}
                          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Description */}
                    {track.description && (
                      <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{track.description}</p>
                    )}

                    {/* Tags */}
                    {track.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        {track.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats & Meta */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm text-gray-400">
                      {track.status === 'approved' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{(track.plays || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{(track.likes || 0).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      <div className="whitespace-nowrap">{track.duration}</div>
                      <div className="whitespace-nowrap">{track.year}</div>
                      <div className="hidden sm:inline">•</div>
                      <div className="whitespace-nowrap truncate">{track.uploadedAt}</div>
                    </div>

                    {/* Rejection Reason */}
                    {track.status === 'rejected' && track.rejectionReason && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-400/30"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-red-400 text-xs sm:text-sm font-semibold mb-1">Причина отклонения:</div>
                            <div className="text-gray-300 text-xs sm:text-sm break-words">{track.rejectionReason}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 shadow-2xl overflow-hidden"
            >
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">Загрузить трек</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUploadModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                {/* Cover Upload */}
                <div>
                  <label className="block text-gray-300 text-sm mb-3 font-semibold">
                    Обложка трека *
                  </label>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className={`relative w-full h-48 rounded-xl border-2 border-dashed ${
                      validationErrors.cover ? 'border-red-400' : 'border-white/20'
                    } hover:border-cyan-400/50 transition-all duration-300 cursor-pointer overflow-hidden group`}
                  >
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div className="text-white text-center">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <div className="font-semibold">Изменить обложку</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-cyan-400 transition-colors">
                        <ImageIcon className="w-12 h-12 mb-3" />
                        <div className="font-semibold mb-1">Загрузите обложку</div>
                        <div className="text-sm">PNG, JPG до 5МБ</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  {validationErrors.cover && (
                    <div className="flex items-center gap-1 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.cover}
                    </div>
                  )}
                </div>

                {/* Audio Upload */}
                <div>
                  <label className="block text-gray-300 text-sm mb-3 font-semibold">
                    Аудио файл *
                  </label>
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className={`relative p-6 rounded-xl border-2 border-dashed ${
                      validationErrors.audio ? 'border-red-400' : 'border-white/20'
                    } hover:border-cyan-400/50 transition-all duration-300 cursor-pointer`}
                  >
                    {audioFileName ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">{audioFileName}</div>
                          <div className="text-gray-400 text-sm">Нажмите для замены</div>
                        </div>
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Music className="w-10 h-10 mx-auto mb-2" />
                        <div className="font-semibold mb-1">Загрузите аудио файл</div>
                        <div className="text-sm">MP3, WAV, FLAC до 50МБ</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  {validationErrors.audio && (
                    <div className="flex items-center gap-1 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.audio}
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      Название трека *
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        validationErrors.title ? 'border-red-400' : 'border-white/10'
                      } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300`}
                      placeholder="Название трека"
                    />
                    {validationErrors.title && (
                      <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.title}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      Жанр *
                    </label>
                    <select
                      value={uploadForm.genre}
                      onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        validationErrors.genre ? 'border-red-400' : 'border-white/10'
                      } text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 cursor-pointer`}
                    >
                      <option value="">Выберите жанр</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    {validationErrors.genre && (
                      <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.genre}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      Авторы *
                    </label>
                    <input
                      type="text"
                      value={uploadForm.authors}
                      onChange={(e) => setUploadForm({ ...uploadForm, authors: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        validationErrors.authors ? 'border-red-400' : 'border-white/10'
                      } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300`}
                      placeholder="Имена авторов"
                    />
                    {validationErrors.authors && (
                      <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.authors}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      Год выпуска
                    </label>
                    <input
                      type="text"
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                      placeholder="2026"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      Лейбл
                    </label>
                    <input
                      type="text"
                      value={uploadForm.label}
                      onChange={(e) => setUploadForm({ ...uploadForm, label: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                      placeholder="Название лейбла"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      Описание
                    </label>
                    <textarea
                      rows={3}
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 resize-none"
                      placeholder="Расскажите о треке..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      Теги (через запятую)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                      placeholder="electronic, ambient, chill"
                    />
                  </div>
                </div>

                {/* Создатели трека */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-bold text-lg mb-4">Создатели трека</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Композитор
                      </label>
                      <input
                        type="text"
                        value={uploadForm.musicComposer}
                        onChange={(e) => setUploadForm({ ...uploadForm, musicComposer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Имя композитора"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Текстовик
                      </label>
                      <input
                        type="text"
                        value={uploadForm.lyricist}
                        onChange={(e) => setUploadForm({ ...uploadForm, lyricist: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Имя текстовика"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Аранжировщик
                      </label>
                      <input
                        type="text"
                        value={uploadForm.arranger}
                        onChange={(e) => setUploadForm({ ...uploadForm, arranger: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Имя аранжировщика"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Исполнитель
                      </label>
                      <input
                        type="text"
                        value={uploadForm.performer}
                        onChange={(e) => setUploadForm({ ...uploadForm, performer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Имя исполнителя"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Звукорежиссер
                      </label>
                      <input
                        type="text"
                        value={uploadForm.soundEngineer}
                        onChange={(e) => setUploadForm({ ...uploadForm, soundEngineer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Имя звукорежиссера"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Мастеринг
                      </label>
                      <input
                        type="text"
                        value={uploadForm.masteringEngineer}
                        onChange={(e) => setUploadForm({ ...uploadForm, masteringEngineer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Имя инженера мастеринга"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Продюсер
                      </label>
                      <input
                        type="text"
                        value={uploadForm.producer}
                        onChange={(e) => setUploadForm({ ...uploadForm, producer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Имя продюсера"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Студия звукозаписи
                      </label>
                      <input
                        type="text"
                        value={uploadForm.recordingStudio}
                        onChange={(e) => setUploadForm({ ...uploadForm, recordingStudio: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Название студии"
                      />
                    </div>
                  </div>
                </div>

                {/* Авторские и смежные права */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-bold text-lg mb-4">Авторские и смежные права</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Правообладатель (Copyright ©)
                      </label>
                      <input
                        type="text"
                        value={uploadForm.copyrightHolder}
                        onChange={(e) => setUploadForm({ ...uploadForm, copyrightHolder: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="© 2026 Имя правообладателя"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Издательские права (Publishing)
                      </label>
                      <input
                        type="text"
                        value={uploadForm.publishingRights}
                        onChange={(e) => setUploadForm({ ...uploadForm, publishingRights: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Название издателя"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Владелец мастер-записи
                      </label>
                      <input
                        type="text"
                        value={uploadForm.masterRightsHolder}
                        onChange={(e) => setUploadForm({ ...uploadForm, masterRightsHolder: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Владелец мастер-записи"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Смежные права (℗)
                      </label>
                      <input
                        type="text"
                        value={uploadForm.neighboringRights}
                        onChange={(e) => setUploadForm({ ...uploadForm, neighboringRights: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="℗ 2026 Имя правообладателя"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        ISRC код
                      </label>
                      <input
                        type="text"
                        value={uploadForm.isrc}
                        onChange={(e) => setUploadForm({ ...uploadForm, isrc: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 font-mono"
                        placeholder="US-XXX-26-00001"
                      />
                      <p className="text-xs text-gray-400 mt-1">Международный стандартный код записи</p>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        UPC/EAN код
                      </label>
                      <input
                        type="text"
                        value={uploadForm.upc}
                        onChange={(e) => setUploadForm({ ...uploadForm, upc: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 font-mono"
                        placeholder="888888888888"
                      />
                      <p className="text-xs text-gray-400 mt-1">Универсальный код продукта</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm mb-2 font-semibold">
                        Тип лицензии
                      </label>
                      <select
                        value={uploadForm.licenseType}
                        onChange={(e) => setUploadForm({ ...uploadForm, licenseType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 cursor-pointer"
                      >
                        <option value="all-rights-reserved">Все права защищены (All Rights Reserved)</option>
                        <option value="cc-by">Creative Commons BY (Атрибуция)</option>
                        <option value="cc-by-sa">Creative Commons BY-SA (Атрибуция-СохранениеУсловий)</option>
                        <option value="cc-by-nd">Creative Commons BY-ND (Атрибуция-БезПроизводных)</option>
                        <option value="cc-by-nc">Creative Commons BY-NC (Атрибуция-Некоммерческая)</option>
                        <option value="cc-by-nc-sa">Creative Commons BY-NC-SA</option>
                        <option value="cc-by-nc-nd">Creative Commons BY-NC-ND</option>
                        <option value="public-domain">Общественное достояние (Public Domain)</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Определяет условия использования вашего трека</p>
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-400 font-semibold">Загрузка...</span>
                      <span className="text-white font-semibold">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      />
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex gap-3 p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUploadTrack(false)}
                disabled={isUploading}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Загрузка...
                  </span>
                ) : (
                  'Отправить на модерацию'
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUploadTrack(true)}
                disabled={isUploading}
                className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сохранить как черновик
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentModal && selectedTrack && (
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

              {/* Track Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={selectedTrack.cover}
                      alt={selectedTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{selectedTrack.title}</div>
                    <div className="text-gray-400 text-sm">{selectedTrack.authors}</div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-300">Стоимость продвижения:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold text-xl">1,000</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-300">Ваш баланс:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold text-xl">{(userCoins || 0).toLocaleString()}</span>
                  </div>
                </div>

                {userCoins < 1000 && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/30">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-red-400 text-sm">
                        Недостаточно коинов! Пополните баланс в разделе "Коины"
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
                  <div className="text-cyan-400 font-semibold mb-2">Что включено:</div>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>✓ Приоритет в поиске</li>
                    <li>✓ Рекомендации слушателям</li>
                    <li>✓ Увеличение охвата</li>
                    <li>✓ Статистика продвижения</li>
                  </ul>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmPayment}
                disabled={userCoins < 1000}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-yellow-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userCoins < 1000 ? 'Недостаточно коинов' : 'Подтвердить оплату'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PITCHING MODAL */}
      <AnimatePresence>
        {showPitchingModal && selectedTrack && (
          <TrackPitchingModal
            track={selectedTrack}
            isOpen={showPitchingModal}
            onClose={() => setShowPitchingModal(false)}
            userCoins={userCoins}
            onCoinsUpdate={onCoinsUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}