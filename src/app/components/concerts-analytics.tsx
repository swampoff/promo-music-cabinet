/**
 * CONCERTS ANALYTICS DASHBOARD
 * Компонент аналитики концертов с графиками и статистикой
 */

import { TrendingUp, Eye, MousePointerClick, Calendar, MapPin, Sparkles, Download, BarChart3, PieChart, Users, DollarSign, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { TourDate } from '@/types/database';
import { AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

interface ConcertsAnalyticsProps {
  concerts: TourDate[];
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export function ConcertsAnalytics({ concerts }: ConcertsAnalyticsProps) {
  
  // Основная статистика
  const stats = useMemo(() => {
    const total = concerts.length;
    const totalViews = concerts.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalClicks = concerts.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';
    
    const approved = concerts.filter(c => c.moderation_status === 'approved').length;
    const pending = concerts.filter(c => c.moderation_status === 'pending').length;
    const draft = concerts.filter(c => c.moderation_status === 'draft').length;
    
    const promoted = concerts.filter(c => c.is_promoted).length;
    const totalTicketRevenue = concerts.reduce((sum, c) => {
      return sum + (c.ticket_price_from || 0) * (c.clicks || 0) * 0.1; // Примерная конверсия 10%
    }, 0);

    return {
      total,
      totalViews,
      totalClicks,
      conversionRate,
      approved,
      pending,
      draft,
      promoted,
      totalTicketRevenue,
      avgViewsPerConcert: total > 0 ? Math.round(totalViews / total) : 0,
      avgClicksPerConcert: total > 0 ? Math.round(totalClicks / total) : 0,
    };
  }, [concerts]);

  // Топ-5 концертов по просмотрам
  const topConcertsByViews = useMemo(() => {
    return [...concerts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(c => ({
        title: c.title,
        city: c.city,
        views: c.views || 0,
        clicks: c.clicks || 0,
      }));
  }, [concerts]);

  // Статистика по городам
  const citiesStats = useMemo(() => {
    const cityMap = new Map<string, { count: number; views: number; clicks: number }>();
    
    concerts.forEach(c => {
      if (c.city) {
        const existing = cityMap.get(c.city) || { count: 0, views: 0, clicks: 0 };
        cityMap.set(c.city, {
          count: existing.count + 1,
          views: existing.views + (c.views || 0),
          clicks: existing.clicks + (c.clicks || 0),
        });
      }
    });

    return Array.from(cityMap.entries())
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [concerts]);

  // Статистика по типам событий
  const eventTypesStats = useMemo(() => {
    const typeMap = new Map<string, number>();
    
    concerts.forEach(c => {
      const type = c.event_type || 'Не указан';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [concerts]);

  // Статистика по статусам модерации
  const statusStats = useMemo(() => {
    const statusMap = new Map<string, number>();
    
    const statusNames: Record<string, string> = {
      draft: 'Черновик',
      pending: 'На модерации',
      approved: 'Одобрен',
      rejected: 'Отклонён',
    };

    concerts.forEach(c => {
      const status = statusNames[c.moderation_status] || c.moderation_status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    return Array.from(statusMap.entries())
      .map(([name, value]) => ({ name, value }));
  }, [concerts]);

  // График просмотров и кликов по концертам (топ-10)
  const performanceData = useMemo(() => {
    return [...concerts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(c => ({
        name: c.city || c.title.slice(0, 15),
        views: c.views || 0,
        clicks: c.clicks || 0,
      }));
  }, [concerts]);

  // Экспорт в CSV
  const handleExportCSV = () => {
    const headers = ['Название', 'Город', 'Дата', 'Площадка', 'Просмотры', 'Клики', 'Статус', 'Тип'];
    const rows = concerts.map(c => [
      c.title,
      c.city || '',
      new Date(c.date).toLocaleDateString('ru-RU'),
      c.venue_name || '',
      c.views || 0,
      c.clicks || 0,
      c.moderation_status,
      c.event_type || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `concerts-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('📊 Данные экспортированы!', {
      description: 'CSV файл успешно загружен'
    });
  };

  if (concerts.length === 0) {
    return (
      <div className="p-8 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Нет данных для аналитики</h3>
        <p className="text-sm text-gray-500">Добавьте концерты, чтобы увидеть статистику</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Аналитика концертов
          </h2>
          <p className="text-gray-400 mt-1">Детальная статистика и метрики</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-500/20"
        >
          <Download className="w-5 h-5" />
          Экспорт CSV
        </motion.button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30"
        >
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-cyan-400" />
            <span className="text-3xl font-bold text-white">{stats.total}</span>
          </div>
          <h3 className="text-cyan-300 font-semibold mb-1">Всего концертов</h3>
          <p className="text-xs text-gray-400">
            Одобрено: {stats.approved} • На модерации: {stats.pending}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30"
        >
          <div className="flex items-center justify-between mb-3">
            <Eye className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</span>
          </div>
          <h3 className="text-purple-300 font-semibold mb-1">Просмотров</h3>
          <p className="text-xs text-gray-400">
            В среднем: {stats.avgViewsPerConcert} на концерт
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30"
        >
          <div className="flex items-center justify-between mb-3">
            <MousePointerClick className="w-8 h-8 text-pink-400" />
            <span className="text-3xl font-bold text-white">{stats.totalClicks.toLocaleString()}</span>
          </div>
          <h3 className="text-pink-300 font-semibold mb-1">Кликов по билетам</h3>
          <p className="text-xs text-gray-400">
            В среднем: {stats.avgClicksPerConcert} на концерт
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30"
        >
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-white">{stats.conversionRate}%</span>
          </div>
          <h3 className="text-green-300 font-semibold mb-1">Конверсия</h3>
          <p className="text-xs text-gray-400">
            Клики / Просмотры
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Топ-10 концертов по эффективности
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="views" fill="#06b6d4" name="Просмотры" radius={[8, 8, 0, 0]} />
              <Bar dataKey="clicks" fill="#ec4899" name="Клики" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Event Types Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Типы событий
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={eventTypesStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypesStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
            </RechartsPie>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Concerts & Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Concerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Топ-5 самых популярных концертов
          </h3>
          <div className="space-y-3">
            {topConcertsByViews.map((concert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <span className="text-sm font-bold text-yellow-400">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{concert.title}</h4>
                    <p className="text-xs text-gray-400">{concert.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Eye className="w-4 h-4" />
                    <span className="font-bold">{concert.views}</span>
                  </div>
                  <div className="flex items-center gap-2 text-pink-400 text-xs">
                    <MousePointerClick className="w-3 h-3" />
                    <span>{concert.clicks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cities Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-400" />
            Статистика по городам
          </h3>
          <div className="space-y-3">
            {citiesStats.map((city, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{city.city}</h4>
                  <span className="text-sm text-gray-400">{city.count} концерт(ов)</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-purple-400">
                    <Eye className="w-3 h-3" />
                    <span>{city.views} просмотров</span>
                  </div>
                  <div className="flex items-center gap-1 text-pink-400">
                    <MousePointerClick className="w-3 h-3" />
                    <span>{city.clicks} кликов</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-green-400" />
          Распределение по статусам
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusStats.map((status, index) => (
            <div
              key={index}
              className="p-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">{status.value}</div>
              <div className="text-sm text-gray-400">{status.name}</div>
              <div className="mt-2 text-xs text-gray-500">
                {((status.value / stats.total) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30"
      >
        <h3 className="text-lg font-bold text-white mb-4">💡 Ключевые инсайты</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-white">Продвижение</span>
            </div>
            <p className="text-sm text-gray-300">
              {stats.promoted} концерт(ов) с активным продвижением
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-white">Потенциальный доход</span>
            </div>
            <p className="text-sm text-gray-300">
              ~{stats.totalTicketRevenue.toLocaleString('ru-RU')} ₽ от продажи билетов
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-white">Охват аудитории</span>
            </div>
            <p className="text-sm text-gray-300">
              {stats.totalViews.toLocaleString()} уникальных просмотров
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
