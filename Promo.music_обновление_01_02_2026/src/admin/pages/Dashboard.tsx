import { motion } from 'motion/react';
import { 
  Users, Music2, Video, Calendar, FileText, DollarSign, 
  TrendingUp, TrendingDown, Activity, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { useDashboardStats, useRecentActivity } from '@/hooks/useDashboardStats';

export function Dashboard() {
  // Получаем реальную статистику из DataContext
  const dashboardStats = useDashboardStats();
  const recentActivity = useRecentActivity(5);
  
  const stats = [
    {
      label: 'Всего пользователей',
      value: dashboardStats.totalUsers.toLocaleString(),
      change: dashboardStats.usersGrowth,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-400/30',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Активных артистов',
      value: dashboardStats.activeArtists.toLocaleString(),
      change: dashboardStats.artistsGrowth,
      trend: 'up',
      icon: Activity,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-400/30',
      iconColor: 'text-green-400',
    },
    {
      label: 'Треков на модерации',
      value: dashboardStats.pendingTracks.toString(),
      change: `-${dashboardStats.tracksModeratedToday} за сегодня`,
      trend: 'down',
      icon: Music2,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/30',
      iconColor: 'text-purple-400',
    },
    {
      label: 'Видео на модерации',
      value: dashboardStats.pendingVideos.toString(),
      change: `+${dashboardStats.videosModeratedToday} за сегодня`,
      trend: dashboardStats.videosModeratedToday > 0 ? 'up' : 'down',
      icon: Video,
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-400/30',
      iconColor: 'text-orange-400',
    },
    {
      label: 'Концертов на модерации',
      value: dashboardStats.pendingConcerts.toString(),
      change: `+${dashboardStats.concertsModeratedToday} за сегодня`,
      trend: dashboardStats.concertsModeratedToday > 0 ? 'up' : 'down',
      icon: Calendar,
      color: 'from-yellow-500/20 to-amber-500/20',
      borderColor: 'border-yellow-400/30',
      iconColor: 'text-yellow-400',
    },
    {
      label: 'Новостей на модерации',
      value: dashboardStats.pendingNews.toString(),
      change: `-${dashboardStats.newsModeratedToday} за сегодня`,
      trend: 'down',
      icon: FileText,
      color: 'from-indigo-500/20 to-blue-500/20',
      borderColor: 'border-indigo-400/30',
      iconColor: 'text-indigo-400',
    },
    {
      label: 'Доход за месяц',
      value: `₽${(dashboardStats.monthlyRevenue / 1000000).toFixed(1)}M`,
      change: dashboardStats.revenueGrowth,
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500/20 to-teal-500/20',
      borderColor: 'border-green-400/30',
      iconColor: 'text-green-400',
    },
    {
      label: 'Заявок в поддержку',
      value: dashboardStats.openTickets.toString(),
      change: `+${dashboardStats.ticketsToday} за сегодня`,
      trend: 'up',
      icon: Clock,
      color: 'from-red-500/20 to-pink-500/20',
      borderColor: 'border-red-400/30',
      iconColor: 'text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Панель управления</h1>
        <p className="text-gray-400">Общая статистика платформы PROMO.MUSIC</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-2xl backdrop-blur-md bg-gradient-to-br ${stat.color} border ${stat.borderColor} hover:scale-105 transition-transform duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center ${stat.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
              <div className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-6">Последняя активность</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-semibold">{activity.action}</span>
                    {activity.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 text-xs font-semibold">
                        Ожидает
                      </span>
                    )}
                    {activity.status === 'approved' && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {activity.status === 'rejected' && (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="text-cyan-400">{activity.user}</span> • {activity.title}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}