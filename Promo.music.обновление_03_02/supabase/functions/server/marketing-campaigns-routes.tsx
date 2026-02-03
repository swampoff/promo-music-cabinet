/**
 * MARKETING CAMPAIGNS ROUTES
 * Роуты для управления маркетинговыми кампаниями
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const marketing = new Hono();

// Prefix для хранения кампаний
const MARKETING_PREFIX = 'marketing_campaign:';
const USER_CAMPAIGNS_PREFIX = 'user_campaigns:';

/**
 * GET /marketing/campaigns/:userId
 * Получить все кампании пользователя
 */
marketing.get('/campaigns/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    // Получаем список ID кампаний пользователя
    const userCampaignsKey = `${USER_CAMPAIGNS_PREFIX}${userId}`;
    const campaignIds = await kv.get(userCampaignsKey) || [];
    
    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      return c.json({ success: true, data: [] });
    }
    
    // Получаем все кампании
    const campaignKeys = campaignIds.map((id: string) => `${MARKETING_PREFIX}${id}`);
    const campaigns = await kv.mget(campaignKeys);
    
    // Фильтруем null значения
    const validCampaigns = campaigns.filter(Boolean);
    
    return c.json({ 
      success: true, 
      data: validCampaigns 
    });
  } catch (error) {
    console.error('Error loading campaigns:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load campaigns' 
    }, 500);
  }
});

/**
 * POST /marketing/campaigns
 * Создать новую кампанию
 */
marketing.post('/campaigns', async (c) => {
  try {
    const body = await c.req.json();
    
    // Валидация
    if (!body.campaign_name || !body.user_id || !body.content_ids?.length || !body.channels?.length) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }
    
    // Генерируем ID кампании
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Создаём объект кампании
    const campaign = {
      id: campaignId,
      campaign_name: body.campaign_name,
      user_id: body.user_id,
      user_email: body.user_email,
      content_ids: body.content_ids,
      description: body.description || '',
      start_date: body.start_date,
      end_date: body.end_date,
      channels: body.channels,
      target_audience: body.target_audience || {
        age_range: '18-45',
        gender: 'all',
        geography: ['Россия'],
        interests: []
      },
      budget_preference: body.budget_preference || 'medium',
      custom_budget: body.custom_budget || 0,
      base_price: body.base_price || 0,
      final_price: body.final_price || 0,
      discount_applied: body.discount_applied || 0,
      status: body.status || 'pending_review',
      additional_materials: body.additional_materials || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Сохраняем кампанию
    const campaignKey = `${MARKETING_PREFIX}${campaignId}`;
    await kv.set(campaignKey, campaign);
    
    // Добавляем ID кампании в список пользователя
    const userCampaignsKey = `${USER_CAMPAIGNS_PREFIX}${body.user_id}`;
    const userCampaigns = await kv.get(userCampaignsKey) || [];
    userCampaigns.push(campaignId);
    await kv.set(userCampaignsKey, userCampaigns);
    
    return c.json({ 
      success: true, 
      data: campaign 
    }, 201);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to create campaign' 
    }, 500);
  }
});

/**
 * GET /marketing/campaigns/detail/:campaignId
 * Получить детали кампании
 */
marketing.get('/campaigns/detail/:campaignId', async (c) => {
  const campaignId = c.req.param('campaignId');
  
  try {
    const campaignKey = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await kv.get(campaignKey);
    
    if (!campaign) {
      return c.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, 404);
    }
    
    return c.json({ 
      success: true, 
      data: campaign 
    });
  } catch (error) {
    console.error('Error loading campaign:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load campaign' 
    }, 500);
  }
});

/**
 * PATCH /marketing/campaigns/:campaignId
 * Обновить статус/детали кампании (для админа)
 */
marketing.patch('/campaigns/:campaignId', async (c) => {
  const campaignId = c.req.param('campaignId');
  
  try {
    const body = await c.req.json();
    const campaignKey = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await kv.get(campaignKey);
    
    if (!campaign) {
      return c.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, 404);
    }
    
    // Обновляем кампанию
    const updatedCampaign = {
      ...campaign,
      ...body,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(campaignKey, updatedCampaign);
    
    return c.json({ 
      success: true, 
      data: updatedCampaign 
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update campaign' 
    }, 500);
  }
});

/**
 * DELETE /marketing/campaigns/:campaignId
 * Удалить кампанию
 */
marketing.delete('/campaigns/:campaignId', async (c) => {
  const campaignId = c.req.param('campaignId');
  
  try {
    const campaignKey = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await kv.get(campaignKey);
    
    if (!campaign) {
      return c.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, 404);
    }
    
    // Удаляем кампанию
    await kv.del(campaignKey);
    
    // Удаляем из списка пользователя
    const userCampaignsKey = `${USER_CAMPAIGNS_PREFIX}${campaign.user_id}`;
    const userCampaigns = await kv.get(userCampaignsKey) || [];
    const filteredCampaigns = userCampaigns.filter((id: string) => id !== campaignId);
    await kv.set(userCampaignsKey, filteredCampaigns);
    
    return c.json({ 
      success: true, 
      message: 'Campaign deleted' 
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to delete campaign' 
    }, 500);
  }
});

/**
 * GET /marketing/campaigns/all
 * Получить все кампании (для админа)
 */
marketing.get('/campaigns/all', async (c) => {
  try {
    const campaigns = await kv.getByPrefix(MARKETING_PREFIX);
    
    return c.json({ 
      success: true, 
      data: campaigns 
    });
  } catch (error) {
    console.error('Error loading all campaigns:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load campaigns' 
    }, 500);
  }
});

/**
 * POST /marketing/campaigns/:campaignId/approve
 * Одобрить кампанию (админ)
 */
marketing.post('/campaigns/:campaignId/approve', async (c) => {
  const campaignId = c.req.param('campaignId');
  
  try {
    const body = await c.req.json();
    const campaignKey = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await kv.get(campaignKey);
    
    if (!campaign) {
      return c.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, 404);
    }
    
    // Обновляем статус
    campaign.status = 'approved';
    campaign.final_price = body.final_price || campaign.final_price;
    campaign.updated_at = new Date().toISOString();
    
    await kv.set(campaignKey, campaign);
    
    return c.json({ 
      success: true, 
      data: campaign 
    });
  } catch (error) {
    console.error('Error approving campaign:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to approve campaign' 
    }, 500);
  }
});

/**
 * POST /marketing/campaigns/:campaignId/reject
 * Отклонить кампанию (админ)
 */
marketing.post('/campaigns/:campaignId/reject', async (c) => {
  const campaignId = c.req.param('campaignId');
  
  try {
    const body = await c.req.json();
    const campaignKey = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await kv.get(campaignKey);
    
    if (!campaign) {
      return c.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, 404);
    }
    
    // Обновляем статус
    campaign.status = 'rejected';
    campaign.rejection_reason = body.reason || 'Not specified';
    campaign.updated_at = new Date().toISOString();
    
    await kv.set(campaignKey, campaign);
    
    return c.json({ 
      success: true, 
      data: campaign 
    });
  } catch (error) {
    console.error('Error rejecting campaign:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to reject campaign' 
    }, 500);
  }
});

export default marketing;
