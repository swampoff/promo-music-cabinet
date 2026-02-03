/**
 * BANNER MODERATION - Модерация баннеров
 * Цена: ₽15,000 за размещение
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image, CheckCircle, XCircle, Clock, Filter, Search, Grid, List,
  Calendar, ExternalLink, Eye, MousePointer, CheckSquare, AlertCircle,
  MoreVertical, User, X, Maximize2
} from 'lucide-react';
import { useData, type Banner } from '@/contexts/DataContext';
import { toast } from 'sonner';

type ViewMode = 'cards' | 'list';
type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';
type SortBy = 'date' | 'artist' | 'impressions' | 'title';

export function BannerModeration() {
  // ==================== DATA CONTEXT ====================
  const { banners: allBanners = [], getPendingBanners, updateBanner, addTransaction, addNotification } = useData();

  // ==================== STATE ====================
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [selectedBanners, setSelectedBanners] = useState<Set<number>>(new Set());

  // ==================== FILTERING & SORTING ====================
  const filteredAndSortedBanners = useMemo(() => {
    let filtered = [...allBanners];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(banner => banner.status === filterStatus);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(banner =>
        banner.title.toLowerCase().includes(query) ||
        banner.artist.toLowerCase().includes(query) ||
        banner.type.toLowerCase().includes(query) ||
        banner.position.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'impressions':
          return (b.impressions || 0) - (a.impressions || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allBanners, filterStatus, searchQuery, sortBy]);

  // ==================== STATS ====================
  const stats = useMemo(() => ({
    total: allBanners.length,
    pending: allBanners.filter(b => b.status === 'pending').length,
    approved: allBanners.filter(b => b.status === 'approved').length,
    rejected: allBanners.filter(b => b.status === 'rejected').length,
  }), [allBanners]);

  // ==================== HANDLERS ====================
  const handleApprove = (bannerId: number, note?: string) => {
    const banner = allBanners.find(b => b.id === bannerId);
    if (!banner) return;

    updateBanner(bannerId, {
      status: 'approved',
      moderationNote: note,
    });

    // Списать стоимость с баланса артиста
    addTransaction({
      userId: banner.userId,
      type: 'expense',
      amount: banner.price || 15000,
      description: `Размещение баннера: ${banner.title}`,
      status: 'completed',
    });

    // Уведомление артисту
    addNotification({
      userId: banner.userId,
      type: 'info',
      title: '✅ Баннер одобрен',
      message: `Ваш баннер "${banner.title}" одобрен и опубликован. Списано: ₽${(banner.price || 15000).toLocaleString('ru-RU')}`,
      read: false,
      relatedId: bannerId,
      relatedType: 'news',
    });

    toast.success(`Баннер "${banner.title}" одобрен!`);
    setSelectedBanner(null);
    setModerationNote('');
    setSelectedBanners(new Set([...selectedBanners].filter(id => id !== bannerId)));
  };

  const handleReject = (bannerId: number, note: string) => {
    const banner = allBanners.find(b => b.id === bannerId);
    if (!banner) return;

    if (!note.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    updateBanner(bannerId, {
      status: 'rejected',
      moderationNote: note,
      rejectionReason: note,
    });

    // Уведомление артисту
    addNotification({
      userId: banner.userId,
      type: 'info',
      title: '❌ Баннер отклонён',
      message: `Ваш баннер "${banner.title}" отклонён. Причина: ${note}`,
      read: false,
      relatedId: bannerId,
      relatedType: 'news',
    });

    toast.error(`Баннер "${banner.title}" отклонён`);
    setSelectedBanner(null);
    setModerationNote('');
    setSelectedBanners(new Set([...selectedBanners].filter(id => id !== bannerId)));
  };

  const handleBulkApprove = () => {
    const count = selectedBanners.size;
    selectedBanners.forEach(bannerId => handleApprove(bannerId));
    toast.success(`Одобрено баннеров: ${count}`);
    setSelectedBanners(new Set());
  };

  const handleBulkReject = () => {
    if (!moderationNote.trim()) {
      toast.error('Укажите причину для массового отклонения');
      return;
    }
    const count = selectedBanners.size;
    selectedBanners.forEach(bannerId => handleReject(bannerId, moderationNote));
    toast.error(`Отклонено баннеров: ${count}`);
    setSelectedBanners(new Set());
    setModerationNote('');
  };

  const toggleBannerSelection = (bannerId: number) => {
    const newSet = new Set(selectedBanners);
    if (newSet.has(bannerId)) {
      newSet.delete(bannerId);
    } else {
      newSet.add(bannerId);
    }
    setSelectedBanners(newSet);
  };

  // ==================== HELPERS ====================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'approved': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'rejected': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На модерации';
      case 'approved': return 'Одобрено';
      case 'rejected': return 'Отклонено';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'header': return 'Шапка';
      case 'sidebar': return 'Боковая панель';
      case 'popup': return 'Всплывающее окно';
      case 'footer': return 'Подвал';
      default: return type;
    }
  };

  const getPositionText = (position: string) => {
    switch (position) {
      case 'home': return 'Главная';
      case 'catalog': return 'Каталог';
      case 'artist': return 'Артисты';
      case 'all': return 'Все страницы';
      default: return position;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'header': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'sidebar': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      case 'popup': return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'footer': return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* ==================== STATS CARDS ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: 'Всего', value: stats.total, icon: Image, color: 'blue' },
          { label: 'Ожидают', value: stats.pending, icon: Clock, color: 'yellow' },
          { label: 'Одобрено', value: stats.approved, icon: CheckCircle, color: 'green' },
          { label: 'Отклонено', value: stats.rejected, icon: XCircle, color: 'red' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`p-2 md:p-2.5 rounded-lg bg-${stat.color}-500/20 border border-${stat.color}-500/30`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 text-${stat.color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 truncate">{stat.label}</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ==================== CONTROLS ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4 space-y-3 md:space-y-4"
      >
        {/* Search & View Toggle */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по названию, артисту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all flex items-center gap-2 text-sm md:text-base ${
                viewMode === 'cards'
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Карточки</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all flex items-center gap-2 text-sm md:text-base ${
                viewMode === 'list'
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Список</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'Все' : getStatusText(status)}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/10 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="date">По дате</option>
            <option value="artist">По артисту</option>
            <option value="impressions">По просмотрам</option>
            <option value="title">По названию</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedBanners.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="text-white font-medium">
                Выбрано: <strong>{selectedBanners.size}</strong>
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

      {/* ==================== BANNER LIST ==================== */}
      {filteredAndSortedBanners.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Баннеры не найдены</h3>
          <p className="text-gray-400">Попробуйте изменить фильтры или параметры поиска</p>
        </motion.div>
      ) : viewMode === 'cards' ? (
        // ==================== CARDS VIEW ====================
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAndSortedBanners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all group"
            >
              {/* Banner Image */}
              <div className="relative aspect-[16/9]">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Checkbox */}
                <button
                  onClick={() => toggleBannerSelection(banner.id)}
                  className="absolute top-2 left-2 w-6 h-6 rounded border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-blue-500/50 transition-all z-10"
                >
                  {selectedBanners.has(banner.id) && (
                    <CheckSquare className="w-5 h-5 text-blue-400" />
                  )}
                </button>

                {/* Type Badge */}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getTypeColor(banner.type)}`}>
                  {getTypeText(banner.type)}
                </span>

                {/* Status */}
                <span className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getStatusColor(banner.status)}`}>
                  {getStatusText(banner.status)}
                </span>
              </div>

              {/* Content */}
              <div className="p-3 md:p-4">
                <h3 className="text-sm md:text-base font-bold text-white mb-1.5 md:mb-2 line-clamp-2 break-words">{banner.title}</h3>
                
                <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 min-w-0">
                  {banner.artistAvatar && (
                    <img
                      src={banner.artistAvatar}
                      alt={banner.artist}
                      className="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0"
                    />
                  )}
                  <span className="text-xs md:text-sm text-gray-400 truncate">{banner.artist}</span>
                </div>

                <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 mb-2 md:mb-3">
                  <span className="flex items-center gap-0.5 md:gap-1">
                    <Eye className="w-3 h-3" />
                    {banner.impressions}
                  </span>
                  <span className="flex items-center gap-0.5 md:gap-1">
                    <MousePointer className="w-3 h-3" />
                    {banner.clicks}
                  </span>
                  <span className="flex items-center gap-0.5 md:gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                  </span>
                </div>

                {banner.moderationNote && (
                  <div className="mb-2 md:mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-300 line-clamp-2 break-words">{banner.moderationNote}</p>
                  </div>
                )}

                {/* Actions */}
                {banner.status === 'pending' && (
                  <div className="flex gap-1.5 md:gap-2">
                    <button
                      onClick={() => handleApprove(banner.id)}
                      className="flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Одобрить</span>
                      <span className="sm:hidden">✓</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBanner(banner);
                        setModerationNote('');
                      }}
                      className="flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <XCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Отклонить</span>
                      <span className="sm:hidden">✕</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // ==================== LIST VIEW ====================
        <div className="space-y-2 md:space-y-4">
          {filteredAndSortedBanners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all"
            >
              <div className="p-3 md:p-6">
                <div className="flex flex-col gap-3 md:gap-4">
                  {/* Mobile: Checkbox + Type + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        onClick={() => toggleBannerSelection(banner.id)}
                        className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded border-2 border-white/20 flex items-center justify-center hover:border-blue-500/50 transition-all"
                      >
                        {selectedBanners.has(banner.id) && (
                          <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        )}
                      </button>

                      <span className={`px-2 py-0.5 md:py-1 rounded-lg border text-xs font-medium truncate ${getTypeColor(banner.type)}`}>
                        {getTypeText(banner.type)}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 md:py-1 rounded-lg border text-xs font-medium flex-shrink-0 ${getStatusColor(banner.status)}`}>
                      {getStatusText(banner.status)}
                    </span>
                  </div>

                  {/* Banner + Content */}
                  <div className="flex gap-2.5 md:gap-4">
                    {/* Banner Image */}
                    <div className="relative group flex-shrink-0 w-24 md:w-48">
                      <div className="aspect-[16/9] rounded-lg overflow-hidden">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedBanner(banner)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 transition-all rounded-lg"
                      >
                        <Maximize2 className="w-6 h-6 md:w-12 md:h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 line-clamp-2 break-words">
                        {banner.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs text-gray-400 mb-1.5 md:mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[100px] md:max-w-none">{banner.artist}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{getPositionText(banner.position)}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-0.5 md:gap-1">
                          <Eye className="w-3 h-3" />
                          {banner.impressions}
                        </span>
                        <span className="flex items-center gap-0.5 md:gap-1">
                          <MousePointer className="w-3 h-3" />
                          {banner.clicks}
                        </span>
                        <span className="flex items-center gap-0.5 md:gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                        </span>
                      </div>

                      {/* Moderation Note */}
                      {banner.moderationNote && (
                        <div className="mt-2 p-1.5 md:p-2 rounded bg-red-500/10 border border-red-500/20">
                          <div className="flex items-start gap-1.5 md:gap-2">
                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-300 line-clamp-2 break-words">{banner.moderationNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {banner.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(banner.id)}
                        className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1.5 text-xs md:text-base"
                      >
                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Одобрить</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBanner(banner);
                          setModerationNote('');
                        }}
                        className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5 text-xs md:text-base"
                      >
                        <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Отклонить</span>
                      </button>
                      <button
                        onClick={() => setSelectedBanner(banner)}
                        className="md:hidden px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
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
        {selectedBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedBanner(null);
              setModerationNote('');
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-4xl backdrop-blur-xl bg-white/10 rounded-t-2xl sm:rounded-2xl border border-white/20 p-4 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 md:mb-6 gap-2">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                    <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getTypeColor(selectedBanner.type)}`}>
                      {getTypeText(selectedBanner.type)}
                    </span>
                    <span className="px-2 py-1 rounded-lg border text-xs font-medium bg-gray-500/20 border-gray-500/30 text-gray-400">
                      {getPositionText(selectedBanner.position)}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-1.5 md:mb-2 break-words">{selectedBanner.title}</h2>
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    {selectedBanner.artistAvatar && (
                      <img
                        src={selectedBanner.artistAvatar}
                        alt={selectedBanner.artist}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 min-w-0">
                      <span className="text-sm md:text-base text-gray-400 truncate">{selectedBanner.artist}</span>
                      <span className="hidden sm:inline text-gray-600">•</span>
                      <span className="text-xs md:text-sm text-gray-400">₽{selectedBanner.price.toLocaleString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedBanner(null);
                    setModerationNote('');
                  }}
                  className="flex-shrink-0 p-1.5 md:p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Banner Image */}
              <div className="mb-4 md:mb-6">
                <img
                  src={selectedBanner.image}
                  alt={selectedBanner.title}
                  className="w-full h-auto object-contain rounded-lg md:rounded-xl bg-black/20"
                />
                {selectedBanner.link && (
                  <a
                    href={selectedBanner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Целевая ссылка
                  </a>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="p-2.5 md:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-0.5 md:mb-1">Показы</p>
                  <p className="text-sm md:text-base text-white font-semibold">{selectedBanner.impressions}</p>
                </div>
                <div className="p-2.5 md:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-0.5 md:mb-1">Клики</p>
                  <p className="text-sm md:text-base text-white font-semibold">{selectedBanner.clicks}</p>
                </div>
                <div className="p-2.5 md:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-0.5 md:mb-1">CTR</p>
                  <p className="text-sm md:text-base text-white font-semibold">
                    {selectedBanner.impressions > 0
                      ? ((selectedBanner.clicks / selectedBanner.impressions) * 100).toFixed(2)
                      : 0}%
                  </p>
                </div>
                <div className="p-2.5 md:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-0.5 md:mb-1">Период</p>
                  <p className="text-sm md:text-base text-white font-semibold truncate">
                    {formatDate(selectedBanner.startDate)} - {formatDate(selectedBanner.endDate)}
                  </p>
                </div>
              </div>

              {/* Moderation Actions */}
              {selectedBanner.status === 'pending' && (
                <div className="space-y-3 md:space-y-4">
                  {/* Note Input */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-400 mb-2">
                      Комментарий модератора
                    </label>
                    <textarea
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      placeholder="Укажите причину отклонения..."
                      rows={3}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  {/* Quick Rejection Reasons */}
                  <div>
                    <div className="text-xs md:text-sm font-medium text-gray-400 mb-2">Быстрые причины:</div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {[
                        'Низкое качество изображения',
                        'Нарушение авторских прав',
                        'Недопустимый контент',
                        'Неверные размеры',
                        'Некорректная ссылка',
                      ].map((reason) => (
                        <button
                          key={reason}
                          onClick={() => setModerationNote(reason)}
                          className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <button
                      onClick={() => handleApprove(selectedBanner.id, moderationNote || undefined)}
                      className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                      Одобрить баннер
                    </button>
                    <button
                      onClick={() => handleReject(selectedBanner.id, moderationNote)}
                      className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                      Отклонить баннер
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