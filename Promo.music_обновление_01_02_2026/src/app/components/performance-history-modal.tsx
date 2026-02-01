import { Loader2, Calendar as CalendarIcon, MapPin, Music, Users, Image as ImageIcon, FileText, ArrowLeft, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { performanceHistorySchema, type PerformanceHistoryFormData } from '@/schemas/performance-history-schema';
import type { PerformanceHistoryItem, EventType } from '@/types/database';
import { useState } from 'react';

interface PerformanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PerformanceHistoryFormData) => Promise<void>;
  performance?: PerformanceHistoryItem | null;
  isLoading?: boolean;
}

const EVENT_TYPES: EventType[] = [
  'Концерт',
  'Фестиваль',
  'Клубное выступление',
  'Арена шоу',
  'Уличный концерт',
  'Акустический сет',
  'DJ сет',
  'Другое'
];

export function PerformanceHistoryModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  performance, 
  isLoading 
}: PerformanceHistoryModalProps) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState<string[]>(performance?.photos || []);

  // Common input class with visible text
  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-white placeholder:text-gray-500";
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PerformanceHistoryFormData>({
    resolver: zodResolver(performanceHistorySchema),
    defaultValues: performance ? {
      event_name: performance.event_name,
      venue_name: performance.venue_name,
      city: performance.city,
      date: performance.date,
      audience_size: performance.audience_size,
      type: performance.type,
      description: performance.description || '',
      photos: performance.photos || [],
    } : {
      event_name: '',
      venue_name: '',
      city: '',
      date: '',
      type: 'Концерт',
      description: '',
      photos: [],
    },
  });

  const handleFormSubmit = async (data: PerformanceHistoryFormData) => {
    await onSubmit({ ...data, photos });
    reset();
    setPhotos([]);
    setPhotoUrl('');
  };

  const handleClose = () => {
    reset();
    setPhotos([]);
    setPhotoUrl('');
    onClose();
  };

  const addPhoto = () => {
    if (photoUrl && photos.length < 10) {
      try {
        new URL(photoUrl); // Validate URL
        setPhotos([...photos, photoUrl]);
        setPhotoUrl('');
      } catch (e) {
        // Invalid URL - error will be shown in input
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
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
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex-1">
              {performance ? 'Редактировать выступление' : 'Добавить выступление'}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Event Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Music className="w-4 h-4 text-cyan-400" />
                Название события *
              </label>
              <input
                {...register('event_name')}
                placeholder="Например: Summer Rock Fest 2025"
                className={inputClass}
              />
              {errors.event_name && (
                <p className="text-sm text-red-400">{errors.event_name.message}</p>
              )}
            </div>

            {/* Venue and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
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
                <label className="text-sm font-medium text-gray-300">
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
            </div>

            {/* Date and Event Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <CalendarIcon className="w-4 h-4 text-cyan-400" />
                  Дата выступления *
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
                <label className="text-sm font-medium text-gray-300">
                  Тип события *
                </label>
                <select
                  {...register('type')}
                  className={inputClass}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-gray-900">
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-sm text-red-400">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Audience Size */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Users className="w-4 h-4 text-cyan-400" />
                Размер аудитории (опционально)
              </label>
              <input
                type="number"
                {...register('audience_size', { valueAsNumber: true })}
                placeholder="1000"
                className={inputClass}
              />
              {errors.audience_size && (
                <p className="text-sm text-red-400">{errors.audience_size.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FileText className="w-4 h-4 text-cyan-400" />
                Описание (опционально)
              </label>
              <textarea
                {...register('description')}
                placeholder="Расскажите о выступлении..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none text-white placeholder:text-gray-500"
              />
              {errors.description && (
                <p className="text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Фотографии (до 10)
              </label>
              
              {/* Add Photo Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={addPhoto}
                  disabled={photos.length >= 10 || !photoUrl}
                  className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              {/* Photos Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Сохранение...
                  </>
                ) : performance ? (
                  'Сохранить изменения'
                ) : (
                  'Добавить выступление'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
