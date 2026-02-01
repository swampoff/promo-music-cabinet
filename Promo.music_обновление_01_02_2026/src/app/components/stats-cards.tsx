import { Play, Users, DollarSign, Music2, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  {
    label: 'Всего прослушиваний',
    value: '6.67K',
    change: '+24%',
    icon: Play,
    gradient: 'from-cyan-500/20 to-blue-600/20',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    changeColor: 'text-emerald-400',
  },
  {
    label: 'Слушателей',
    value: '2.29K',
    change: '+18%',
    icon: Users,
    gradient: 'from-pink-500/20 to-purple-600/20',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
    changeColor: 'text-emerald-400',
  },
  {
    label: 'Доход',
    value: '₽58.2',
    change: '+31%',
    icon: DollarSign,
    gradient: 'from-emerald-500/20 to-green-600/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    changeColor: 'text-emerald-400',
  },
  {
    label: 'Треков',
    value: '12',
    change: '+3',
    icon: Music2,
    gradient: 'from-orange-500/20 to-red-600/20',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    changeColor: 'text-emerald-400',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative overflow-hidden p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br ${stat.gradient} border border-white/10 group cursor-pointer`}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                {stat.badge && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-400/30">
                    {stat.badge}
                  </span>
                )}
              </div>
              
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm mb-3">{stat.label}</div>
              
              <div className={`flex items-center gap-1 text-sm font-semibold ${stat.changeColor}`}>
                {stat.change.startsWith('+') ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
                <span className="text-gray-500 ml-1">за неделю</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}