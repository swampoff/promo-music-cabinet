/**
 * BANNER HUB - ЦЕНТР УПРАВЛЕНИЯ БАННЕРНОЙ РЕКЛАМОЙ
 * Объединённый интерфейс для создания и управления баннерами
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, List } from 'lucide-react';
import { BannerAdManagement } from '@/app/components/banner-ad-management';
import { MyBannerAds } from '@/app/components/my-banner-ads';

interface BannerHubProps {
  userId: string;
  userEmail: string;
}

export function BannerHub({ userId, userEmail }: BannerHubProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  const userTracks = [
    { id: '1', title: 'Звёздная пыль', artist: 'Александр Иванов' },
    { id: '2', title: 'Ночной город', artist: 'Александр Иванов' },
    { id: '3', title: 'Космос внутри', artist: 'Александр Иванов' },
  ];

  const userVideos = [
    { id: '1', title: 'Звёздная пыль - Official Music Video' },
    { id: '2', title: 'Ночной город (Lyric Video)' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0 pt-16 lg:pt-0">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Баннерная реклама
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-2">
            Создавайте и управляйте визуальной рекламой на платформе
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold transition-all text-sm sm:text-base ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Мои баннеры</span>
            <span className="inline xs:hidden">Список</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold transition-all text-sm sm:text-base ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Создать</span>
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'list' ? (
          <MyBannerAds userId={userId} />
        ) : (
          <BannerAdManagement 
            userId={userId}
            userEmail={userEmail}
            userTracks={userTracks}
            userVideos={userVideos}
          />
        )}
      </motion.div>
    </div>
  );
}