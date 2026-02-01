/**
 * Payments & Subscriptions API Service
 * Сервис для работы с платежами и подписками
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { getAccessToken } from '@/lib/supabase';
import type {
  Subscription,
  Payment,
  SubscriptionPlan,
  PaymentMethod,
  CreatePaymentInput,
  ApiResponse
} from '@/types/database';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// Helper to make authenticated requests
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================
// PLAN DETAILS
// ============================================

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, {
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Subscription['limits'];
}> = {
  free: {
    name: 'Бесплатный',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      'До 3 треков в месяц',
      'Базовая аналитика (7 дней)',
      '1 ГБ хранилища',
    ],
    limits: {
      tracks_per_month: 3,
      videos_per_month: 1,
      storage_gb: 1,
      analytics_days: 7,
      promotions_per_month: 0,
    },
  },
  basic: {
    name: 'Базовый',
    price_monthly: 499,
    price_yearly: 4990,
    features: [
      'До 10 треков в месяц',
      'До 3 видео в месяц',
      'Аналитика за 30 дней',
      '10 ГБ хранилища',
      '1 продвижение в месяц',
    ],
    limits: {
      tracks_per_month: 10,
      videos_per_month: 3,
      storage_gb: 10,
      analytics_days: 30,
      promotions_per_month: 1,
    },
  },
  pro: {
    name: 'Профессиональный',
    price_monthly: 1499,
    price_yearly: 14990,
    features: [
      'Безлимитные треки',
      'До 10 видео в месяц',
      'Аналитика за 90 дней',
      '50 ГБ хранилища',
      '5 продвижений в месяц',
      'Приоритетная модерация',
      'Расширенная статистика',
    ],
    limits: {
      tracks_per_month: -1, // unlimited
      videos_per_month: 10,
      storage_gb: 50,
      analytics_days: 90,
      promotions_per_month: 5,
    },
  },
  enterprise: {
    name: 'Корпоративный',
    price_monthly: 4999,
    price_yearly: 49990,
    features: [
      'Безлимитные треки и видео',
      'Полная аналитика (1 год)',
      '200 ГБ хранилища',
      'Безлимитные продвижения',
      'Выделенный менеджер',
      'API доступ',
      'Белый лейбл',
    ],
    limits: {
      tracks_per_month: -1,
      videos_per_month: -1,
      storage_gb: 200,
      analytics_days: 365,
      promotions_per_month: -1,
    },
  },
};

// ============================================
// SUBSCRIPTIONS API
// ============================================

export const subscriptionsApi = {
  // Get current subscription
  async getCurrent(): Promise<ApiResponse<Subscription>> {
    return fetchWithAuth<Subscription>('/subscriptions/current');
  },

  // Get subscription history
  async getHistory(): Promise<ApiResponse<Subscription[]>> {
    return fetchWithAuth<Subscription[]>('/subscriptions/history');
  },

  // Create/upgrade subscription
  async create(plan: SubscriptionPlan, billing_period: 'monthly' | 'yearly'): Promise<ApiResponse<{
    subscription: Subscription;
    payment_url?: string;
  }>> {
    return fetchWithAuth('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ plan, billing_period }),
    });
  },

  // Cancel subscription
  async cancel(): Promise<ApiResponse<Subscription>> {
    return fetchWithAuth<Subscription>('/subscriptions/cancel', {
      method: 'POST',
    });
  },

  // Reactivate cancelled subscription
  async reactivate(): Promise<ApiResponse<Subscription>> {
    return fetchWithAuth<Subscription>('/subscriptions/reactivate', {
      method: 'POST',
    });
  },

  // Change plan
  async changePlan(plan: SubscriptionPlan): Promise<ApiResponse<{
    subscription: Subscription;
    proration?: number;
  }>> {
    return fetchWithAuth('/subscriptions/change-plan', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },
};

// ============================================
// PAYMENTS API
// ============================================

export const paymentsApi = {
  // Get all payments
  async getAll(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Payment[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchWithAuth<Payment[]>(`/payments${query ? `?${query}` : ''}`);
  },

  // Get payment by ID
  async getById(id: string): Promise<ApiResponse<Payment>> {
    return fetchWithAuth<Payment>(`/payments/${id}`);
  },

  // Create payment (for one-time purchases, promotions, etc.)
  async create(data: CreatePaymentInput): Promise<ApiResponse<{
    payment: Payment;
    payment_url: string;
  }>> {
    return fetchWithAuth('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get payment methods
  async getMethods(): Promise<ApiResponse<{
    methods: Array<{
      id: string;
      type: PaymentMethod;
      last4?: string;
      brand?: string;
      is_default: boolean;
    }>;
  }>> {
    return fetchWithAuth('/payments/methods');
  },

  // Add payment method
  async addMethod(type: PaymentMethod): Promise<ApiResponse<{
    setup_url: string;
  }>> {
    return fetchWithAuth('/payments/methods', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  // Remove payment method
  async removeMethod(id: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithAuth(`/payments/methods/${id}`, {
      method: 'DELETE',
    });
  },

  // Set default payment method
  async setDefaultMethod(id: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithAuth(`/payments/methods/${id}/default`, {
      method: 'POST',
    });
  },

  // Request refund
  async requestRefund(id: string, reason: string): Promise<ApiResponse<Payment>> {
    return fetchWithAuth<Payment>(`/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_SUBSCRIPTION: Subscription = {
  id: 'mock-sub-1',
  user_id: 'mock-user',
  plan: 'pro',
  status: 'active',
  price: 1499,
  currency: 'RUB',
  billing_period: 'monthly',
  started_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
  current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
  is_trial: false,
  features: SUBSCRIPTION_PLANS.pro.features,
  limits: SUBSCRIPTION_PLANS.pro.limits,
  payment_method: 'card',
  created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'mock-payment-1',
    user_id: 'mock-user',
    subscription_id: 'mock-sub-1',
    amount: 1499,
    currency: 'RUB',
    status: 'completed',
    payment_method: 'card',
    external_payment_id: 'yoo_123456',
    description: 'Подписка Pro - Январь 2026',
    receipt_url: 'https://example.com/receipt/1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-payment-2',
    user_id: 'mock-user',
    subscription_id: 'mock-sub-1',
    amount: 1499,
    currency: 'RUB',
    status: 'completed',
    payment_method: 'card',
    external_payment_id: 'yoo_123455',
    description: 'Подписка Pro - Декабрь 2025',
    receipt_url: 'https://example.com/receipt/2',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-payment-3',
    user_id: 'mock-user',
    amount: 500,
    currency: 'RUB',
    status: 'completed',
    payment_method: 'sbp',
    external_payment_id: 'sbp_789012',
    description: 'Продвижение трека "Midnight Dreams" - 7 дней',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_PAYMENT_METHODS = [
  {
    id: 'method-1',
    type: 'card' as PaymentMethod,
    last4: '4242',
    brand: 'Visa',
    is_default: true,
  },
  {
    id: 'method-2',
    type: 'sbp' as PaymentMethod,
    is_default: false,
  },
];

let mockSubscriptionStore: Subscription | null = MOCK_SUBSCRIPTION;
let mockPaymentsStore = [...MOCK_PAYMENTS];
let mockPaymentMethodsStore = [...MOCK_PAYMENT_METHODS];

// ============================================
// API ADAPTERS WITH FALLBACK
// ============================================

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await subscriptionsApi.getCurrent();
    return response.success;
  } catch {
    return false;
  }
}

export const subscriptionsApiAdapter = {
  async getCurrent(): Promise<ApiResponse<Subscription>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return subscriptionsApi.getCurrent();
    }

    if (mockSubscriptionStore) {
      return { success: true, data: mockSubscriptionStore };
    }
    return { success: false, error: 'No active subscription' };
  },

  async getHistory(): Promise<ApiResponse<Subscription[]>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return subscriptionsApi.getHistory();
    }

    return { success: true, data: mockSubscriptionStore ? [mockSubscriptionStore] : [] };
  },

  async create(
    plan: SubscriptionPlan,
    billing_period: 'monthly' | 'yearly'
  ): Promise<ApiResponse<{ subscription: Subscription; payment_url?: string }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return subscriptionsApi.create(plan, billing_period);
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];
    const price = billing_period === 'monthly'
      ? planDetails.price_monthly
      : planDetails.price_yearly;

    const newSubscription: Subscription = {
      id: `mock-sub-${Date.now()}`,
      user_id: 'mock-user',
      plan,
      status: 'active',
      price,
      currency: 'RUB',
      billing_period,
      started_at: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + (billing_period === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
      ).toISOString(),
      is_trial: false,
      features: planDetails.features,
      limits: planDetails.limits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockSubscriptionStore = newSubscription;
    return {
      success: true,
      data: {
        subscription: newSubscription,
        payment_url: 'https://example.com/pay/mock',
      },
    };
  },

  async cancel(): Promise<ApiResponse<Subscription>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return subscriptionsApi.cancel();
    }

    if (mockSubscriptionStore) {
      mockSubscriptionStore = {
        ...mockSubscriptionStore,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      };
      return { success: true, data: mockSubscriptionStore };
    }
    return { success: false, error: 'No active subscription' };
  },

  async reactivate(): Promise<ApiResponse<Subscription>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return subscriptionsApi.reactivate();
    }

    if (mockSubscriptionStore && mockSubscriptionStore.status === 'cancelled') {
      mockSubscriptionStore = {
        ...mockSubscriptionStore,
        status: 'active',
        cancelled_at: undefined,
      };
      return { success: true, data: mockSubscriptionStore };
    }
    return { success: false, error: 'Cannot reactivate' };
  },

  async changePlan(plan: SubscriptionPlan): Promise<ApiResponse<{
    subscription: Subscription;
    proration?: number;
  }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return subscriptionsApi.changePlan(plan);
    }

    if (mockSubscriptionStore) {
      const planDetails = SUBSCRIPTION_PLANS[plan];
      mockSubscriptionStore = {
        ...mockSubscriptionStore,
        plan,
        price: mockSubscriptionStore.billing_period === 'monthly'
          ? planDetails.price_monthly
          : planDetails.price_yearly,
        features: planDetails.features,
        limits: planDetails.limits,
        updated_at: new Date().toISOString(),
      };
      return { success: true, data: { subscription: mockSubscriptionStore, proration: 0 } };
    }
    return { success: false, error: 'No active subscription' };
  },

  getPlanDetails(plan: SubscriptionPlan) {
    return SUBSCRIPTION_PLANS[plan];
  },

  getAllPlans() {
    return SUBSCRIPTION_PLANS;
  },

  resetMockData() {
    mockSubscriptionStore = { ...MOCK_SUBSCRIPTION };
  },
};

export const paymentsApiAdapter = {
  async getAll(params?: { limit?: number; offset?: number }): Promise<ApiResponse<Payment[]>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.getAll(params);
    }

    let payments = [...mockPaymentsStore];
    payments.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    payments = payments.slice(offset, offset + limit);

    return { success: true, data: payments };
  },

  async getById(id: string): Promise<ApiResponse<Payment>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.getById(id);
    }

    const payment = mockPaymentsStore.find(p => p.id === id);
    return payment
      ? { success: true, data: payment }
      : { success: false, error: 'Payment not found' };
  },

  async create(data: CreatePaymentInput): Promise<ApiResponse<{
    payment: Payment;
    payment_url: string;
  }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.create(data);
    }

    const newPayment: Payment = {
      id: `mock-payment-${Date.now()}`,
      user_id: 'mock-user',
      subscription_id: data.subscription_id,
      amount: data.amount,
      currency: data.currency || 'RUB',
      status: 'pending',
      payment_method: data.payment_method,
      description: data.description,
      created_at: new Date().toISOString(),
    };

    mockPaymentsStore.push(newPayment);
    return {
      success: true,
      data: {
        payment: newPayment,
        payment_url: 'https://example.com/pay/mock',
      },
    };
  },

  async getMethods(): Promise<ApiResponse<{ methods: typeof MOCK_PAYMENT_METHODS }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.getMethods();
    }

    return { success: true, data: { methods: mockPaymentMethodsStore } };
  },

  async addMethod(type: PaymentMethod): Promise<ApiResponse<{ setup_url: string }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.addMethod(type);
    }

    return { success: true, data: { setup_url: 'https://example.com/setup/mock' } };
  },

  async removeMethod(id: string): Promise<ApiResponse<{ message: string }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.removeMethod(id);
    }

    const index = mockPaymentMethodsStore.findIndex(m => m.id === id);
    if (index !== -1) {
      mockPaymentMethodsStore.splice(index, 1);
      return { success: true, data: { message: 'Method removed' } };
    }
    return { success: false, error: 'Method not found' };
  },

  async setDefaultMethod(id: string): Promise<ApiResponse<{ message: string }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.setDefaultMethod(id);
    }

    mockPaymentMethodsStore = mockPaymentMethodsStore.map(m => ({
      ...m,
      is_default: m.id === id,
    }));
    return { success: true, data: { message: 'Default method updated' } };
  },

  async requestRefund(id: string, reason: string): Promise<ApiResponse<Payment>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return paymentsApi.requestRefund(id, reason);
    }

    const index = mockPaymentsStore.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPaymentsStore[index] = {
        ...mockPaymentsStore[index],
        status: 'refunded',
        refund_amount: mockPaymentsStore[index].amount,
        refunded_at: new Date().toISOString(),
        refund_reason: reason,
      };
      return { success: true, data: mockPaymentsStore[index] };
    }
    return { success: false, error: 'Payment not found' };
  },

  resetMockData() {
    mockPaymentsStore = [...MOCK_PAYMENTS];
    mockPaymentMethodsStore = [...MOCK_PAYMENT_METHODS];
  },
};
