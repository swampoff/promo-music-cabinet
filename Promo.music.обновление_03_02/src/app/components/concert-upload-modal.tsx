import { X, Upload, Calendar, MapPin, Ticket, Check, AlertCircle, Loader2, Info, DollarSign, Clock, Building2, Music2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { validateBanner, getBannerRecommendations, formatFileSize } from '@/utils/banner-validation';

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

interface ConcertUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
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
  }, isDraft: boolean) => Promise<void>;
}

export function ConcertUploadModal({ isOpen, onClose, onUpload }: ConcertUploadModalProps) {
  const [uploadForm, setUploadForm] = useState({
    title: '',
    date: '',
    time: '',
    city: '',
    venue: '',
    type: '',
    description: '',
    ticketPriceFrom: '',
    ticketPriceTo: '',
    ticketLink: '',
  });

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidatingBanner, setIsValidatingBanner] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [bannerDimensions, setBannerDimensions] = useState<{ width: number; height: number } | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Обработка загрузки баннера
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidatingBanner(true);
    setValidationWarnings([]);
    setBannerDimensions(null);

    // Валидация баннера
    const validation = await validateBanner(file);

    if (!validation.valid) {
      setValidationErrors(prev => ({
        ...prev,
        banner: validation.errors.join('. '),
      }));
      setIsValidatingBanner(false);
      return;
    }

    // Показать предупреждения, если есть
    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
    }

    // Сохранить размеры
    if (validation.dimensions) {
      setBannerDimensions({
        width: validation.dimensions.width,
        height: validation.dimensions.height,
      });
    }

    // Очистить ошибки
    setValidationErrors(prev => {
      const { banner, ...rest } = prev;
      return rest;
    });

    // Создать превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
      setBannerFile(file);
      setIsValidatingBanner(false);
    };
    reader.readAsDataURL(file);
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!uploadForm.title.trim()) {
      errors.title = 'Введите название концерта';
    }
    if (!uploadForm.date) {
      errors.date = 'Выберите дату концерта';
    }
    if (!uploadForm.time) {
      errors.time = 'Выберите время начала';
    }
    if (!uploadForm.city.trim()) {
      errors.city = 'Введите город';
    }
    if (!uploadForm.venue.trim()) {
      errors.venue = 'Введите площадку';
    }
    if (!uploadForm.type) {
      errors.type = 'Выберите тип концерта';
    }
    if (!bannerPreview) {
      errors.banner = 'Загрузите баннер';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Загрузка концерта
  const handleUploadConcert = async (isDraft: boolean = false) => {
    if (!validateForm() && !isDraft) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Симуляция загрузки
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    await onUpload({
      ...uploadForm,
      banner: bannerPreview,
    }, isDraft);

    setIsUploading(false);
    
    // Сброс формы
    setUploadForm({
      title: '',
      date: '',
      time: '',
      city: '',
      venue: '',
      type: '',
      description: '',
      ticketPriceFrom: '',
      ticketPriceTo: '',
      ticketLink: '',
    });
    setBannerPreview(null);
    setBannerFile(null);
    setUploadProgress(0);
    setValidationErrors({});
    setValidationWarnings([]);
    setBannerDimensions(null);
  };

  if (!isOpen) return null;

  const recommendations = getBannerRecommendations();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 shadow-2xl overflow-hidden"
        >
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Добавить концерт</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </motion.button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-5 md:space-y-6">
              {/* Banner Upload */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-gray-300 text-sm md:text-base font-semibold">
                    Боковой баннер концерта *
                  </label>
                  <button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    className="text-purple-400 hover:text-purple-300 text-xs md:text-sm flex items-center gap-1 transition-colors"
                  >
                    <Info className="w-3 h-3 md:w-4 md:h-4" />
                    Требования
                  </button>
                </div>

                {/* Info about banner display */}
                <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-gray-300">
                      <div className="font-semibold text-purple-400 mb-1">Баннер на главной странице</div>
                      <div>
                        После одобрения модерацией и оплаты продвижения (2000 коинов), 
                        ваш баннер будет отображаться в боковой панели на главной странице 
                        всем пользователям платформы. Оптимальный размер: 840x1260px (2:3).
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <AnimatePresence>
                  {showRecommendations && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-3 md:p-4 rounded-xl bg-purple-500/10 border border-purple-400/30 overflow-hidden"
                    >
                      <div className="text-purple-400 font-semibold text-xs md:text-sm mb-2">
                        📐 Требования к баннеру:
                      </div>
                      <ul className="text-gray-300 text-xs md:text-sm space-y-1">
                        {recommendations.map((rec, i) => (
                          <li key={i}>• {rec}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className={`relative w-full h-64 md:h-80 rounded-xl border-2 border-dashed ${
                    validationErrors.banner ? 'border-red-400' : 'border-white/20'
                  } hover:border-purple-400/50 transition-all duration-300 cursor-pointer overflow-hidden group`}
                >
                  {bannerPreview ? (
                    <>
                      <img src={bannerPreview} alt="Баннер" className="w-full h-full object-contain bg-black/20" />
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="text-white text-center">
                          <ImageIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
                          <div className="font-semibold text-sm md:text-base">Изменить баннер</div>
                          {bannerDimensions && (
                            <div className="text-xs md:text-sm text-gray-300 mt-1">
                              {bannerDimensions.width}x{bannerDimensions.height}px
                              {bannerFile && ` • ${formatFileSize(bannerFile.size)}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-green-500/20 border border-green-400/30 backdrop-blur-sm">
                        <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Загружен
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                      {isValidatingBanner ? (
                        <>
                          <Loader2 className="w-10 h-10 md:w-12 md:h-12 mb-3 animate-spin" />
                          <div className="font-semibold text-sm md:text-base">Проверка баннера...</div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 md:w-12 md:h-12 mb-3" />
                          <div className="font-semibold mb-1 text-sm md:text-base">Загрузите боковой баннер</div>
                          <div className="text-xs md:text-sm">PNG, JPG, WebP до 2МБ</div>
                          <div className="text-xs md:text-sm text-purple-400 mt-1">Рекомендуется: 500x750px (2:3)</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                
                {/* Validation Errors */}
                {validationErrors.banner && (
                  <div className="flex items-start gap-1 mt-2 text-red-400 text-xs md:text-sm">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                    <span>{validationErrors.banner}</span>
                  </div>
                )}

                {/* Validation Warnings */}
                {validationWarnings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/30"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-yellow-400 text-xs md:text-sm space-y-1">
                        {validationWarnings.map((warning, i) => (
                          <div key={i}>• {warning}</div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Название концерта *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                      validationErrors.title ? 'border-red-400' : 'border-white/10'
                    } text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base`}
                    placeholder="Например: Summer Music Fest 2026"
                  />
                  {validationErrors.title && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.title}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Дата концерта *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={uploadForm.date}
                      onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                      className={`w-full pl-11 md:pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${
                        validationErrors.date ? 'border-red-400' : 'border-white/10'
                      } text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base`}
                    />
                  </div>
                  {validationErrors.date && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.date}
                    </div>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Время начала *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="time"
                      value={uploadForm.time}
                      onChange={(e) => setUploadForm({ ...uploadForm, time: e.target.value })}
                      className={`w-full pl-11 md:pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${
                        validationErrors.time ? 'border-red-400' : 'border-white/10'
                      } text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base`}
                    />
                  </div>
                  {validationErrors.time && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.time}
                    </div>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Город *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={uploadForm.city}
                      onChange={(e) => setUploadForm({ ...uploadForm, city: e.target.value })}
                      className={`w-full pl-11 md:pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${
                        validationErrors.city ? 'border-red-400' : 'border-white/10'
                      } text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base`}
                      placeholder="Москва"
                    />
                  </div>
                  {validationErrors.city && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.city}
                    </div>
                  )}
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Площадка *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.venue}
                    onChange={(e) => setUploadForm({ ...uploadForm, venue: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                      validationErrors.venue ? 'border-red-400' : 'border-white/10'
                    } text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base`}
                    placeholder="Олимпийский"
                  />
                  {validationErrors.venue && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.venue}
                    </div>
                  )}
                </div>

                {/* Type */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Тип концерта *
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                      validationErrors.type ? 'border-red-400' : 'border-white/10'
                    } text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 cursor-pointer text-sm md:text-base`}
                  >
                    <option value="">Выберите тип</option>
                    {concertTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {validationErrors.type && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.type}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Описание
                  </label>
                  <textarea
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 resize-none text-sm md:text-base"
                    placeholder="Расскажите о концерте..."
                  />
                </div>

                {/* Ticket Price From */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Цена билетов от
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      value={uploadForm.ticketPriceFrom}
                      onChange={(e) => setUploadForm({ ...uploadForm, ticketPriceFrom: e.target.value })}
                      className="w-full pl-11 md:pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                      placeholder="1000"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₽</span>
                  </div>
                </div>

                {/* Ticket Price To */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Цена билетов до
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      value={uploadForm.ticketPriceTo}
                      onChange={(e) => setUploadForm({ ...uploadForm, ticketPriceTo: e.target.value })}
                      className="w-full pl-11 md:pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                      placeholder="5000"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₽</span>
                  </div>
                </div>

                {/* Ticket Link */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Ссылка на покупку билетов
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="url"
                      value={uploadForm.ticketLink}
                      onChange={(e) => setUploadForm({ ...uploadForm, ticketLink: e.target.value })}
                      className="w-full pl-11 md:pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                      placeholder="https://tickets.example.com/event/..."
                    />
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 font-semibold text-sm md:text-base">Загрузка...</span>
                    <span className="text-white font-semibold text-sm md:text-base">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 p-4 md:p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUploadConcert(false)}
              disabled={isUploading}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/15 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  Загрузка...
                </span>
              ) : (
                'Отправить на модерацию'
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUploadConcert(true)}
              disabled={isUploading}
              className="px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base whitespace-nowrap"
            >
              Сохранить черновик
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}