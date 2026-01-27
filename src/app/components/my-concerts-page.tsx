import { Calendar, MapPin, Ticket, Trash2, Edit2, Plus, Loader2, Clock, AlertCircle, Sparkles, History, TestTube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { concertsApiAdapter, useBackendStatus } from '@/services/concerts-api-adapter';
import type { TourDate } from '@/types/database';
import { toast } from 'sonner';
import { ConcertFormModal } from '@/app/components/concert-form-modal';
import { PerformanceHistoryTab } from '@/app/components/performance-history-tab';
import type { ConcertFormData } from '@/schemas/concert-schema';
import { ConcertsFilters, type ConcertFilters } from '@/app/components/concerts-filters';
import { ConcertsAnalytics } from '@/app/components/concerts-analytics';

interface MyConcertsPageProps {
  userCoins: number;
  onCoinsUpdate: (coins: number) => void;
}

export function MyConcertsPage({ userCoins, onCoinsUpdate }: MyConcertsPageProps) {
  const [concerts, setConcerts] = useState<TourDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingConcert, setEditingConcert] = useState<TourDate | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'analytics'>('upcoming');
  const [filters, setFilters] = useState<ConcertFilters>({
    search: '',
    city: '',
    eventType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date-asc',
  });

  // Load concerts from database (or mock) with cleanup
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const response = await concertsApiAdapter.getAll();
      
      if (!cancelled) {
        if (response.success && response.data) {
          setConcerts(response.data);
        } else {
          setError(response.error || 'Не удалось загрузить концерты');
        }
        setLoading(false);
      }
    };

    init();
    checkBackendStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const checkBackendStatus = async () => {
    const status = await useBackendStatus();
    setBackendStatus(status.message);
  };

  // Helper functions - объявляем ДО useMemo
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'pending': return 'На модерации';
      case 'approved': return 'Одобрен';
      case 'rejected': return 'Отклонён';
      case 'announced': return 'Анонсирован';
      case 'on_sale': return 'В продаже';
      case 'sold_out': return 'Распродан';
      case 'cancelled': return 'Отменён';
      case 'postponed': return 'Перенесён';
      case 'completed': return 'Завершён';
      default: return status;
    }
  };

  // Memoized formatted concerts for performance
  const formattedConcerts = useMemo(() => 
    concerts.map(c => ({
      ...c,
      formattedDate: formatDate(c.date)
    })),
    [concerts]
  );

  // Extract unique cities for filter
  const uniqueCities = useMemo(() => {
    const cities = concerts.map(c => c.city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [concerts]);

  // Filtered and sorted concerts
  const filteredConcerts = useMemo(() => {
    let result = [...formattedConcerts];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.city?.toLowerCase().includes(search) ||
        c.venue_name?.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search)
      );
    }

    // City filter
    if (filters.city) {
      result = result.filter(c => c.city === filters.city);
    }

    // Event type filter
    if (filters.eventType) {
      result = result.filter(c => c.event_type === filters.eventType);
    }

    // Status filter
    if (filters.status) {
      result = result.filter(c => c.moderation_status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      result = result.filter(c => new Date(c.date) >= dateFrom);
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      result = result.filter(c => new Date(c.date) <= dateTo);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'clicks':
          return (b.clicks || 0) - (a.clicks || 0);
        case 'created':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [formattedConcerts, filters]);

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    
    await toast.promise(
      concertsApiAdapter.delete(id),
      {
        loading: 'Удаление концерта...',
        success: () => {
          setConcerts(concerts.filter(c => c.id !== id));
          return 'Концерт успешно удалён';
        },
        error: (err) => {
          console.error('Delete error:', err);
          return `Ошибка удаления: ${err.error || err.message || 'Неизвестная ошибка'}`;
        }
      }
    );
    
    setActionLoading(null);
  };

  const handleSubmitForModeration = async (id: string) => {
    setActionLoading(id);
    
    await toast.promise(
      concertsApiAdapter.submit(id),
      {
        loading: 'Отправка на модерацию...',
        success: (response) => {
          if (response.data) {
            setConcerts(concerts.map(c => c.id === id ? response.data! : c));
          }
          return 'Отправлено на модерацию';
        },
        error: (err) => {
          console.error('Submit error:', err);
          return `Ошибка: ${err.error || err.message || 'Неизвестная ошибка'}`;
        }
      }
    );
    
    setActionLoading(null);
  };

  const handlePromote = async (id: string) => {
    if (userCoins < 100) {
      toast.error('Недостаточно коинов для продвижения', {
        description: 'Требуется 100 💰 для продвижения на 7 дней'
      });
      return;
    }

    setActionLoading(id);
    
    await toast.promise(
      concertsApiAdapter.promote(id, 7),
      {
        loading: 'Продвижение концерта...',
        success: (response) => {
          if (response.data) {
            setConcerts(concerts.map(c => c.id === id ? response.data! : c));
            onCoinsUpdate(userCoins - 100);
          }
          return '🎉 Концерт успешно продвинут на 7 дней!';
        },
        error: (err) => {
          console.error('Promote error:', err);
          return `Ошибка продвижения: ${err.error || err.message || 'Неизвестная ошибка'}`;
        }
      }
    );
    
    setActionLoading(null);
  };

  const handleEdit = (concert: TourDate) => {
    setEditingConcert(concert);
  };

  const handleCreateConcert = async (data: ConcertFormData) => {
    const response = await concertsApiAdapter.create(data);
    
    if (response.success && response.data) {
      setConcerts([...concerts, response.data]);
      setShowCreateModal(false);
      toast.success('🎉 Концерт успешно создан!', {
        description: 'Отправьте его на модерацию для публикации'
      });
    } else {
      toast.error('Ошибка создания концерта', {
        description: response.error || 'Попробуйте еще раз'
      });
      throw new Error(response.error || 'Failed to create concert');
    }
  };

  const handleUpdateConcert = async (data: ConcertFormData) => {
    if (!editingConcert) return;
    
    const response = await concertsApiAdapter.update(editingConcert.id, data);
    
    if (response.success && response.data) {
      setConcerts(concerts.map(c => c.id === editingConcert.id ? response.data! : c));
      setEditingConcert(null);
      toast.success('✅ Концерт успешно обновлен!');
    } else {
      toast.error('Ошибка обновления концерта', {
        description: response.error || 'Попробуйте еще раз'
      });
      throw new Error(response.error || 'Failed to update concert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
          <p className="text-gray-400">Загрузка концертов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Мои Концерты
          </h1>
          <p className="text-gray-400 mt-2">Управление выступлениями и турами</p>
          {backendStatus && (
            <p className="text-xs text-gray-500 mt-1">{backendStatus}</p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          Добавить концерт
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'upcoming'
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 inline-block mr-2" />
          Предстоящие концерты
          {activeTab === 'upcoming' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'history'
              ? 'text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-5 h-5 inline-block mr-2" />
          История выступлений
          {activeTab === 'history' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'analytics'
              ? 'text-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TestTube className="w-5 h-5 inline-block mr-2" />
          Аналитика
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-lime-400"
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'history' ? (
        <PerformanceHistoryTab />
      ) : activeTab === 'analytics' ? (
        <ConcertsAnalytics concerts={concerts} />
      ) : (
        <>
          {/* Filters & Search */}
          {formattedConcerts.length > 0 && (
            <ConcertsFilters
              filters={filters}
              onFiltersChange={setFilters}
              cities={uniqueCities}
              totalCount={formattedConcerts.length}
              filteredCount={filteredConcerts.length}
            />
          )}

          {/* Concerts List */}
          {filteredConcerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <Calendar className="w-20 h-20 text-gray-600" />
              <h3 className="text-2xl font-semibold text-gray-400">Концертов пока нет</h3>
              <p className="text-gray-500">Добавьте свой первый концерт!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold"
              >
                Создать концерт
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredConcerts.map((concert, index) => (
                  <motion.div
                    key={concert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: Math.min(index * 0.1, 0.5) }}
                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                  >
                    {/* Banner Image */}
                    {concert.banner_url && (
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={concert.banner_url}
                          alt={concert.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm border backdrop-blur-sm ${getStatusColor(concert.moderation_status)}`}>
                            {getStatusText(concert.moderation_status)}
                          </span>
                        </div>

                        {/* Promoted Badge */}
                        {concert.is_promoted && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full text-xs sm:text-sm border backdrop-blur-sm bg-yellow-500/20 text-yellow-300 border-yellow-500/30 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Продвигается
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4 sm:p-6 space-y-4">
                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                        {concert.title}
                      </h3>

                      {/* Description */}
                      {concert.description && (
                        <p className="text-gray-400 line-clamp-2 text-sm sm:text-base">{concert.description}</p>
                      )}

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300 flex-wrap">
                          <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span>{concert.formattedDate}</span>
                          {concert.show_start && (
                            <>
                              <Clock className="w-4 h-4 text-purple-400 ml-2 flex-shrink-0" />
                              <span>{concert.show_start}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0" />
                          <span className="truncate">{concert.venue_name}, {concert.city}</span>
                        </div>

                        {concert.ticket_price_min && concert.ticket_price_max && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Ticket className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span>{concert.ticket_price_min}₽ - {concert.ticket_price_max}₽</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-purple-400">{concert.views || 0}</p>
                          <p className="text-xs text-gray-500">Просмотры</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-pink-400">{concert.clicks || 0}</p>
                          <p className="text-xs text-gray-500">Клики</p>
                        </div>
                        {concert.tickets_sold !== undefined && (
                          <div className="text-center">
                            <p className="text-xl sm:text-2xl font-bold text-blue-400">{concert.tickets_sold}</p>
                            <p className="text-xs text-gray-500">Билетов</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 flex-wrap sm:flex-nowrap">
                        {concert.moderation_status === 'draft' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubmitForModeration(concert.id)}
                            disabled={actionLoading === concert.id}
                            className="flex-1 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] sm:min-w-0"
                          >
                            {actionLoading === concert.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              'На модерацию'
                            )}
                          </motion.button>
                        )}

                        {concert.moderation_status === 'approved' && !concert.is_promoted && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePromote(concert.id)}
                            disabled={actionLoading === concert.id}
                            className="flex-1 px-4 py-2 bg-yellow-600/80 hover:bg-yellow-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] sm:min-w-0"
                          >
                            {actionLoading === concert.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              <span className="flex items-center justify-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">Продвинуть </span>(100 💰)
                              </span>
                            )}
                          </motion.button>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(concert)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors min-w-[44px]"
                          aria-label="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(concert.id)}
                          disabled={actionLoading === concert.id}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px]"
                          aria-label="Удалить"
                        >
                          {actionLoading === concert.id && actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-400" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Create Concert Modal */}
      <ConcertFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateConcert}
      />

      {/* Edit Concert Modal */}
      <ConcertFormModal
        isOpen={!!editingConcert}
        onClose={() => setEditingConcert(null)}
        onSubmit={handleUpdateConcert}
        concert={editingConcert}
      />
    </div>
  );
}