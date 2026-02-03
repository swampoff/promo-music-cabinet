/**
 * ECOSYSTEM OVERVIEW - Обзор экосистемы (показывает статистику обоих кабинетов)
 */

import { motion } from 'framer-motion';
import {
  Users,
  Music,
  Video,
  TrendingUp,
  DollarSign,
  Award,
  Radio,
  Building2,
  Shield,
  Activity,
} from 'lucide-react';

const ecosystemStats = [
  {
    category: 'Пользователи',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    stats: [
      { label: 'Всего пользователей', value: '2,453' },
      { label: 'Артисты', value: '1,234' },
      { label: 'DJ', value: '567' },
      { label: 'Лейблы', value: '89' },
    ],
  },
  {
    category: 'Контент',
    icon: Music,
    color: 'from-purple-500 to-pink-500',
    stats: [
      { label: 'Всего треков', value: '18,492' },
      { label: 'Видео клипов', value: '3,847' },
      { label: 'Концертов', value: '1,234' },
      { label: 'Новостей', value: '567' },
    ],
  },
  {
    category: 'Активность',
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    stats: [
      { label: 'Просмотры за месяц', value: '2.3M' },
      { label: 'Прослушивания', value: '5.7M' },
      { label: 'Лайки', value: '890K' },
      { label: 'Комментарии', value: '123K' },
    ],
  },
  {
    category: 'Финансы',
    icon: DollarSign,
    color: 'from-yellow-500 to-orange-500',
    stats: [
      { label: 'Оборот за месяц', value: '₽2.4M' },
      { label: 'Выплаты артистам', value: '₽890K' },
      { label: 'Донаты', value: '₽234K' },
      { label: 'Подписки', value: '₽156K' },
    ],
  },
  {
    category: 'Продвижение',
    icon: TrendingUp,
    color: 'from-pink-500 to-rose-500',
    stats: [
      { label: 'Питчинг кампаний', value: '234' },
      { label: 'Маркетинг', value: '156' },
      { label: 'PR заявки', value: '89' },
      { label: 'Реклама', value: '67' },
    ],
  },
  {
    category: 'Партнеры',
    icon: Building2,
    color: 'from-indigo-500 to-purple-500',
    stats: [
      { label: 'Радиостанции', value: '156' },
      { label: 'Заведения', value: '234' },
      { label: 'ТВ-каналы', value: '45' },
      { label: 'Медиа', value: '78' },
    ],
  },
];

export function EcosystemOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-2">PROMO.MUSIC Ecosystem</h1>
        <p className="text-gray-400 text-lg">Полная статистика музыкальной платформы</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ecosystemStats.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{section.category}</h3>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {section.stats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{stat.label}</span>
                    <span className="text-lg font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Система работает стабильно</h3>
        <p className="text-green-300">Все сервисы функционируют без сбоев • Uptime: 99.98%</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-gray-400">API</p>
            <p className="text-lg font-bold text-green-400">Online</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-gray-400">Database</p>
            <p className="text-lg font-bold text-green-400">Healthy</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-gray-400">Storage</p>
            <p className="text-lg font-bold text-green-400">Ready</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-gray-400">CDN</p>
            <p className="text-lg font-bold text-green-400">Active</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
