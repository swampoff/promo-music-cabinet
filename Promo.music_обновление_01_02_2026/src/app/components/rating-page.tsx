import { TrendingUp, Trophy, Medal, Award, Star, Music, Play, Heart, Users, ChevronRight, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const campaigns = [
  { id: 1, track: 'Summer Vibes', reach: 12500, spent: 450, status: 'active', progress: 65 },
  { id: 2, track: 'Electric Soul', reach: 8200, spent: 280, status: 'completed', progress: 100 },
  { id: 3, track: 'Midnight Dreams', reach: 3400, spent: 150, status: 'paused', progress: 34 },
];

const plans = [
  { name: 'Базовый', coins: 100, reach: '1-5K', features: ['Базовая аудитория', '7 дней показов', 'Статистика'], color: 'from-blue-500 to-cyan-500' },
  { name: 'Продвинутый', coins: 300, reach: '5-15K', features: ['Таргетированная аудитория', '14 дней показов', 'Расширенная статистика', 'Приоритет в плейлистах'], color: 'from-purple-500 to-pink-500', popular: true },
  { name: 'Профессионал', coins: 600, reach: '15-50K', features: ['Премиум аудитория', '30 дней показов', 'Полная аналитика', 'Продвижение в соцсетях', 'Персональный менеджер'], color: 'from-orange-500 to-red-500' },
];

export function RatingPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Питчинг и продвижение</h1>
        <p className="text-gray-400">Продвигайте свои треки и получайте больше слушателей</p>
      </div>

      {/* Active Campaigns */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Активные кампании</h2>
        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{campaign.track}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {campaign.reach.toLocaleString()} охват
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      {campaign.spent} потрачено
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {campaign.status === 'active' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      Активна
                    </span>
                  )}
                  {campaign.status === 'completed' && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                      Завершена
                    </span>
                  )}
                  {campaign.status === 'paused' && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                      Пауза
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Прогресс</span>
                  <span>{campaign.progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${campaign.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold transition-all duration-300 border border-cyan-400/30 text-sm">
                  Статистика
                </button>
                {campaign.status === 'active' && (
                  <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 text-sm">
                    Пауза
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Promotion Plans */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Тарифы продвижения</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative p-6 rounded-2xl backdrop-blur-xl bg-white/5 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-purple-400/50 shadow-xl shadow-purple-500/10' : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                  ПОПУЛЯРНЫЙ
                </div>
              )}

              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                <TrendingUp className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-white">{plan.coins}</span>
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-sm mb-6">Охват: {plan.reach} слушателей</p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold transition-all duration-300 shadow-lg`}>
                Запустить кампанию
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}