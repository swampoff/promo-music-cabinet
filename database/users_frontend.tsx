/**
 * PROMO.MUSIC - USERS MANAGEMENT FRONTEND INTEGRATION
 * Примеры интеграции API управления пользователями
 * 
 * Этот файл содержит:
 * 1. TypeScript интерфейсы
 * 2. API клиент с готовыми методами
 * 3. React хуки для работы с пользователями
 * 4. Примеры компонентов
 */

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface User {
  id: number;
  uuid: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  role: 'artist' | 'admin' | 'partner' | 'manager' | 'moderator';
  subscription_tier: 'free' | 'basic' | 'pro' | 'premium';
  subscription_expires_at?: string;
  balance: number;
  currency: string;
  personal_discount_percentage: number;
  country: string;
  city?: string;
  social_links?: {
    instagram?: string;
    vk?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
  };
  rating: number;
  reviews_count: number;
  total_campaigns_created: number;
  total_orders_completed: number;
  status: 'active' | 'blocked' | 'pending' | 'suspended' | 'deleted';
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  created_at: string;
  last_login_at?: string;
  last_activity_at?: string;
}

export interface BalanceTransaction {
  id: number;
  uuid: string;
  transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'bonus' | 'referral_reward' | 'penalty' | 'correction';
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference_type?: string;
  reference_id?: number;
  payment_method?: string;
  created_at: string;
  completed_at?: string;
}

export interface Notification {
  id: number;
  uuid: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface UserReview {
  id: number;
  uuid: string;
  rating: number;
  review_text?: string;
  pros?: string;
  cons?: string;
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  timeliness_rating?: number;
  helpful_count: number;
  not_helpful_count: number;
  response_text?: string;
  reviewer: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  blocked_users: number;
  pending_users: number;
  verified_users: number;
  new_users_30d: number;
  active_7d: number;
  total_balance: number;
  average_balance: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

class UsersAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data.data;
  }

  // ========== AUTHENTICATION ==========

  async register(data: {
    name: string;
    email: string;
    password: string;
    username?: string;
    phone?: string;
    country?: string;
    city?: string;
    referral_code?: string;
  }) {
    return this.request<{ user: User; tokens: { access_token: string; refresh_token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; tokens: { access_token: string; refresh_token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  // ========== USER PROFILE ==========

  async getMe() {
    return this.request<User>('/users/me');
  }

  async updateMe(data: Partial<User>) {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return fetch(`${this.baseURL}/users/me/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    }).then(res => res.json());
  }

  async getUser(id: number) {
    return this.request<User>(`/users/${id}`);
  }

  async searchUsers(params: {
    q?: string;
    role?: string;
    country?: string;
    subscription_tier?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ users: User[]; pagination: any }>(`/users/search?${query}`);
  }

  // ========== ADMIN OPERATIONS ==========

  async getUsers(params: {
    role?: string;
    status?: string;
    subscription_tier?: string;
    country?: string;
    search?: string;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ users: User[]; pagination: any; statistics: UserStatistics }>(`/admin/users?${query}`);
  }

  async createUser(data: Partial<User> & { password: string }) {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async blockUser(id: number, reason: string, blockedUntil?: string) {
    return this.request(`/admin/users/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ reason, blocked_until: blockedUntil }),
    });
  }

  async unblockUser(id: number) {
    return this.request(`/admin/users/${id}/unblock`, {
      method: 'PATCH',
    });
  }

  async changeUserRole(id: number, role: string) {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async changeSubscription(id: number, tier: string, expiresAt?: string) {
    return this.request(`/admin/users/${id}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify({ subscription_tier: tier, expires_at: expiresAt }),
    });
  }

  async adjustBalance(id: number, amount: number, description: string) {
    return this.request(`/admin/users/${id}/balance/adjust`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }

  async setPersonalDiscount(id: number, percentage: number, reason: string, expiresAt?: string) {
    return this.request(`/admin/users/${id}/discount`, {
      method: 'POST',
      body: JSON.stringify({ percentage, reason, expires_at: expiresAt }),
    });
  }

  async getUserActivityLog(id: number, limit = 50, offset = 0) {
    return this.request<{ activities: any[]; pagination: any }>(`/admin/users/${id}/activity-log?limit=${limit}&offset=${offset}`);
  }

  // ========== BALANCE & TRANSACTIONS ==========

  async getBalance() {
    return this.request<{ balance: number; currency: string; total_spent: number; total_earned: number }>('/users/me/balance');
  }

  async getTransactions(params: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ transactions: BalanceTransaction[]; pagination: any }>(`/users/me/transactions?${query}`);
  }

  async depositBalance(amount: number, paymentMethod: string, returnUrl?: string) {
    return this.request<{ transaction_id: number; payment_url: string }>('/users/me/balance/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, payment_method: paymentMethod, return_url: returnUrl }),
    });
  }

  async withdrawBalance(amount: number, method: string, details: any) {
    return this.request('/users/me/balance/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, ...details }),
    });
  }

  // ========== NOTIFICATIONS ==========

  async getNotifications(params: {
    is_read?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ notifications: Notification[]; pagination: any; unread_count: number }>(`/users/me/notifications?${query}`);
  }

  async markNotificationAsRead(id: number) {
    return this.request(`/users/me/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/users/me/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // ========== REVIEWS ==========

  async getUserReviews(userId: number, limit = 10, offset = 0) {
    return this.request<{ reviews: UserReview[]; pagination: any; summary: any }>(`/users/${userId}/reviews?limit=${limit}&offset=${offset}`);
  }

  async createReview(userId: number, data: {
    order_id?: number;
    rating: number;
    review_text?: string;
    pros?: string;
    cons?: string;
    communication_rating?: number;
    quality_rating?: number;
    professionalism_rating?: number;
    timeliness_rating?: number;
  }) {
    return this.request(`/users/${userId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== STATISTICS ==========

  async getUsersStatistics() {
    return this.request<UserStatistics>('/admin/users/statistics');
  }

  async getRegistrationsAnalytics(period: '7d' | '30d' | '90d' | '1y') {
    return this.request(`/admin/users/analytics/registrations?period=${period}`);
  }
}

// Создаем singleton instance
export const usersAPI = new UsersAPI();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

// Hook для получения текущего пользователя
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getMe();
      setUser(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

// Hook для списка пользователей (админка)
export function useUsers(filters: {
  role?: string;
  status?: string;
  subscription_tier?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getUsers(filters);
      setUsers(data.users);
      setStatistics(data.statistics);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, statistics, pagination, loading, error, refetch: fetchUsers };
}

// Hook для баланса
export function useBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('RUB');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getBalance();
      setBalance(data.balance);
      setCurrency(data.currency);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, currency, loading, error, refetch: fetchBalance };
}

// Hook для транзакций
export function useTransactions(params: { type?: string; limit?: number; offset?: number } = {}) {
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getTransactions(params);
      setTransactions(data.transactions);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

// Hook для уведомлений
export function useNotifications(params: { is_read?: boolean } = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getNotifications(params);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    await usersAPI.markNotificationAsRead(id);
    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    await usersAPI.markAllNotificationsAsRead();
    await fetchNotifications();
  };

  return { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refetch: fetchNotifications };
}

// ============================================================================
// EXAMPLE COMPONENTS
// ============================================================================

/**
 * Пример компонента профиля пользователя
 */
export function UserProfileExample() {
  const { user, loading, error } = useCurrentUser();

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!user) return <div>Пользователь не найден</div>;

  return (
    <div className="user-profile">
      <img src={user.avatar_url || '/default-avatar.png'} alt={user.name} />
      <h1>{user.name}</h1>
      <p>@{user.username}</p>
      <p>{user.bio}</p>
      <div className="stats">
        <div>Рейтинг: {user.rating}⭐</div>
        <div>Отзывов: {user.reviews_count}</div>
        <div>Кампаний: {user.total_campaigns_created}</div>
      </div>
      <div className="balance">
        Баланс: {user.balance} {user.currency}
      </div>
    </div>
  );
}

/**
 * Пример компонента списка транзакций
 */
export function TransactionsListExample() {
  const { transactions, loading, error } = useTransactions({ limit: 20 });

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="transactions-list">
      <h2>История транзакций</h2>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип</th>
            <th>Сумма</th>
            <th>Баланс после</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              <td>{tx.transaction_type}</td>
              <td className={tx.amount >= 0 ? 'positive' : 'negative'}>
                {tx.amount >= 0 ? '+' : ''}{tx.amount} {tx.currency}
              </td>
              <td>{tx.balance_after} {tx.currency}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Пример компонента уведомлений
 */
export function NotificationsExample() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({ is_read: false });

  return (
    <div className="notifications">
      <div className="header">
        <h2>Уведомления ({unreadCount})</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}>Отметить все как прочитанные</button>
        )}
      </div>
      <div className="list">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.priority}`}
            onClick={() => markAsRead(notification.id)}
          >
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <small>{new Date(notification.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default usersAPI;
