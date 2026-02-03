/**
 * SUBSCRIPTIONS ROUTES
 * Управление подписками пользователей
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const subscriptions = new Hono();

const SUBSCRIPTION_PREFIX = 'subscription:';

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    price: 0,
    limits: {
      tracks: 10,
      videos: 5,
      storage_gb: 5,
      donation_fee: 0.10,
      marketing_discount: 0,
      coins_bonus: 0,
      pitching_discount: 0,
    },
  },
  basic: {
    price: 490,
    limits: {
      tracks: 50,
      videos: 20,
      storage_gb: 20,
      donation_fee: 0.07,
      marketing_discount: 0.05,
      coins_bonus: 0.05,
      pitching_discount: 0.05,
    },
  },
  pro: {
    price: 1490,
    limits: {
      tracks: -1,
      videos: -1,
      storage_gb: 100,
      donation_fee: 0.05,
      marketing_discount: 0.15,
      coins_bonus: 0.15,
      pitching_discount: 0.15, // Исправлено с 0.10 на 0.15
    },
  },
  premium: {
    price: 4990,
    limits: {
      tracks: -1,
      videos: -1,
      storage_gb: 500,
      donation_fee: 0.03,
      marketing_discount: 0.25,
      coins_bonus: 0.25,
      pitching_discount: 0.20,
    },
  },
};

/**
 * GET /subscriptions/:userId
 * Получить подписку пользователя
 */
subscriptions.get('/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    // Если подписки нет, создаём Free
    if (!subscription) {
      const freeSubscription = {
        user_id: userId,
        tier: 'free',
        price: 0,
        expires_at: null,
        status: 'active',
        features: [],
        limits: SUBSCRIPTION_PLANS.free.limits,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await kv.set(key, freeSubscription);
      return c.json({ success: true, data: freeSubscription });
    }
    
    // Проверяем истечение подписки
    if (subscription.tier !== 'free' && subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      
      if (now > expiresAt && subscription.status === 'active') {
        subscription.status = 'expired';
        subscription.tier = 'free';
        subscription.limits = SUBSCRIPTION_PLANS.free.limits;
        subscription.updated_at = new Date().toISOString();
        await kv.set(key, subscription);
      }
    }
    
    return c.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error loading subscription:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load subscription' 
    }, 500);
  }
});

/**
 * POST /subscriptions/subscribe
 * Оформить/изменить подписку
 */
subscriptions.post('/subscribe', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, tier, price } = body;
    
    if (!user_id || !tier) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }
    
    const plan = SUBSCRIPTION_PLANS[tier as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return c.json({ 
        success: false, 
        error: 'Invalid subscription tier' 
      }, 400);
    }
    
    // Рассчитываем дату истечения (30 дней)
    const expiresAt = tier === 'free' 
      ? null 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const subscription = {
      user_id,
      tier,
      price: plan.price,
      expires_at: expiresAt,
      status: 'active',
      features: Object.keys(plan.limits),
      limits: plan.limits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const key = `${SUBSCRIPTION_PREFIX}${user_id}`;
    await kv.set(key, subscription);
    
    return c.json({ 
      success: true, 
      data: subscription 
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to subscribe' 
    }, 500);
  }
});

/**
 * POST /subscriptions/:userId/cancel
 * Отменить подписку
 */
subscriptions.post('/:userId/cancel', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    if (!subscription) {
      return c.json({ 
        success: false, 
        error: 'Subscription not found' 
      }, 404);
    }
    
    subscription.status = 'cancelled';
    subscription.updated_at = new Date().toISOString();
    await kv.set(key, subscription);
    
    return c.json({ 
      success: true, 
      data: subscription 
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to cancel subscription' 
    }, 500);
  }
});

/**
 * GET /subscriptions/:userId/limits
 * Получить лимиты подписки
 */
subscriptions.get('/:userId/limits', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    if (!subscription) {
      return c.json({ 
        success: true, 
        data: SUBSCRIPTION_PLANS.free.limits 
      });
    }
    
    return c.json({ 
      success: true, 
      data: subscription.limits 
    });
  } catch (error) {
    console.error('Error loading limits:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load limits' 
    }, 500);
  }
});

/**
 * POST /subscriptions/:userId/check-limit
 * Проверить лимит конкретной функции
 */
subscriptions.post('/:userId/check-limit', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const body = await c.req.json();
    const { feature, current_usage } = body;
    
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key) || {
      limits: SUBSCRIPTION_PLANS.free.limits
    };
    
    const limit = subscription.limits[feature];
    
    // -1 означает безлимит
    if (limit === -1) {
      return c.json({ 
        success: true, 
        allowed: true,
        limit: -1,
        usage: current_usage
      });
    }
    
    const allowed = current_usage < limit;
    
    return c.json({ 
      success: true, 
      allowed,
      limit,
      usage: current_usage,
      remaining: Math.max(0, limit - current_usage)
    });
  } catch (error) {
    console.error('Error checking limit:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to check limit' 
    }, 500);
  }
});

/**
 * GET /subscriptions/:userId/current
 * Получить текущую подписку пользователя
 */
subscriptions.get('/:userId/current', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    if (!subscription) {
      // Return free plan as default
      return c.json({
        success: true,
        subscription: {
          id: 'free_default',
          planId: 'free',
          planName: 'Базовый',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          price: 0,
          currency: 'RUB',
          interval: 'month',
        }
      });
    }
    
    return c.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error loading subscription:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load subscription' 
    }, 500);
  }
});

/**
 * GET /subscriptions/plans
 * Получить все доступные планы подписок
 */
subscriptions.get('/plans', async (c) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Базовый',
        price: 0,
        currency: 'RUB',
        interval: 'month',
        features: [
          'До 10 треков',
          'До 5 видео',
          '5 ГБ хранилища',
          'Базовая аналитика',
          'Комиссия 10% на донаты',
        ],
        color: 'gray',
      },
      {
        id: 'basic',
        name: 'Стандарт',
        price: 490,
        currency: 'RUB',
        interval: 'month',
        features: [
          'До 50 треков',
          'До 20 видео',
          '20 ГБ хранилища',
          'Расширенная аналитика',
          'Комиссия 7% на донаты',
          '5% скидка на продвижение',
          '+5% бонусных коинов',
        ],
        popular: false,
        color: 'blue',
      },
      {
        id: 'pro',
        name: 'PRO',
        price: 1490,
        currency: 'RUB',
        interval: 'month',
        features: [
          'Безлимитные треки и видео',
          '100 ГБ хранилища',
          'Продвинутая аналитика + AI',
          'Комиссия 5% на донаты',
          '15% скидка на продвижение',
          '+15% бонусных коинов',
          'Приоритетная поддержка',
          'API доступ',
        ],
        popular: true,
        color: 'yellow',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 0,
        currency: 'RUB',
        interval: 'month',
        features: [
          'Всё из PRO',
          'Безлимитное хранилище',
          'Персональный менеджер',
          'Индивидуальные условия',
          'Белый лейбл',
          'Собственный домен',
          'SLA гарантии',
        ],
        popular: false,
        color: 'purple',
      },
    ];
    
    return c.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error loading plans:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load plans' 
    }, 500);
  }
});

/**
 * GET /subscriptions/:userId/payment-history
 * Получить историю платежей
 * DISABLED - Payment history is managed client-side
 */
/*
subscriptions.get('/:userId/payment-history', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const historyKey = `payment_history:${userId}`;
    const history = await kv.get(historyKey);
    
    if (!history) {
      // Return mock history for demo
      const mockHistory = [
        {
          id: 'pay_' + Date.now(),
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 1490,
          currency: 'RUB',
          status: 'paid',
          description: 'Подписка PRO - январь 2026',
          invoiceUrl: '#invoice_jan_2026',
          category: 'subscription',
          paymentMethod: {
            type: 'visa',
            last4: '4242',
          },
          transactionId: 'txn_1QwErTy234567890',
          tax: 0,
          fee: 74.5,
          details: {
            planName: 'PRO',
            period: 'Январь 2026',
          },
        },
        {
          id: 'pay_' + (Date.now() - 1000),
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 5000,
          currency: 'RUB',
          status: 'paid',
          description: 'Пополнение баланса коинов',
          invoiceUrl: '#invoice_coins_jan',
          category: 'coins',
          paymentMethod: {
            type: 'sbp',
            last4: '0000',
          },
          transactionId: 'txn_2AbCdEf987654321',
          tax: 0,
          fee: 0,
          details: {
            coinsAmount: 5500,
          },
        },
        {
          id: 'pay_' + (Date.now() - 2000),
          date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 2500,
          currency: 'RUB',
          status: 'paid',
          description: 'Продвижение трека "Summer Vibes"',
          invoiceUrl: '#invoice_promo_jan',
          category: 'promotion',
          paymentMethod: {
            type: 'mastercard',
            last4: '8888',
          },
          transactionId: 'txn_3ZxYwVu123456789',
          tax: 0,
          fee: 125,
          details: {
            campaignName: 'VK Ads - Целевая аудитория',
          },
        },
        {
          id: 'pay_' + (Date.now() - 3000),
          date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 1490,
          currency: 'RUB',
          status: 'paid',
          description: 'Подписка PRO - декабрь 2025',
          invoiceUrl: '#invoice_dec_2025',
          category: 'subscription',
          paymentMethod: {
            type: 'visa',
            last4: '4242',
          },
          transactionId: 'txn_4MnOpQr567890123',
          tax: 0,
          fee: 74.5,
          details: {
            planName: 'PRO',
            period: 'Декабрь 2025',
          },
        },
        {
          id: 'pay_' + (Date.now() - 4000),
          date: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 1200,
          currency: 'RUB',
          status: 'paid',
          description: 'Питчинг в плейлист "Русский Рок"',
          invoiceUrl: '#invoice_pitch_dec',
          category: 'pitching',
          paymentMethod: {
            type: 'yoomoney',
            last4: '1234',
          },
          transactionId: 'txn_5GhIjKl234567890',
          tax: 0,
          fee: 60,
          details: {
            campaignName: 'Яндекс Музыка - ТОП плейлист',
          },
        },
        {
          id: 'pay_' + (Date.now() - 5000),
          date: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 500,
          currency: 'RUB',
          status: 'refunded',
          description: 'Возврат за неудачную кампанию',
          invoiceUrl: '#invoice_refund_nov',
          category: 'promotion',
          paymentMethod: {
            type: 'visa',
            last4: '4242',
          },
          transactionId: 'txn_6LmNoPq890123456',
          tax: 0,
          fee: -25,
          details: {
            campaignName: 'Instagram Ads - отменено',
          },
        },
        {
          id: 'pay_' + (Date.now() - 6000),
          date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 1490,
          currency: 'RUB',
          status: 'paid',
          description: 'Подписка PRO - ноябрь 2025',
          invoiceUrl: '#invoice_nov_2025',
          category: 'subscription',
          paymentMethod: {
            type: 'visa',
            last4: '4242',
          },
          transactionId: 'txn_7QrStUv456789012',
          tax: 0,
          fee: 74.5,
          details: {
            planName: 'PRO',
            period: 'Ноябрь 2025',
          },
        },
        {
          id: 'pay_' + (Date.now() - 7000),
          date: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 3500,
          currency: 'RUB',
          status: 'paid',
          description: 'Донат от фаната @musiclover2025',
          invoiceUrl: '#invoice_donation_oct',
          category: 'donation',
          paymentMethod: {
            type: 'sbp',
            last4: '0000',
          },
          transactionId: 'txn_8WxYzAb012345678',
          tax: 0,
          fee: 175,
          details: {
            recipient: 'Александр Иванов',
          },
        },
        {
          id: 'pay_' + (Date.now() - 8000),
          date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 890,
          currency: 'RUB',
          status: 'pending',
          description: 'Продвижение трека "Autumn Dreams"',
          category: 'promotion',
          paymentMethod: {
            type: 'mir',
            last4: '1234',
          },
          transactionId: 'txn_9CdEfGh678901234',
          tax: 0,
          fee: 44.5,
          details: {
            campaignName: 'TikTok Ads - в обработке',
          },
        },
        {
          id: 'pay_' + (Date.now() - 9000),
          date: new Date(Date.now() - 102 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 250,
          currency: 'RUB',
          status: 'failed',
          description: 'Ошибка оплаты продвижения',
          category: 'promotion',
          paymentMethod: {
            type: 'mastercard',
            last4: '8888',
          },
          transactionId: 'txn_0HiJkLm345678901',
          tax: 0,
          fee: 0,
          details: {
            campaignName: 'YouTube Ads - недостаточно средств',
          },
        },
      ];
      
      return c.json({
        success: true,
        history: mockHistory
      });
    }
    
    return c.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error loading payment history:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load payment history' 
    }, 500);
  }
});
*/


/**
 * POST /subscriptions/:userId/change-plan
 * Изменить план подписки
 */
subscriptions.post('/:userId/change-plan', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const body = await c.req.json();
    const { planId, interval } = body;
    
    if (!planId || !interval) {
      return c.json({
        success: false,
        error: 'Plan ID and interval are required'
      }, 400);
    }
    
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return c.json({
        success: false,
        error: 'Invalid plan ID'
      }, 400);
    }
    
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const currentDate = new Date();
    const nextBillingDate = new Date(currentDate);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + (interval === 'year' ? 12 : 1));
    
    const newSubscription = {
      id: `sub_${Date.now()}`,
      planId,
      planName: planId === 'free' ? 'Базовый' : planId === 'basic' ? 'Стандарт' : planId === 'pro' ? 'PRO' : 'Enterprise',
      status: 'active',
      currentPeriodStart: currentDate.toISOString(),
      currentPeriodEnd: nextBillingDate.toISOString(),
      cancelAtPeriodEnd: false,
      price: interval === 'year' ? plan.price * 10 : plan.price, // 2 месяца в подарок при годовой оплате
      currency: 'RUB',
      interval,
      limits: plan.limits,
    };
    
    await kv.set(key, newSubscription);
    
    return c.json({
      success: true,
      subscription: newSubscription
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to change plan' 
    }, 500);
  }
});

export default subscriptions;