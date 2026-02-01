/**
 * PROMOTION ROUTES
 * Комплексная система продвижения для артистов
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const promotion = new Hono();

// Prefixes для разных типов запросов
const PITCHING_PREFIX = 'pitching:';
const PRODUCTION_360_PREFIX = 'production360:';
const MARKETING_PREFIX = 'marketing:';
const MEDIA_OUTREACH_PREFIX = 'media:';
const EVENT_PREFIX = 'event:';
const PROMO_LAB_PREFIX = 'promolab:';
const EDITOR_RESPONSE_PREFIX = 'editor_response:';

// Статусы
const STATUS = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  PENDING_REVIEW: 'pending_review',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// ============================================
// ПИТЧИНГ (Радио и Плейлисты)
// ============================================

/**
 * POST /promotion/pitching/submit
 * Отправить трек на питчинг
 */
promotion.post('/pitching/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      artist_id, 
      track_id, 
      track_title,
      pitch_type, // 'standard' или 'premium_direct_to_editor'
      target_channels, // ['radio', 'playlists']
      message,
      target_editors, // array of editor IDs для premium
      budget,
    } = body;

    if (!artist_id || !track_id || !track_title || !pitch_type) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `${PITCHING_PREFIX}${requestId}`;

    const pitchingRequest = {
      id: requestId,
      artist_id,
      track_id,
      track_title,
      pitch_type,
      target_channels: target_channels || [],
      message: message || '',
      target_editors: target_editors || [],
      budget: budget || 0,
      status: budget > 0 ? STATUS.PENDING_PAYMENT : STATUS.PENDING_REVIEW,
      responses_count: 0,
      interested_count: 0,
      added_to_rotation_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(key, pitchingRequest);

    return c.json({ 
      success: true, 
      data: pitchingRequest 
    });
  } catch (error) {
    console.error('Error submitting pitching request:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to submit pitching request' 
    }, 500);
  }
});

/**
 * GET /promotion/pitching/:artistId
 * Получить все питчинг-запросы артиста
 */
promotion.get('/pitching/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  
  try {
    const prefix = `${PITCHING_PREFIX}`;
    const requests = await kv.getByPrefix(prefix);
    
    // Если нет данных, возвращаем пустой массив (не ошибку)
    if (!requests || requests.length === 0) {
      console.log(`[Pitching] No requests found for artist ${artistId}`);
      return c.json({ 
        success: true, 
        data: [] 
      });
    }
    
    const artistRequests = requests.filter(
      (req: any) => req.value.artist_id === artistId
    );

    return c.json({ 
      success: true, 
      data: artistRequests.map((r: any) => r.value) 
    });
  } catch (error) {
    console.error('Error loading pitching requests:', error);
    // Возвращаем пустой массив вместо ошибки
    return c.json({ 
      success: true, 
      data: [] 
    });
  }
});

/**
 * POST /promotion/pitching/:requestId/response
 * Редактор отвечает на питчинг
 */
promotion.post('/pitching/:requestId/response', async (c) => {
  const requestId = c.req.param('requestId');
  
  try {
    const body = await c.req.json();
    const { editor_id, editor_name, response_type, notes } = body;

    // Сохраняем ответ редактора
    const responseKey = `${EDITOR_RESPONSE_PREFIX}${requestId}:${editor_id}`;
    const response = {
      request_id: requestId,
      editor_id,
      editor_name,
      response_type, // 'interested', 'not_interested', 'added_to_rotation'
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    await kv.set(responseKey, response);

    // Обновляем счетчики в запросе
    const requestKey = `${PITCHING_PREFIX}${requestId}`;
    const request = await kv.get(requestKey);

    if (request) {
      request.responses_count = (request.responses_count || 0) + 1;
      if (response_type === 'interested') {
        request.interested_count = (request.interested_count || 0) + 1;
      }
      if (response_type === 'added_to_rotation') {
        request.added_to_rotation_count = (request.added_to_rotation_count || 0) + 1;
      }
      request.updated_at = new Date().toISOString();
      await kv.set(requestKey, request);
    }

    return c.json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error saving editor response:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to save editor response' 
    }, 500);
  }
});

// ============================================
// 360° ПРОДВИЖЕНИЕ (Полный цикл)
// ============================================

/**
 * POST /promotion/production360/submit
 * Заявка на 360° продвижение
 */
promotion.post('/production360/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      artist_id,
      project_title,
      description,
      current_stage, // 'idea', 'recording', 'mixing', 'mastering', 'ready'
      required_services, // ['recording', 'mixing', 'mastering', 'video', 'distribution']
      references,
      budget,
    } = body;

    if (!artist_id || !project_title || !current_stage) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `${PRODUCTION_360_PREFIX}${requestId}`;

    const production360Request = {
      id: requestId,
      artist_id,
      project_title,
      description: description || '',
      current_stage,
      required_services: required_services || [],
      references: references || [],
      budget: budget || 0,
      status: STATUS.PENDING_REVIEW,
      progress: 0,
      milestones: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(key, production360Request);

    return c.json({ 
      success: true, 
      data: production360Request 
    });
  } catch (error) {
    console.error('Error submitting 360 production request:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to submit production request' 
    }, 500);
  }
});

/**
 * GET /promotion/production360/:artistId
 * Получить все 360° проекты артиста
 */
promotion.get('/production360/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  
  try {
    const prefix = `${PRODUCTION_360_PREFIX}`;
    const requests = await kv.getByPrefix(prefix);
    
    const artistRequests = requests.filter(
      (req: any) => req.value.artist_id === artistId
    );

    return c.json({ 
      success: true, 
      data: artistRequests.map((r: any) => r.value) 
    });
  } catch (error) {
    console.error('Error loading 360 production requests:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load production requests' 
    }, 500);
  }
});

// ============================================
// МАРКЕТИНГ (Соцсети, СМИ, Таргет)
// ============================================

/**
 * POST /promotion/marketing/submit
 * Создать маркетинговую кампанию
 */
promotion.post('/marketing/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      artist_id,
      campaign_name,
      description,
      campaign_type, // 'slots_based'
      budget,
      duration_days,
      platforms, // ['instagram', 'vk', 'tiktok', 'youtube']
      content_ids, // ID треков/клипов
      expected_results, // KPI
      creatives, // URLs креативов
      brandbook_url, // URL брендбука
      targeting, // Детальный таргетинг с описанием
      blogger_slots, // Массив блогеров
      selected_slots, // Выбранные рекламные слоты
    } = body;

    if (!artist_id || !campaign_name || !campaign_type) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const campaignId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `${MARKETING_PREFIX}${campaignId}`;

    const marketingCampaign = {
      id: campaignId,
      artist_id,
      campaign_name,
      description: description || '',
      campaign_type,
      budget: budget || 0,
      duration_days: duration_days || 30,
      platforms: platforms || [],
      
      // Контент для продвижения
      content_ids: content_ids || [],
      
      // Креативы и брендбук
      creatives: creatives || [],
      brandbook_url: brandbook_url || '',
      
      // Ожидаемые результаты (KPI)
      expected_results: expected_results || {
        reach: 0,
        engagement: 0,
        conversions: 0,
        ctr: 0,
      },
      
      // Таргетинг с описанием
      targeting: targeting || {
        age_from: 18,
        age_to: 35,
        genders: ['all'],
        geo: [],
        interests: [],
        lookalike: false,
        custom_audiences: [],
        description: '',
      },
      
      // Блогеры
      blogger_slots: blogger_slots || [],
      
      // Выбранные слоты по платформам
      selected_slots: selected_slots || {},
      
      status: STATUS.PENDING_PAYMENT,
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        reach: 0,
        engagement: 0,
      },
      roi: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: null,
    };

    await kv.set(key, marketingCampaign);

    return c.json({ 
      success: true, 
      data: marketingCampaign 
    });
  } catch (error) {
    console.error('Error submitting marketing campaign:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to submit marketing campaign' 
    }, 500);
  }
});

/**
 * GET /promotion/marketing/:artistId
 * Получить все маркетинговые кампании артиста
 */
promotion.get('/marketing/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  
  try {
    const prefix = `${MARKETING_PREFIX}`;
    const campaigns = await kv.getByPrefix(prefix);
    
    const artistCampaigns = campaigns.filter(
      (campaign: any) => campaign.value.artist_id === artistId
    );

    return c.json({ 
      success: true, 
      data: artistCampaigns.map((c: any) => c.value) 
    });
  } catch (error) {
    console.error('Error loading marketing campaigns:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load marketing campaigns' 
    }, 500);
  }
});

/**
 * PUT /promotion/marketing/:campaignId/analytics
 * Обновить аналитику кампании
 */
promotion.put('/marketing/:campaignId/analytics', async (c) => {
  const campaignId = c.req.param('campaignId');
  
  try {
    const body = await c.req.json();
    const { analytics } = body;

    const key = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await kv.get(key);

    if (!campaign) {
      return c.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, 404);
    }

    campaign.metrics = { ...campaign.metrics, ...analytics };
    campaign.updated_at = new Date().toISOString();
    await kv.set(key, campaign);

    return c.json({ 
      success: true, 
      data: campaign 
    });
  } catch (error) {
    console.error('Error updating campaign analytics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update analytics' 
    }, 500);
  }
});

// ============================================
// PR и СМИ (Публикации, Интервью)
// ============================================

/**
 * POST /promotion/media/submit
 * Заявка на PR в СМИ
 */
promotion.post('/media/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      artist_id,
      content_ids,
      pr_goals,
      target_media, // желаемые медиа-партнеры
      press_kit_url,
      budget,
    } = body;

    if (!artist_id || !pr_goals) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `${MEDIA_OUTREACH_PREFIX}${requestId}`;

    const mediaRequest = {
      id: requestId,
      artist_id,
      content_ids: content_ids || [],
      pr_goals,
      target_media: target_media || [],
      press_kit_url: press_kit_url || '',
      budget: budget || 0,
      status: STATUS.PENDING_REVIEW,
      publications: [],
      mentions_count: 0,
      reach: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(key, mediaRequest);

    return c.json({ 
      success: true, 
      data: mediaRequest 
    });
  } catch (error) {
    console.error('Error submitting media outreach request:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to submit media request' 
    }, 500);
  }
});

/**
 * GET /promotion/media/:artistId
 * Получить все PR-заявки артиста
 */
promotion.get('/media/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  
  try {
    const prefix = `${MEDIA_OUTREACH_PREFIX}`;
    const requests = await kv.getByPrefix(prefix);
    
    const artistRequests = requests.filter(
      (req: any) => req.value.artist_id === artistId
    );

    return c.json({ 
      success: true, 
      data: artistRequests.map((r: any) => r.value) 
    });
  } catch (error) {
    console.error('Error loading media outreach requests:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load media requests' 
    }, 500);
  }
});

// ============================================
// СОЗДАНИЕ СОБЫТИЙ (Концерты, Туры, Букинг)
// ============================================

/**
 * POST /promotion/event/submit
 * Заявка на организацию события
 */
promotion.post('/event/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      artist_id,
      event_concept,
      event_type, // 'concert', 'tour', 'festival'
      desired_dates,
      desired_venues,
      technical_requirements, // { sound: true, lights: true, stage_size: '10x8m' }
      required_services, // ['booking', 'venue', 'transport', 'rider']
      expected_attendance,
      budget,
    } = body;

    if (!artist_id || !event_concept || !event_type) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `${EVENT_PREFIX}${requestId}`;

    const eventRequest = {
      id: requestId,
      artist_id,
      event_concept,
      event_type,
      desired_dates: desired_dates || [],
      desired_venues: desired_venues || [],
      technical_requirements: technical_requirements || {},
      required_services: required_services || [],
      expected_attendance: expected_attendance || 0,
      budget: budget || 0,
      status: STATUS.PENDING_REVIEW,
      confirmed_venue: null,
      confirmed_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(key, eventRequest);

    return c.json({ 
      success: true, 
      data: eventRequest 
    });
  } catch (error) {
    console.error('Error submitting event organization request:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to submit event request' 
    }, 500);
  }
});

/**
 * GET /promotion/event/:artistId
 * Получить все заявки на события артиста
 */
promotion.get('/event/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  
  try {
    const prefix = `${EVENT_PREFIX}`;
    const requests = await kv.getByPrefix(prefix);
    
    const artistRequests = requests.filter(
      (req: any) => req.value.artist_id === artistId
    );

    return c.json({ 
      success: true, 
      data: artistRequests.map((r: any) => r.value) 
    });
  } catch (error) {
    console.error('Error loading event organization requests:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load event requests' 
    }, 500);
  }
});

// ============================================
// PROMO LAB (Заявка на лейбл)
// ============================================

/**
 * POST /promotion/promolab/submit
 * Заявка на сотрудничество с PROMO.FM
 */
promotion.post('/promolab/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      artist_id,
      project_description,
      motivation,
      portfolio_links,
      social_links,
      monthly_listeners,
      career_goals,
    } = body;

    if (!artist_id || !project_description || !motivation) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const applicationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `${PROMO_LAB_PREFIX}${applicationId}`;

    const promoLabApplication = {
      id: applicationId,
      artist_id,
      project_description,
      motivation,
      portfolio_links: portfolio_links || [],
      social_links: social_links || {},
      monthly_listeners: monthly_listeners || 0,
      career_goals: career_goals || '',
      status: STATUS.PENDING_REVIEW,
      admin_notes: '',
      rejection_reason: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reviewed_at: null,
    };

    await kv.set(key, promoLabApplication);

    return c.json({ 
      success: true, 
      data: promoLabApplication 
    });
  } catch (error) {
    console.error('Error submitting PROMO Lab application:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to submit application' 
    }, 500);
  }
});

/**
 * GET /promotion/promolab/:artistId
 * Получить заявку артиста в PROMO Lab
 */
promotion.get('/promolab/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  
  try {
    const prefix = `${PROMO_LAB_PREFIX}`;
    const applications = await kv.getByPrefix(prefix);
    
    const artistApplications = applications.filter(
      (app: any) => app.value.artist_id === artistId
    );

    return c.json({ 
      success: true, 
      data: artistApplications.map((a: any) => a.value) 
    });
  } catch (error) {
    console.error('Error loading PROMO Lab applications:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load applications' 
    }, 500);
  }
});

// ============================================
// ОБЩИЕ ЭНДПОИНТЫ
// ============================================

/**
 * PUT /promotion/:type/:requestId/status
 * Обновить статус заявки
 */
promotion.put('/:type/:requestId/status', async (c) => {
  const type = c.req.param('type');
  const requestId = c.req.param('requestId');
  
  try {
    const body = await c.req.json();
    const { status, admin_notes, rejection_reason } = body;

    const prefixMap: Record<string, string> = {
      pitching: PITCHING_PREFIX,
      production360: PRODUCTION_360_PREFIX,
      marketing: MARKETING_PREFIX,
      media: MEDIA_OUTREACH_PREFIX,
      event: EVENT_PREFIX,
      promolab: PROMO_LAB_PREFIX,
    };

    const prefix = prefixMap[type];
    if (!prefix) {
      return c.json({ 
        success: false, 
        error: 'Invalid promotion type' 
      }, 400);
    }

    const key = `${prefix}${requestId}`;
    const request = await kv.get(key);

    if (!request) {
      return c.json({ 
        success: false, 
        error: 'Request not found' 
      }, 404);
    }

    request.status = status;
    request.updated_at = new Date().toISOString();
    
    if (admin_notes) request.admin_notes = admin_notes;
    if (rejection_reason) request.rejection_reason = rejection_reason;
    if (status === STATUS.COMPLETED) request.completed_at = new Date().toISOString();

    await kv.set(key, request);

    return c.json({ 
      success: true, 
      data: request 
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update status' 
    }, 500);
  }
});

/**
 * GET /promotion/dashboard/:artistId
 * Получить сводку всех активных кампаний
 */
promotion.get('/dashboard/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  
  try {
    // Загружаем все типы заявок
    const [pitching, production360, marketing, media, events, promolab] = await Promise.all([
      kv.getByPrefix(PITCHING_PREFIX),
      kv.getByPrefix(PRODUCTION_360_PREFIX),
      kv.getByPrefix(MARKETING_PREFIX),
      kv.getByPrefix(MEDIA_OUTREACH_PREFIX),
      kv.getByPrefix(EVENT_PREFIX),
      kv.getByPrefix(PROMO_LAB_PREFIX),
    ]);

    const filterByArtist = (items: any[]) => 
      items.filter((item: any) => item.value.artist_id === artistId)
        .map((item: any) => item.value);

    const dashboard = {
      pitching: filterByArtist(pitching),
      production360: filterByArtist(production360),
      marketing: filterByArtist(marketing),
      media: filterByArtist(media),
      events: filterByArtist(events),
      promolab: filterByArtist(promolab),
      summary: {
        total_campaigns: 0,
        active_campaigns: 0,
        completed_campaigns: 0,
        total_spend: 0,
      },
    };

    // Считаем статистику
    const allCampaigns = [
      ...dashboard.pitching,
      ...dashboard.production360,
      ...dashboard.marketing,
      ...dashboard.media,
      ...dashboard.events,
    ];

    dashboard.summary.total_campaigns = allCampaigns.length;
    dashboard.summary.active_campaigns = allCampaigns.filter(
      (c: any) => c.status === STATUS.IN_PROGRESS
    ).length;
    dashboard.summary.completed_campaigns = allCampaigns.filter(
      (c: any) => c.status === STATUS.COMPLETED
    ).length;
    dashboard.summary.total_spend = allCampaigns.reduce(
      (sum: number, c: any) => sum + (c.budget || 0), 
      0
    );

    return c.json({ 
      success: true, 
      data: dashboard 
    });
  } catch (error) {
    console.error('Error loading promotion dashboard:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load dashboard' 
    }, 500);
  }
});

export default promotion;