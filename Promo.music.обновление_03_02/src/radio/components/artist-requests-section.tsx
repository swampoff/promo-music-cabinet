/**
 * ARTIST REQUESTS SECTION - Раздел заявок артистов
 * Максимально доработанная версия с полным функционалом
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Clock, CheckCircle, XCircle, Play, Pause, Star, Filter, Search,
  Calendar, TrendingUp, Award, Eye, Download, Share2, AlertCircle,
  Music, User, Volume2, BarChart3, MessageSquare, ChevronDown, ChevronUp,
  Zap, Shield, ThumbsUp, ThumbsDown, MoreVertical, RefreshCw, X
} from 'lucide-react';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

type RequestStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'scheduled' | 'in_rotation';
type RotationType = 'heavy' | 'medium' | 'light' | 'special' | 'one_time';
type SortBy = 'date' | 'priority' | 'rating' | 'artist' | 'genre';
type FilterGenre = 'all' | 'pop' | 'rock' | 'hip_hop' | 'electronic' | 'jazz' | 'indie' | 'rnb';

interface ArtistRequest {
  id: string;
  trackId: string;
  artistId: string;
  artistName: string;
  trackTitle: string;
  genre: string;
  duration: string;
  durationSeconds: number;
  submittedAt: string;
  status: RequestStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPremium: boolean;
  
  // Audio
  audioUrl: string;
  waveformData?: number[];
  
  // Metadata
  bpm?: number;
  key?: string;
  energy?: number; // 0-100
  danceability?: number; // 0-100
  
  // Review data
  reviewedBy?: string;
  reviewedAt?: string;
  score?: number; // 0-10
  technicalScore?: number;
  commercialScore?: number;
  decision?: 'approved' | 'rejected';
  feedback?: string;
  
  // Rotation settings
  rotationType?: RotationType;
  rotationStart?: string;
  rotationEnd?: string;
  playsScheduled?: number;
  playsCompleted?: number;
  
  // Analytics
  views?: number;
  downloads?: number;
  shares?: number;
  
  // Artist info
  artistAvatar?: string;
  artistEmail?: string;
  artistPhone?: string;
  artistFollowers?: number;
  artistVerified?: boolean;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ArtistRequestsSection() {
  const [requests, setRequests] = useState<ArtistRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ArtistRequest | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [genreFilter, setGenreFilter] = useState<FilterGenre>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // =====================================================
  // DATA LOADING
  // =====================================================

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      const mockData: ArtistRequest[] = [
        {
          id: 'req_001',
          trackId: 'track_001',
          artistId: 'artist_001',
          artistName: 'Александр Иванов',
          trackTitle: 'Летний Вайб',
          genre: 'pop',
          duration: '3:45',
          durationSeconds: 225,
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'high',
          isPremium: true,
          audioUrl: 'https://example.com/track1.mp3',
          bpm: 128,
          key: 'C Major',
          energy: 85,
          danceability: 78,
          artistAvatar: 'https://i.pravatar.cc/150?img=1',
          artistEmail: 'artist@example.com',
          artistFollowers: 15420,
          artistVerified: true,
          views: 45,
        },
        {
          id: 'req_002',
          trackId: 'track_002',
          artistId: 'artist_002',
          artistName: 'DJ Nova',
          trackTitle: 'Midnight Drive',
          genre: 'electronic',
          duration: '4:20',
          durationSeconds: 260,
          submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'reviewing',
          priority: 'normal',
          isPremium: false,
          audioUrl: 'https://example.com/track2.mp3',
          bpm: 140,
          key: 'A Minor',
          energy: 92,
          danceability: 88,
          artistAvatar: 'https://i.pravatar.cc/150?img=2',
          artistFollowers: 8350,
          views: 32,
        },
        {
          id: 'req_003',
          trackId: 'track_003',
          artistId: 'artist_003',
          artistName: 'The Rockers',
          trackTitle: 'Sunset Boulevard',
          genre: 'rock',
          duration: '3:12',
          durationSeconds: 192,
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          priority: 'normal',
          isPremium: false,
          audioUrl: 'https://example.com/track3.mp3',
          score: 8.5,
          technicalScore: 9,
          commercialScore: 8,
          decision: 'approved',
          reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          rotationType: 'medium',
          playsScheduled: 20,
          playsCompleted: 5,
          artistAvatar: 'https://i.pravatar.cc/150?img=3',
          artistFollowers: 42100,
          artistVerified: true,
          views: 78,
        },
        {
          id: 'req_004',
          trackId: 'track_004',
          artistId: 'artist_004',
          artistName: 'MC Flow',
          trackTitle: 'City Lights',
          genre: 'hip_hop',
          duration: '3:58',
          durationSeconds: 238,
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'rejected',
          priority: 'low',
          isPremium: false,
          audioUrl: 'https://example.com/track4.mp3',
          score: 5.5,
          technicalScore: 6,
          commercialScore: 5,
          decision: 'rejected',
          feedback: 'Недостаточное качество звука. Рекомендуем улучшить мастеринг.',
          reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          artistAvatar: 'https://i.pravatar.cc/150?img=4',
          artistFollowers: 3200,
          views: 18,
        },
        {
          id: 'req_005',
          trackId: 'track_005',
          artistId: 'artist_005',
          artistName: 'Indie Soul',
          trackTitle: 'Whispers in the Wind',
          genre: 'indie',
          duration: '4:05',
          durationSeconds: 245,
          submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'urgent',
          isPremium: true,
          audioUrl: 'https://example.com/track5.mp3',
          bpm: 95,
          key: 'G Major',
          energy: 68,
          danceability: 55,
          artistAvatar: 'https://i.pravatar.cc/150?img=5',
          artistFollowers: 28900,
          artistVerified: false,
          views: 52,
        },
      ];

      setRequests(mockData);
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTERING & SORTING
  // =====================================================

  const filteredRequests = requests
    .filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (genreFilter !== 'all' && req.genre !== genreFilter) return false;
      if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          req.artistName.toLowerCase().includes(query) ||
          req.trackTitle.toLowerCase().includes(query) ||
          req.genre.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'rating':
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case 'artist':
          comparison = a.artistName.localeCompare(b.artistName);
          break;
        case 'genre':
          comparison = a.genre.localeCompare(b.genre);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // =====================================================
  // STATS CALCULATION
  // =====================================================

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    reviewing: requests.filter((r) => r.status === 'reviewing').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    inRotation: requests.filter((r) => r.status === 'in_rotation').length,
    urgent: requests.filter((r) => r.priority === 'urgent').length,
  };

  // =====================================================
  // ACTIONS
  // =====================================================

  const handlePlayPause = (requestId: string) => {
    if (currentlyPlaying === requestId) {
      setCurrentlyPlaying(null);
      toast.info('Воспроизведение остановлено');
    } else {
      setCurrentlyPlaying(requestId);
      toast.success('Воспроизведение началось');
    }
  };

  const handleReview = (request: ArtistRequest) => {
    setSelectedRequest(request);
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) {
      toast.error('Выберите хотя бы одну заявку');
      return;
    }
    
    toast.success(`Действие "${action}" применено к ${selectedIds.length} заявкам`);
    setSelectedIds([]);
    setBulkSelectMode(false);
  };

  const toggleSelectRequest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Заявки артистов</h2>
          <p className="text-slate-400 mt-1">
            Профессиональная оценка и модерация треков
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadRequests()}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setBulkSelectMode(!bulkSelectMode)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              bulkSelectMode
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {bulkSelectMode ? 'Отменить' : 'Массовые действия'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard
          icon={Mail}
          label="Всего"
          value={stats.total}
          color="slate"
        />
        <StatCard
          icon={Clock}
          label="Ожидают"
          value={stats.pending}
          color="orange"
          highlight={stats.pending > 0}
        />
        <StatCard
          icon={Eye}
          label="Рассмотрение"
          value={stats.reviewing}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Одобрено"
          value={stats.approved}
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="Отклонено"
          value={stats.rejected}
          color="red"
        />
        <StatCard
          icon={Play}
          label="В ротации"
          value={stats.inRotation}
          color="purple"
        />
        <StatCard
          icon={Zap}
          label="Срочные"
          value={stats.urgent}
          color="yellow"
          highlight={stats.urgent > 0}
        />
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по артисту, треку или жанру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Фильтры
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                {/* Status filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Статус
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'pending', 'reviewing', 'approved', 'rejected', 'in_rotation'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          statusFilter === status
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {status === 'all' ? 'Все' : getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Жанр
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'pop', 'rock', 'hip_hop', 'electronic', 'jazz', 'indie', 'rnb'] as FilterGenre[]).map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setGenreFilter(genre)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          genreFilter === genre
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {genre === 'all' ? 'Все' : genre.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Приоритет
                  </label>
                  <div className="flex gap-2">
                    {(['all', 'urgent', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setPriorityFilter(priority)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          priorityFilter === priority
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {priority === 'all' ? 'Все' : priority === 'urgent' ? 'Срочные' : 'Высокие'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Сортировка
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="date">По дате</option>
                      <option value="priority">По приоритету</option>
                      <option value="rating">По рейтингу</option>
                      <option value="artist">По артисту</option>
                      <option value="genre">По жанру</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk actions bar */}
      {bulkSelectMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-between"
        >
          <span className="text-white font-medium">
            Выбрано: {selectedIds.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm"
            >
              Одобрить
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
            >
              Отклонить
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 rounded-lg bg-slate-500 text-white hover:bg-slate-600 transition-colors text-sm"
            >
              Удалить
            </button>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Найдено: <strong className="text-white">{filteredRequests.length}</strong> заявок
        </span>
        {(statusFilter !== 'all' || genreFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setGenreFilter('all');
              setPriorityFilter('all');
              setSearchQuery('');
            }}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 mt-4">Загрузка заявок...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Заявки не найдены</p>
          <p className="text-sm text-slate-400">
            Попробуйте изменить фильтры или параметры поиска
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <TrackRequestCard
              key={request.id}
              request={request}
              isPlaying={currentlyPlaying === request.id}
              onPlayPause={() => handlePlayPause(request.id)}
              onReview={() => handleReview(request)}
              bulkSelectMode={bulkSelectMode}
              isSelected={selectedIds.includes(request.id)}
              onToggleSelect={() => toggleSelectRequest(request.id)}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <ReviewModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onSubmit={(data) => {
              console.log('Review submitted:', data);
              toast.success('Оценка сохранена');
              setSelectedRequest(null);
              loadRequests();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// STAT CARD COMPONENT
// =====================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'slate' | 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  highlight?: boolean;
}

function StatCard({ icon: Icon, label, value, color, highlight }: StatCardProps) {
  const colorClasses = {
    slate: 'from-slate-500/20 to-slate-600/20 border-slate-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-br border backdrop-blur-sm ${
        colorClasses[color]
      } ${highlight ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-yellow-500/50 animate-pulse' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/10">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-300">{label}</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TRACK REQUEST CARD
// =====================================================

interface TrackRequestCardProps {
  request: ArtistRequest;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReview: () => void;
  bulkSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function TrackRequestCard({
  request,
  isPlaying,
  onPlayPause,
  onReview,
  bulkSelectMode,
  isSelected,
  onToggleSelect,
}: TrackRequestCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const priorityColors = {
    low: 'text-slate-400',
    normal: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
  };

  const statusColors = {
    pending: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    reviewing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    approved: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
    scheduled: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    in_rotation: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-6 rounded-2xl backdrop-blur-xl border transition-all ${
        isSelected
          ? 'bg-indigo-500/10 border-indigo-500/50'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Checkbox (bulk mode) */}
        {bulkSelectMode && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* Cover */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 overflow-hidden">
              {request.artistAvatar ? (
                <img
                  src={request.artistAvatar}
                  alt={request.artistName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
              
              {/* Play overlay */}
              <button
                onClick={onPlayPause}
                className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate flex-1">
                  {request.trackTitle}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {request.isPremium && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full">
                      PREMIUM
                    </span>
                  )}
                  {request.artistVerified && (
                    <Shield className="w-4 h-4 text-blue-400" />
                  )}
                  {request.priority === 'urgent' && (
                    <Zap className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>

              {/* Artist & metadata */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {request.artistName}
                </span>
                <span className="uppercase text-xs font-medium text-indigo-400">
                  {request.genre.replace('_', ' ')}
                </span>
                <span>{request.duration}</span>
                {request.bpm && <span>{request.bpm} BPM</span>}
                {request.key && <span>{request.key}</span>}
              </div>

              {/* Submitted time */}
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Подана: {formatRelativeTime(request.submittedAt)}
              </p>

              {/* Energy/Danceability bars */}
              {(request.energy || request.danceability) && (
                <div className="mt-2 flex gap-4">
                  {request.energy !== undefined && (
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Энергия</span>
                        <span>{request.energy}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                          style={{ width: `${request.energy}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {request.danceability !== undefined && (
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Танцевальность</span>
                        <span>{request.danceability}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${request.danceability}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col items-end gap-3">
          {/* Status badge */}
          <span
            className={`px-3 py-1 rounded-lg text-xs font-medium border ${
              statusColors[request.status]
            }`}
          >
            {getStatusLabel(request.status)}
          </span>

          {/* Score (if reviewed) */}
          {request.score !== undefined && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-white">{request.score}</span>
                <span className="text-sm text-slate-400">/10</span>
              </div>
              {request.decision && (
                <p
                  className={`text-xs font-medium mt-1 ${
                    request.decision === 'approved' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {request.decision === 'approved' ? '✓ Одобрено' : '✗ Отклонено'}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {request.status === 'pending' || request.status === 'reviewing' ? (
              <>
                <button
                  onClick={onPlayPause}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  title="Прослушать"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={onReview}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                >
                  Оценить
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Подробнее
              </button>
            )}
          </div>

          {/* Stats (views, downloads, etc.) */}
          {(request.views || request.downloads || request.shares) && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {request.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {request.views}
                </span>
              )}
              {request.downloads && (
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {request.downloads}
                </span>
              )}
              {request.shares && (
                <span className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  {request.shares}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Technical scores */}
              {(request.technicalScore || request.commercialScore) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Оценки</h4>
                  {request.technicalScore && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Техническая:</span>
                      <span className="text-white font-medium">{request.technicalScore}/10</span>
                    </div>
                  )}
                  {request.commercialScore && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Коммерческая:</span>
                      <span className="text-white font-medium">{request.commercialScore}/10</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rotation info */}
              {request.rotationType && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Ротация</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Тип:</span>
                    <span className="text-white font-medium capitalize">
                      {request.rotationType}
                    </span>
                  </div>
                  {request.playsScheduled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Воспроизведено:</span>
                      <span className="text-white font-medium">
                        {request.playsCompleted || 0}/{request.playsScheduled}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              {request.feedback && (
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-white mb-2">Отзыв</h4>
                  <p className="text-sm text-slate-300 p-3 rounded-lg bg-white/5 border border-white/10">
                    {request.feedback}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =====================================================
// REVIEW MODAL
// =====================================================

interface ReviewModalProps {
  request: ArtistRequest;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function ReviewModal({ request, onClose, onSubmit }: ReviewModalProps) {
  const [technicalScore, setTechnicalScore] = useState(5);
  const [commercialScore, setCommercialScore] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [rotationType, setRotationType] = useState<RotationType>('medium');

  const overallScore = ((technicalScore + commercialScore) / 2).toFixed(1);

  const handleSubmit = () => {
    if (!decision) {
      toast.error('Выберите решение');
      return;
    }

    onSubmit({
      technicalScore,
      commercialScore,
      overallScore: parseFloat(overallScore),
      feedback,
      decision,
      rotationType: decision === 'approved' ? rotationType : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{request.trackTitle}</h3>
            <p className="text-slate-400">{request.artistName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scores */}
        <div className="space-y-6 mb-6">
          {/* Technical score */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-white">
                Техническая оценка
              </label>
              <span className="text-2xl font-bold text-white">{technicalScore}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={technicalScore}
              onChange={(e) => setTechnicalScore(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-slate-400 mt-1">
              Качество звука, мастеринг, продакшн
            </p>
          </div>

          {/* Commercial score */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-white">
                Коммерческая оценка
              </label>
              <span className="text-2xl font-bold text-white">{commercialScore}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={commercialScore}
              onChange={(e) => setCommercialScore(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-slate-400 mt-1">
              Потенциал для аудитории, соответствие формату
            </p>
          </div>

          {/* Overall score */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Общая оценка:</span>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <span className="text-3xl font-bold text-white">{overallScore}</span>
                <span className="text-slate-400">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decision */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Решение
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDecision('approved')}
              className={`p-4 rounded-xl border-2 transition-all ${
                decision === 'approved'
                  ? 'bg-green-500/20 border-green-500 text-green-300'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <ThumbsUp className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Одобрить</span>
            </button>
            <button
              onClick={() => setDecision('rejected')}
              className={`p-4 rounded-xl border-2 transition-all ${
                decision === 'rejected'
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <ThumbsDown className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Отклонить</span>
            </button>
          </div>
        </div>

        {/* Rotation type (if approved) */}
        {decision === 'approved' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Тип ротации
            </label>
            <select
              value={rotationType}
              onChange={(e) => setRotationType(e.target.value as RotationType)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="heavy">Тяжелая (много раз в день)</option>
              <option value="medium">Средняя</option>
              <option value="light">Легкая</option>
              <option value="special">Специальная</option>
              <option value="one_time">Разовое воспроизведение</option>
            </select>
          </div>
        )}

        {/* Feedback */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Комментарий
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Оставьте отзыв для артиста..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!decision}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
              decision
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Сохранить оценку
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getStatusLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    pending: 'Ожидает',
    reviewing: 'Рассмотрение',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    scheduled: 'Запланировано',
    in_rotation: 'В ротации',
  };
  return labels[status];
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
