import { Plus, Calendar, Eye, MessageSquare, Heart, Trash2, X, Edit2, Image as ImageIcon, Send, Check, Clock, Sparkles, Filter, Search, TrendingUp, Share2, XCircle, AlertCircle, Coins, Upload, Loader2, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { validateNewsImage, getNewsImageRecommendations, formatFileSize, ImageValidationResult } from '@/utils/news-image-validation';
import { useData, type News, type NewsStatus as NewsStatusType } from '@/contexts/DataContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type NewsStatus = NewsStatusType;

// NewsItem теперь совпадает с News из DataContext
type NewsItem = News;

interface NewsPageProps {
  userCoins?: number;
  onCoinsUpdate?: (coins: number) => void;
  onNewsUpdate?: (news: NewsItem[]) => void;
}

export function NewsPage({ 
  userCoins = 0, 
  onCoinsUpdate = () => {}, 
  onNewsUpdate 
}: NewsPageProps) {
  // Получаем данные из глобального контекста
  const { news: globalNews, addNews, updateNews: updateNewsItem, deleteNews, getNewsByUser } = useData();
  const { userId } = useCurrentUser();
  
  // Получаем новости текущего пользователя
  const userNews = getNewsByUser(userId);
  
  // Демо-данные для первого запуска (если нет новостей)
  const demoNews: NewsItem[] = [
    {
      id: 1,
      title: 'Новый альбом уже скоро!',
      preview: 'Рад сообщить, что работа над новым альбомом практически завершена...',
      content: 'Рад сообщить, что работа над новым альбомом практически завершена! Это был долгий путь, но результат превзошел все ожидания. Записали 12 треков, каждый из которых особенный. Скоро поделюсь первым синглом с вами!',
      coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
      date: '2026-01-20',
      publishDate: new Date('2026-01-20').toISOString(),
      status: 'approved' as NewsStatus,
      views: 12400,
      likes: 850,
      comments: 145,
      isPaid: true,
      createdAt: '5 дней назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 2,
      title: 'Спасибо за 10К подписчиков!',
      preview: 'Невероятно! Мы достигли отметки в 10 тысяч подписчиков...',
      content: 'Невероятно! Мы достигли отметки в 10 тысяч подписчиков на всех платформах! Спасибо каждому из вас за поддержку, это значит очень много для меня. Вместе мы создаем что-то особенное!',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      date: '2026-01-15',
      publishDate: new Date('2026-01-15').toISOString(),
      status: 'approved' as NewsStatus,
      views: 23400,
      likes: 1920,
      comments: 328,
      isPaid: false,
      createdAt: '1 неделю назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 3,
      title: 'Анонс летнего тура',
      preview: 'Этим летом планируется большой тур по городам России...',
      content: 'Этим летом планируется большой тур по городам России! Мы посетим более 15 городов. Уже сейчас можно приобрести билеты на первые даты. Не пропустите!',
      coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      date: '2026-01-10',
      publishDate: new Date('2026-01-10').toISOString(),
      status: 'pending' as NewsStatus,
      views: 0,
      likes: 0,
      comments: 0,
      isPaid: false,
      createdAt: '2 недели назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 4,
      title: 'Закулисье студии',
      preview: 'Хочу показать вам, как проходит процесс записи...',
      content: 'Хочу показать вам, как проходит процесс записи нового материала. Это всегда магия и вдохновение! Работаем днем и ночью, чтобы создать идеальный звук.',
      coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
      date: '2026-01-05',
      publishDate: new Date('2026-01-05').toISOString(),
      status: 'draft' as NewsStatus,
      views: 0,
      likes: 0,
      comments: 0,
      isPaid: false,
      createdAt: '3 недели назад',
      artist: 'Demo Artist',
      userId
    },
    {
      id: 5,
      title: 'Новый мерч уже в продаже',
      preview: 'Запустили линейку официального мерча с новым дизайном...',
      content: 'Запустили линейку официального мерча с новым дизайном! Футболки, худи, кепки - все с эксклюзивным оформлением. Заказывайте на нашем сайте!',
      coverImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      date: '2026-01-01',
      publishDate: new Date('2026-01-01').toISOString(),
      status: 'rejected' as NewsStatus,
      rejectionReason: 'Изображение не соответствует требованиям. Минимальное разрешение: 800x450px. Рекомендуем использовать горизонтальные изображения в соотношении 1.91:1 для лучшего отображения в социальных сетях.',
      views: 0,
      likes: 0,
      comments: 0,
      isPaid: false,
      createdAt: '1 месяц назад',
      artist: 'Demo Artist',
      userId
    },
  ];

  // Используем новости пользователя или демо-данные
  const newsItems = userNews.length > 0 ? userNews : demoNews;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<NewsStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
  });

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isValidatingImage, setIsValidatingImage] = useState(false);
  const [imageValidation, setImageValidation] = useState<ImageValidationResult | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Фильтрация новостей
  const filteredNews = newsItems.filter(news => {
    const matchesStatus = filterStatus === 'all' || news.status === filterStatus;
    const matchesSearch = 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Статистика
  const stats = {
    total: newsItems.length,
    approved: newsItems.filter(n => n.status === 'approved').length,
    pending: newsItems.filter(n => n.status === 'pending').length,
    rejected: newsItems.filter(n => n.status === 'rejected').length,
    draft: newsItems.filter(n => n.status === 'draft').length,
    totalViews: newsItems.reduce((sum, n) => sum + n.views, 0),
    totalLikes: newsItems.reduce((sum, n) => sum + n.likes, 0),
    totalComments: newsItems.reduce((sum, n) => sum + n.comments, 0),
  };

  // Загрузка изображения
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidatingImage(true);
    setCoverImageFile(file);

    // Создание превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Валидация
    const validation = await validateNewsImage(file);
    setImageValidation(validation);
    if (validation.width && validation.height) {
      setImageDimensions({ width: validation.width, height: validation.height });
    }
    setIsValidatingImage(false);
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    setIsValidatingImage(true);
    setCoverImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    const validation = await validateNewsImage(file);
    setImageValidation(validation);
    if (validation.width && validation.height) {
      setImageDimensions({ width: validation.width, height: validation.height });
    }
    setIsValidatingImage(false);
  };

  // Создание новости
  const handleCreateNews = async (isDraft: boolean = false) => {
    if (!createForm.title || !createForm.content) {
      alert('Заполните название и текст новости');
      return;
    }

    if (!coverImagePreview) {
      alert('Загрузите обложку новости');
      return;
    }

    if (imageValidation && !imageValidation.isValid && !isDraft) {
      alert('Исправьте ошибки в изображении перед отправкой на модерацию');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Симуляция загрузки
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setUploadProgress(i);
    }

    const preview = createForm.content.slice(0, 100) + (createForm.content.length > 100 ? '...' : '');
    
    const newNewsData: Omit<NewsItem, 'id' | 'publishDate'> = {
      title: createForm.title,
      content: createForm.content,
      preview: preview,
      coverImage: coverImagePreview,
      date: new Date().toISOString().split('T')[0],
      status: isDraft ? 'draft' : 'pending',
      views: 0,
      likes: 0,
      comments: 0,
      isPaid: false,
      createdAt: 'Только что',
      artist: 'Demo Artist',
      userId
    };

    addNews(newNewsData);
    setShowCreateModal(false);
    resetForm();
  };

  // Сброс формы
  const resetForm = () => {
    setCreateForm({ title: '', content: '' });
    setCoverImagePreview(null);
    setCoverImageFile(null);
    setImageValidation(null);
    setImageDimensions(null);
    setIsUploading(false);
    setUploadProgress(0);
    setShowRecommendations(false);
  };

  // Просмотр новости
  const handleViewNews = (news: NewsItem) => {
    setSelectedNews(news);
    setShowViewModal(true);
  };

  // Удаление новости
  const handleDeleteNews = (newsId: number) => {
    if (confirm('Вы уверены, что хотите удалить эту новость?')) {
      deleteNews(newsId);
    }
  };

  // Публикация черновика (отправка на модерацию)
  const handlePublishDraft = (newsId: number) => {
    updateNewsItem(newsId, { 
      status: 'pending', 
      date: new Date().toISOString().split('T')[0] 
    });
  };

  // Оплата продвижения
  const handlePayPromotion = (news: NewsItem) => {
    setSelectedNews(news);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedNews) return;

    const cost = 1500; // Стоимость продвижения новости в коинах
    
    if (userCoins < cost) {
      alert('Недостаточно коинов!');
      return;
    }

    onCoinsUpdate(userCoins - cost);
    
    // Обновляем новость в контексте
    updateNewsItem(selectedNews.id, { isPaid: true });

    setShowPaymentModal(false);
    setSelectedNews(null);
  };

  // Получение конфига статуса
  const getStatusConfig = (status: NewsStatus) => {
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

  const recommendations = getNewsImageRecommendations();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:gap-4"
      >
        {/* Title and Coins */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">Мои новости</h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg">Делитесь новостями с фанатами</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 flex-1 sm:flex-initial">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">{(userCoins || 0).toLocaleString()}</span>
              <span className="text-gray-400 text-xs sm:text-sm hidden xs:inline">коинов</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial whitespace-nowrap"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Создать</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats - Adaptive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs mb-1 sm:mb-2">Всего</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.total}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-green-500/10 border border-green-400/30 hover:bg-green-500/20 transition-all duration-300"
        >
          <div className="text-green-400 text-xs mb-1 sm:mb-2">Одобрено</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.approved}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/30 hover:bg-yellow-500/20 transition-all duration-300"
        >
          <div className="text-yellow-400 text-xs mb-1 sm:mb-2 line-clamp-1">Модерация</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.pending}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-gray-500/10 border border-gray-400/30 hover:bg-gray-500/20 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs mb-1 sm:mb-2">Черновики</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.draft}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-gray-400 text-xs mb-1 sm:mb-2">Просмотры</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalViews || 0).toLocaleString()}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-pink-500/10 border border-pink-400/30 hover:bg-pink-500/20 transition-all duration-300"
        >
          <div className="text-pink-400 text-xs mb-1 sm:mb-2">Лайки</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalLikes || 0).toLocaleString()}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20 transition-all duration-300"
        >
          <div className="text-blue-400 text-xs mb-1 sm:mb-2 line-clamp-1">Комменты</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{(stats.totalComments || 0).toLocaleString()}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-red-500/10 border border-red-400/30 hover:bg-red-500/20 transition-all duration-300"
        >
          <div className="text-red-400 text-xs mb-1 sm:mb-2">Отклонено</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.rejected}</div>
        </motion.div>
      </div>

      {/* Filters - Fully Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-2 sm:gap-3 md:gap-4"
      >
        {/* Search */}
        <div className="w-full relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск новостей..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-orange-400/50 transition-all duration-300"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as NewsStatus | 'all')}
            className="w-full appearance-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:border-orange-400/50 transition-all duration-300 cursor-pointer pr-10"
          >
            <option value="all">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
          <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* News Grid - Fully Adaptive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
      >
        {filteredNews.length === 0 ? (
          <div className="col-span-full p-8 sm:p-10 md:p-12 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <Calendar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-3 sm:mb-4">
              {searchQuery ? 'Новости не найдены' : 'У вас пока нет новостей'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-semibold transition-all duration-300 text-sm sm:text-base"
              >
                Создать первую новость
              </motion.button>
            )}
          </div>
        ) : (
          filteredNews.map((news, index) => {
            const statusConfig = getStatusConfig(news.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Cover Image - Adaptive Height */}
                <div className="relative h-40 sm:h-44 md:h-48 lg:h-56 overflow-hidden">
                  <ImageWithFallback
                    src={news.coverImage}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status Badge - Adaptive */}
                  <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg ${statusConfig.bg} border ${statusConfig.border} backdrop-blur-sm`}>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <StatusIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${statusConfig.color}`} />
                      <span className={`text-[10px] sm:text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Promotion Badge - Adaptive */}
                  {news.isPaid && news.status === 'approved' && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 backdrop-blur-sm">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
                        <span className="text-[10px] sm:text-xs font-semibold text-yellow-400">
                          Продвигается
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Date - Adaptive */}
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                    <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-orange-500/30 border border-orange-400/40 backdrop-blur-sm inline-block">
                      <span className="text-white text-xs sm:text-sm font-bold">{formatDate(news.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Content - Adaptive Padding */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                  <h3 className="text-white font-bold text-base sm:text-lg md:text-xl mb-1 sm:mb-2 line-clamp-2 leading-tight">{news.title}</h3>
                  
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-3 flex-1 leading-relaxed">{news.preview}</p>

                  {/* Stats - Adaptive */}
                  {news.status === 'approved' && (
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-400 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-[10px] sm:text-xs md:text-sm">{(news.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-[10px] sm:text-xs md:text-sm">{(news.likes || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-[10px] sm:text-xs md:text-sm">{(news.comments || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason - Adaptive */}
                  {news.status === 'rejected' && news.rejectionReason && (
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-400/30">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-red-400 text-[10px] sm:text-xs leading-relaxed">{news.rejectionReason}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions - Fully Adaptive */}
                  <div className="flex items-center gap-1.5 sm:gap-2 pt-2">
                    {news.status === 'draft' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePublishDraft(news.id)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Send className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden xs:inline">Модерация</span>
                        <span className="xs:hidden">→</span>
                      </motion.button>
                    )}
                    
                    {news.status === 'approved' && !news.isPaid && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePayPromotion(news)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Coins className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Продвижение</span>
                        <span className="sm:hidden">Промо</span>
                      </motion.button>
                    )}

                    {news.status === 'approved' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewNews(news)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Читать</span>
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteNews(news.id)}
                      className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* CREATE MODAL - Fully Responsive */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              if (!isUploading) {
                setShowCreateModal(false);
                resetForm();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 shadow-2xl overflow-hidden"
            >
              {/* Header - Adaptive */}
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">Создать новость</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!isUploading) {
                      setShowCreateModal(false);
                      resetForm();
                    }
                  }}
                  disabled={isUploading}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </motion.button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Image Upload - Adaptive */}
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <label className="block text-gray-300 text-sm sm:text-base md:text-lg font-semibold">
                        Обложка новости *
                      </label>
                      <button
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm md:text-base flex items-center gap-1 transition-colors"
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Требования</span>
                      </button>
                    </div>

                    {/* Recommendations - Collapsible */}
                    <AnimatePresence>
                      {showRecommendations && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-400/30 overflow-hidden"
                        >
                          <div className="text-orange-400 font-semibold mb-2 text-xs sm:text-sm md:text-base">{recommendations.title}</div>
                          <ul className="text-gray-300 text-[10px] sm:text-xs md:text-sm space-y-0.5 sm:space-y-1">
                            {recommendations.items.map((item, i) => (
                              <li key={i} className="leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Upload Area - Adaptive */}
                    {!coverImagePreview ? (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="relative border-2 border-dashed border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center cursor-pointer hover:border-orange-400/50 hover:bg-white/5 transition-all duration-300"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <Upload className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Нажмите или перетащите изображение</p>
                        <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm">JPEG, PNG или WebP, до 5 MB</p>
                        <p className="text-gray-400 text-[10px] sm:text-xs mt-1 sm:mt-2">Рекомендуется: 1200x630px</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {/* Preview - Adaptive */}
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black/20">
                          <img
                            src={coverImagePreview}
                            alt="Preview"
                            className="w-full h-auto"
                          />
                          <button
                            onClick={() => {
                              setCoverImagePreview(null);
                              setCoverImageFile(null);
                              setImageValidation(null);
                              setImageDimensions(null);
                            }}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </button>
                          
                          {/* Dimensions Badge - Adaptive */}
                          {imageDimensions && (
                            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-black/60 backdrop-blur-sm">
                              <span className="text-white text-[10px] sm:text-xs font-semibold">
                                {imageDimensions.width}×{imageDimensions.height}px
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Validation Messages - Adaptive */}
                        {isValidatingImage && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300 text-xs sm:text-sm">
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            Проверка изображения...
                          </div>
                        )}

                        {imageValidation && !isValidatingImage && (
                          <div className="space-y-1.5 sm:space-y-2">
                            {/* Errors */}
                            {imageValidation.errors.length > 0 && (
                              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-400/30">
                                {imageValidation.errors.map((error, i) => (
                                  <div key={i} className="flex items-start gap-1.5 sm:gap-2 text-red-400 text-[10px] sm:text-xs leading-relaxed">
                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Warnings */}
                            {imageValidation.warnings.length > 0 && (
                              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-yellow-500/10 border border-yellow-400/30">
                                {imageValidation.warnings.map((warning, i) => (
                                  <div key={i} className="flex items-start gap-1.5 sm:gap-2 text-yellow-400 text-[10px] sm:text-xs leading-relaxed">
                                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                                    <span>{warning}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Success */}
                            {imageValidation.isValid && imageValidation.warnings.length === 0 && (
                              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-green-500/10 border border-green-400/30">
                                <div className="flex items-center gap-1.5 sm:gap-2 text-green-400 text-xs sm:text-sm">
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                  Изображение соответствует всем требованиям!
                                </div>
                              </div>
                            )}

                            {/* File Info */}
                            {coverImageFile && (
                              <div className="text-gray-400 text-[10px] sm:text-xs">
                                Размер файла: {formatFileSize(coverImageFile.size)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title - Adaptive */}
                  <div>
                    <label className="block text-gray-300 text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 font-semibold">
                      Заголовок *
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="Введите заголовок новости"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-orange-400/50 transition-all duration-300"
                      disabled={isUploading}
                    />
                  </div>

                  {/* Content - Adaptive */}
                  <div>
                    <label className="block text-gray-300 text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 font-semibold">
                      Текст новости *
                    </label>
                    <textarea
                      value={createForm.content}
                      onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                      placeholder="Напишите текст вашей новости..."
                      rows={6}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-orange-400/50 transition-all duration-300 resize-none"
                      disabled={isUploading}
                    />
                    <div className="text-gray-400 text-[10px] sm:text-xs mt-1 sm:mt-2">
                      {createForm.content.length} символов
                    </div>
                  </div>

                  {/* Upload Progress - Adaptive */}
                  {isUploading && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-300">Загрузка...</span>
                        <span className="text-orange-400 font-semibold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer - Adaptive Buttons */}
              <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreateNews(true)}
                    disabled={isUploading}
                    className="flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="hidden xs:inline">Сохранить черновик</span>
                    <span className="xs:hidden">Черновик</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreateNews(false)}
                    disabled={isUploading || (imageValidation && !imageValidation.isValid)}
                    className="flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-red-600 text-xs sm:text-sm md:text-base"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="hidden xs:inline">На модерацию</span>
                    <span className="xs:hidden">Отправить</span>
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={isUploading}
                  className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW MODAL - Fully Responsive */}
      <AnimatePresence>
        {showViewModal && selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 shadow-2xl overflow-hidden"
            >
              {/* Header - Adaptive */}
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white truncate">Просмотр новости</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowViewModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </motion.button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* Cover Image - Adaptive Height */}
                <div className="relative h-48 sm:h-56 md:h-64 lg:h-80">
                  <ImageWithFallback
                    src={selectedNews.coverImage}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Article Content - Adaptive Padding */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-orange-400 text-xs sm:text-sm mb-3 sm:mb-4">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formatDate(selectedNews.date)}
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight">
                    {selectedNews.title}
                  </h1>

                  <div className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-5 md:mb-6 whitespace-pre-wrap">
                    {selectedNews.content}
                  </div>

                  {/* Stats - Adaptive */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      <span className="font-semibold text-sm sm:text-base">{(selectedNews.views || 0).toLocaleString()}</span>
                      <span className="text-xs sm:text-sm text-gray-400 hidden xs:inline">просмотров</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      <span className="font-semibold text-sm sm:text-base">{(selectedNews.likes || 0).toLocaleString()}</span>
                      <span className="text-xs sm:text-sm text-gray-400 hidden xs:inline">лайков</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      <span className="font-semibold text-sm sm:text-base">{(selectedNews.comments || 0).toLocaleString()}</span>
                      <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">комментариев</span>
                      <span className="text-xs sm:text-sm text-gray-400 sm:hidden hidden xs:inline">коммент.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Adaptive */}
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-white/10 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base"
                >
                  Закрыть
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL - Fully Responsive */}
      <AnimatePresence>
        {showPaymentModal && selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-4 sm:p-5 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-400/30 shadow-2xl max-h-[95vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white">Продвижение</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPaymentModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </motion.button>
              </div>

              {/* News Info - Adaptive */}
              <div className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 mb-3 sm:mb-4 md:mb-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-14 rounded-md sm:rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={selectedNews.coverImage}
                      alt={selectedNews.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1 line-clamp-2 leading-tight">{selectedNews.title}</div>
                    <div className="text-gray-400 text-[10px] sm:text-xs md:text-sm">{formatDate(selectedNews.date)}</div>
                  </div>
                </div>
              </div>

              {/* Payment Details - Adaptive */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-4 md:mb-6">
                <div className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5">
                  <span className="text-gray-300 text-xs sm:text-sm md:text-base">Стоимость:</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-white font-bold text-base sm:text-lg md:text-xl">1,500</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5">
                  <span className="text-gray-300 text-xs sm:text-sm md:text-base">Ваш баланс:</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-white font-bold text-base sm:text-lg md:text-xl">{(userCoins || 0).toLocaleString()}</span>
                  </div>
                </div>

                {userCoins < 1500 && (
                  <div className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-400/30">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-red-400 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                        Недостаточно коинов! Пополните баланс в разделе "Коины"
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-400/30">
                  <div className="text-orange-400 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Что включено:</div>
                  <ul className="text-gray-300 text-[10px] sm:text-xs md:text-sm space-y-0.5 sm:space-y-1 leading-relaxed">
                    <li>✓ Размещение на главной странице promo.music</li>
                    <li>✓ Приоритет в поисковой выдаче</li>
                    <li>✓ Рассылка подписчикам</li>
                    <li>✓ Расширенная аналитика просмотров</li>
                    <li>✓ Продвижение в соцсетях платформы</li>
                  </ul>
                </div>
              </div>

              {/* Actions - Adaptive */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: userCoins >= 1500 ? 1.02 : 1 }}
                  whileTap={{ scale: userCoins >= 1500 ? 0.98 : 1 }}
                  onClick={confirmPayment}
                  disabled={userCoins < 1500}
                  className={`w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base ${
                    userCoins >= 1500
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg shadow-yellow-500/20'
                      : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span>Оплатить 1,500 коинов</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
