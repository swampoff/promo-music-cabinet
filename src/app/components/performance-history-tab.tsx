import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  MapPin, 
  Calendar, 
  Users, 
  Trash2, 
  Edit2, 
  Plus,
  Image as ImageIcon,
  TrendingUp,
  Award,
  Building2,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { PerformanceHistoryModal } from '@/app/components/performance-history-modal';
import type { PerformanceHistoryItem, EventType } from '@/types/database';
import type { PerformanceHistoryFormData } from '@/schemas/performance-history-schema';
import {
  getPerformanceHistory,
  addPerformanceHistory,
  updatePerformanceHistory,
  deletePerformanceHistory,
  calculatePerformanceStats
} from '@/services/performance-history-adapter';
import { toast } from 'sonner';

export function PerformanceHistoryTab() {
  const [performances, setPerformances] = useState<PerformanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceHistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');

  // Load performance history
  useEffect(() => {
    loadPerformanceHistory();
  }, []);

  const loadPerformanceHistory = async () => {
    setIsLoading(true);
    const result = await getPerformanceHistory();
    
    if (result.success && result.data) {
      // Sort by date descending (most recent first)
      const sorted = [...result.data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPerformances(sorted);
    } else {
      toast.error('Ошибка загрузки истории выступлений');
      console.error('Load error:', result.error);
    }
    
    setIsLoading(false);
  };

  const handleAddPerformance = async (data: PerformanceHistoryFormData) => {
    const result = await addPerformanceHistory(data);

    if (result.success) {
      toast.success('✅ Выступление добавлено в историю!');
      await loadPerformanceHistory();
      setIsModalOpen(false);
    } else {
      toast.error(`Ошибка: ${result.error}`);
      console.error('Add error:', result.error);
    }
  };

  const handleEditPerformance = async (data: PerformanceHistoryFormData) => {
    if (!selectedPerformance) return;

    const result = await updatePerformanceHistory(selectedPerformance.id, data);

    if (result.success) {
      toast.success('✅ Выступление обновлено!');
      await loadPerformanceHistory();
      setIsModalOpen(false);
      setSelectedPerformance(null);
    } else {
      toast.error(`Ошибка: ${result.error}`);
      console.error('Update error:', result.error);
    }
  };

  const handleDeletePerformance = async (performanceId: string) => {
    if (!confirm('Удалить выступление из истории?')) return;

    const result = await deletePerformanceHistory(performanceId);

    if (result.success) {
      toast.success('✅ Выступление удалено');
      await loadPerformanceHistory();
    } else {
      toast.error(`Ошибка: ${result.error}`);
      console.error('Delete error:', result.error);
    }
  };

  const openEditModal = (performance: PerformanceHistoryItem) => {
    setSelectedPerformance(performance);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedPerformance(null);
    setIsModalOpen(true);
  };

  // Calculate stats
  const stats = calculatePerformanceStats(performances);

  // Filter performances
  const filteredPerformances = performances.filter(perf => {
    const matchesSearch = 
      perf.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perf.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perf.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || perf.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">История выступлений</h2>
          <p className="text-gray-400">Архив всех ваших прошлых концертов и выступлений</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Добавить выступление
        </motion.button>
      </div>

      {/* Stats Cards */}
      {performances.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl backdrop-blur-xl bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-cyan-400 text-sm font-medium">Выступлений</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalPerformances}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-blue-400 text-sm font-medium">Зрителей</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalAudience.toLocaleString()}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl backdrop-blur-xl bg-purple-500/10 border border-purple-400/30 hover:bg-purple-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-purple-400 text-sm font-medium">Городов</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.uniqueCities}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl backdrop-blur-xl bg-pink-500/10 border border-pink-400/30 hover:bg-pink-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-pink-400 text-sm font-medium">Площадок</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.uniqueVenues}</div>
          </motion.div>
        </div>
      )}

      {/* Search and Filters */}
      {performances.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, площадке или городу..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-white placeholder:text-gray-500"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:w-64">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-white"
            >
              <option value="all" className="bg-gray-900">Все типы</option>
              <option value="Концерт" className="bg-gray-900">Концерт</option>
              <option value="Фестиваль" className="bg-gray-900">Фестиваль</option>
              <option value="Клубное выступление" className="bg-gray-900">Клубное выступление</option>
              <option value="Арена шоу" className="bg-gray-900">Арена шоу</option>
              <option value="Уличный концерт" className="bg-gray-900">Уличный концерт</option>
              <option value="Акустический сет" className="bg-gray-900">Акустический сет</option>
              <option value="DJ сет" className="bg-gray-900">DJ сет</option>
              <option value="Другое" className="bg-gray-900">Другое</option>
            </select>
          </div>
        </div>
      )}

      {/* Performances List */}
      {filteredPerformances.length === 0 ? (
        <div className="p-12 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg mb-4">
            {performances.length === 0 
              ? 'История выступлений пуста' 
              : 'Выступления не найдены'}
          </p>
          <p className="text-gray-500 mb-6">
            {performances.length === 0
              ? 'Добавьте ваши прошлые выступления и создайте впечатляющее портфолио'
              : 'Попробуйте изменить параметры поиска или фильтрации'}
          </p>
          {performances.length === 0 && (
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold text-white inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Добавить первое выступление
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPerformances.map((performance, index) => (
            <motion.div
              key={performance.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Photos Preview */}
                {performance.photos && performance.photos.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="w-full lg:w-40 h-40 rounded-xl overflow-hidden ring-2 ring-white/10">
                      <img
                        src={performance.photos[0]}
                        alt={performance.event_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {performance.photos.length > 1 && (
                      <div className="mt-2 flex gap-2">
                        {performance.photos.slice(1, 4).map((photo, i) => (
                          <div key={i} className="w-12 h-12 rounded-lg overflow-hidden">
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {performance.photos.length > 4 && (
                          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
                            +{performance.photos.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                        {performance.event_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(performance.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {performance.city}
                        </div>
                        <div className="px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                          {performance.type}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(performance)}
                        className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-cyan-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeletePerformance(performance.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{performance.venue_name}</span>
                    </div>
                    {performance.audience_size && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{performance.audience_size.toLocaleString()} зрителей</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {performance.description && (
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {performance.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PerformanceHistoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPerformance(null);
        }}
        onSubmit={selectedPerformance ? handleEditPerformance : handleAddPerformance}
        performance={selectedPerformance}
      />
    </div>
  );
}