/**
 * FINANCE SECTION - PART 2
 * Дополнительные компоненты для финансового раздела
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle,
  XCircle, Clock, AlertCircle, Download, Copy, Check, X, Info,
  CreditCard, Building2, Wallet, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

// Import types from separate types file
import type {
  BalanceTransaction,
  WithdrawalRequest,
  FinancialStats,
  DailyRevenue,
  TransactionType,
  PaymentMethod,
  WithdrawalStatus
} from './finance-section-types';

// =====================================================
// OVERVIEW TAB
// =====================================================

interface OverviewTabProps {
  stats: FinancialStats;
  dailyRevenue: DailyRevenue[];
}

export function OverviewTab({ stats, dailyRevenue }: OverviewTabProps) {
  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.netRevenue));

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Динамика дохода</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span>Чистый доход</span>
          </div>
        </div>

        {/* Simple bar chart */}
        <div className="space-y-2">
          {dailyRevenue.slice(-7).map((day) => {
            const percentage = (day.netRevenue / maxRevenue) * 100;
            return (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-16 text-xs text-slate-400 flex-shrink-0">
                  {new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                </div>
                <div className="flex-1 relative h-8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-end px-3"
                  >
                    <span className="text-xs font-medium text-white">
                      ₽{(day.netRevenue / 1000).toFixed(1)}k
                    </span>
                  </motion.div>
                </div>
                <div className="w-12 text-xs text-slate-500 text-right flex-shrink-0">
                  {day.orders} зак.
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Income Breakdown */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Структура дохода</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-slate-300 text-sm">Валовой доход</span>
              <span className="text-white font-bold">₽{stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
              <span className="text-red-300 text-sm">Комиссия платформы (15%)</span>
              <span className="text-red-400 font-bold">-₽{stats.totalCommission.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border-t-2 border-green-500/50">
              <span className="text-green-300 text-sm font-medium">Чистый доход (85%)</span>
              <span className="text-green-400 font-bold text-lg">₽{stats.totalNetRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Ключевые метрики</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Всего заказов:</span>
              <span className="text-white font-medium">{stats.totalOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Средний чек:</span>
              <span className="text-white font-medium">₽{stats.avgOrderValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Комиссионная ставка:</span>
              <span className="text-white font-medium">15%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Минимальный вывод:</span>
              <span className="text-white font-medium">₽500</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-slate-400 text-sm">Рост за период:</span>
              <span className={`font-bold ${stats.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.growthPercent >= 0 ? '+' : ''}{stats.growthPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TRANSACTIONS TAB
// =====================================================

interface TransactionsTabProps {
  transactions: BalanceTransaction[];
  onViewDetails: (tx: BalanceTransaction) => void;
}

export function TransactionsTab({ transactions, onViewDetails }: TransactionsTabProps) {
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.transactionType !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.description.toLowerCase().includes(query) ||
        tx.transactionType.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Поиск транзакций..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
        <div className="flex flex-wrap gap-2">
          {(['all', 'royalty', 'withdrawal', 'bonus', 'refund'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filterType === type
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {getTransactionTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.map((tx) => (
          <TransactionCard
            key={tx.id}
            transaction={tx}
            onViewDetails={() => onViewDetails(tx)}
          />
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Транзакции не найдены</p>
          <p className="text-sm text-slate-400">
            Попробуйте изменить фильтры
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// TRANSACTION CARD
// =====================================================

interface TransactionCardProps {
  transaction: BalanceTransaction;
  onViewDetails: () => void;
}

function TransactionCard({ transaction: tx, onViewDetails }: TransactionCardProps) {
  const isPositive = tx.amount > 0;
  const statusColors = {
    completed: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    cancelled: 'text-slate-400',
  };

  const typeIcons = {
    royalty: { icon: TrendingUp, color: 'text-green-400' },
    withdrawal: { icon: ArrowUpRight, color: 'text-orange-400' },
    donation: { icon: ArrowDownRight, color: 'text-blue-400' },
    bonus: { icon: CheckCircle, color: 'text-purple-400' },
    refund: { icon: ArrowDownRight, color: 'text-cyan-400' },
    fee: { icon: XCircle, color: 'text-red-400' },
    adjustment: { icon: Info, color: 'text-slate-400' },
  };

  const TypeIcon = typeIcons[tx.transactionType].icon;

  return (
    <button
      onClick={onViewDetails}
      className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all text-left"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl bg-white/5 ${typeIcons[tx.transactionType].color}`}>
          <TypeIcon className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{tx.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">
              {new Date(tx.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className={`text-xs ${statusColors[tx.status]}`}>
              • {getTransactionStatusLabel(tx.status)}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-orange-400'}`}>
            {isPositive ? '+' : ''}₽{Math.abs(tx.amount).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">
            Баланс: ₽{tx.balanceAfter.toLocaleString()}
          </p>
        </div>
      </div>
    </button>
  );
}

// =====================================================
// WITHDRAWALS TAB
// =====================================================

interface WithdrawalsTabProps {
  withdrawals: WithdrawalRequest[];
  onCancel: (id: string) => void;
}

export function WithdrawalsTab({ withdrawals, onCancel }: WithdrawalsTabProps) {
  const [filterStatus, setFilterStatus] = useState<WithdrawalStatus | 'all'>('all');

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'processing', 'completed', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              filterStatus === status
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {getWithdrawalStatusLabel(status)}
            {status === 'all' && ` (${withdrawals.length})`}
          </button>
        ))}
      </div>

      {/* Withdrawals List */}
      <div className="space-y-3">
        {filteredWithdrawals.map((withdrawal) => (
          <WithdrawalCard
            key={withdrawal.id}
            withdrawal={withdrawal}
            onCancel={() => onCancel(withdrawal.id)}
          />
        ))}
      </div>

      {filteredWithdrawals.length === 0 && (
        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Заявки на вывод не найдены</p>
          <p className="text-sm text-slate-400">
            Создайте первую заявку на вывод средств
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// WITHDRAWAL CARD
// =====================================================

interface WithdrawalCardProps {
  withdrawal: WithdrawalRequest;
  onCancel: () => void;
}

function WithdrawalCard({ withdrawal: wd, onCancel }: WithdrawalCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusColors: Record<WithdrawalStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    approved: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    processing: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    completed: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
    cancelled: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    bank_transfer: 'Банковский перевод',
    yoomoney: 'ЮMoney',
    card: 'На карту',
    qiwi: 'QIWI',
    webmoney: 'WebMoney',
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-2xl font-bold text-white">
                  ₽{wd.amount.toLocaleString()}
                </p>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[wd.status]}`}>
                  {getWithdrawalStatusLabel(wd.status)}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {paymentMethodLabels[wd.paymentMethod]}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                Создана: {new Date(wd.createdAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            {wd.completedDate && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Выполнена: {new Date(wd.completedDate).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Payment Details Summary */}
          <div className="text-sm text-slate-300">
            {wd.paymentMethod === 'card' && wd.paymentDetails.cardNumber && (
              <p>Карта: {wd.paymentDetails.cardNumber}</p>
            )}
            {wd.paymentMethod === 'bank_transfer' && (
              <p>{wd.paymentDetails.bankName} • {wd.paymentDetails.accountNumber}</p>
            )}
          </div>

          {/* Notes */}
          {wd.adminNotes && (
            <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300">{wd.adminNotes}</p>
            </div>
          )}
          {wd.rejectionReason && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-xs text-red-300">{wd.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
          >
            {showDetails ? 'Скрыть' : 'Подробнее'}
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {wd.status === 'pending' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
            >
              Отменить
            </button>
          )}

          {wd.status === 'completed' && wd.paymentReceiptUrl && (
            <a
              href={wd.paymentReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors text-sm flex items-center gap-2 justify-center"
            >
              Чек
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-white/10 space-y-3"
        >
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Реквизиты:</h4>
            <div className="p-3 rounded-lg bg-black/20 space-y-1 text-sm">
              {Object.entries(wd.paymentDetails).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="text-white font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {wd.paymentConfirmationId && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">ID платежа:</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 rounded-lg bg-black/20 text-xs text-green-400 font-mono">
                  {wd.paymentConfirmationId}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wd.paymentConfirmationId!);
                    toast.success('ID скопирован');
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// =====================================================
// ANALYTICS TAB (Simplified)
// =====================================================

export function AnalyticsTab({
  stats,
  dailyRevenue,
}: {
  stats: FinancialStats;
  dailyRevenue: DailyRevenue[];
}) {
  return (
    <div className="space-y-6">
      <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
        <Info className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Расширенная аналитика</h3>
        <p className="text-slate-400">
          Графики прибыльности, прогнозирование, разбивка по источникам дохода
        </p>
        <p className="text-sm text-slate-500 mt-4">В разработке...</p>
      </div>
    </div>
  );
}

// ... Modals will be added in the main file
// (WithdrawalModal, TransactionDetailsModal)

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getTransactionTypeLabel(type: TransactionType | 'all'): string {
  const labels: Record<TransactionType | 'all', string> = {
    all: 'Все',
    royalty: 'Доход',
    withdrawal: 'Вывод',
    donation: 'Донат',
    fee: 'Комиссия',
    refund: 'Возврат',
    bonus: 'Бонус',
    adjustment: 'Корректировка',
  };
  return labels[type];
}

function getTransactionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Завершена',
    pending: 'Ожидает',
    failed: 'Ошибка',
    cancelled: 'Отменена',
  };
  return labels[status] || status;
}

function getWithdrawalStatusLabel(status: WithdrawalStatus | 'all'): string {
  const labels: Record<WithdrawalStatus | 'all', string> = {
    all: 'Все',
    pending: 'Ожидает',
    approved: 'Одобрена',
    processing: 'В обработке',
    completed: 'Выполнена',
    rejected: 'Отклонена',
    cancelled: 'Отменена',
  };
  return labels[status];
}

// =====================================================
// WITHDRAWAL MODAL (Full version with payment details)
// =====================================================

export function WithdrawalModal({
  availableBalance,
  onClose,
  onSubmit,
}: {
  availableBalance: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [paymentDetails, setPaymentDetails] = useState<any>({});

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum < 500) {
      toast.error('Минимальная сумма вывода: 500 ₽');
      return;
    }
    
    if (amountNum > availableBalance) {
      toast.error('Недостаточно средств');
      return;
    }

    // Validate payment details based on method
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.recipientName) {
        toast.error('Заполните номер карты и имя получателя');
        return;
      }
    } else if (paymentMethod === 'bank_transfer') {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber || !paymentDetails.recipientName || !paymentDetails.bik) {
        toast.error('Заполните все реквизиты банка');
        return;
      }
    } else if (paymentMethod === 'yoomoney') {
      if (!paymentDetails.walletNumber) {
        toast.error('Укажите номер кошелька ЮMoney');
        return;
      }
    }
    
    onSubmit({
      amount: amountNum,
      paymentMethod,
      paymentDetails,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Вывод средств</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Available Balance */}
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-sm text-green-300 mb-1">Доступно к выводу:</p>
            <p className="text-2xl font-bold text-green-400">
              ₽{availableBalance.toLocaleString()}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Сумма вывода <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="500"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Введите сумму"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
            <p className="text-xs text-slate-400 mt-1">Минимальная сумма: 500 ₽</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Способ вывода <span className="text-red-400">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value as PaymentMethod);
                setPaymentDetails({});
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="card">На банковскую карту</option>
              <option value="bank_transfer">Банковский перевод</option>
              <option value="yoomoney">ЮMoney</option>
              <option value="qiwi">QIWI Кошелек</option>
              <option value="webmoney">WebMoney</option>
            </select>
          </div>

          {/* Payment Details - Card */}
          {paymentMethod === 'card' && (
            <div className="space-y-3 p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white mb-2">Реквизиты карты:</h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Номер карты <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={paymentDetails.cardNumber || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  maxLength={19}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Имя владельца (как на карте) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="IVAN IVANOV"
                  value={paymentDetails.recipientName || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, recipientName: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          )}

          {/* Payment Details - Bank Transfer */}
          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-3 p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white mb-2">Банковские реквизиты:</h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Название банка <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Например: Сбербанк"
                  value={paymentDetails.bankName || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Номер счета <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="40817810000000000000"
                  value={paymentDetails.accountNumber || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  БИК банка <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="044525225"
                  value={paymentDetails.bik || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, bik: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  maxLength={9}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Получатель (ФИО или название организации) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Иванов Иван Иванович"
                  value={paymentDetails.recipientName || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, recipientName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ИНН (опционально)</label>
                <input
                  type="text"
                  placeholder="0000000000"
                  value={paymentDetails.inn || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, inn: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  maxLength={12}
                />
              </div>
            </div>
          )}

          {/* Payment Details - YooMoney */}
          {paymentMethod === 'yoomoney' && (
            <div className="space-y-3 p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white mb-2">ЮMoney реквизиты:</h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Номер кошелька <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="410000000000000"
                  value={paymentDetails.walletNumber || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, walletNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email (опционально)</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={paymentDetails.email || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          )}

          {/* Payment Details - QIWI */}
          {paymentMethod === 'qiwi' && (
            <div className="space-y-3 p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white mb-2">QIWI реквизиты:</h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Номер телефона (кошелек) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+79000000000"
                  value={paymentDetails.phoneNumber || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          )}

          {/* Payment Details - WebMoney */}
          {paymentMethod === 'webmoney' && (
            <div className="space-y-3 p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white mb-2">WebMoney реквизиты:</h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Тип кошелька <span className="text-red-400">*</span>
                </label>
                <select
                  value={paymentDetails.walletType || 'R'}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, walletType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="R">WMR (рубли)</option>
                  <option value="Z">WMZ (доллары)</option>
                  <option value="E">WME (евро)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Номер кошелька <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="R000000000000"
                  value={paymentDetails.walletNumber || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, walletNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-300">
              <Info className="w-3 h-3 inline mr-1" />
              Обработка заявки: 1-3 рабочих дня. Комиссия не взимается.
            </p>
          </div>

          {/* Fee Info */}
          <div className="p-3 rounded-lg bg-slate-700/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Сумма к получению:</span>
              <span className="text-white font-bold text-lg">
                ₽{amount ? parseFloat(amount).toLocaleString() : '0'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Без комиссии</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium"
          >
            Создать заявку
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// =====================================================
// TRANSACTION DETAILS MODAL
// =====================================================

export function TransactionDetailsModal({
  transaction,
  onClose,
}: {
  transaction: BalanceTransaction;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Детали транзакции</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div className="p-6 rounded-xl bg-white/5 text-center">
            <p className="text-sm text-slate-400 mb-2">Сумма</p>
            <p className={`text-4xl font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-orange-400'}`}>
              {transaction.amount > 0 ? '+' : ''}₽{Math.abs(transaction.amount).toLocaleString()}
            </p>
          </div>

          {/* Details */}
          <div className="p-4 rounded-xl bg-white/5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">ID транзакции:</span>
              <code className="text-white font-mono">{transaction.id}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Тип:</span>
              <span className="text-white">{getTransactionTypeLabel(transaction.transactionType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Статус:</span>
              <span className="text-white">{getTransactionStatusLabel(transaction.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Дата создания:</span>
              <span className="text-white">
                {new Date(transaction.createdAt).toLocaleString('ru-RU')}
              </span>
            </div>
            {transaction.completedAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Дата завершения:</span>
                <span className="text-white">
                  {new Date(transaction.completedAt).toLocaleString('ru-RU')}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-slate-400">Баланс до:</span>
              <span className="text-white font-medium">₽{transaction.balanceBefore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Баланс после:</span>
              <span className="text-white font-medium">₽{transaction.balanceAfter.toLocaleString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-slate-400 mb-1">Описание:</p>
            <p className="text-white">{transaction.description}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
        >
          Закрыть
        </button>
      </motion.div>
    </div>
  );
}