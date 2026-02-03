/**
 * FINANCE SECTION - TYPES
 * Типы для финансового раздела радиостанций
 */

export type TransactionType = 'donation' | 'royalty' | 'withdrawal' | 'fee' | 'refund' | 'bonus' | 'adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'yoomoney' | 'card' | 'qiwi' | 'webmoney';
export type WithdrawalStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export interface BalanceTransaction {
  id: string;
  userId: string;
  userEmail: string;
  transactionType: TransactionType;
  amount: number;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status: TransactionStatus;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: any;
  createdAt: string;
  completedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    bankName?: string;
    accountNumber?: string;
    cardNumber?: string;
    recipientName?: string;
    bik?: string;
    inn?: string;
    walletNumber?: string;
    phoneNumber?: string;
    walletType?: string;
    email?: string;
  };
  status: WithdrawalStatus;
  adminNotes?: string;
  rejectionReason?: string;
  processedBy?: string;
  processedDate?: string;
  completedDate?: string;
  transactionId?: string;
  paymentConfirmationId?: string;
  paymentReceiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialStats {
  totalRevenue: number;
  totalNetRevenue: number;
  totalCommission: number;
  totalOrders: number;
  avgOrderValue: number;
  currentBalance: number;
  availableBalance: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  growthPercent: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  netRevenue: number;
  orders: number;
}