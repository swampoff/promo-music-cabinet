import { TrendingUp, Zap, Target, Award, Coins, Music2, Video, Calendar, Newspaper, Play, Pause, Eye, Users, Heart, BarChart3, X, Check, Clock, CheckCircle, XCircle, Filter, Search, ChevronDown, Sparkles, ArrowUpRight, DollarSign, TrendingDown, Globe, MapPin, UserCheck, Smartphone, Radio, Mic, ChevronRight, Info, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSubscription, subscriptionHelpers } from '@/contexts/SubscriptionContext';

type CampaignType = 'track' | 'video' | 'concert' | 'news';
type CampaignStatus = 'active' | 'paused' | 'completed' | 'pending';
type FilterType = 'all' | 'track' | 'video' | 'concert' | 'news';
type PlanType = 'basic' | 'advanced' | 'pro';

interface Campaign {
  id: number;
  title: string;
  type: CampaignType;
  status: CampaignStatus;
  spent: number;
  budget: number;
  reach: number;
  targetReach: number;
  engagement: number;
  likes: number;
  shares: number;
  clicks: number;
  startDate: string;
  endDate: string;
  progress: number;
  coverImage: string;
}

interface Plan {
  id: PlanType;
  name: string;
  coins: number;
  originalCoins?: number;
  reach: string;
  duration: string;
  features: string[];
  color: string;
  popular?: boolean;
  discount?: number;
  detailedFeatures: {
    targeting: string[];
    platforms: string[];
    analytics: string[];
    support: string[];
  };
}

interface PitchingPageProps {
  userCoins: number;
  onCoinsUpdate: (coins: number) => void;
}

export function PitchingPage({ userCoins, onCoinsUpdate }: PitchingPageProps) {
  // Get subscription discount
  const { subscription } = useSubscription();
  const pitchingDiscount = subscriptionHelpers.getPitchingDiscount(subscription);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: 'Summer Vibes',
      type: 'track',
      status: 'active',
      spent: 450,
      budget: 700,
      reach: 12500,
      targetReach: 20000,
      engagement: 8.5,
      likes: 1240,
      shares: 340,
      clicks: 890,
      startDate: '2026-01-15',
      endDate: '2026-02-15',
      progress: 64,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    },
    {
      id: 2,
      title: 'Electric Soul (Music Video)',
      type: 'video',
      status: 'active',
      spent: 680,
      budget: 1000,
      reach: 18200,
      targetReach: 25000,
      engagement: 12.3,
      likes: 2340,
      shares: 890,
      clicks: 1560,
      startDate: '2026-01-10',
      endDate: '2026-02-10',
      progress: 73,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    },
    {
      id: 3,
      title: 'Summer Music Fest 2026',
      type: 'concert',
      status: 'completed',
      spent: 1500,
      budget: 1500,
      reach: 45000,
      targetReach: 40000,
      engagement: 15.8,
      likes: 5200,
      shares: 1850,
      clicks: 3420,
      startDate: '2025-12-01',
      endDate: '2026-01-15',
      progress: 100,
      coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    },
    {
      id: 4,
      title: 'Новый альбом уже скоро!',
      type: 'news',
      status: 'active',
      spent: 320,
      budget: 500,
      reach: 8400,
      targetReach: 15000,
      engagement: 9.2,
      likes: 850,
      shares: 240,
      clicks: 670,
      startDate: '2026-01-20',
      endDate: '2026-02-20',
      progress: 56,
      coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    },
    {
      id: 5,
      title: 'Midnight Dreams',
      type: 'track',
      status: 'paused',
      spent: 150,
      budget: 500,
      reach: 3400,
      targetReach: 10000,
      engagement: 5.7,
      likes: 280,
      shares: 45,
      clicks: 190,
      startDate: '2026-01-18',
      endDate: '2026-02-18',
      progress: 30,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    },
    {
      id: 6,
      title: 'Acoustic Night',
      type: 'concert',
      status: 'pending',
      spent: 0,
      budget: 800,
      reach: 0,
      targetReach: 15000,
      engagement: 0,
      likes: 0,
      shares: 0,
      clicks: 0,
      startDate: '2026-02-01',
      endDate: '2026-03-01',
      progress: 0,
      coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    },
  ]);

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPlanForCreate, setSelectedPlanForCreate] = useState<PlanType>('advanced');

  // Create campaign form state
  const [createForm, setCreateForm] = useState({
    contentType: 'track' as CampaignType,
    contentTitle: '',
    targetAudience: 'all',
    targetCountry: 'all',
    targetAge: 'all',
    targetGender: 'all',
    additionalOptions: {
      priorityPlacement: false,
      socialMediaBoost: false,
      influencerPromo: false,
      radioPromo: false,
    }
  });

  // Тарифные планы с детальной информацией (базовые цены)
  const basePlans: Plan[] = [
    { 
      id: 'basic',
      name: 'Базовый', 
      coins: 100, 
      reach: '1,000 - 5,000', 
      duration: '7 дней',
      features: ['Базовая аудитория', '7 дней показов', 'Базовая статистика', 'Email поддержка'], 
      color: 'from-blue-500 to-cyan-500',
      discount: undefined,
      detailedFeatures: {
        targeting: ['По странам', 'По возрасту 18+'],
        platforms: ['Promo.music', 'Базовые плейлисты'],
        analytics: ['Просмотры', 'Клики', 'Базовый отчет'],
        support: ['Email поддержка', 'База знаний'],
      }
    },
    { 
      id: 'advanced',
      name: 'Продвинутый', 
      coins: 300,
      originalCoins: 350,
      reach: '5,000 - 15,000', 
      duration: '14 дней',
      features: ['Таргетированная аудитория', '14 дней показов', 'Расширенная статистика', 'Приоритет в плейлистах', 'Продвижение в соцсетях', 'Приоритетная поддержка'], 
      color: 'from-purple-500 to-pink-500', 
      popular: true,
      discount: 15,
      detailedFeatures: {
        targeting: ['По странам', 'По возрасту', 'По полу', 'По интересам', 'Lookalike-аудитории'],
        platforms: ['Promo.music', 'Instagram', 'VK', 'Telegram', 'Топ плейлисты', 'Рекомендации'],
        analytics: ['Просмотры', 'Клики', 'Лайки', 'Репосты', 'Демография', 'Подробный отчет', 'Экспорт данных'],
        support: ['Приоритетная поддержка', 'Чат 24/7', 'База знаний', 'Видео-гайды'],
      }
    },
    { 
      id: 'pro',
      name: 'Профессионал', 
      coins: 600,
      originalCoins: 750,
      reach: '15,000 - 50,000', 
      duration: '30 дней',
      features: ['Премиум аудитория', '30 дней показов', 'Полная аналитика в реальном времени', 'Продвижение в топ плейлистах', 'Продвижение во всех соцсетях', 'Персональный менеджер', 'Размещение на главной promo.music'], 
      color: 'from-orange-500 to-red-500',
      discount: 20,
      detailedFeatures: {
        targeting: ['По странам', 'По возрасту', 'По полу', 'По интересам', 'По поведению', 'Lookalike-аудитории', 'Ретаргетинг', 'Кастомные сегменты'],
        platforms: ['Promo.music (Главная)', 'Instagram', 'VK', 'Telegram', 'YouTube', 'TikTok', 'Яндекс.Музыка', 'Spotify', 'Apple Music', 'Все топ плейлисты', 'Радиостанции'],
        analytics: ['Real-time дашборд', 'Все метрики', 'Демография', 'География', 'Поведение', 'Конверсии', 'ROI анализ', 'A/B тестирование', 'Экспорт в Excel/PDF', 'API доступ'],
        support: ['Персональный менеджер', 'Чат 24/7', 'Телефон', 'Email', 'Индивидуальные консультации', 'Помощь в настройке'],
      }
    },
  ];

  // Применяем скидку подписки к тарифам
  const plans: Plan[] = basePlans.map(plan => {
    const baseCoins = plan.originalCoins || plan.coins;
    const discountedCoins = Math.round(baseCoins * (1 - pitchingDiscount));
    const totalDiscount = plan.discount ? plan.discount + Math.round(pitchingDiscount * 100) : Math.round(pitchingDiscount * 100);
    
    return {
      ...plan,
      originalCoins: pitchingDiscount > 0 ? baseCoins : plan.originalCoins,
      coins: discountedCoins,
      discount: totalDiscount > 0 ? totalDiscount : undefined,
    };
  });

  // Дополнительные опции
  const additionalOptions = [
    {
      id: 'priorityPlacement',
      name: 'Приоритетное размещение',
      description: 'Ваш контент будет показан первым в рекомендациях',
      price: 50,
      icon: Sparkles,
    },
    {
      id: 'socialMediaBoost',
      name: 'Усиленное продвижение в соцсетях',
      description: 'Дополнительные охваты в Instagram, VK, Telegram',
      price: 100,
      icon: Users,
    },
    {
      id: 'influencerPromo',
      name: 'Продвижение через инфлюенсеров',
      description: 'Размещение у популярных музыкальных блогеров',
      price: 200,
      icon: UserCheck,
    },
    {
      id: 'radioPromo',
      name: 'Ротация на радио',
      description: 'Проигрывание на популярных интернет-радиостанциях',
      price: 150,
      icon: Radio,
    },
  ];

  // Фильтрация кампаний
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesType = filterType === 'all' || campaign.type === filterType;
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Статистика
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalReach: campaigns.reduce((sum, c) => sum + c.reach, 0),
    totalEngagement: campaigns.length > 0 
      ? (campaigns.reduce((sum, c) => sum + c.engagement, 0) / campaigns.length).toFixed(1)
      : 0,
    totalLikes: campaigns.reduce((sum, c) => sum + c.likes, 0),
    totalShares: campaigns.reduce((sum, c) => sum + c.shares, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
  };

  // Расчет итоговой стоимости
  const calculateTotalCost = () => {
    const plan = plans.find(p => p.id === selectedPlanForCreate);
    if (!plan) return 0;
    
    let total = plan.coins;
    
    Object.entries(createForm.additionalOptions).forEach(([key, enabled]) => {
      if (enabled) {
        const option = additionalOptions.find(o => o.id === key);
        if (option) total += option.price;
      }
    });
    
    return total;
  };

  // Управление кампанией
  const handlePauseCampaign = (campaignId: number) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, status: 'paused' as CampaignStatus } : c
    ));
  };

  const handleResumeCampaign = (campaignId: number) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, status: 'active' as CampaignStatus } : c
    ));
  };

  const handleStopCampaign = (campaignId: number) => {
    if (confirm('Вы уверены, что хотите остановить кампанию?')) {
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, status: 'completed' as CampaignStatus, progress: 100 } : c
      ));
    }
  };

  const handleViewStats = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowStatsModal(true);
  };

  const handleOpenPlanDetails = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPlanDetailsModal(true);
  };

  const handleStartCampaign = (planId: PlanType) => {
    setSelectedPlanForCreate(planId);
    setShowCreateModal(true);
  };

  const handleCreateCampaign = () => {
    const totalCost = calculateTotalCost();
    
    if (userCoins < totalCost) {
      alert('Недостаточно коинов!');
      return;
    }

    if (!createForm.contentTitle.trim()) {
      alert('Введите название контента!');
      return;
    }

    // Создаем новую кампанию
    const plan = plans.find(p => p.id === selectedPlanForCreate);
    if (!plan) return;

    // Вычитаем коины
    onCoinsUpdate(userCoins - totalCost);

    // Закрываем модал
    setShowCreateModal(false);
    
    // Сбрасываем форму
    setCreateForm({
      contentType: 'track',
      contentTitle: '',
      targetAudience: 'all',
      targetCountry: 'all',
      targetAge: 'all',
      targetGender: 'all',
      additionalOptions: {
        priorityPlacement: false,
        socialMediaBoost: false,
        influencerPromo: false,
        radioPromo: false,
      }
    });

    alert('Кампания успешно создана! Она начнет работу в течение 24 часов.');
  };

  // Конфигурация статуса
  const getStatusConfig = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Активна',
          icon: Play,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-400/30',
        };
      case 'paused':
        return {
          label: 'На паузе',
          icon: Pause,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-400/30',
        };
      case 'completed':
        return {
          label: 'Завершена',
          icon: CheckCircle,
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-400/30',
        };
      case 'pending':
        return {
          label: 'Ожидает',
          icon: Clock,
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/30',
        };
    }
  };

  // Иконка типа
  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case 'track': return Music2;
      case 'video': return Video;
      case 'concert': return Calendar;
      case 'news': return Newspaper;
    }
  };

  // Название типа
  const getTypeName = (type: CampaignType) => {
    switch (type) {
      case 'track': return 'Трек';
      case 'video': return 'Видео';
      case 'concert': return 'Концерт';
      case 'news': return 'Новость';
    }
  };

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Header - Adaptive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:gap-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">Питчинг</h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg">Продвигайте свой контент и получайте больше слушателей</p>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
            <span className="text-white font-semibold text-sm sm:text-base">{userCoins.toLocaleString()}</span>
            <span className="text-gray-400 text-xs sm:text-sm hidden xs:inline">коинов</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Fully Adaptive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Кампаний</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.totalCampaigns}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-emerald-500/10 border border-emerald-400/30 hover:bg-emerald-500/20 transition-all duration-300"
        >
          <div className="text-emerald-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Активных</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.activeCampaigns}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-orange-500/10 border border-orange-400/30 hover:bg-orange-500/20 transition-all duration-300"
        >
          <div className="text-orange-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Потрачено</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.totalSpent}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2 line-clamp-1">Охват</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalReach / 1000).toFixed(1)}K</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all duration-300"
        >
          <div className="text-cyan-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2 line-clamp-1">Вовлеч.</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.totalEngagement}%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-pink-500/10 border border-pink-400/30 hover:bg-pink-500/20 transition-all duration-300"
        >
          <div className="text-pink-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Лайков</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalLikes / 1000).toFixed(1)}K</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Репостов</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalShares / 1000).toFixed(1)}K</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-purple-500/10 border border-purple-400/30 hover:bg-purple-500/20 transition-all duration-300"
        >
          <div className="text-purple-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Кликов</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalClicks / 1000).toFixed(1)}K</div>
        </motion.div>
      </div>

      {/* Filters - Fully Adaptive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск кампаний..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
          />
        </div>

        <div className="relative sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="w-full sm:w-auto appearance-none px-3 sm:px-4 py-2.5 sm:py-3 pr-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:border-cyan-400/50 transition-all duration-300 cursor-pointer"
          >
            <option value="all">Все типы</option>
            <option value="track">Треки</option>
            <option value="video">Видео</option>
            <option value="concert">Концерты</option>
            <option value="news">Новости</option>
          </select>
          <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Campaigns List - Fully Adaptive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="space-y-3 sm:space-y-4"
      >
        <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 md:mb-4">Активные кампании</h2>
        
        {filteredCampaigns.length === 0 ? (
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl">
              {searchQuery ? 'Кампании не найдены' : 'У вас пока нет активных кампаний'}
            </p>
          </div>
        ) : (
          filteredCampaigns.map((campaign, index) => {
            const statusConfig = getStatusConfig(campaign.status);
            const TypeIcon = getTypeIcon(campaign.type);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                {/* Header - Adaptive */}
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {/* Cover Image - Adaptive */}
                  <div className="w-full sm:w-20 md:w-24 h-20 sm:h-20 md:h-24 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 relative group">
                    <img 
                      src={campaign.coverImage} 
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2">
                      <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-white/20 backdrop-blur-sm flex items-center gap-1`}>
                        <TypeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                        <span className="text-white text-[10px] sm:text-xs font-semibold">{getTypeName(campaign.type)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info - Adaptive */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-bold text-base sm:text-lg md:text-xl line-clamp-1">{campaign.title}</h3>
                      <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex items-center gap-1 sm:gap-1.5 flex-shrink-0`}>
                        <StatusIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${statusConfig.color}`} />
                        <span className={`text-[10px] sm:text-xs font-semibold ${statusConfig.color} whitespace-nowrap`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">{campaign.reach.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
                        <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">{campaign.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
                        <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" />
                        <span className="truncate">{campaign.spent} / {campaign.budget}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
                        <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">{campaign.engagement}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress - Adaptive */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                    <span>Прогресс кампании</span>
                    <span className="font-semibold">{campaign.progress}%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${campaign.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Actions - Fully Adaptive */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewStats(campaign)}
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold transition-all duration-300 border border-cyan-400/30 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5"
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden xs:inline">Статистика</span>
                  </motion.button>

                  {campaign.status === 'active' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePauseCampaign(campaign.id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5"
                    >
                      <Pause className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Пауза</span>
                    </motion.button>
                  )}

                  {campaign.status === 'paused' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleResumeCampaign(campaign.id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold transition-all duration-300 border border-emerald-400/30 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5"
                    >
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Продолжить</span>
                    </motion.button>
                  )}

                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStopCampaign(campaign.id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5"
                    >
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden md:inline">Остановить</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Promotion Plans - Fully Adaptive & Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 sm:mt-8 md:mt-10 lg:mt-12"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
          <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl">Тарифы продвижения</h2>
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Выберите подходящий тариф</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + index * 0.1 }}
              className={`relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-purple-400/50 shadow-xl shadow-purple-500/10' : 'border-white/10'
              }`}
            >
              {/* Badges */}
              <div className="absolute -top-2.5 sm:-top-3 left-0 right-0 flex items-center justify-between px-3 sm:px-4">
                {plan.popular && (
                  <div className="px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-lg">
                    ⭐ ПОПУЛЯРНЫЙ
                  </div>
                )}
                
                {plan.discount && (
                  <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-bold shadow-lg ${plan.popular ? 'ml-auto' : ''}`}>
                    -{plan.discount}% 🔥
                  </div>
                )}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3 sm:mb-4`}>
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">{plan.name}</h3>
              
              {/* Price */}
              <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                {plan.originalCoins && (
                  <span className="text-base sm:text-lg text-gray-500 line-through">{plan.originalCoins}</span>
                )}
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{plan.coins}</span>
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              </div>
              
              {/* Details */}
              <p className="text-gray-400 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Охват: {plan.reach}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 flex items-center gap-1.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Длительность: {plan.duration}
              </p>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-xs sm:text-sm text-cyan-400 font-semibold">
                    +{plan.features.length - 4} дополнительных возможностей
                  </li>
                )}
              </ul>

              {/* Actions */}
              <div className="space-y-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartCampaign(plan.id)}
                  disabled={userCoins < plan.coins}
                  className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${plan.color} text-white font-semibold transition-all duration-300 shadow-lg text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
                >
                  {userCoins < plan.coins ? (
                    <>
                      <Coins className="w-4 h-4" />
                      Недостаточно коинов
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Запустить кампанию
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenPlanDetails(plan)}
                  className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  Подробнее
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* STATS MODAL - Fully Adaptive */}
      <AnimatePresence>
        {showStatsModal && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowStatsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white truncate">{selectedCampaign.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Детальная статистика</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowStatsModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </motion.button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-gray-400 text-[10px] sm:text-xs mb-1 sm:mb-2">Охват</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{selectedCampaign.reach.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs mt-1">из {selectedCampaign.targetReach.toLocaleString()}</div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                      <div className="text-emerald-400 text-[10px] sm:text-xs mb-1 sm:mb-2">Вовлеченность</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{selectedCampaign.engagement}%</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        +2.3%
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-orange-500/10 border border-orange-400/30">
                      <div className="text-orange-400 text-[10px] sm:text-xs mb-1 sm:mb-2">Бюджет</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{selectedCampaign.spent}</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs mt-1">из {selectedCampaign.budget}</div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-pink-500/10 border border-pink-400/30">
                      <div className="text-pink-400 text-[10px] sm:text-xs mb-1 sm:mb-2">Лайки</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{selectedCampaign.likes.toLocaleString()}</div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-400/30">
                      <div className="text-blue-400 text-[10px] sm:text-xs mb-1 sm:mb-2">Репосты</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{selectedCampaign.shares.toLocaleString()}</div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-purple-500/10 border border-purple-400/30">
                      <div className="text-purple-400 text-[10px] sm:text-xs mb-1 sm:mb-2">Клики</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{selectedCampaign.clicks.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Period */}
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-gray-400 text-xs sm:text-sm mb-2">Период проведения</div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {formatDate(selectedCampaign.startDate)} — {formatDate(selectedCampaign.endDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 lg:p-6 border-t border-white/10 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStatsModal(false)}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base"
                >
                  Закрыть
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAN DETAILS MODAL */}
      <AnimatePresence>
        {showPlanDetailsModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPlanDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r ${selectedPlan.color} flex items-center justify-center flex-shrink-0`}>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">Тариф "{selectedPlan.name}"</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Полная информация о тарифе</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPlanDetailsModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </motion.button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Price Card */}
                  <div className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${selectedPlan.color} bg-opacity-10 border border-white/20`}>
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                      {selectedPlan.originalCoins && (
                        <span className="text-xl sm:text-2xl text-gray-400 line-through">{selectedPlan.originalCoins}</span>
                      )}
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{selectedPlan.coins}</span>
                      <Coins className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                      {selectedPlan.discount && (
                        <span className="ml-auto px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs sm:text-sm font-bold">
                          -{selectedPlan.discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        Охват: {selectedPlan.reach}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {selectedPlan.duration}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Targeting */}
                    <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-white font-bold text-sm sm:text-base">Таргетинг</h4>
                      </div>
                      <ul className="space-y-2">
                        {selectedPlan.detailedFeatures.targeting.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Platforms */}
                    <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <h4 className="text-white font-bold text-sm sm:text-base">Платформы</h4>
                      </div>
                      <ul className="space-y-2">
                        {selectedPlan.detailedFeatures.platforms.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Analytics */}
                    <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                        <h4 className="text-white font-bold text-sm sm:text-base">Аналитика</h4>
                      </div>
                      <ul className="space-y-2">
                        {selectedPlan.detailedFeatures.analytics.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Support */}
                    <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-pink-400" />
                        <h4 className="text-white font-bold text-sm sm:text-base">Поддержка</h4>
                      </div>
                      <ul className="space-y-2">
                        {selectedPlan.detailedFeatures.support.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 lg:p-6 border-t border-white/10 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPlanDetailsModal(false);
                    handleStartCampaign(selectedPlan.id);
                  }}
                  disabled={userCoins < selectedPlan.coins}
                  className={`flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r ${selectedPlan.color} text-white font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  <Sparkles className="w-4 h-4" />
                  {userCoins < selectedPlan.coins ? 'Недостаточно коинов' : 'Выбрать этот тариф'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPlanDetailsModal(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base"
                >
                  Закрыть
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE CAMPAIGN MODAL - To be continued in next part... */}
    </div>
  );
}