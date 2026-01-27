/**
 * PAYMENTS ROUTES - API роуты для системы платежей
 */

import { Hono } from 'npm:hono';
import {
  getTransactions,
  createTransaction,
  getUserBalance,
  getUserStats,
  getPaymentMethods,
  addPaymentMethod,
  createWithdrawRequest,
  getWithdrawRequests,
  getCategoryStats,
  syncDonationToTransaction,
  syncSubscriptionToTransaction,
} from './payments.ts';

const paymentsRoutes = new Hono();

// ========================================
// ТРАНЗАКЦИИ
// ========================================

/**
 * GET /make-server-84730125/payments/transactions
 * Получить все транзакции пользователя
 */
paymentsRoutes.get('/transactions', async (c) => {
  try {
    const userId = c.req.query('user_id');
    if (!userId) {
      return c.json({ error: 'user_id is required' }, 400);
    }

    const filters = {
      type: c.req.query('type') as any,
      category: c.req.query('category') as any,
      status: c.req.query('status') as any,
      search: c.req.query('search'),
      limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50,
      offset: c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0,
    };

    const transactions = await getTransactions(userId, filters);
    return c.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error('Error in GET /payments/transactions:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-84730125/payments/transactions
 * Создать новую транзакцию
 */
paymentsRoutes.post('/transactions', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, type, category, amount, description, metadata } = body;

    if (!user_id || !type || !category || !amount || !description) {
      return c.json({ 
        error: 'Missing required fields: user_id, type, category, amount, description' 
      }, 400);
    }

    const transactionId = await createTransaction(
      user_id,
      type,
      category,
      amount,
      description,
      metadata
    );

    return c.json({ 
      success: true, 
      data: { transaction_id: transactionId } 
    });
  } catch (error: any) {
    console.error('Error in POST /payments/transactions:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========================================
// БАЛАНС И СТАТИСТИКА
// ========================================

/**
 * GET /make-server-84730125/payments/balance
 * Получить баланс пользователя
 */
paymentsRoutes.get('/balance', async (c) => {
  try {
    const userId = c.req.query('user_id');
    if (!userId) {
      return c.json({ error: 'user_id is required' }, 400);
    }

    const balance = await getUserBalance(userId);
    return c.json({ success: true, data: balance });
  } catch (error: any) {
    console.error('Error in GET /payments/balance:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /make-server-84730125/payments/stats
 * Получить статистику пользователя
 */
paymentsRoutes.get('/stats', async (c) => {
  try {
    const userId = c.req.query('user_id');
    if (!userId) {
      return c.json({ error: 'user_id is required' }, 400);
    }

    const stats = await getUserStats(userId);
    return c.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error in GET /payments/stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /make-server-84730125/payments/category-stats
 * Получить статистику по категориям
 */
paymentsRoutes.get('/category-stats', async (c) => {
  try {
    const userId = c.req.query('user_id');
    const type = c.req.query('type') as any;
    const period = (c.req.query('period') || 'month') as 'month' | 'year' | 'all';

    if (!userId || !type) {
      return c.json({ error: 'user_id and type are required' }, 400);
    }

    const stats = await getCategoryStats(userId, type, period);
    return c.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error in GET /payments/category-stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========================================
// МЕТОДЫ ОПЛАТЫ
// ========================================

/**
 * GET /make-server-84730125/payments/payment-methods
 * Получить методы оплаты пользователя
 */
paymentsRoutes.get('/payment-methods', async (c) => {
  try {
    const userId = c.req.query('user_id');
    if (!userId) {
      return c.json({ error: 'user_id is required' }, 400);
    }

    const methods = await getPaymentMethods(userId);
    return c.json({ success: true, data: methods });
  } catch (error: any) {
    console.error('Error in GET /payments/payment-methods:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-84730125/payments/payment-methods
 * Добавить метод оплаты
 */
paymentsRoutes.post('/payment-methods', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, ...methodData } = body;

    if (!user_id || !methodData.type) {
      return c.json({ error: 'user_id and type are required' }, 400);
    }

    const method = await addPaymentMethod(user_id, methodData);
    return c.json({ success: true, data: method });
  } catch (error: any) {
    console.error('Error in POST /payments/payment-methods:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========================================
// ВЫВОД СРЕДСТВ
// ========================================

/**
 * GET /make-server-84730125/payments/withdrawals
 * Получить заявки на вывод
 */
paymentsRoutes.get('/withdrawals', async (c) => {
  try {
    const userId = c.req.query('user_id');
    const status = c.req.query('status') as any;

    if (!userId) {
      return c.json({ error: 'user_id is required' }, 400);
    }

    const requests = await getWithdrawRequests(userId, status);
    return c.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error in GET /payments/withdrawals:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-84730125/payments/withdrawals
 * Создать заявку на вывод
 */
paymentsRoutes.post('/withdrawals', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, amount, payment_method_id } = body;

    if (!user_id || !amount || !payment_method_id) {
      return c.json({ 
        error: 'Missing required fields: user_id, amount, payment_method_id' 
      }, 400);
    }

    const requestId = await createWithdrawRequest(user_id, amount, payment_method_id);
    return c.json({ 
      success: true, 
      data: { request_id: requestId } 
    });
  } catch (error: any) {
    console.error('Error in POST /payments/withdrawals:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========================================
// СИНХРОНИЗАЦИЯ С ДРУГИМИ МОДУЛЯМИ
// ========================================

/**
 * POST /make-server-84730125/payments/sync/donation
 * Синхронизация доната с транзакциями
 */
paymentsRoutes.post('/sync/donation', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, donation_data } = body;

    if (!user_id || !donation_data) {
      return c.json({ error: 'user_id and donation_data are required' }, 400);
    }

    const transactionId = await syncDonationToTransaction(user_id, donation_data);
    return c.json({ 
      success: true, 
      data: { transaction_id: transactionId } 
    });
  } catch (error: any) {
    console.error('Error in POST /payments/sync/donation:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-84730125/payments/sync/subscription
 * Синхронизация подписки с транзакциями
 */
paymentsRoutes.post('/sync/subscription', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, subscription_data } = body;

    if (!user_id || !subscription_data) {
      return c.json({ error: 'user_id and subscription_data are required' }, 400);
    }

    const transactionId = await syncSubscriptionToTransaction(user_id, subscription_data);
    return c.json({ 
      success: true, 
      data: { transaction_id: transactionId } 
    });
  } catch (error: any) {
    console.error('Error in POST /payments/sync/subscription:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========================================
// WEBHOOK (для внешних платёжных систем)
// ========================================

/**
 * POST /make-server-84730125/payments/webhook
 * Webhook для получения уведомлений от платёжных систем
 */
paymentsRoutes.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Received payment webhook:', body);

    // Здесь будет логика обработки webhook от ЮMoney, PayPal и т.д.
    // TODO: Верификация подписи, обновление статуса транзакции

    return c.json({ success: true, message: 'Webhook received' });
  } catch (error: any) {
    console.error('Error in POST /payments/webhook:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default paymentsRoutes;
