/**
 * usePayments & useSubscription Hooks
 * React hooks для работы с платежами и подписками
 */

import { useState, useEffect, useCallback } from 'react';
import {
  subscriptionsApiAdapter,
  paymentsApiAdapter,
  SUBSCRIPTION_PLANS,
} from '@/services/payments-api';
import type {
  Subscription,
  Payment,
  SubscriptionPlan,
  PaymentMethod,
  CreatePaymentInput,
} from '@/types/database';

// ============================================
// useSubscription Hook
// ============================================

interface UseSubscriptionOptions {
  autoFetch?: boolean;
}

export function useSubscription(options: UseSubscriptionOptions = { autoFetch: true }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current subscription
   */
  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await subscriptionsApiAdapter.getCurrent();
      if (result.success && result.data) {
        setSubscription(result.data);
      } else {
        // No subscription is not an error
        setSubscription(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create or upgrade subscription
   */
  const subscribe = useCallback(async (
    plan: SubscriptionPlan,
    billing_period: 'monthly' | 'yearly'
  ): Promise<{ success: boolean; payment_url?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await subscriptionsApiAdapter.create(plan, billing_period);
      if (result.success && result.data) {
        setSubscription(result.data.subscription);
        return { success: true, payment_url: result.data.payment_url };
      } else {
        setError(result.error || 'Failed to create subscription');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancel subscription
   */
  const cancel = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await subscriptionsApiAdapter.cancel();
      if (result.success && result.data) {
        setSubscription(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to cancel subscription');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reactivate cancelled subscription
   */
  const reactivate = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await subscriptionsApiAdapter.reactivate();
      if (result.success && result.data) {
        setSubscription(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to reactivate subscription');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Change subscription plan
   */
  const changePlan = useCallback(async (plan: SubscriptionPlan): Promise<{
    success: boolean;
    proration?: number;
    error?: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await subscriptionsApiAdapter.changePlan(plan);
      if (result.success && result.data) {
        setSubscription(result.data.subscription);
        return { success: true, proration: result.data.proration };
      } else {
        setError(result.error || 'Failed to change plan');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change plan';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (options.autoFetch) {
      fetchSubscription();
    }
  }, [options.autoFetch, fetchSubscription]);

  // Computed values
  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';
  const isExpired = subscription?.status === 'expired';
  const isTrial = subscription?.is_trial || false;

  const daysUntilExpiration = subscription?.current_period_end
    ? Math.ceil(
        (new Date(subscription.current_period_end).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const currentPlan = subscription?.plan || 'free';
  const planDetails = SUBSCRIPTION_PLANS[currentPlan];

  // Check limits
  const checkLimit = useCallback((
    limitType: keyof Subscription['limits'],
    currentUsage: number
  ): { allowed: boolean; remaining: number; limit: number } => {
    const limit = subscription?.limits?.[limitType] ?? SUBSCRIPTION_PLANS.free.limits[limitType];
    if (limit === -1) {
      return { allowed: true, remaining: Infinity, limit: -1 };
    }
    return {
      allowed: currentUsage < limit,
      remaining: Math.max(0, limit - currentUsage),
      limit,
    };
  }, [subscription]);

  return {
    // State
    subscription,
    isLoading,
    error,

    // Computed
    isActive,
    isCancelled,
    isExpired,
    isTrial,
    daysUntilExpiration,
    currentPlan,
    planDetails,

    // Actions
    fetchSubscription,
    subscribe,
    cancel,
    reactivate,
    changePlan,
    checkLimit,

    // Static data
    allPlans: SUBSCRIPTION_PLANS,
    getPlanDetails: subscriptionsApiAdapter.getPlanDetails,
  };
}

// ============================================
// usePayments Hook
// ============================================

interface UsePaymentsOptions {
  autoFetch?: boolean;
  limit?: number;
}

export function usePayments(options: UsePaymentsOptions = { autoFetch: true }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const limit = options.limit || 20;

  /**
   * Fetch payments
   */
  const fetchPayments = useCallback(async (offset: number = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentsApiAdapter.getAll({ limit, offset });
      if (result.success && result.data) {
        if (offset === 0) {
          setPayments(result.data);
        } else {
          setPayments(prev => [...prev, ...result.data!]);
        }
        setHasMore(result.data.length === limit);
      } else {
        setError(result.error || 'Failed to fetch payments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  /**
   * Load more payments
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPayments(payments.length);
  }, [hasMore, isLoading, payments.length, fetchPayments]);

  /**
   * Get payment by ID
   */
  const getPayment = useCallback(async (id: string): Promise<Payment | null> => {
    try {
      const result = await paymentsApiAdapter.getById(id);
      return result.success && result.data ? result.data : null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Create payment
   */
  const createPayment = useCallback(async (
    data: CreatePaymentInput
  ): Promise<{ success: boolean; payment?: Payment; payment_url?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentsApiAdapter.create(data);
      if (result.success && result.data) {
        setPayments(prev => [result.data!.payment, ...prev]);
        return {
          success: true,
          payment: result.data.payment,
          payment_url: result.data.payment_url,
        };
      } else {
        setError(result.error || 'Failed to create payment');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request refund
   */
  const requestRefund = useCallback(async (
    id: string,
    reason: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentsApiAdapter.requestRefund(id, reason);
      if (result.success && result.data) {
        setPayments(prev =>
          prev.map(p => p.id === id ? result.data! : p)
        );
        return true;
      } else {
        setError(result.error || 'Failed to request refund');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request refund');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (options.autoFetch) {
      fetchPayments();
    }
  }, [options.autoFetch, fetchPayments]);

  // Computed
  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status === 'completed');

  return {
    // State
    payments,
    isLoading,
    error,
    hasMore,

    // Computed
    totalSpent,
    pendingPayments,
    completedPayments,

    // Actions
    fetchPayments,
    loadMore,
    getPayment,
    createPayment,
    requestRefund,
    refresh: () => fetchPayments(0),
  };
}

// ============================================
// usePaymentMethods Hook
// ============================================

interface PaymentMethodInfo {
  id: string;
  type: PaymentMethod;
  last4?: string;
  brand?: string;
  is_default: boolean;
}

export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch payment methods
   */
  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentsApiAdapter.getMethods();
      if (result.success && result.data) {
        setMethods(result.data.methods);
      } else {
        setError(result.error || 'Failed to fetch payment methods');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add payment method
   */
  const addMethod = useCallback(async (
    type: PaymentMethod
  ): Promise<{ success: boolean; setup_url?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentsApiAdapter.addMethod(type);
      if (result.success && result.data) {
        return { success: true, setup_url: result.data.setup_url };
      } else {
        setError(result.error || 'Failed to add payment method');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove payment method
   */
  const removeMethod = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentsApiAdapter.removeMethod(id);
      if (result.success) {
        setMethods(prev => prev.filter(m => m.id !== id));
        return true;
      } else {
        setError(result.error || 'Failed to remove payment method');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove payment method');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set default payment method
   */
  const setDefault = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentsApiAdapter.setDefaultMethod(id);
      if (result.success) {
        setMethods(prev =>
          prev.map(m => ({ ...m, is_default: m.id === id }))
        );
        return true;
      } else {
        setError(result.error || 'Failed to set default method');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default method');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  // Computed
  const defaultMethod = methods.find(m => m.is_default);
  const hasPaymentMethod = methods.length > 0;

  return {
    // State
    methods,
    isLoading,
    error,

    // Computed
    defaultMethod,
    hasPaymentMethod,

    // Actions
    fetchMethods,
    addMethod,
    removeMethod,
    setDefault,
  };
}
