/**
 * DASHBOARD STATS HOOK
 * Централизованная логика для статистики админского дашборда
 */

import { useData } from '@/contexts/DataContext';
import { useState, useEffect } from 'react';

export interface DashboardStats {
  // Пользователи
  totalUsers: number;
  activeArtists: number;
  usersGrowth: string;
  artistsGrowth: string;
  
  // Модерация
  pendingTracks: number;
  pendingVideos: number;
  pendingConcerts: number;
  pendingNews: number;
  totalPending: number;
  
  // Модерация за сегодня
  tracksModeratedToday: number;
  videosModeratedToday: number;
  concertsModeratedToday: number;
  newsModeratedToday: number;
  
  // Финансы
  monthlyRevenue: number;
  revenueGrowth: string;
  totalTransactions: number;
  
  // Поддержка
  openTickets: number;
  ticketsToday: number;
  ticketsGrowth: string;
}

export function useDashboardStats() {
  const { 
    tracks, 
    videos, 
    concerts, 
    news,
    transactions,
    getPendingTracks,
    getPendingVideos,
    getPendingConcerts,
    getPendingNews
  } = useData();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 12847,
    activeArtists: 8234,
    usersGrowth: '+12.5%',
    artistsGrowth: '+8.2%',
    
    pendingTracks: 0,
    pendingVideos: 0,
    pendingConcerts: 0,
    pendingNews: 0,
    totalPending: 0,
    
    tracksModeratedToday: 0,
    videosModeratedToday: 0,
    concertsModeratedToday: 0,
    newsModeratedToday: 0,
    
    monthlyRevenue: 0,
    revenueGrowth: '+15.3%',
    totalTransactions: 0,
    
    openTickets: 12,
    ticketsToday: 4,
    ticketsGrowth: '+33%',
  });
  
  useEffect(() => {
    // Получаем pending контент
    const pendingTracks = getPendingTracks();
    const pendingVideos = getPendingVideos();
    const pendingConcerts = getPendingConcerts();
    const pendingNews = getPendingNews();
    
    // Считаем модерацию за сегодня
    const today = new Date().toISOString().split('T')[0];
    
    const tracksModeratedToday = tracks.filter(t => 
      t.uploadDate.startsWith(today) && t.status !== 'draft'
    ).length;
    
    const videosModeratedToday = videos.filter(v => 
      v.uploadDate.startsWith(today) && v.status !== 'draft'
    ).length;
    
    const concertsModeratedToday = concerts.filter(c => 
      c.createdAt.startsWith(today) && c.status !== 'draft'
    ).length;
    
    const newsModeratedToday = news.filter(n => 
      n.createdAt.startsWith(today) && n.status !== 'draft'
    ).length;
    
    // Считаем доход за месяц
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        t.type === 'income' && 
        t.status === 'completed' &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    });
    
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Обновляем статистику
    setStats(prev => ({
      ...prev,
      pendingTracks: pendingTracks.length,
      pendingVideos: pendingVideos.length,
      pendingConcerts: pendingConcerts.length,
      pendingNews: pendingNews.length,
      totalPending: pendingTracks.length + pendingVideos.length + pendingConcerts.length + pendingNews.length,
      
      tracksModeratedToday,
      videosModeratedToday,
      concertsModeratedToday,
      newsModeratedToday,
      
      monthlyRevenue,
      totalTransactions: monthlyTransactions.length,
    }));
  }, [tracks, videos, concerts, news, transactions]);
  
  return stats;
}

/**
 * RECENT ACTIVITY HOOK
 * Последняя активность на платформе
 */

export interface ActivityItem {
  id: string;
  type: 'track' | 'video' | 'concert' | 'news' | 'user' | 'support';
  action: string;
  user: string;
  title: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function useRecentActivity(limit: number = 10): ActivityItem[] {
  const { tracks, videos, concerts, news } = useData();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  
  useEffect(() => {
    const items: ActivityItem[] = [];
    
    // Треки
    tracks.slice(0, 5).forEach(track => {
      items.push({
        id: `track-${track.id}`,
        type: 'track',
        action: track.status === 'approved' ? 'Трек одобрен' : 'Новый трек на модерацию',
        user: track.artist,
        title: track.title,
        time: getRelativeTime(track.uploadDate),
        status: track.status as any,
      });
    });
    
    // Видео
    videos.slice(0, 5).forEach(video => {
      items.push({
        id: `video-${video.id}`,
        type: 'video',
        action: video.status === 'approved' ? 'Видео одобрено' : 'Новое видео на модерацию',
        user: video.artist,
        title: video.title,
        time: getRelativeTime(video.uploadDate),
        status: video.status as any,
      });
    });
    
    // Концерты
    concerts.slice(0, 5).forEach(concert => {
      items.push({
        id: `concert-${concert.id}`,
        type: 'concert',
        action: concert.status === 'approved' ? 'Концерт одобрен' : 'Новый концерт на модерацию',
        user: concert.artist,
        title: concert.title,
        time: getRelativeTime(concert.createdAt),
        status: concert.status as any,
      });
    });
    
    // Новости
    news.slice(0, 5).forEach(newsItem => {
      items.push({
        id: `news-${newsItem.id}`,
        type: 'news',
        action: newsItem.status === 'approved' ? 'Новость одобрена' : 'Новая новость на модерацию',
        user: newsItem.artist,
        title: newsItem.title,
        time: getRelativeTime(newsItem.createdAt),
        status: newsItem.status as any,
      });
    });
    
    // Сортируем по времени и берем первые N
    const sorted = items
      .sort((a, b) => {
        // Простая сортировка - в реальности нужно использовать timestamp
        return a.time.localeCompare(b.time);
      })
      .slice(0, limit);
    
    setActivity(sorted);
  }, [tracks, videos, concerts, news, limit]);
  
  return activity;
}

/**
 * Утилита для вычисления относительного времени
 */
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} ${getDeclension(diffMins, 'минута', 'минуты', 'минут')} назад`;
  if (diffHours < 24) return `${diffHours} ${getDeclension(diffHours, 'час', 'часа', 'часов')} назад`;
  if (diffDays < 30) return `${diffDays} ${getDeclension(diffDays, 'день', 'дня', 'дней')} назад`;
  
  return date.toLocaleDateString('ru-RU');
}

/**
 * Склонение русских слов
 */
function getDeclension(n: number, one: string, two: string, five: string): string {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}
