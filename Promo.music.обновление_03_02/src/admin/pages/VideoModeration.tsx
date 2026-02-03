/**
 * VIDEO MODERATION - Расширенная страница модерации видео
 * Максимальный адаптив + полный функционал + логика
 */

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Play, CheckCircle, XCircle, Eye, Clock, Filter, Search, 
  ThumbsUp, ThumbsDown, AlertCircle, X, ExternalLink, ChevronDown, 
  ChevronUp, Calendar, User, TrendingUp, Grid, List, SlidersHorizontal,
  CheckSquare, DollarSign, Tag, FileText, Users, Pause, Volume2,
  Share2, Heart, MessageSquare, MoreVertical, Download, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useData, type Video as VideoType } from '@/contexts/DataContext';

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'artist' | 'views' | 'title';

export function VideoModeration() {
  const { 
    videos: allVideos, 
    getPendingVideos, 
    updateVideo, 
    addTransaction, 
    addNotification 
  } = useData();
  
  // ==================== STATE ====================
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // ==================== DEMO DATA ====================
  const demoVideos: VideoType[] = [
    {
      id: 1,
      title: 'Summer Vibes - Official Music Video',
      artist: 'Александр Иванов',
      artistAvatar: 'https://i.pravatar.cc/150?img=12',
      genre: 'Electronic',
      duration: '3:45',
      uploadDate: '2026-01-29T14:30:00',
      status: 'pending',
      views: 0,
      likes: 0,
      thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoSource: 'link',
      category: 'Music Video',
      description: 'Официальный музыкальный видеоклип на трек Summer Vibes',
      tags: ['electronic', 'summer', 'vibes'],
      releaseDate: '2026-01-29',
      isPaid: true,
      price: 10000,
      paymentStatus: 'paid',
      userId: 'user_123',
      userRole: 'artist',
      subscriptionPlan: 'artist_pro',
      creators: {
        director: 'Александр Иванов',
        cinematographer: 'Иван Петров',
        editor: 'Мария Сидорова',
      },
    },
    {
      id: 2,
      title: 'Midnight Dreams - Lyric Video',
      artist: 'Мария Петрова',
      artistAvatar: 'https://i.pravatar.cc/150?img=5',
      genre: 'Ambient',
      duration: '4:12',
      uploadDate: '2026-01-29T10:15:00',
      status: 'pending',
      views: 0,
      likes: 0,
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoSource: 'link',
      category: 'Lyric Video',
      description: 'Лирическое видео с текстом песни Midnight Dreams',
      tags: ['ambient', 'midnight', 'dreams', 'lyrics'],
      releaseDate: '2026-01-29',
      isPaid: false,
      price: 0,
      paymentStatus: 'paid',
      userId: 'user_456',
      userRole: 'artist',
      subscriptionPlan: 'artist_start',
      creators: {
        director: 'Мария Петрова',
      },
    },
    {
      id: 3,
      title: 'Urban Beats - Behind the Scenes',
      artist: 'Дмитрий Соколов',
      artistAvatar: 'https://i.pravatar.cc/150?img=33',
      genre: 'Hip-Hop',
      duration: '5:30',
      uploadDate: '2026-01-28T16:45:00',
      status: 'approved',
      views: 3542,
      likes: 248,
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoSource: 'link',
      category: 'Behind the Scenes',
      description: 'Закулисная съемка создания трека Urban Beats',
      tags: ['hip-hop', 'urban', 'beats', 'bts'],
      releaseDate: '2026-01-28',
      isPaid: true,
      price: 10000,
      paymentStatus: 'paid',
      userId: 'user_789',
      userRole: 'label',
      creators: {
        director: 'Дмитрий Соколов',
        producer: 'Андрей Морозов',
      },
    },
    {
      id: 4,
      title: 'Rock Anthem - Live Performance',
      artist: 'Сергей Волков',
      artistAvatar: 'https://i.pravatar.cc/150?img=68',
      genre: 'Rock',
      duration: '6:15',
      uploadDate: '2026-01-27T09:20:00',
      status: 'rejected',
      views: 0,
      likes: 0,
      thumbnail: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800',
      moderationNote: 'Низкое качество видео, проблемы со звуком',
      rejectionReason: 'Низкое качество видео, проблемы со звуком',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoSource: 'link',
      category: 'Live Performance',
      description: 'Живое выступление на рок-фестивале',
      tags: ['rock', 'anthem', 'live'],
      releaseDate: '2026-01-27',
      isPaid: false,
      price: 0,
      paymentStatus: 'paid',
      userId: 'user_101',
      userRole: 'artist',
      subscriptionPlan: 'artist_elite',
      creators: {
        director: 'Сергей Волков',
      },
    },
    {
      id: 5,
      title: 'Jazz Evening - Studio Session',
      artist: 'Анна Смирнова',
      artistAvatar: 'https://i.pravatar.cc/150?img=9',
      genre: 'Jazz',
      duration: '7:20',
      uploadDate: '2026-01-26T11:10:00',
      status: 'pending',
      views: 0,
      likes: 0,
      thumbnail: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoSource: 'link',
      category: 'Studio Session',
      description: 'Запись джазовой композиции в студии',
      tags: ['jazz', 'evening', 'studio'],
      releaseDate: '2026-01-26',
      isPaid: true,
      price: 10000,
      paymentStatus: 'paid',
      userId: 'user_202',
      userRole: 'artist',
      subscriptionPlan: 'artist_pro',
      creators: {
        director: 'Анна Смирнова',
        cinematographer: 'Олег Зайцев',
        editor: 'Елена Ковалева',
      },
    },
    {
      id: 6,
      title: 'Classical Symphony - Concert Recording',
      artist: 'Оркестр "Гармония"',
      artistAvatar: 'https://i.pravatar.cc/150?img=14',
      genre: 'Classical',
      duration: '12:45',
      uploadDate: '2026-01-25T15:00:00',
      status: 'approved',
      views: 5678,
      likes: 432,
      thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoSource: 'link',
      category: 'Concert Recording',
      description: 'Запись концертного исполнения классической симфонии',
      tags: ['classical', 'symphony', 'concert', 'orchestra'],
      releaseDate: '2026-01-25',
      isPaid: true,
      price: 10000,
      paymentStatus: 'paid',
      userId: 'user_303',
      userRole: 'label',
      creators: {
        director: 'Петр Иванович',
        producer: 'Михаил Степанов',
      },
    },
  ];

  // ==================== COMPUTED ====================
  const videos: VideoType[] = useMemo(() => {
    return allVideos.length > 0 ? allVideos as VideoType[] : demoVideos;
  }, [allVideos]);

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(videos.map(v => v.category))];
    return ['all', ...categories];
  }, [videos]);

  const filteredAndSortedVideos = useMemo(() => {
    let result = videos.filter(video => {
      const matchesFilter = filter === 'all' || video.status === filter;
      const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            video.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesCategory && matchesSearch;
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
        case 'views':
          comparison = b.views - a.views;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [videos, filter, categoryFilter, searchQuery, sortBy, sortOrder]);

  // ==================== STATS ====================
  const stats = useMemo(() => ({
    total: videos.length,
    pending: videos.filter(v => v.status === 'pending').length,
    approved: videos.filter(v => v.status === 'approved').length,
    rejected: videos.filter(v => v.status === 'rejected').length,
    totalViews: videos.reduce((sum, v) => sum + v.views, 0),
  }), [videos]);

  // ==================== HANDLERS ====================
  const handleApprove = (videoId: number, note?: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) {
      toast.error('Видео не найдено');
      return;
    }

    // Проверка на demo
    const isRealVideo = allVideos.some(v => v.id === videoId);
    if (!isRealVideo) {
      toast.error('Невозможно модерировать демо-видео', {
        description: 'Это демонстрационное видео для примера'
      });
      return;
    }

    try {
      updateVideo(videoId, { 
        status: 'approved' as any,
        moderationNote: note || 'Видео одобрено модератором',
      });

      // Списание за размещение
      if (video.isPaid) {
        addTransaction({
          userId: video.userId,
          type: 'expense',
          amount: -10000,
          description: `Размещение видео: ${video.title}`,
          status: 'completed',
        });
      }

      addNotification({
        userId: video.userId,
        type: 'video_approved',
        title: '✅ Видео одобрено!',
        message: `Ваше видео "${video.title}" успешно прошло модерацию и опубликовано.${video.isPaid ? ' Списано ₽10,000 за размещение.' : ''}`,
        read: false,
        relatedId: videoId,
        relatedType: 'video',
      });

      toast.success('Видео одобрено!', {
        description: video.isPaid 
          ? `Видео опубликовано. Списано ₽10,000` 
          : 'Видео опубликовано и доступно пользователям',
      });

      setSelectedVideo(null);
      setModerationNote('');
      setSelectedVideos(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    } catch (error) {
      console.error('Error approving video:', error);
      toast.error('Ошибка при одобрении видео', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleReject = (videoId: number, note: string) => {
    if (!note.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    const video = videos.find(v => v.id === videoId);
    if (!video) {
      toast.error('Видео не найдено');
      return;
    }

    const isRealVideo = allVideos.some(v => v.id === videoId);
    if (!isRealVideo) {
      toast.error('Невозможно модерировать демо-видео', {
        description: 'Это демонстрационное видео для примера'
      });
      return;
    }

    try {
      updateVideo(videoId, {
        status: 'rejected' as any,
        moderationNote: note,
        rejectionReason: note,
      });

      addNotification({
        userId: video.userId,
        type: 'video_rejected',
        title: '❌ Видео отклонено',
        message: `Ваше видео "${video.title}" не прошло модерацию. Причина: ${note}`,
        read: false,
        relatedId: videoId,
        relatedType: 'video',
      });

      toast.error('Видео отклонено', {
        description: 'Артист получит уведомление с причиной отклонения',
      });

      setSelectedVideo(null);
      setModerationNote('');
      setSelectedVideos(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    } catch (error) {
      console.error('Error rejecting video:', error);
      toast.error('Ошибка при отклонении видео', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleBulkApprove = () => {
    const count = selectedVideos.size;
    selectedVideos.forEach(id => handleApprove(id, 'Массовое одобрение'));
    toast.success(`Одобрено видео: ${count}`);
    setSelectedVideos(new Set());
  };

  const handleBulkReject = () => {
    if (!moderationNote.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    const count = selectedVideos.size;
    selectedVideos.forEach(id => handleReject(id, moderationNote));
    toast.error(`Отклонено видео: ${count}`);
    setSelectedVideos(new Set());
    setModerationNote('');
  };

  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
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
      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-6"
      >
        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30">
              <Video className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Модерация видео</h1>
              <p className="text-sm md:text-base text-gray-400">Проверяйте и одобряйте видеоконтент</p>
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

        {/* Info Banner */}
        {allVideos.length === 0 && (
          <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Демонстрационные видео</h3>
              <p className="text-xs text-gray-300">
                Сейчас отображаются только демо-видео для примера UI. Чтобы протестировать функционал модерации, 
                перейдите в <strong>Кабинет артиста → Мои видео</strong> и загрузите реальное видео.
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
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white text-sm md:text-base placeholder-gray-400 focus:outline-none focus:border-red-500/50 transition-all"
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
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
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
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
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

                {/* Category & Sort */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-red-500/50"
                  >
                    <option value="all">Все категории</option>
                    {uniqueCategories.filter(c => c !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-red-500/50"
                  >
                    <option value="date">По дате</option>
                    <option value="artist">По артисту</option>
                    <option value="views">По просмотрам</option>
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
        {selectedVideos.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              <span className="text-white font-medium">
                Выбрано: <strong>{selectedVideos.size}</strong> {selectedVideos.size === 1 ? 'видео' : 'видео'}
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

      {/* ==================== VIDEOS LIST ==================== */}
      {filteredAndSortedVideos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Видео не найдены</h3>
          <p className="text-gray-400">Попробуйте изменить фильтры или параметры поиска</p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        // ==================== GRID VIEW ====================
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAndSortedVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-red-500/30 transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Duration */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                  {video.duration}
                </div>

                {/* Play Button */}
                <button
                  onClick={() => setSelectedVideo(video)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 transition-all"
                >
                  <Play className="w-12 h-12 md:w-16 md:h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Checkbox */}
                <button
                  onClick={() => toggleVideoSelection(video.id)}
                  className="absolute top-2 left-2 w-6 h-6 rounded border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-red-500/50 transition-all z-10"
                >
                  {selectedVideos.has(video.id) && (
                    <CheckSquare className="w-5 h-5 text-red-400" />
                  )}
                </button>

                {/* Status Badge */}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getStatusColor(video.status)}`}>
                  {getStatusText(video.status)}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-base font-bold text-white mb-1 line-clamp-2">{video.title}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  {video.artistAvatar && (
                    <img
                      src={video.artistAvatar}
                      alt={video.artist}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-400 truncate">{video.artist}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {video.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {video.views}
                  </span>
                </div>

                {video.moderationNote && (
                  <div className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-300 line-clamp-2">{video.moderationNote}</p>
                  </div>
                )}

                {/* Actions */}
                {video.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(video.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Одобрить
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setModerationNote('');
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <XCircle className="w-3 h-3" />
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // ==================== LIST VIEW ====================
        <div className="space-y-3 md:space-y-4">
          {filteredAndSortedVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-red-500/30 transition-all"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Checkbox & Thumbnail */}
                  <div className="flex items-start gap-3 md:gap-4">
                    <button
                      onClick={() => toggleVideoSelection(video.id)}
                      className="mt-2 flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded border-2 border-white/20 flex items-center justify-center hover:border-red-500/50 transition-all"
                    >
                      {selectedVideos.has(video.id) && (
                        <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                      )}
                    </button>

                    <div className="relative group flex-shrink-0 w-40 md:w-48 lg:w-56">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 transition-all rounded-lg"
                      >
                        <Play className="w-10 h-10 md:w-12 md:h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-xs">
                        {video.duration}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">
                        {video.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 md:w-4 md:h-4" />
                          {video.artist}
                        </span>
                        <span>•</span>
                        <span>{video.category}</span>
                        <span>•</span>
                        <span>{video.genre}</span>
                      </div>

                      <p className="text-xs md:text-sm text-gray-500 mb-3 line-clamp-2">
                        {video.description}
                      </p>

                      {/* Status & Date */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-lg border text-xs md:text-sm font-medium ${getStatusColor(video.status)}`}>
                          {getStatusText(video.status)}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          {formatDate(video.uploadDate)}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          {video.views} просмотров
                        </span>
                        {video.isPaid && (
                          <span className="text-xs md:text-sm text-yellow-500 flex items-center gap-1">
                            <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                            ₽10,000
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {video.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-xs text-gray-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Moderation Note */}
                      {video.moderationNote && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs md:text-sm text-red-300">{video.moderationNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {video.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2 mt-2 lg:mt-0">
                      <button
                        onClick={() => handleApprove(video.id)}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Одобрить</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVideo(video);
                          setModerationNote('');
                        }}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Отклонить</span>
                      </button>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="lg:hidden px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ==================== MODERATION MODAL ==================== */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedVideo(null);
              setModerationNote('');
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Модерация видео</h2>
                  <p className="text-gray-400">"{selectedVideo.title}" — {selectedVideo.artist}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setModerationNote('');
                  }}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Preview */}
              <div className="mb-6 relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <a
                    href={selectedVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Открыть видео
                  </a>
                </div>
              </div>

              {/* Video Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Жанр</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedVideo.genre}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Категория</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedVideo.category}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Длительность</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedVideo.duration}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Просмотры</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedVideo.views}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Описание</h3>
                <p className="text-white text-sm">{selectedVideo.description}</p>
              </div>

              {/* Creators */}
              {selectedVideo.creators && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Создатели</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(selectedVideo.creators).map(([role, name]) => (
                      name && (
                        <div key={role} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 capitalize">{role}:</span>
                          <span className="text-white">{name}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderation Actions */}
              {selectedVideo.status === 'pending' && (
                <div className="space-y-4">
                  {/* Note Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Комментарий модератора
                    </label>
                    <textarea
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      placeholder="Укажите причину отклонения или оставьте комментарий..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 resize-none"
                    />
                  </div>

                  {/* Quick Rejection Reasons */}
                  <div>
                    <div className="text-sm font-medium text-gray-400 mb-3">Быстрые причины отклонения:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Низкое качество видео',
                        'Проблемы со звуком',
                        'Нарушение авторских прав',
                        'Несоответствие категории',
                        'Неприемлемый контент',
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

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApprove(selectedVideo.id, moderationNote || undefined)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Одобрить видео
                    </button>
                    <button
                      onClick={() => handleReject(selectedVideo.id, moderationNote)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Отклонить видео
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
