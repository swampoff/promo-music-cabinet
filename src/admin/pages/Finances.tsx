/**
 * FINANCES - Управление финансами админ-панели
 * Полная финансовая аналитика, транзакции, балансы пользователей
 * Интеграция с FINANCIAL_POLICY_MASTER.md
 * Adaptive: 320px → 4K
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Download, Filter, Calendar, CreditCard, Wallet, Users, Music2,
  Search, ArrowUpDown, ArrowUp, ArrowDown, Eye, X, CheckCircle,
  Clock, XCircle, RefreshCw, BarChart3, PieChart, TrendingUpIcon,
  Activity, Tag, User, Mail, Phone, Building2, MapPin, Star,
  Plus, Minus, Edit2, Save, AlertCircle, ShoppingBag, Zap,
  FileText, Package, Radio, Coffee, Newspaper, Video, UserCheck,
  Target, Percent, Award, Crown, Calculator, Send, BookOpen,
  Receipt, Bell, ClipboardList, FileSpreadsheet, Shield,
  Settings, Info, ChevronRight, ChevronDown, Copy, ExternalLink,
  Lock, Unlock, Archive, Upload, Printer, FolderOpen, FileCheck,
  FileX, FilePlus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar,
  ComposedChart
} from 'recharts';
import { Accounting } from './Accounting';

// ==================== TYPES ====================

type TransactionType = 'income' | 'expense' | 'refund' | 'commission' | 'withdrawal' | 'deposit';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';
type TransactionCategory = 
  | 'subscription' | 'streaming' | 'promotion' | 'partners' 
  | 'infrastructure' | 'staff' | 'marketing' | 'pitching'
  | 'production360' | 'promolab' | 'refund' | 'withdrawal';

type SortField = 'date' | 'amount' | 'status' | 'category';
type SortDirection = 'asc' | 'desc';
type PeriodFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string;
  status: TransactionStatus;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  orderId?: string;
  fee?: number;
  netAmount?: number;
}

interface UserBalance {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  totalSpent: number;
  totalEarned: number;
  transactionsCount: number;
  lastTransaction: string;
  status: 'active' | 'blocked' | 'pending';
}

export function Finances() {
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TransactionStatus>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | TransactionCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedUserBalance, setSelectedUserBalance] = useState<UserBalance | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'users' | 'accounting'>('overview');
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<string | null>(null);

  // ==================== MOCK DATA ====================

  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'income',
      amount: 125000,
      description: 'Подписка Premium - 245 пользователей',
      category: 'subscription',
      date: '2026-02-01T14:30:00',
      status: 'completed',
      userId: 'user1',
      userName: 'Иван Петров',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      orderId: 'ORD-2026-001',
      fee: 6250,
      netAmount: 118750,
    },
    {
      id: 2,
      type: 'income',
      amount: 87500,
      description: 'Комиссия от стриминга',
      category: 'streaming',
      date: '2026-02-01T12:15:00',
      status: 'completed',
      userId: 'user2',
      userName: 'Мария Смирнова',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      orderId: 'ORD-2026-002',
      fee: 4375,
      netAmount: 83125,
    },
    {
      id: 3,
      type: 'expense',
      amount: 45000,
      description: 'Серверные расходы AWS',
      category: 'infrastructure',
      date: '2026-01-31T18:00:00',
      status: 'completed',
    },
    {
      id: 4,
      type: 'commission',
      amount: 65000,
      description: 'Продвижение треков - комиссия платформы',
      category: 'promotion',
      date: '2026-01-31T16:45:00',
      status: 'completed',
      userId: 'user3',
      userName: 'Алексей Волков',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      orderId: 'ORD-2026-003',
      fee: 3250,
      netAmount: 61750,
    },
    {
      id: 5,
      type: 'expense',
      amount: 28000,
      description: 'Зарплаты модераторов',
      category: 'staff',
      date: '2026-01-31T10:00:00',
      status: 'completed',
    },
    {
      id: 6,
      type: 'income',
      amount: 42000,
      description: 'Партнерская программа - Русское Радио',
      category: 'partners',
      date: '2026-01-30T14:20:00',
      status: 'pending',
      userId: 'partner1',
      userName: 'Русское Радио',
      userAvatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
    },
    {
      id: 7,
      type: 'commission',
      amount: 95000,
      description: 'Питчинг-рассылка: 5 кампаний',
      category: 'pitching',
      date: '2026-01-30T11:30:00',
      status: 'completed',
      userId: 'user4',
      userName: 'Елена Соколова',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      orderId: 'ORD-2026-004',
      fee: 4750,
      netAmount: 90250,
    },
    {
      id: 8,
      type: 'income',
      amount: 180000,
      description: 'Production 360 - Full Package',
      category: 'production360',
      date: '2026-01-29T15:45:00',
      status: 'completed',
      userId: 'user5',
      userName: 'Дмитрий Козлов',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      orderId: 'ORD-2026-005',
      fee: 9000,
      netAmount: 171000,
    },
    {
      id: 9,
      type: 'refund',
      amount: 15000,
      description: 'Возврат средств - отмена заказа',
      category: 'refund',
      date: '2026-01-29T13:20:00',
      status: 'completed',
      userId: 'user6',
      userName: 'Анна Новикова',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      orderId: 'ORD-2026-006',
    },
    {
      id: 10,
      type: 'expense',
      amount: 35000,
      description: 'Маркетинг и реклама',
      category: 'marketing',
      date: '2026-01-29T09:15:00',
      status: 'completed',
    },
    {
      id: 11,
      type: 'withdrawal',
      amount: 75000,
      description: 'Вывод средств на карту',
      category: 'withdrawal',
      date: '2026-01-28T16:30:00',
      status: 'pending',
      userId: 'user7',
      userName: 'Сергей Белов',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    },
    {
      id: 12,
      type: 'commission',
      amount: 52000,
      description: 'Promo.Lab - контент-стратегия',
      category: 'promolab',
      date: '2026-01-28T14:10:00',
      status: 'completed',
      userId: 'user8',
      userName: 'Ольга Морозова',
      userAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      orderId: 'ORD-2026-007',
      fee: 2600,
      netAmount: 49400,
    },
  ]);

  const [userBalances] = useState<UserBalance[]>([
    {
      id: 'user1',
      name: 'Иван Петров',
      email: 'ivan@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      balance: 45000,
      totalSpent: 340000,
      totalEarned: 385000,
      transactionsCount: 28,
      lastTransaction: '2026-02-01T14:30:00',
      status: 'active',
    },
    {
      id: 'user2',
      name: 'Мария Смирнова',
      email: 'maria@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      balance: 82000,
      totalSpent: 156000,
      totalEarned: 238000,
      transactionsCount: 42,
      lastTransaction: '2026-02-01T12:15:00',
      status: 'active',
    },
    {
      id: 'user3',
      name: 'Алексей Волков',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      balance: 128000,
      totalSpent: 425000,
      totalEarned: 553000,
      transactionsCount: 67,
      lastTransaction: '2026-01-31T16:45:00',
      status: 'active',
    },
    {
      id: 'user4',
      name: 'Елена Соколова',
      email: 'elena@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      balance: 15000,
      totalSpent: 89000,
      totalEarned: 104000,
      transactionsCount: 19,
      lastTransaction: '2026-01-30T11:30:00',
      status: 'pending',
    },
    {
      id: 'user5',
      name: 'Дмитрий Козлов',
      email: 'dmitry@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      balance: 210000,
      totalSpent: 680000,
      totalEarned: 890000,
      transactionsCount: 94,
      lastTransaction: '2026-01-29T15:45:00',
      status: 'active',
    },
  ]);

  // ==================== CHART DATA ====================

  // Данные для графика доходов/расходов по времени (последние 30 дней)
  const timelineData = [
    { date: '25 янв', income: 180000, expense: 45000, profit: 135000, transactions: 8 },
    { date: '26 янв', income: 220000, expense: 52000, profit: 168000, transactions: 12 },
    { date: '27 янв', income: 195000, expense: 38000, profit: 157000, transactions: 10 },
    { date: '28 янв', income: 280000, expense: 75000, profit: 205000, transactions: 15 },
    { date: '29 янв', income: 310000, expense: 80000, profit: 230000, transactions: 18 },
    { date: '30 янв', income: 245000, expense: 42000, profit: 203000, transactions: 14 },
    { date: '31 янв', income: 298000, expense: 73000, profit: 225000, transactions: 16 },
    { date: '01 фев', income: 346500, expense: 45000, profit: 301500, transactions: 20 },
  ];

  // Данные для почасовой активности (24 часа)
  const hourlyActivity = [
    { hour: '00:00', amount: 12000, transactions: 2 },
    { hour: '03:00', amount: 8000, transactions: 1 },
    { hour: '06:00', amount: 15000, transactions: 3 },
    { hour: '09:00', amount: 45000, transactions: 8 },
    { hour: '12:00', amount: 82000, transactions: 15 },
    { hour: '15:00', amount: 95000, transactions: 18 },
    { hour: '18:00', amount: 67000, transactions: 12 },
    { hour: '21:00', amount: 42500, transactions: 7 },
  ];

  // ==================== CALCULATIONS ====================

  const totalIncome = transactions
    .filter(t => ['income', 'commission'].includes(t.type) && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => ['expense', 'refund', 'withdrawal'].includes(t.type) && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const totalFees = transactions
    .filter(t => t.fee && t.status === 'completed')
    .reduce((sum, t) => sum + (t.fee || 0), 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const failedTransactions = transactions.filter(t => t.status === 'failed').length;

  // Revenue by category
  const revenueByCategory = [
    { 
      category: 'Подписки', 
      key: 'subscription',
      amount: transactions.filter(t => t.category === 'subscription' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      icon: CreditCard,
      color: 'from-blue-500 to-cyan-500',
      chartColor: '#3b82f6'
    },
    { 
      category: 'Стриминг', 
      key: 'streaming',
      amount: transactions.filter(t => t.category === 'streaming' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      icon: Music2,
      color: 'from-purple-500 to-pink-500',
      chartColor: '#a855f7'
    },
    { 
      category: 'Продвижение', 
      key: 'promotion',
      amount: transactions.filter(t => t.category === 'promotion' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      chartColor: '#10b981'
    },
    { 
      category: 'Питчинг', 
      key: 'pitching',
      amount: transactions.filter(t => t.category === 'pitching' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      icon: Radio,
      color: 'from-orange-500 to-red-500',
      chartColor: '#f97316'
    },
    { 
      category: 'Production 360', 
      key: 'production360',
      amount: transactions.filter(t => t.category === 'production360' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      icon: Video,
      color: 'from-pink-500 to-rose-500',
      chartColor: '#ec4899'
    },
    { 
      category: 'Promo.Lab', 
      key: 'promolab',
      amount: transactions.filter(t => t.category === 'promolab' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      chartColor: '#eab308'
    },
    { 
      category: 'Партнеры', 
      key: 'partners',
      amount: transactions.filter(t => t.category === 'partners' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      icon: Users,
      color: 'from-cyan-500 to-teal-500',
      chartColor: '#06b6d4'
    },
  ].sort((a, b) => b.amount - a.amount);

  const totalRevenue = revenueByCategory.reduce((sum, cat) => sum + cat.amount, 0);

  // Pie chart data
  const pieChartData = revenueByCategory
    .filter(cat => cat.amount > 0)
    .map(cat => ({
      name: cat.category,
      value: cat.amount,
      color: cat.chartColor,
      percentage: totalRevenue > 0 ? ((cat.amount / totalRevenue) * 100).toFixed(1) : '0'
    }));

  // Top users by spending
  const topUsers = [...userBalances]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Conversion metrics
  const conversionRate = 87.5; // Mock data
  const avgTransactionValue = totalIncome / completedTransactions;
  const transactionGrowth = 24.1; // Mock data

  // Filtering and Sorting
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.orderId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Дата', 'Тип', 'Категория', 'Описание', 'Сумма', 'Комиссия', 'Чистая сумма', 'Статус', 'Пользователь', 'Заказ'].join(','),
      ...filteredTransactions.map(t =>
        [
          t.id,
          new Date(t.date).toLocaleString('ru-RU'),
          t.type,
          t.category,
          `"${t.description}"`,
          t.amount,
          t.fee || 0,
          t.netAmount || t.amount,
          t.status,
          t.userName || '-',
          t.orderId || '-'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finances-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Данные экспортированы');
  };

  const getTypeConfig = (type: TransactionType) => {
    const configs = {
      income: { label: 'Доход', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30', icon: ArrowDownRight },
      expense: { label: 'Расход', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30', icon: ArrowUpRight },
      commission: { label: 'Комиссия', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30', icon: DollarSign },
      refund: { label: 'Возврат', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-400/30', icon: RefreshCw },
      withdrawal: { label: 'Вывод', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-400/30', icon: Wallet },
      deposit: { label: 'Пополнение', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30', icon: Plus },
    };
    return configs[type];
  };

  const getStatusConfig = (status: TransactionStatus) => {
    const configs = {
      completed: { label: 'Завершено', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30', icon: CheckCircle },
      pending: { label: 'В обработке', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30', icon: Clock },
      failed: { label: 'Ошибка', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30', icon: XCircle },
      cancelled: { label: 'Отменено', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/30', icon: X },
    };
    return configs[status];
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 opacity-40" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
      : <ArrowDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-cyan-400" />;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/95 border border-gray-200 rounded-lg p-3 shadow-2xl">
          <p className="text-gray-900 font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium text-gray-900">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {typeof entry.value === 'number' 
                ? entry.value >= 1000 
                  ? `${(entry.value / 1000).toFixed(0)}K ₽` 
                  : `${entry.value}₽`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 xs:gap-4">
          <div className="p-3 xs:p-4 rounded-xl xs:rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 shrink-0">
            <DollarSign className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
              Финансы
            </h1>
            <p className="text-xs xs:text-sm sm:text-base text-gray-400">
              Доходы, расходы и аналитика платформы
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 xs:gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 xs:gap-2
              px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
              rounded-lg xs:rounded-xl
              bg-gradient-to-r from-blue-500 to-cyan-500
              hover:from-blue-600 hover:to-cyan-600
              text-white font-medium
              text-xs xs:text-sm sm:text-base
              transition-all active:scale-95 shadow-lg"
          >
            <Download className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Экспорт</span>
          </button>
          <div className="flex gap-0.5 xs:gap-1 p-0.5 xs:p-1 rounded-lg xs:rounded-xl bg-white/5">
            {(['today', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5
                  rounded-md xs:rounded-lg
                  text-[10px] xs:text-xs sm:text-sm font-medium
                  transition-all
                  ${period === p
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {p === 'today' ? 'Сегодня' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 xs:gap-2 p-1 xs:p-1.5 rounded-lg xs:rounded-xl bg-white/5 overflow-x-auto">
        {[
          { id: 'overview', label: 'Обзор', icon: BarChart3 },
          { id: 'transactions', label: 'Транзакции', icon: FileText },
          { id: 'users', label: 'Балансы пользователей', icon: Users },
          { id: 'accounting', label: 'Бухгалтерия', icon: Calculator },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 xs:gap-2
                px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3
                rounded-md xs:rounded-lg
                text-xs xs:text-sm sm:text-base font-medium
                transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4 xs:space-y-5 sm:space-y-6">
          {/* MAIN KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {[
              {
                title: 'Общий доход',
                value: `${(totalIncome / 1000000).toFixed(2)}M ₽`,
                change: '+12.5%',
                isPositive: true,
                icon: TrendingUp,
                color: 'from-green-500 to-emerald-500',
                subtitle: 'За последние 30 дней'
              },
              {
                title: 'Расходы',
                value: `${(totalExpense / 1000).toFixed(0)}K ₽`,
                change: '+8.2%',
                isPositive: false,
                icon: TrendingDown,
                color: 'from-red-500 to-pink-500',
                subtitle: 'Операционные расходы'
              },
              {
                title: 'Чистая прибыль',
                value: `${(netProfit / 1000000).toFixed(2)}M ₽`,
                change: '+15.3%',
                isPositive: true,
                icon: Wallet,
                color: 'from-blue-500 to-cyan-500',
                subtitle: `ROI: ${((netProfit / totalExpense) * 100).toFixed(0)}%`
              },
              {
                title: 'Комиссии платформы',
                value: `${(totalFees / 1000).toFixed(0)}K ₽`,
                change: '+18.7%',
                isPositive: true,
                icon: DollarSign,
                color: 'from-purple-500 to-pink-500',
                subtitle: `${((totalFees / totalIncome) * 100).toFixed(1)}% от дохода`
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="backdrop-blur-xl bg-white/5
                    rounded-lg xs:rounded-xl sm:rounded-2xl
                    border border-white/10
                    p-3 xs:p-4 sm:p-5 md:p-6
                    hover:border-green-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2 xs:mb-3 sm:mb-4">
                    <div className={`p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl
                      bg-gradient-to-br ${stat.color} bg-opacity-20`}
                    >
                      <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md xs:rounded-lg
                      ${stat.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      {stat.isPositive ? (
                        <ArrowUpRight className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ArrowDownRight className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" />
                      )}
                      <span className="text-[10px] xs:text-xs sm:text-sm font-semibold">{stat.change}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm mb-0.5 xs:mb-1">{stat.title}</p>
                  <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 xs:mb-2">
                    {stat.value}
                  </p>
                  <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                    {stat.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* REVENUE VS EXPENSES CHART */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5
              rounded-lg xs:rounded-xl sm:rounded-2xl
              border border-white/10
              p-4 xs:p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6">
              <div>
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  Динамика доходов и расходов
                </h2>
                <p className="text-xs xs:text-sm text-gray-400">
                  Тренд за последние 8 дней • Прибыль: +{((netProfit / totalIncome) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center gap-4 xs:gap-6">
                <div className="flex items-center gap-1.5 xs:gap-2">
                  <div className="w-2 h-2 xs:w-3 xs:h-3 rounded-full bg-green-400" />
                  <span className="text-[10px] xs:text-xs sm:text-sm text-gray-400">Доход</span>
                </div>
                <div className="flex items-center gap-1.5 xs:gap-2">
                  <div className="w-2 h-2 xs:w-3 xs:h-3 rounded-full bg-red-400" />
                  <span className="text-[10px] xs:text-xs sm:text-sm text-gray-400">Расход</span>
                </div>
                <div className="flex items-center gap-1.5 xs:gap-2">
                  <div className="w-2 h-2 xs:w-3 xs:h-3 rounded-full bg-blue-400" />
                  <span className="text-[10px] xs:text-xs sm:text-sm text-gray-400">Прибыль</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={timelineData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="date" 
                  stroke="#e5e7eb" 
                  style={{ fontSize: '12px', fill: '#e5e7eb' }}
                  tick={{ fill: '#e5e7eb' }}
                />
                <YAxis 
                  stroke="#e5e7eb" 
                  style={{ fontSize: '12px', fill: '#e5e7eb' }}
                  tick={{ fill: '#e5e7eb' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Доход"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Расход"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Прибыль"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* REVENUE BY CATEGORY & HOURLY ACTIVITY */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
            {/* PIE CHART - Revenue Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/5
                rounded-lg xs:rounded-xl sm:rounded-2xl
                border border-white/10
                p-4 xs:p-5 sm:p-6"
            >
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  Распределение доходов
                </h2>
                <p className="text-xs xs:text-sm text-gray-400">
                  По категориям услуг • Всего: {(totalRevenue / 1000000).toFixed(2)}M ₽
                </p>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={(data) => {
                          const category = revenueByCategory.find(c => c.category === data.name);
                          if (category) {
                            setSelectedCategoryForDetail(category.key);
                            toast.info(`Категория: ${data.name}`);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full lg:w-1/2 space-y-2 xs:space-y-3">
                  {pieChartData.map((item, index) => {
                    const category = revenueByCategory.find(c => c.category === item.name);
                    const Icon = category?.icon || CreditCard;
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          if (category) {
                            setSelectedCategoryForDetail(category.key);
                            toast.info(`Категория: ${item.name}`);
                          }
                        }}
                        className="w-full flex items-center justify-between
                          p-2 xs:p-3 rounded-lg
                          bg-white/5 hover:bg-white/10
                          border border-white/5 hover:border-white/20
                          transition-all group"
                      >
                        <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                          <div 
                            className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <Icon className="w-3 h-3 xs:w-4 xs:h-4 text-gray-400 shrink-0" />
                          <span className="text-xs xs:text-sm text-white truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 xs:gap-3 shrink-0">
                          <span className="text-xs xs:text-sm font-semibold text-white">
                            {item.percentage}%
                          </span>
                          <span className="text-[10px] xs:text-xs text-gray-400">
                            {item.value >= 1000000
                              ? `${(item.value / 1000000).toFixed(1)}M`
                              : `${(item.value / 1000).toFixed(0)}K`
                            }₽
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* HOURLY ACTIVITY CHART */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/5
                rounded-lg xs:rounded-xl sm:rounded-2xl
                border border-white/10
                p-4 xs:p-5 sm:p-6"
            >
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  Почасовая активность
                </h2>
                <p className="text-xs xs:text-sm text-gray-400">
                  Транзакции по времени суток • Пик: 15:00-18:00
                </p>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyActivity}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#e5e7eb"
                    style={{ fontSize: '11px', fill: '#e5e7eb' }}
                    tick={{ fill: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#e5e7eb"
                    style={{ fontSize: '11px', fill: '#e5e7eb' }}
                    tick={{ fill: '#e5e7eb' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    name="Сумма" 
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* TOP USERS & CONVERSION METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
            {/* TOP USERS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5
                rounded-lg xs:rounded-xl sm:rounded-2xl
                border border-white/10
                p-4 xs:p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
                <div>
                  <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                    Топ пользователей
                  </h2>
                  <p className="text-xs xs:text-sm text-gray-400">
                    По общим тратам
                  </p>
                </div>
                <Crown className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-yellow-400" />
              </div>

              <div className="space-y-3 xs:space-y-4">
                {topUsers.map((user, index) => (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedUserBalance(user)}
                    className="w-full flex items-center gap-3 xs:gap-4
                      p-3 xs:p-4 rounded-lg xs:rounded-xl
                      bg-white/5 hover:bg-white/10
                      border border-white/5 hover:border-cyan-500/30
                      transition-all group"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-white/10"
                      />
                      <div className={`absolute -top-1 -right-1 w-5 h-5 xs:w-6 xs:h-6
                        rounded-full flex items-center justify-center
                        text-[10px] xs:text-xs font-bold
                        ${index === 0 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                          : 'bg-white/20 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="text-sm xs:text-base font-semibold text-white mb-0.5 truncate">
                        {user.name}
                      </h3>
                      <p className="text-xs xs:text-sm text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm xs:text-base sm:text-lg font-bold text-green-400 mb-0.5">
                        {(user.totalSpent / 1000).toFixed(0)}K ₽
                      </p>
                      <p className="text-[10px] xs:text-xs text-gray-400">
                        {user.transactionsCount} транз.
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CONVERSION METRICS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5
                rounded-lg xs:rounded-xl sm:rounded-2xl
                border border-white/10
                p-4 xs:p-5 sm:p-6"
            >
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  Ключевые метрики
                </h2>
                <p className="text-xs xs:text-sm text-gray-400">
                  Конверсия и эффективность
                </p>
              </div>

              <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                {/* Conversion Rate */}
                <div className="p-4 xs:p-5 rounded-lg xs:rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3 xs:mb-4">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <Target className="w-5 h-5 xs:w-6 xs:h-6 text-purple-400" />
                      <span className="text-sm xs:text-base text-gray-300">Конверсия</span>
                    </div>
                    <span className="text-xs xs:text-sm text-purple-400 font-semibold">+5.2%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={80}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="100%" 
                      data={[{ name: 'Конверсия', value: conversionRate, fill: '#a855f7' }]}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <p className="text-center text-2xl xs:text-3xl sm:text-4xl font-bold text-white">
                    {conversionRate}%
                  </p>
                </div>

                {/* Average Transaction Value */}
                <div className="p-4 xs:p-5 rounded-lg xs:rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                    <DollarSign className="w-5 h-5 xs:w-6 xs:h-6 text-cyan-400" />
                    <span className="text-sm xs:text-base text-gray-300">Средний чек</span>
                  </div>
                  <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-1">
                    {(avgTransactionValue / 1000).toFixed(1)}K ₽
                  </p>
                  <p className="text-xs xs:text-sm text-green-400">
                    +12.3% к предыдущему периоду
                  </p>
                </div>

                {/* Transaction Growth */}
                <div className="p-4 xs:p-5 rounded-lg xs:rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                    <TrendingUp className="w-5 h-5 xs:w-6 xs:h-6 text-green-400" />
                    <span className="text-sm xs:text-base text-gray-300">Рост транзакций</span>
                  </div>
                  <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-1">
                    +{transactionGrowth}%
                  </p>
                  <p className="text-xs xs:text-sm text-gray-400">
                    {completedTransactions} завершенных за период
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* TRANSACTIONS STATUS SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {[
              {
                title: 'Завершено',
                value: completedTransactions,
                amount: `${(totalIncome / 1000000).toFixed(2)}M ₽`,
                icon: CheckCircle,
                color: 'from-green-500 to-emerald-500',
                percentage: ((completedTransactions / transactions.length) * 100).toFixed(0)
              },
              {
                title: 'В обработке',
                value: pendingTransactions,
                amount: `${(pendingAmount / 1000).toFixed(0)}K ₽`,
                icon: Clock,
                color: 'from-yellow-500 to-orange-500',
                percentage: ((pendingTransactions / transactions.length) * 100).toFixed(0)
              },
              {
                title: 'Ошибки',
                value: failedTransactions,
                amount: '0 ₽',
                icon: XCircle,
                color: 'from-red-500 to-pink-500',
                percentage: ((failedTransactions / transactions.length) * 100).toFixed(0)
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5
                    rounded-lg xs:rounded-xl sm:rounded-2xl
                    border border-white/10
                    p-3 xs:p-4 sm:p-5 md:p-6
                    hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3 xs:mb-4">
                    <div className={`p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl
                      bg-gradient-to-br ${stat.color} bg-opacity-20`}
                    >
                      <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xs xs:text-sm font-semibold text-gray-400">
                      {stat.percentage}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm mb-0.5 xs:mb-1">
                    {stat.title}
                  </p>
                  <p className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 xs:mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-400">
                    {stat.amount}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 xs:space-y-5 sm:space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="space-y-3 xs:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2
                  w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по описанию, пользователю, заказу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full
                    pl-10 xs:pl-12 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3
                    rounded-lg xs:rounded-xl
                    backdrop-blur-md bg-white/5
                    border border-white/10
                    text-white placeholder-gray-400
                    text-xs xs:text-sm sm:text-base
                    focus:outline-none focus:border-green-400/50 transition-colors"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2
                  px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
                  rounded-lg xs:rounded-xl
                  backdrop-blur-md border
                  text-xs xs:text-sm sm:text-base
                  transition-all
                  ${showFilters
                    ? 'bg-green-500/20 border-green-400/50 text-green-400'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
              >
                <Filter className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Фильтры</span>
              </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 xs:p-4 sm:p-5
                    rounded-lg xs:rounded-xl
                    backdrop-blur-md bg-white/5 border border-white/10
                    space-y-3 xs:space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4">
                      {/* Type Filter */}
                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                          Тип
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as any)}
                          className="w-full px-3 xs:px-4 py-2 xs:py-2.5
                            rounded-lg xs:rounded-xl
                            bg-white/5 border border-white/10
                            text-white text-xs xs:text-sm
                            focus:outline-none focus:border-green-400/50 transition-colors"
                        >
                          <option value="all">Все типы</option>
                          <option value="income">Доход</option>
                          <option value="expense">Расход</option>
                          <option value="commission">Комиссия</option>
                          <option value="refund">Возврат</option>
                          <option value="withdrawal">Вывод</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                          Статус
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="w-full px-3 xs:px-4 py-2 xs:py-2.5
                            rounded-lg xs:rounded-xl
                            bg-white/5 border border-white/10
                            text-white text-xs xs:text-sm
                            focus:outline-none focus:border-green-400/50 transition-colors"
                        >
                          <option value="all">Все статусы</option>
                          <option value="completed">Завершено</option>
                          <option value="pending">В обработке</option>
                          <option value="failed">Ошибка</option>
                          <option value="cancelled">Отменено</option>
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                          Категория
                        </label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value as any)}
                          className="w-full px-3 xs:px-4 py-2 xs:py-2.5
                            rounded-lg xs:rounded-xl
                            bg-white/5 border border-white/10
                            text-white text-xs xs:text-sm
                            focus:outline-none focus:border-green-400/50 transition-colors"
                        >
                          <option value="all">Все категории</option>
                          <option value="subscription">Подписки</option>
                          <option value="streaming">Стриминг</option>
                          <option value="promotion">Продвижение</option>
                          <option value="pitching">Питчинг</option>
                          <option value="production360">Production 360</option>
                          <option value="promolab">Promo.Lab</option>
                          <option value="partners">Партнеры</option>
                          <option value="infrastructure">Инфраструктура</option>
                          <option value="staff">Персонал</option>
                          <option value="marketing">Маркетинг</option>
                        </select>
                      </div>
                    </div>

                    {/* Reset Filters */}
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterStatus('all');
                        setFilterCategory('all');
                        setSearchQuery('');
                        toast.success('Фильтры сброшены');
                      }}
                      className="w-full sm:w-auto
                        flex items-center justify-center gap-2
                        px-3 xs:px-4 py-2 xs:py-2.5
                        rounded-lg
                        bg-white/5 hover:bg-white/10
                        border border-white/10
                        text-xs xs:text-sm text-gray-400
                        transition-all"
                    >
                      <RefreshCw className="w-3 h-3 xs:w-4 xs:h-4" />
                      Сбросить фильтры
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TRANSACTIONS TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5
              rounded-lg xs:rounded-xl sm:rounded-2xl
              border border-white/10
              overflow-hidden"
          >
            {/* Table Header */}
            <div className="p-3 xs:p-4 sm:p-5 md:p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Транзакции
                </h2>
                <span className="text-xs xs:text-sm text-gray-400">
                  Найдено: {filteredTransactions.length}
                </span>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-3 xs:gap-4
                  px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-3
                  bg-white/5 border-b border-white/10">
                  <button
                    onClick={() => handleSort('date')}
                    className="col-span-2 flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Дата
                    <SortIcon field="date" />
                  </button>
                  <div className="col-span-3 text-xs sm:text-sm font-semibold text-gray-400">
                    Описание
                  </div>
                  <button
                    onClick={() => handleSort('category')}
                    className="col-span-2 flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Категория
                    <SortIcon field="category" />
                  </button>
                  <button
                    onClick={() => handleSort('amount')}
                    className="col-span-2 flex items-center justify-end gap-1 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Сумма
                    <SortIcon field="amount" />
                  </button>
                  <button
                    onClick={() => handleSort('status')}
                    className="col-span-2 flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Статус
                    <SortIcon field="status" />
                  </button>
                  <div className="col-span-1 text-xs sm:text-sm font-semibold text-gray-400 text-right">
                    Действия
                  </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/10">
                  {filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Транзакции не найдены
                      </h3>
                      <p className="text-sm text-gray-400">
                        Попробуйте изменить параметры поиска или фильтры
                      </p>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction, index) => {
                      const typeConfig = getTypeConfig(transaction.type);
                      const statusConfig = getStatusConfig(transaction.status);
                      const TypeIcon = typeConfig.icon;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="grid grid-cols-12 gap-3 xs:gap-4
                            px-3 xs:px-4 sm:px-5 md:px-6 py-3 xs:py-4
                            hover:bg-white/5 transition-all group"
                        >
                          {/* Date */}
                          <div className="col-span-2 flex flex-col justify-center">
                            <span className="text-xs xs:text-sm text-white font-medium">
                              {new Date(transaction.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="text-[10px] xs:text-xs text-gray-400">
                              {new Date(transaction.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Description */}
                          <div className="col-span-3 flex items-center gap-2 min-w-0">
                            <div className={`p-1.5 xs:p-2 rounded-lg shrink-0
                              ${typeConfig.bg} border ${typeConfig.border}`}
                            >
                              <TypeIcon className={`w-3 h-3 xs:w-3.5 xs:h-3.5 ${typeConfig.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs xs:text-sm text-white font-medium truncate">
                                {transaction.description}
                              </p>
                              {transaction.userName && (
                                <p className="text-[10px] xs:text-xs text-gray-400 truncate">
                                  {transaction.userName}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Category */}
                          <div className="col-span-2 flex items-center">
                            <span className="px-2 xs:px-2.5 py-1 xs:py-1.5
                              rounded-lg
                              bg-white/5 border border-white/10
                              text-[10px] xs:text-xs text-gray-300">
                              {transaction.category}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="col-span-2 flex flex-col items-end justify-center">
                            <span className={`text-sm xs:text-base sm:text-lg font-bold
                              ${['income', 'commission'].includes(transaction.type) ? 'text-green-400' : 'text-red-400'}`}
                            >
                              {['income', 'commission'].includes(transaction.type) ? '+' : '-'}
                              {transaction.amount >= 1000000
                                ? `${(transaction.amount / 1000000).toFixed(2)}M ₽`
                                : `${(transaction.amount / 1000).toFixed(0)}K ₽`
                              }
                            </span>
                            {transaction.fee && (
                              <span className="text-[10px] xs:text-xs text-gray-400">
                                Fee: {transaction.fee}₽
                              </span>
                            )}
                          </div>

                          {/* Status */}
                          <div className="col-span-2 flex items-center">
                            <span className={`inline-flex items-center gap-1 px-2 xs:px-2.5 py-1 xs:py-1.5
                              rounded-lg border
                              ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}
                              text-[10px] xs:text-xs font-medium`}
                            >
                              <StatusIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 flex items-center justify-end">
                            <button
                              onClick={() => setSelectedTransaction(transaction)}
                              className="p-1.5 xs:p-2
                                rounded-lg
                                bg-white/5 hover:bg-white/10
                                text-gray-400 hover:text-white
                                transition-all opacity-0 group-hover:opacity-100"
                              title="Подробнее"
                            >
                              <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* USERS BALANCES TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4 xs:space-y-5 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6"
          >
            {userBalances.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-xl bg-white/5
                  rounded-lg xs:rounded-xl sm:rounded-2xl
                  border border-white/10
                  p-4 xs:p-5 sm:p-6
                  hover:border-green-500/30 transition-all group cursor-pointer"
                onClick={() => setSelectedUserBalance(user)}
              >
                {/* User Header */}
                <div className="flex items-start gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0 ring-2 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white mb-0.5 xs:mb-1 truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs xs:text-sm text-gray-400 truncate mb-1 xs:mb-2">
                      {user.email}
                    </p>
                    <span className={`inline-flex px-2 xs:px-2.5 py-0.5 xs:py-1
                      rounded-full
                      text-[10px] xs:text-xs font-medium
                      ${user.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border border-green-400/30'
                        : user.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-400/30'
                        : 'bg-red-500/10 text-red-400 border border-red-400/30'
                      }`}
                    >
                      {user.status === 'active' ? 'Активен' : user.status === 'pending' ? 'На проверке' : 'Заблокирован'}
                    </span>
                  </div>
                </div>

                {/* Balance */}
                <div className="p-3 xs:p-4 sm:p-5
                  rounded-lg xs:rounded-xl
                  bg-gradient-to-br from-green-500/10 to-emerald-500/10
                  border border-green-500/20
                  mb-3 xs:mb-4">
                  <p className="text-xs xs:text-sm text-green-400 mb-1 xs:mb-2">Текущий баланс</p>
                  <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white">
                    {(user.balance / 1000).toFixed(0)}K ₽
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 xs:gap-3 mb-3 xs:mb-4">
                  <div className="p-2 xs:p-3 rounded-lg bg-white/5">
                    <p className="text-[10px] xs:text-xs text-gray-400 mb-0.5 xs:mb-1">Потрачено</p>
                    <p className="text-sm xs:text-base sm:text-lg font-bold text-red-400">
                      {(user.totalSpent / 1000).toFixed(0)}K ₽
                    </p>
                  </div>
                  <div className="p-2 xs:p-3 rounded-lg bg-white/5">
                    <p className="text-[10px] xs:text-xs text-gray-400 mb-0.5 xs:mb-1">Заработано</p>
                    <p className="text-sm xs:text-base sm:text-lg font-bold text-green-400">
                      {(user.totalEarned / 1000).toFixed(0)}K ₽
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs xs:text-sm text-gray-400">
                  <span>{user.transactionsCount} транзакций</span>
                  <span>
                    {new Date(user.lastTransaction).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ACCOUNTING TAB */}
      {activeTab === 'accounting' && (
        <Accounting />
      )}

      {/* TRANSACTION DETAILS MODAL */}
      <AnimatePresence>
        {selectedTransaction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransaction(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed
                inset-2 xs:inset-4 sm:inset-6 md:inset-8
                lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                lg:w-[90vw] lg:max-w-2xl
                max-h-[94vh] sm:max-h-[90vh]
                z-50"
            >
              <div className="h-full
                backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
                rounded-xl sm:rounded-2xl
                border border-white/10 shadow-2xl
                flex flex-col overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between
                  p-4 xs:p-5 sm:p-6
                  border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl
                      ${getTypeConfig(selectedTransaction.type).bg}
                      border ${getTypeConfig(selectedTransaction.type).border}`}
                    >
                      {(() => {
                        const Icon = getTypeConfig(selectedTransaction.type).icon;
                        return <Icon className={`w-6 h-6 ${getTypeConfig(selectedTransaction.type).color}`} />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
                        Детали транзакции
                      </h2>
                      <p className="text-xs xs:text-sm text-gray-400">
                        ID: {selectedTransaction.id} • {selectedTransaction.orderId}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
                  {/* Amount Card */}
                  <div className={`p-4 xs:p-5 sm:p-6
                    rounded-lg xs:rounded-xl
                    bg-gradient-to-br
                    ${['income', 'commission'].includes(selectedTransaction.type)
                      ? 'from-green-500/10 to-emerald-500/10 border border-green-500/20'
                      : 'from-red-500/10 to-pink-500/10 border border-red-500/20'
                    }`}
                  >
                    <p className={`text-xs xs:text-sm mb-2
                      ${['income', 'commission'].includes(selectedTransaction.type) ? 'text-green-400' : 'text-red-400'}`}
                    >
                      Сумма транзакции
                    </p>
                    <p className={`text-3xl xs:text-4xl sm:text-5xl font-bold
                      ${['income', 'commission'].includes(selectedTransaction.type) ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {['income', 'commission'].includes(selectedTransaction.type) ? '+' : '-'}
                      {selectedTransaction.amount.toLocaleString('ru-RU')} ₽
                    </p>
                    {selectedTransaction.fee && (
                      <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-white/10 space-y-1 xs:space-y-2">
                        <div className="flex items-center justify-between text-xs xs:text-sm">
                          <span className="text-gray-400">Комиссия платформы:</span>
                          <span className="text-white font-semibold">-{selectedTransaction.fee.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <div className="flex items-center justify-between text-xs xs:text-sm">
                          <span className="text-gray-400">Чистая сумма:</span>
                          <span className="text-white font-bold">{selectedTransaction.netAmount?.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction Info */}
                  <div className="space-y-3 xs:space-y-4">
                    <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white">
                      Информация о транзакции
                    </h3>

                    <div className="space-y-2 xs:space-y-3">
                      <div className="flex items-start gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                        <FileText className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs xs:text-sm text-gray-400 mb-0.5">Описание</p>
                          <p className="text-xs xs:text-sm sm:text-base text-white font-medium">
                            {selectedTransaction.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                        <Tag className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs xs:text-sm text-gray-400 mb-0.5">Категория</p>
                          <p className="text-xs xs:text-sm sm:text-base text-white font-medium">
                            {selectedTransaction.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                        <Calendar className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs xs:text-sm text-gray-400 mb-0.5">Дата и время</p>
                          <p className="text-xs xs:text-sm sm:text-base text-white font-medium">
                            {new Date(selectedTransaction.date).toLocaleString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {selectedTransaction.userName && (
                        <div className="flex items-start gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                          {selectedTransaction.userAvatar && (
                            <img
                              src={selectedTransaction.userAvatar}
                              alt={selectedTransaction.userName}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs xs:text-sm text-gray-400 mb-0.5">Пользователь</p>
                            <p className="text-xs xs:text-sm sm:text-base text-white font-medium">
                              {selectedTransaction.userName}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                        {(() => {
                          const Icon = getStatusConfig(selectedTransaction.status).icon;
                          return <Icon className={`w-4 h-4 xs:w-5 xs:h-5 ${getStatusConfig(selectedTransaction.status).color} shrink-0 mt-0.5`} />;
                        })()}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs xs:text-sm text-gray-400 mb-0.5">Статус</p>
                          <span className={`inline-flex items-center gap-1 px-2 xs:px-2.5 py-1 xs:py-1.5
                            rounded-lg border
                            ${getStatusConfig(selectedTransaction.status).bg}
                            ${getStatusConfig(selectedTransaction.status).border}
                            ${getStatusConfig(selectedTransaction.status).color}
                            text-xs xs:text-sm font-medium`}
                          >
                            {getStatusConfig(selectedTransaction.status).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 xs:p-5 sm:p-6
                  border-t border-white/10
                  shrink-0">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="w-full
                      flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-white/10 hover:bg-white/20
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Закрыть</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* USER BALANCE DETAILS MODAL */}
      <AnimatePresence>
        {selectedUserBalance && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserBalance(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed
                inset-2 xs:inset-4 sm:inset-6 md:inset-8
                lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                lg:w-[90vw] lg:max-w-3xl
                max-h-[94vh] sm:max-h-[90vh]
                z-50"
            >
              <div className="h-full
                backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
                rounded-xl sm:rounded-2xl
                border border-white/10 shadow-2xl
                flex flex-col overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between
                  p-4 xs:p-5 sm:p-6
                  border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3 xs:gap-4">
                    <img
                      src={selectedUserBalance.avatar}
                      alt={selectedUserBalance.name}
                      className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
                        {selectedUserBalance.name}
                      </h2>
                      <p className="text-xs xs:text-sm text-gray-400">
                        {selectedUserBalance.email}
                      </p>
                      <span className={`inline-flex mt-1 px-2 xs:px-2.5 py-0.5 xs:py-1
                        rounded-full
                        text-[10px] xs:text-xs font-medium
                        ${selectedUserBalance.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border border-green-400/30'
                          : selectedUserBalance.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-400/30'
                          : 'bg-red-500/10 text-red-400 border border-red-400/30'
                        }`}
                      >
                        {selectedUserBalance.status === 'active' ? 'Активен' : selectedUserBalance.status === 'pending' ? 'На проверке' : 'Заблокирован'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUserBalance(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
                  {/* Balance Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4">
                    <div className="p-4 xs:p-5
                      rounded-lg xs:rounded-xl
                      bg-gradient-to-br from-green-500/10 to-emerald-500/10
                      border border-green-500/20">
                      <Wallet className="w-5 h-5 xs:w-6 xs:h-6 text-green-400 mb-2 xs:mb-3" />
                      <p className="text-xs xs:text-sm text-green-400 mb-1">Текущий баланс</p>
                      <p className="text-2xl xs:text-3xl font-bold text-white">
                        {(selectedUserBalance.balance / 1000).toFixed(0)}K ₽
                      </p>
                    </div>

                    <div className="p-4 xs:p-5
                      rounded-lg xs:rounded-xl
                      bg-gradient-to-br from-red-500/10 to-pink-500/10
                      border border-red-500/20">
                      <TrendingDown className="w-5 h-5 xs:w-6 xs:h-6 text-red-400 mb-2 xs:mb-3" />
                      <p className="text-xs xs:text-sm text-red-400 mb-1">Потрачено</p>
                      <p className="text-2xl xs:text-3xl font-bold text-white">
                        {(selectedUserBalance.totalSpent / 1000).toFixed(0)}K ₽
                      </p>
                    </div>

                    <div className="p-4 xs:p-5
                      rounded-lg xs:rounded-xl
                      bg-gradient-to-br from-blue-500/10 to-cyan-500/10
                      border border-blue-500/20">
                      <TrendingUp className="w-5 h-5 xs:w-6 xs:h-6 text-blue-400 mb-2 xs:mb-3" />
                      <p className="text-xs xs:text-sm text-blue-400 mb-1">Заработано</p>
                      <p className="text-2xl xs:text-3xl font-bold text-white">
                        {(selectedUserBalance.totalEarned / 1000).toFixed(0)}K ₽
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 xs:space-y-4">
                    <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white">
                      Статистика
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                      <div className="p-3 xs:p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400" />
                          <p className="text-xs xs:text-sm text-gray-400">Всего транзакций</p>
                        </div>
                        <p className="text-xl xs:text-2xl font-bold text-white">
                          {selectedUserBalance.transactionsCount}
                        </p>
                      </div>

                      <div className="p-3 xs:p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400" />
                          <p className="text-xs xs:text-sm text-gray-400">Последняя транзакция</p>
                        </div>
                        <p className="text-sm xs:text-base font-semibold text-white">
                          {new Date(selectedUserBalance.lastTransaction).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Transactions */}
                  <div className="space-y-3 xs:space-y-4">
                    <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white">
                      Последние транзакции пользователя
                    </h3>

                    <div className="space-y-2 xs:space-y-3">
                      {transactions
                        .filter(t => t.userId === selectedUserBalance.id)
                        .slice(0, 5)
                        .map((transaction) => {
                          const typeConfig = getTypeConfig(transaction.type);
                          const TypeIcon = typeConfig.icon;
                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 xs:p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`p-2 rounded-lg shrink-0
                                  ${typeConfig.bg} border ${typeConfig.border}`}
                                >
                                  <TypeIcon className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${typeConfig.color}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs xs:text-sm text-white font-medium truncate">
                                    {transaction.description}
                                  </p>
                                  <p className="text-[10px] xs:text-xs text-gray-400">
                                    {new Date(transaction.date).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-sm xs:text-base font-bold shrink-0
                                ${['income', 'commission'].includes(transaction.type) ? 'text-green-400' : 'text-red-400'}`}
                              >
                                {['income', 'commission'].includes(transaction.type) ? '+' : '-'}
                                {(transaction.amount / 1000).toFixed(0)}K ₽
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 xs:p-5 sm:p-6
                  border-t border-white/10
                  shrink-0">
                  <button
                    onClick={() => setSelectedUserBalance(null)}
                    className="w-full
                      flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-white/10 hover:bg-white/20
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Закрыть</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
