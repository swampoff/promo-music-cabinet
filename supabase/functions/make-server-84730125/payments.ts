/**
 * PAYMENTS API - Функции для работы с платежами
 * Полная интеграция с Supabase
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Типы
export type TransactionType = 'income' | 'expense' | 'withdraw';
export type TransactionCategory = 
  | 'donate'
  | 'concert'
  | 'radio'
  | 'streaming'
  | 'ticket_sales'
  | 'venue_royalties'
  | 'marketing'
  | 'coins'
  | 'subscription'
  | 'pitching'
  | 'banner'
  | 'withdraw';
export type TransactionStatus = 'completed' | 'processing' | 'failed' | 'cancelled';
export type WithdrawStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  fee: number;
  net_amount: number;
  from_name?: string;
  from_email?: string;
  to_name?: string;
  to_email?: string;
  description: string;
  message?: string;
  payment_method?: string;
  transaction_id?: string;
  transaction_date: string;
  transaction_time: string;
  status: TransactionStatus;
  metadata?: any;
  // Специфичные поля
  tickets_sold?: number;
  ticket_price?: number;
  event_name?: string;
  event_date?: string;
  venue?: string;
  tracks?: string[];
  plays_count?: number;
  venues?: string[];
  venues_count?: number;
  period?: string;
  coins_amount?: number;
  coins_spent?: number;
  subscription_period?: string;
  next_billing?: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'yoomoney' | 'bank_transfer' | 'crypto' | 'auto';
  card_number_masked?: string;
  card_holder?: string;
  card_expires?: string;
  card_brand?: string;
  is_default: boolean;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WithdrawRequest {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  payment_method_id: string;
  status: WithdrawStatus;
  status_message?: string;
  requested_at: string;
  processed_at?: string;
  completed_at?: string;
  transaction_id?: string;
}

export interface UserBalance {
  user_id: string;
  balance: number;
  available_balance: number;
  pending_balance: number;
  total_income: number;
  total_expense: number;
  total_withdrawn: number;
  transactions_count: number;
  last_transaction_at?: string;
}

// ========================================
// ФУНКЦИИ API
// ========================================

/**
 * Получить все транзакции пользователя
 */
export async function getTransactions(
  userId: string,
  filters?: {
    type?: TransactionType;
    category?: TransactionCategory;
    status?: TransactionStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let query = supabase
    .from('make_transactions_84730125')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Применение фильтров
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`description.ilike.%${filters.search}%,from_name.ilike.%${filters.search}%,to_name.ilike.%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data as Transaction[];
}

/**
 * Создать новую транзакцию
 */
export async function createTransaction(
  userId: string,
  type: TransactionType,
  category: TransactionCategory,
  amount: number,
  description: string,
  metadata?: any
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .rpc('create_transaction_84730125', {
      p_user_id: userId,
      p_type: type,
      p_category: category,
      p_amount: amount,
      p_description: description,
      p_metadata: metadata || {}
    });

  if (error) {
    console.error('Error creating transaction:', error);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}

/**
 * Получить баланс пользователя
 */
export async function getUserBalance(userId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('make_user_balances_84730125')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error fetching balance:', error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }

  // Если баланса нет, создаём
  if (!data) {
    const { data: newBalance, error: createError } = await supabase
      .from('make_user_balances_84730125')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      console.error('Error creating balance:', createError);
      throw new Error(`Failed to create balance: ${createError.message}`);
    }

    return newBalance as UserBalance;
  }

  return data as UserBalance;
}

/**
 * Получить статистику пользователя
 */
export async function getUserStats(userId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .rpc('get_user_stats_84730125', {
      p_user_id: userId
    });

  if (error) {
    console.error('Error fetching stats:', error);
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Получить методы оплаты пользователя
 */
export async function getPaymentMethods(userId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('make_payment_methods_84730125')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching payment methods:', error);
    throw new Error(`Failed to fetch payment methods: ${error.message}`);
  }

  return data as PaymentMethod[];
}

/**
 * Добавить метод оплаты
 */
export async function addPaymentMethod(
  userId: string,
  method: {
    type: 'card' | 'yoomoney' | 'bank_transfer' | 'crypto';
    card_number_masked?: string;
    card_holder?: string;
    card_expires?: string;
    card_brand?: string;
    is_default?: boolean;
  }
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Если это метод по умолчанию, сбрасываем флаг у остальных
  if (method.is_default) {
    await supabase
      .from('make_payment_methods_84730125')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('make_payment_methods_84730125')
    .insert({
      user_id: userId,
      ...method,
      is_verified: true, // В production нужна верификация
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding payment method:', error);
    throw new Error(`Failed to add payment method: ${error.message}`);
  }

  return data as PaymentMethod;
}

/**
 * Создать заявку на вывод средств
 */
export async function createWithdrawRequest(
  userId: string,
  amount: number,
  paymentMethodId: string
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .rpc('create_withdraw_request_84730125', {
      p_user_id: userId,
      p_amount: amount,
      p_payment_method_id: paymentMethodId
    });

  if (error) {
    console.error('Error creating withdraw request:', error);
    throw new Error(`Failed to create withdraw request: ${error.message}`);
  }

  return data;
}

/**
 * Получить заявки на вывод
 */
export async function getWithdrawRequests(
  userId: string,
  status?: WithdrawStatus
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let query = supabase
    .from('make_withdraw_requests_84730125')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching withdraw requests:', error);
    throw new Error(`Failed to fetch withdraw requests: ${error.message}`);
  }

  return data as WithdrawRequest[];
}

/**
 * Получить статистику по категориям
 */
export async function getCategoryStats(
  userId: string,
  type: TransactionType,
  period: 'month' | 'year' | 'all' = 'month'
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let query = supabase
    .from('make_transactions_84730125')
    .select('category, amount, net_amount')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('status', 'completed');

  // Фильтр по периоду
  const now = new Date();
  if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    query = query.gte('transaction_date', firstDay.toISOString().split('T')[0]);
  } else if (period === 'year') {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    query = query.gte('transaction_date', firstDay.toISOString().split('T')[0]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching category stats:', error);
    throw new Error(`Failed to fetch category stats: ${error.message}`);
  }

  // Группировка по категориям
  const stats = data.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = {
        category: item.category,
        total: 0,
        net_total: 0,
        count: 0
      };
    }
    acc[item.category].total += Number(item.amount);
    acc[item.category].net_total += Number(item.net_amount);
    acc[item.category].count += 1;
    return acc;
  }, {});

  return Object.values(stats);
}

/**
 * Синхронизация донатов с транзакциями
 */
export async function syncDonationToTransaction(
  userId: string,
  donationData: {
    amount: number;
    from_name: string;
    from_email?: string;
    message?: string;
    payment_method?: string;
  }
) {
  return await createTransaction(
    userId,
    'income',
    'donate',
    donationData.amount,
    `Донат от ${donationData.from_name}`,
    {
      from_name: donationData.from_name,
      from_email: donationData.from_email,
      message: donationData.message,
      payment_method: donationData.payment_method
    }
  );
}

/**
 * Синхронизация подписки с транзакциями
 */
export async function syncSubscriptionToTransaction(
  userId: string,
  subscriptionData: {
    amount: number;
    period: string;
    next_billing?: string;
  }
) {
  return await createTransaction(
    userId,
    'expense',
    'subscription',
    subscriptionData.amount,
    `Продление подписки (${subscriptionData.period})`,
    {
      subscription_period: subscriptionData.period,
      next_billing: subscriptionData.next_billing,
      payment_method: 'Автоплатёж'
    }
  );
}
