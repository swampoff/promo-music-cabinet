/**
 * SUBMIT BANNER AD - SQL VERSION
 * Отправка баннера на модерацию с использованием PostgreSQL
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Цены за день для каждого типа баннера (в рублях)
export const BANNER_PRICES = {
  top_banner: 15000,      // Главный баннер 1920x400
  sidebar_large: 12000,   // Боковой большой 300x600
  sidebar_small: 8000,    // Боковой малый 300x250
};

/**
 * Рассчитывает стоимость размещения баннера
 */
function calculateBannerPrice(bannerType: string, durationDays: number): number {
  const pricePerDay = BANNER_PRICES[bannerType as keyof typeof BANNER_PRICES];
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
function generateBannerId(): string {
  return `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Отправляет email-уведомление администратору о новой заявке
 */
async function notifyAdminNewBannerAd(bannerData: any) {
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

interface SubmitBannerAdParams {
  user_id: string;
  user_email: string;
  campaign_name: string;
  banner_type: 'top_banner' | 'sidebar_large' | 'sidebar_small';
  image_url: string;
  target_url: string;
  duration_days: number;
  dimensions: string;
}

/**
 * Основная функция отправки баннера на модерацию (SQL версия)
 */
export async function submitBannerAd(params: SubmitBannerAdParams) {
  const {
    user_id,
    user_email,
    campaign_name,
    banner_type,
    image_url,
    target_url,
    duration_days,
    dimensions,
  } = params;

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

    // Создание Supabase клиента
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Создание записи баннера в базе данных
    const { data, error } = await supabase
      .from('banner_ads')
      .insert({
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
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      throw new Error(`Failed to create banner: ${error.message}`);
    }

    // Уведомление администратору
    await notifyAdminNewBannerAd(data);

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
 * Получить все баннеры пользователя
 */
export async function getUserBannerAds(userId: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('banner_ads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user banners:', error);
      throw new Error(`Failed to fetch banners: ${error.message}`);
    }

    return data || [];

  } catch (error) {
    console.error('❌ Error in getUserBannerAds:', error);
    return [];
  }
}

/**
 * Получить все баннеры (для админов)
 */
export async function getAllBannerAds() {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('banner_ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching all banners:', error);
      throw new Error(`Failed to fetch banners: ${error.message}`);
    }

    return data || [];

  } catch (error) {
    console.error('❌ Error in getAllBannerAds:', error);
    return [];
  }
}

/**
 * Получить статистику баннеров пользователя
 */
export async function getUserBannerStats(userId: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Используем view с рассчитанными метриками
    const { data, error } = await supabase
      .from('banner_ads_with_stats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user banner stats:', error);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    // Агрегированная статистика
    const stats = {
      total_banners: data?.length || 0,
      total_views: data?.reduce((sum, b) => sum + (b.views || 0), 0) || 0,
      total_clicks: data?.reduce((sum, b) => sum + (b.clicks || 0), 0) || 0,
      total_spent: data?.reduce((sum, b) => sum + (b.price || 0), 0) || 0,
      average_ctr: 0,
      active_banners: data?.filter(b => b.status === 'active').length || 0,
    };

    if (stats.total_views > 0) {
      stats.average_ctr = (stats.total_clicks / stats.total_views) * 100;
    }

    return {
      banners: data || [],
      stats,
    };

  } catch (error) {
    console.error('❌ Error in getUserBannerStats:', error);
    return {
      banners: [],
      stats: {
        total_banners: 0,
        total_views: 0,
        total_clicks: 0,
        total_spent: 0,
        average_ctr: 0,
        active_banners: 0,
      },
    };
  }
}
