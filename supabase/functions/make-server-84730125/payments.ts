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
    .from('transactions')
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

  // Map category to transaction_type enum
  const transactionTypeMap: Record<TransactionType, string> = {
    'income': 'deposit',
    'expense': 'subscription',
    'withdraw': 'withdrawal'
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      transaction_type: transactionTypeMap[type] || 'deposit',
      amount: amount,
      currency: 'USD',
      status: 'completed',
      payment_method: 'card',
      description: description,
      net_amount: amount,
      payment_metadata: metadata || {},
      processed_at: new Date().toISOString()
    })
    .select()
    .single();

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
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', 'USD')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error fetching balance:', error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }

  // Если кошелька нет, создаём
  if (!data) {
    const { data: newWallet, error: createError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userId,
        currency: 'USD',
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating wallet:', createError);
      throw new Error(`Failed to create wallet: ${createError.message}`);
    }

    // Map to UserBalance interface
    return {
      user_id: newWallet.user_id,
      balance: newWallet.available_balance,
      available_balance: newWallet.available_balance,
      pending_balance: newWallet.pending_balance,
      total_income: newWallet.total_earned,
      total_expense: 0,
      total_withdrawn: newWallet.total_withdrawn,
      transactions_count: 0
    } as UserBalance;
  }

  // Map user_wallets to UserBalance interface
  return {
    user_id: data.user_id,
    balance: data.available_balance,
    available_balance: data.available_balance,
    pending_balance: data.pending_balance,
    total_income: data.total_earned,
    total_expense: 0,
    total_withdrawn: data.total_withdrawn,
    transactions_count: 0
  } as UserBalance;
}

/**
 * Получить статистику пользователя
 */
export async function getUserStats(userId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get wallet balance
  const { data: wallet } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', 'USD')
    .single();

  // Get transaction counts
  const { count: totalTransactions } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Calculate stats from transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, transaction_type, status')
    .eq('user_id', userId)
    .eq('status', 'completed');

  const stats = {
    user_id: userId,
    balance: wallet?.available_balance || 0,
    total_income: wallet?.total_earned || 0,
    total_expense: 0,
    total_withdrawn: wallet?.total_withdrawn || 0,
    transactions_count: totalTransactions || 0,
    pending_balance: wallet?.pending_balance || 0
  };

  return stats;
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
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching payment methods:', error);
    throw new Error(`Failed to fetch payment methods: ${error.message}`);
  }

  // Map to PaymentMethod interface
  return (data || []).map((pm: any) => ({
    id: pm.id,
    user_id: pm.user_id,
    type: pm.method_type || 'card',
    card_number_masked: pm.card_last4 ? `**** **** **** ${pm.card_last4}` : null,
    card_holder: pm.account_name,
    card_expires: pm.card_exp_month && pm.card_exp_year
      ? `${String(pm.card_exp_month).padStart(2, '0')}/${pm.card_exp_year}`
      : null,
    card_brand: pm.card_brand,
    is_default: pm.is_default,
    is_verified: pm.is_verified,
    is_active: pm.is_active,
    created_at: pm.created_at,
    updated_at: pm.updated_at
  })) as PaymentMethod[];
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
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  // Parse card expiry if provided
  let cardExpMonth: number | null = null;
  let cardExpYear: number | null = null;
  if (method.card_expires) {
    const parts = method.card_expires.split('/');
    cardExpMonth = parseInt(parts[0], 10);
    cardExpYear = parseInt(parts[1], 10);
    if (cardExpYear < 100) cardExpYear += 2000;
  }

  // Extract last 4 digits from masked card number
  const cardLast4 = method.card_number_masked
    ? method.card_number_masked.replace(/\D/g, '').slice(-4)
    : null;

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      method_type: method.type,
      payment_provider: 'internal',
      provider_payment_method_id: crypto.randomUUID(),
      card_brand: method.card_brand,
      card_last4: cardLast4,
      card_exp_month: cardExpMonth,
      card_exp_year: cardExpYear,
      account_name: method.card_holder,
      is_default: method.is_default || false,
      is_verified: true,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding payment method:', error);
    throw new Error(`Failed to add payment method: ${error.message}`);
  }

  // Map to PaymentMethod interface
  return {
    id: data.id,
    user_id: data.user_id,
    type: data.method_type,
    card_number_masked: cardLast4 ? `**** **** **** ${cardLast4}` : null,
    card_holder: data.account_name,
    card_expires: method.card_expires,
    card_brand: data.card_brand,
    is_default: data.is_default,
    is_verified: data.is_verified,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at
  } as PaymentMethod;
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

  // Get payment method details
  const { data: paymentMethod, error: pmError } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('id', paymentMethodId)
    .single();

  if (pmError) {
    throw new Error('Payment method not found');
  }

  // Calculate fee (e.g., 2% fee)
  const fee = amount * 0.02;
  const netPayout = amount - fee;

  const { data, error } = await supabase
    .from('payout_requests')
    .insert({
      user_id: userId,
      amount: amount,
      currency: 'USD',
      payout_method: paymentMethod.method_type,
      payout_details: {
        payment_method_id: paymentMethodId,
        card_last4: paymentMethod.card_last4,
        account_name: paymentMethod.account_name
      },
      status: 'pending',
      payout_fee: fee,
      net_payout: netPayout
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating withdraw request:', error);
    throw new Error(`Failed to create withdraw request: ${error.message}`);
  }

  // Map to WithdrawRequest interface
  return {
    id: data.id,
    user_id: data.user_id,
    amount: data.amount,
    fee: data.payout_fee,
    net_amount: data.net_payout,
    payment_method_id: paymentMethodId,
    status: data.status,
    requested_at: data.created_at
  } as WithdrawRequest;
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
    .from('payout_requests')
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

  // Map to WithdrawRequest interface
  return (data || []).map((req: any) => ({
    id: req.id,
    user_id: req.user_id,
    amount: req.amount,
    fee: req.payout_fee || 0,
    net_amount: req.net_payout || req.amount,
    payment_method_id: req.payout_details?.payment_method_id,
    status: req.status,
    status_message: req.rejection_reason,
    requested_at: req.created_at,
    processed_at: req.processed_at,
    completed_at: req.processed_at,
    transaction_id: req.transaction_id
  })) as WithdrawRequest[];
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
    .from('transactions')
    .select('transaction_type, amount, net_amount')
    .eq('user_id', userId)
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

  // Группировка по типу транзакции
  const stats = data.reduce((acc: any, item: any) => {
    const category = item.transaction_type || 'other';
    if (!acc[category]) {
      acc[category] = {
        category: category,
        total: 0,
        net_total: 0,
        count: 0
      };
    }
    acc[category].total += Number(item.amount);
    acc[category].net_total += Number(item.net_amount || item.amount);
    acc[category].count += 1;
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
