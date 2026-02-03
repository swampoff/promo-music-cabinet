import { Calendar, MapPin, Ticket, ExternalLink, TrendingUp, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export interface PromotedConcert {
  id: number;
  title: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  type: string;
  description: string;
  banner: string;
  ticketPriceFrom: string;
  ticketPriceTo: string;
  ticketLink: string;
  views: number;
  clicks: number;
}

interface PromotedConcertsSidebarProps {
  concerts: PromotedConcert[];
  onConcertClick?: (concertId: number) => void;
}

export function PromotedConcertsSidebar({ concerts, onConcertClick }: PromotedConcertsSidebarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || concerts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % concerts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, concerts.length]);

  if (concerts.length === 0) {
    return (
      <div className="sticky top-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 text-center"
        >
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">Нет предстоящих концертов</h3>
          <p className="text-gray-400 text-sm">
            Скоро здесь появятся анонсы концертов
          </p>
        </motion.div>
      </div>
    );
  }

  const currentConcert = concerts[currentIndex];

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('ru-RU', { month: 'long' });
    const year = date.getFullYear();
    return { day, month, year };
  };

  const dateInfo = formatDate(currentConcert.date);

  // Обработка клика на баннер
  const handleBannerClick = () => {
    if (currentConcert.ticketLink) {
      window.open(currentConcert.ticketLink, '_blank');
    }
    onConcertClick?.(currentConcert.id);
  };

  return (
    <div className="sticky top-8 space-y-6">
      {/* Main Concert Banner */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 overflow-hidden group"
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">Предстоящие концерты</h3>
            </div>
            {concerts.length > 1 && (
              <div className="flex items-center gap-1">
                {concerts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-purple-400 w-6'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            {concerts.length} {concerts.length === 1 ? 'концерт' : 'концерта'} с продвижением
          </p>
        </div>

        {/* Banner Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentConcert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Banner Image */}
            <div
              onClick={handleBannerClick}
              className={`relative aspect-[2/3] overflow-hidden ${
                currentConcert.ticketLink ? 'cursor-pointer' : ''
              }`}
            >
              <ImageWithFallback
                src={currentConcert.banner}
                alt={currentConcert.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Promoted Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/40 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  <span className="text-xs font-bold text-yellow-400">ПРОДВИГАЕТСЯ</span>
                </div>
              </div>

              {/* Date Badge */}
              <div className="absolute top-4 right-4">
                <div className="px-4 py-3 rounded-xl bg-purple-500/40 border border-purple-400/50 backdrop-blur-md text-center">
                  <div className="text-3xl font-bold text-white leading-none mb-1">
                    {dateInfo.day}
                  </div>
                  <div className="text-xs text-purple-200 uppercase font-semibold">
                    {dateInfo.month}
                  </div>
                </div>
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {/* Title */}
                <h4 className="text-white font-bold text-xl md:text-2xl mb-3 line-clamp-2 drop-shadow-lg">
                  {currentConcert.title}
                </h4>

                {/* Location & Time */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{currentConcert.city}</div>
                      <div className="text-xs text-gray-300 truncate">{currentConcert.venue}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {currentConcert.time} • {currentConcert.type}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Price */}
                  {(currentConcert.ticketPriceFrom || currentConcert.ticketPriceTo) && (
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold">
                          {currentConcert.ticketPriceFrom && currentConcert.ticketPriceTo
                            ? `${parseInt(currentConcert.ticketPriceFrom).toLocaleString()} - ${parseInt(currentConcert.ticketPriceTo).toLocaleString()} ₽`
                            : currentConcert.ticketPriceFrom
                            ? `От ${parseInt(currentConcert.ticketPriceFrom).toLocaleString()} ₽`
                            : `До ${parseInt(currentConcert.ticketPriceTo).toLocaleString()} ₽`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {currentConcert.description && (
                  <p className="text-gray-200 text-sm mb-4 line-clamp-2">
                    {currentConcert.description}
                  </p>
                )}

                {/* Ticket Button */}
                {currentConcert.ticketLink && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBannerClick}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold transition-all duration-300 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-5 h-5" />
                    Купить билеты
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Stats Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">{currentConcert.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{currentConcert.clicks.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-purple-400 text-xs font-semibold">
                  {currentIndex + 1} / {concerts.length}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Quick Info Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5"
      >
        <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          О продвижении концертов
        </h4>
        <div className="space-y-2 text-xs text-gray-300">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
            <p>Баннер отображается на главной странице всем пользователям</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
            <p>Приоритет в поисковой выдаче и рекомендациях</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
            <p>Рассылка уведомлений всем подписчикам</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
            <p>Детальная аналитика просмотров и кликов</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Hint */}
      {concerts.length > 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl backdrop-blur-xl bg-purple-500/10 border border-purple-400/30 p-4 text-center"
        >
          <p className="text-purple-300 text-xs">
            Баннеры автоматически сменяются каждые 5 секунд
          </p>
        </motion.div>
      )}
    </div>
  );
}