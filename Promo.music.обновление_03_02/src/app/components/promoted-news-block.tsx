import { Newspaper, Eye, Heart, MessageCircle, ExternalLink, TrendingUp, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  preview: string;
  coverImage: string;
  date: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  isPaid: boolean;
  createdAt: string;
}

interface PromotedNewsBlockProps {
  newsItems: NewsItem[];
}

export function PromotedNewsBlock({ newsItems }: PromotedNewsBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Фильтруем только одобренные и оплаченные новости
  const promotedNews = newsItems.filter(news => news.status === 'approved' && news.isPaid);

  // Автоматическая ротация каждые 6 секунд
  useEffect(() => {
    if (promotedNews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotedNews.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [promotedNews.length]);

  if (promotedNews.length === 0) return null;

  const currentNews = promotedNews[currentIndex];

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 overflow-hidden shadow-xl shadow-orange-500/10"
    >
      {/* Header - Adaptive */}
      <div className="p-3 sm:p-4 md:p-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-xs sm:text-sm md:text-base truncate">Новость артиста</h3>
              <p className="text-gray-400 text-[10px] sm:text-xs">Продвигается</p>
            </div>
          </div>
          {promotedNews.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {promotedNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-orange-400 w-5 sm:w-6'
                      : 'bg-white/20 hover:bg-white/40 w-1.5 sm:w-2'
                  }`}
                  aria-label={`Перейти к новости ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content - Fully Adaptive */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNews.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4"
        >
          {/* Cover Image - Adaptive Height */}
          <div className="relative h-36 sm:h-40 md:h-48 rounded-xl sm:rounded-2xl overflow-hidden group">
            <ImageWithFallback
              src={currentNews.coverImage}
              alt={currentNews.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Date Badge - Adaptive */}
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
              <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-orange-500/80 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  <span className="text-white text-[10px] sm:text-xs font-bold">{formatDate(currentNews.date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title - Adaptive */}
          <h4 className="text-white font-bold text-sm sm:text-base md:text-lg line-clamp-2 leading-tight">
            {currentNews.title}
          </h4>

          {/* Preview - Adaptive */}
          <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-3 leading-relaxed">
            {currentNews.preview}
          </p>

          {/* Stats - Adaptive */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-400 pt-2 border-t border-white/10">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm">{currentNews.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm">{currentNews.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm">{currentNews.comments.toLocaleString()}</span>
            </div>
          </div>

          {/* Read More Button - Adaptive */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-orange-500/20 text-xs sm:text-sm md:text-base"
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            Читать новость
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}