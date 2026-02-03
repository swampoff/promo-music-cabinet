/**
 * CONCERT MODERATION - Расширенная страница модерации концертов
 * Максимальный адаптив + полный функционал + логика
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, MapPin, CheckCircle, XCircle, Eye, Clock, Filter, Search, 
  ThumbsUp, ThumbsDown, AlertCircle, X, Users, Ticket, ChevronDown, 
  ChevronUp, User, TrendingUp, Grid, List, SlidersHorizontal,
  CheckSquare, DollarSign, Tag, FileText, MoreVertical, Info,
  ExternalLink, Share2, Heart, MessageSquare, Music
} from 'lucide-react';
import { toast } from 'sonner';
import { useData, type Concert as GlobalConcert } from '@/contexts/DataContext';

// Локальный интерфейс для UI (расширяет глобальный)
interface Concert extends GlobalConcert {
  artistAvatar?: string;
  interested?: number;
  poster?: string;
  uploadDate?: string;
  type?: string;
  banner?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'artist' | 'clicks' | 'title' | 'concertDate';

export function ConcertModeration() {
  const { 
    concerts: allConcerts, 
    getPendingConcerts, 
    updateConcert,
    addTransaction,
    addNotification
  } = useData();
  
  // ==================== STATE ====================
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('concertDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [selectedConcerts, setSelectedConcerts] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // ==================== DEMO DATA ====================
  const demoConcerts: Concert[] = [
    {
      id: 1,
      title: 'Summer Festival 2026',
      artist: 'Александр Иванов',
      artistAvatar: 'https://i.pravatar.cc/150?img=12',
      venue: 'Олимпийский',
      city: 'Москва',
      date: '2026-07-15',
      time: '20:00',
      type: 'Festival',
      description: 'Грандиозное летнее шоу с лучшими хитами! Более 3 часов живой музыки и незабываемых эмоций.',
      banner: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      ticketPriceFrom: '2500',
      ticketPriceTo: '8500',
      ticketLink: 'https://tickets.example.com',
      status: 'pending',
      rejectionReason: '',
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: true,
      createdAt: '2026-01-29T14:30:00',
      userId: 'user_123',
    },
    {
      id: 2,
      title: 'Acoustic Night',
      artist: 'Мария Петрова',
      artistAvatar: 'https://i.pravatar.cc/150?img=5',
      venue: 'Клуб "Аврора"',
      city: 'Санкт-Петербург',
      date: '2026-03-20',
      time: '19:30',
      type: 'Concert',
      description: 'Камерный концерт с акустическими версиями хитов. Уютная атмосфера и живое общение с артистом.',
      banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      ticketPriceFrom: '1200',
      ticketPriceTo: '3500',
      ticketLink: 'https://tickets.example.com',
      status: 'pending',
      rejectionReason: '',
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: false,
      createdAt: '2026-01-29T10:15:00',
      userId: 'user_456',
    },
    {
      id: 3,
      title: 'Urban Beat Tour',
      artist: 'Дмитрий Соколов',
      artistAvatar: 'https://i.pravatar.cc/150?img=33',
      venue: 'ВТБ Арена',
      city: 'Москва',
      date: '2026-05-10',
      time: '21:00',
      type: 'Tour',
      description: 'Большой тур по городам России. Новая программа с эксклюзивным шоу и спецэффектами.',
      banner: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
      ticketPriceFrom: '3500',
      ticketPriceTo: '12000',
      ticketLink: 'https://tickets.example.com',
      status: 'approved',
      rejectionReason: '',
      views: 1847,
      clicks: 342,
      ticketsSold: 127,
      isPaid: true,
      createdAt: '2026-01-28T16:45:00',
      moderationNote: 'Отличное мероприятие, одобрено',
      userId: 'user_789',
    },
    {
      id: 4,
      title: 'Rock Legends Tribute',
      artist: 'Сергей Волков',
      artistAvatar: 'https://i.pravatar.cc/150?img=68',
      venue: 'Дворец спорта',
      city: 'Казань',
      date: '2026-04-25',
      time: '19:00',
      type: 'Tribute',
      description: 'Tribute-концерт в честь легенд рока. Исполнение классических хитов в оригинальной аранжировке.',
      banner: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
      ticketPriceFrom: '1500',
      ticketPriceTo: '4500',
      ticketLink: 'https://tickets.example.com',
      status: 'rejected',
      rejectionReason: 'Несоответствующее изображение на постере, нарушение авторских прав',
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: false,
      createdAt: '2026-01-27T09:20:00',
      moderationNote: 'Несоответствующее изображение на постере, нарушение авторских прав',
      userId: 'user_101',
    },
    {
      id: 5,
      title: 'Jazz Evening',
      artist: 'Анна Смирнова',
      artistAvatar: 'https://i.pravatar.cc/150?img=9',
      venue: 'Филармония',
      city: 'Екатеринбург',
      date: '2026-06-12',
      time: '18:30',
      type: 'Concert',
      description: 'Вечер джазовой музыки с участием лучших музыкантов страны.',
      banner: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
      ticketPriceFrom: '2000',
      ticketPriceTo: '6000',
      ticketLink: 'https://tickets.example.com',
      status: 'pending',
      rejectionReason: '',
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: true,
      createdAt: '2026-01-26T11:10:00',
      userId: 'user_202',
    },
    {
      id: 6,
      title: 'Classical Symphony Night',
      artist: 'Оркестр "Гармония"',
      artistAvatar: 'https://i.pravatar.cc/150?img=14',
      venue: 'Большой зал консерватории',
      city: 'Москва',
      date: '2026-08-20',
      time: '19:00',
      type: 'Classical',
      description: 'Концерт классической музыки. Исполнение произведений великих композиторов.',
      banner: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800',
      ticketPriceFrom: '1800',
      ticketPriceTo: '7500',
      ticketLink: 'https://tickets.example.com',
      status: 'approved',
      rejectionReason: '',
      views: 892,
      clicks: 156,
      ticketsSold: 78,
      isPaid: true,
      createdAt: '2026-01-25T15:00:00',
      userId: 'user_303',
    },
  ];

  // ==================== COMPUTED ====================
  const concerts: Concert[] = useMemo(() => {
    return allConcerts.length > 0 ? allConcerts.map(c => ({
      ...c,
      artistAvatar: 'https://i.pravatar.cc/150?img=12',
      banner: c.banner,
    })) as Concert[] : demoConcerts;
  }, [allConcerts]);

  const uniqueCities = useMemo(() => {
    const cities = [...new Set(concerts.map(c => c.city))];
    return ['all', ...cities];
  }, [concerts]);

  const filteredAndSortedConcerts = useMemo(() => {
    let result = concerts.filter(concert => {
      const matchesFilter = filter === 'all' || concert.status === filter;
      const matchesCity = cityFilter === 'all' || concert.city === cityFilter;
      const matchesSearch = concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            concert.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            concert.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            concert.venue.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesCity && matchesSearch;
    });

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'clicks':
          comparison = b.clicks - a.clicks;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'concertDate':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [concerts, filter, cityFilter, searchQuery, sortBy, sortOrder]);

  // ==================== STATS ====================
  const stats = useMemo(() => ({
    total: concerts.length,
    pending: concerts.filter(c => c.status === 'pending').length,
    approved: concerts.filter(c => c.status === 'approved').length,
    rejected: concerts.filter(c => c.status === 'rejected').length,
    totalClicks: concerts.reduce((sum, c) => sum + c.clicks, 0),
  }), [concerts]);

  // ==================== HANDLERS ====================
  const handleApprove = (concertId: number, note?: string) => {
    const concert = concerts.find(c => c.id === concertId);
    if (!concert) {
      toast.error('Концерт не найден');
      return;
    }

    // Проверка на demo
    const isRealConcert = allConcerts.some(c => c.id === concertId);
    if (!isRealConcert) {
      toast.error('Невозможно модерировать демо-концерт', {
        description: 'Это демонстрационный концерт для примера'
      });
      return;
    }

    try {
      updateConcert(concertId, { 
        status: 'approved' as any,
        moderationNote: note || 'Концерт одобрен модератором',
      });

      // Списание за размещение (если платное)
      if (concert.isPaid) {
        addTransaction({
          userId: concert.userId,
          type: 'expense',
          amount: -5000,
          description: `Размещение концерта: ${concert.title}`,
          status: 'completed',
        });
      }

      addNotification({
        userId: concert.userId,
        type: 'concert_approved',
        title: '✅ Концерт одобрен!',
        message: `Ваш концерт "${concert.title}" успешно прошёл модерацию и опубликован.${concert.isPaid ? ' Списано ₽5,000 за размещение.' : ''}`,
        read: false,
        relatedId: concertId,
        relatedType: 'concert',
      });

      toast.success('Концерт одобрен!', {
        description: concert.isPaid 
          ? `Концерт опубликован. Списано ₽5,000` 
          : 'Концерт опубликован и доступен для бронирования',
      });

      setSelectedConcert(null);
      setModerationNote('');
      setSelectedConcerts(prev => {
        const next = new Set(prev);
        next.delete(concertId);
        return next;
      });
    } catch (error) {
      console.error('Error approving concert:', error);
      toast.error('Ошибка при одобрении концерта', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleReject = (concertId: number, note: string) => {
    if (!note.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    const concert = concerts.find(c => c.id === concertId);
    if (!concert) {
      toast.error('Концерт не найден');
      return;
    }

    const isRealConcert = allConcerts.some(c => c.id === concertId);
    if (!isRealConcert) {
      toast.error('Невозможно модерировать демо-концерт', {
        description: 'Это демонстрационный концерт для примера'
      });
      return;
    }

    try {
      updateConcert(concertId, {
        status: 'rejected' as any,
        moderationNote: note,
        rejectionReason: note,
      });

      addNotification({
        userId: concert.userId,
        type: 'concert_rejected',
        title: '❌ Концерт отклонён',
        message: `Ваш концерт "${concert.title}" не прошёл модерацию. Причина: ${note}`,
        read: false,
        relatedId: concertId,
        relatedType: 'concert',
      });

      toast.error('Концерт отклонён', {
        description: 'Артист получит уведомление с причиной отклонения',
      });

      setSelectedConcert(null);
      setModerationNote('');
      setSelectedConcerts(prev => {
        const next = new Set(prev);
        next.delete(concertId);
        return next;
      });
    } catch (error) {
      console.error('Error rejecting concert:', error);
      toast.error('Ошибка при отклонении концерта', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleBulkApprove = () => {
    const count = selectedConcerts.size;
    selectedConcerts.forEach(id => handleApprove(id, 'Массовое одобрение'));
    toast.success(`Одобрено концертов: ${count}`);
    setSelectedConcerts(new Set());
  };

  const handleBulkReject = () => {
    if (!moderationNote.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    const count = selectedConcerts.size;
    selectedConcerts.forEach(id => handleReject(id, moderationNote));
    toast.error(`Отклонено концертов: ${count}`);
    setSelectedConcerts(new Set());
    setModerationNote('');
  };

  const toggleConcertSelection = (concertId: number) => {
    setSelectedConcerts(prev => {
      const next = new Set(prev);
      if (next.has(concertId)) {
        next.delete(concertId);
      } else {
        next.add(concertId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatRelativeDate = (dateString: string) => {
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
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Модерация концертов</h1>
              <p className="text-sm md:text-base text-gray-400">Проверяйте и одобряйте события</p>
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
        {allConcerts.length === 0 && (
          <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Демонстрационные концерты</h3>
              <p className="text-xs text-gray-300">
                Сейчас отображаются только демо-концерты для примера UI. Чтобы протестировать функционал модерации, 
                перейдите в <strong>Кабинет артиста → Мои концерты</strong> и создайте реальное событие.
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
                placeholder="Поиск по названию, артисту, городу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white text-sm md:text-base placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-all"
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
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'}`}
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
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
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

                {/* City & Sort */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="all">Все города</option>
                    {uniqueCities.filter(c => c !== 'all').map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="concertDate">По дате концерта</option>
                    <option value="date">По дате загрузки</option>
                    <option value="artist">По артисту</option>
                    <option value="clicks">По переходам</option>
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
        {selectedConcerts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              <span className="text-white font-medium">
                Выбрано: <strong>{selectedConcerts.size}</strong> {selectedConcerts.size === 1 ? 'концерт' : 'концертов'}
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

      {/* ==================== CONCERTS LIST ==================== */}
      {filteredAndSortedConcerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Концерты не найдены</h3>
          <p className="text-gray-400">Попробуйте изменить фильтры или параметры поиска</p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        // ==================== GRID VIEW ====================
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAndSortedConcerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/30 transition-all group"
            >
              {/* Poster */}
              <div className="relative h-48">
                <img
                  src={concert.banner}
                  alt={concert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Checkbox */}
                <button
                  onClick={() => toggleConcertSelection(concert.id)}
                  className="absolute top-2 left-2 w-6 h-6 rounded border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-orange-500/50 transition-all z-10"
                >
                  {selectedConcerts.has(concert.id) && (
                    <CheckSquare className="w-5 h-5 text-orange-400" />
                  )}
                </button>

                {/* Status Badge */}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getStatusColor(concert.status)}`}>
                  {getStatusText(concert.status)}
                </span>

                {/* Artist */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <img
                    src={concert.artistAvatar}
                    alt={concert.artist}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-white font-semibold text-sm">{concert.artist}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{concert.title}</h3>
                
                <div className="space-y-1.5 mb-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{concert.venue}, {concert.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{formatDate(concert.date)} • {concert.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      от {concert.ticketPriceFrom}₽
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {concert.clicks} переходов
                    </span>
                  </div>
                </div>

                {concert.moderationNote && (
                  <div className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-300 line-clamp-2">{concert.moderationNote}</p>
                  </div>
                )}

                {/* Actions */}
                {concert.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(concert.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Одобрить
                    </button>
                    <button
                      onClick={() => {
                        setSelectedConcert(concert);
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
          {filteredAndSortedConcerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/30 transition-all"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Checkbox & Poster */}
                  <div className="flex items-start gap-3 md:gap-4">
                    <button
                      onClick={() => toggleConcertSelection(concert.id)}
                      className="mt-2 flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded border-2 border-white/20 flex items-center justify-center hover:border-orange-500/50 transition-all"
                    >
                      {selectedConcerts.has(concert.id) && (
                        <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                      )}
                    </button>

                    <div className="relative group flex-shrink-0 w-32 md:w-40 lg:w-48">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden">
                        <img
                          src={concert.banner}
                          alt={concert.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedConcert(concert)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 transition-all rounded-lg"
                      >
                        <Eye className="w-8 h-8 md:w-10 md:h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {/* Concert Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">
                        {concert.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 md:w-4 md:h-4" />
                          {concert.artist}
                        </span>
                        <span>•</span>
                        <span>{concert.type || 'Concert'}</span>
                      </div>

                      <p className="text-xs md:text-sm text-gray-500 mb-3 line-clamp-2">
                        {concert.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-1.5 mb-2 text-xs md:text-sm text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{concert.venue}, {concert.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{formatDate(concert.date)} • {concert.time}</span>
                        </div>
                      </div>

                      {/* Status & Stats */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg border text-xs md:text-sm font-medium ${getStatusColor(concert.status)}`}>
                          {getStatusText(concert.status)}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                          <Ticket className="w-3 h-3 md:w-4 md:h-4" />
                          {concert.ticketPriceFrom}₽ - {concert.ticketPriceTo}₽
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3 md:w-4 md:h-4" />
                          {concert.clicks} переходов
                        </span>
                        {concert.isPaid && (
                          <span className="text-xs md:text-sm text-yellow-500 flex items-center gap-1">
                            <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                            ₽5,000
                          </span>
                        )}
                      </div>

                      {/* Moderation Note */}
                      {concert.moderationNote && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs md:text-sm text-red-300">{concert.moderationNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {concert.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2 mt-2 lg:mt-0">
                      <button
                        onClick={() => handleApprove(concert.id)}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Одобрить</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConcert(concert);
                          setModerationNote('');
                        }}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Отклонить</span>
                      </button>
                      <button
                        onClick={() => setSelectedConcert(concert)}
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
        {selectedConcert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedConcert(null);
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
                  <h2 className="text-2xl font-bold text-white mb-2">Модерация концерта</h2>
                  <p className="text-gray-400">"{selectedConcert.title}" — {selectedConcert.artist}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedConcert(null);
                    setModerationNote('');
                  }}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Poster */}
              <div className="mb-6">
                <img
                  src={selectedConcert.banner}
                  alt={selectedConcert.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>

              {/* Description */}
              {selectedConcert.description && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Описание</h3>
                  <p className="text-white text-sm">{selectedConcert.description}</p>
                </div>
              )}

              {/* Concert Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Место</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedConcert.venue}</p>
                  <p className="text-gray-400 text-xs">{selectedConcert.city}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Дата и время</p>
                  <p className="text-white font-semibold text-sm md:text-base">{formatDate(selectedConcert.date)}</p>
                  <p className="text-gray-400 text-xs">{selectedConcert.time}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Билеты</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedConcert.ticketPriceFrom}₽ - {selectedConcert.ticketPriceTo}₽</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Переходов</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedConcert.clicks}</p>
                </div>
              </div>

              {/* Ticket Link */}
              {selectedConcert.ticketLink && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Ссылка на билеты</h3>
                  <a 
                    href={selectedConcert.ticketLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-2"
                  >
                    {selectedConcert.ticketLink}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Moderation Actions */}
              {selectedConcert.status === 'pending' && (
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 resize-none"
                    />
                  </div>

                  {/* Quick Rejection Reasons */}
                  <div>
                    <div className="text-sm font-medium text-gray-400 mb-3">Быстрые причины отклонения:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Некорректная информация о месте',
                        'Неверная дата проведения',
                        'Проблемы с постером',
                        'Нарушение авторских прав',
                        'Неполная информация',
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
                      onClick={() => handleApprove(selectedConcert.id, moderationNote || undefined)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Одобрить концерт
                    </button>
                    <button
                      onClick={() => handleReject(selectedConcert.id, moderationNote)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Отклонить концерт
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
