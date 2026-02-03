import { Loader2, Calendar as CalendarIcon, Clock, MapPin, DollarSign, Link as LinkIcon, Image as ImageIcon, Music, ArrowLeft, Globe, Users as UsersIcon, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { concertSchema, type ConcertFormData } from '@/schemas/concert-schema';
import type { TourDate } from '@/types/database';

interface ConcertFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConcertFormData) => Promise<void>;
  concert?: TourDate | null;
  isLoading?: boolean;
}

export function ConcertFormModal({ isOpen, onClose, onSubmit, concert, isLoading }: ConcertFormModalProps) {
  // Common input class with visible text
  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder:text-gray-500";
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ConcertFormData>({
    resolver: zodResolver(concertSchema),
    defaultValues: concert ? {
      title: concert.title,
      tour_name: concert.tour_name || '',
      description: concert.description || '',
      event_type: concert.event_type,
      date: concert.date,
      show_start: concert.show_start || '',
      doors_open: concert.doors_open || '',
      city: concert.city,
      country: concert.country,
      venue_name: concert.venue_name,
      venue_address: concert.venue_address || '',
      venue_capacity: concert.venue_capacity || undefined,
      ticket_price_min: concert.ticket_price_min || undefined,
      ticket_price_max: concert.ticket_price_max || undefined,
      ticket_url: concert.ticket_url || '',
      banner_url: concert.banner_url || '',
      genre: concert.genre || '',
    } : {
      title: '',
      tour_name: '',
      description: '',
      event_type: 'Концерт',
      date: '',
      show_start: '',
      doors_open: '',
      city: '',
      country: 'Россия',
      venue_name: '',
      venue_address: '',
      ticket_url: '',
      banner_url: '',
      genre: '',
    },
  });

  const handleFormSubmit = async (data: ConcertFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center gap-4 p-6 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Назад</span>
            </motion.button>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex-1">
              {concert ? 'Редактировать концерт' : 'Новый концерт'}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Music className="w-4 h-4 text-purple-400" />
                Название концерта *
              </label>
              <input
                {...register('title')}
                placeholder="Например: Rock Fest 2026"
                className={inputClass}
              />
              {errors.title && (
                <p className="text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Описание
              </label>
              <textarea
                {...register('description')}
                placeholder="Расскажите о концерте..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none text-white placeholder:text-gray-500"
              />
              {errors.description && (
                <p className="text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Tour Name and Event Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Tag className="w-4 h-4 text-purple-400" />
                  Название тура (опционально)
                </label>
                <input
                  {...register('tour_name')}
                  placeholder="World Tour 2026"
                  className={inputClass}
                />
                {errors.tour_name && (
                  <p className="text-sm text-red-400">{errors.tour_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Music className="w-4 h-4 text-purple-400" />
                  Тип события *
                </label>
                <select
                  {...register('event_type')}
                  className={inputClass}
                >
                  <option value="Концерт" className="bg-gray-900">Концерт</option>
                  <option value="Фестиваль" className="bg-gray-900">Фестиваль</option>
                  <option value="Клубное выступление" className="bg-gray-900">Клубное выступление</option>
                  <option value="Арена шоу" className="bg-gray-900">Арена шоу</option>
                  <option value="Уличный концерт" className="bg-gray-900">Уличный концерт</option>
                  <option value="Акустический сет" className="bg-gray-900">Акустический сет</option>
                  <option value="DJ сет" className="bg-gray-900">DJ сет</option>
                  <option value="Другое" className="bg-gray-900">Другое</option>
                </select>
                {errors.event_type && (
                  <p className="text-sm text-red-400">{errors.event_type.message}</p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
                  Дата *
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className={inputClass}
                />
                {errors.date && (
                  <p className="text-sm text-red-400">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Начало шоу
                </label>
                <input
                  type="time"
                  {...register('show_start')}
                  placeholder="20:00"
                  className={inputClass}
                />
                {errors.show_start && (
                  <p className="text-sm text-red-400">{errors.show_start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Clock className="w-4 h-4 text-pink-400" />
                  Открытие дверей
                </label>
                <input
                  type="time"
                  {...register('doors_open')}
                  placeholder="19:00"
                  className={inputClass}
                />
                {errors.doors_open && (
                  <p className="text-sm text-red-400">{errors.doors_open.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  Город *
                </label>
                <input
                  {...register('city')}
                  placeholder="Москва"
                  className={inputClass}
                />
                {errors.city && (
                  <p className="text-sm text-red-400">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Globe className="w-4 h-4 text-pink-400" />
                  Страна *
                </label>
                <input
                  {...register('country')}
                  placeholder="Россия"
                  className={inputClass}
                />
                {errors.country && (
                  <p className="text-sm text-red-400">{errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Venue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Площадка *
                </label>
                <input
                  {...register('venue_name')}
                  placeholder="Название площадки"
                  className={inputClass}
                />
                {errors.venue_name && (
                  <p className="text-sm text-red-400">{errors.venue_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <UsersIcon className="w-4 h-4 text-pink-400" />
                  Вместимость (опционально)
                </label>
                <input
                  type="number"
                  {...register('venue_capacity', { valueAsNumber: true })}
                  placeholder="5000"
                  className={inputClass}
                />
                {errors.venue_capacity && (
                  <p className="text-sm text-red-400">{errors.venue_capacity.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Адрес площадки
              </label>
              <input
                {...register('venue_address')}
                placeholder="Полный адрес"
                className={inputClass}
              />
              {errors.venue_address && (
                <p className="text-sm text-red-400">{errors.venue_address.message}</p>
              )}
            </div>

            {/* Tickets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  Мин. цена (₽)
                </label>
                <input
                  type="number"
                  {...register('ticket_price_min', { valueAsNumber: true })}
                  placeholder="1000"
                  className={inputClass}
                />
                {errors.ticket_price_min && (
                  <p className="text-sm text-red-400">{errors.ticket_price_min.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  Макс. цена (₽)
                </label>
                <input
                  type="number"
                  {...register('ticket_price_max', { valueAsNumber: true })}
                  placeholder="5000"
                  className={inputClass}
                />
                {errors.ticket_price_max && (
                  <p className="text-sm text-red-400">{errors.ticket_price_max.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                Ссылка на билеты
              </label>
              <input
                {...register('ticket_url')}
                placeholder="https://..."
                className={inputClass}
              />
              {errors.ticket_url && (
                <p className="text-sm text-red-400">{errors.ticket_url.message}</p>
              )}
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Жанр
              </label>
              <input
                {...register('genre')}
                placeholder="Rock, Pop, Electronic..."
                className={inputClass}
              />
              {errors.genre && (
                <p className="text-sm text-red-400">{errors.genre.message}</p>
              )}
            </div>

            {/* Banner URL */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                URL баннера
              </label>
              <input
                {...register('banner_url')}
                placeholder="https://..."
                className={inputClass}
              />
              {errors.banner_url && (
                <p className="text-sm text-red-400">{errors.banner_url.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isLoading}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Сохранение...
                  </>
                ) : concert ? (
                  'Сохранить изменения'
                ) : (
                  'Создать концерт'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}