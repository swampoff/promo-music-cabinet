import { Hono } from 'npm:hono';
import * as kv from './kv-utils.tsx';

const app = new Hono();

// =====================================================
// TRACK TEST SYSTEM - PROFESSIONAL EXPERT REVIEWS
// =====================================================

// Типы данных
interface TrackTestRequest {
  id: string;
  user_id: string | null; // null для гостей
  track_id: string | null; // null для гостей
  guest_email?: string;
  guest_name?: string;
  guest_track_url?: string;
  guest_cover_url?: string;
  track_title: string;
  artist_name: string;
  genre?: string;
  status: 'pending_payment' | 'pending_moderation' | 'moderation_rejected' | 
          'pending_expert_assignment' | 'experts_assigned' | 'review_in_progress' | 
          'pending_admin_review' | 'completed' | 'rejected';
  payment_status: 'pending' | 'completed' | 'refunded';
  payment_amount: number; // 1000 RUB
  payment_transaction_id?: string;
  required_expert_count: number; // до 10
  completed_reviews_count: number;
  assigned_experts: string[]; // email эксперта
  average_rating?: number; // средняя оценка (1-10)
  category_averages?: {
    mixing_mastering: number;
    arrangement: number;
    originality: number;
    commercial_potential: number;
  };
  consolidated_feedback?: string; // AI-сгенерированный
  consolidated_recommendations?: string;
  moderation_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface ExpertReview {
  id: string;
  request_id: string;
  expert_email: string;
  expert_name: string;
  status: 'assigned' | 'in_progress' | 'completed';
  
  // Оценки (1-10)
  mixing_mastering_score: number;
  arrangement_score: number;
  originality_score: number;
  commercial_potential_score: number;
  overall_score: number;
  
  // Фидбек
  mixing_mastering_feedback: string;
  arrangement_feedback: string;
  originality_feedback: string;
  commercial_potential_feedback: string;
  general_feedback: string;
  recommendations: string;
  
  reward_points: number; // 50 коинов
  reward_paid: boolean;
  
  created_at: string;
  completed_at?: string;
}

// =====================================================
// 1. СОЗДАНИЕ ЗАЯВКИ (для артистов и гостей)
// =====================================================

app.post('/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      user_id, 
      track_id,
      guest_email,
      guest_name,
      guest_track_url,
      guest_cover_url,
      track_title,
      artist_name,
      genre 
    } = body;

    // Валидация
    if (!track_title || !artist_name) {
      return c.json({ error: 'Track title and artist name are required' }, 400);
    }

    if (!user_id && !guest_email) {
      return c.json({ error: 'User ID or guest email required' }, 400);
    }

    const requestId = crypto.randomUUID();
    const now = new Date().toISOString();

    const trackTestRequest: TrackTestRequest = {
      id: requestId,
      user_id: user_id || null,
      track_id: track_id || null,
      guest_email,
      guest_name,
      guest_track_url,
      guest_cover_url,
      track_title,
      artist_name,
      genre,
      status: 'pending_payment',
      payment_status: 'pending',
      payment_amount: 1000,
      required_expert_count: 5, // по умолчанию 5 экспертов
      completed_reviews_count: 0,
      assigned_experts: [],
      created_at: now,
      updated_at: now
    };

    // Сохранить заявку
    await kv.set(`track_test:requests:${requestId}`, trackTestRequest);

    // Добавить в список заявок пользователя
    if (user_id) {
      const userRequests = await kv.get(`track_test:user:${user_id}:requests`) || [];
      userRequests.unshift(requestId);
      await kv.set(`track_test:user:${user_id}:requests`, userRequests);
    }

    // Добавить в общий список (для администратора)
    const allRequests = await kv.get('track_test:all_requests') || [];
    allRequests.unshift(requestId);
    await kv.set('track_test:all_requests', allRequests);

    console.log(`✅ Track test request created: ${requestId}`);

    return c.json({
      success: true,
      request_id: requestId,
      status: 'pending_payment',
      payment_amount: 1000,
      message: 'Track test request created. Please proceed with payment.'
    });

  } catch (error) {
    console.error('❌ Error creating track test request:', error);
    return c.json({ error: 'Failed to create track test request' }, 500);
  }
});

// =====================================================
// 2. ОБРАБОТКА ОПЛАТЫ
// =====================================================

app.post('/payment', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, payment_method, transaction_id } = body;

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Симуляция успешной оплаты
    // В production здесь будет интеграция с платежной системой

    request.payment_status = 'completed';
    request.payment_transaction_id = transaction_id || crypto.randomUUID();
    request.status = 'pending_moderation';
    request.updated_at = new Date().toISOString();

    await kv.set(`track_test:requests:${request_id}`, request);

    // Создать транзакцию оплаты
    const paymentTx = {
      id: crypto.randomUUID(),
      user_id: request.user_id,
      amount: request.payment_amount,
      currency: 'RUB',
      type: 'track_test',
      status: 'completed',
      payment_method,
      description: `Track test: ${request.track_title}`,
      related_entity_type: 'track_test_request',
      related_entity_id: request_id,
      created_at: new Date().toISOString()
    };

    await kv.set(`payments:${request.user_id}:tx:${paymentTx.id}`, paymentTx);

    // Уведомление администратору о новой заявке на модерацию
    console.log(`💰 Payment completed for request: ${request_id}`);

    return c.json({
      success: true,
      status: 'pending_moderation',
      message: 'Payment completed. Your request is now under moderation.'
    });

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    return c.json({ error: 'Failed to process payment' }, 500);
  }
});

// =====================================================
// 3. МОДЕРАЦИЯ (администратор)
// =====================================================

app.post('/moderate', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, action, notes } = body;
    // action: 'approve' | 'reject'

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    if (request.status !== 'pending_moderation') {
      return c.json({ error: 'Request is not pending moderation' }, 400);
    }

    if (action === 'approve') {
      request.status = 'pending_expert_assignment';
      request.moderation_notes = notes;
      console.log(`✅ Request approved: ${request_id}`);
    } else if (action === 'reject') {
      request.status = 'moderation_rejected';
      request.rejection_reason = notes;
      
      // Возврат средств
      request.payment_status = 'refunded';
      console.log(`❌ Request rejected: ${request_id}`);
    }

    request.updated_at = new Date().toISOString();
    await kv.set(`track_test:requests:${request_id}`, request);

    return c.json({
      success: true,
      status: request.status,
      message: action === 'approve' ? 'Request approved' : 'Request rejected and refunded'
    });

  } catch (error) {
    console.error('❌ Error moderating request:', error);
    return c.json({ error: 'Failed to moderate request' }, 500);
  }
});

// =====================================================
// 4. НАЗНАЧЕНИЕ ЭКСПЕРТОВ (администратор)
// =====================================================

app.post('/assign-experts', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, expert_emails, required_count } = body;

    if (!expert_emails || expert_emails.length === 0) {
      return c.json({ error: 'At least one expert required' }, 400);
    }

    if (expert_emails.length > 10) {
      return c.json({ error: 'Maximum 10 experts allowed' }, 400);
    }

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    if (request.status !== 'pending_expert_assignment') {
      return c.json({ error: 'Request is not ready for expert assignment' }, 400);
    }

    // Создать ExpertReview для каждого эксперта
    const expertReviews: string[] = [];
    const now = new Date().toISOString();

    for (const expertEmail of expert_emails) {
      const reviewId = crypto.randomUUID();
      
      const expertReview: ExpertReview = {
        id: reviewId,
        request_id,
        expert_email: expertEmail,
        expert_name: expertEmail.split('@')[0], // temporary
        status: 'assigned',
        mixing_mastering_score: 0,
        arrangement_score: 0,
        originality_score: 0,
        commercial_potential_score: 0,
        overall_score: 0,
        mixing_mastering_feedback: '',
        arrangement_feedback: '',
        originality_feedback: '',
        commercial_potential_feedback: '',
        general_feedback: '',
        recommendations: '',
        reward_points: 50,
        reward_paid: false,
        created_at: now
      };

      await kv.set(`track_test:reviews:${reviewId}`, expertReview);
      expertReviews.push(reviewId);

      // Отправить уведомление эксперту
      console.log(`📧 Notification sent to expert: ${expertEmail}`);
    }

    // Обновить заявку
    request.assigned_experts = expert_emails;
    request.required_expert_count = required_count || expert_emails.length;
    request.status = 'experts_assigned';
    request.updated_at = now;

    await kv.set(`track_test:requests:${request_id}`, request);
    await kv.set(`track_test:request:${request_id}:reviews`, expertReviews);

    console.log(`✅ Assigned ${expert_emails.length} experts to request: ${request_id}`);

    return c.json({
      success: true,
      assigned_experts: expert_emails.length,
      status: 'experts_assigned',
      message: `Successfully assigned ${expert_emails.length} experts`
    });

  } catch (error) {
    console.error('❌ Error assigning experts:', error);
    return c.json({ error: 'Failed to assign experts' }, 500);
  }
});

// =====================================================
// 5. ОТПРАВКА ОЦЕНКИ ЭКСПЕРТОМ
// =====================================================

app.post('/submit-review', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      review_id,
      mixing_mastering_score,
      arrangement_score,
      originality_score,
      commercial_potential_score,
      overall_score,
      mixing_mastering_feedback,
      arrangement_feedback,
      originality_feedback,
      commercial_potential_feedback,
      general_feedback,
      recommendations
    } = body;

    // Валидация оценок
    const scores = [
      mixing_mastering_score,
      arrangement_score,
      originality_score,
      commercial_potential_score,
      overall_score
    ];

    for (const score of scores) {
      if (score < 1 || score > 10) {
        return c.json({ error: 'All scores must be between 1 and 10' }, 400);
      }
    }

    const review = await kv.get(`track_test:reviews:${review_id}`);
    if (!review) {
      return c.json({ error: 'Review not found' }, 404);
    }

    // Обновить оценку
    review.status = 'completed';
    review.mixing_mastering_score = mixing_mastering_score;
    review.arrangement_score = arrangement_score;
    review.originality_score = originality_score;
    review.commercial_potential_score = commercial_potential_score;
    review.overall_score = overall_score;
    review.mixing_mastering_feedback = mixing_mastering_feedback;
    review.arrangement_feedback = arrangement_feedback;
    review.originality_feedback = originality_feedback;
    review.commercial_potential_feedback = commercial_potential_feedback;
    review.general_feedback = general_feedback;
    review.recommendations = recommendations;
    review.completed_at = new Date().toISOString();

    await kv.set(`track_test:reviews:${review_id}`, review);

    // Выплатить награду эксперту (50 коинов)
    if (!review.reward_paid) {
      // TODO: интеграция с системой коинов
      review.reward_paid = true;
      console.log(`💰 Reward (50 coins) paid to expert: ${review.expert_email}`);
    }

    // Обновить статус заявки
    const request = await kv.get(`track_test:requests:${review.request_id}`);
    if (request) {
      request.completed_reviews_count += 1;
      
      // Если это первая завершенная оценка
      if (request.completed_reviews_count === 1 && request.status === 'experts_assigned') {
        request.status = 'review_in_progress';
      }

      // Если все оценки собраны
      if (request.completed_reviews_count >= request.required_expert_count) {
        await consolidateReviews(request);
        request.status = 'pending_admin_review';
      }

      request.updated_at = new Date().toISOString();
      await kv.set(`track_test:requests:${review.request_id}`, request);
    }

    console.log(`✅ Expert review submitted: ${review_id}`);

    return c.json({
      success: true,
      message: 'Review submitted successfully',
      reward: 50
    });

  } catch (error) {
    console.error('❌ Error submitting review:', error);
    return c.json({ error: 'Failed to submit review' }, 500);
  }
});

// =====================================================
// 6. КОНСОЛИДАЦИЯ РЕЗУЛЬТАТОВ (автоматическая)
// =====================================================

async function consolidateReviews(request: TrackTestRequest) {
  try {
    const reviewIds = await kv.get(`track_test:request:${request.id}:reviews`) || [];
    const reviews: ExpertReview[] = [];

    for (const reviewId of reviewIds) {
      const review = await kv.get(`track_test:reviews:${reviewId}`);
      if (review && review.status === 'completed') {
        reviews.push(review);
      }
    }

    if (reviews.length === 0) return;

    // Рассчитать средние оценки
    const averages = {
      mixing_mastering: 0,
      arrangement: 0,
      originality: 0,
      commercial_potential: 0,
      overall: 0
    };

    for (const review of reviews) {
      averages.mixing_mastering += review.mixing_mastering_score;
      averages.arrangement += review.arrangement_score;
      averages.originality += review.originality_score;
      averages.commercial_potential += review.commercial_potential_score;
      averages.overall += review.overall_score;
    }

    const count = reviews.length;
    request.category_averages = {
      mixing_mastering: Number((averages.mixing_mastering / count).toFixed(1)),
      arrangement: Number((averages.arrangement / count).toFixed(1)),
      originality: Number((averages.originality / count).toFixed(1)),
      commercial_potential: Number((averages.commercial_potential / count).toFixed(1))
    };
    request.average_rating = Number((averages.overall / count).toFixed(1));

    // AI-генерация консолидированного фидбека (симуляция)
    request.consolidated_feedback = generateConsolidatedFeedback(reviews);
    request.consolidated_recommendations = generateConsolidatedRecommendations(reviews);

    console.log(`📊 Reviews consolidated for request: ${request.id}`);

  } catch (error) {
    console.error('❌ Error consolidating reviews:', error);
  }
}

function generateConsolidatedFeedback(reviews: ExpertReview[]): string {
  // Симуляция AI-генерации
  // В production здесь будет вызов OpenAI/Claude API
  
  let feedback = `На основе оценок ${reviews.length} экспертов:\n\n`;
  
  feedback += '🎵 **Сведение и мастеринг:** Эксперты отметили ';
  const mixingScores = reviews.map(r => r.mixing_mastering_score);
  const avgMixing = mixingScores.reduce((a, b) => a + b, 0) / mixingScores.length;
  
  if (avgMixing >= 8) {
    feedback += 'высокое качество звучания и профессиональный баланс частот.\n\n';
  } else if (avgMixing >= 6) {
    feedback += 'хорошее качество с некоторыми аспектами для улучшения.\n\n';
  } else {
    feedback += 'необходимость доработки сведения и мастеринга.\n\n';
  }

  feedback += '🎯 **Аранжировка:** ';
  const arrScores = reviews.map(r => r.arrangement_score);
  const avgArr = arrScores.reduce((a, b) => a + b, 0) / arrScores.length;
  
  if (avgArr >= 8) {
    feedback += 'Гармоничная структура и продуманная инструментовка.\n\n';
  } else if (avgArr >= 6) {
    feedback += 'Интересные идеи, есть возможности для улучшения структуры.\n\n';
  } else {
    feedback += 'Рекомендуется пересмотреть структуру и аранжировку.\n\n';
  }

  feedback += '🏆 **Оригинальность:** ';
  const origScores = reviews.map(r => r.originality_score);
  const avgOrig = origScores.reduce((a, b) => a + b, 0) / origScores.length;
  
  if (avgOrig >= 8) {
    feedback += 'Уникальное звучание, выделяется среди конкурентов.\n\n';
  } else if (avgOrig >= 6) {
    feedback += 'Приятное звучание с элементами оригинальности.\n\n';
  } else {
    feedback += 'Можно добавить больше уникальных элементов.\n\n';
  }

  feedback += '📈 **Коммерческий потенциал:** ';
  const commScores = reviews.map(r => r.commercial_potential_score);
  const avgComm = commScores.reduce((a, b) => a + b, 0) / commScores.length;
  
  if (avgComm >= 8) {
    feedback += 'Высокий потенциал успеха на рынке.';
  } else if (avgComm >= 6) {
    feedback += 'Хорошие шансы найти свою аудиторию.';
  } else {
    feedback += 'Рекомендуется доработка перед релизом.';
  }

  return feedback;
}

function generateConsolidatedRecommendations(reviews: ExpertReview[]): string {
  let recommendations = '📝 **Общие рекомендации экспертов:**\n\n';
  
  // Собираем ключевые рекомендации
  const allRecommendations = reviews
    .map(r => r.recommendations)
    .filter(r => r && r.trim().length > 0);
  
  if (allRecommendations.length > 0) {
    recommendations += allRecommendations
      .map((rec, index) => `${index + 1}. ${rec}`)
      .join('\n');
  } else {
    recommendations += 'Продолжайте развивать свой уникальный стиль и совершенствовать навыки производства.';
  }

  return recommendations;
}

// =====================================================
// 7. ФИНАЛИЗАЦИЯ И ОТПРАВКА РЕЗУЛЬТАТОВ (администратор)
// =====================================================

app.post('/finalize', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id } = body;

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    if (request.status !== 'pending_admin_review') {
      return c.json({ error: 'Request is not ready for finalization' }, 400);
    }

    request.status = 'completed';
    request.completed_at = new Date().toISOString();
    request.updated_at = new Date().toISOString();

    await kv.set(`track_test:requests:${request_id}`, request);

    // Отправить результаты артисту
    const recipient = request.guest_email || request.user_id;
    console.log(`📧 Results sent to: ${recipient}`);

    // TODO: Отправить email с полным отчетом
    // TODO: Создать уведомление в системе

    console.log(`✅ Track test finalized: ${request_id}`);

    return c.json({
      success: true,
      status: 'completed',
      message: 'Results sent to artist'
    });

  } catch (error) {
    console.error('❌ Error finalizing request:', error);
    return c.json({ error: 'Failed to finalize request' }, 500);
  }
});

// =====================================================
// 8. ПОЛУЧЕНИЕ ДАННЫХ
// =====================================================

// Получить список заявок пользователя
app.get('/requests', async (c) => {
  try {
    const userId = c.req.query('user_id');
    
    if (!userId) {
      return c.json({ error: 'User ID required' }, 400);
    }

    const requestIds = await kv.get(`track_test:user:${userId}:requests`) || [];
    const requests = [];

    for (const requestId of requestIds) {
      const request = await kv.get(`track_test:requests:${requestId}`);
      if (request) {
        requests.push(request);
      }
    }

    return c.json({
      success: true,
      requests,
      total: requests.length
    });

  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

// Получить детали заявки
app.get('/requests/:id', async (c) => {
  try {
    const requestId = c.req.param('id');
    
    const request = await kv.get(`track_test:requests:${requestId}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Получить все оценки экспертов
    const reviewIds = await kv.get(`track_test:request:${requestId}:reviews`) || [];
    const reviews = [];

    for (const reviewId of reviewIds) {
      const review = await kv.get(`track_test:reviews:${reviewId}`);
      if (review) {
        reviews.push(review);
      }
    }

    return c.json({
      success: true,
      request,
      reviews,
      reviews_count: reviews.length
    });

  } catch (error) {
    console.error('❌ Error fetching request details:', error);
    return c.json({ error: 'Failed to fetch request details' }, 500);
  }
});

// Получить все заявки (для администратора)
app.get('/admin/requests', async (c) => {
  try {
    const status = c.req.query('status');
    const allRequestIds = await kv.get('track_test:all_requests') || [];
    const requests = [];

    for (const requestId of allRequestIds) {
      const request = await kv.get(`track_test:requests:${requestId}`);
      if (request) {
        if (!status || request.status === status) {
          requests.push(request);
        }
      }
    }

    return c.json({
      success: true,
      requests,
      total: requests.length
    });

  } catch (error) {
    console.error('❌ Error fetching admin requests:', error);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

// Получить назначенные оценки для эксперта
app.get('/expert/reviews', async (c) => {
  try {
    const expertEmail = c.req.query('email');
    
    if (!expertEmail) {
      return c.json({ error: 'Expert email required' }, 400);
    }

    // Поиск всех оценок для эксперта
    const allRequestIds = await kv.get('track_test:all_requests') || [];
    const expertReviews = [];

    for (const requestId of allRequestIds) {
      const reviewIds = await kv.get(`track_test:request:${requestId}:reviews`) || [];
      
      for (const reviewId of reviewIds) {
        const review = await kv.get(`track_test:reviews:${reviewId}`);
        if (review && review.expert_email === expertEmail) {
          const request = await kv.get(`track_test:requests:${requestId}`);
          expertReviews.push({
            review,
            request
          });
        }
      }
    }

    return c.json({
      success: true,
      reviews: expertReviews,
      total: expertReviews.length
    });

  } catch (error) {
    console.error('❌ Error fetching expert reviews:', error);
    return c.json({ error: 'Failed to fetch expert reviews' }, 500);
  }
});

export default app;
