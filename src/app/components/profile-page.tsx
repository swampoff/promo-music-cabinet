import { Users, Music, Video, MapPin, Link as LinkIcon, Instagram, Twitter, Facebook, Camera, Check, Copy, ExternalLink, Youtube, Globe, Mail, Phone, Edit2, Sparkles, Crown, BadgeCheck, Star, TrendingUp, Eye, Share2, AlertCircle, Loader2, Upload, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { PublicContentManager } from '@/app/components/public-content-manager';

const socialPlatforms = [
  { name: 'Instagram', icon: Instagram, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-400/30', placeholder: 'instagram.com/username' },
  { name: 'Twitter', icon: Twitter, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-400/30', placeholder: 'twitter.com/username' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-500', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-500/30', placeholder: 'facebook.com/username' },
  { name: 'YouTube', icon: Youtube, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', placeholder: 'youtube.com/@username' },
];

const achievementBadges = [
  { name: 'Верифицированный артист', icon: BadgeCheck, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  { name: 'Топ 100', icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  { name: 'Восходящая звезда', icon: Star, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  { name: 'В тренде', icon: TrendingUp, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
];

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  avatar: string;
  socials: {
    instagram: string;
    twitter: string;
    facebook: string;
    youtube: string;
  };
}

interface ValidationErrors {
  name?: string;
  username?: string;
  bio?: string;
  email?: string;
  website?: string;
  [key: string]: string | undefined;
}

interface ProfilePageProps {
  profileData: ProfileData;
  onProfileUpdate: (data: ProfileData) => void;
}

export function ProfilePage({ profileData: initialProfileData, onProfileUpdate }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);

  // Update local state when prop changes
  useEffect(() => {
    setProfileData(initialProfileData);
  }, [initialProfileData]);

  const stats = [
    { label: 'Подписчиков', value: '2.4K', icon: Users, trend: '+12%', trendUp: true },
    { label: 'Треков', value: '12', icon: Music, trend: '+3', trendUp: true },
    { label: 'Видео', value: '5', icon: Video, trend: '+1', trendUp: true },
    { label: 'Просмотров', value: '45.2K', icon: Eye, trend: '+23%', trendUp: true },
  ];

  // Валидация данных
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!profileData.name.trim()) {
      errors.name = 'Имя обязательно';
    } else if (profileData.name.length < 2) {
      errors.name = 'Минимум 2 символа';
    }

    if (!profileData.username.trim()) {
      errors.username = 'Никнейм обязателен';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      errors.username = 'Только буквы, цифры и _';
    } else if (profileData.username.length < 3) {
      errors.username = 'Минимум 3 символа';
    }

    if (profileData.bio.length > 500) {
      errors.bio = 'Максимум 500 символов';
    }

    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Неверный формат email';
    }

    if (profileData.website && !/^https?:\/\/.+\..+/.test(profileData.website)) {
      errors.website = 'Неверный формат URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Загрузка аватара
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5МБ)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5МБ');
      return;
    }

    setIsUploadingAvatar(true);

    // Создание preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  // Сохранение изменений
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    // Симуляция API запроса
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Создание обновленных данных
    const updatedData = { ...profileData };
    
    // Применение изменений аватара если есть
    if (avatarPreview) {
      updatedData.avatar = avatarPreview;
    }

    // Сохранение данных в глобальное состояние
    onProfileUpdate(updatedData);
    
    // Очистка превью
    setAvatarPreview(null);
    setIsSaving(false);
    setIsEditing(false);
    setShowSuccess(true);

    // Скрытие уведомления
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Отмена изменений
  const handleCancel = () => {
    setProfileData({ ...initialProfileData });
    setAvatarPreview(null);
    setValidationErrors({});
    setIsEditing(false);
  };

  // Копирование ссылки
  const copyProfileLink = () => {
    const link = `https://promo.music/${profileData.username}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Проверка наличия изменений
  const hasChanges = () => {
    return JSON.stringify(profileData) !== JSON.stringify(initialProfileData) || avatarPreview !== null;
  };

  // Обработка изменений полей
  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Очистка ошибки при изменении
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSocialChange = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0">
      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-lg flex items-center gap-2 md:gap-3 text-sm md:text-base"
          >
            <Check className="w-4 h-4 md:w-5 md:h-5" />
            Профиль успешно обновлен!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">Публичный профиль</h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg">Управляйте своим профилем артиста</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(`https://promo.music/${profileData.username}`, '_blank')}
            className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold transition-all duration-300 border border-white/20 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Просмотр профиля</span>
            <span className="sm:hidden">Просмотр</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base ${
              isEditing 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/15'
                : 'bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20'
            }`}
          >
            <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
            {isEditing ? 'Редактирование' : 'Редактировать'}
          </motion.button>
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10 border border-white/10"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Avatar Section */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative group">
              <button
                type="button"
                onClick={() => {
                  // Если не в режиме редактирования - включаем его
                  if (!isEditing) {
                    setIsEditing(true);
                  }
                  // Открываем модальное окно
                  setShowUploadModal(true);
                }}
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden ring-4 ring-cyan-400/30 group-hover:ring-cyan-400/50 hover:ring-cyan-400 transition-all duration-300 cursor-pointer relative"
              >
                {isUploadingAvatar ? (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <ImageWithFallback
                      src={avatarPreview || profileData.avatar}
                      alt="Artist"
                      className="w-full h-full object-cover"
                    />
                    {/* Всегда показываем overlay при hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <Camera className="w-8 h-8 md:w-10 md:h-10 text-white mx-auto mb-2" />
                        <p className="text-white text-sm font-semibold">Изменить фото</p>
                        <p className="text-gray-300 text-xs mt-1">Нажмите для загрузки</p>
                      </div>
                    </div>
                  </div>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              {avatarPreview && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatarPreview(null);
                  }}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-300 z-20"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              )}
              
              {/* Verified Badge */}
              <div className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg z-20">
                <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>

            {/* Copy Profile Link */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyProfileLink}
              className="mt-4 w-full px-4 py-2.5 md:py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold transition-all duration-300 border border-white/20 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Копировать ссылку
                </>
              )}
            </motion.button>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                {/* Name Field - LOCKED */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={profileData.name}
                      disabled
                      className="text-4xl font-bold text-white/70 bg-white/5 px-4 py-2 rounded-xl border border-yellow-400/40 w-full transition-all duration-300 cursor-not-allowed opacity-60"
                      placeholder="Ваше имя"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/20 border border-yellow-400/30">
                      <Lock className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-semibold">Установлено при регистрации</span>
                    </div>
                  </div>
                </div>
                
                {/* Username Field - LOCKED */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-lg">@</span>
                    <input
                      type="text"
                      value={profileData.username}
                      disabled
                      className="text-lg text-white/70 bg-white/5 px-4 py-2 rounded-xl border border-yellow-400/40 flex-1 transition-all duration-300 cursor-not-allowed opacity-60"
                      placeholder="nickname"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/20 border border-yellow-400/30">
                      <Lock className="w-3 h-3 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  {profileData.name}
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </h2>
                <p className="text-gray-300 text-lg">@{profileData.username}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className={`text-xs font-semibold ${stat.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.trend}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Achievement Badges */}
            <div className="flex flex-wrap gap-2">
              {achievementBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`${badge.bgColor} ${badge.color} px-3 py-2 rounded-lg flex items-center gap-2 border border-white/10 cursor-pointer group`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{badge.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">О себе</h3>
        </div>
        
        {isEditing ? (
          <div>
            <textarea
              rows={5}
              value={profileData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                validationErrors.bio ? 'border-red-400' : 'border-white/20'
              } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 resize-none`}
              placeholder="Расскажите о себе..."
            />
            <div className={`mt-2 text-sm flex justify-between ${
              profileData.bio.length > 500 ? 'text-red-400' : 'text-gray-400'
            }`}>
              <span>Максимум 500 символов</span>
              <span>{profileData.bio.length}/500</span>
            </div>
            {validationErrors.bio && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {validationErrors.bio}
              </motion.div>
            )}
          </div>
        ) : (
          <p className="text-gray-300 text-lg leading-relaxed">{profileData.bio}</p>
        )}
      </motion.div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <label className="block text-gray-300 text-sm mb-3 flex items-center gap-2 font-semibold">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Город
          </label>
          <input
            type="text"
            value={profileData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Москва, Россия"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <label className="block text-gray-300 text-sm mb-3 flex items-center gap-2 font-semibold">
            <Globe className="w-5 h-5 text-purple-400" />
            Веб-сайт
          </label>
          <div>
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => handleFieldChange('website', e.target.value)}
              disabled={!isEditing}
              placeholder="https://yourwebsite.com"
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                validationErrors.website ? 'border-red-400' : 'border-white/10'
              } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            {validationErrors.website && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {validationErrors.website}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <label className="block text-gray-300 text-sm mb-3 flex items-center gap-2 font-semibold">
            <Mail className="w-5 h-5 text-pink-400" />
            Email
          </label>
          <div>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={!isEditing}
              placeholder="your@email.com"
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                validationErrors.email ? 'border-red-400' : 'border-white/10'
              } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            {validationErrors.email && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {validationErrors.email}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <label className="block text-gray-300 text-sm mb-3 flex items-center gap-2 font-semibold">
            <Phone className="w-5 h-5 text-green-400" />
            Телефон
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            disabled={!isEditing}
            placeholder="+7 (999) 123-45-67"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </motion.div>
      </div>

      {/* Social Media Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-6">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-2xl font-bold text-white">Социальные сети</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialPlatforms.map((platform, index) => {
            const Icon = platform.icon;
            const socialKey = platform.name.toLowerCase() as keyof typeof profileData.socials;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                className={`p-6 rounded-xl ${platform.bgColor} border ${platform.borderColor} hover:border-opacity-50 transition-all duration-300`}
              >
                <label className={`block ${platform.color} text-sm mb-3 flex items-center gap-2 font-semibold`}>
                  <Icon className="w-5 h-5" />
                  {platform.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={profileData.socials[socialKey]}
                    onChange={(e) => handleSocialChange(socialKey, e.target.value)}
                    disabled={!isEditing}
                    placeholder={platform.placeholder}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {profileData.socials[socialKey] && !isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.open(`https://${profileData.socials[socialKey]}`, '_blank')}
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                    >
                      <ExternalLink className={`w-5 h-5 ${platform.color}`} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Save/Cancel Buttons */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving || !hasChanges()}
              className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Сохранить изменения
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              disabled={isSaving}
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Предпросмотр профиля</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(`https://promo.music/${profileData.username}`, '_blank')}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold transition-all duration-300 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Открыть
          </motion.button>
        </div>
        <p className="text-gray-300">
          Ваш профиль будет доступен по адресу: <span className="text-cyan-400 font-semibold">promo.music/{profileData.username}</span>
        </p>
      </motion.div>

      {/* PUBLIC CONTENT SECTIONS */}
      <PublicContentManager isEditing={isEditing} />

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-900/90 via-slate-900/90 to-cyan-900/90 border border-white/20 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Загрузить аватар</h3>
                    <p className="text-sm text-gray-400">Выберите фото профиля</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Requirements */}
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    Требования к изображению
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">Формат:</strong> JPG, PNG, GIF или WebP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">Размер:</strong> Максимум 5 МБ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">Рекомендуемое разрешение:</strong> 800×800 пикселей или больше</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">Соотношение сторон:</strong> Квадрат (1:1) для лучшего отображения</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/30">
                  <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Рекомендации
                  </h4>
                  <ul className="space-y-1.5 text-sm text-yellow-100/80">
                    <li>• Используйте качественное фото с хорошим освещением</li>
                    <li>• Лицо должно быть хорошо видно и в фокусе</li>
                    <li>• Избегайте слишком темных или размытых изображений</li>
                    <li>• Профессиональное фото повышает доверие аудитории</li>
                  </ul>
                </div>
              </div>

              {/* Upload Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowUploadModal(false);
                  fileInputRef.current?.click();
                }}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Выбрать файл
              </motion.button>

              <p className="text-center text-gray-400 text-xs mt-4">
                После выбора файла вы сможете увидеть предпросмотр перед сохранением
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}