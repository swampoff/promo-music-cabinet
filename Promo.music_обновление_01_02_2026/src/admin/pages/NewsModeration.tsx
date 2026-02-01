/**
 * NEWS MODERATION - Расширенная страница модерации новостей
 * Максимальный адаптив + полный функционал + логика
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, CheckCircle, XCircle, Eye, Clock, Filter, Search, 
  ThumbsUp, ThumbsDown, AlertCircle, X, Heart, MessageCircle,
  ChevronDown, ChevronUp, User, TrendingUp, Grid, List, SlidersHorizontal,
  CheckSquare, Tag, Calendar, Image, ExternalLink, Share2, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { useData, type News as GlobalNews } from '@/contexts/DataContext';

// Локальный интерфейс для UI (расширяет глобальный)
interface NewsItem extends GlobalNews {
  author?: string;
  authorAvatar?: string;
  category?: string;
  cover?: string;
  uploadDate?: string;
}

type ViewMode = 'cards' | 'list';
type SortBy = 'date' | 'author' | 'likes' | 'title';

export function NewsModeration() {
  const { 
    news: allNews, 
    getPendingNews, 
    updateNews,
    addTransaction,
    addNotification
  } = useData();
  
  // ==================== STATE ====================
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [selectedNewsItems, setSelectedNewsItems] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // ==================== DEMO DATA ====================
  const demoNews: NewsItem[] = [
    {
      id: 1,
      title: 'Новый альбом "Summer Vibes" выходит в феврале 2026',
      author: 'Александр Иванов',
      authorAvatar: 'https://i.pravatar.cc/150?img=12',
      category: 'Анонс',
      uploadDate: '2026-01-29T14:30:00',
      status: 'pending',
      likes: 0,
      comments: 0,
      views: 0,
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      content: 'Рад объявить, что мой новый альбом "Summer Vibes" выйдет 15 февраля 2026! Это был долгий путь создания этой музыки, и я не могу дождаться, чтобы поделиться ею с вами. В альбом войдут 12 треков, включая уже известные хиты и абсолютно новые композиции. Мы работали над этим проектом больше года, и каждая песня наполнена эмоциями и историями.',
      userId: 'user_123',
      isPaid: false,
    },
    {
      id: 2,
      title: 'За кулисами записи нового сингла "Midnight Dreams"',
      author: 'Мария Петрова',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      category: 'Студия',
      uploadDate: '2026-01-29T10:15:00',
      status: 'pending',
      likes: 0,
      comments: 0,
      views: 0,
      cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
      content: 'Провела целую неделю в студии, работая над новым синглом "Midnight Dreams". Процесс был интенсивным, но результат того стоит! Хочу поделиться с вами некоторыми моментами из студии. Это один из самых личных треков, который я когда-либо писала.',
      userId: 'user_456',
      isPaid: true,
    },
    {
      id: 3,
      title: 'Тур "Urban Beat" по России: объявлены новые даты',
      author: 'Дмитрий Соколов',
      authorAvatar: 'https://i.pravatar.cc/150?img=33',
      category: 'Концерты',
      uploadDate: '2026-01-28T16:45:00',
      status: 'approved',
      likes: 247,
      comments: 38,
      views: 1542,
      cover: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      content: 'Объявляю новые даты тура "Urban Beat"! Посетим 15 городов России с марта по июнь 2026. Билеты уже в продаже на всех площадках. Это будет грандиозное шоу с новой программой и спецэффектами!',
      userId: 'user_789',
      isPaid: true,
      moderationNote: 'Отличная новость, одобрено',
    },
    {
      id: 4,
      title: 'Моё мнение о текущем состоянии музыкальной индустрии',
      author: 'Сергей Волков',
      authorAvatar: 'https://i.pravatar.cc/150?img=68',
      category: 'Мнение',
      uploadDate: '2026-01-27T09:20:00',
      status: 'rejected',
      likes: 0,
      comments: 0,
      views: 0,
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      moderationNote: 'Содержит оскорбительные высказывания в адрес других артистов и нецензурную лексику',
      content: 'Хочу высказаться о том, что происходит в музыкальной индустрии...',
      userId: 'user_101',
      isPaid: false,
    },
    {
      id: 5,
      title: 'Коллаборация с международными артистами - первые детали',
      author: 'Александр Иванов',
      authorAvatar: 'https://i.pravatar.cc/150?img=12',
      category: 'Коллаборация',
      uploadDate: '2026-01-26T11:10:00',
      status: 'pending',
      likes: 0,
      comments: 0,
      views: 0,
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      content: 'Работаю над новым треком с несколькими зарубежными артистами. Скоро расскажу подробнее! Это будет нечто особенное. Сейчас идёт активная работа в студии, и я очень взволнован результатом.',
      userId: 'user_123',
      isPaid: true,
    },
    {
      id: 6,
      title: 'Награда "Лучший артист года" - спасибо за поддержку!',
      author: 'Анна Смирнова',
      authorAvatar: 'https://i.pravatar.cc/150?img=9',
      category: 'Награды',
      uploadDate: '2026-01-25T15:00:00',
      status: 'approved',
      likes: 892,
      comments: 124,
      views: 3456,
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      content: 'Вчера получила награду "Лучший артист года"! Это невероятная честь и ваша заслуга. Спасибо каждому, кто поддерживал меня на этом пути. Без вас этого не было бы!',
      userId: 'user_202',
      isPaid: false,
    },
    {
      id: 7,
      title: 'Благотворительный концерт в поддержку детских домов',
      author: 'Оркестр "Гармония"',
      authorAvatar: 'https://i.pravatar.cc/150?img=14',
      category: 'Благотворительность',
      uploadDate: '2026-01-24T12:30:00',
      status: 'pending',
      likes: 0,
      comments: 0,
      views: 0,
      cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
      content: '5 февраля состоится благотворительный концерт в поддержку детских домов. Все средства от продажи билетов пойдут на помощь детям. Приглашаем всех неравнодушных!',
      userId: 'user_303',
      isPaid: false,
    },
  ];

  // ==================== COMPUTED ====================
  const news: NewsItem[] = useMemo(() => {
    return allNews.length > 0 ? allNews as NewsItem[] : demoNews;
  }, [allNews]);

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(news.map(n => n.category || 'Без категории'))];
    return ['all', ...categories];
  }, [news]);

  const filteredAndSortedNews = useMemo(() => {
    let result = news.filter(item => {
      const matchesFilter = filter === 'all' || item.status === filter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesCategory && matchesSearch;
    });

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.uploadDate || b.createdAt).getTime() - new Date(a.uploadDate || a.createdAt).getTime();
          break;
        case 'author':
          comparison = (a.author || '').localeCompare(b.author || '');
          break;
        case 'likes':
          comparison = b.likes - a.likes;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [news, filter, categoryFilter, searchQuery, sortBy, sortOrder]);

  // ==================== STATS ====================
  const stats = useMemo(() => ({
    total: news.length,
    pending: news.filter(n => n.status === 'pending').length,
    approved: news.filter(n => n.status === 'approved').length,
    rejected: news.filter(n => n.status === 'rejected').length,
    totalLikes: news.reduce((sum, n) => sum + n.likes, 0),
  }), [news]);

  // ==================== HANDLERS ====================
  const handleApprove = (newsId: number, note?: string) => {
    const newsItem = news.find(n => n.id === newsId);
    if (!newsItem) {
      toast.error('Новость не найдена');
      return;
    }

    // Проверка на demo
    const isRealNews = allNews.some(n => n.id === newsId);
    if (!isRealNews) {
      toast.error('Невозможно модерировать демо-новость', {
        description: 'Это демонстрационная новость для примера'
      });
      return;
    }

    try {
      updateNews(newsId, { 
        status: 'approved' as any,
        moderationNote: note || 'Новость одобрена модератором',
      });

      // Списание за платное размещение (если применимо)
      if (newsItem.isPaid) {
        addTransaction({
          userId: newsItem.userId,
          type: 'expense',
          amount: -3000,
          description: `Размещение новости: ${newsItem.title}`,
          status: 'completed',
        });
      }

      addNotification({
        userId: newsItem.userId,
        type: 'news_approved',
        title: '✅ Новость одобрена!',
        message: `Ваша новость "${newsItem.title}" успешно прошла модерацию и опубликована.${newsItem.isPaid ? ' Списано ₽3,000 за размещение.' : ''}`,
        read: false,
        relatedId: newsId,
        relatedType: 'news',
      });

      toast.success('Новость одобрена!', {
        description: newsItem.isPaid 
          ? `Новость опубликована. Списано ₽3,000` 
          : 'Новость опубликована и доступна пользователям',
      });

      setSelectedNews(null);
      setModerationNote('');
      setSelectedNewsItems(prev => {
        const next = new Set(prev);
        next.delete(newsId);
        return next;
      });
    } catch (error) {
      console.error('Error approving news:', error);
      toast.error('Ошибка при одобрении новости', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleReject = (newsId: number, note: string) => {
    if (!note.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    const newsItem = news.find(n => n.id === newsId);
    if (!newsItem) {
      toast.error('Новость не найдена');
      return;
    }

    const isRealNews = allNews.some(n => n.id === newsId);
    if (!isRealNews) {
      toast.error('Невозможно модерировать демо-новость', {
        description: 'Это демонстрационная новость для примера'
      });
      return;
    }

    try {
      updateNews(newsId, {
        status: 'rejected' as any,
        moderationNote: note,
      });

      addNotification({
        userId: newsItem.userId,
        type: 'news_rejected',
        title: '❌ Новость отклонена',
        message: `Ваша новость "${newsItem.title}" не прошла модерацию. Причина: ${note}`,
        read: false,
        relatedId: newsId,
        relatedType: 'news',
      });

      toast.error('Новость отклонена', {
        description: 'Автор получит уведомление с причиной отклонения',
      });

      setSelectedNews(null);
      setModerationNote('');
      setSelectedNewsItems(prev => {
        const next = new Set(prev);
        next.delete(newsId);
        return next;
      });
    } catch (error) {
      console.error('Error rejecting news:', error);
      toast.error('Ошибка при отклонении новости', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const handleBulkApprove = () => {
    const count = selectedNewsItems.size;
    selectedNewsItems.forEach(id => handleApprove(id, 'Массовое одобрение'));
    toast.success(`Одобрено новостей: ${count}`);
    setSelectedNewsItems(new Set());
  };

  const handleBulkReject = () => {
    if (!moderationNote.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    const count = selectedNewsItems.size;
    selectedNewsItems.forEach(id => handleReject(id, moderationNote));
    toast.error(`Отклонено новостей: ${count}`);
    setSelectedNewsItems(new Set());
    setModerationNote('');
  };

  const toggleNewsSelection = (newsId: number) => {
    setSelectedNewsItems(prev => {
      const next = new Set(prev);
      if (next.has(newsId)) {
        next.delete(newsId);
      } else {
        next.add(newsId);
      }
      return next;
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return 'На модерации';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Анонс': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Студия': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Концерты': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Мнение': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Коллаборация': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Награды': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Благотворительность': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-3 md:space-y-6 px-3 md:px-0">
      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-2xl border border-white/10 p-3 md:p-6"
      >
        {/* Title & Stats */}
        <div className="flex flex-col gap-3 mb-3 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-lg md:rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex-shrink-0">
              <FileText className="w-5 h-5 md:w-8 md:h-8 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-3xl font-bold text-white truncate">Модерация новостей</h1>
              <p className="text-xs md:text-base text-gray-400 truncate">Проверяйте и одобряйте публикации</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-xs text-gray-400">Ожидают</div>
              <div className="text-base md:text-xl font-bold text-yellow-400">{stats.pending}</div>
            </div>
            <div className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-xs text-gray-400">Одобрено</div>
              <div className="text-base md:text-xl font-bold text-green-400">{stats.approved}</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {allNews.length === 0 && (
          <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Демонстрационные новости</h3>
              <p className="text-xs text-gray-300">
                Сейчас отображаются только демо-новости для примера UI. Чтобы протестировать функционал модерации, 
                перейдите в <strong>Кабинет артиста → Мои новости</strong> и создайте реальную публикацию.
              </p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white text-sm md:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 md:gap-2 flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Фильтры</span>
              {showFilters ? <ChevronUp className="w-3 h-3 md:w-4 md:h-4" /> : <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />}
            </button>

            {/* View Toggle */}
            <div className="flex gap-0.5 md:gap-1 p-0.5 md:p-1 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 md:p-2 rounded transition-all ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 md:p-2 rounded transition-all ${viewMode === 'cards' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Status Filter - Mobile Optimized */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType as any)}
                      className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-base font-medium transition-all ${
                        filter === filterType
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {filterType === 'all' && 'Все'}
                      {filterType === 'pending' && `Ожидают (${stats.pending})`}
                      {filterType === 'approved' && `Одобрено (${stats.approved})`}
                      {filterType === 'rejected' && `Отклонено (${stats.rejected})`}
                    </button>
                  ))}
                </div>

                {/* Category & Sort - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex-1 px-2.5 md:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">Все категории</option>
                    {uniqueCategories.filter(c => c !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="flex-1 px-2.5 md:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="date">По дате</option>
                    <option value="author">По автору</option>
                    <option value="likes">По лайкам</option>
                    <option value="title">По названию</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 md:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    {sortOrder === 'desc' ? <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                    <span className="text-sm md:text-base">{sortOrder === 'desc' ? 'Убыв.' : 'Возр.'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedNewsItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="text-white font-medium">
                Выбрано: <strong>{selectedNewsItems.size}</strong> {selectedNewsItems.size === 1 ? 'новость' : 'новостей'}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleBulkApprove}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <CheckCircle className="w-4 h-4" />
                Одобрить все
              </button>
              <button
                onClick={handleBulkReject}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <XCircle className="w-4 h-4" />
                Отклонить все
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ==================== NEWS LIST ==================== */}
      {filteredAndSortedNews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Новости не найдены</h3>
          <p className="text-gray-400">Попробуйте изменить фильтры или параметры поиска</p>
        </motion.div>
      ) : viewMode === 'cards' ? (
        // ==================== CARDS VIEW ====================
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAndSortedNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all group"
            >
              {/* Cover */}
              <div className="relative aspect-video">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Checkbox */}
                <button
                  onClick={() => toggleNewsSelection(item.id)}
                  className="absolute top-2 left-2 w-6 h-6 rounded border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-blue-500/50 transition-all z-10"
                >
                  {selectedNewsItems.has(item.id) && (
                    <CheckSquare className="w-5 h-5 text-blue-400" />
                  )}
                </button>

                {/* Category */}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getCategoryColor(item.category || '')}`}>
                  {item.category}
                </span>

                {/* Status */}
                <span className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
              </div>

              {/* Content */}
              <div className="p-3 md:p-4">
                <h3 className="text-sm md:text-base font-bold text-white mb-1.5 md:mb-2 line-clamp-2 break-words">{item.title}</h3>
                
                <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 min-w-0">
                  {item.authorAvatar && (
                    <img
                      src={item.authorAvatar}
                      alt={item.author}
                      className="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0"
                    />
                  )}
                  <span className="text-xs md:text-sm text-gray-400 truncate">{item.author}</span>
                </div>

                <p className="text-xs text-gray-500 mb-2 md:mb-3 line-clamp-2 break-words">{item.content}</p>

                <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 mb-2 md:mb-3">
                  <span className="flex items-center gap-0.5 md:gap-1">
                    <Heart className="w-3 h-3" />
                    {item.likes}
                  </span>
                  <span className="flex items-center gap-0.5 md:gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {item.comments}
                  </span>
                  <span className="flex items-center gap-0.5 md:gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views}
                  </span>
                </div>

                {item.moderationNote && (
                  <div className="mb-2 md:mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-300 line-clamp-2 break-words">{item.moderationNote}</p>
                  </div>
                )}

                {/* Actions */}
                {item.status === 'pending' && (
                  <div className="flex gap-1.5 md:gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Одобрить</span>
                      <span className="sm:hidden">✓</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNews(item);
                        setModerationNote('');
                      }}
                      className="flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <XCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Отклонить</span>
                      <span className="sm:hidden">✕</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // ==================== LIST VIEW ====================
        <div className="space-y-2 md:space-y-4">
          {filteredAndSortedNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all"
            >
              <div className="p-3 md:p-6">
                <div className="flex flex-col gap-3 md:gap-4">
                  {/* Mobile: Checkbox + Categories */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        onClick={() => toggleNewsSelection(item.id)}
                        className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded border-2 border-white/20 flex items-center justify-center hover:border-blue-500/50 transition-all"
                      >
                        {selectedNewsItems.has(item.id) && (
                          <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        )}
                      </button>

                      <span className={`px-2 py-0.5 md:py-1 rounded-lg border text-xs font-medium truncate ${getCategoryColor(item.category || '')}`}>
                        {item.category}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 md:py-1 rounded-lg border text-xs font-medium flex-shrink-0 ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>

                  {/* Cover + Content */}
                  <div className="flex gap-2.5 md:gap-4">
                    {/* Cover */}
                    <div className="relative group flex-shrink-0 w-24 md:w-48">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedNews(item)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 transition-all rounded-lg"
                      >
                        <Eye className="w-6 h-6 md:w-12 md:h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {/* News Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 line-clamp-2 break-words">
                        {item.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs text-gray-400 mb-1.5 md:mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[100px] md:max-w-none">{item.author}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{formatRelativeDate(item.uploadDate || item.createdAt)}</span>
                      </div>

                      <p className="text-xs text-gray-500 mb-2 line-clamp-2 hidden sm:block break-words">
                        {item.content}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5 md:gap-1">
                          <Heart className="w-3 h-3" />
                          {item.likes}
                        </span>
                        <span className="flex items-center gap-0.5 md:gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {item.comments}
                        </span>
                        <span className="flex items-center gap-0.5 md:gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views}
                        </span>
                      </div>

                      {/* Moderation Note */}
                      {item.moderationNote && (
                        <div className="mt-2 p-1.5 md:p-2 rounded bg-red-500/10 border border-red-500/20">
                          <div className="flex items-start gap-1.5 md:gap-2">
                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-300 line-clamp-2 break-words">{item.moderationNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1.5 text-xs md:text-base"
                      >
                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Одобрить</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNews(item);
                          setModerationNote('');
                        }}
                        className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5 text-xs md:text-base"
                      >
                        <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Отклонить</span>
                      </button>
                      <button
                        onClick={() => setSelectedNews(item)}
                        className="md:hidden px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ==================== MODERATION MODAL ==================== */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedNews(null);
              setModerationNote('');
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-lg border text-xs font-medium ${getCategoryColor(selectedNews.category || '')}`}>
                      {selectedNews.category}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-1.5 md:mb-2 break-words">{selectedNews.title}</h2>
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    {selectedNews.authorAvatar && (
                      <img
                        src={selectedNews.authorAvatar}
                        alt={selectedNews.author}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 min-w-0">
                      <span className="text-sm md:text-base text-gray-400 truncate">{selectedNews.author}</span>
                      <span className="hidden sm:inline text-gray-600">•</span>
                      <span className="text-xs md:text-sm text-gray-400">{formatRelativeDate(selectedNews.uploadDate || selectedNews.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedNews(null);
                    setModerationNote('');
                  }}
                  className="flex-shrink-0 p-1.5 md:p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover */}
              <div className="mb-4 md:mb-6">
                <img
                  src={selectedNews.cover}
                  alt={selectedNews.title}
                  className="w-full h-48 md:h-64 object-cover rounded-lg md:rounded-xl"
                />
              </div>

              {/* Content */}
              {selectedNews.content && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Содержание</h3>
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{selectedNews.content}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Категория</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedNews.category}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Лайки</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedNews.likes}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Комментарии</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedNews.comments}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Просмотры</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedNews.views}</p>
                </div>
              </div>

              {/* Moderation Actions */}
              {selectedNews.status === 'pending' && (
                <div className="space-y-4">
                  {/* Note Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Комментарий модератора
                    </label>
                    <textarea
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      placeholder="Укажите причину отклонения или оставьте комментарий..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  {/* Quick Rejection Reasons */}
                  <div>
                    <div className="text-sm font-medium text-gray-400 mb-3">Быстрые причины отклонения:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Оскорбительный контент',
                        'Нецензурная лексика',
                        'Нарушение авторских прав',
                        'Недостоверная информация',
                        'Некорректное изображение',
                      ].map((reason) => (
                        <button
                          key={reason}
                          onClick={() => setModerationNote(reason)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApprove(selectedNews.id, moderationNote || undefined)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Одобрить новость
                    </button>
                    <button
                      onClick={() => handleReject(selectedNews.id, moderationNote)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Отклонить новость
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
