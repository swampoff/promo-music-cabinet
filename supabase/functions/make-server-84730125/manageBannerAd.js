/**
 * MANAGE BANNER AD - УПРАВЛЕНИЕ БАННЕРОМ (АДМИН)
 * Функции для модерации и управления баннерной рекламой
 */

import * as kv from './kv_store.tsx';

/**
 * Отправляет email-уведомление пользователю
 * (В прототипе - заглушка)
 */
async function notifyUser(email, subject, data) {
  console.log('📧 Email notification to user:', {
    to: email,
    subject,
    data,
  });
  
  // В реальном приложении здесь будет отправка email
  // await supabase.functions.invoke('send-email', { to: email, subject, ...data });
}

/**
 * Одобряет баннер и переводит его в статус ожидания оплаты
 * 
 * @param {string} bannerId - ID баннера
 * @param {string} adminNotes - Заметки администратора (опционально)
 * @returns {Promise<Object>} Обновленные данные баннера
 */
async function approveBannerAd(bannerId, adminNotes = null) {
  const banner = await kv.get(`banner_ad:${bannerId}`);
  
  if (!banner) {
    throw new Error('Banner not found');
  }

  if (banner.status !== 'pending_moderation') {
    throw new Error(`Cannot approve banner with status: ${banner.status}`);
  }

  // Обновление статуса
  const updatedBanner = {
    ...banner,
    status: 'payment_pending',
    admin_notes: adminNotes,
    updated_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
  };

  await kv.set(`banner_ad:${bannerId}`, updatedBanner);

  // Уведомление пользователю
  await notifyUser(banner.user_email, 'Баннер одобрен - требуется оплата', {
    campaign_name: banner.campaign_name,
    price: banner.price,
    duration_days: banner.duration_days,
    message: 'Ваша баннерная кампания успешно прошла модерацию. Для активации необходимо произвести оплату.',
  });

  console.log('✅ Banner approved:', bannerId);

  return updatedBanner;
}

/**
 * Отклоняет баннер
 * 
 * @param {string} bannerId - ID баннера
 * @param {string} reason - Причина отклонения
 * @returns {Promise<Object>} Обновленные данные баннера
 */
async function rejectBannerAd(bannerId, reason) {
  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  const banner = await kv.get(`banner_ad:${bannerId}`);
  
  if (!banner) {
    throw new Error('Banner not found');
  }

  if (banner.status !== 'pending_moderation') {
    throw new Error(`Cannot reject banner with status: ${banner.status}`);
  }

  // Обновление статуса
  const updatedBanner = {
    ...banner,
    status: 'rejected',
    rejection_reason: reason.trim(),
    updated_at: new Date().toISOString(),
    rejected_at: new Date().toISOString(),
  };

  await kv.set(`banner_ad:${bannerId}`, updatedBanner);

  // Уведомление пользователю
  await notifyUser(banner.user_email, 'Баннер отклонен', {
    campaign_name: banner.campaign_name,
    reason,
    message: 'К сожалению, ваша баннерная кампания не прошла модерацию. Пожалуйста, исправьте указанные замечания и отправьте заявку повторно.',
  });

  console.log('❌ Banner rejected:', bannerId, 'Reason:', reason);

  return updatedBanner;
}

/**
 * Подтверждает оплату и активирует баннер
 * 
 * @param {string} bannerId - ID баннера
 * @param {Date} startDate - Дата начала показа (опционально, по умолчанию - сейчас)
 * @returns {Promise<Object>} Обновленные данные баннера
 */
async function confirmPaymentAndActivate(bannerId, startDate = null) {
  const banner = await kv.get(`banner_ad:${bannerId}`);
  
  if (!banner) {
    throw new Error('Banner not found');
  }

  if (banner.status !== 'payment_pending') {
    throw new Error(`Cannot confirm payment for banner with status: ${banner.status}`);
  }

  // Расчет дат показа
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + banner.duration_days);

  // Обновление статуса
  const updatedBanner = {
    ...banner,
    status: 'active',
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    updated_at: new Date().toISOString(),
    activated_at: new Date().toISOString(),
  };

  await kv.set(`banner_ad:${bannerId}`, updatedBanner);

  // Добавление в индекс активных баннеров
  const activeBannerIds = await kv.get('active_banner_ads') || [];
  if (!activeBannerIds.includes(bannerId)) {
    activeBannerIds.push(bannerId);
    await kv.set('active_banner_ads', activeBannerIds);
  }

  // Уведомление пользователю
  await notifyUser(banner.user_email, 'Баннер активирован!', {
    campaign_name: banner.campaign_name,
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    duration_days: banner.duration_days,
    message: 'Оплата подтверждена! Ваш баннер активирован и начнет показываться на платформе.',
  });

  console.log('✅ Banner activated:', bannerId);

  return updatedBanner;
}

/**
 * Отменяет баннерную кампанию
 * 
 * @param {string} bannerId - ID баннера
 * @param {string} cancelReason - Причина отмены (опционально)
 * @returns {Promise<Object>} Обновленные данные баннера
 */
async function cancelBannerAd(bannerId, cancelReason = null) {
  const banner = await kv.get(`banner_ad:${bannerId}`);
  
  if (!banner) {
    throw new Error('Banner not found');
  }

  if (banner.status === 'expired' || banner.status === 'rejected') {
    throw new Error(`Cannot cancel banner with status: ${banner.status}`);
  }

  // Обновление статуса
  const updatedBanner = {
    ...banner,
    status: 'cancelled',
    cancel_reason: cancelReason,
    updated_at: new Date().toISOString(),
    cancelled_at: new Date().toISOString(),
  };

  await kv.set(`banner_ad:${bannerId}`, updatedBanner);

  // Удаление из активных (если был активен)
  if (banner.status === 'active') {
    const activeBannerIds = await kv.get('active_banner_ads') || [];
    const filtered = activeBannerIds.filter(id => id !== bannerId);
    await kv.set('active_banner_ads', filtered);
  }

  // Уведомление пользователю
  await notifyUser(banner.user_email, 'Баннерная кампания отменена', {
    campaign_name: banner.campaign_name,
    cancel_reason: cancelReason,
    message: 'Ваша баннерная кампания была отменена. Средства будут возвращены в течение 3-5 рабочих дней.',
  });

  console.log('🚫 Banner cancelled:', bannerId);

  return updatedBanner;
}

/**
 * Обновляет счетчики показов и кликов
 * 
 * @param {string} bannerId - ID баннера
 * @param {string} eventType - Тип события ('view' или 'click')
 * @returns {Promise<Object>} Обновленные данные баннера
 */
async function recordBannerEvent(bannerId, eventType) {
  const banner = await kv.get(`banner_ad:${bannerId}`);
  
  if (!banner) {
    throw new Error('Banner not found');
  }

  if (banner.status !== 'active') {
    throw new Error('Can only record events for active banners');
  }

  // Обновление счетчиков
  const updatedBanner = {
    ...banner,
    views: eventType === 'view' ? (banner.views || 0) + 1 : banner.views,
    clicks: eventType === 'click' ? (banner.clicks || 0) + 1 : banner.clicks,
    updated_at: new Date().toISOString(),
  };

  await kv.set(`banner_ad:${bannerId}`, updatedBanner);

  return updatedBanner;
}

/**
 * Проверяет и обновляет истекшие баннеры
 * Эта функция должна вызываться периодически (например, через cron)
 */
async function checkAndExpireBanners() {
  const activeBannerIds = await kv.get('active_banner_ads') || [];
  const now = new Date();
  let expiredCount = 0;

  for (const bannerId of activeBannerIds) {
    const banner = await kv.get(`banner_ad:${bannerId}`);
    
    if (!banner || banner.status !== 'active') {
      continue;
    }

    // Проверка истечения
    if (banner.end_date && new Date(banner.end_date) <= now) {
      const updatedBanner = {
        ...banner,
        status: 'expired',
        updated_at: now.toISOString(),
        expired_at: now.toISOString(),
      };

      await kv.set(`banner_ad:${bannerId}`, updatedBanner);

      // Уведомление пользователю
      await notifyUser(banner.user_email, 'Баннерная кампания завершена', {
        campaign_name: banner.campaign_name,
        total_views: banner.views,
        total_clicks: banner.clicks,
        ctr: banner.views > 0 ? ((banner.clicks / banner.views) * 100).toFixed(2) : 0,
        message: 'Срок размещения вашего баннера истек. Спасибо за использование платформы!',
      });

      expiredCount++;
    }
  }

  // Обновление индекса активных баннеров
  if (expiredCount > 0) {
    const banners = await kv.mget(activeBannerIds.map(id => `banner_ad:${id}`));
    const stillActive = activeBannerIds.filter((id, idx) => {
      const banner = banners[idx];
      return banner && banner.status === 'active';
    });
    await kv.set('active_banner_ads', stillActive);
  }

  console.log(`✅ Expired ${expiredCount} banners`);

  return expiredCount;
}

/**
 * Главная функция управления баннером
 * 
 * @param {string} action - Действие ('approve', 'reject', 'confirm_payment', 'cancel')
 * @param {Object} payload - Данные для действия
 * @returns {Promise<Object>} Результат операции
 */
export async function manageBannerAd(action, payload) {
  try {
    const { bannerId } = payload;

    if (!bannerId) {
      throw new Error('Banner ID is required');
    }

    let result;

    switch (action) {
      case 'approve':
        result = await approveBannerAd(bannerId, payload.adminNotes);
        break;

      case 'reject':
        if (!payload.reason) {
          throw new Error('Rejection reason is required');
        }
        result = await rejectBannerAd(bannerId, payload.reason);
        break;

      case 'confirm_payment':
        result = await confirmPaymentAndActivate(bannerId, payload.startDate);
        break;

      case 'cancel':
        result = await cancelBannerAd(bannerId, payload.cancelReason);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return {
      success: true,
      action,
      banner: result,
      message: 'Operation completed successfully',
    };

  } catch (error) {
    console.error('❌ Error managing banner ad:', error);
    throw error;
  }
}

export {
  approveBannerAd,
  rejectBannerAd,
  confirmPaymentAndActivate,
  cancelBannerAd,
  recordBannerEvent,
  checkAndExpireBanners,
};
