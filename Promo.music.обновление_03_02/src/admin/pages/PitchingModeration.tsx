/**
 * PITCHING MODERATION - Модерация питчинга треков в плейлисты
 * Adaptive: 320px → 4K
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListMusic, Grid3x3, CheckCircle, XCircle, Clock, Search, Filter,
  SlidersHorizontal, Music, TrendingUp, Users, ExternalLink, Eye,
  ChevronDown, Sparkles
} from 'lucide-react';
import { useData, type Pitching } from '@/contexts/DataContext';

type ViewMode = 'cards' | 'table';
type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';
type SortBy = 'date' | 'artist' | 'reach' | 'title' | 'price';

export function PitchingModeration() {
  // ==================== DATA CONTEXT ====================
  const { pitchings: allPitchings = [], getPendingPitchings, updatePitching, addTransaction, addNotification } = useData();

  // ==================== STATE ====================
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPitching, setSelectedPitching] = useState<Pitching | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ==================== FILTERING & SORTING ====================
  let filteredPitchings = allPitchings;

  // Filter by status
  if (filterStatus !== 'all') {
    filteredPitchings = filteredPitchings.filter(p => p.status === filterStatus);
  }

  // Filter by search
  if (searchQuery) {
    filteredPitchings = filteredPitchings.filter(p =>
      p.trackTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.playlistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  filteredPitchings = [...filteredPitchings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
      case 'artist':
        return a.artist.localeCompare(b.artist);
      case 'reach':
        return b.expectedReach - a.expectedReach;
      case 'title':
        return a.trackTitle.localeCompare(b.trackTitle);
      case 'price':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // ==================== STATS ====================
  const stats = {
    total: allPitchings.length,
    pending: allPitchings.filter(p => p.status === 'pending').length,
    approved: allPitchings.filter(p => p.status === 'approved').length,
    rejected: allPitchings.filter(p => p.status === 'rejected').length,
  };

  // ==================== HANDLERS ====================
  const handleApprove = (pitching: Pitching) => {
    updatePitching(pitching.id, {
      status: 'approved',
      moderationNote: 'Одобрено для размещения в плейлисте',
    });

    // Списание средств
    addTransaction({
      type: 'expense',
      amount: pitching.price,
      description: `Питчинг трека "${pitching.trackTitle}" в плейлист "${pitching.playlistName}"`,
      status: 'completed',
      userId: pitching.userId,
    });

    // Уведомление артисту
    addNotification({
      userId: pitching.userId,
      type: 'info',
      title: 'Питчинг одобрен!',
      message: `Ваш трек "${pitching.trackTitle}" одобрен для размещения в плейлисте "${pitching.playlistName}". Ожидаемый охват: ${pitching.expectedReach.toLocaleString()} слушателей.`,
      read: false,
    });

    setSelectedPitching(null);
  };

  const handleReject = (pitching: Pitching) => {
    if (!rejectionReason.trim()) {
      alert('Пожалуйста, укажите причину отклонения');
      return;
    }

    updatePitching(pitching.id, {
      status: 'rejected',
      rejectionReason: rejectionReason,
      moderationNote: `Отклонено: ${rejectionReason}`,
    });

    // Уведомление артисту
    addNotification({
      userId: pitching.userId,
      type: 'info',
      title: 'Питчинг отклонён',
      message: `Ваш трек "${pitching.trackTitle}" был отклонён. Причина: ${rejectionReason}`,
      read: false,
    });

    setSelectedPitching(null);
    setRejectionReason('');
  };

  // ==================== PLAYLIST TYPE BADGE ====================
  const getPlaylistTypeBadge = (type: string) => {
    const badges = {
      editorial: { label: 'Editorial', color: 'from-purple-500 to-pink-500' },
      curator: { label: 'Curator', color: 'from-blue-500 to-cyan-500' },
      algorithmic: { label: 'Algorithmic', color: 'from-green-500 to-emerald-500' },
    };
    return badges[type as keyof typeof badges] || badges.curator;
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-3 md:space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-gray-400 mb-1">Всего</div>
          <div className="text-xl md:text-3xl font-bold text-white">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-yellow-500/10 rounded-lg md:rounded-xl border border-yellow-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-yellow-400/70 mb-1">На модерации</div>
          <div className="text-xl md:text-3xl font-bold text-yellow-400">{stats.pending}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-green-500/10 rounded-lg md:rounded-xl border border-green-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-green-400/70 mb-1">Одобрено</div>
          <div className="text-xl md:text-3xl font-bold text-green-400">{stats.approved}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-red-500/10 rounded-lg md:rounded-xl border border-red-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-red-400/70 mb-1">Отклонено</div>
          <div className="text-xl md:text-3xl font-bold text-red-400">{stats.rejected}</div>
        </motion.div>
      </div>

      {/* TOOLBAR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4"
      >
        {/* Search & View Toggle */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по треку, артисту, плейлисту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 md:px-4 py-2 rounded-lg border transition-all text-sm font-medium flex items-center gap-1.5 md:gap-2 ${
                showFilters
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Фильтры</span>
            </button>

            <div className="hidden md:flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'cards'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Статус</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all">Все статусы</option>
                    <option value="pending">На модерации</option>
                    <option value="approved">Одобрено</option>
                    <option value="rejected">Отклонено</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Сортировка</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="date">Дата подачи</option>
                    <option value="artist">Артист (А-Я)</option>
                    <option value="reach">Ожидаемый охват</option>
                    <option value="title">Название трека</option>
                    <option value="price">Цена</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* PITCHINGS LIST */}
      {filteredPitchings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <ListMusic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Питчинги не найдены</h3>
          <p className="text-gray-400">Измените параметры фильтрации или поиска</p>
        </motion.div>
      ) : (
        <div className={`grid gap-3 md:gap-4 ${
          viewMode === 'cards'
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {filteredPitchings.map((pitching, index) => {
            const playlistBadge = getPlaylistTypeBadge(pitching.playlistType);
            
            return (
              <motion.div
                key={pitching.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4 hover:bg-white/10 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={pitching.trackCover}
                    alt={pitching.trackTitle}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-white mb-1 truncate">
                      {pitching.trackTitle}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 truncate">
                      {pitching.artist}
                    </p>
                    <div className={`inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${playlistBadge.color} text-white`}>
                      {playlistBadge.label}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    pitching.status === 'approved'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : pitching.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {pitching.status === 'approved' && 'Одобрен'}
                    {pitching.status === 'rejected' && 'Отклонён'}
                    {pitching.status === 'pending' && 'Ожидает'}
                  </div>
                </div>

                {/* Playlist Info */}
                <div className="space-y-2 mb-3 text-xs md:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Плейлист:</span>
                    <span className="text-white font-medium truncate ml-2">
                      {pitching.playlistName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Жанр:</span>
                    <span className="text-white">{pitching.genre}</span>
                  </div>
                  {pitching.mood && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Настроение:</span>
                      <span className="text-white">{pitching.mood}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-gray-400 mb-0.5">Охват</div>
                    <div className="font-bold text-white">
                      {pitching.expectedReach.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-gray-400 mb-0.5">Плейлисты</div>
                    <div className="font-bold text-white">{pitching.playlists}</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-gray-400 mb-0.5">Цена</div>
                    <div className="font-bold text-white">₽{pitching.price.toLocaleString()}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-400 mb-3 line-clamp-2">
                  {pitching.description}
                </p>

                {/* Links */}
                {(pitching.spotifyLink || pitching.appleMusicLink) && (
                  <div className="flex gap-2 mb-3">
                    {pitching.spotifyLink && (
                      <a
                        href={pitching.spotifyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-2 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium flex items-center justify-center gap-1 hover:bg-green-500/30 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Spotify
                      </a>
                    )}
                    {pitching.appleMusicLink && (
                      <a
                        href={pitching.appleMusicLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-2 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-medium flex items-center justify-center gap-1 hover:bg-pink-500/30 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Apple Music
                      </a>
                    )}
                  </div>
                )}

                {/* Actions (только для pending) */}
                {pitching.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(pitching)}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Одобрить
                    </button>
                    <button
                      onClick={() => setSelectedPitching(pitching)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Отклонить
                    </button>
                  </div>
                )}

                {/* Rejection Reason */}
                {pitching.status === 'rejected' && pitching.rejectionReason && (
                  <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">
                      <strong>Причина отклонения:</strong> {pitching.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Approval Stats */}
                {pitching.status === 'approved' && pitching.actualReach > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400">
                      <strong>Фактический охват:</strong> {pitching.actualReach.toLocaleString()} слушателей
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* REJECTION MODAL */}
      <AnimatePresence>
        {selectedPitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedPitching(null);
              setRejectionReason('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-xl bg-gray-900/95 rounded-2xl border border-white/10 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">Отклонить питчинг</h3>
              <p className="text-gray-400 mb-4">
                Трек: <strong className="text-white">{selectedPitching.trackTitle}</strong>
                <br />
                Артист: <strong className="text-white">{selectedPitching.artist}</strong>
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Укажите причину отклонения..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                rows={4}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleReject(selectedPitching)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
                >
                  Отклонить
                </button>
                <button
                  onClick={() => {
                    setSelectedPitching(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
