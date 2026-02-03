/**
 * FINANCIAL CONSTANTS
 * Все финансовые константы и функции расчёта
 * Extracted from DataContext for better maintainability
 */

// ==================== ПОДПИСКИ ====================

// Подписки для артистов
export const SUBSCRIPTION_PRICES = {
  spark: 2500,
  start: 10000,
  pro: 35000,
  elite: 100000,
  label: 250000, // минимум, реально индивидуально
};

// Скидки по подпискам (на все услуги)
export const SUBSCRIPTION_DISCOUNTS = {
  none: 0,    // Без подписки
  spark: 0.20, // -20%
  start: 0.30, // -30%
  pro: 0.40,   // -40%
  elite: 0.50, // -50%
  label: 0.60, // -60%
};

// ==================== БАННЕРЫ ====================

// Баннерная реклама (7 дней, базовые цены без подписки)
export const BANNER_PRICES = {
  billboard_main: 15000,        // #1 Billboard Главная TOP (970×250)
  leaderboard_main: 10000,      // #2 Leaderboard Главная (728×90)
  category_top: 7000,           // #3 Category Top (728×90)
  sidebar_half_page: 8000,      // #4 Sidebar Half Page (300×600)
  in_feed_rectangle: 5000,      // #5 In-Feed Rectangle (300×250)
  profile_top: 6000,            // #6 Profile Top (728×90)
  sidebar_rectangle: 5000,      // #7 Sidebar Rectangle (336×280)
  mobile_large: 4000,           // #8 Mobile Large (320×100)
  mobile_banner: 3000,          // #9 Mobile Banner (320×50)
};

// Скидки за период (баннеры)
export const BANNER_PERIOD_DISCOUNTS = {
  1: 0,      // 1 день: +20% к дневной
  3: 0.10,   // 3 дня: -10%
  7: 0,      // 7 дней: базовая цена
  14: 0.15,  // 14 дней: -15%
  30: 0.25,  // 30 дней: -25%
  90: 0.35,  // 90 дней: -35%
};

// ==================== ПЛЕЙЛИСТЫ ====================

// Плейлист-питчинг (1 трек, базовые цены)
export const PLAYLIST_PITCHING_PRICES = {
  yandex: 5000,      // Яндекс.Музыка
  vk: 5000,          // VK Музыка
  zvuk_mts: 5000,    // Звук/МТС (вместо Spotify)
  all: 13000,        // Пакет Single Boost (все 3)
  ep: 30000,         // EP Campaign (3 трека на все)
  album: 70000,      // Album Domination (8+ треков)
};

// ==================== МАРКЕТИНГ ====================

// Маркетинговые инструменты
export const MARKETING_PRICES = {
  // Автопостинг
  autopost_1_social: 3000,     // 1 соцсеть/мес
  autopost_5_socials: 10000,   // 5 соцсетей/мес
  autopost_all: 15000,         // Все соцсети/мес
  stories_reels: 5000,         // Stories/Reels (10 шт)
  
  // Email
  email_platform_10k: 15000,   // Рассылка 10k юзеров (1 раз)
  email_platform_50k: 50000,   // Рассылка 50k юзеров (1 раз)
  
  // SMS и Push
  sms_1000: 10000,             // 1,000 SMS
  sms_10000: 70000,            // 10,000 SMS
  push_10000: 14000,           // 10,000 Push
  
  // Featured
  featured_main_3days: 20000,  // Featured на главной (3 дня)
};

// ==================== ПИТЧИНГ ====================

// Питчинг (радио, лейблы, sync, инфлюенсеры, ТВ)
export const PITCHING_PRICES = {
  // Радио
  radio_federal: 80000,        // Федеральное FM (15 станций)
  radio_regional: 40000,       // Региональное FM (80 станций)
  radio_thematic: 30000,       // Тематическое FM (30 станций)
  radio_online: 35000,         // Онлайн-радио ТОП (50)
  
  // Лейблы
  labels_major: 150000,        // Major labels (5)
  labels_indie_large: 80000,   // Крупные инди (20)
  labels_medium: 40000,        // Средние (50)
  labels_all_premium: 350000,  // Все (Премиум пакет)
  
  // Sync Licensing
  sync_agencies: 50000,        // Рекламные агентства (70)
  sync_tv: 60000,              // ТВ и стриминги (40)
  sync_brands: 80000,          // Бренды прямо (80)
  sync_all_premium: 250000,    // Все (Премиум)
  
  // Инфлюенсеры
  influencers_youtube: 25000,  // YouTube (80 блогеров)
  influencers_vk: 20000,       // VK паблики (150)
  influencers_tiktok: 30000,   // TikTok (50)
  influencers_all: 80000,      // Все платформы
  
  // ТВ-шоу
  tv_music_shows: 100000,      // Музыкальные ТВ-шоу (15)
  tv_online: 60000,            // Онлайн-ТВ шоу
  tv_all: 150000,              // Все категории
};

// ==================== ТЕСТИРОВАНИЕ ====================

// Тестирование треков
export const TESTING_PRICES = {
  track_test: 1000,  // Тестирование любого трека
};

// ==================== ФАЗА 3 ====================

// Фаза 3: promo.discovery (отбор в каталог заведений)
export const DISCOVERY_PRICES = {
  none: 50000,     // Без подписки
  spark: 25000,    // Spark
  start: 15000,    // Start
  pro: 0,          // Pro: ВКЛЮЧЕНО (4 заявки/год)
  elite: 0,        // Elite: ВКЛЮЧЕНО (безлимит)
  label: 0,        // Label: ВКЛЮЧЕНО (безлимит)
};

// Фаза 3: Тарифы для заведений
export const VENUE_PRICES = {
  basic: 5000,         // Business Basic
  pro: 15000,          // Business Pro
  enterprise: 50000,   // Business Enterprise (минимум)
};

// Фаза 3: Комиссия платформы от revenue share
export const REVENUE_SHARE_COMMISSION = {
  none: 0.60,      // Без подписки: платформа берёт 60%, артист получает 40%
  spark: 0.45,     // Spark: 45% / 55%
  start: 0.35,     // Start: 35% / 65%
  pro: 0.25,       // Pro: 25% / 75%
  elite: 0.15,     // Elite: 15% / 85%
  label: 0.10,     // Label: 10% / 90%
};

// ==================== ФУНКЦИИ РАСЧЁТА ====================

// Функция расчёта цены с учётом подписки
export function calculatePrice(
  basePrice: number, 
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite' | 'label'
): number {
  const discount = SUBSCRIPTION_DISCOUNTS[subscription] || 0;
  return Math.round(basePrice * (1 - discount));
}

// Функция расчёта цены баннера с учётом подписки и периода
export function calculateBannerPrice(
  bannerType: keyof typeof BANNER_PRICES,
  days: 1 | 3 | 7 | 14 | 30 | 90,
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite' | 'label'
): number {
  const basePrice = BANNER_PRICES[bannerType];
  const basePricePerDay = basePrice / 7; // базовая цена за 7 дней
  
  let priceForPeriod: number;
  if (days === 1) {
    priceForPeriod = basePricePerDay * 1.2; // +20% за 1 день
  } else {
    priceForPeriod = (basePricePerDay * days) * (1 - (BANNER_PERIOD_DISCOUNTS[days] || 0));
  }
  
  const subscriptionDiscount = SUBSCRIPTION_DISCOUNTS[subscription] || 0;
  return Math.round(priceForPeriod * (1 - subscriptionDiscount));
}