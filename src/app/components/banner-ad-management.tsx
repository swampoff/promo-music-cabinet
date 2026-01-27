/**
 * BANNER AD MANAGEMENT - СОЗДАНИЕ БАННЕРНЫХ КАМПАНИЙ
 * Визуальная реклама на платформе PROMO.FM
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link, Music, Video, User, ExternalLink, Image, Info, Calendar, DollarSign, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface BannerAdManagementProps {
  userId: string;
  userEmail: string;
  userTracks: any[];
  userVideos: any[];
}

type BannerType = 'top_banner' | 'sidebar_large' | 'sidebar_small';
type LinkType = 'profile' | 'track' | 'video' | 'external';

const BANNER_TYPES = [
  {
    id: 'top_banner' as BannerType,
    name: 'Главный баннер',
    dimensions: '1920 × 400 px',
    price: 15000,
    description: 'Премиум размещение вверху главной страницы',
    color: 'from-purple-500 to-pink-500',
    icon: Sparkles,
  },
  {
    id: 'sidebar_large' as BannerType,
    name: 'Боковой большой',
    dimensions: '300 × 600 px',
    price: 12000,
    description: 'Заметное размещение в боковой панели',
    color: 'from-blue-500 to-cyan-500',
    icon: Image,
  },
  {
    id: 'sidebar_small' as BannerType,
    name: 'Боковой малый',
    dimensions: '300 × 250 px',
    price: 8000,
    description: 'Компактное размещение в боковой панели',
    color: 'from-green-500 to-emerald-500',
    icon: Image,
  },
];

const DURATION_OPTIONS = [
  { days: 7, label: '7 дней', discount: 0 },
  { days: 14, label: '14 дней', discount: 0.05 },
  { days: 30, label: '30 дней', discount: 0.15 },
];

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

export function BannerAdManagement({ userId, userEmail, userTracks, userVideos }: BannerAdManagementProps) {
  const [campaignName, setCampaignName] = useState('');
  const [bannerType, setBannerType] = useState<BannerType>('top_banner');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [linkType, setLinkType] = useState<LinkType>('profile');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(false);

  const selectedBanner = BANNER_TYPES.find(b => b.id === bannerType);
  const selectedDuration = DURATION_OPTIONS.find(d => d.days === duration);
  
  const calculatePrice = () => {
    if (!selectedBanner || !selectedDuration) return 0;
    const basePrice = selectedBanner.price * duration;
    const discount = basePrice * selectedDuration.discount;
    return Math.round(basePrice - discount);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    // Валидация
    if (!campaignName.trim()) {
      toast.error('Введите название кампании');
      return;
    }

    if (!imageFile) {
      toast.error('Загрузите изображение баннера');
      return;
    }

    if (linkType === 'track' && !selectedTrack) {
      toast.error('Выберите трек');
      return;
    }

    if (linkType === 'video' && !selectedVideo) {
      toast.error('Выберите клип');
      return;
    }

    if (linkType === 'external' && !externalUrl.trim()) {
      toast.error('Введите целевую ссылку');
      return;
    }

    setLoading(true);

    try {
      // Шаг 1: Загрузка изображения в Supabase Storage
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);
      uploadFormData.append('userId', userId);

      const uploadResponse = await fetch(`${API_URL}/banner/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Ошибка загрузки изображения');
      }

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Ошибка загрузки изображения');
      }

      const image_url = uploadResult.data.url;

      // Шаг 2: Определение целевого URL
      let target_url = '';
      if (linkType === 'profile') {
        target_url = '/profile';
      } else if (linkType === 'track') {
        target_url = `/track/${selectedTrack}`;
      } else if (linkType === 'video') {
        target_url = `/video/${selectedVideo}`;
      } else {
        target_url = externalUrl;
      }

      // Шаг 3: Отправка данных на сервер
      const response = await fetch(`${API_URL}/banner/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          user_email: userEmail,
          campaign_name: campaignName,
          banner_type: bannerType,
          image_url: image_url,
          target_url: target_url,
          duration_days: duration,
          dimensions: selectedBanner?.dimensions || 'auto',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Ошибка сервера');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка отправки');
      }

      toast.success('✅ Кампания отправлена на модерацию!', {
        description: `Стоимость: ${calculatePrice().toLocaleString('ru-RU')} ₽`,
      });

      // Очистка формы
      setCampaignName('');
      setImageFile(null);
      setImagePreview('');
      setLinkType('profile');
      setSelectedTrack('');
      setSelectedVideo('');
      setExternalUrl('');

    } catch (error) {
      console.error('Banner submission error:', error);
      toast.error(`Ошибка отправки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3"
        >
          Создать баннерную кампанию
        </motion.h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Продвигайте свой контент визуально на главной странице платформы
        </p>
      </div>

      {/* Campaign Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <label className="block text-white font-semibold mb-3">
          Название кампании
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="Например: Новый альбом 2025"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none transition-all"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-2">{campaignName.length}/100 символов</p>
      </motion.div>

      {/* Banner Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Тип баннера
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BANNER_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setBannerType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  bannerType === type.id
                    ? `bg-gradient-to-br ${type.color} bg-opacity-20 border-white/30`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                <h4 className="text-white font-bold text-sm mb-1">{type.name}</h4>
                <p className="text-xs text-gray-400 mb-2">{type.dimensions}</p>
                <p className="text-xs text-gray-500">{type.description}</p>
                <p className="text-sm font-bold text-purple-400 mt-2">
                  {type.price.toLocaleString('ru-RU')} ₽/день
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Image Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Изображение баннера
        </h3>
        
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl border-2 border-white/20"
            />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview('');
              }}
              className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-all"
            >
              Удалить
            </button>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400/50 transition-all">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-white font-semibold mb-1">Загрузите изображение</p>
              <p className="text-sm text-gray-400 mb-2">
                Размер: {selectedBanner?.dimensions} • Макс. 5MB
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </motion.div>

      {/* Target Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Link className="w-5 h-5" />
          Целевая ссылка
        </h3>

        {/* Link Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => setLinkType('profile')}
            className={`p-3 rounded-xl border transition-all ${
              linkType === 'profile'
                ? 'bg-purple-500/20 border-purple-400'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <User className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-xs text-white">Профиль</p>
          </button>
          <button
            onClick={() => setLinkType('track')}
            className={`p-3 rounded-xl border transition-all ${
              linkType === 'track'
                ? 'bg-blue-500/20 border-blue-400'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <Music className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-xs text-white">Трек</p>
          </button>
          <button
            onClick={() => setLinkType('video')}
            className={`p-3 rounded-xl border transition-all ${
              linkType === 'video'
                ? 'bg-pink-500/20 border-pink-400'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <Video className="w-5 h-5 mx-auto mb-1 text-pink-400" />
            <p className="text-xs text-white">Клип</p>
          </button>
          <button
            onClick={() => setLinkType('external')}
            className={`p-3 rounded-xl border transition-all ${
              linkType === 'external'
                ? 'bg-cyan-500/20 border-cyan-400'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <ExternalLink className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <p className="text-xs text-white">Внешняя</p>
          </button>
        </div>

        {/* Conditional Fields */}
        {linkType === 'track' && (
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-400 focus:outline-none"
          >
            <option value="">Выберите трек</option>
            {userTracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title} - {track.artist}
              </option>
            ))}
          </select>
        )}

        {linkType === 'video' && (
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-pink-400 focus:outline-none"
          >
            <option value="">Выберите клип</option>
            {userVideos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.title}
              </option>
            ))}
          </select>
        )}

        {linkType === 'external' && (
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
          />
        )}

        {linkType === 'profile' && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/30">
            <Info className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm text-gray-300">
              Баннер будет вести на ваш профиль артиста
            </p>
          </div>
        )}
      </motion.div>

      {/* Duration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Длительность размещения
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DURATION_OPTIONS.map((option) => (
            <motion.button
              key={option.days}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDuration(option.days)}
              className={`p-4 rounded-xl border-2 transition-all ${
                duration === option.days
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <p className="text-2xl font-bold text-white mb-1">{option.days}</p>
              <p className="text-sm text-gray-400 mb-2">{option.label}</p>
              {option.discount > 0 && (
                <span className="inline-block px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                  -{(option.discount * 100).toFixed(0)}% скидка
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Price Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Стоимость кампании
          </h3>
          {selectedDuration && selectedDuration.discount > 0 && (
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
              Экономия: {Math.round(selectedBanner!.price * duration * selectedDuration.discount).toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between text-gray-300">
            <span>{selectedBanner?.name}</span>
            <span>{selectedBanner?.price.toLocaleString('ru-RU')} ₽/день</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Длительность</span>
            <span>{duration} дней</span>
          </div>
          <div className="h-px bg-white/10 my-2" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white font-semibold">Итого:</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {calculatePrice().toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Отправка...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Отправить на модерацию
          </span>
        )}
      </motion.button>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/30"
      >
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300 space-y-1">
            <p>• После отправки кампания пройдет модерацию (обычно 1-2 дня)</p>
            <p>• Оплата потребуется только после одобрения</p>
            <p>• Баннер начнет показываться сразу после подтверждения оплаты</p>
            <p>• Вы сможете отслеживать показы и клики в реальном времени</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}