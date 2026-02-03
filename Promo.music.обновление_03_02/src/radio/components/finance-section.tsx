/**
 * FINANCE SECTION - Финансовый раздел для радиостанций
 * Максимально доработанная версия с полной финансовой логикой
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar,
  Download, Upload, RefreshCw, Eye, EyeOff, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, Clock, AlertCircle, Filter, Search, FileText,
  BarChart3, PieChart, Activity, Percent, Award, Target, Zap, Shield,
  X, ChevronDown, ChevronUp, ExternalLink, Copy, Check, Settings,
  ArrowRight, Plus, Minus, Info
} from 'lucide-react';
import { toast } from 'sonner';

// Import types from separate file
import type {
  BalanceTransaction,
  WithdrawalRequest,
  FinancialStats,
  DailyRevenue,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  WithdrawalStatus,
} from './finance-section-types';

// Re-export types
export type {
  BalanceTransaction,
  WithdrawalRequest,
  FinancialStats,
  DailyRevenue,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  WithdrawalStatus,
};

// Import additional components
import {
  OverviewTab,
  TransactionsTab,
  WithdrawalsTab,
  AnalyticsTab,
  WithdrawalModal,
  TransactionDetailsModal,
} from './finance-section-parts';

// =====================================================
// MAIN COMPONENT
// =====================================================

export function FinanceSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdrawals' | 'analytics'>('overview');
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BalanceTransaction | null>(null);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  // =====================================================
  // DATA LOADING
  // =====================================================

  useEffect(() => {
    loadFinancialData();
  }, [period]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API calls
      const mockStats: FinancialStats = {
        totalRevenue: 520000,
        totalNetRevenue: 442000,
        totalCommission: 78000,
        totalOrders: 28,
        avgOrderValue: 15785,
        currentBalance: 125000,
        availableBalance: 105000,
        pendingWithdrawals: 20000,
        completedWithdrawals: 317000,
        growthPercent: 24.5,
      };

      const mockTransactions: BalanceTransaction[] = [
        {
          id: 'tx_001',
          userId: 'user_001',
          userEmail: 'radio@promo.fm',
          transactionType: 'royalty',
          amount: 42500,
          description: 'Доход от рекламного заказа #12345',
          relatedEntityType: 'advertisement_order',
          relatedEntityId: 'order_001',
          status: 'completed',
          balanceBefore: 82500,
          balanceAfter: 125000,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'tx_002',
          userId: 'user_001',
          userEmail: 'radio@promo.fm',
          transactionType: 'withdrawal',
          amount: -50000,
          description: 'Вывод средств на карту',
          relatedEntityType: 'withdrawal_request',
          relatedEntityId: 'wd_001',
          status: 'completed',
          balanceBefore: 132500,
          balanceAfter: 82500,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'tx_003',
          userId: 'user_001',
          userEmail: 'radio@promo.fm',
          transactionType: 'royalty',
          amount: 35700,
          description: 'Доход от рекламного заказа #12344',
          relatedEntityType: 'advertisement_order',
          relatedEntityId: 'order_002',
          status: 'completed',
          balanceBefore: 96800,
          balanceAfter: 132500,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'tx_004',
          userId: 'user_001',
          userEmail: 'radio@promo.fm',
          transactionType: 'withdrawal',
          amount: -20000,
          description: 'Заявка на вывод средств',
          relatedEntityType: 'withdrawal_request',
          relatedEntityId: 'wd_002',
          status: 'pending',
          balanceBefore: 125000,
          balanceAfter: 105000,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'tx_005',
          userId: 'user_001',
          userEmail: 'radio@promo.fm',
          transactionType: 'bonus',
          amount: 5000,
          description: 'Бонус за активность',
          status: 'completed',
          balanceBefore: 91800,
          balanceAfter: 96800,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockWithdrawals: WithdrawalRequest[] = [
        {
          id: 'wd_001',
          userId: 'user_001',
          userEmail: 'radio@promo.fm',
          userName: 'PROMO.FM Radio',
          amount: 50000,
          paymentMethod: 'card',
          paymentDetails: {
            cardNumber: '**** **** **** 1234',
            recipientName: 'PROMO FM RADIO',
          },
          status: 'completed',
          adminNotes: 'Выплата проведена успешно',
          processedDate: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          transactionId: 'tx_002',
          paymentConfirmationId: 'PAY_12345678',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'wd_002',
          userId: 'user_001',
          userEmail: 'radio@promo.fm',
          userName: 'PROMO.FM Radio',
          amount: 20000,
          paymentMethod: 'bank_transfer',
          paymentDetails: {
            bankName: 'Сбербанк',
            accountNumber: '40817810000001234567',
            recipientName: 'ООО "ПРОМО ФМ"',
            bik: '044525225',
            inn: '7710123456',
          },
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockDailyRevenue: DailyRevenue[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 30000) + 10000,
          netRevenue: Math.floor(Math.random() * 25000) + 8500,
          orders: Math.floor(Math.random() * 5) + 1,
        };
      });

      setStats(mockStats);
      setTransactions(mockTransactions);
      setWithdrawals(mockWithdrawals);
      setDailyRevenue(mockDailyRevenue);
    } catch (error) {
      console.error('Failed to load financial data:', error);
      toast.error('Ошибка загрузки финансовых данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithdrawal = () => {
    if (!stats) return;
    
    if (stats.availableBalance < 500) {
      toast.error('Минимальная сумма вывода: 500 ₽');
      return;
    }
    
    setShowWithdrawalModal(true);
  };

  const handleCancelWithdrawal = async (withdrawalId: string) => {
    try {
      // TODO: API call
      toast.success('Заявка на вывод отменена');
      loadFinancialData();
    } catch (error) {
      toast.error('Ошибка при отмене заявки');
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Загрузка финансовых данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Финансы</h2>
          <p className="text-slate-400 mt-1">
            Управление балансом и выводом средств
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadFinancialData()}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleCreateWithdrawal}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Вывести средства
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 backdrop-blur-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-indigo-400" />
              <p className="text-sm text-slate-300">Текущий баланс</p>
            </div>
            <div className="flex items-center gap-3">
              {showBalance ? (
                <h3 className="text-4xl sm:text-5xl font-bold text-white">
                  ₽{stats.currentBalance.toLocaleString()}
                </h3>
              ) : (
                <h3 className="text-4xl sm:text-5xl font-bold text-white">
                  ₽ • • • • • •
                </h3>
              )}
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {showBalance ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
          
          {stats.growthPercent !== 0 && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
              stats.growthPercent > 0 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {stats.growthPercent > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-bold">
                {Math.abs(stats.growthPercent)}%
              </span>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-slate-400 mb-1">Доступно к выводу</p>
            <p className="text-2xl font-bold text-green-400">
              ₽{stats.availableBalance.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-slate-400 mb-1">В обработке</p>
            <p className="text-2xl font-bold text-yellow-400">
              ₽{stats.pendingWithdrawals.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-slate-400 mb-1">Выведено всего</p>
            <p className="text-2xl font-bold text-slate-300">
              ₽{stats.completedWithdrawals.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Валовой доход"
          value={`₽${(stats.totalRevenue / 1000).toFixed(0)}k`}
          subtitle={`За ${period} дней`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Чистый доход"
          value={`₽${(stats.totalNetRevenue / 1000).toFixed(0)}k`}
          subtitle="После комиссии"
          color="blue"
        />
        <StatCard
          icon={Percent}
          label="Комиссия (15%)"
          value={`₽${(stats.totalCommission / 1000).toFixed(0)}k`}
          subtitle="Платформе"
          color="orange"
        />
        <StatCard
          icon={BarChart3}
          label="Средний чек"
          value={`₽${stats.avgOrderValue.toLocaleString()}`}
          subtitle={`${stats.totalOrders} заказов`}
          color="purple"
        />
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days as 7 | 30 | 90)}
            className={`px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              period === days
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {days} дней
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          label="Обзор"
          icon={BarChart3}
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          label="Транзакции"
          icon={FileText}
          active={activeTab === 'transactions'}
          onClick={() => setActiveTab('transactions')}
          count={transactions.length}
        />
        <TabButton
          label="Выводы"
          icon={Upload}
          active={activeTab === 'withdrawals'}
          onClick={() => setActiveTab('withdrawals')}
          count={withdrawals.filter((w) => w.status === 'pending').length}
          badge={withdrawals.filter((w) => w.status === 'pending').length}
        />
        <TabButton
          label="Аналитика"
          icon={PieChart}
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} dailyRevenue={dailyRevenue} />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              transactions={transactions}
              onViewDetails={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {activeTab === 'withdrawals' && (
            <WithdrawalsTab
              withdrawals={withdrawals}
              onCancel={handleCancelWithdrawal}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab stats={stats} dailyRevenue={dailyRevenue} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showWithdrawalModal && (
          <WithdrawalModal
            availableBalance={stats.availableBalance}
            onClose={() => setShowWithdrawalModal(false)}
            onSubmit={(data) => {
              console.log('Withdrawal data:', data);
              toast.success('Заявка на вывод создана');
              setShowWithdrawalModal(false);
              loadFinancialData();
            }}
          />
        )}

        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
}

function StatCard({ icon: Icon, label, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border backdrop-blur-sm ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white/10">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 truncate">{label}</p>
          <p className="text-xl font-bold text-white truncate">{value}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

// =====================================================
// TAB BUTTON
// =====================================================

interface TabButtonProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  count?: number;
  badge?: number;
}

function TabButton({ label, icon: Icon, active, onClick, count, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && <span className="text-xs opacity-70">({count})</span>}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// Continue in next file due to length...