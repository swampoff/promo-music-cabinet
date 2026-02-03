/**
 * SUBMIT BANNER AD - ОТПРАВКА БАННЕРА НА МОДЕРАЦИЮ
 * Создает новую заявку на размещение баннерной рекламы
 */

import * as kv from './kv_store.tsx';

// Цены за день для каждого типа баннера (в рублях)
const BANNER_PRICES = {
  top_banner: 15000,      // Главный баннер 1920x400
  sidebar_large: 12000,   // Боковой большой 300x600
  sidebar_small: 8000,    // Боковой малый 300x250
};

/**
 * Рассчитывает стоимость размещения баннера
 * @param {string} bannerType - Тип баннера
 * @param {number} durationDays - Длительность размещения в днях
 * @returns {number} Итоговая стоимость
 */
function calculateBannerPrice(bannerType, durationDays) {
  const pricePerDay = BANNER_PRICES[bannerType];
  if (!pricePerDay) {
    throw new Error(`Unknown banner type: ${bannerType}`);
  }

  const basePrice = pricePerDay * durationDays;

  // Скидки за длительность
  let discount = 0;
  if (durationDays >= 30) {
    discount = 0.15; // 15% скидка за 30 дней
  } else if (durationDays >= 14) {
    discount = 0.05; // 5% скидка за 14 дней
  }

  const finalPrice = basePrice * (1 - discount);
  return Math.round(finalPrice);
}

/**
 * Генерирует уникальный ID для баннера
 */
function generateBannerId() {
  return `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Отправляет email-уведомление администратору о новой заявке
 * (В прототипе - заглушка)
 */
async function notifyAdminNewBannerAd(bannerData) {
  console.log('📧 Email notification to admin:', {
    subject: `Новая заявка на баннер: ${bannerData.campaign_name}`,
    campaign: bannerData.campaign_name,
    type: bannerData.banner_type,
    user: bannerData.user_email,
    price: bannerData.price,
    image: bannerData.image_url,
  });
  
  // В реальном приложении здесь будет отправка email через Supabase Edge Functions
  // await supabase.functions.invoke('send-email', { ... });
}

/**
 * Основная функция отправки баннера на модерацию
 * 
 * @param {Object} params - Параметры баннерной кампании
 * @param {string} params.user_id - ID пользователя
 * @param {string} params.user_email - Email пользователя
 * @param {string} params.campaign_name - Название кампании
 * @param {string} params.banner_type - Тип баннера (top_banner, sidebar_large, sidebar_small)
 * @param {string} params.image_url - URL изображения баннера
 * @param {string} params.target_url - Целевой URL баннера
 * @param {number} params.duration_days - Длительность размещения в днях
 * @param {string} params.dimensions - Размеры баннера (например, "1920x400")
 * @returns {Promise<Object>} Результат операции с bannerId
 */
export async function submitBannerAd({
  user_id,
  user_email,
  campaign_name,
  banner_type,
  image_url,
  target_url,
  duration_days,
  dimensions,
}) {
  try {
    // Валидация входных данных
    if (!user_id || !user_email) {
      throw new Error('User authentication required');
    }

    if (!campaign_name || campaign_name.trim().length === 0) {
      throw new Error('Campaign name is required');
    }

    if (!banner_type || !BANNER_PRICES[banner_type]) {
      throw new Error('Invalid banner type');
    }

    if (!image_url || image_url.trim().length === 0) {
      throw new Error('Image URL is required');
    }

    // Проверка, что это валидный HTTP URL из Supabase Storage
    if (!image_url.startsWith('http://') && !image_url.startsWith('https://')) {
      throw new Error('Valid image URL is required');
    }

    if (!target_url || target_url.trim().length === 0) {
      throw new Error('Target URL is required');
    }

    if (!duration_days || duration_days < 1 || duration_days > 90) {
      throw new Error('Duration must be between 1 and 90 days');
    }

    // Расчет стоимости
    const price = calculateBannerPrice(banner_type, duration_days);

    // Генерация ID
    const bannerId = generateBannerId();

    // Создание записи баннера
    const bannerData = {
      id: bannerId,
      user_id,
      user_email,
      campaign_name: campaign_name.trim(),
      banner_type,
      dimensions: dimensions || 'auto',
      image_url,
      target_url,
      duration_days,
      price,
      status: 'pending_moderation',
      views: 0,
      clicks: 0,
      rejection_reason: null,
      admin_notes: null,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Сохранение в KV store
    await kv.set(`banner_ad:${bannerId}`, bannerData);

    // Добавление в индекс пользователя
    const userBannerIds = await kv.get(`user_banner_ads:${user_id}`) || [];
    userBannerIds.push(bannerId);
    await kv.set(`user_banner_ads:${user_id}`, userBannerIds);

    // Добавление в глобальный индекс (для админов)
    const allBannerIds = await kv.get('all_banner_ads') || [];
    allBannerIds.push(bannerId);
    await kv.set('all_banner_ads', allBannerIds);

    // Уведомление администратору
    await notifyAdminNewBannerAd(bannerData);

    console.log('✅ Banner ad submitted successfully:', bannerId);

    return {
      success: true,
      bannerId,
      price,
      status: 'pending_moderation',
      message: 'Баннерная кампания успешно отправлена на модерацию',
    };

  } catch (error) {
    console.error('❌ Error submitting banner ad:', error);
    throw error;
  }
}

/**
 * Получает баннеры пользователя
 */
export async function getUserBannerAds(userId) {
  try {
    const bannerIds = await kv.get(`user_banner_ads:${userId}`) || [];
    
    if (bannerIds.length === 0) {
      return [];
    }

    const banners = await kv.mget(bannerIds.map(id => `banner_ad:${id}`));
    return banners.filter(banner => banner !== null);
    
  } catch (error) {
    console.error('❌ Error getting user banner ads:', error);
    return [];
  }
}

/**
 * Получает все баннеры (для админов)
 */
export async function getAllBannerAds() {
  try {
    const bannerIds = await kv.get('all_banner_ads') || [];
    
    if (bannerIds.length === 0) {
      return [];
    }

    const banners = await kv.mget(bannerIds.map(id => `banner_ad:${id}`));
    return banners.filter(banner => banner !== null);
    
  } catch (error) {
    console.error('❌ Error getting all banner ads:', error);
    return [];
  }
}

export { BANNER_PRICES };