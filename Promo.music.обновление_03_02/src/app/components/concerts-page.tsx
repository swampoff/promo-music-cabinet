import { Calendar, MapPin, Clock, Ticket, TrendingUp, Eye, Users, Plus, X, Check, AlertCircle, Upload, Trash2, Edit2, ExternalLink, Coins, Sparkles, DollarSign, Share2, Search, Filter, MousePointerClick, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { ConcertUploadModal } from '@/app/components/concert-upload-modal';
import { useData, type Concert, type ConcertStatus as ConcertStatusType } from '@/contexts/DataContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type ConcertStatus = ConcertStatusType;

// ConcertItem теперь совпадает с Concert из DataContext
type ConcertItem = Concert;

const concertTypes = [
  'Сольный концерт',
  'Фестиваль',
  'Клубное выступление',
  'Арена шоу',
  'Уличный концерт',
  'Акустический сет',
  'DJ сет',
  'Другое'
];

interface ConcertsPageProps {
  userCoins: number;
  onCoinsUpdate: (coins: number) => void;
  onOpenCoinsModal?: () => void;
}

export function ConcertsPage({ userCoins, onCoinsUpdate, onOpenCoinsModal }: ConcertsPageProps) {
  // Получаем данные из глобального контекста
  const { concerts: globalConcerts, addConcert, updateConcert, deleteConcert, getConcertsByUser } = useData();
  const { userId } = useCurrentUser();
  
  // Получаем концерты текущего пользователя
  const userConcerts = getConcertsByUser(userId);
  
  // Демо-данные для первого запуска (если нет концертов)
  const demoConcerts: ConcertItem[] = [
    {
      id: 1,
      title: 'Summer Music Fest 2026',
      date: '2026-06-15',
      time: '19:00',
      city: 'Москва',
      venue: 'Олимпийский',
      type: 'Фестиваль',
      description: 'Грандиозный летний фестиваль с участием топовых артистов',
      banner: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      ticketPriceFrom: '2000',
      ticketPriceTo: '8000',
      ticketLink: 'https://tickets.example.com/summer-fest',
      status: 'approved' as ConcertStatus,
      views: 15400,
      clicks: 850,
      ticketsSold: 1200,
      isPaid: true,
      createdAt: '5 дней назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 2,
      title: 'Acoustic Night',
      date: '2026-04-20',
      time: '20:00',
      city: 'Санкт-Петербург',
      venue: 'A2 Green Concert',
      type: 'Акустический сет',
      description: 'Интимный акустический концерт в камерной обстановке',
      banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      ticketPriceFrom: '1500',
      ticketPriceTo: '3500',
      ticketLink: 'https://tickets.example.com/acoustic',
      status: 'approved' as ConcertStatus,
      views: 8200,
      clicks: 420,
      ticketsSold: 350,
      isPaid: false,
      createdAt: '1 неделю назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 3,
      title: 'Electronic Beats Tour',
      date: '2026-05-10',
      time: '22:00',
      city: 'Казань',
      venue: 'Пирамида',
      type: 'DJ сет',
      description: 'Электронная музыка и невероятное световое шоу',
      banner: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800',
      ticketPriceFrom: '1000',
      ticketPriceTo: '2500',
      ticketLink: '',
      status: 'pending' as ConcertStatus,
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: false,
      createdAt: '3 дня назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 4,
      title: 'Rock Arena Show',
      date: '2026-07-01',
      time: '19:30',
      city: 'Екатеринбург',
      venue: 'DIVS',
      type: 'Арена шоу',
      description: 'Рок-концерт с полной шоу-программой',
      banner: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      ticketPriceFrom: '',
      ticketPriceTo: '',
      ticketLink: '',
      status: 'draft' as ConcertStatus,
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: false,
      createdAt: '1 день назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 5,
      title: 'Jazz Evening',
      date: '2026-03-25',
      time: '19:00',
      city: 'Москва',
      venue: 'Дом музыки',
      type: 'Клубное выступление',
      description: 'Джазовый вечер в уютной атмосфере',
      banner: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
      ticketPriceFrom: '3000',
      ticketPriceTo: '5000',
      ticketLink: 'https://tickets.example.com/jazz',
      status: 'rejected' as ConcertStatus,
      rejectionReason: 'Баннер не соответствует требованиям. Минимальное разрешение: 400x600px. Пожалуйста, загрузите баннер в более высоком качестве с вертикальной ориентацией.',
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: false,
      createdAt: '2 недели назад',
      artist: 'Demo Artist',
      userId
    },
  ];

  // Используем концерты пользователя или демо-данные
  const concerts = userConcerts.length > 0 ? userConcerts : demoConcerts;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState<ConcertItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<ConcertStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация концертов
  const filteredConcerts = concerts.filter(concert => {
    const matchesStatus = filterStatus === 'all' || concert.status === filterStatus;
    const matchesSearch = 
      concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Статистика
  const stats = {
    total: concerts.length,
    approved: concerts.filter(c => c.status === 'approved').length,
    pending: concerts.filter(c => c.status === 'pending').length,
    rejected: concerts.filter(c => c.status === 'rejected').length,
    draft: concerts.filter(c => c.status === 'draft').length,
    totalViews: concerts.reduce((sum, c) => sum + c.views, 0),
    totalClicks: concerts.reduce((sum, c) => sum + c.clicks, 0),
  };

  // Загрузка концерта
  const handleUploadConcert = async (data: {
    title: string;
    date: string;
    time: string;
    city: string;
    venue: string;
    type: string;
    description: string;
    banner: string | null;
    ticketPriceFrom: string;
    ticketPriceTo: string;
    ticketLink: string;
  }, isDraft: boolean = false) => {
    const newConcert: ConcertItem = {
      title: data.title,
      date: data.date,
      time: data.time,
      city: data.city,
      venue: data.venue,
      type: data.type,
      description: data.description,
      banner: data.banner || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      ticketPriceFrom: data.ticketPriceFrom,
      ticketPriceTo: data.ticketPriceTo,
      ticketLink: data.ticketLink,
      status: isDraft ? 'draft' : 'pending',
      views: 0,
      clicks: 0,
      ticketsSold: 0,
      isPaid: false,
      createdAt: 'Только что',
      artist: 'Demo Artist',
      userId
    };

    addConcert(newConcert);
    setShowUploadModal(false);
  };

  // Оплата продвижения
  const handlePayPromotion = (concert: ConcertItem) => {
    setSelectedConcert(concert);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedConcert) return;

    const cost = 2000; // Стоимость продвижения концерта в коинах
    
    if (userCoins < cost) {
      alert('Недостаточно коинов!');
      return;
    }

    onCoinsUpdate(userCoins - cost);
    
    // Обновляем концерт в контексте
    updateConcert(selectedConcert.id, { isPaid: true });

    setShowPaymentModal(false);
    setSelectedConcert(null);
  };

  // Удаление концерта
  const handleDeleteConcert = (concertId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот концерт?')) {
      deleteConcert(concertId);
    }
  };

  // Получение статуса и его стилей
  const getStatusConfig = (status: ConcertStatus) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Черновик',
          icon: Edit2,
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/30',
        };
      case 'pending':
        return {
          label: 'На модерации',
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-400/30',
        };
      case 'approved':
        return {
          label: 'Одобрено',
          icon: Check,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-400/30',
        };
      case 'rejected':
        return {
          label: 'Отклонено',
          icon: XCircle,
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

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0 pt-16 lg:pt-0">
      {/* Header - адаптивный */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8"
      >
        <div className="w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">Мои концерты</h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg">Управляйте предстоящими событиями</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div 
            onClick={() => onOpenCoinsModal?.()}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer flex-1 sm:flex-none"
          >
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-white font-semibold text-sm sm:text-base">{userCoins.toLocaleString()}</span>
            <span className="text-gray-400 text-xs sm:text-sm hidden xs:inline">коинов</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-purple-500/15 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Добавить концерт</span>
            <span className="inline sm:hidden">Добавить</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Всего концертов</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.total}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-green-500/10 border border-green-400/30 hover:bg-green-500/20 transition-all duration-300"
        >
          <div className="text-green-400 text-xs sm:text-sm mb-1 sm:mb-2">Одобрено</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.approved}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/30 hover:bg-yellow-500/20 transition-all duration-300"
        >
          <div className="text-yellow-400 text-xs sm:text-sm mb-1 sm:mb-2">На модерации</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.pending}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Просмотры</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Клики на билеты</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.totalClicks.toLocaleString()}</div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, городу, площадке..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 touch-manipulation"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ConcertStatus | 'all')}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 cursor-pointer touch-manipulation"
          >
            <option value="all">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
      </motion.div>

      {/* Concerts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {filteredConcerts.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-4">
              {searchQuery ? 'Концерты не найдены' : 'У вас пока нет концертов'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold transition-all duration-300"
              >
                Добавить первый концерт
              </motion.button>
            )}
          </div>
        ) : (
          filteredConcerts.map((concert, index) => {
            const statusConfig = getStatusConfig(concert.status);
            const StatusIcon = statusConfig.icon;
            const isPast = new Date(concert.date) < new Date();

            return (
              <motion.div
                key={concert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className="group rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden"
              >
                {/* Banner */}
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <ImageWithFallback
                    src={concert.banner}
                    alt={concert.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg ${statusConfig.bg} border ${statusConfig.border} backdrop-blur-sm`}>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
                      <span className={`text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Promotion Badge */}
                  {concert.isPaid && concert.status === 'approved' && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">
                          Продвигается
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-3 py-1.5 rounded-lg bg-purple-500/30 border border-purple-400/40 backdrop-blur-sm">
                        <span className="text-white text-sm font-bold">{formatDate(concert.date)}</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-purple-500/30 border border-purple-400/40 backdrop-blur-sm">
                        <span className="text-white text-sm font-bold">{concert.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{concert.title}</h3>
                    
                    {/* Location */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="truncate">{concert.city}, {concert.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{concert.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {concert.description && (
                    <p className="text-gray-300 text-sm line-clamp-2">{concert.description}</p>
                  )}

                  {/* Ticket Price */}
                  {(concert.ticketPriceFrom || concert.ticketPriceTo) && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      <Ticket className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm font-semibold">
                        {concert.ticketPriceFrom && concert.ticketPriceTo
                          ? `${parseInt(concert.ticketPriceFrom).toLocaleString()} - ${parseInt(concert.ticketPriceTo).toLocaleString()} ₽`
                          : concert.ticketPriceFrom
                          ? `От ${parseInt(concert.ticketPriceFrom).toLocaleString()} ₽`
                          : `До ${parseInt(concert.ticketPriceTo).toLocaleString()} ₽`
                        }
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  {concert.status === 'approved' && (
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {concert.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="w-4 h-4" />
                        {concert.clicks.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {concert.status === 'rejected' && concert.rejectionReason && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-red-400 text-xs">{concert.rejectionReason}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {concert.status === 'approved' && concert.ticketLink && (
                      <motion.a
                        href={concert.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Ticket className="w-4 h-4" />
                        Билеты
                      </motion.a>
                    )}

                    {concert.status === 'approved' && !concert.isPaid && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePayPromotion(concert)}
                        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Coins className="w-4 h-4" />
                        Продвижение
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteConcert(concert.id)}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* UPLOAD MODAL */}
      <ConcertUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadConcert}
      />

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentModal && selectedConcert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-5 md:p-8 rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-400/30 shadow-2xl my-auto"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Coins className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Оплата продвижения</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              {/* Concert Info */}
              <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 mb-4 md:mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-20 md:w-16 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={selectedConcert.banner}
                      alt={selectedConcert.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm md:text-base mb-1 line-clamp-2">{selectedConcert.title}</div>
                    <div className="text-gray-400 text-xs md:text-sm">{formatDate(selectedConcert.date)}</div>
                    <div className="text-gray-400 text-xs md:text-sm">{selectedConcert.city}</div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <div className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5">
                  <span className="text-gray-300 text-sm md:text-base">Стоимость продвижения:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-white font-bold text-lg md:text-xl">2,000</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5">
                  <span className="text-gray-300 text-sm md:text-base">Ваш баланс:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-white font-bold text-lg md:text-xl">{userCoins.toLocaleString()}</span>
                  </div>
                </div>

                {userCoins < 2000 && (
                  <div className="p-3 md:p-4 rounded-xl bg-red-500/10 border border-red-400/30">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-red-400 text-xs md:text-sm">
                        Недостаточно коинов! Пополните баланс в разделе "Коины"
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 md:p-4 rounded-xl bg-purple-500/10 border border-purple-400/30">
                  <div className="text-purple-400 font-semibold mb-2 text-sm md:text-base">Что включено:</div>
                  <ul className="text-gray-300 text-xs md:text-sm space-y-1">
                    <li>✓ Боковой баннер на главной странице</li>
                    <li>✓ Приоритет в поисковой выдаче</li>
                    <li>✓ Рассылка подписчикам</li>
                    <li>✓ Детальная аналитика</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 order-2 sm:order-1"
                >
                  Отмена
                </motion.button>
                <motion.button
                  whileHover={{ scale: userCoins >= 2000 ? 1.02 : 1 }}
                  whileTap={{ scale: userCoins >= 2000 ? 0.98 : 1 }}
                  onClick={confirmPayment}
                  disabled={userCoins < 2000}
                  className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 order-1 sm:order-2 ${
                    userCoins >= 2000
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg shadow-yellow-500/20'
                      : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Оплатить 2,000 коинов</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}