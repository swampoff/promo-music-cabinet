/**
 * TRACK MODERATION - Расширенная страница модерации треков
 * Максимальный адаптив + расширенный функционал
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music2, Play, Pause, CheckCircle, XCircle, Star, Eye, Clock, Filter, 
  Search, Download, MoreVertical, Volume2, X, AlertCircle, ThumbsUp, 
  ThumbsDown, MessageSquare, ChevronDown, ChevronUp, Calendar, User,
  TrendingUp, BarChart3, Grid, List, SlidersHorizontal, Headphones,
  CheckSquare, Square, Archive, Send, RotateCcw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import type { Track as DataTrack } from '@/contexts/DataContext';

interface Track {
  id: number;
  title: string;
  artist: string;
  artistAvatar: string;
  genre: string;
  duration: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  plays: number;
  cover: string;
  audioUrl?: string;
  bpm?: number;
  key?: string;
  moderationNote?: string;
  moderatorName?: string;
  moderatedAt?: string;
  userId: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'artist' | 'plays' | 'title';

export function TrackModeration() {
  // ==================== DATA CONTEXT ====================
  const { tracks: allTracks, getPendingTracks, updateTrack, addTransaction, addNotification } = useData();
  
  // ==================== STATE ====================
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==================== DEMO TRACKS ====================
  const demoTracks: Track[] = [
    {
      id: 1,
      title: 'Summer Vibes 2026',
      artist: 'Александр Иванов',
      artistAvatar: 'https://i.pravatar.cc/150?img=12',
      genre: 'Electronic',
      duration: '3:45',
      uploadDate: '2026-01-29T14:30:00',
      status: 'pending',
      plays: 0,
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      bpm: 128,
      key: 'A minor',
      userId: 'demo-user-123',
    },
    {
      id: 2,
      title: 'Midnight Dreams',
      artist: 'Мария Петрова',
      artistAvatar: 'https://i.pravatar.cc/150?img=5',
      genre: 'Ambient',
      duration: '4:12',
      uploadDate: '2026-01-29T10:15:00',
      status: 'pending',
      plays: 0,
      cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      bpm: 90,
      key: 'C major',
      userId: 'demo-user-124',
    },
    {
      id: 3,
      title: 'Urban Beats',
      artist: 'Дмитрий Соколов',
      artistAvatar: 'https://i.pravatar.cc/150?img=33',
      genre: 'Hip-Hop',
      duration: '3:20',
      uploadDate: '2026-01-28T16:45:00',
      status: 'approved',
      plays: 1247,
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      bpm: 95,
      key: 'G minor',
      moderatorName: 'Админ Петров',
      moderatedAt: '2026-01-28T18:00:00',
      userId: 'demo-user-125',
    },
    {
      id: 4,
      title: 'Rock Anthem',
      artist: 'Сергей Волков',
      artistAvatar: 'https://i.pravatar.cc/150?img=68',
      genre: 'Rock',
      duration: '4:55',
      uploadDate: '2026-01-28T09:20:00',
      status: 'rejected',
      plays: 0,
      cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400',
      moderationNote: 'Низкое качество звука, проблемы со сведением',
      moderatorName: 'Админ Сидоров',
      moderatedAt: '2026-01-28T12:30:00',
      bpm: 140,
      key: 'E major',
      userId: 'demo-user-126',
    },
    {
      id: 5,
      title: 'Jazz Fusion',
      artist: 'Анна Смирнова',
      artistAvatar: 'https://i.pravatar.cc/150?img=9',
      genre: 'Jazz',
      duration: '5:30',
      uploadDate: '2026-01-27T11:10:00',
      status: 'pending',
      plays: 0,
      cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      bpm: 120,
      key: 'D major',
      userId: 'demo-user-127',
    },
    {
      id: 6,
      title: 'Classical Symphony',
      artist: 'Петр Иванович',
      artistAvatar: 'https://i.pravatar.cc/150?img=14',
      genre: 'Classical',
      duration: '6:15',
      uploadDate: '2026-01-26T15:00:00',
      status: 'approved',
      plays: 3456,
      cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400',
      bpm: 80,
      key: 'F major',
      moderatorName: 'Админ Петров',
      moderatedAt: '2026-01-26T17:00:00',
      userId: 'demo-user-128',
    },
  ];

  // ==================== ПРЕОБРАЗОВАНИЕ ДАННЫХ ====================
  const tracks = useMemo(() => {
    return allTracks.length > 0 ? allTracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      artistAvatar: 'https://i.pravatar.cc/150?img=12',
      genre: t.genre,
      duration: t.duration,
      uploadDate: t.uploadDate,
      status: t.status,
      plays: t.plays,
      cover: t.cover,
      moderationNote: t.moderationNote,
      userId: t.userId,
    })) as Track[] : demoTracks;
  }, [allTracks]);

  // ==================== ФИЛЬТРАЦИЯ И СОРТИРОВКА ====================
  const uniqueGenres = useMemo(() => {
    const genres = [...new Set(tracks.map(t => t.genre))];
    return ['all', ...genres];
  }, [tracks]);

  const filteredAndSortedTracks = useMemo(() => {
    let result = tracks.filter(track => {
      const matchesFilter = filter === 'all' || track.status === filter;
      const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
      const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            track.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesGenre && matchesSearch;
    });

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
          break;
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'plays':
          comparison = b.plays - a.plays;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [tracks, filter, genreFilter, searchQuery, sortBy, sortOrder]);

  // ==================== СТАТИСТИКА ====================
  const stats = useMemo(() => ({
    total: tracks.length,
    pending: tracks.filter(t => t.status === 'pending').length,
    approved: tracks.filter(t => t.status === 'approved').length,
    rejected: tracks.filter(t => t.status === 'rejected').length,
    totalPlays: tracks.reduce((sum, t) => sum + t.plays, 0),
  }), [tracks]);

  // ==================== АУДИОПЛЕЕР ====================
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  // ==================== HANDLERS ====================
  const handleApprove = (trackId: number, note?: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) {
      console.error('Track not found:', trackId);
      toast.error('Трек не найден');
      return;
    }

    // Проверяем что трек из DataContext (не demo)
    const isRealTrack = allTracks.some(t => t.id === trackId);
    
    if (!isRealTrack) {
      console.warn('Demo track cannot be updated:', trackId);
      toast.error('Невозможно модерировать демо-трек', {
        description: 'Это демонстрационный трек для примера'
      });
      return;
    }

    try {
      updateTrack(trackId, { 
        status: 'approved' as any,
        moderationNote: note || 'Трек одобрен модератором',
      });

      // Списание за модерацию
      addTransaction({
        userId: track.userId,
        type: 'expense',
        amount: -5000,
        description: `Модерация трека: ${track.title}`,
        status: 'completed',
      });

      addNotification({
        userId: track.userId,
        type: 'track_approved',
        title: '✅ Трек одобрен!',
        message: `Ваш трек "${track.title}" успешно прошёл модерацию и опубликован.`,
        read: false,
      });

      toast.success('Трек одобрен!', {
        description: `"${track.title}" опубликован и доступен пользователям`,
      });

      setSelectedTrack(null);
      setModerationNote('');
      setSelectedTracks(prev => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
    } catch (error) {
      console.error('Error approving track:', error);
      toast.error('Ошибка при одобрении трека', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleReject = (trackId: number, note: string) => {
    if (!note.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    const track = tracks.find(t => t.id === trackId);
    if (!track) {
      toast.error('Трек не найден');
      return;
    }

    // Проверяем что трек из DataContext (не demo)
    const isRealTrack = allTracks.some(t => t.id === trackId);
    
    if (!isRealTrack) {
      console.warn('Demo track cannot be updated:', trackId);
      toast.error('Невозможно модерировать демо-трек', {
        description: 'Это демонстрационный трек для примера'
      });
      return;
    }

    try {
      updateTrack(trackId, {
        status: 'rejected' as any,
        moderationNote: note,
      });

      addNotification({
        userId: track.userId,
        type: 'track_rejected',
        title: '❌ Трек отклонён',
        message: `Ваш трек "${track.title}" был отклонён. Причина: ${note}`,
        read: false,
      });

      toast.error('Трек отклонён', {
        description: 'Артист получит уведомление с причиной отклонения',
      });

      setSelectedTrack(null);
      setModerationNote('');
      setSelectedTracks(prev => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
    } catch (error) {
      console.error('Error rejecting track:', error);
      toast.error('Ошибка при отклонении трека', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleBulkApprove = () => {
    const count = selectedTracks.size;
    selectedTracks.forEach(id => handleApprove(id, 'Массовое одобрение'));
    toast.success(`Одобрено треков: ${count}`);
    setSelectedTracks(new Set());
  };

  const handleBulkReject = () => {
    if (!moderationNote.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    const count = selectedTracks.size;
    selectedTracks.forEach(id => handleReject(id, moderationNote));
    toast.error(`Отклонено треков: ${count}`);
    setSelectedTracks(new Set());
    setModerationNote('');
  };

  const toggleTrackSelection = (trackId: number) => {
    setSelectedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTracks.size === filteredAndSortedTracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(filteredAndSortedTracks.map(t => t.id)));
    }
  };

  const togglePlay = (trackId: number, audioUrl?: string) => {
    if (playingId === trackId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current && audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingId(trackId);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return 'На модерации';
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-4 md:space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-6"
      >
        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Music2 className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Модерация треков</h1>
              <p className="text-sm md:text-base text-gray-400">Проверяйте и одобряйте новую музыку</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-xs text-gray-400">Ожидают</div>
              <div className="text-lg md:text-xl font-bold text-yellow-400">{stats.pending}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-xs text-gray-400">Одобрено</div>
              <div className="text-lg md:text-xl font-bold text-green-400">{stats.approved}</div>
            </div>
          </div>
        </div>

        {/* Info Banner - Показываем если нет реальных треков */}
        {allTracks.length === 0 && (
          <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Демонстрационные треки</h3>
              <p className="text-xs text-gray-300">
                Сейчас отображаются только демо-треки для примера UI. Чтобы протестировать функционал модерации, 
                перейдите в <strong>Кабинет артиста → Мои треки</strong> и загрузите реальный трек.
              </p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию или артисту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white text-sm md:text-base placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Фильтры</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* View Toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType as any)}
                      className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                        filter === filterType
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {filterType === 'all' && 'Все'}
                      {filterType === 'pending' && `На модерации (${stats.pending})`}
                      {filterType === 'approved' && `Одобрено (${stats.approved})`}
                      {filterType === 'rejected' && `Отклонено (${stats.rejected})`}
                    </button>
                  ))}
                </div>

                {/* Genre & Sort */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">Все жанры</option>
                    {uniqueGenres.filter(g => g !== 'all').map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="date">По дате</option>
                    <option value="artist">По артисту</option>
                    <option value="plays">По прослушиваниям</option>
                    <option value="title">По названию</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Убывание' : 'Возрастание'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedTracks.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              <span className="text-white font-medium">
                Выбрано: <strong>{selectedTracks.size}</strong> {selectedTracks.size === 1 ? 'трек' : 'треков'}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleBulkApprove}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <CheckCircle className="w-4 h-4" />
                Одобрить все
              </button>
              <button
                onClick={handleBulkReject}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <XCircle className="w-4 h-4" />
                Отклонить все
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ==================== TRACKS LIST ==================== */}
      {filteredAndSortedTracks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <Music2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Треков не найдено</h3>
          <p className="text-gray-400">Попробуйте изменить фильтры или параметры поиска</p>
        </motion.div>
      ) : viewMode === 'list' ? (
        // ==================== LIST VIEW ====================
        <div className="space-y-3 md:space-y-4">
          {filteredAndSortedTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Checkbox & Cover */}
                  <div className="flex items-start gap-3 md:gap-4">
                    <button
                      onClick={() => toggleTrackSelection(track.id)}
                      className="mt-2 flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded border-2 border-white/20 flex items-center justify-center hover:border-purple-500/50 transition-all"
                    >
                      {selectedTracks.has(track.id) && (
                        <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                      )}
                    </button>

                    <div className="relative group flex-shrink-0">
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
                      />
                      {track.audioUrl && (
                        <button
                          onClick={() => togglePlay(track.id, track.audioUrl)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          {playingId === track.id ? (
                            <Pause className="w-6 h-6 md:w-8 md:h-8 text-white" />
                          ) : (
                            <Play className="w-6 h-6 md:w-8 md:h-8 text-white" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-white truncate mb-1">
                        {track.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 md:w-4 md:h-4" />
                          {track.artist}
                        </span>
                        <span>•</span>
                        <span>{track.genre}</span>
                        <span>•</span>
                        <span>{track.duration}</span>
                      </div>

                      {/* Technical Info */}
                      {(track.bpm || track.key) && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {track.bpm && (
                            <span className="px-2 py-0.5 rounded bg-white/5 text-xs text-gray-400">
                              {track.bpm} BPM
                            </span>
                          )}
                          {track.key && (
                            <span className="px-2 py-0.5 rounded bg-white/5 text-xs text-gray-400">
                              {track.key}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Status & Date */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg border text-xs md:text-sm font-medium ${getStatusColor(track.status)}`}>
                          {getStatusText(track.status)}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          {formatDate(track.uploadDate)}
                        </span>
                        {track.plays > 0 && (
                          <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                            <Headphones className="w-3 h-3 md:w-4 md:h-4" />
                            {track.plays.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Moderation Note */}
                      {track.moderationNote && (
                        <div className="mt-2 p-2 rounded bg-white/5 border border-white/10">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs md:text-sm text-gray-300">{track.moderationNote}</p>
                          </div>
                          {track.moderatorName && (
                            <p className="text-xs text-gray-500 mt-1">
                              — {track.moderatorName} • {formatDate(track.moderatedAt || '')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {track.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2 mt-2 lg:mt-0">
                      <button
                        onClick={() => handleApprove(track.id)}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Одобрить</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrack(track);
                          setModerationNote('');
                        }}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Отклонить</span>
                      </button>
                      <button
                        onClick={() => setSelectedTrack(track)}
                        className="lg:hidden px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Now Playing Indicator */}
              {playingId === track.id && (
                <div className="px-4 pb-4 md:px-6 md:pb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlay(track.id, track.audioUrl)}
                      className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    <Volume2 className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        // ==================== GRID VIEW ====================
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredAndSortedTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all group"
            >
              {/* Cover */}
              <div className="relative aspect-square">
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {track.audioUrl && (
                      <button
                        onClick={() => togglePlay(track.id, track.audioUrl)}
                        className="p-4 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                      >
                        {playingId === track.id ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Checkbox */}
                <button
                  onClick={() => toggleTrackSelection(track.id)}
                  className="absolute top-3 left-3 w-6 h-6 rounded border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-purple-500/50 transition-all z-10"
                >
                  {selectedTracks.has(track.id) && (
                    <CheckSquare className="w-5 h-5 text-purple-400" />
                  )}
                </button>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getStatusColor(track.status)}`}>
                    {getStatusText(track.status)}
                  </span>
                </div>

                {/* Play Progress */}
                {playingId === track.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-base font-bold text-white truncate mb-1">
                  {track.title}
                </h3>
                <p className="text-sm text-gray-400 truncate mb-2">{track.artist}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{track.genre}</span>
                  <span>•</span>
                  <span>{track.duration}</span>
                </div>

                {/* Actions */}
                {track.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(track.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Одобрить</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTrack(track);
                        setModerationNote('');
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Отклонить</span>
                    </button>
                  </div>
                )}

                {track.moderationNote && (
                  <div className="mt-2 p-2 rounded bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 line-clamp-2">{track.moderationNote}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ==================== REJECTION MODAL ==================== */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedTrack(null);
              setModerationNote('');
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Модерация трека</h2>
                  <p className="text-gray-400">"{selectedTrack.title}" — {selectedTrack.artist}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTrack(null);
                    setModerationNote('');
                  }}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover & Info */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <img
                  src={selectedTrack.cover}
                  alt={selectedTrack.title}
                  className="w-full sm:w-48 h-48 object-cover rounded-xl"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Жанр</div>
                    <div className="text-white font-medium">{selectedTrack.genre}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Длительность</div>
                    <div className="text-white font-medium">{selectedTrack.duration}</div>
                  </div>
                  {selectedTrack.bpm && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Темп</div>
                      <div className="text-white font-medium">{selectedTrack.bpm} BPM</div>
                    </div>
                  )}
                  {selectedTrack.key && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Тональность</div>
                      <div className="text-white font-medium">{selectedTrack.key}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Дата загрузки</div>
                    <div className="text-white font-medium">{formatDate(selectedTrack.uploadDate)}</div>
                  </div>
                </div>
              </div>

              {/* Player */}
              {selectedTrack.audioUrl && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePlay(selectedTrack.id, selectedTrack.audioUrl)}
                      className="p-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      {playingId === selectedTrack.id ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium mb-2">
                        {playingId === selectedTrack.id ? 'Воспроизведение...' : 'Прослушать трек'}
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: playingId === selectedTrack.id ? `${(currentTime / duration) * 100}%` : '0%' }}
                        />
                      </div>
                      {playingId === selectedTrack.id && (
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Moderation Note Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Комментарий модератора
                </label>
                <textarea
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Укажите причину отклонения или оставьте комментарий..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              {/* Quick Rejection Reasons */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-400 mb-3">Быстрые причины отклонения:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Низкое качество звука',
                    'Проблемы со сведением',
                    'Нарушение авторских прав',
                    'Несоответствие жанру',
                    'Технические проблемы',
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setModerationNote(reason)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleApprove(selectedTrack.id, moderationNote || undefined)}
                  className="flex-1 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Одобрить трек
                </button>
                <button
                  onClick={() => handleReject(selectedTrack.id, moderationNote)}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Отклонить трек
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}