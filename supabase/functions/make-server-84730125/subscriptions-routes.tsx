/**
 * ARTIST SUBSCRIPTIONS ROUTES
 * Система подписок для артистов - PROMO.MUSIC
 * Планы: SPARK, START, PRO, ELITE, LABEL
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const subscriptions = new Hono();

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

// ========================================
// ТАРИФНЫЕ ПЛАНЫ
// ========================================

/**
 * GET /subscriptions/plans
 * Получить все тарифные планы
 */
subscriptions.get('/plans', async (c) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('artist_subscription_plans')
      .select('*')
      .eq('is_visible', true)
      .order('display_order');

    if (error) throw error;

    // Format prices for display
    const plans = data.map(plan => ({
      ...plan,
      price_monthly_formatted: `₽${plan.price_monthly.toLocaleString()}`,
      price_yearly_formatted: `₽${plan.price_yearly.toLocaleString()}`,
      price_yearly_monthly: Math.round(plan.price_yearly / 12),
      yearly_savings: plan.price_monthly * 12 - plan.price_yearly,
      is_unlimited: (field: string) => plan[field] === -1
    }));

    return c.json({ success: true, data: plans });
  } catch (error: any) {
    console.error('Error loading plans:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /subscriptions/plans/:code
 * Получить план по коду
 */
subscriptions.get('/plans/:code', async (c) => {
  const code = c.req.param('code');
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('artist_subscription_plans')
      .select('*')
      .eq('code', code)
      .single();

    if (error) throw error;
    return c.json({ success: true, data });
  } catch (error: any) {
    console.error('Error loading plan:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// ПОДПИСКА АРТИСТА
// ========================================

/**
 * GET /subscriptions/:artistId
 * Получить текущую подписку артиста
 */
subscriptions.get('/:artistId', async (c) => {
  const artistId = c.req.param('artistId');

  // Skip if this looks like a special route
  if (artistId === 'plans') {
    return c.json({ success: false, error: 'Use /subscriptions/plans endpoint' }, 400);
  }

  try {
    const supabase = getSupabase();

    // Get active subscription with plan details
    const { data: subscription, error } = await supabase
      .from('artist_subscriptions')
      .select(`
        *,
        plan:artist_subscription_plans(*)
      `)
      .eq('artist_id', artistId)
      .eq('is_primary', true)
      .in('status', ['trial', 'active', 'paused'])
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // If no subscription, return free tier info
    if (!subscription) {
      return c.json({
        success: true,
        data: {
          artist_id: artistId,
          status: 'none',
          tier: 'free',
          has_subscription: false,
          services_discount: 0,
          message: 'Нет активной подписки. Доступен бесплатный функционал.'
        }
      });
    }

    // Get current usage
    const { data: usage } = await supabase
      .from('artist_subscription_usage')
      .select('*')
      .eq('subscription_id', subscription.id)
      .gte('period_end', new Date().toISOString())
      .single();

    // Check trial/subscription expiration
    const now = new Date();
    let statusMessage = '';

    if (subscription.status === 'trial' && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      statusMessage = daysLeft > 0
        ? `Пробный период: осталось ${daysLeft} дней`
        : 'Пробный период истёк';
    }

    return c.json({
      success: true,
      data: {
        ...subscription,
        tier: subscription.plan?.code || 'free',
        services_discount: subscription.plan?.services_discount_percentage || 0,
        has_subscription: true,
        usage: usage || null,
        status_message: statusMessage,
        days_until_renewal: Math.ceil(
          (new Date(subscription.current_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      }
    });
  } catch (error: any) {
    console.error('Error loading subscription:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /subscriptions/subscribe
 * Оформить подписку
 */
subscriptions.post('/subscribe', async (c) => {
  try {
    const body = await c.req.json();
    const {
      artist_id,
      plan_code,
      billing_cycle = 'monthly',
      promo_code,
      start_trial = true
    } = body;

    if (!artist_id || !plan_code) {
      return c.json({ success: false, error: 'artist_id and plan_code required' }, 400);
    }

    const supabase = getSupabase();

    // Get plan
    const { data: plan, error: planError } = await supabase
      .from('artist_subscription_plans')
      .select('*')
      .eq('code', plan_code)
      .single();

    if (planError || !plan) {
      return c.json({ success: false, error: 'План не найден' }, 404);
    }

    // Cancel existing active subscription
    await supabase
      .from('artist_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'upgraded'
      })
      .eq('artist_id', artist_id)
      .eq('is_primary', true)
      .in('status', ['trial', 'active', 'paused']);

    // Calculate pricing
    const basePrice = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    let discountAmount = 0;
    let finalPrice = basePrice;

    // Apply promo code if provided
    if (promo_code) {
      const { data: promo } = await supabase
        .from('artist_promo_codes')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo) {
        if (promo.discount_type === 'percentage') {
          discountAmount = basePrice * (promo.discount_value / 100);
        } else {
          discountAmount = promo.discount_value;
        }
        finalPrice = Math.max(0, basePrice - discountAmount);

        // Increment promo code usage
        await supabase
          .from('artist_promo_codes')
          .update({ current_uses: promo.current_uses + 1 })
          .eq('id', promo.id);
      }
    }

    // Calculate period dates
    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now);

    if (billing_cycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Trial dates
    const trialEnd = start_trial && plan.trial_days > 0
      ? new Date(now.getTime() + plan.trial_days * 24 * 60 * 60 * 1000)
      : null;

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from('artist_subscriptions')
      .insert({
        artist_id,
        plan_id: plan.id,
        is_primary: true,
        status: start_trial && plan.trial_days > 0 ? 'trial' : 'active',
        billing_cycle,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        trial_start: trialEnd ? now.toISOString() : null,
        trial_end: trialEnd?.toISOString() || null,
        base_price: basePrice,
        discount_amount: discountAmount,
        final_price: finalPrice,
        promo_budget_balance: plan.promo_budget_monthly,
        promo_budget_monthly_allotment: plan.promo_budget_monthly,
        promo_budget_last_refill: plan.promo_budget_monthly > 0 ? now.toISOString() : null
      })
      .select(`*, plan:artist_subscription_plans(*)`)
      .single();

    if (subError) throw subError;

    // Create usage record
    await supabase
      .from('artist_subscription_usage')
      .insert({
        subscription_id: subscription.id,
        artist_id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        social_posts_limit: plan.social_posts_monthly,
        instagram_stories_limit: plan.instagram_stories_monthly,
        video_posts_limit: plan.video_posts_monthly,
        email_subscribers_limit: plan.email_subscribers_limit,
        email_campaigns_limit: plan.email_campaigns_monthly,
        ai_emails_limit: plan.ai_generated_emails_monthly,
        venue_pitches_limit: plan.venue_pitches_monthly,
        tech_checks_limit: plan.tech_checks_monthly,
        vk_pitching_limit: plan.vk_pitching_quarterly,
        featured_limit: plan.featured_placements_quarterly,
        banners_limit: plan.banners_included_monthly
      });

    // Log promo budget if applicable
    if (plan.promo_budget_monthly > 0) {
      await supabase
        .from('artist_promo_budget_transactions')
        .insert({
          artist_id,
          subscription_id: subscription.id,
          type: 'refill_monthly',
          amount: plan.promo_budget_monthly,
          balance_after: plan.promo_budget_monthly,
          description: `Начисление промо-бюджета по плану ${plan.name}`
        });
    }

    return c.json({
      success: true,
      data: {
        ...subscription,
        tier: plan.code,
        message: start_trial && plan.trial_days > 0
          ? `Пробный период ${plan.trial_days} дней активирован!`
          : `Подписка ${plan.name} активирована!`
      }
    });
  } catch (error: any) {
    console.error('Error subscribing:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /subscriptions/:artistId/cancel
 * Отменить подписку
 */
subscriptions.post('/:artistId/cancel', async (c) => {
  const artistId = c.req.param('artistId');

  try {
    const body = await c.req.json().catch(() => ({}));
    const { reason, feedback, immediate = false } = body;

    const supabase = getSupabase();

    const updateData: any = {
      cancel_at_period_end: !immediate,
      cancellation_reason: reason,
      cancellation_feedback: feedback
    };

    if (immediate) {
      updateData.status = 'cancelled';
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('artist_subscriptions')
      .update(updateData)
      .eq('artist_id', artistId)
      .eq('is_primary', true)
      .in('status', ['trial', 'active', 'paused'])
      .select()
      .single();

    if (error) throw error;

    return c.json({
      success: true,
      data,
      message: immediate
        ? 'Подписка отменена немедленно'
        : 'Подписка будет отменена в конце текущего периода'
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// ИСПОЛЬЗОВАНИЕ КВОТ
// ========================================

/**
 * GET /subscriptions/:artistId/usage
 * Получить использование квот
 */
subscriptions.get('/:artistId/usage', async (c) => {
  const artistId = c.req.param('artistId');

  try {
    const supabase = getSupabase();

    // Get current subscription
    const { data: subscription } = await supabase
      .from('artist_subscriptions')
      .select('id, plan:artist_subscription_plans(*)')
      .eq('artist_id', artistId)
      .eq('is_primary', true)
      .in('status', ['trial', 'active'])
      .single();

    if (!subscription) {
      return c.json({
        success: true,
        data: {
          has_subscription: false,
          tier: 'free',
          message: 'Нет активной подписки'
        }
      });
    }

    // Get usage
    const { data: usage } = await supabase
      .from('artist_subscription_usage')
      .select('*')
      .eq('subscription_id', subscription.id)
      .gte('period_end', new Date().toISOString())
      .single();

    // Format usage with percentages
    const formatUsage = (used: number, limit: number) => ({
      used,
      limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - used),
      percentage: limit === -1 ? 0 : Math.round((used / limit) * 100),
      is_unlimited: limit === -1,
      is_exceeded: limit !== -1 && used >= limit
    });

    return c.json({
      success: true,
      data: {
        tier: subscription.plan?.code,
        plan_name: subscription.plan?.name,
        social_posts: formatUsage(usage?.social_posts_used || 0, usage?.social_posts_limit || 0),
        instagram_stories: formatUsage(usage?.instagram_stories_used || 0, usage?.instagram_stories_limit || 0),
        video_posts: formatUsage(usage?.video_posts_used || 0, usage?.video_posts_limit || 0),
        email_campaigns: formatUsage(usage?.email_campaigns_used || 0, usage?.email_campaigns_limit || 0),
        venue_pitches: formatUsage(usage?.venue_pitches_used || 0, usage?.venue_pitches_limit || 0),
        tech_checks: formatUsage(usage?.tech_checks_used || 0, usage?.tech_checks_limit || 0),
        vk_pitching: formatUsage(usage?.vk_pitching_used || 0, usage?.vk_pitching_limit || 0),
        featured: formatUsage(usage?.featured_used || 0, usage?.featured_limit || 0),
        banners: formatUsage(usage?.banners_used || 0, usage?.banners_limit || 0)
      }
    });
  } catch (error: any) {
    console.error('Error loading usage:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /subscriptions/:artistId/use
 * Использовать квоту
 */
subscriptions.post('/:artistId/use', async (c) => {
  const artistId = c.req.param('artistId');

  try {
    const body = await c.req.json();
    const { quota_type, amount = 1 } = body;

    if (!quota_type) {
      return c.json({ success: false, error: 'quota_type required' }, 400);
    }

    const validQuotas = [
      'social_posts', 'instagram_stories', 'video_posts',
      'email_campaigns', 'ai_emails', 'venue_pitches',
      'tech_checks', 'vk_pitching', 'featured', 'banners'
    ];

    if (!validQuotas.includes(quota_type)) {
      return c.json({ success: false, error: 'Invalid quota_type' }, 400);
    }

    const supabase = getSupabase();

    // Get subscription and usage
    const { data: subscription } = await supabase
      .from('artist_subscriptions')
      .select('id')
      .eq('artist_id', artistId)
      .eq('is_primary', true)
      .in('status', ['trial', 'active'])
      .single();

    if (!subscription) {
      return c.json({ success: false, error: 'No active subscription', limit_exceeded: true }, 403);
    }

    const { data: usage } = await supabase
      .from('artist_subscription_usage')
      .select('*')
      .eq('subscription_id', subscription.id)
      .gte('period_end', new Date().toISOString())
      .single();

    if (!usage) {
      return c.json({ success: false, error: 'Usage record not found' }, 404);
    }

    const usedField = `${quota_type}_used`;
    const limitField = `${quota_type}_limit`;
    const currentUsed = usage[usedField] || 0;
    const limit = usage[limitField] || 0;

    // Check if unlimited (-1) or within limits
    if (limit !== -1 && currentUsed + amount > limit) {
      return c.json({
        success: false,
        error: 'Лимит исчерпан',
        limit_exceeded: true,
        current: currentUsed,
        limit,
        upgrade_suggestion: 'Перейдите на более высокий план для увеличения лимитов'
      }, 403);
    }

    // Increment usage
    const { error } = await supabase
      .from('artist_subscription_usage')
      .update({ [usedField]: currentUsed + amount })
      .eq('id', usage.id);

    if (error) throw error;

    return c.json({
      success: true,
      data: {
        quota_type,
        used: currentUsed + amount,
        limit,
        remaining: limit === -1 ? -1 : limit - currentUsed - amount
      }
    });
  } catch (error: any) {
    console.error('Error using quota:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// ПРОМО-БЮДЖЕТ
// ========================================

/**
 * GET /subscriptions/:artistId/promo-budget
 * Получить промо-бюджет
 */
subscriptions.get('/:artistId/promo-budget', async (c) => {
  const artistId = c.req.param('artistId');

  try {
    const supabase = getSupabase();

    const { data: subscription } = await supabase
      .from('artist_subscriptions')
      .select('id, promo_budget_balance, promo_budget_monthly_allotment, promo_budget_last_refill, plan:artist_subscription_plans(name, promo_budget_monthly, promo_budget_rollover)')
      .eq('artist_id', artistId)
      .eq('is_primary', true)
      .in('status', ['trial', 'active'])
      .single();

    if (!subscription) {
      return c.json({
        success: true,
        data: {
          balance: 0,
          monthly_allotment: 0,
          has_promo_budget: false,
          message: 'Промо-бюджет доступен с плана PRO'
        }
      });
    }

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('artist_promo_budget_transactions')
      .select('*')
      .eq('subscription_id', subscription.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return c.json({
      success: true,
      data: {
        balance: subscription.promo_budget_balance,
        balance_formatted: `₽${subscription.promo_budget_balance.toLocaleString()}`,
        monthly_allotment: subscription.promo_budget_monthly_allotment,
        last_refill: subscription.promo_budget_last_refill,
        can_rollover: subscription.plan?.promo_budget_rollover,
        has_promo_budget: subscription.promo_budget_monthly_allotment > 0,
        recent_transactions: transactions || []
      }
    });
  } catch (error: any) {
    console.error('Error loading promo budget:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /subscriptions/:artistId/promo-budget/spend
 * Потратить промо-бюджет
 */
subscriptions.post('/:artistId/promo-budget/spend', async (c) => {
  const artistId = c.req.param('artistId');

  try {
    const body = await c.req.json();
    const { amount, service_type, service_id, description } = body;

    if (!amount || amount <= 0) {
      return c.json({ success: false, error: 'Invalid amount' }, 400);
    }

    const supabase = getSupabase();

    const { data: subscription } = await supabase
      .from('artist_subscriptions')
      .select('id, promo_budget_balance')
      .eq('artist_id', artistId)
      .eq('is_primary', true)
      .in('status', ['trial', 'active'])
      .single();

    if (!subscription) {
      return c.json({ success: false, error: 'No active subscription' }, 403);
    }

    if (subscription.promo_budget_balance < amount) {
      return c.json({
        success: false,
        error: 'Недостаточно средств в промо-бюджете',
        balance: subscription.promo_budget_balance,
        required: amount
      }, 400);
    }

    const newBalance = subscription.promo_budget_balance - amount;

    // Update balance
    await supabase
      .from('artist_subscriptions')
      .update({ promo_budget_balance: newBalance })
      .eq('id', subscription.id);

    // Log transaction
    await supabase
      .from('artist_promo_budget_transactions')
      .insert({
        artist_id: artistId,
        subscription_id: subscription.id,
        type: `spent_${service_type || 'other'}`,
        amount: -amount,
        balance_after: newBalance,
        service_type,
        service_id,
        description: description || `Оплата ${service_type}`
      });

    return c.json({
      success: true,
      data: {
        spent: amount,
        new_balance: newBalance,
        new_balance_formatted: `₽${newBalance.toLocaleString()}`
      }
    });
  } catch (error: any) {
    console.error('Error spending promo budget:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// СКИДКА НА УСЛУГИ
// ========================================

/**
 * GET /subscriptions/:artistId/discount
 * Получить скидку артиста на услуги
 */
subscriptions.get('/:artistId/discount', async (c) => {
  const artistId = c.req.param('artistId');

  try {
    const supabase = getSupabase();

    const { data: subscription } = await supabase
      .from('artist_subscriptions')
      .select('plan:artist_subscription_plans(code, name, services_discount_percentage)')
      .eq('artist_id', artistId)
      .eq('is_primary', true)
      .in('status', ['trial', 'active'])
      .single();

    const discount = subscription?.plan?.services_discount_percentage || 0;

    return c.json({
      success: true,
      data: {
        tier: subscription?.plan?.code || 'free',
        plan_name: subscription?.plan?.name || 'Бесплатный',
        discount_percentage: discount,
        discount_formatted: discount > 0 ? `-${discount}%` : '0%',
        applies_to: [
          'Дистрибуция треков',
          'Продвижение в плейлистах',
          'Рекламные кампании',
          'Баннеры на сайте',
          'Техническая проверка треков',
          'Email рассылки',
          'Питчинг'
        ]
      }
    });
  } catch (error: any) {
    console.error('Error loading discount:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /subscriptions/calculate-price
 * Рассчитать цену с учётом скидки
 */
subscriptions.post('/calculate-price', async (c) => {
  try {
    const body = await c.req.json();
    const { artist_id, original_price, service_type } = body;

    if (!artist_id || !original_price) {
      return c.json({ success: false, error: 'artist_id and original_price required' }, 400);
    }

    const supabase = getSupabase();

    const { data: subscription } = await supabase
      .from('artist_subscriptions')
      .select('plan:artist_subscription_plans(services_discount_percentage)')
      .eq('artist_id', artist_id)
      .eq('is_primary', true)
      .in('status', ['trial', 'active'])
      .single();

    const discountPercent = subscription?.plan?.services_discount_percentage || 0;
    const discountAmount = original_price * (discountPercent / 100);
    const finalPrice = original_price - discountAmount;

    return c.json({
      success: true,
      data: {
        original_price,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        final_price: finalPrice,
        savings: discountAmount,
        service_type
      }
    });
  } catch (error: any) {
    console.error('Error calculating price:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default subscriptions;
