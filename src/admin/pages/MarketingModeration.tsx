/**
 * MARKETING MODERATION - Модерация маркетинговых кампаний
 * Adaptive: 320px → 4K
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone, Grid3x3, CheckCircle, XCircle, Search, Filter,
  TrendingUp, Users, ExternalLink, Eye, Zap, Mail, Share2,
  Briefcase, PenTool, Target
} from 'lucide-react';
import { useData, type Marketing } from '@/contexts/DataContext';

type ViewMode = 'cards' | 'table';
type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
type SortBy = 'date' | 'artist' | 'reach' | 'budget' | 'name';

export function MarketingModeration() {
  // ==================== DATA CONTEXT ====================
  const { marketing: allMarketing = [], getPendingMarketing, updateMarketing, addTransaction, addNotification } = useData();

  // ==================== STATE ====================
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketing, setSelectedMarketing] = useState<Marketing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ==================== FILTERING & SORTING ====================
  let filteredMarketing = allMarketing;

  // Filter by status
  if (filterStatus !== 'all') {
    filteredMarketing = filteredMarketing.filter(m => m.status === filterStatus);
  }

  // Filter by search
  if (searchQuery) {
    filteredMarketing = filteredMarketing.filter(m =>
      m.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.campaignType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  filteredMarketing = [...filteredMarketing].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
      case 'artist':
        return a.artist.localeCompare(b.artist);
      case 'reach':
        return b.expectedReach - a.expectedReach;
      case 'budget':
        return b.budget - a.budget;
      case 'name':
        return a.campaignName.localeCompare(b.campaignName);
      default:
        return 0;
    }
  });

  // ==================== STATS ====================
  const stats = {
    total: allMarketing.length,
    pending: allMarketing.filter(m => m.status === 'pending').length,
    approved: allMarketing.filter(m => m.status === 'approved').length,
    active: allMarketing.filter(m => m.status === 'active').length,
    completed: allMarketing.filter(m => m.status === 'completed').length,
    rejected: allMarketing.filter(m => m.status === 'rejected').length,
  };

  // ==================== HANDLERS ====================
  const handleApprove = (marketing: Marketing) => {
    updateMarketing(marketing.id, {
      status: 'approved',
      moderationNote: 'Одобрено для запуска',
    });

    // Списание средств
    addTransaction({
      type: 'expense',
      amount: marketing.price,
      description: `Маркетинговая кампания "${marketing.campaignName}" на платформе ${marketing.platform}`,
      status: 'completed',
      userId: marketing.userId,
    });

    // Уведомление артисту
    addNotification({
      userId: marketing.userId,
      type: 'info',
      title: 'Кампания одобрена!',
      message: `Ваша маркетинговая кампания "${marketing.campaignName}" одобрена и запущена. Ожидаемый охват: ${marketing.expectedReach.toLocaleString()}.`,
      read: false,
    });

    setSelectedMarketing(null);
  };

  const handleReject = (marketing: Marketing) => {
    if (!rejectionReason.trim()) {
      alert('Пожалуйста, укажите причину отклонения');
      return;
    }

    updateMarketing(marketing.id, {
      status: 'rejected',
      rejectionReason: rejectionReason,
      moderationNote: `Отклонено: ${rejectionReason}`,
    });

    // Уведомление артисту
    addNotification({
      userId: marketing.userId,
      type: 'info',
      title: 'Кампания отклонена',
      message: `Ваша маркетинговая кампания "${marketing.campaignName}" была отклонена. Причина: ${rejectionReason}`,
      read: false,
    });

    setSelectedMarketing(null);
    setRejectionReason('');
  };

  // ==================== CAMPAIGN TYPE CONFIG ====================
  const campaignTypeConfig = {
    smm: { label: 'SMM', icon: Share2, color: 'from-blue-500 to-cyan-500' },
    email: { label: 'Email', icon: Mail, color: 'from-green-500 to-emerald-500' },
    influencer: { label: 'Influencer', icon: Users, color: 'from-purple-500 to-pink-500' },
    pr: { label: 'PR', icon: Briefcase, color: 'from-orange-500 to-red-500' },
    ads: { label: 'Реклама', icon: Target, color: 'from-yellow-500 to-orange-500' },
    content: { label: 'Контент', icon: PenTool, color: 'from-indigo-500 to-purple-500' },
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-3 md:space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-gray-400 mb-1">Всего</div>
          <div className="text-xl md:text-2xl font-bold text-white">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-yellow-500/10 rounded-lg md:rounded-xl border border-yellow-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-yellow-400/70 mb-1">На модерации</div>
          <div className="text-xl md:text-2xl font-bold text-yellow-400">{stats.pending}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-green-500/10 rounded-lg md:rounded-xl border border-green-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-green-400/70 mb-1">Одобрено</div>
          <div className="text-xl md:text-2xl font-bold text-green-400">{stats.approved}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-blue-500/10 rounded-lg md:rounded-xl border border-blue-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-blue-400/70 mb-1">Активно</div>
          <div className="text-xl md:text-2xl font-bold text-blue-400">{stats.active}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-purple-500/10 rounded-lg md:rounded-xl border border-purple-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-purple-400/70 mb-1">Завершено</div>
          <div className="text-xl md:text-2xl font-bold text-purple-400">{stats.completed}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="backdrop-blur-xl bg-red-500/10 rounded-lg md:rounded-xl border border-red-500/20 p-3 md:p-4"
        >
          <div className="text-xs md:text-sm text-red-400/70 mb-1">Отклонено</div>
          <div className="text-xl md:text-2xl font-bold text-red-400">{stats.rejected}</div>
        </motion.div>
      </div>

      {/* TOOLBAR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4"
      >
        {/* Search & View Toggle */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по кампании, артисту, платформе..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

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
                    <option value="active">Активно</option>
                    <option value="completed">Завершено</option>
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
                    <option value="budget">Бюджет</option>
                    <option value="name">Название кампании</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MARKETING LIST */}
      {filteredMarketing.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Кампании не найдены</h3>
          <p className="text-gray-400">Измените параметры фильтрации или поиска</p>
        </motion.div>
      ) : (
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredMarketing.map((marketing, index) => {
            const typeConfig = campaignTypeConfig[marketing.campaignType];
            const TypeIcon = typeConfig.icon;
            
            return (
              <motion.div
                key={marketing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4 hover:bg-white/10 transition-all"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-white mb-1 truncate">
                      {marketing.campaignName}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 truncate">
                      {marketing.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${typeConfig.color} text-white`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeConfig.label}
                      </div>
                      <span className="text-xs text-gray-500">{marketing.platform}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                    marketing.status === 'approved' || marketing.status === 'active'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : marketing.status === 'completed'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : marketing.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {marketing.status === 'approved' && 'Одобрен'}
                    {marketing.status === 'active' && 'Активна'}
                    {marketing.status === 'completed' && 'Завершена'}
                    {marketing.status === 'rejected' && 'Отклонён'}
                    {marketing.status === 'pending' && 'Ожидает'}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-400 mb-3 line-clamp-2">
                  {marketing.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-gray-400 mb-0.5">Бюджет</div>
                    <div className="font-bold text-white">₽{(marketing.budget / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-gray-400 mb-0.5">Охват</div>
                    <div className="font-bold text-white">
                      {marketing.status === 'active' || marketing.status === 'completed'
                        ? marketing.actualReach.toLocaleString()
                        : `${(marketing.expectedReach / 1000).toFixed(0)}K`}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <div className="text-gray-400 mb-0.5">Дней</div>
                    <div className="font-bold text-white">{marketing.duration}</div>
                  </div>
                </div>

                {/* Metrics for active/completed */}
                {(marketing.status === 'active' || marketing.status === 'completed') && (
                  <div className="mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div>
                        <div className="text-gray-400">Клики</div>
                        <div className="font-bold text-blue-400">{marketing.clicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Engagement</div>
                        <div className="font-bold text-blue-400">{marketing.engagement}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Конверсии</div>
                        <div className="font-bold text-blue-400">{marketing.conversions.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions (только для pending) */}
                {marketing.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(marketing)}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Одобрить
                    </button>
                    <button
                      onClick={() => setSelectedMarketing(marketing)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Отклонить
                    </button>
                  </div>
                )}

                {/* Rejection Reason */}
                {marketing.status === 'rejected' && marketing.rejectionReason && (
                  <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">
                      <strong>Причина:</strong> {marketing.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Landing URL */}
                {marketing.landingUrl && (
                  <a
                    href={marketing.landingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Посмотреть лендинг
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* REJECTION MODAL */}
      <AnimatePresence>
        {selectedMarketing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedMarketing(null);
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
              <h3 className="text-xl font-bold text-white mb-4">Отклонить кампанию</h3>
              <p className="text-gray-400 mb-4">
                Кампания: <strong className="text-white">{selectedMarketing.campaignName}</strong>
                <br />
                Артист: <strong className="text-white">{selectedMarketing.artist}</strong>
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
                  onClick={() => handleReject(selectedMarketing)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
                >
                  Отклонить
                </button>
                <button
                  onClick={() => {
                    setSelectedMarketing(null);
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
