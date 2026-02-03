/**
 * DATA CONTEXT - Глобальное хранилище данных
 * Синхронизирует данные между кабинетами артиста и админа
 * Updated: 2026-02-01
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockBanners } from '@/data/mockBanners';
import { mockPitchings } from '@/data/mockPitchings';
import { mockMarketing } from '@/data/mockMarketing';
import { mockProduction360 } from '@/data/mockProduction360';
import { mockPromoLab } from '@/data/mockPromoLab';
import { mockPitchingItems, mockDistributionBases } from '@/data/mockPitchingItems';

// ==================== ТИПЫ ====================

export type TrackStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type VideoStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type ConcertStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type NewsStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type BannerStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type PitchingStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type MarketingStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
export type Production360Status = 'pending_payment' | 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';
export type PromoLabStatus = 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';

// ==================== ПИТЧИНГ ТИПЫ ====================

export type PitchingItemStatus = 'new' | 'in_progress' | 'distributed' | 'archived';
export type PitchingContentType = 'track' | 'video' | 'press_release' | 'concert';
export type PitchingDirection = 'radio' | 'venue' | 'media' | 'label';

// Статусы получателя рассылки
export type RecipientStatus = 
  | 'sent'                    // Отправлено
  | 'opened'                  // Открыто письмо
  | 'downloaded'              // Скачан файл
  | 'responded_positive'      // Положительный ответ (взяли в ротацию)
  | 'responded_neutral'       // Нейтральный ответ (рассмотрим)
  | 'responded_negative';     // Отрицательный ответ (не подходит)

// Тип ответа от получателя
export type FeedbackType = 'positive' | 'neutral' | 'negative';

export interface DistributionBase {
  id: string;
  name: string;
  direction: PitchingDirection;
  contactsCount: number;
  description?: string;
  icon?: string;
}

export interface PitchingFile {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // mime type
  url: string;
}

// Получатель рассылки
export interface Recipient {
  id: string;
  name: string;                    // Название (радиостанция, блог, заведение)
  contactPerson?: string;          // Контактное лицо
  email: string;                   // Email
  phone?: string;                  // Телефон (опционально)
  city?: string;                   // Город
  category: string;                // Категория (федеральное, региональное и т.д.)
  status: RecipientStatus;         // Текущий статус
  feedbackDate?: string;           // Дата ответа
  feedback?: FeedbackResponse;     // Объект с ответом
}

// Ответ от получателя (обратная связь)
export interface FeedbackResponse {
  id: string;
  recipientId: string;             // ID получателя
  distributionId: string;          // ID рассылки
  itemId: number;                  // ID питчинг-материала
  type: FeedbackType;              // Тип ответа (positive/neutral/negative)
  message?: string;                // Текст комментария
  respondedAt: string;             // Дата ответа
  respondedVia: 'portal' | 'manual'; // Как получен ответ
  addedBy?: string;                // Кто добавил (для ручного ввода) - userId админа
  // Дополнительная информация
  willRotate?: boolean;            // Возьмут ли в ротацию (для радио)
  rotationStartDate?: string;      // Дата начала ротации
  playlistName?: string;           // Название плейлиста (для заведений/блогов)
  estimatedReach?: number;         // Оценочный охват
}

export interface PitchingDistribution {
  id: string;
  direction: PitchingDirection;
  baseId: string;
  baseName: string;
  filesCount: number;
  sentDate: string;
  comment?: string;
  recipientsCount: number;
  openRate?: number;
  clickRate?: number;
}

export interface PitchingItem {
  id: number;
  contentType: PitchingContentType;
  contentId: number; // ID исходного контента (track, video, etc.)
  artist: string;
  artistAvatar?: string;
  title: string;
  genre?: string;
  status: PitchingItemStatus;
  approvedDate: string; // Дата одобрения модератором
  addedToPitchingDate: string; // Дата попадания в питчинг
  files: PitchingFile[];
  distributions: PitchingDistribution[]; // История рассылок
  totalSent: number; // Общее количество отправленных рассылок
  lastDistributionDate?: string;
  userId: string;
  // Media data for preview
  coverImage?: string; // Обложка трека/видео
  thumbnailImage?: string; // Превью для видео
  audioUrl?: string; // URL аудио-файла для плеера
  videoUrl?: string; // URL видео-файла для плеера
  duration?: string; // Длительность трека/видео
  description?: string; // Описание (для пресс-релизов, концертов)
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string;
  genre: string;
  duration: string;
  uploadDate: string;
  status: TrackStatus;
  plays: number;
  likes: number;
  moderationNote?: string;
  userId: string; // ID артиста
}

export interface Video {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string; // Аватар артиста для UI
  thumbnail: string;
  videoFile?: string;
  videoUrl?: string;
  videoSource: 'file' | 'link';
  category: string;
  description: string;
  tags: string[];
  duration: string;
  uploadDate: string;
  status: VideoStatus;
  views: number;
  likes: number;
  moderationNote?: string;
  rejectionReason?: string;
  isPaid: boolean;
  price: number; // Стоимость размещения (по умолчанию ₽10,000)
  paymentStatus: 'pending' | 'paid' | 'failed'; // Статус оплаты
  genre: string;
  releaseDate: string;
  creators: {
    director: string;
    lightingDirector?: string;
    scriptwriter?: string;
    sfxArtist?: string;
    cinematographer?: string;
    editor?: string;
    producer?: string;
  };
  userId: string;
  userRole?: 'artist' | 'label'; // Роль пользователя
  subscriptionPlan?: 'basic' | 'artist_start' | 'artist_pro' | 'artist_elite'; // Тарифный план
}

export interface Concert {
  id: number;
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  type: string;
  description: string;
  banner: string;
  ticketPriceFrom: string;
  ticketPriceTo: string;
  ticketLink: string;
  status: ConcertStatus;
  rejectionReason?: string;
  views: number;
  clicks: number;
  ticketsSold: number;
  isPaid: boolean;
  createdAt: string;
  moderationNote?: string;
  userId: string;
}

export interface News {
  id: number;
  title: string;
  artist: string;
  content: string;
  preview: string;
  coverImage: string;
  date: string;
  publishDate: string;
  status: NewsStatus;
  rejectionReason?: string;
  views: number;
  likes: number;
  comments: number;
  isPaid: boolean;
  createdAt: string;
  moderationNote?: string;
  userId: string;
}

export interface Banner {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string;
  image: string; // Основное изображение баннера
  type: 'header' | 'sidebar' | 'popup' | 'footer'; // Тип размещения
  position: 'home' | 'catalog' | 'artist' | 'all'; // Страница размещения
  link?: string; // Ссылка при клике
  startDate: string; // Дата начала показа
  endDate: string; // Дата окончания показа
  status: BannerStatus;
  rejectionReason?: string;
  impressions: number; // Показы
  clicks: number; // Клики
  isPaid: boolean;
  price: number; // Стоимость размещения
  createdAt: string;
  moderationNote?: string;
  userId: string;
}

export interface Pitching {
  id: number;
  trackTitle: string;
  artist: string;
  artistAvatar?: string;
  trackCover: string; // Обложка трека
  playlistType: 'editorial' | 'curator' | 'algorithmic'; // Тип плейлиста
  playlistName: string; // Название плейлиста
  genre: string;
  mood?: string; // Настроение трека
  targetAudience?: string; // Целевая аудитория
  description: string; // Описание трека для питчинга
  spotifyLink?: string; // Ссылка на Spotify
  appleMusicLink?: string; // Ссылка на Apple Music
  status: PitchingStatus;
  rejectionReason?: string;
  expectedReach: number; // Ожидаемый охват слушателей
  actualReach: number; // Фактический охват после размещения
  playlists: number; // Количество плейлистов
  isPaid: boolean;
  price: number; // Стоимость питчинга
  submittedDate: string;
  moderationNote?: string;
  userId: string;
}

export interface Marketing {
  id: number;
  campaignName: string;
  artist: string;
  artistAvatar?: string;
  campaignType: 'smm' | 'email' | 'influencer' | 'pr' | 'ads' | 'content'; // Тип кампании
  platform: string; // Платформа (Instagram, TikTok, YouTube, Email, etc.)
  description: string;
  targetAudience: string; // Целевая аудитория
  budget: number; // Бюджет кампании
  duration: number; // Длительность в днях
  startDate: string;
  endDate: string;
  status: MarketingStatus;
  rejectionReason?: string;
  // Метрики
  expectedReach: number; // Ожидаемый охват
  actualReach: number; // Фактический охват
  engagement: number; // Вовлечённость (%)
  conversions: number; // Конверсии
  clicks: number; // Клики
  impressions: number; // Показы
  // Креативы
  creatives: string[]; // Массив URL креативов (изображения/видео)
  landingUrl?: string; // Ссылка на лендинг
  isPaid: boolean;
  price: number; // Стоимость размещения
  submittedDate: string;
  moderationNote?: string;
  userId: string;
}

export interface Production360 {
  id: number;
  projectName: string;
  artist: string;
  artistAvatar?: string;
  userRole: 'artist' | 'label'; // Роль пользователя
  subscriptionPlan: 'basic' | 'artist_start' | 'artist_pro' | 'artist_elite'; // Подписка
  // Информация о проекте
  genre: string;
  projectDescription: string; // Описание проекта
  projectGoals: string; // Цели проекта
  targetAudience: string; // Целевая аудитория
  // Услуги (что нужно)
  services: {
    concept: boolean; // Концепция и разработка
    recording: boolean; // Запись и производство
    mixing: boolean; // Сведение и мастеринг
    videoContent: boolean; // Видеоконтент
    distribution: boolean; // Дистрибуция
    promotion: boolean; // Продвижение
  };
  // Референсы и материалы
  references: string[]; // URL референсов
  existingMaterial?: string; // Описание существующих материалов
  // Финансы
  basePrice: number; // Базовая цена консультации (₽50,000)
  discount: number; // Скидка по подписке (%)
  finalPrice: number; // Финальная цена после скидки
  estimatedFullPrice?: number; // Оценочная стоимость полного цикла (после консультации)
  isPaid: boolean; // Оплачена ли консультация
  paymentStatus: 'pending' | 'paid' | 'failed'; // Статус оплаты
  // Статус
  status: Production360Status;
  rejectionReason?: string;
  moderationNote?: string;
  // Прогресс (для in_progress)
  progress?: {
    currentStage: 'concept' | 'recording' | 'mixing' | 'video' | 'distribution' | 'promotion';
    completedPercentage: number; // 0-100
    estimatedCompletion: string; // Дата завершения
  };
  // Даты
  submittedDate: string;
  approvedDate?: string;
  completedDate?: string;
  userId: string;
}

export interface PromoLab {
  id: number;
  projectName: string;
  artist: string;
  artistAvatar?: string;
  // Информация о проекте
  genre: string;
  projectDescription: string; // Описание проекта/артиста
  motivation: string; // Мотивация для сотрудничества
  portfolio: {
    spotifyLink?: string; // Spotify профиль
    appleMusicLink?: string; // Apple Music
    soundcloudLink?: string; // SoundCloud
    youtubeLink?: string; // YouTube
    instagramLink?: string; // Instagram
    otherLinks: string[]; // Другие ссылки
  };
  // Медиа материалы
  demoTracks: string[]; // URL демо-треков
  videoLinks: string[]; // Ссылки на видео
  pressKit?: string; // URL пресс-кита (PDF)
  // Опыт и достижения
  experience: string; // Описание опыта
  achievements: string[]; // Достижения (плейлисты, выступления, релизы)
  collaborations: string[]; // Коллаборации с другими артистами
  // Цели и ожидания
  goals: string; // Цели от сотрудничества
  expectedSupport: string[]; // Чего ожидает от лейбла (запись, промо, дистр., etc.)
  // Статус
  status: PromoLabStatus;
  rejectionReason?: string;
  moderationNote?: string;
  // Прогресс (для in_progress и completed)
  progress?: {
    currentStage: 'discussion' | 'contract' | 'recording' | 'production' | 'release' | 'promotion';
    description: string; // Текущий этап работы
    startDate?: string; // Дата начала сотрудничества
    completedPercentage: number; // 0-100
  };
  // Даты
  submittedDate: string;
  reviewedDate?: string;
  approvedDate?: string;
  completedDate?: string;
  userId: string;
}

export interface Content360 {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string;
  contentType: 'video360' | 'virtual_tour' | 'concert360' | 'studio_session' | 'interactive'; // Тип 360° контента
  thumbnail: string; // Превью
  video360Url: string; // URL 360° видео
  description: string;
  duration: string; // Длительность
  resolution: '4K' | '8K' | 'HD'; // Разрешение
  platform: 'YouTube360' | 'Facebook360' | 'VR' | 'Web'; // Платформа размещения
  location?: string; // Локация съёмки
  equipment: string; // Оборудование (камера)
  tags: string[]; // Теги
  status: Content360Status;
  rejectionReason?: string;
  // Метрики
  views: number; // Просмотры
  avgWatchTime: number; // Среднее время просмотра (секунды)
  interactions: number; // Взаимодействия (повороты камеры, клики)
  shares: number; // Репосты
  // Иммерсивность
  vrCompatible: boolean; // VR-совместимость
  spatialAudio: boolean; // Пространственный звук
  hotspots: number; // Количество интерактивных точек
  isPaid: boolean;
  price: number; // Стоимость размещения
  uploadDate: string;
  moderationNote?: string;
  userId: string;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'rejected';
  userId: string;
}

export interface Notification {
  id: number;
  userId: string;
  type: 'track_approved' | 'track_rejected' | 'video_approved' | 'video_rejected' | 'concert_approved' | 'concert_rejected' | 'news_approved' | 'news_rejected' | 'payment_success' | 'payment_failed' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: number; // ID связанного контента (трека, видео и т.д.)
  relatedType?: 'track' | 'video' | 'concert' | 'news';
}

// ==================== CONTEXT ====================

interface DataContextType {
  // Tracks
  tracks: Track[];
  addTrack: (track: Omit<Track, 'id' | 'uploadDate'>) => void;
  updateTrack: (id: number, updates: Partial<Track>) => void;
  deleteTrack: (id: number) => void;
  getTracksByUser: (userId: string) => Track[];
  getPendingTracks: () => Track[];

  // Videos
  videos: Video[];
  addVideo: (video: Omit<Video, 'id' | 'uploadDate'>) => void;
  updateVideo: (id: number, updates: Partial<Video>) => void;
  deleteVideo: (id: number) => void;
  getVideosByUser: (userId: string) => Video[];
  getPendingVideos: () => Video[];

  // Concerts
  concerts: Concert[];
  addConcert: (concert: Omit<Concert, 'id'>) => void;
  updateConcert: (id: number, updates: Partial<Concert>) => void;
  deleteConcert: (id: number) => void;
  getConcertsByUser: (userId: string) => Concert[];
  getPendingConcerts: () => Concert[];

  // News
  news: News[];
  addNews: (newsItem: Omit<News, 'id' | 'publishDate'>) => void;
  updateNews: (id: number, updates: Partial<News>) => void;
  deleteNews: (id: number) => void;
  getNewsByUser: (userId: string) => News[];
  getPendingNews: () => News[];

  // Banners
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id' | 'createdAt'>) => void;
  updateBanner: (id: number, updates: Partial<Banner>) => void;
  deleteBanner: (id: number) => void;
  getBannersByUser: (userId: string) => Banner[];
  getPendingBanners: () => Banner[];

  // Pitchings
  pitchings: Pitching[];
  addPitching: (pitching: Omit<Pitching, 'id' | 'submittedDate'>) => void;
  updatePitching: (id: number, updates: Partial<Pitching>) => void;
  deletePitching: (id: number) => void;
  getPitchingsByUser: (userId: string) => Pitching[];
  getPendingPitchings: () => Pitching[];

  // Marketing
  marketing: Marketing[];
  addMarketing: (marketing: Omit<Marketing, 'id' | 'submittedDate'>) => void;
  updateMarketing: (id: number, updates: Partial<Marketing>) => void;
  deleteMarketing: (id: number) => void;
  getMarketingByUser: (userId: string) => Marketing[];
  getPendingMarketing: () => Marketing[];

  // Production360
  production360: Production360[];
  addProduction360: (project: Omit<Production360, 'id' | 'submittedDate'>) => void;
  updateProduction360: (id: number, updates: Partial<Production360>) => void;
  deleteProduction360: (id: number) => void;
  getProduction360ByUser: (userId: string) => Production360[];
  getPendingProduction360: () => Production360[];

  // PromoLab
  promoLab: PromoLab[];
  addPromoLab: (project: Omit<PromoLab, 'id' | 'submittedDate'>) => void;
  updatePromoLab: (id: number, updates: Partial<PromoLab>) => void;
  deletePromoLab: (id: number) => void;
  getPromoLabByUser: (userId: string) => PromoLab[];
  getPendingPromoLab: () => PromoLab[];

  // PitchingItems (Distribution Management)
  pitchingItems: PitchingItem[];
  addPitchingItem: (item: Omit<PitchingItem, 'id' | 'addedToPitchingDate'>) => void;
  updatePitchingItem: (id: number, updates: Partial<PitchingItem>) => void;
  deletePitchingItem: (id: number) => void;
  getPitchingItemsByUser: (userId: string) => PitchingItem[];
  getPitchingItemsByStatus: (status: PitchingItemStatus) => PitchingItem[];
  addDistributionToPitchingItem: (itemId: number, distribution: PitchingDistribution) => void;

  // Distribution Bases
  distributionBases: DistributionBase[];

  // Content360
  content360: Content360[];
  addContent360: (content: Omit<Content360, 'id' | 'uploadDate'>) => void;
  updateContent360: (id: number, updates: Partial<Content360>) => void;
  deleteContent360: (id: number) => void;
  getContent360ByUser: (userId: string) => Content360[];
  getPendingContent360: () => Content360[];

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransaction: (id: number, updates: Partial<Transaction>) => void;
  getTransactionsByUser: (userId: string) => Transaction[];
  getUserBalance: (userId: string) => number;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  updateNotification: (id: number, updates: Partial<Notification>) => void;
  deleteNotification: (id: number) => void;
  getNotificationsByUser: (userId: string) => Notification[];
  getUnreadNotificationsByUser: (userId: string) => Notification[];

  // Stats
  getTotalStats: () => {
    tracks: number;
    videos: number;
    concerts: number;
    news: number;
    pendingModeration: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ==================== PROVIDER ====================

const STORAGE_KEY = 'promo_music_data';

export function DataProvider({ children }: { children: ReactNode }) {
  // Load initial data from localStorage
  const loadData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    // Первая загрузка - добавляем моковые данные для баннеров
    return {
      tracks: [],
      videos: [],
      concerts: [],
      news: [],
      banners: mockBanners, // Моковые данные баннеров
      transactions: [],
      notifications: [],
      pitchings: mockPitchings, // Моковые данные питчингов
      marketing: mockMarketing, // Моковые данные маркетинга
      production360: mockProduction360, // Моковые данные Production 360
      content360: [], // Пока пусто (360° видео - будущее)
      promoLab: mockPromoLab, // Моковые данные Promo Lab
      pitchingItems: mockPitchingItems, // Моковые данные управления рассылками
      distributionBases: mockDistributionBases, // Моковые данные баз рассылок
    };
  };

  const [data, setData] = useState(loadData);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [data]);

  // ==================== TRACKS ====================

  const addTrack = (track: Omit<Track, 'id' | 'uploadDate'>) => {
    const newTrack: Track = {
      ...track,
      id: Date.now(),
      uploadDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      tracks: [newTrack, ...prev.tracks],
    }));
  };

  const updateTrack = (id: number, updates: Partial<Track>) => {
    setData((prev: any) => ({
      ...prev,
      tracks: prev.tracks.map((track: Track) =>
        track.id === id ? { ...track, ...updates } : track
      ),
    }));
  };

  const deleteTrack = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      tracks: prev.tracks.filter((track: Track) => track.id !== id),
    }));
  };

  const getTracksByUser = (userId: string) => {
    return data.tracks.filter((track: Track) => track.userId === userId);
  };

  const getPendingTracks = () => {
    return data.tracks.filter((track: Track) => track.status === 'pending');
  };

  // ==================== VIDEOS ====================

  const addVideo = (video: Omit<Video, 'id' | 'uploadDate'>) => {
    const newVideo: Video = {
      ...video,
      id: Date.now(),
      uploadDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      videos: [newVideo, ...prev.videos],
    }));
  };

  const updateVideo = (id: number, updates: Partial<Video>) => {
    setData((prev: any) => ({
      ...prev,
      videos: prev.videos.map((video: Video) =>
        video.id === id ? { ...video, ...updates } : video
      ),
    }));
  };

  const deleteVideo = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      videos: prev.videos.filter((video: Video) => video.id !== id),
    }));
  };

  const getVideosByUser = (userId: string) => {
    return data.videos.filter((video: Video) => video.userId === userId);
  };

  const getPendingVideos = () => {
    return data.videos.filter((video: Video) => video.status === 'pending');
  };

  // ==================== CONCERTS ====================

  const addConcert = (concert: Omit<Concert, 'id'>) => {
    const newConcert: Concert = {
      ...concert,
      id: Date.now(),
    };
    setData((prev: any) => ({
      ...prev,
      concerts: [newConcert, ...prev.concerts],
    }));
  };

  const updateConcert = (id: number, updates: Partial<Concert>) => {
    setData((prev: any) => ({
      ...prev,
      concerts: prev.concerts.map((concert: Concert) =>
        concert.id === id ? { ...concert, ...updates } : concert
      ),
    }));
  };

  const deleteConcert = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      concerts: prev.concerts.filter((concert: Concert) => concert.id !== id),
    }));
  };

  const getConcertsByUser = (userId: string) => {
    return data.concerts.filter((concert: Concert) => concert.userId === userId);
  };

  const getPendingConcerts = () => {
    return data.concerts.filter((concert: Concert) => concert.status === 'pending');
  };

  // ==================== NEWS ====================

  const addNews = (newsItem: Omit<News, 'id' | 'publishDate'>) => {
    const newNews: News = {
      ...newsItem,
      id: Date.now(),
      publishDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      news: [newNews, ...prev.news],
    }));
  };

  const updateNews = (id: number, updates: Partial<News>) => {
    setData((prev: any) => ({
      ...prev,
      news: prev.news.map((newsItem: News) =>
        newsItem.id === id ? { ...newsItem, ...updates } : newsItem
      ),
    }));
  };

  const deleteNews = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      news: prev.news.filter((newsItem: News) => newsItem.id !== id),
    }));
  };

  const getNewsByUser = (userId: string) => {
    return data.news.filter((newsItem: News) => newsItem.userId === userId);
  };

  const getPendingNews = () => {
    return data.news.filter((newsItem: News) => newsItem.status === 'pending');
  };

  // ==================== BANNERS ====================

  const addBanner = (banner: Omit<Banner, 'id' | 'createdAt'>) => {
    const newBanner: Banner = {
      ...banner,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      banners: [newBanner, ...prev.banners],
    }));
  };

  const updateBanner = (id: number, updates: Partial<Banner>) => {
    setData((prev: any) => ({
      ...prev,
      banners: prev.banners.map((banner: Banner) =>
        banner.id === id ? { ...banner, ...updates } : banner
      ),
    }));
  };

  const deleteBanner = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      banners: prev.banners.filter((banner: Banner) => banner.id !== id),
    }));
  };

  const getBannersByUser = (userId: string) => {
    return (data.banners || []).filter((banner: Banner) => banner.userId === userId);
  };

  const getPendingBanners = () => {
    return (data.banners || []).filter((banner: Banner) => banner.status === 'pending');
  };

  // ==================== PITCHINGS ====================

  const addPitching = (pitching: Omit<Pitching, 'id' | 'submittedDate'>) => {
    const newPitching: Pitching = {
      ...pitching,
      id: Date.now(),
      submittedDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      pitchings: [newPitching, ...prev.pitchings],
    }));
  };

  const updatePitching = (id: number, updates: Partial<Pitching>) => {
    setData((prev: any) => ({
      ...prev,
      pitchings: prev.pitchings.map((pitching: Pitching) =>
        pitching.id === id ? { ...pitching, ...updates } : pitching
      ),
    }));
  };

  const deletePitching = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      pitchings: prev.pitchings.filter((pitching: Pitching) => pitching.id !== id),
    }));
  };

  const getPitchingsByUser = (userId: string) => {
    return (data.pitchings || []).filter((pitching: Pitching) => pitching.userId === userId);
  };

  const getPendingPitchings = () => {
    return (data.pitchings || []).filter((pitching: Pitching) => pitching.status === 'pending');
  };

  // ==================== MARKETING ====================

  const addMarketing = (marketing: Omit<Marketing, 'id' | 'submittedDate'>) => {
    const newMarketing: Marketing = {
      ...marketing,
      id: Date.now(),
      submittedDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      marketing: [newMarketing, ...prev.marketing],
    }));
  };

  const updateMarketing = (id: number, updates: Partial<Marketing>) => {
    setData((prev: any) => ({
      ...prev,
      marketing: prev.marketing.map((marketing: Marketing) =>
        marketing.id === id ? { ...marketing, ...updates } : marketing
      ),
    }));
  };

  const deleteMarketing = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      marketing: prev.marketing.filter((marketing: Marketing) => marketing.id !== id),
    }));
  };

  const getMarketingByUser = (userId: string) => {
    return (data.marketing || []).filter((marketing: Marketing) => marketing.userId === userId);
  };

  const getPendingMarketing = () => {
    return (data.marketing || []).filter((marketing: Marketing) => marketing.status === 'pending');
  };

  // ==================== PRODUCTION360 ====================

  const addProduction360 = (project: Omit<Production360, 'id' | 'submittedDate'>) => {
    const newProject: Production360 = {
      ...project,
      id: Date.now(),
      submittedDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      production360: [newProject, ...prev.production360],
    }));
  };

  const updateProduction360 = (id: number, updates: Partial<Production360>) => {
    setData((prev: any) => ({
      ...prev,
      production360: prev.production360.map((project: Production360) =>
        project.id === id ? { ...project, ...updates } : project
      ),
    }));
  };

  const deleteProduction360 = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      production360: prev.production360.filter((project: Production360) => project.id !== id),
    }));
  };

  const getProduction360ByUser = (userId: string) => {
    return (data.production360 || []).filter((project: Production360) => project.userId === userId);
  };

  const getPendingProduction360 = () => {
    return (data.production360 || []).filter((project: Production360) => project.status === 'pending');
  };

  // ==================== PROMOLAB ====================

  const addPromoLab = (project: Omit<PromoLab, 'id' | 'submittedDate'>) => {
    const newProject: PromoLab = {
      ...project,
      id: Date.now(),
      submittedDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      promoLab: [newProject, ...prev.promoLab],
    }));
  };

  const updatePromoLab = (id: number, updates: Partial<PromoLab>) => {
    setData((prev: any) => ({
      ...prev,
      promoLab: prev.promoLab.map((project: PromoLab) =>
        project.id === id ? { ...project, ...updates } : project
      ),
    }));
  };

  const deletePromoLab = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      promoLab: prev.promoLab.filter((project: PromoLab) => project.id !== id),
    }));
  };

  const getPromoLabByUser = (userId: string) => {
    return (data.promoLab || []).filter((project: PromoLab) => project.userId === userId);
  };

  const getPendingPromoLab = () => {
    return (data.promoLab || []).filter((project: PromoLab) => project.status === 'pending');
  };

  // ==================== PITCHING ITEMS ====================

  const addPitchingItem = (item: Omit<PitchingItem, 'id' | 'addedToPitchingDate'>) => {
    const newItem: PitchingItem = {
      ...item,
      id: Date.now(),
      addedToPitchingDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      pitchingItems: [newItem, ...prev.pitchingItems],
    }));
  };

  const updatePitchingItem = (id: number, updates: Partial<PitchingItem>) => {
    setData((prev: any) => ({
      ...prev,
      pitchingItems: prev.pitchingItems.map((item: PitchingItem) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const deletePitchingItem = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      pitchingItems: prev.pitchingItems.filter((item: PitchingItem) => item.id !== id),
    }));
  };

  const getPitchingItemsByUser = (userId: string) => {
    return (data.pitchingItems || []).filter((item: PitchingItem) => item.userId === userId);
  };

  const getPitchingItemsByStatus = (status: PitchingItemStatus) => {
    return (data.pitchingItems || []).filter((item: PitchingItem) => item.status === status);
  };

  const addDistributionToPitchingItem = (itemId: number, distribution: PitchingDistribution) => {
    setData((prev: any) => ({
      ...prev,
      pitchingItems: prev.pitchingItems.map((item: PitchingItem) =>
        item.id === itemId ? { ...item, distributions: [...item.distributions, distribution] } : item
      ),
    }));
  };

  // ==================== DISTRIBUTION BASES ====================

  const distributionBases: DistributionBase[] = [
    {
      id: '1',
      name: 'Radio Station A',
      direction: 'radio',
      contactsCount: 5,
      description: 'A popular radio station with a large audience.',
      icon: 'radio-icon.png',
    },
    {
      id: '2',
      name: 'Venue B',
      direction: 'venue',
      contactsCount: 3,
      description: 'A concert venue with a diverse crowd.',
      icon: 'venue-icon.png',
    },
    {
      id: '3',
      name: 'Media Outlet C',
      direction: 'media',
      contactsCount: 10,
      description: 'A media outlet with a wide reach.',
      icon: 'media-icon.png',
    },
    {
      id: '4',
      name: 'Label D',
      direction: 'label',
      contactsCount: 7,
      description: 'A record label with a strong network.',
      icon: 'label-icon.png',
    },
  ];

  // ==================== CONTENT360 ====================

  const addContent360 = (content: Omit<Content360, 'id' | 'uploadDate'>) => {
    const newContent: Content360 = {
      ...content,
      id: Date.now(),
      uploadDate: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      content360: [newContent, ...prev.content360],
    }));
  };

  const updateContent360 = (id: number, updates: Partial<Content360>) => {
    setData((prev: any) => ({
      ...prev,
      content360: prev.content360.map((content: Content360) =>
        content.id === id ? { ...content, ...updates } : content
      ),
    }));
  };

  const deleteContent360 = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      content360: prev.content360.filter((content: Content360) => content.id !== id),
    }));
  };

  const getContent360ByUser = (userId: string) => {
    return (data.content360 || []).filter((content: Content360) => content.userId === userId);
  };

  const getPendingContent360 = () => {
    return (data.content360 || []).filter((content: Content360) => content.status === 'pending');
  };

  // ==================== TRANSACTIONS ====================

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
  };

  const updateTransaction = (id: number, updates: Partial<Transaction>) => {
    setData((prev: any) => ({
      ...prev,
      transactions: prev.transactions.map((transaction: Transaction) =>
        transaction.id === id ? { ...transaction, ...updates } : transaction
      ),
    }));
  };

  const getTransactionsByUser = (userId: string) => {
    return data.transactions.filter((transaction: Transaction) => transaction.userId === userId);
  };

  const getUserBalance = (userId: string) => {
    const userTransactions = getTransactionsByUser(userId);
    return userTransactions.reduce((balance, transaction) => {
      if (transaction.status === 'completed') {
        return balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }
      return balance;
    }, 0);
  };

  // ==================== NOTIFICATIONS ====================

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setData((prev: any) => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
    }));
  };

  const updateNotification = (id: number, updates: Partial<Notification>) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((notification: Notification) =>
        notification.id === id ? { ...notification, ...updates } : notification
      ),
    }));
  };

  const deleteNotification = (id: number) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.filter((notification: Notification) => notification.id !== id),
    }));
  };

  const getNotificationsByUser = (userId: string) => {
    return data.notifications.filter((notification: Notification) => notification.userId === userId);
  };

  const getUnreadNotificationsByUser = (userId: string) => {
    return data.notifications.filter((notification: Notification) => notification.userId === userId && !notification.read);
  };

  // ==================== STATS ====================

  const getTotalStats = () => {
    return {
      tracks: data.tracks.length,
      videos: data.videos.length,
      concerts: data.concerts.length,
      news: data.news.length,
      pendingModeration: 
        getPendingTracks().length +
        getPendingVideos().length +
        getPendingConcerts().length +
        getPendingNews().length,
    };
  };

  const value: DataContextType = {
    tracks: data.tracks || [],
    addTrack,
    updateTrack,
    deleteTrack,
    getTracksByUser,
    getPendingTracks,

    videos: data.videos || [],
    addVideo,
    updateVideo,
    deleteVideo,
    getVideosByUser,
    getPendingVideos,

    concerts: data.concerts || [],
    addConcert,
    updateConcert,
    deleteConcert,
    getConcertsByUser,
    getPendingConcerts,

    news: data.news || [],
    addNews,
    updateNews,
    deleteNews,
    getNewsByUser,
    getPendingNews,

    banners: data.banners || [],
    addBanner,
    updateBanner,
    deleteBanner,
    getBannersByUser,
    getPendingBanners,

    pitchings: data.pitchings || [],
    addPitching,
    updatePitching,
    deletePitching,
    getPitchingsByUser,
    getPendingPitchings,

    marketing: data.marketing || [],
    addMarketing,
    updateMarketing,
    deleteMarketing,
    getMarketingByUser,
    getPendingMarketing,

    production360: data.production360 || [],
    addProduction360,
    updateProduction360,
    deleteProduction360,
    getProduction360ByUser,
    getPendingProduction360,

    promoLab: data.promoLab || [],
    addPromoLab,
    updatePromoLab,
    deletePromoLab,
    getPromoLabByUser,
    getPendingPromoLab,

    pitchingItems: data.pitchingItems || [],
    addPitchingItem,
    updatePitchingItem,
    deletePitchingItem,
    getPitchingItemsByUser,
    getPitchingItemsByStatus,
    addDistributionToPitchingItem,

    distributionBases: data.distributionBases || mockDistributionBases,

    content360: data.content360 || [],
    addContent360,
    updateContent360,
    deleteContent360,
    getContent360ByUser,
    getPendingContent360,

    transactions: data.transactions || [],
    addTransaction,
    updateTransaction,
    getTransactionsByUser,
    getUserBalance,

    notifications: data.notifications || [],
    addNotification,
    updateNotification,
    deleteNotification,
    getNotificationsByUser,
    getUnreadNotificationsByUser,

    getTotalStats,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ==================== HOOK ====================

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    // В dev режиме показываем подробную ошибку
    if (import.meta.env.DEV) {
      console.error('❌ useData called outside of DataProvider!');
      console.trace('Call stack:');
    }
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

// Хелпер для проверки наличия контекста (без ошибки)
export function useDataSafe() {
  const context = useContext(DataContext);
  return context || null;
}

// ==================== ФИНАНСОВЫЕ КОНСТАНТЫ ====================
// Re-export from /src/constants/financial.ts для обратной совместимости

export {
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_DISCOUNTS,
  BANNER_PRICES,
  BANNER_PERIOD_DISCOUNTS,
  PLAYLIST_PITCHING_PRICES,
  MARKETING_PRICES,
  PITCHING_PRICES,
  TESTING_PRICES,
  DISCOVERY_PRICES,
  VENUE_PRICES,
  REVENUE_SHARE_COMMISSION,
  calculatePrice,
  calculateBannerPrice,
} from '@/constants/financial';