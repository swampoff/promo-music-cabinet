/**
 * PROMO.MUSIC - FINANCE MODULE FRONTEND INTEGRATION
 * TypeScript + React хуки для финансовой системы
 */

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Transaction {
  id: number;
  uuid: string;
  user_id?: number;
  partner_id?: number;
  transaction_type: 'payment' | 'refund' | 'payout' | 'commission' | 'deposit' | 'withdrawal' | 'bonus' | 'penalty' | 'correction';
  transaction_category: string;
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'on_hold' | 'reversed';
  description: string;
  reference_type?: string;
  reference_id?: number;
  payment_provider?: string;
  payment_method?: string;
  platform_commission: number;
  created_at: string;
  completed_at?: string;
}

export interface Invoice {
  id: number;
  uuid: string;
  invoice_number: string;
  user_id: number;
  invoice_type: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded';
  description?: string;
  line_items: Array<{
    name: string;
    quantity: number;
    price: number;
    tax_rate?: number;
  }>;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  pdf_url?: string;
}

export interface Balance {
  entity_type: 'user' | 'partner' | 'platform';
  entity_id?: number;
  currency: string;
  available_balance: number;
  pending_balance: number;
  reserved_balance: number;
  total_balance: number;
  lifetime_income: number;
  lifetime_expense: number;
  last_transaction_at?: string;
}

export interface Payout {
  id: number;
  uuid: string;
  payout_type: string;
  amount: number;
  currency: string;
  withdrawal_fee: number;
  net_amount: number;
  payout_method: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'rejected';
  requested_at: string;
  completed_at?: string;
}

export interface Refund {
  id: number;
  uuid: string;
  original_transaction_id: number;
  refund_amount: number;
  currency: string;
  refund_type: 'full' | 'partial' | 'chargeback';
  reason: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';
  requested_at: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

class FinanceAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  // ========== ТРАНЗАКЦИИ ==========

  async getTransactions(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ transactions: Transaction[]; pagination: any }>(`/finance/transactions?${query}`);
  }

  async getTransaction(id: number) {
    return this.request<Transaction>(`/finance/transactions/${id}`);
  }

  async createTransaction(data: Partial<Transaction>) {
    return this.request<Transaction>('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== СЧЕТА ==========

  async getInvoices(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ invoices: Invoice[]; pagination: any }>(`/finance/invoices?${query}`);
  }

  async getInvoice(id: number) {
    return this.request<Invoice>(`/finance/invoices/${id}`);
  }

  async createInvoice(data: Partial<Invoice>) {
    return this.request<Invoice>('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async payInvoice(id: number, transactionId: number) {
    return this.request(`/finance/invoices/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_transaction_id: transactionId }),
    });
  }

  // ========== БАЛАНСЫ ==========

  async getBalance(currency: string = 'RUB') {
    return this.request<Balance>(`/finance/balance?currency=${currency}`);
  }

  async reserveBalance(amount: number, currency: string, reason: string) {
    return this.request('/finance/balance/reserve', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, reason }),
    });
  }

  async releaseBalance(amount: number, currency: string) {
    return this.request('/finance/balance/release', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  // ========== ВЫПЛАТЫ ==========

  async getPayouts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ payouts: Payout[]; pagination: any }>(`/finance/payouts?${query}`);
  }

  async requestPayout(data: {
    payout_type: string;
    amount: number;
    currency: string;
    payout_method: string;
    payout_details: any;
  }) {
    return this.request<Payout>('/finance/payouts/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== ВОЗВРАТЫ ==========

  async getRefunds(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ refunds: Refund[]; pagination: any }>(`/finance/refunds?${query}`);
  }

  async requestRefund(data: {
    original_transaction_id: number;
    refund_amount: number;
    refund_type: string;
    reason: string;
    description?: string;
  }) {
    return this.request<Refund>('/finance/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== СТАТИСТИКА ==========

  async getStatistics() {
    return this.request('/finance/statistics');
  }

  async getDailyStatistics(dateFrom: string, dateTo: string) {
    return this.request(`/finance/statistics/daily?date_from=${dateFrom}&date_to=${dateTo}`);
  }

  async getCategoryStatistics(dateFrom: string) {
    return this.request(`/finance/statistics/categories?date_from=${dateFrom}`);
  }

  // ========== АДМИН ==========

  async adminApprovePayout(id: number) {
    return this.request(`/admin/finance/payouts/${id}/approve`, { method: 'PATCH' });
  }

  async adminApproveRefund(id: number) {
    return this.request(`/admin/finance/refunds/${id}/approve`, { method: 'PATCH' });
  }

  async adminAdjustBalance(userId: number, amount: number, description: string) {
    return this.request('/admin/finance/balance/adjust', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, amount, description }),
    });
  }

  async adminGetSuspiciousTransactions() {
    return this.request('/admin/finance/transactions/suspicious');
  }

  async adminGetAuditLog(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/finance/audit-log?${query}`);
  }
}

export const financeAPI = new FinanceAPI();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useTransactions(filters: any = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await financeAPI.getTransactions(filters);
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, pagination, loading, error, refetch: fetchTransactions };
}

export function useBalance(currency: string = 'RUB') {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await financeAPI.getBalance(currency);
      setBalance(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}

export function useInvoices(filters: any = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeAPI.getInvoices(filters)
      .then(data => setInvoices(data.invoices))
      .finally(() => setLoading(false));
  }, [filters]);

  return { invoices, loading };
}

export function usePayouts(filters: any = {}) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeAPI.getPayouts(filters)
      .then(data => setPayouts(data.payouts))
      .finally(() => setLoading(false));
  }, [filters]);

  return { payouts, loading };
}

// ============================================================================
// EXAMPLE COMPONENTS
// ============================================================================

export function BalanceCardExample() {
  const { balance, loading } = useBalance();

  if (loading) return <div>Загрузка...</div>;
  if (!balance) return null;

  return (
    <div className="balance-card">
      <h3>Баланс</h3>
      <div className="amount">{balance.available_balance} {balance.currency}</div>
      <div className="details">
        <div>В ожидании: {balance.pending_balance}</div>
        <div>Зарезервировано: {balance.reserved_balance}</div>
      </div>
      <div className="lifetime">
        <div>Всего получено: {balance.lifetime_income}</div>
        <div>Всего потрачено: {balance.lifetime_expense}</div>
      </div>
    </div>
  );
}

export function TransactionsListExample() {
  const { transactions, loading } = useTransactions({ limit: 20 });

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="transactions-list">
      <h2>История транзакций</h2>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип</th>
            <th>Описание</th>
            <th>Сумма</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              <td>{tx.transaction_type}</td>
              <td>{tx.description}</td>
              <td className={tx.amount >= 0 ? 'positive' : 'negative'}>
                {tx.amount >= 0 ? '+' : ''}{tx.amount} {tx.currency}
              </td>
              <td>
                <span className={`status status-${tx.status}`}>{tx.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default financeAPI;
