/**
 * PAYMENTS PAGE - Единый финансовый центр
 * Включает: Обзор, Доходы, Расходы, Транзакции, Донаты, Подписка, Методы оплаты, Вывод средств
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Download,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  Filter,
  Search,
  Eye,
  EyeOff,
  Heart,
  Music,
  Radio,
  Megaphone,
  Coins as CoinsIcon,
  Check,
  X,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  ChevronDown,
  ExternalLink,
  Crown,
  Copy,
  Share2,
  Settings,
  Sparkles,
  Zap,
  MessageCircle,
  Ticket,
  Store,
  Coffee,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DonationsPage } from './donations-page';
import { SubscriptionPage } from './subscription-page';
import { TransactionDetailCard } from './transaction-detail-card';
import { toast } from 'sonner';
import { mockTransactions } from '@/app/data/transactions-data';

type TabId = 'overview' | 'income' | 'expenses' | 'transactions' | 'donations' | 'subscription' | 'methods' | 'withdraw';

interface PaymentsPageProps {
  onReplyToDonator?: (userId: string, userName: string, userAvatar?: string) => void;
}

// Mock данные для графиков
const chartData = [
  { date: '20 янв', income: 12000, expense: 3500 },
  { date: '21 янв', income: 8500, expense: 3500 },
  { date: '22 янв', income: 53000, expense: 2000 },
  { date: '23 янв', income: 25000, expense: 1500 },
  { date: '24 янв', income: 2250, expense: 2000 },
  { date: '25 янв', income: 12500, expense: 500 },
  { date: '26 янв', income: 1500, expense: 1490 },
  { date: '27 янв', income: 2000, expense: 1000 },
];

// Mock данные для карт
const mockCards = [
  { id: 1, type: 'visa', number: '4532 **** **** 1234', holder: 'IVAN PETROV', expires: '12/27', isDefault: true },
  { id: 2, type: 'mastercard', number: '5421 **** **** 5678', holder: 'IVAN PETROV', expires: '06/28', isDefault: false },
];

const COLORS = ['#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#6366f1'];

export function PaymentsPage({ onReplyToDonator }: PaymentsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'withdraw'>('all');
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  
  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCard, setWithdrawCard] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Mock subscription state
  const [userSubscription, setUserSubscription] = useState({
    tier: 'pro' as const,
    expires_at: '2026-12-31',
    features: ['priority_support', 'advanced_analytics', 'marketing_discount'],
    price: 1490,
    status: 'active' as const,
  });

  // Mock данные
  const balance = 125430;
  const monthIncome = 116750; // Обновлено с учетом всех доходов
  const monthExpense = 10490; // Обновлено с учетом подписки
  const donationsTotal = 5250; // Сумма всех донатов за месяц
  const toWithdraw = balance - 10000; // Минус минимальная сумма на счету

  // Статистика по источникам дохода (с донатами)
  const incomeBySource = [
    { name: 'Донаты', value: 5250, percent: 4.5, color: '#ec4899' },
    { name: 'Концерты', value: 25000, percent: 21.4, color: '#8b5cf6' },
    { name: 'Радио', value: 12000, percent: 10.3, color: '#06b6d4' },
    { name: 'Вывод средств', value: 50000, percent: 42.8, color: '#10b981' },
  ];

  // Статистика по расходам (с подпиской)
  const expenseByCategory = [
    { name: 'Маркетинг', value: 3500, percent: 33.4, color: '#ec4899' },
    { name: 'Подписка Pro', value: 1490, percent: 14.2, color: '#8b5cf6' },
    { name: 'Коины', value: 1000, percent: 9.5, color: '#f59e0b' },
    { name: 'Питчинг', value: 500, percent: 4.8, color: '#06b6d4' },
    { name: 'Баннеры', value: 2000, percent: 19.1, color: '#a855f7' },
  ];

  const tabs = [
    { id: 'overview' as TabId, label: 'Обзор', icon: PieChart },
    { id: 'income' as TabId, label: 'Доходы', icon: TrendingUp },
    { id: 'expenses' as TabId, label: 'Расходы', icon: TrendingDown },
    { id: 'transactions' as TabId, label: 'Транзакции', icon: FileText },
    { id: 'donations' as TabId, label: 'Донаты', icon: Heart },
    { id: 'subscription' as TabId, label: 'Подписка', icon: Crown },
    { id: 'methods' as TabId, label: 'Методы оплаты', icon: CreditCard },
    { id: 'withdraw' as TabId, label: 'Вывод', icon: Download },
  ];

  // Фильтрация транзакций
  const filteredTransactions = mockTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.to?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // Обработка вывода средств
  const handleWithdraw = () => {
    setWithdrawError('');
    
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || isNaN(amount)) {
      setWithdrawError('Укажите сумму');
      return;
    }
    
    if (amount < 1000) {
      setWithdrawError('Минимальная сумма вывода 1,000 ₽');
      return;
    }
    
    if (amount > toWithdraw) {
      setWithdrawError(`Недостаточно средств. Доступно: ${toWithdraw.toLocaleString('ru-RU')} ₽`);
      return;
    }
    
    if (!withdrawCard) {
      setWithdrawError('Выберите карту для вывода');
      return;
    }
    
    // Успешная заявка - отправляем уведомление
    toast.success('Заявка на вывод создана', {
      description: `Сумма: ${amount.toLocaleString('ru-RU')} ₽. Средства поступят в течение 1-3 рабочих дней.`,
      duration: 5000,
    });
    
    setWithdrawAmount('');
    setWithdrawCard('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg flex items-center gap-1">
            <Check className="w-3 h-3" />
            Завершено
          </span>
        );
      case 'processing':
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg flex items-center gap-1">
            <Clock className="w-3 h-3" />
            В обработке
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-1">
            <X className="w-3 h-3" />
            Ошибка
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'donate': return <Heart className="w-4 h-4 text-pink-400" />;
      case 'concert': return <Music className="w-4 h-4 text-purple-400" />;
      case 'radio': return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'marketing': return <Megaphone className="w-4 h-4 text-blue-400" />;
      case 'coins': return <CoinsIcon className="w-4 h-4 text-yellow-400" />;
      case 'subscription': return <Crown className="w-4 h-4 text-purple-400" />;
      case 'pitching': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'banner': return <Megaphone className="w-4 h-4 text-purple-400" />;
      case 'withdraw': return <Download className="w-4 h-4 text-gray-400" />;
      case 'ticket_sales': return <Ticket className="w-4 h-4 text-blue-400" />;
      case 'venue_royalties': return <Coffee className="w-4 h-4 text-orange-400" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Платежи и финансы</h1>
          </div>
          <p className="text-white/60 text-sm md:text-base">
            Единый финансовый центр: доходы, расходы, донаты, подписка и вывод средств
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Мой баланс */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Мой баланс</p>
                {showBalance ? (
                  <h3 className="text-3xl font-bold text-white">
                    {balance.toLocaleString('ru-RU')} ₽
                  </h3>
                ) : (
                  <h3 className="text-3xl font-bold text-white">• • • • • •</h3>
                )}
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-5 h-5 text-white/60" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white/60" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">Доступно для вывода</span>
            </div>
          </motion.div>

          {/* Доход за месяц */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Доход за месяц</p>
                <h3 className="text-3xl font-bold text-white">
                  +{monthIncome.toLocaleString('ru-RU')} ₽
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-sm">+15.3%</span>
              <span className="text-white/40 text-sm">чем в прошлом месяце</span>
            </div>
          </motion.div>

          {/* Расход за месяц */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Расход за месяц</p>
                <h3 className="text-3xl font-bold text-white">
                  -{monthExpense.toLocaleString('ru-RU')} ₽
                </h3>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm">+8.7%</span>
              <span className="text-white/40 text-sm">чем в прошлом месяце</span>
            </div>
          </motion.div>

          {/* Донаты за месяц */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Донаты за месяц</p>
                <h3 className="text-3xl font-bold text-white">
                  {donationsTotal.toLocaleString('ru-RU')} ₽
                </h3>
              </div>
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('donations')}
              className="w-full py-2 bg-pink-500 hover:bg-pink-600 rounded-xl text-white text-sm font-medium transition-colors"
            >
              Управление донатами
            </button>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max md:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-green-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* ОБЗОР */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* График доходов и расходов */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Динамика доходов и расходов</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b98130" name="Доходы" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef444430" name="Расходы" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Доходы по источникам */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Источники дохода</h3>
                  <div className="space-y-4">
                    {incomeBySource.map((source, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm">{source.name}</span>
                          <span className="text-white font-semibold">{source.value.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${source.percent}%`, backgroundColor: source.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Расходы по категориям */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Структура расходов</h3>
                  <div className="space-y-4">
                    {expenseByCategory.map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm">{category.name}</span>
                          <span className="text-white font-semibold">{category.value.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${category.percent}%`, backgroundColor: category.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ДОХОДЫ - с полной детализацией */}
          {activeTab === 'income' && (
            <motion.div
              key="income"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 md:p-6"
            >
              <h3 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">История доходов</h3>
              
              <div className="space-y-3">
                {mockTransactions.filter(t => t.type === 'income').map((transaction) => (
                  <TransactionDetailCard
                    key={transaction.id}
                    transaction={transaction}
                    getCategoryIcon={getCategoryIcon}
                    getStatusBadge={getStatusBadge}
                    onReplyToDonator={onReplyToDonator}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* РАСХОДЫ - с полной детализацией */}
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 md:p-6"
            >
              <h3 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">История расходов</h3>
              
              <div className="space-y-3">
                {mockTransactions.filter(t => t.type === 'expense').map((transaction) => (
                  <TransactionDetailCard
                    key={transaction.id}
                    transaction={transaction}
                    getCategoryIcon={getCategoryIcon}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ТРАНЗАКЦИИ */}
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Фильтры - адаптивные */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  {/* Поиск */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск транзакций..."
                      className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm md:text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>

                  {/* Фильтр по типу - горизонтальный скролл на мобилке */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {(['all', 'income', 'expense', 'withdraw'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                          filterType === type
                            ? 'bg-green-500 text-white'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {type === 'all' && 'Все'}
                        {type === 'income' && 'Доходы'}
                        {type === 'expense' && 'Расходы'}
                        {type === 'withdraw' && 'Выводы'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Список транзакций с полной детализацией */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 md:p-6">
                <div className="space-y-3">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 text-sm md:text-base">Транзакций не найдено</p>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TransactionDetailCard
                        key={transaction.id}
                        transaction={transaction}
                        getCategoryIcon={getCategoryIcon}
                        getStatusBadge={getStatusBadge}
                        onReplyToDonator={onReplyToDonator}
                      />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ДОНАТЫ - встроенная страница */}
          {activeTab === 'donations' && (
            <motion.div
              key="donations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DonationsPage userCoins={1250} onCoinsUpdate={() => {}} onReplyToDonator={onReplyToDonator} />
            </motion.div>
          )}

          {/* ПОДПИСКА - встроенная страница */}
          {activeTab === 'subscription' && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SubscriptionPage 
                userId="artist_demo_001"
                currentSubscription={userSubscription}
                onSubscriptionChange={setUserSubscription}
              />
            </motion.div>
          )}

          {/* МЕТОДЫ ОПЛАТЫ */}
          {activeTab === 'methods' && (
            <motion.div
              key="methods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Привязанные карты */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Привязанные карты</h3>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Добавить карту
                  </button>
                </div>

                <div className="space-y-4">
                  {mockCards.map((card) => (
                    <div key={card.id} className="p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl relative overflow-hidden">
                      {/* Card design */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-8">
                          <div>
                            <p className="text-white/60 text-xs mb-1">
                              {card.type === 'visa' ? 'VISA' : 'Mastercard'}
                            </p>
                            <p className="text-white text-xl font-mono tracking-wider">{card.number}</p>
                          </div>
                          {card.isDefault && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                              Основная
                            </span>
                          )}
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-white/60 text-xs mb-1">Владелец</p>
                            <p className="text-white text-sm font-medium">{card.holder}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-xs mb-1">Действует до</p>
                            <p className="text-white text-sm font-medium">{card.expires}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                          {!card.isDefault && (
                            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors">
                              Сделать основной
                            </button>
                          )}
                          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors flex items-center gap-1">
                            <Edit className="w-3 h-3" />
                            Изменить
                          </button>
                          <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs transition-colors flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Информация */}
              <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Безопасность данных</h4>
                    <p className="text-white/60 text-sm">
                      Все данные банковских карт надежно зашифрованы и хранятся в соответствии с международными стандартами безопасности PCI DSS.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ВЫВОД СРЕДСТВ */}
          {activeTab === 'withdraw' && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Вывод средств</h3>
                  <p className="text-white/60">
                    Доступно к выводу: <span className="text-white font-bold">{toWithdraw.toLocaleString('ru-RU')} ₽</span>
                  </p>
                </div>

                {/* Форма */}
                <div className="space-y-6">
                  {/* Сумма */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Сумма вывода
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value);
                          setWithdrawError('');
                        }}
                        placeholder="Введите сумму"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">₽</span>
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      Минимальная сумма: 1,000 ₽
                    </p>
                  </div>

                  {/* Выбор карты */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Карта для вывода
                    </label>
                    <div className="space-y-2">
                      {mockCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => {
                            setWithdrawCard(card.id.toString());
                            setWithdrawError('');
                          }}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${
                            withdrawCard === card.id.toString()
                              ? 'bg-green-500/20 border-green-500'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{card.number}</p>
                              <p className="text-white/60 text-sm">{card.holder}</p>
                            </div>
                            {card.isDefault && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                                Основная
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ошибка */}
                  {withdrawError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{withdrawError}</p>
                    </div>
                  )}

                  {/* Информация о комиссии */}
                  <div className="p-4 bg-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Сумма к выводу:</span>
                      <span className="text-white font-medium">
                        {withdrawAmount ? parseFloat(withdrawAmount).toLocaleString('ru-RU') : '0'} ₽
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Комиссия (2.5%):</span>
                      <span className="text-white font-medium">
                        {withdrawAmount ? (parseFloat(withdrawAmount) * 0.025).toLocaleString('ru-RU') : '0'} ₽
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between">
                      <span className="text-white font-semibold">К получению:</span>
                      <span className="text-green-400 font-bold text-lg">
                        {withdrawAmount ? (parseFloat(withdrawAmount) * 0.975).toLocaleString('ru-RU') : '0'} ₽
                      </span>
                    </div>
                  </div>

                  {/* Кнопка */}
                  <button
                    onClick={handleWithdraw}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 rounded-xl text-white font-bold text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-6 h-6" />
                    Заказать выплату
                  </button>

                  {/* Сроки */}
                  <div className="text-center">
                    <p className="text-white/40 text-sm">
                      Средства поступят на карту в течение <span className="text-white">1-3 рабочих дней</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}