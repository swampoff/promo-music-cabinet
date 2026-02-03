/**
 * SUBSCRIPTION CONTEXT
 * Централизованное управление подписками пользователя
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface SubscriptionLimits {
  tracks: number;
  videos: number;
  storage_gb: number;
  donation_fee: number;
  marketing_discount: number;
  coins_bonus: number;
  pitching_discount: number;
}

interface UserSubscription {
  tier: 'free' | 'basic' | 'pro' | 'premium';
  expires_at: string;
  features: string[];
  limits: SubscriptionLimits;
  price?: number;
  status?: 'active' | 'cancelled' | 'expired';
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  setSubscription: (sub: UserSubscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: 'free',
  expires_at: '2099-12-31',
  features: [],
  limits: {
    tracks: 10,
    videos: 5,
    storage_gb: 5,
    donation_fee: 0.10,
    marketing_discount: 0,
    coins_bonus: 0,
    pitching_discount: 0,
  },
  status: 'active',
};

interface SubscriptionProviderProps {
  children: ReactNode;
  userId?: string; // Теперь optional
  initialSubscription?: UserSubscription;
}

export function SubscriptionProvider({ children, userId: providedUserId, initialSubscription }: SubscriptionProviderProps) {
  // Используем предоставленный userId или demo userId
  const userId = providedUserId || 'demo-user-123';
  
  // Уменьшено логирование для production
  
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    initialSubscription || DEFAULT_SUBSCRIPTION
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    if (!userId) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // IMPORTANT: Добавляем timeout для предотвращения зависания
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/subscriptions/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Проверка истечения подписки
        const expiresAt = new Date(data.data.expires_at);
        const now = new Date();
        const isExpired = expiresAt < now;

        if (isExpired && data.data.tier !== 'free') {
          console.warn('[SubscriptionContext] Subscription expired, reverting to free tier');
          setSubscription(DEFAULT_SUBSCRIPTION);
        } else {
          console.log('[SubscriptionContext] ✅ Subscription loaded from server:', data.data.tier);
          setSubscription(data.data);
        }
      } else {
        // Если нет подписки, используем Free tier
        console.log('[SubscriptionContext] No subscription found, using FREE tier');
        setSubscription(DEFAULT_SUBSCRIPTION);
      }
    } catch (err) {
      // ✨ GRACEFUL ERROR HANDLING - показываем пустое состояние вместо ошибки
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('[SubscriptionContext] ⏱️ Request timeout - using local FREE tier');
      } else {
        console.warn('[SubscriptionContext] ⚠️ Failed to load subscription - using local FREE tier:', err);
      }
      setError(null); // Не показываем ошибку пользователю
      // В случае ошибки используем Free tier
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setLoading(false);
    }
  };

  // ОПТИМИЗАЦИЯ: НЕ загружаем при монтировании, используем DEFAULT_SUBSCRIPTION
  // Загрузка произойдет только при явном вызове refreshSubscription()
  useEffect(() => {
    // Проверяем есть ли сохраненная подписка в localStorage
    const savedSub = localStorage.getItem('user_subscription');
    if (savedSub) {
      try {
        const parsed = JSON.parse(savedSub);
        setSubscription(parsed);
      } catch (e) {
        setSubscription(DEFAULT_SUBSCRIPTION);
      }
    } else {
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
    // Не делаем автоматический запрос к серверу
  }, [userId]);

  // Сохраняем подписку в localStorage при изменении
  useEffect(() => {
    if (subscription) {
      localStorage.setItem('user_subscription', JSON.stringify(subscription));
    }
  }, [subscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        refreshSubscription,
        setSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  // Убрали лишнее логирование
  if (!context) {
    console.error('[useSubscription] ERROR: Context is null! Provider not found in component tree.');
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Хелперы для проверки возможностей подписки
export const subscriptionHelpers = {
  canUploadTrack: (subscription: UserSubscription | null, currentCount: number): boolean => {
    if (!subscription) return false;
    if (subscription.limits.tracks === -1) return true; // Безлимитный
    return currentCount < subscription.limits.tracks;
  },

  canUploadVideo: (subscription: UserSubscription | null, currentCount: number): boolean => {
    if (!subscription) return false;
    if (subscription.limits.videos === -1) return true; // Безлимитный
    return currentCount < subscription.limits.videos;
  },

  getRemainingTracks: (subscription: UserSubscription | null, currentCount: number): number => {
    if (!subscription) return 0;
    if (subscription.limits.tracks === -1) return Infinity;
    return Math.max(0, subscription.limits.tracks - currentCount);
  },

  getRemainingVideos: (subscription: UserSubscription | null, currentCount: number): number => {
    if (!subscription) return 0;
    if (subscription.limits.videos === -1) return Infinity;
    return Math.max(0, subscription.limits.videos - currentCount);
  },

  getDonationFee: (subscription: UserSubscription | null): number => {
    return subscription?.limits.donation_fee || 0.10;
  },

  getCoinsBonus: (subscription: UserSubscription | null): number => {
    return subscription?.limits.coins_bonus || 0;
  },

  getMarketingDiscount: (subscription: UserSubscription | null): number => {
    return subscription?.limits.marketing_discount || 0;
  },

  getPitchingDiscount: (subscription: UserSubscription | null): number => {
    return subscription?.limits.pitching_discount || 0;
  },

  getTierLabel: (tier: string): string => {
    const labels: Record<string, string> = {
      free: 'Free',
      basic: 'Basic',
      pro: 'Pro',
      premium: 'Premium',
    };
    return labels[tier] || tier;
  },

  getTierColor: (tier: string): string => {
    const colors: Record<string, string> = {
      free: 'text-gray-400',
      basic: 'text-blue-400',
      pro: 'text-purple-400',
      premium: 'text-yellow-400',
    };
    return colors[tier] || 'text-gray-400';
  },

  getTierBadgeColor: (tier: string): string => {
    const colors: Record<string, string> = {
      free: 'bg-gray-500/20 border-gray-500/30',
      basic: 'bg-blue-500/20 border-blue-500/30',
      pro: 'bg-purple-500/20 border-purple-500/30',
      premium: 'bg-yellow-500/20 border-yellow-500/30',
    };
    return colors[tier] || 'bg-gray-500/20 border-gray-500/30';
  },
};