/**
 * USERS MANAGEMENT - Управление пользователями
 * Максимальный функционал: фильтры, сортировка, детальный просмотр, статистика, экспорт
 * Adaptive: 320px → 4K
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, Crown, Ban, CheckCircle, Mail, Phone, MapPin, Calendar,
  TrendingUp, Music, Video, DollarSign, Filter, Download, Eye, Edit,
  MoreVertical, X, ArrowUpDown, ArrowUp, ArrowDown, UserPlus, AlertTriangle,
  BarChart3, Activity, Clock, RefreshCw, FileText, MessageSquare, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminChat } from '@/admin/components/AdminChat';
import { countries, citiesByCountry, validateEmail, validatePhone, formatPhone } from '@/utils/validation';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  subscription: 'free' | 'basic' | 'pro' | 'premium';
  registeredDate: string;
  lastActive: string;
  status: 'active' | 'blocked' | 'pending';
  tracksCount: number;
  videosCount: number;
  totalSpent: number;
  balance: number;
  country?: string;
  city?: string;
  completedOrders: number;
  pendingOrders: number;
  rating?: number;
  totalOrders: number;
}

type SortField = 'name' | 'registeredDate' | 'lastActive' | 'tracksCount' | 'totalSpent' | 'balance';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'blocked' | 'pending';
type FilterSubscription = 'all' | 'free' | 'basic' | 'pro' | 'premium';

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('registeredDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterSubscription, setFilterSubscription] = useState<FilterSubscription>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | undefined>();
  const [chatUserName, setChatUserName] = useState<string | undefined>();
  const [chatUserAvatar, setChatUserAvatar] = useState<string | undefined>();

  // Form state for new user
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    subscription: 'pro' as 'free' | 'basic' | 'pro' | 'premium',
    country: 'Россия',
    city: '',
    balance: 0,
    status: 'active' as 'active' | 'blocked' | 'pending',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Initialize cities for Russia on mount
  useEffect(() => {
    setAvailableCities(citiesByCountry['Россия'] || []);
  }, []);

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Александр Иванов',
      email: 'alexandr@example.com',
      phone: '+7 (999) 123-45-67',
      avatar: 'https://i.pravatar.cc/150?img=12',
      subscription: 'premium',
      registeredDate: '2024-06-15',
      lastActive: '2026-02-01',
      status: 'active',
      tracksCount: 45,
      videosCount: 12,
      totalSpent: 125000,
      balance: 15000,
      country: 'Россия',
      city: 'Москва',
      completedOrders: 34,
      pendingOrders: 2,
      rating: 4.8,
      totalOrders: 36,
    },
    {
      id: 2,
      name: 'Мария Петрова',
      email: 'maria@example.com',
      phone: '+7 (999) 234-56-78',
      avatar: 'https://i.pravatar.cc/150?img=5',
      subscription: 'pro',
      registeredDate: '2024-08-20',
      lastActive: '2026-01-31',
      status: 'active',
      tracksCount: 23,
      videosCount: 5,
      totalSpent: 65000,
      balance: 8000,
      country: 'Россия',
      city: 'Санкт-Петербург',
      completedOrders: 18,
      pendingOrders: 1,
      rating: 4.5,
      totalOrders: 19,
    },
    {
      id: 3,
      name: 'Дмитрий Соколов',
      email: 'dmitry@example.com',
      phone: '+7 (999) 345-67-89',
      avatar: 'https://i.pravatar.cc/150?img=8',
      subscription: 'basic',
      registeredDate: '2025-01-10',
      lastActive: '2026-01-30',
      status: 'active',
      tracksCount: 8,
      videosCount: 2,
      totalSpent: 12000,
      balance: 2000,
      country: 'Россия',
      city: 'Казань',
      completedOrders: 5,
      pendingOrders: 0,
      rating: 4.2,
      totalOrders: 5,
    },
    {
      id: 4,
      name: 'Елена Смирнова',
      email: 'elena@example.com',
      phone: '+7 (999) 456-78-90',
      avatar: 'https://i.pravatar.cc/150?img=9',
      subscription: 'free',
      registeredDate: '2025-11-05',
      lastActive: '2026-01-28',
      status: 'active',
      tracksCount: 3,
      videosCount: 1,
      totalSpent: 0,
      balance: 500,
      country: 'Россия',
      city: 'Екатеринбург',
      completedOrders: 0,
      pendingOrders: 1,
      rating: 0,
      totalOrders: 1,
    },
    {
      id: 5,
      name: 'Игорь Кузнецов',
      email: 'igor@example.com',
      avatar: 'https://i.pravatar.cc/150?img=14',
      subscription: 'pro',
      registeredDate: '2024-03-12',
      lastActive: '2025-12-15',
      status: 'blocked',
      tracksCount: 67,
      videosCount: 23,
      totalSpent: 98000,
      balance: 0,
      country: 'Украина',
      city: 'Киев',
      completedOrders: 42,
      pendingOrders: 0,
      rating: 3.8,
      totalOrders: 42,
    },
    {
      id: 6,
      name: 'Ольга Новикова',
      email: 'olga@example.com',
      phone: '+7 (999) 567-89-01',
      avatar: 'https://i.pravatar.cc/150?img=20',
      subscription: 'basic',
      registeredDate: '2025-09-22',
      lastActive: '2026-01-29',
      status: 'pending',
      tracksCount: 1,
      videosCount: 0,
      totalSpent: 5000,
      balance: 5000,
      country: 'Беларусь',
      city: 'Минск',
      completedOrders: 0,
      pendingOrders: 1,
      rating: 0,
      totalOrders: 1,
    },
  ]);

  // Handlers
  const handleBlock = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' as const }
        : u
    ));
    toast.success(user.status === 'active' ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
  };

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
      ['ID', 'Имя', 'Email', 'Подписка', 'Статус', 'Дата регистрации', 'Треки', 'Видео', 'Потрачено', 'Баланс'].join(','),
      ...filteredAndSortedUsers.map(u => 
        [u.id, u.name, u.email, u.subscription, u.status, u.registeredDate, u.tracksCount, u.videosCount, u.totalSpent, u.balance].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Данные экспортированы');
  };

  const validateCreateUserForm = () => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!newUserForm.name.trim()) {
      errors.name = 'Имя обязательно для заполнения';
    } else if (newUserForm.name.trim().length < 2) {
      errors.name = 'Имя должно содержать минимум 2 символа';
    }

    // Email validation
    if (!newUserForm.email.trim()) {
      errors.email = 'Email обязателен для заполнения';
    } else {
      const emailError = validateEmail(newUserForm.email);
      if (emailError) {
        errors.email = emailError;
      } else if (users.some(u => u.email.toLowerCase() === newUserForm.email.toLowerCase())) {
        errors.email = 'Пользователь с таким email уже существует';
      }
    }

    // Password validation
    if (!newUserForm.password) {
      errors.password = 'Пароль обязателен для заполнения';
    } else if (newUserForm.password.length < 8) {
      errors.password = 'Пароль должен содержать минимум 8 символов';
    }

    // Phone validation
    if (newUserForm.phone) {
      const phoneError = validatePhone(newUserForm.phone);
      if (phoneError) errors.phone = phoneError;
    }

    // Balance validation
    if (newUserForm.balance < 0) {
      errors.balance = 'Баланс не может быть отрицательным';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Format phone as user types
  const handlePhoneChange = (value: string) => {
    setNewUserForm({...newUserForm, phone: formatPhone(value)});
  };

  // Handle country change
  const handleCountryChange = (country: string) => {
    setNewUserForm({...newUserForm, country, city: ''});
    setAvailableCities(citiesByCountry[country] || []);
  };

  const handleCreateUser = () => {
    if (!validateCreateUserForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    const newUser: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      phone: newUserForm.phone.trim() || undefined,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      subscription: newUserForm.subscription,
      registeredDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      status: newUserForm.status,
      tracksCount: 0,
      videosCount: 0,
      totalSpent: 0,
      balance: newUserForm.balance,
      country: newUserForm.country.trim() || undefined,
      city: newUserForm.city.trim() || undefined,
      completedOrders: 0,
      pendingOrders: 0,
      rating: 0,
      totalOrders: 0,
    };

    setUsers([newUser, ...users]);
    
    // Reset form
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      subscription: 'pro',
      country: 'Россия',
      city: '',
      balance: 0,
      status: 'active',
      password: '',
    });
    setFormErrors({});
    setAvailableCities(citiesByCountry['Россия'] || []);
    setShowCreateUserModal(false);
    
    toast.success(`Пользователь ${newUser.name} успешно создан!`);
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Filtering and Sorting
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));
      
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription;

      return matchesSearch && matchesStatus && matchesSubscription;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    pending: users.filter(u => u.status === 'pending').length,
    withSubscription: users.filter(u => u.subscription !== 'free').length,
    totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    avgTracksPerUser: Math.round(users.reduce((sum, u) => sum + u.tracksCount, 0) / users.length),
  };

  const subscriptionColors = {
    free: { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/30' },
    basic: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30' },
    pro: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-400/30' },
    premium: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30' },
  };

  const statusColors = {
    active: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30' },
    blocked: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30' },
    pending: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-400/30' },
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 opacity-40" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> 
      : <ArrowDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-cyan-400" />;
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            Управление пользователями
          </h1>
          <p className="text-xs xs:text-sm sm:text-base text-gray-400">
            Просмотр и управление артистами платформы
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 sm:gap-2 
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
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 
              px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
              rounded-lg xs:rounded-xl
              bg-white/10 hover:bg-white/20
              text-white font-medium
              text-xs xs:text-sm sm:text-base
              transition-all active:scale-95
              border border-white/10"
          >
            <UserPlus className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2 xs:gap-3 sm:gap-4">
        {[
          { label: 'Всего', value: stats.total, icon: Users, color: 'from-blue-500 to-cyan-500', action: 'all' },
          { label: 'Активных', value: stats.active, icon: CheckCircle, color: 'from-green-500 to-emerald-500', action: 'active' },
          { label: 'Заблокировано', value: stats.blocked, icon: Ban, color: 'from-red-500 to-rose-500', action: 'blocked' },
          { label: 'На модерации', value: stats.pending, icon: Clock, color: 'from-orange-500 to-amber-500', action: 'pending' },
          { label: 'С подпиской', value: stats.withSubscription, icon: Crown, color: 'from-purple-500 to-pink-500', action: 'subscription' },
          { label: 'Общая выручка', value: `${(stats.totalRevenue / 1000).toFixed(0)}K₽`, icon: DollarSign, color: 'from-yellow-500 to-orange-500', action: 'revenue' },
          { label: 'Общий баланс', value: `${(stats.totalBalance / 1000).toFixed(0)}K₽`, icon: TrendingUp, color: 'from-cyan-500 to-blue-500', action: 'balance' },
          { label: 'Треков на юзера', value: stats.avgTracksPerUser, icon: Music, color: 'from-pink-500 to-purple-500', action: 'tracks' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (stat.action === 'all') {
                  setFilterStatus('all');
                  setFilterSubscription('all');
                  toast.info('Показаны все пользователи');
                } else if (stat.action === 'active' || stat.action === 'blocked' || stat.action === 'pending') {
                  setFilterStatus(stat.action as FilterStatus);
                  toast.info(`Фильтр: ${stat.label}`);
                } else if (stat.action === 'revenue') {
                  handleSort('totalSpent');
                  toast.info('Сортировка по общей выручке');
                } else if (stat.action === 'balance') {
                  handleSort('balance');
                  toast.info('Сортировка по балансу');
                } else if (stat.action === 'tracks') {
                  handleSort('tracksCount');
                  toast.info('Сортировка по количеству треков');
                }
              }}
              className={`p-2.5 xs:p-3 sm:p-4 md:p-5
                rounded-lg xs:rounded-xl
                backdrop-blur-md bg-gradient-to-br ${stat.color} bg-opacity-10
                border border-white/10
                hover:bg-opacity-20 hover:scale-105 transition-all cursor-pointer
                active:scale-95`}
            >
              <Icon className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white mb-1 xs:mb-1.5 sm:mb-2" />
              <div className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5">
                {stat.value}
              </div>
              <div className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-400 truncate">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="space-y-3 xs:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 xs:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 
              w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени, email, телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full 
                pl-10 xs:pl-12 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3
                rounded-lg xs:rounded-xl
                backdrop-blur-md bg-white/5 
                border border-white/10
                text-white placeholder-gray-400
                text-xs xs:text-sm sm:text-base
                focus:outline-none focus:border-blue-400/50 transition-colors"
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
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400' 
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Статус
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
                      {(['all', 'active', 'blocked', 'pending'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-2 xs:px-3 py-1.5 xs:py-2 sm:py-2.5
                            rounded-lg
                            text-[10px] xs:text-xs sm:text-sm font-medium
                            transition-all
                            ${filterStatus === status
                              ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {status === 'all' ? 'Все' : status === 'active' ? 'Активные' : status === 'blocked' ? 'Заблокированные' : 'На модерации'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subscription Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Подписка
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 xs:gap-2">
                      {(['all', 'free', 'basic', 'pro', 'premium'] as const).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setFilterSubscription(sub)}
                          className={`px-2 xs:px-3 py-1.5 xs:py-2 sm:py-2.5
                            rounded-lg
                            text-[10px] xs:text-xs sm:text-sm font-medium
                            transition-all capitalize
                            ${filterSubscription === sub
                              ? 'bg-purple-500/20 border border-purple-400/50 text-purple-400'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {sub === 'all' ? 'Все' : sub}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterSubscription('all');
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

      {/* USERS TABLE */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 
        rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden">
        
        {/* Table Header - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-3 xl:gap-4 
          p-3 sm:p-4 md:p-5
          border-b border-white/10 
          bg-white/5">
          <button onClick={() => handleSort('name')} className="col-span-3 flex items-center gap-2 text-left text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Пользователь
            <SortIcon field="name" />
          </button>
          <div className="col-span-2 text-xs sm:text-sm font-semibold text-gray-400">Контакты</div>
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-gray-400 text-center">Подписка</div>
          <button onClick={() => handleSort('tracksCount')} className="col-span-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Контент
            <SortIcon field="tracksCount" />
          </button>
          <button onClick={() => handleSort('totalSpent')} className="col-span-2 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Финансы
            <SortIcon field="totalSpent" />
          </button>
          <button onClick={() => handleSort('lastActive')} className="col-span-2 flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Активность
            <SortIcon field="lastActive" />
          </button>
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-gray-400 text-center">Действия</div>
        </div>

        {/* Users List */}
        <div className="divide-y divide-white/10">
          {filteredAndSortedUsers.length === 0 ? (
            <div className="p-8 sm:p-12 md:p-16 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2">
                Пользователи не найдены
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                Попробуйте изменить параметры поиска или фильтры
              </p>
            </div>
          ) : (
            filteredAndSortedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-white/5 transition-all"
              >
                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-3 xl:gap-4 
                  p-3 sm:p-4 md:p-5 items-center">
                  
                  {/* User Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 xl:w-12 xl:h-12 rounded-full ring-2 ring-white/20 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm xl:text-base text-white font-semibold truncate">
                          {user.name}
                        </h3>
                        {user.subscription === 'premium' && (
                          <Crown className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-yellow-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">ID: {user.id}</p>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs xl:text-sm text-gray-400 truncate">
                      <Mail className="w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-xs xl:text-sm text-gray-400">
                        <Phone className="w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Subscription */}
                  <div className="col-span-1 flex justify-center">
                    <span className={`px-2 xl:px-3 py-1 xl:py-1.5
                      rounded-lg
                      ${subscriptionColors[user.subscription].bg}
                      ${subscriptionColors[user.subscription].border}
                      border
                      ${subscriptionColors[user.subscription].text}
                      text-[10px] xl:text-xs font-semibold uppercase tracking-wider`}
                    >
                      {user.subscription}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="col-span-1 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs xl:text-sm text-white">
                      <Music className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-purple-400" />
                      {user.tracksCount}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs xl:text-sm text-white">
                      <Video className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-pink-400" />
                      {user.videosCount}
                    </div>
                  </div>

                  {/* Finances */}
                  <div className="col-span-2 text-center space-y-1">
                    <div className="text-xs xl:text-sm text-white">
                      <span className="text-gray-400">Потрачено:</span> {(user.totalSpent / 1000).toFixed(1)}K₽
                    </div>
                    <div className="text-xs xl:text-sm text-cyan-400">
                      <span className="text-gray-400">Баланс:</span> {(user.balance / 1000).toFixed(1)}K₽
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full
                        ${statusColors[user.status].bg}
                        ${statusColors[user.status].border}
                        border
                        ${statusColors[user.status].text}
                        text-[10px] xl:text-xs font-semibold`}
                      >
                        {user.status === 'active' ? 'Активен' : user.status === 'blocked' ? 'Заблокирован' : 'Модерация'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.lastActive).toLocaleDateString('ru-RU')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="p-1.5 xl:p-2
                        rounded-lg
                        bg-white/5 hover:bg-cyan-500/20
                        border border-white/10 hover:border-cyan-400/50
                        text-gray-400 hover:text-cyan-400
                        transition-all"
                      title="Просмотр"
                    >
                      <Eye className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                    </button>
                    <button
                      onClick={() => handleBlock(user.id)}
                      className={`p-1.5 xl:p-2
                        rounded-lg
                        border transition-all
                        ${user.status === 'active'
                          ? 'bg-red-500/10 hover:bg-red-500/20 border-red-400/30 hover:border-red-400/50 text-red-400'
                          : 'bg-green-500/10 hover:bg-green-500/20 border-green-400/30 hover:border-green-400/50 text-green-400'
                        }`}
                      title={user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                    >
                      {user.status === 'active' ? (
                        <Ban className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden p-3 xs:p-4 sm:p-5 space-y-3">
                  {/* User Header */}
                  <div className="flex items-start gap-3">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-white/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm xs:text-base sm:text-lg text-white font-semibold truncate">
                          {user.name}
                        </h3>
                        {user.subscription === 'premium' && (
                          <Crown className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-yellow-400 shrink-0" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] xs:text-xs sm:text-sm text-gray-400 truncate">
                          <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-[10px] xs:text-xs sm:text-sm text-gray-400">
                            <Phone className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="p-2 xs:p-2.5
                        rounded-lg
                        bg-white/5 hover:bg-cyan-500/20
                        border border-white/10 hover:border-cyan-400/50
                        text-gray-400 hover:text-cyan-400
                        transition-all shrink-0"
                    >
                      <Eye className="w-4 h-4 xs:w-5 xs:h-5" />
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 xs:gap-3">
                    <div className="p-2 xs:p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Music className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-purple-400" />
                        <span className="text-[10px] xs:text-xs text-gray-400">Треков</span>
                      </div>
                      <div className="text-sm xs:text-base sm:text-lg font-bold text-white">
                        {user.tracksCount}
                      </div>
                    </div>
                    <div className="p-2 xs:p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Video className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-pink-400" />
                        <span className="text-[10px] xs:text-xs text-gray-400">Видео</span>
                      </div>
                      <div className="text-sm xs:text-base sm:text-lg font-bold text-white">
                        {user.videosCount}
                      </div>
                    </div>
                    <div className="p-2 xs:p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-green-400" />
                        <span className="text-[10px] xs:text-xs text-gray-400">Потрачено</span>
                      </div>
                      <div className="text-sm xs:text-base sm:text-lg font-bold text-white">
                        {(user.totalSpent / 1000).toFixed(1)}K₽
                      </div>
                    </div>
                    <div className="p-2 xs:p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-cyan-400" />
                        <span className="text-[10px] xs:text-xs text-gray-400">Баланс</span>
                      </div>
                      <div className="text-sm xs:text-base sm:text-lg font-bold text-cyan-400">
                        {(user.balance / 1000).toFixed(1)}K₽
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 xs:px-2.5 py-1 xs:py-1.5
                        rounded-lg
                        ${subscriptionColors[user.subscription].bg}
                        ${subscriptionColors[user.subscription].border}
                        border
                        ${subscriptionColors[user.subscription].text}
                        text-[10px] xs:text-xs font-semibold uppercase`}
                      >
                        {user.subscription}
                      </span>
                      <span className={`px-2 xs:px-2.5 py-1 xs:py-1.5
                        rounded-lg
                        ${statusColors[user.status].bg}
                        ${statusColors[user.status].border}
                        border
                        ${statusColors[user.status].text}
                        text-[10px] xs:text-xs font-semibold`}
                      >
                        {user.status === 'active' ? 'Активен' : user.status === 'blocked' ? 'Заблокирован' : 'Модерация'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBlock(user.id)}
                      className={`px-3 xs:px-4 py-1.5 xs:py-2
                        rounded-lg
                        text-[10px] xs:text-xs sm:text-sm font-medium
                        border transition-all
                        ${user.status === 'active'
                          ? 'bg-red-500/10 hover:bg-red-500/20 border-red-400/30 text-red-400'
                          : 'bg-green-500/10 hover:bg-green-500/20 border-green-400/30 text-green-400'
                        }`}
                    >
                      {user.status === 'active' ? 'Блок' : 'Разблок'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed 
                inset-2 xs:inset-4 sm:inset-6 md:inset-8
                lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                lg:w-[90vw] lg:max-w-4xl
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
                  p-4 xs:p-5 sm:p-6 md:p-7
                  border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3 xs:gap-4 flex-1 min-w-0">
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name}
                      className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-white/20 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                        {selectedUser.name}
                      </h2>
                      <p className="text-xs xs:text-sm sm:text-base text-gray-400 truncate">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto 
                  p-4 xs:p-5 sm:p-6 md:p-8
                  space-y-4 xs:space-y-5 sm:space-y-6">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4">
                    {[
                      { label: 'Треков', value: selectedUser.tracksCount, icon: Music, color: 'from-purple-500 to-pink-500' },
                      { label: 'Видео', value: selectedUser.videosCount, icon: Video, color: 'from-pink-500 to-rose-500' },
                      { label: 'Заказов', value: selectedUser.totalOrders, icon: FileText, color: 'from-blue-500 to-cyan-500' },
                      { label: 'Завершено', value: selectedUser.completedOrders, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
                      { label: 'В работе', value: selectedUser.pendingOrders, icon: Clock, color: 'from-orange-500 to-amber-500' },
                      { label: 'Потрачено', value: `${(selectedUser.totalSpent / 1000).toFixed(0)}K₽`, icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
                      { label: 'Баланс', value: `${(selectedUser.balance / 1000).toFixed(0)}K₽`, icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
                      { label: 'Рейтинг', value: selectedUser.rating ? selectedUser.rating.toFixed(1) : 'N/A', icon: BarChart3, color: 'from-indigo-500 to-purple-500' },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className={`p-3 xs:p-4 sm:p-5
                          rounded-lg xs:rounded-xl
                          bg-gradient-to-br ${stat.color} bg-opacity-10
                          border border-white/10`}
                        >
                          <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white mb-1.5 xs:mb-2" />
                          <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 xs:mb-1">
                            {stat.value}
                          </div>
                          <div className="text-[10px] xs:text-xs sm:text-sm text-gray-400">
                            {stat.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                    {/* Contact Info */}
                    <div className="p-4 xs:p-5 sm:p-6 
                      rounded-lg xs:rounded-xl
                      bg-white/5 border border-white/10">
                      <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-3 xs:mb-4">
                        Контактная информация
                      </h3>
                      <div className="space-y-2 xs:space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                          <span className="text-xs xs:text-sm sm:text-base text-gray-300 truncate">
                            {selectedUser.email}
                          </span>
                        </div>
                        {selectedUser.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                            <span className="text-xs xs:text-sm sm:text-base text-gray-300">
                              {selectedUser.phone}
                            </span>
                          </div>
                        )}
                        {selectedUser.city && (
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                            <span className="text-xs xs:text-sm sm:text-base text-gray-300">
                              {selectedUser.city}, {selectedUser.country}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="p-4 xs:p-5 sm:p-6 
                      rounded-lg xs:rounded-xl
                      bg-white/5 border border-white/10">
                      <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-3 xs:mb-4">
                        Информация об аккаунте
                      </h3>
                      <div className="space-y-2 xs:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs xs:text-sm text-gray-400">Подписка:</span>
                          <span className={`px-2 xs:px-3 py-1 xs:py-1.5
                            rounded-lg
                            ${subscriptionColors[selectedUser.subscription].bg}
                            ${subscriptionColors[selectedUser.subscription].border}
                            border
                            ${subscriptionColors[selectedUser.subscription].text}
                            text-[10px] xs:text-xs font-semibold uppercase`}
                          >
                            {selectedUser.subscription}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs xs:text-sm text-gray-400">Статус:</span>
                          <span className={`px-2 xs:px-3 py-1 xs:py-1.5
                            rounded-lg
                            ${statusColors[selectedUser.status].bg}
                            ${statusColors[selectedUser.status].border}
                            border
                            ${statusColors[selectedUser.status].text}
                            text-[10px] xs:text-xs font-semibold`}
                          >
                            {selectedUser.status === 'active' ? 'Активен' : selectedUser.status === 'blocked' ? 'Заблокирован' : 'Модерация'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                          <div className="flex-1">
                            <div className="text-[10px] xs:text-xs text-gray-400">Регистрация:</div>
                            <div className="text-xs xs:text-sm text-white">
                              {new Date(selectedUser.registeredDate).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                          <div className="flex-1">
                            <div className="text-[10px] xs:text-xs text-gray-400">Последняя активность:</div>
                            <div className="text-xs xs:text-sm text-white">
                              {new Date(selectedUser.lastActive).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 xs:p-5 sm:p-6 
                  border-t border-white/10 
                  grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 
                  shrink-0">
                  <button
                    onClick={() => {
                      toast.info('Переход на публичную страницу артиста');
                      // В будущем здесь будет редирект на страницу артиста
                    }}
                    className="flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-gradient-to-r from-purple-500 to-pink-500
                      hover:from-purple-600 hover:to-pink-600
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Профиль</span>
                  </button>
                  <button
                    onClick={() => {
                      setChatUserId(selectedUser.id.toString());
                      setChatUserName(selectedUser.name);
                      setChatUserAvatar(selectedUser.avatar);
                      setShowUserModal(false);
                      toast.success('Открываем чат с пользователем');
                    }}
                    className="flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-gradient-to-r from-blue-500 to-cyan-500
                      hover:from-blue-600 hover:to-cyan-600
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Написать</span>
                  </button>
                  <button
                    onClick={() => handleBlock(selectedUser.id)}
                    className={`flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      text-xs xs:text-sm sm:text-base font-medium
                      border transition-all active:scale-95
                      ${selectedUser.status === 'active'
                        ? 'bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-400'
                        : 'bg-green-500/20 hover:bg-green-500/30 border-green-400/30 text-green-400'
                      }`}
                  >
                    {selectedUser.status === 'active' ? (
                      <>
                        <Ban className="w-4 h-4 xs:w-5 xs:h-5" />
                        <span>Блок</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5" />
                        <span>Разблок</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="flex items-center justify-center gap-2
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

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {showCreateUserModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateUserModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-2 xs:inset-4 sm:inset-6 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[90vw] lg:max-w-3xl max-h-[94vh] sm:max-h-[90vh] z-50">
              <div className="h-full backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 border-b border-white/10 shrink-0">
                  <div>
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-1">Создать пользователя</h2>
                    <p className="text-xs xs:text-sm text-gray-400">Добавление нового артиста в систему</p>
                  </div>
                  <button onClick={() => setShowCreateUserModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Полное имя *</label>
                      <input 
                        type="text" 
                        placeholder="Александр Иванов" 
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${formErrors.name ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/50'}`}
                      />
                      {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Email *</label>
                      <input 
                        type="email" 
                        placeholder="artist@example.com" 
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${formErrors.email ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/50'}`}
                      />
                      {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Телефон</label>
                      <input 
                        type="tel" 
                        placeholder="+7 (999) 123-45-67" 
                        value={newUserForm.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${formErrors.phone ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/50'}`}
                      />
                      {formErrors.phone && <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Подписка *</label>
                      <select 
                        value={newUserForm.subscription}
                        onChange={(e) => setNewUserForm({...newUserForm, subscription: e.target.value as any})}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                      >
                        <option value="free">Free (Бесплатная)</option>
                        <option value="basic">Basic (Базовая)</option>
                        <option value="pro">Pro (Профессиональная)</option>
                        <option value="premium">Premium (Премиум)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Страна *</label>
                      <select 
                        value={newUserForm.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                      >
                        <option value="">Выберите страну</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Город {newUserForm.country && '*'}</label>
                      <select 
                        value={newUserForm.city}
                        onChange={(e) => setNewUserForm({...newUserForm, city: e.target.value})}
                        disabled={!newUserForm.country}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{newUserForm.country ? 'Выберите город' : 'Сначала выберите страну'}</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Начальный баланс (₽)</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={newUserForm.balance}
                        onChange={(e) => setNewUserForm({...newUserForm, balance: Number(e.target.value)})}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${formErrors.balance ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/50'}`}
                      />
                      {formErrors.balance && <p className="text-xs text-red-400 mt-1">{formErrors.balance}</p>}
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Статус *</label>
                      <select 
                        value={newUserForm.status}
                        onChange={(e) => setNewUserForm({...newUserForm, status: e.target.value as any})}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                      >
                        <option value="active">Активный</option>
                        <option value="pending">На модерации</option>
                        <option value="blocked">Заблокирован</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Пароль *</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${formErrors.password ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/50'}`}
                    />
                    {formErrors.password && <p className="text-xs text-red-400 mt-1">{formErrors.password}</p>}
                    {!formErrors.password && <p className="text-xs text-gray-500 mt-1">Минимум 8 символов</p>}
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
                    <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs xs:text-sm text-cyan-400 font-medium mb-1">Автоматическая отправка данных</p>
                      <p className="text-xs text-gray-400">После создания аккаунта пользователь получит email с данными для входа</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 xs:p-5 sm:p-6 border-t border-white/10 shrink-0 flex flex-col sm:flex-row gap-2 xs:gap-3">
                  <button onClick={handleCreateUser} className="flex-1 flex items-center justify-center gap-2 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium text-xs xs:text-sm sm:text-base transition-all active:scale-95">
                    <UserPlus className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Создать пользователя</span>
                  </button>
                  <button onClick={() => { 
                    setShowCreateUserModal(false); 
                    setFormErrors({});
                    setNewUserForm({
                      name: '',
                      email: '',
                      phone: '',
                      subscription: 'pro',
                      country: 'Россия',
                      city: '',
                      balance: 0,
                      status: 'active',
                      password: '',
                    });
                    setAvailableCities(citiesByCountry['Россия'] || []);
                  }} className="flex-1 flex items-center justify-center gap-2 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs xs:text-sm sm:text-base transition-all active:scale-95">
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Отмена</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ADMIN CHAT */}
      <AdminChat
        initialUserId={chatUserId}
        initialUserName={chatUserName}
        initialUserAvatar={chatUserAvatar}
      />
    </div>
  );
}