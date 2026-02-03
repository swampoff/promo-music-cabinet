/**
 * CONCERTS FILTERS & SEARCH
 * Компонент фильтрации, поиска и сортировки концертов
 */

import { Search, Filter, X, Calendar, MapPin, Sparkles, SlidersHorizontal, TrendingUp, Eye, MousePointerClick, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export interface ConcertFilters {
  search: string;
  city: string;
  eventType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'date-asc' | 'date-desc' | 'views' | 'clicks' | 'created';
}

interface ConcertsFiltersProps {
  filters: ConcertFilters;
  onFiltersChange: (filters: ConcertFilters) => void;
  cities: string[];
  totalCount: number;
  filteredCount: number;
}

const EVENT_TYPES = [
  { value: '', label: 'Все типы' },
  { value: 'Концерт', label: 'Концерт' },
  { value: 'Фестиваль', label: 'Фестиваль' },
  { value: 'Акустика', label: 'Акустика' },
  { value: 'Тур', label: 'Тур' },
];

const STATUSES = [
  { value: '', label: 'Все статусы' },
  { value: 'draft', label: 'Черновик' },
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрен' },
  { value: 'rejected', label: 'Отклонён' },
  { value: 'sold_out', label: 'Распродан' },
  { value: 'cancelled', label: 'Отменён' },
  { value: 'completed', label: 'Завершён' },
];

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Дата: ближайшие', icon: Calendar },
  { value: 'date-desc', label: 'Дата: дальние', icon: Calendar },
  { value: 'views', label: 'По просмотрам', icon: Eye },
  { value: 'clicks', label: 'По кликам', icon: MousePointerClick },
  { value: 'created', label: 'По дате создания', icon: Clock },
];

export function ConcertsFilters({ 
  filters, 
  onFiltersChange, 
  cities, 
  totalCount, 
  filteredCount 
}: ConcertsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof ConcertFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      city: '',
      eventType: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date-asc',
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters = 
    filters.search || 
    filters.city || 
    filters.eventType || 
    filters.status || 
    filters.dateFrom || 
    filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Main Search & Quick Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Поиск по названию, городу или площадке..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Sort By */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="pl-12 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 appearance-none cursor-pointer min-w-[200px]"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value} className="bg-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            showAdvanced
              ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <Filter className="w-5 h-5" />
          Фильтры
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-white text-xs font-bold">
              {[filters.city, filters.eventType, filters.status, filters.dateFrom, filters.dateTo].filter(Boolean).length}
            </span>
          )}
        </motion.button>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 font-semibold hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Сбросить
          </motion.button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    Город
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-400/50 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">Все города</option>
                    {cities.map(city => (
                      <option key={city} value={city} className="bg-gray-900">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Тип события
                  </label>
                  <select
                    value={filters.eventType}
                    onChange={(e) => updateFilter('eventType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.value} value={type.value} className="bg-gray-900">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Статус
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-400/50 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    {STATUSES.map(status => (
                      <option key={status.value} value={status.value} className="bg-gray-900">
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Период
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                      placeholder="От"
                    />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                      placeholder="До"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {(hasActiveFilters || filteredCount !== totalCount) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30"
        >
          <div className="flex items-center gap-2 text-cyan-300">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Найдено: <span className="text-white">{filteredCount}</span> из {totalCount} концертов
            </span>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors"
            >
              Показать все
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}