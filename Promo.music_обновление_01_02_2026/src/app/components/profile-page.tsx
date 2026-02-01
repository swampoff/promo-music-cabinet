import { User, MapPin, Link as LinkIcon, Mail, Phone, Instagram, Twitter, Facebook, Youtube, Save, X, Camera, Edit2, Check, AlertCircle, Crown, Sparkles, TrendingUp, Music, Video, Eye, ExternalLink, Copy, Globe, Share2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { toast } from 'sonner';

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

interface ProfilePageProps {
  profileData: ProfileData;
  onProfileUpdate: (data: ProfileData) => void;
}

export function ProfilePage({ profileData: initialData, onProfileUpdate }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stats = [
    { label: 'Подписчиков', value: '2.4K', icon: User, trend: '+12%' },
    { label: 'Треков', value: '12', icon: Music, trend: '+3' },
    { label: 'Видео', value: '5', icon: Video, trend: '+1' },
    { label: 'Просмотров', value: '45.2K', icon: Eye, trend: '+23%' },
  ];

  const socialPlatforms = [
    { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-400/30' },
    { key: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30' },
    { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-600/10', border: 'border-blue-500/30' },
    { key: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(initialData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(initialData);
    setErrors({});
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Заполните описание';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Максимум 500 символов';
    }

    // Email validation - NO CYRILLIC
    if (formData.email) {
      if (/[а-яА-ЯёЁ]/.test(formData.email)) {
        newErrors.email = 'Email не может содержать кириллицу';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Неверный формат email';
      }
    }

    // Phone validation - strict format
    if (formData.phone) {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (!formData.phone.startsWith('+')) {
        newErrors.phone = 'Телефон должен начинаться с +';
      } else if (digitsOnly.length !== 11 || !digitsOnly.startsWith('7')) {
        newErrors.phone = 'Формат: +7 (XXX) XXX-XX-XX (11 цифр)';
      }
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Неверный формат URL (нужно https://)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Исправьте ошибки в форме');
      return;
    }

    onProfileUpdate(formData);
    setIsEditing(false);
    toast.success('Профиль успешно обновлен!');
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Format phone as user types
  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +7
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    if (cleaned.length > 1 && !cleaned.startsWith('+7')) {
      cleaned = '+7' + cleaned.slice(1);
    }
    
    // Extract digits only (without +)
    const digits = cleaned.slice(1);
    
    // Format: +7 (XXX) XXX-XX-XX
    let formatted = '+7';
    if (digits.length > 1) {
      formatted += ' (' + digits.slice(1, 4);
    }
    if (digits.length >= 4) {
      formatted += ') ' + digits.slice(4, 7);
    }
    if (digits.length >= 7) {
      formatted += '-' + digits.slice(7, 9);
    }
    if (digits.length >= 9) {
      formatted += '-' + digits.slice(9, 11);
    }
    
    // Limit to 11 digits (18 characters with formatting)
    setFormData(prev => ({ ...prev, phone: formatted.slice(0, 18) }));
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value }
    }));
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`https://promo.music/${formData.username}`);
    toast.success('Ссылка скопирована!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Публичный профиль</h1>
          <p className="text-gray-300 text-sm md:text-lg">Управляйте своим профилем артиста</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(`https://promo.music/${formData.username}`, '_blank')}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="hidden sm:inline">Просмотр</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                Редактировать
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Отменить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Сохранить
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-6 md:p-10 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10 border border-white/10"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden ring-4 ring-cyan-400/30">
                <ImageWithFallback
                  src={formData.avatar}
                  alt="Artist"
                  className="w-full h-full object-cover"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={copyProfileLink}
                className="mt-4 w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Копировать ссылку
              </motion.button>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                {formData.name}
                <Crown className="w-8 h-8 text-yellow-400" />
              </h2>
              <p className="text-gray-300 text-lg">@{formData.username}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs font-semibold text-green-400">{stat.trend}</div>
                    </div>
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
          {!isEditing && (
            <span className="ml-auto text-sm text-gray-400">
              {formData.bio.length}/500
            </span>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea
              rows={5}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.bio ? 'border-red-400' : 'border-white/20'
              } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 resize-none`}
              placeholder="Расскажите о себе..."
            />
            <div className={`mt-2 text-sm flex justify-between ${
              formData.bio.length > 500 ? 'text-red-400' : 'text-gray-400'
            }`}>
              <span>{errors.bio || 'Опишите себя как артиста'}</span>
              <span>{formData.bio.length}/500</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-lg leading-relaxed">{formData.bio}</p>
        )}
      </motion.div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location */}
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
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Москва, Россия"
          />
        </motion.div>

        {/* Website */}
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
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
              errors.website ? 'border-red-400' : 'border-white/10'
            } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
            placeholder="https://yourwebsite.com"
          />
          {errors.website && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.website}
            </p>
          )}
        </motion.div>

        {/* Email */}
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
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
              errors.email ? 'border-red-400' : 'border-white/10'
            } text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </motion.div>

        {/* Phone */}
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
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="+7 (999) 123-45-67"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone}
            </p>
          )}
        </motion.div>
      </div>

      {/* Social Media */}
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
            const socialValue = formData.socials[platform.key as keyof typeof formData.socials] || '';
            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                className={`p-6 rounded-xl ${platform.bg} border ${platform.border}`}
              >
                <label className={`block ${platform.color} text-sm mb-3 flex items-center gap-2 font-semibold`}>
                  <Icon className="w-5 h-5" />
                  {platform.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={socialValue}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    disabled={!isEditing}
                    placeholder={`${platform.name.toLowerCase()}.com/username`}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {socialValue && !isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.open(`https://${socialValue}`, '_blank')}
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
    </div>
  );
}