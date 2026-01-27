import { Play, Heart, Share2, TrendingUp, Users, Music2, Plus, Sparkles, Zap, Target, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PromotedConcertsSidebar, PromotedConcert } from '@/app/components/promoted-concerts-sidebar';
import { PromotedNewsBlock } from '@/app/components/promoted-news-block';
import { initDemoData, checkNeedsInit } from '@/utils/initDemoData';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  preview: string;
  coverImage: string;
  date: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  isPaid: boolean;
  createdAt: string;
}

interface HomePageProps {
  onNavigate: (section: string) => void;
  promotedConcerts?: PromotedConcert[];
  promotedNews?: NewsItem[];
}

const recentTracks = [
  { id: 1, title: 'Midnight Dreams', plays: '2.4K', likes: 340, isPlaying: false, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400' },
  { id: 2, title: 'Electric Soul', plays: '1.8K', likes: 280, isPlaying: false, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
  { id: 3, title: 'Summer Vibes', plays: '3.1K', likes: 420, isPlaying: false, cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400' },
];

const quickStats = [
  { label: 'Сегодня слушателей', value: '342', icon: Users, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-blue-500/20' },
  { label: 'Новых подписчиков', value: '+24', icon: Heart, color: 'text-pink-400', gradient: 'from-pink-500/20 to-purple-500/20' },
  { label: 'Треков в тренде', value: '3', icon: TrendingUp, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-green-500/20' },
];

const recommendations = [
  {
    title: 'Запустите питчинг',
    description: 'Продвиньте свой лучший трек и получите до 50К новых слушателей',
    icon: Target,
    action: 'Начать кампанию',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-400/30',
    iconColor: 'text-purple-400',
    route: 'rating'
  },
  {
    title: 'Добавьте новый релиз',
    description: 'Загрузите свежий трек и покажите его своей аудитории',
    icon: Plus,
    action: 'Загрузить трек',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-400/30',
    iconColor: 'text-cyan-400',
    route: 'tracks'
  },
];

export function HomePage({ onNavigate, promotedConcerts, promotedNews }: HomePageProps) {
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());

  const togglePlay = (trackId: number) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId);
  };

  const toggleLike = (trackId: number) => {
    setLikedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const initData = async () => {
      const needsInit = await checkNeedsInit();
      if (needsInit) {
        await initDemoData();
      }
    };
    
    initData();
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 max-w-[1600px] mx-auto">
      {/* Main Content */}
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden p-12 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-cyan-900/40 border border-white/10 shadow-2xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">Добро пожаловать</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl font-bold text-white mb-4"
          >
            Ваша музыка заслуживает большего
          </motion.h1>
          <p className="text-gray-300 text-xl mb-6 max-w-2xl mx-auto">Ваш музыкальный путь начинается здесь</p>
          
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('tracks')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Загрузить трек
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('analytics')}
              className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold transition-all duration-300 border border-white/20 flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Смотреть аналитику
            </motion.button>
          </div>
          </div>
        </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`group relative p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br ${stat.gradient} border border-white/10 cursor-pointer hover:shadow-lg transition-all duration-300`}
              onClick={() => onNavigate('analytics')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Подробнее</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(rec.route)}
              className={`p-8 rounded-2xl bg-gradient-to-br ${rec.gradient} border ${rec.borderColor} hover:border-opacity-50 transition-all duration-300 text-left group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <Icon className={`w-7 h-7 ${rec.iconColor}`} />
                  </div>
                  <Zap className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{rec.title}</h3>
                <p className="text-gray-300 mb-4">{rec.description}</p>
                
                <div className="flex items-center text-cyan-400 font-semibold group-hover:gap-2 transition-all">
                  <span>{rec.action}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Популярные треки</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('tracks')}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 flex items-center gap-2"
          >
            Все треки
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="space-y-4">
          {recentTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ x: 5 }}
              className="group p-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={track.cover} 
                    alt={track.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => togglePlay(track.id)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {playingTrack === track.id ? (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    ) : (
                      <Play className="w-6 h-6 text-white fill-white" />
                    )}
                  </motion.button>
                </div>
                
                <div className="flex-1">
                  <div className="text-white font-semibold text-lg mb-1">{track.title}</div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {track.plays}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className={`w-4 h-4 transition-colors ${likedTracks.has(track.id) ? 'fill-pink-400 text-pink-400' : ''}`} />
                      {track.likes}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleLike(track.id)}
                  className={`p-3 rounded-lg bg-white/5 hover:bg-pink-500/20 transition-all duration-300 ${likedTracks.has(track.id) ? 'bg-pink-500/20' : ''}`}
                >
                  <Heart className={`w-5 h-5 transition-all ${likedTracks.has(track.id) ? 'fill-pink-400 text-pink-400 scale-110' : 'text-gray-400'}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-lg bg-white/5 hover:bg-cyan-500/20 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5 text-cyan-400" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate('rating')}
                  className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 border border-purple-400/30"
                >
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('concerts')}
          className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music2 className="w-6 h-6 text-orange-400" />
            </div>
            <ExternalLink className="w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Концерты</h3>
          <p className="text-gray-300 text-sm">3 предстоящих события</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('messages')}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 text-left group relative"
        >
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Сообщения</h3>
          <p className="text-gray-300 text-sm">3 новых сообщения</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('news')}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
            <ExternalLink className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Новости</h3>
          <p className="text-gray-300 text-sm">Поделитесь с фанатами</p>
        </motion.button>
      </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Promoted Concerts */}
        {promotedConcerts && promotedConcerts.length > 0 && (
          <PromotedConcertsSidebar concerts={promotedConcerts} />
        )}

        {/* Promoted News */}
        {promotedNews && promotedNews.length > 0 && (
          <PromotedNewsBlock newsItems={promotedNews} />
        )}
      </div>
    </div>
  );
}