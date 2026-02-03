import { Heart, DollarSign, TrendingUp, Users, Gift, Calendar, MessageCircle, Filter, Search, Download, Share2, Star, Crown, Sparkles, Coins, ArrowRight, Plus, Link, Settings, ChevronDown, MessageSquare, Eye, Wallet, Check, X, Info, CreditCard, Bell, BellOff, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useSubscription, subscriptionHelpers } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

type DonationPeriod = 'all' | 'today' | 'week' | 'month' | 'year';
type WithdrawalStatus = 'pending' | 'completed' | 'cancelled';

interface Donation {
  id: number;
  name: string;
  message: string;
  amount: number;
  currency: string;
  date: string;
  time: string;
  avatar: string;
  isAnonymous: boolean;
  isPublic: boolean;
  userId?: string; // ID пользователя для мессенджера
  replied?: boolean; // Ответили ли на сообщение
}

interface Withdrawal {
  id: number;
  amount: number;
  currency: string;
  date: string;
  status: WithdrawalStatus;
  method: string;
  fee: number;
}

interface DonationsPageProps {
  userCoins?: number;
  onCoinsUpdate?: (coins: number) => void;
  onReplyToDonator?: (userId: string, userName: string, userAvatar?: string) => void;
}

export function DonationsPage({ 
  userCoins = 0, 
  onCoinsUpdate = () => {}, 
  onReplyToDonator 
}: DonationsPageProps) {
  // DEBUG: Log props on mount
  console.log('🎯 DonationsPage получил пропсы:', { userCoins, hasOnCoinsUpdate: !!onCoinsUpdate, hasOnReplyToDonator: !!onReplyToDonator });

  // Get subscription from context
  const { subscription } = useSubscription();
  const platformFee = subscriptionHelpers.getDonationFee(subscription);
  
  const [donations, setDonations] = useState<Donation[]>([
    {
      id: 1,
      userId: 'user_1',
      name: 'Иван Петров',
      message: 'Отличная музыка! Продолжайте творить! 🎵',
      amount: 500,
      currency: '₽',
      date: '2026-01-24',
      time: '14:30',
      avatar: '1',
      isAnonymous: false,
      isPublic: true,
      replied: false,
    },
    {
      id: 2,
      userId: 'user_anon_1',
      name: 'Анонимный донатер',
      message: 'Спасибо за ваше творчество!',
      amount: 1000,
      currency: '₽',
      date: '2026-01-24',
      time: '12:15',
      avatar: '?',
      isAnonymous: true,
      isPublic: true,
      replied: false,
    },
    {
      id: 3,
      userId: 'user_3',
      name: 'Мария Сидорова',
      message: 'Ждём новых треков! Вы лучшие! ❤️',
      amount: 750,
      currency: '₽',
      date: '2026-01-23',
      time: '18:45',
      avatar: '2',
      isAnonymous: false,
      isPublic: true,
      replied: false,
    },
    {
      id: 4,
      userId: 'user_4',
      name: 'Дмитрий Козлов',
      message: 'За новый альбом! Спасибо за эмоции',
      amount: 250,
      currency: '₽',
      date: '2026-01-23',
      time: '10:20',
      avatar: '3',
      isAnonymous: false,
      isPublic: false,
      replied: false,
    },
    {
      id: 5,
      userId: 'user_5',
      name: 'Анна Лебедева',
      message: 'Продолжайте в том же духе! 🔥',
      amount: 2000,
      currency: '₽',
      date: '2026-01-22',
      time: '16:00',
      avatar: '4',
      isAnonymous: false,
      isPublic: true,
      replied: false,
    },
    {
      id: 6,
      userId: 'user_6',
      name: 'Сергей Волков',
      message: 'Огонь! Давайте ещё!',
      amount: 300,
      currency: '₽',
      date: '2026-01-22',
      time: '09:30',
      avatar: '5',
      isAnonymous: false,
      isPublic: true,
      replied: false,
    },
    {
      id: 7,
      userId: 'user_anon_2',
      name: 'Анонимный донатер',
      message: 'Вы вдохновляете нас!',
      amount: 1500,
      currency: '₽',
      date: '2026-01-21',
      time: '20:10',
      avatar: '?',
      isAnonymous: true,
      isPublic: true,
      replied: false,
    },
    {
      id: 8,
      userId: 'user_8',
      name: 'Елена Морозова',
      message: 'За концерт в Москве! Было круто! 🎤',
      amount: 600,
      currency: '₽',
      date: '2026-01-21',
      time: '15:25',
      avatar: '6',
      isAnonymous: false,
      isPublic: true,
      replied: false,
    },
  ]);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: 1,
      amount: 5000,
      currency: '₽',
      date: '2026-01-20',
      status: 'completed',
      method: 'Банковская карта',
      fee: 150,
    },
    {
      id: 2,
      amount: 3000,
      currency: '₽',
      date: '2026-01-15',
      status: 'completed',
      method: 'Банковская карта',
      fee: 90,
    },
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState<DonationPeriod>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDonationLinkModal, setShowDonationLinkModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [copiedLink, setCopiedLink] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    minDonation: 50,
    maxDonation: 50000,
    showDonations: true,
    allowAnonymous: true,
    soundNotifications: true,
    emailNotifications: true,
    donationGoal: 50000,
    donationMessage: 'Спасибо за поддержку! Ваши донаты помогают мне создавать музыку для вас! 🎵',
  });

  // Фильтрация донатов
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const donationDate = new Date(donation.date);
    const now = new Date();
    let matchesPeriod = true;

    switch (selectedPeriod) {
      case 'today':
        matchesPeriod = donationDate.toDateString() === now.toDateString();
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = donationDate >= weekAgo;
        break;
      case 'month':
        matchesPeriod = donationDate.getMonth() === now.getMonth() && 
                        donationDate.getFullYear() === now.getFullYear();
        break;
      case 'year':
        matchesPeriod = donationDate.getFullYear() === now.getFullYear();
        break;
      default:
        matchesPeriod = true;
    }

    return matchesSearch && matchesPeriod;
  });

  // Статистика
  const stats = {
    total: donations.reduce((sum, d) => sum + d.amount, 0),
    today: donations
      .filter(d => new Date(d.date).toDateString() === new Date().toDateString())
      .reduce((sum, d) => sum + d.amount, 0),
    week: donations
      .filter(d => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(d.date) >= weekAgo;
      })
      .reduce((sum, d) => sum + d.amount, 0),
    month: donations
      .filter(d => {
        const now = new Date();
        const donationDate = new Date(d.date);
        return donationDate.getMonth() === now.getMonth() && 
               donationDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + d.amount, 0),
    count: donations.length,
    supporters: new Set(donations.filter(d => !d.isAnonymous).map(d => d.name)).size,
    avgDonation: donations.length > 0 ? Math.round(donations.reduce((sum, d) => sum + d.amount, 0) / donations.length) : 0,
    withdrawn: withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0),
    balance: donations.reduce((sum, d) => sum + d.amount, 0) - 
             withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount + w.fee, 0),
  };

  // Прогресс к цели
  const goalProgress = settings.donationGoal > 0 ? Math.min((stats.month / settings.donationGoal) * 100, 100) : 0;

  // Вывод средств
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 1000) {
      alert('Минимальная сумма вывода: 1,000₽');
      return;
    }
    if (amount > stats.balance) {
      alert('Недостаточно средств!');
      return;
    }

    const fee = Math.ceil(amount * 0.03); // 3% комиссия
    
    const newWithdrawal: Withdrawal = {
      id: Date.now(),
      amount: amount,
      currency: '₽',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      method: selectedMethod === 'card' ? 'Банковская карта' : 'ЮMoney',
      fee: fee,
    };

    setWithdrawals([newWithdrawal, ...withdrawals]);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    
    // Конвертируем в коины (1₽ = 10 коинов)
    onCoinsUpdate(userCoins + amount * 10);
  };

  // Копирование ссылки
  const handleCopyLink = () => {
    const link = `https://promo.music/donate/@your-username`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Статус вывода
  const getWithdrawalStatusConfig = (status: WithdrawalStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'В обработке',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-400/30',
        };
      case 'completed':
        return {
          label: 'Выполнено',
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-400/30',
        };
      case 'cancelled':
        return {
          label: 'Отменено',
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-400/30',
        };
    }
  };

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Цвета аватаров
  const avatarColors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-purple-500',
    'from-cyan-500 to-blue-500',
    'from-gray-500 to-gray-600',
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-5 lg:space-y-6 overflow-x-hidden">
      {/* Header - Adaptive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:gap-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">Мои донаты</h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg">Поддержка от ваших фанатов</p>
          </div>
          
          {/* Action Buttons - Fully Adaptive */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDonationLinkModal(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="hidden xs:inline">Ссылка</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsModal(true)}
              className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Настройки</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWithdrawModal(true)}
              disabled={stats.balance < 1000}
              className="flex-1 sm:flex-initial px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-green-600"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span>Вывести</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid - Fully Adaptive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/30 hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-300"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" />
            <div className="text-emerald-400 text-[10px] sm:text-xs font-semibold">Баланс</div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.balance.toLocaleString()}₽</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Всего</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.total.toLocaleString()}₽</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all duration-300"
        >
          <div className="text-cyan-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2 line-clamp-1">Этот месяц</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.month.toLocaleString()}₽</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Донатов</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.count}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-pink-500/10 border border-pink-400/30 hover:bg-pink-500/20 transition-all duration-300"
        >
          <div className="text-pink-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Спонсоров</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.supporters}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Средний</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.avgDonation}₽</div>
        </motion.div>
      </div>

      {/* Goal Progress - Fully Adaptive */}
      {settings.donationGoal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30"
        >
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-0.5 sm:mb-1">Цель на месяц</h3>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                {stats.month.toLocaleString()}₽ из {settings.donationGoal.toLocaleString()}₽
              </p>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex-shrink-0">
              {Math.round(goalProgress)}%
            </div>
          </div>
          <div className="w-full h-2.5 sm:h-3 md:h-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Filters - Fully Adaptive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или сообщению..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-emerald-400/50 transition-all duration-300"
          />
        </div>

        <div className="relative sm:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as DonationPeriod)}
            className="w-full sm:w-auto appearance-none px-3 sm:px-4 py-2.5 sm:py-3 pr-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:border-emerald-400/50 transition-all duration-300 cursor-pointer"
          >
            <option value="all">Все время</option>
            <option value="today">Сегодня</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
          <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Donations List - Fully Adaptive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2 sm:space-y-3 md:space-y-4"
      >
        {filteredDonations.length === 0 ? (
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl">
              {searchQuery ? 'Донаты не найдены' : 'У вас пока нет донатов'}
            </p>
          </div>
        ) : (
          filteredDonations.map((donation, index) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + index * 0.05 }}
              className="group p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                {/* Avatar - Adaptive */}
                <div className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 text-xs sm:text-sm md:text-base lg:text-lg`}>
                  {donation.avatar}
                </div>

                {/* Content - Adaptive */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <h3 className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg truncate">
                          {donation.name}
                        </h3>
                        {donation.isPublic && (
                          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm">
                        {formatDate(donation.date)} в {donation.time}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="text-emerald-400 font-bold text-sm sm:text-base md:text-lg lg:text-xl">
                        +{donation.amount.toLocaleString()}{donation.currency}
                      </div>
                    </div>
                  </div>

                  {/* Message - Adaptive */}
                  {donation.message && (
                    <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 mt-2 sm:mt-3">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm lg:text-base leading-relaxed flex-1">
                          {donation.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reply Button - Show for all non-anonymous donations */}
                  {!donation.isAnonymous && onReplyToDonator && (
                    <div className="mt-2 sm:mt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const userId = donation.userId || `user_${donation.id}`;
                          console.log('🔥 Клик на кнопку ответа!', { userId, userName: donation.name, avatar: donation.avatar });
                          onReplyToDonator(userId, donation.name, donation.avatar);
                          toast.success(`Открываем чат с ${donation.name}...`);
                        }}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 text-blue-400 font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Ответить донатеру
                      </motion.button>
                    </div>
                  )}
                  
                  {/* DEBUG INFO */}
                  {!donation.isAnonymous && !onReplyToDonator && (
                    <div className="mt-2 text-red-400 text-xs">
                      ⚠️ DEBUG: onReplyToDonator не передан!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Withdrawals History - Fully Adaptive */}
      {withdrawals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <h2 className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 md:mb-5">История выводов</h2>
          
          <div className="space-y-2 sm:space-y-3">
            {withdrawals.map((withdrawal, index) => {
              const statusConfig = getWithdrawalStatusConfig(withdrawal.status);
              return (
                <div
                  key={withdrawal.id}
                  className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex-1 min-w-0 w-full xs:w-auto">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">{withdrawal.method}</span>
                    </div>
                    <div className="text-gray-400 text-[10px] sm:text-xs md:text-sm">
                      {formatDate(withdrawal.date)} • Комиссия: {withdrawal.fee}₽
                    </div>
                  </div>

                  <div className="flex items-center justify-between xs:justify-end gap-3 w-full xs:w-auto xs:text-right flex-shrink-0">
                    <div className="text-red-400 font-bold text-sm sm:text-base md:text-lg lg:text-xl">
                      -{withdrawal.amount.toLocaleString()}{withdrawal.currency}
                    </div>
                    <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${statusConfig.bg} border ${statusConfig.border} inline-block flex-shrink-0`}>
                      <span className={`text-[10px] sm:text-xs font-semibold ${statusConfig.color} whitespace-nowrap`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* WITHDRAW MODAL - Fully Adaptive */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/30 shadow-2xl max-h-[95vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Вывод средств</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </motion.button>
              </div>

              {/* Balance - Adaptive */}
              <div className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 mb-3 sm:mb-4 md:mb-5">
                <div className="text-gray-400 text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2">Доступно для вывода:</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stats.balance.toLocaleString()}₽</div>
              </div>

              {/* Amount Input - Adaptive */}
              <div className="mb-3 sm:mb-4 md:mb-5">
                <label className="block text-gray-300 text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 font-semibold">
                  Сумма вывода *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Введите сумму"
                    min="1000"
                    max={stats.balance}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400/50 transition-all duration-300 text-base sm:text-lg font-semibold"
                  />
                  <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm sm:text-base">₽</span>
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2">
                  Минимальная сумма: 1,000₽ • Комиссия: 3%
                </div>
              </div>

              {/* Method Selection - Adaptive */}
              <div className="mb-3 sm:mb-4 md:mb-5">
                <label className="block text-gray-300 text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 font-semibold">
                  Способ вывода
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full p-2.5 sm:p-3 md:p-4 rounded-xl border transition-all duration-300 flex items-center gap-2 sm:gap-3 ${
                      selectedMethod === 'card'
                        ? 'bg-emerald-500/20 border-emerald-400/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-white font-semibold text-xs sm:text-sm md:text-base">Банковская карта</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs">1-3 рабочих дня</div>
                    </div>
                    {selectedMethod === 'card' && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedMethod('yoomoney')}
                    className={`w-full p-2.5 sm:p-3 md:p-4 rounded-xl border transition-all duration-300 flex items-center gap-2 sm:gap-3 ${
                      selectedMethod === 'yoomoney'
                        ? 'bg-emerald-500/20 border-emerald-400/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-white font-semibold text-xs sm:text-sm md:text-base">ЮMoney</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs">Мгновенно</div>
                    </div>
                    {selectedMethod === 'yoomoney' && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Fee Info - Adaptive */}
              {withdrawAmount && parseFloat(withdrawAmount) >= 1000 && (
                <div className="p-2.5 sm:p-3 md:p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/30 mb-3 sm:mb-4 md:mb-5">
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-[10px] sm:text-xs md:text-sm">
                      <div className="text-yellow-400 font-semibold mb-1">Информация о выводе:</div>
                      <div className="text-gray-300 leading-relaxed">
                        Сумма: {parseFloat(withdrawAmount).toLocaleString()}₽<br />
                        Комиссия (3%): {Math.ceil(parseFloat(withdrawAmount) * 0.03)}₽<br />
                        <strong>К получению: {(parseFloat(withdrawAmount) - Math.ceil(parseFloat(withdrawAmount) * 0.03)).toLocaleString()}₽</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions - Adaptive */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) < 1000 || parseFloat(withdrawAmount) > stats.balance}
                  className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-green-600 text-xs sm:text-sm md:text-base"
                >
                  Вывести средства
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL - Fully Adaptive */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 shadow-2xl overflow-hidden"
            >
              {/* Header - Adaptive */}
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white truncate">Настройки донатов</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettingsModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </motion.button>
              </div>

              {/* Content - Scrollable, Adaptive */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Min/Max Donation - Adaptive */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div>
                      <label className="block text-gray-300 text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 font-semibold">
                        Мин. сумма
                      </label>
                      <input
                        type="number"
                        value={settings.minDonation}
                        onChange={(e) => setSettings({ ...settings, minDonation: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-xs sm:text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 font-semibold">
                        Макс. сумма
                      </label>
                      <input
                        type="number"
                        value={settings.maxDonation}
                        onChange={(e) => setSettings({ ...settings, maxDonation: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-xs sm:text-sm md:text-base"
                      />
                    </div>
                  </div>

                  {/* Goal - Adaptive */}
                  <div>
                    <label className="block text-gray-300 text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 font-semibold">
                      Цель на месяц (₽)
                    </label>
                    <input
                      type="number"
                      value={settings.donationGoal}
                      onChange={(e) => setSettings({ ...settings, donationGoal: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-xs sm:text-sm md:text-base"
                    />
                  </div>

                  {/* Message - Adaptive */}
                  <div>
                    <label className="block text-gray-300 text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 font-semibold">
                      Сообщение донатерам
                    </label>
                    <textarea
                      value={settings.donationMessage}
                      onChange={(e) => setSettings({ ...settings, donationMessage: e.target.value })}
                      rows={4}
                      className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 resize-none text-xs sm:text-sm md:text-base"
                    />
                  </div>

                  {/* Toggles - Adaptive */}
                  <div className="space-y-2 sm:space-y-3">
                    <button
                      onClick={() => setSettings({ ...settings, showDonations: !settings.showDonations })}
                      className="w-full p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                        <span className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">Показывать донаты публично</span>
                      </div>
                      <div className={`w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-all duration-300 flex-shrink-0 ${settings.showDonations ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-white m-0.5 transition-transform duration-300 ${settings.showDonations ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, allowAnonymous: !settings.allowAnonymous })}
                      className="w-full p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                        <span className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">Разрешить анонимные донаты</span>
                      </div>
                      <div className={`w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-all duration-300 flex-shrink-0 ${settings.allowAnonymous ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-white m-0.5 transition-transform duration-300 ${settings.allowAnonymous ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, soundNotifications: !settings.soundNotifications })}
                      className="w-full p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {settings.soundNotifications ? (
                          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                        ) : (
                          <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">Звуковые уведомления</span>
                      </div>
                      <div className={`w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-all duration-300 flex-shrink-0 ${settings.soundNotifications ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-white m-0.5 transition-transform duration-300 ${settings.soundNotifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                      className="w-full p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                        <span className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">Email уведомления</span>
                      </div>
                      <div className={`w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-all duration-300 flex-shrink-0 ${settings.emailNotifications ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-white m-0.5 transition-transform duration-300 ${settings.emailNotifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer - Adaptive */}
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 lg:p-6 border-t border-white/10 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base"
                >
                  Сохранить
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DONATION LINK MODAL - Fully Adaptive */}
      <AnimatePresence>
        {showDonationLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDonationLinkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Link className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white truncate">Ссылка на донаты</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDonationLinkModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </motion.button>
              </div>

              <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-5 leading-relaxed">
                Поделитесь этой ссылкой в соцсетях, чтобы получать поддержку от фанатов
              </p>

              {/* Link - Adaptive */}
              <div className="p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 mb-3 sm:mb-4 md:mb-5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-mono text-[10px] sm:text-xs md:text-sm truncate">
                      https://promo.music/donate/@your-username
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-[10px] sm:text-xs md:text-sm"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden xs:inline">Готово</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden xs:inline">Копировать</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Share Buttons - Adaptive */}
              <div className="space-y-2 sm:space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  Поделиться в соцсетях
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  Открыть страницу
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}