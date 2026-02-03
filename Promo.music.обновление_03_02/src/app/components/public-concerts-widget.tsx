/**
 * PUBLIC CONCERTS WIDGET
 * Виджет "Ближайшие концерты" для публичного профиля артиста
 * Отображает только ОДОБРЕННЫЕ концерты
 */

import { Calendar, MapPin, Ticket, ExternalLink, Clock, Users, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { concertsApi } from '@/services/concerts-api';
import type { TourDate } from '@/types/database';

interface PublicConcertsWidgetProps {
  isEditing: boolean;
  limit?: number; // Максимальное количество концертов для отображения
}

export function PublicConcertsWidget({ isEditing, limit = 6 }: PublicConcertsWidgetProps) {
  const [concerts, setConcerts] = useState<TourDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcerts, setSelectedConcerts] = useState<string[]>([]);

  useEffect(() => {
    loadConcerts();
  }, []);

  const loadConcerts = async () => {
    setLoading(true);
    const result = await concertsApi.getAll();
    
    if (result.success && result.data) {
      // Фильтруем: только одобренные + будущие
      const now = new Date();
      const approvedConcerts = result.data.filter(concert => {
        const concertDate = new Date(concert.date);
        return concert.status === 'approved' && concertDate >= now;
      });
      
      // Сортируем по дате (ближайшие сначала)
      const sorted = approvedConcerts.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setConcerts(sorted.slice(0, limit));
      
      // Все концерты выбраны по умолчанию
      setSelectedConcerts(sorted.slice(0, limit).map(c => c.id));
    }
    
    setLoading(false);
  };

  const handleTicketClick = async (concert: TourDate) => {
    // Увеличиваем счётчик кликов
    const newClicks = (concert.clicks || 0) + 1;
    await concertsApi.update(concert.id, { clicks: newClicks });
    
    // Открываем ссылку на билеты
    if (concert.ticket_link) {
      window.open(concert.ticket_link, '_blank');
    }
  };

  const toggleConcertVisibility = (concertId: string) => {
    if (!isEditing) return;
    
    setSelectedConcerts(prev => 
      prev.includes(concertId)
        ? prev.filter(id => id !== concertId)
        : [...prev, concertId]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTypeIcon = (type?: string) => {
    switch (type) {
      case 'Фестиваль':
        return <Sparkles className="w-4 h-4" />;
      case 'Тур':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Загрузка концертов...</p>
      </div>
    );
  }

  if (concerts.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Нет предстоящих концертов</h3>
        <p className="text-sm text-gray-500">Концерты появятся здесь после модерации</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEditing && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
          <p className="text-sm text-cyan-300">
            💡 <strong>Режим редактирования:</strong> Нажмите на концерт, чтобы скрыть/показать его в публичном профиле
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concerts.map((concert, index) => {
          const isVisible = selectedConcerts.includes(concert.id);
          
          return (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleConcertVisibility(concert.id)}
              className={`
                relative p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300
                ${isVisible 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-white/5 border-red-400/30 opacity-50'
                }
                ${isEditing ? 'cursor-pointer' : ''}
              `}
            >
              {/* Status Badge */}
              {isEditing && (
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold ${
                  isVisible 
                    ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-400/30'
                }`}>
                  {isVisible ? '👁️ Виден' : '🙈 Скрыт'}
                </div>
              )}

              {/* Event Type Badge */}
              {concert.event_type && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="px-2.5 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg flex items-center gap-1.5">
                    {getEventTypeIcon(concert.event_type)}
                    <span className="text-xs font-semibold text-purple-300">{concert.event_type}</span>
                  </div>
                  
                  {concert.tour_name && (
                    <div className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-lg">
                      <span className="text-xs font-semibold text-cyan-300">{concert.tour_name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Concert Title */}
              <h3 className="text-lg font-bold text-white mb-3 pr-16">
                {concert.title}
              </h3>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{formatDate(concert.date)}</span>
                  {concert.show_start && (
                    <span className="text-gray-400">• {concert.show_start}</span>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {concert.venue_name}
                    {concert.city && `, ${concert.city}`}
                    {concert.country && ` (${concert.country})`}
                  </span>
                </div>

                {concert.venue_capacity && (
                  <div className="flex items-start gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Вместимость: {concert.venue_capacity.toLocaleString('ru-RU')} чел.</span>
                  </div>
                )}

                {concert.ticket_price_from && (
                  <div className="flex items-start gap-2 text-sm text-gray-300">
                    <Ticket className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>
                      от {concert.ticket_price_from.toLocaleString('ru-RU')} ₽
                      {concert.ticket_price_to && ` - ${concert.ticket_price_to.toLocaleString('ru-RU')} ₽`}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isEditing && concert.ticket_link && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTicketClick(concert);
                  }}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Ticket className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Купить билет
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </button>
              )}

              {/* Stats (только в режиме редактирования) */}
              {isEditing && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400">
                  <span>👁️ {concert.views || 0} просмотров</span>
                  <span>🎫 {concert.clicks || 0} кликов</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Call to Action */}
      {!isEditing && concerts.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-400">
            Не пропустите концерты! Следите за анонсами в нашем профиле 🎵
          </p>
        </div>
      )}
    </div>
  );
}