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

export default subscriptions;