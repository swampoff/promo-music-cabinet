/**
 * EMAIL SYSTEM ROUTES
 * Система управления email-уведомлениями и подписками
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Prefixes
const EMAIL_SUBSCRIPTION_PREFIX = 'email_subscription:';
const USER_EMAIL_SUBSCRIPTIONS_PREFIX = 'user_email_subscriptions:';
const EMAIL_HISTORY_PREFIX = 'email_history:';
const EMAIL_TEMPLATE_PREFIX = 'email_template:';

// ============================================
// EMAIL SUBSCRIPTIONS
// ============================================

/**
 * GET /subscriptions/:userId
 * Получить настройки email-подписок пользователя
 */
app.get('/subscriptions/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${EMAIL_SUBSCRIPTION_PREFIX}${userId}`;
    const subscriptions = await kv.get(key);
    
    // Если настроек нет, возвращаем дефолтные
    if (!subscriptions) {
      const defaultSubscriptions = {
        user_id: userId,
        notifications: {
          new_message: true,
          new_follower: true,
          new_donation: true,
          track_approved: true,
          track_rejected: true,
          concert_approved: true,
          payment_success: true,
          payment_failed: true,
          pitching_response: true,
          marketing_started: false,
          marketing_completed: true,
        },
        newsletter: {
          weekly_digest: true,
          monthly_report: true,
          product_updates: true,
          promotional: false,
        },
        frequency: 'realtime', // realtime | daily | weekly
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await kv.set(key, defaultSubscriptions);
      return c.json({ success: true, data: defaultSubscriptions });
    }
    
    return c.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Error loading email subscriptions:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load subscriptions' 
    }, 500);
  }
});

/**
 * PUT /subscriptions/:userId
 * Обновить настройки email-подписок
 */
app.put('/subscriptions/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const body = await c.req.json();
    const key = `${EMAIL_SUBSCRIPTION_PREFIX}${userId}`;
    const existingSubscriptions = await kv.get(key);
    
    const updatedSubscriptions = {
      ...existingSubscriptions,
      ...body,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(key, updatedSubscriptions);
    
    return c.json({ success: true, data: updatedSubscriptions });
  } catch (error) {
    console.error('Error updating email subscriptions:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update subscriptions' 
    }, 500);
  }
});

// ============================================
// EMAIL HISTORY
// ============================================

/**
 * GET /history/:userId
 * Получить историю отправленных email
 */
app.get('/history/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const prefix = `${EMAIL_HISTORY_PREFIX}${userId}:`;
    const historyItems = await kv.getByPrefix(prefix);
    
    const emails = historyItems
      .map((item: any) => item.value)
      .sort((a: any, b: any) => 
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      );
    
    return c.json({ success: true, data: emails });
  } catch (error) {
    console.error('Error loading email history:', error);
    return c.json({ 
      success: true,
      data: [] 
    });
  }
});

/**
 * POST /send
 * Отправить email (сохраняет в историю)
 */
app.post('/send', async (c) => {
  try {
    const body = await c.req.json();
    const {
      user_id,
      to_email,
      subject,
      template,
      content,
      type, // 'notification' | 'newsletter' | 'transactional'
      metadata,
    } = body;

    if (!user_id || !to_email || !subject || !content) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const emailId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const emailKey = `${EMAIL_HISTORY_PREFIX}${user_id}:${emailId}`;

    const emailData = {
      id: emailId,
      user_id,
      to_email,
      subject,
      template: template || null,
      content,
      type: type || 'notification',
      status: 'sent', // sent | failed | pending
      sent_at: new Date().toISOString(),
      opened: false,
      clicked: false,
      metadata: metadata || {},
    };

    await kv.set(emailKey, emailData);

    // В production здесь должна быть реальная отправка email
    // через Sendgrid, Mailgun, AWS SES и т.д.

    return c.json({ 
      success: true, 
      data: emailData 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to send email' 
    }, 500);
  }
});

/**
 * PUT /history/:emailId/opened
 * Отметить email как открытый (tracking pixel)
 */
app.put('/history/:emailId/opened', async (c) => {
  const emailId = c.req.param('emailId');
  
  try {
    const userId = c.req.query('userId');
    if (!userId) {
      return c.json({ success: false, error: 'Missing userId' }, 400);
    }
    
    const emailKey = `${EMAIL_HISTORY_PREFIX}${userId}:${emailId}`;
    const email = await kv.get(emailKey);

    if (!email) {
      return c.json({ success: false, error: 'Email not found' }, 404);
    }

    email.opened = true;
    email.opened_at = new Date().toISOString();
    await kv.set(emailKey, email);

    return c.json({ success: true, data: email });
  } catch (error) {
    console.error('Error marking email as opened:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to mark as opened' 
    }, 500);
  }
});

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * GET /templates
 * Получить все шаблоны email
 */
app.get('/templates', async (c) => {
  try {
    const templates = await kv.getByPrefix(EMAIL_TEMPLATE_PREFIX);
    
    const templateList = templates.map((item: any) => item.value);
    
    // Если шаблонов нет, создаём дефолтные
    if (templateList.length === 0) {
      const defaultTemplates = [
        {
          id: 'welcome',
          name: 'Приветственное письмо',
          subject: 'Добро пожаловать в Promo.Music!',
          content: '<h1>Добро пожаловать!</h1><p>Рады видеть вас на платформе.</p>',
          type: 'transactional',
          variables: ['user_name'],
          created_at: new Date().toISOString(),
        },
        {
          id: 'new_follower',
          name: 'Новый подписчик',
          subject: 'У вас новый подписчик!',
          content: '<h1>Новый фанат!</h1><p>{{follower_name}} подписался на ваши обновления.</p>',
          type: 'notification',
          variables: ['follower_name', 'follower_avatar'],
          created_at: new Date().toISOString(),
        },
        {
          id: 'track_approved',
          name: 'Трек одобрен',
          subject: 'Ваш трек одобрен модерацией',
          content: '<h1>Поздравляем!</h1><p>Трек "{{track_name}}" успешно прошёл модерацию.</p>',
          type: 'notification',
          variables: ['track_name', 'track_url'],
          created_at: new Date().toISOString(),
        },
        {
          id: 'weekly_digest',
          name: 'Еженедельный дайджест',
          subject: 'Ваши достижения за неделю',
          content: '<h1>Ваша статистика</h1><p>Прослушиваний: {{plays}}</p>',
          type: 'newsletter',
          variables: ['plays', 'likes', 'followers_count'],
          created_at: new Date().toISOString(),
        },
      ];
      
      for (const template of defaultTemplates) {
        await kv.set(`${EMAIL_TEMPLATE_PREFIX}${template.id}`, template);
      }
      
      return c.json({ success: true, data: defaultTemplates });
    }
    
    return c.json({ success: true, data: templateList });
  } catch (error) {
    console.error('Error loading email templates:', error);
    return c.json({ 
      success: true,
      data: [] 
    });
  }
});

/**
 * GET /templates/:templateId
 * Получить конкретный шаблон
 */
app.get('/templates/:templateId', async (c) => {
  const templateId = c.req.param('templateId');
  
  try {
    const template = await kv.get(`${EMAIL_TEMPLATE_PREFIX}${templateId}`);
    
    if (!template) {
      return c.json({ success: false, error: 'Template not found' }, 404);
    }
    
    return c.json({ success: true, data: template });
  } catch (error) {
    console.error('Error loading email template:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load template' 
    }, 500);
  }
});

// ============================================
// STATS
// ============================================

/**
 * GET /stats/:userId
 * Получить статистику email
 */
app.get('/stats/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const prefix = `${EMAIL_HISTORY_PREFIX}${userId}:`;
    const historyItems = await kv.getByPrefix(prefix);
    
    const emails = historyItems.map((item: any) => item.value);
    
    const stats = {
      total_sent: emails.length,
      total_opened: emails.filter((e: any) => e.opened).length,
      total_clicked: emails.filter((e: any) => e.clicked).length,
      open_rate: emails.length > 0 
        ? ((emails.filter((e: any) => e.opened).length / emails.length) * 100).toFixed(1)
        : '0',
      click_rate: emails.length > 0
        ? ((emails.filter((e: any) => e.clicked).length / emails.length) * 100).toFixed(1)
        : '0',
      by_type: {
        notification: emails.filter((e: any) => e.type === 'notification').length,
        newsletter: emails.filter((e: any) => e.type === 'newsletter').length,
        transactional: emails.filter((e: any) => e.type === 'transactional').length,
      },
      last_30_days: emails.filter((e: any) => {
        const sentDate = new Date(e.sent_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return sentDate >= thirtyDaysAgo;
      }).length,
    };
    
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error loading email stats:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load stats' 
    }, 500);
  }
});

export default app;
