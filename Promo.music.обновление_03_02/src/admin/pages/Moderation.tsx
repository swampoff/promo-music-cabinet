/**
 * UNIFIED MODERATION PAGE - Единая страница модерации для всех типов контента
 * Треки | Видео | Концерты | Новости | Баннеры | Питчинг | Маркетинг | 360-градусный контент | PromoLab
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Music, Video, Calendar, FileText, Image, ListMusic, Megaphone, Box, Award,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { TrackModeration } from './TrackModeration';
import { VideoModeration } from './VideoModeration';
import { ConcertModeration } from './ConcertModeration';
import { NewsModeration } from './NewsModeration';
import { BannerModeration } from './BannerModeration';
import { PitchingModeration } from './PitchingModeration';
import { MarketingModeration } from './MarketingModeration';
import { Production360Moderation } from './Production360Moderation';
import { PromoLabModeration } from './PromoLabModeration';

type ModerationType = 'tracks' | 'videos' | 'concerts' | 'news' | 'banners' | 'pitchings' | 'marketing' | 'production360' | 'promolab';

interface TabConfig {
  id: ModerationType;
  label: string;
  icon: any;
  price: string;
}

export function Moderation() {
  const { tracks, videos, concerts, news, banners, pitchings, marketing, production360, promoLab } = useData();
  const [activeTab, setActiveTab] = useState<ModerationType>('tracks');

  // ==================== TABS CONFIG ====================
  const tabs: TabConfig[] = [
    { id: 'tracks', label: 'Треки', icon: Music, price: '₽5,000' },
    { id: 'videos', label: 'Видео', icon: Video, price: '₽10,000' },
    { id: 'concerts', label: 'Концерты', icon: Calendar, price: '₽5,000' },
    { id: 'news', label: 'Новости', icon: FileText, price: '₽3,000' },
    { id: 'banners', label: 'Баннеры', icon: Image, price: '₽15,000' },
    { id: 'pitchings', label: 'Питчинг', icon: ListMusic, price: '₽20,000' },
    { id: 'marketing', label: 'Маркетинг', icon: Megaphone, price: '₽25,000' },
    { id: 'production360', label: '360°', icon: Box, price: '₽30,000' },
    { id: 'promolab', label: 'PromoLab', icon: Award, price: 'БЕСПЛАТНО' },
  ];

  // ==================== STATS ====================
  const stats = {
    tracks: {
      pending: tracks?.filter(t => t.status === 'pending').length || 0,
      approved: tracks?.filter(t => t.status === 'approved').length || 0,
      rejected: tracks?.filter(t => t.status === 'rejected').length || 0,
    },
    videos: {
      pending: videos?.filter(v => v.status === 'pending').length || 0,
      approved: videos?.filter(v => v.status === 'approved').length || 0,
      rejected: videos?.filter(v => v.status === 'rejected').length || 0,
    },
    concerts: {
      pending: concerts?.filter(c => c.status === 'pending').length || 0,
      approved: concerts?.filter(c => c.status === 'approved').length || 0,
      rejected: concerts?.filter(c => c.status === 'rejected').length || 0,
    },
    news: {
      pending: news?.filter(n => n.status === 'pending').length || 0,
      approved: news?.filter(n => n.status === 'approved').length || 0,
      rejected: news?.filter(n => n.status === 'rejected').length || 0,
    },
    banners: {
      pending: banners?.filter(b => b.status === 'pending').length || 0,
      approved: banners?.filter(b => b.status === 'approved').length || 0,
      rejected: banners?.filter(b => b.status === 'rejected').length || 0,
    },
    pitchings: {
      pending: pitchings?.filter(p => p.status === 'pending').length || 0,
      approved: pitchings?.filter(p => p.status === 'approved').length || 0,
      rejected: pitchings?.filter(p => p.status === 'rejected').length || 0,
    },
    marketing: {
      pending: marketing?.filter(m => m.status === 'pending').length || 0,
      approved: marketing?.filter(m => m.status === 'approved').length || 0,
      rejected: marketing?.filter(m => m.status === 'rejected').length || 0,
    },
    production360: {
      pending: production360?.filter(c => c.status === 'pending_payment' || c.status === 'pending_review').length || 0,
      approved: production360?.filter(c => c.status === 'approved' || c.status === 'in_progress').length || 0,
      rejected: production360?.filter(c => c.status === 'rejected').length || 0,
    },
    promolab: {
      pending: promoLab?.filter(c => c.status === 'pending_review').length || 0,
      approved: promoLab?.filter(c => c.status === 'approved' || c.status === 'in_progress' || c.status === 'completed').length || 0,
      rejected: promoLab?.filter(c => c.status === 'rejected').length || 0,
    },
  };

  const totalPending = stats.tracks.pending + stats.videos.pending + stats.concerts.pending + stats.news.pending + stats.banners.pending + stats.pitchings.pending + stats.marketing.pending + stats.production360.pending + stats.promolab.pending;
  const totalApproved = stats.tracks.approved + stats.videos.approved + stats.concerts.approved + stats.news.approved + stats.banners.approved + stats.pitchings.approved + stats.marketing.approved + stats.production360.approved + stats.promolab.approved;

  return (
    <div className="space-y-3 md:space-y-6 px-3 md:px-0">
      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-2xl border border-white/10 p-3 md:p-6"
      >
        {/* Title & Global Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">Модерация контента</h1>
            <p className="text-xs md:text-base text-gray-400">Проверяйте и одобряйте весь загруженный контент</p>
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-xs text-gray-400">На модерации</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-400">{totalPending}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-xs text-gray-400">Одобрено</div>
              <div className="text-xl md:text-2xl font-bold text-green-400">{totalApproved}</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg md:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xs md:text-sm font-semibold text-blue-400 mb-1">Единая модерация</h3>
            <p className="text-xs text-gray-300">
              Все типы контента собраны в одном месте. Переключайтесь между разделами и модерируйте эффективно. 
              При одобрении контента списывается соответствующая сумма с баланса артиста.
            </p>
          </div>
        </div>

        {/* ==================== TABS ==================== */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const tabStats = stats[tab.id];
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <div className="text-left">
                    <div className="text-xs md:text-sm font-semibold">{tab.label}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {tab.price}
                    </div>
                  </div>
                </div>
                
                {/* Pending Badge */}
                {tabStats.pending > 0 && (
                  <div className={`absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-yellow-400 text-gray-900' : 'bg-yellow-500 text-white'
                  }`}>
                    {tabStats.pending}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Stats Bar */}
        <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2">
          <div className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
            <div className="text-xs text-gray-400">Ожидают</div>
            <div className="text-base md:text-lg font-bold text-yellow-400">
              {stats[activeTab].pending}
            </div>
          </div>
          <div className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xs text-gray-400">Одобрено</div>
            <div className="text-base md:text-lg font-bold text-green-400">
              {stats[activeTab].approved}
            </div>
          </div>
          <div className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <div className="text-xs text-gray-400">Отклонено</div>
            <div className="text-base md:text-lg font-bold text-red-400">
              {stats[activeTab].rejected}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ==================== CONTENT AREA ==================== */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'tracks' && <TrackModeration />}
        {activeTab === 'videos' && <VideoModeration />}
        {activeTab === 'concerts' && <ConcertModeration />}
        {activeTab === 'news' && <NewsModeration />}
        {activeTab === 'banners' && <BannerModeration />}
        {activeTab === 'pitchings' && <PitchingModeration />}
        {activeTab === 'marketing' && <MarketingModeration />}
        {activeTab === 'production360' && <Production360Moderation />}
        {activeTab === 'promolab' && <PromoLabModeration />}
      </motion.div>
    </div>
  );
}