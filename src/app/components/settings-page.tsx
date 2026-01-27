import { 
  Bell, Lock, CreditCard, Globe, Moon, Sun, Eye, EyeOff, Shield, 
  Smartphone, Monitor, Download, Trash2, Check, X, Mail, Phone, 
  Camera, Edit2, Key, AlertCircle, Info, Crown, Zap, Palette, 
  User, LogOut, ChevronRight, Plus, Save, Settings as SettingsIcon, 
  BarChart3, ChevronDown, Music2, Link as LinkIcon, Headphones, 
  Heart, Share2, DollarSign, TrendingUp, RotateCcw, Wallet 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { toast } from 'sonner';

type TabType = 'profile' | 'security' | 'notifications' | 'privacy' | 'payment' | 'subscription' | 'appearance' | 'integrations' | 'analytics' | 'advanced';

interface PaymentMethod {
  id: number;
  type: 'visa' | 'mastercard' | 'mir' | 'yoomoney';
  last4: string;
  expires: string;
  isDefault: boolean;
}

interface Session {
  id: number;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  username: string;
  connected: boolean;
  followers?: number;
}

interface StreamingPlatform {
  id: string;
  name: string;
  connected: boolean;
  profileUrl?: string;
  streams?: number;
  revenue?: number;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Profile states
  const [profileName, setProfileName] = useState('Александр Иванов');
  const [profileStage, setProfileStage] = useState('alexandr_music');
  const [profileEmail, setProfileEmail] = useState('artist@promo.music');
  const [profilePhone, setProfilePhone] = useState('+7 (999) 123-45-67');
  const [profileBio, setProfileBio] = useState('Электронный музыкант из Москвы 🎵');
  const [profileGenres, setProfileGenres] = useState(['Electronic', 'Ambient', 'Techno']);
  const [profileCity, setProfileCity] = useState('Москва');
  const [profileCountry, setProfileCountry] = useState('Россия');
  const [profileWebsite, setProfileWebsite] = useState('https://alexandrmusic.com');
  const [profileAvatar, setProfileAvatar] = useState('https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400');
  
  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'Instagram', url: 'https://instagram.com/alexandr_music', username: '@alexandr_music', connected: true, followers: 12500 },
    { platform: 'YouTube', url: 'https://youtube.com/@alexandrmusic', username: '@alexandrmusic', connected: true, followers: 8300 },
    { platform: 'TikTok', url: '', username: '', connected: false },
    { platform: 'VK', url: 'https://vk.com/alexandr_music', username: 'alexandr_music', connected: true, followers: 5200 },
  ]);

  // Streaming platforms
  const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([
    { id: 'spotify', name: 'Spotify', connected: true, streams: 125000, revenue: 350 },
    { id: 'apple', name: 'Apple Music', connected: true, streams: 85000, revenue: 280 },
    { id: 'yandex', name: 'Яндекс.Музыка', connected: true, streams: 95000, revenue: 420 },
    { id: 'youtube_music', name: 'YouTube Music', connected: false },
    { id: 'soundcloud', name: 'SoundCloud', connected: false },
  ]);
  
  // Notifications states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifyNewDonations, setNotifyNewDonations] = useState(true);
  const [notifyNewMessages, setNotifyNewMessages] = useState(true);
  const [notifyNewComments, setNotifyNewComments] = useState(true);
  const [notifyAnalytics, setNotifyAnalytics] = useState(true);
  const [notifyNewFollowers, setNotifyNewFollowers] = useState(true);
  const [notifyStreamMilestones, setNotifyStreamMilestones] = useState(true);
  const [notifyMarketingCampaigns, setNotifyMarketingCampaigns] = useState(true);
  const [notifySubscriptionExpiry, setNotifySubscriptionExpiry] = useState(true);
  
  // Privacy states
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'followers'>('public');
  const [allowMessages, setAllowMessages] = useState<'everyone' | 'followers' | 'none'>('everyone');
  const [showStats, setShowStats] = useState(true);
  const [showDonations, setShowDonations] = useState(true);
  const [allowSearch, setAllowSearch] = useState(true);
  const [showInRatings, setShowInRatings] = useState(true);
  
  // Appearance states
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [language, setLanguage] = useState('ru');
  const [fontSize, setFontSize] = useState(16);
  const [accentColor, setAccentColor] = useState('cyan');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Analytics states
  const [trackPageViews, setTrackPageViews] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [trackListens, setTrackListens] = useState(true);
  const [trackDonations, setTrackDonations] = useState(true);
  const [shareDataWithPartners, setShareDataWithPartners] = useState(false);
  
  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, device: 'Chrome на Windows', location: 'Москва, Россия', ip: '192.168.1.1', lastActive: 'Сейчас', current: true },
    { id: 2, device: 'Safari на iPhone 15', location: 'Санкт-Петербург, Россия', ip: '192.168.1.2', lastActive: '2 часа назад', current: false },
    { id: 3, device: 'Firefox на MacBook', location: 'Казань, Россия', ip: '192.168.1.3', lastActive: '1 день назад', current: false },
  ]);
  
  // Payment states
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, type: 'visa', last4: '4242', expires: '12/25', isDefault: true },
    { id: 2, type: 'mastercard', last4: '8888', expires: '06/26', isDefault: false },
    { id: 3, type: 'mir', last4: '1234', expires: '09/27', isDefault: false },
  ]);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'profile' as TabType, label: 'Профиль', icon: User },
    { id: 'security' as TabType, label: 'Безопасность', icon: Shield },
    { id: 'notifications' as TabType, label: 'Уведомления', icon: Bell },
    { id: 'privacy' as TabType, label: 'Приватность', icon: Eye },
    { id: 'payment' as TabType, label: 'Оплата', icon: CreditCard },
    { id: 'subscription' as TabType, label: 'Подписка', icon: Crown },
    { id: 'integrations' as TabType, label: 'Интеграции', icon: LinkIcon },
    { id: 'analytics' as TabType, label: 'Аналитика', icon: BarChart3 },
    { id: 'appearance' as TabType, label: 'Внешний вид', icon: Palette },
    { id: 'advanced' as TabType, label: 'Дополнительно', icon: SettingsIcon },
  ];

  const genres = ['Electronic', 'Ambient', 'Techno', 'House', 'Trance', 'Drum & Bass', 'Dubstep', 'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz', 'Classical'];
  
  const accentColors = [
    { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500' },
    { id: 'purple', name: 'Purple', bg: 'bg-purple-500' },
    { id: 'green', name: 'Green', bg: 'bg-green-500' },
    { id: 'orange', name: 'Orange', bg: 'bg-orange-500' },
    { id: 'pink', name: 'Pink', bg: 'bg-pink-500' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 sm:w-12 sm:h-7 md:w-14 md:h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? 'bg-cyan-500' : 'bg-white/20'
      }`}
    >
      <motion.div
        layout
        className={`absolute top-0.5 sm:top-1 w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
          enabled ? 'left-5 sm:left-6 md:left-7' : 'left-0.5 sm:left-1'
        }`}
      />
    </button>
  );

  const SettingCard = ({ 
    title, 
    description, 
    action 
  }: { 
    title: string; 
    description: string; 
    action: React.ReactNode;
  }) => (
    <div className="p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold mb-1 text-sm sm:text-base">{title}</div>
        <div className="text-gray-400 text-xs sm:text-sm">{description}</div>
      </div>
      <div className="w-full sm:w-auto flex-shrink-0">
        {action}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen px-2 sm:px-4 pb-20 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 pt-4 sm:pt-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
            Настройки
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-400">
            Управление аккаунтом и предпочтениями
          </p>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {currentTab && (
                <>
                  <currentTab.icon className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold text-sm sm:text-base">{currentTab.label}</span>
                </>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showMobileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2">
                  <div className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setShowMobileMenu(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-3 text-left ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base font-semibold">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 sticky top-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-left ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-semibold flex-1">{tab.label}</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Avatar Section */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Camera className="w-6 h-6 text-cyan-400" />
                      Фото профиля
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative group flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-cyan-400/30">
                          <ImageWithFallback
                            src={profileAvatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileAvatar(reader.result as string);
                              toast.success('Аватар загружен!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">Измените фото профиля</p>
                        <p className="text-gray-400 text-sm mb-3">JPG, PNG или GIF. Максимум 5 МБ</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm"
                          >
                            Загрузить
                          </button>
                          <button
                            onClick={() => {
                              setProfileAvatar('');
                              toast.success('Аватар удалён');
                            }}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Edit2 className="w-6 h-6 text-cyan-400" />
                      Личная информация
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Имя артиста
                        </label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Сценическое имя
                        </label>
                        <input
                          type="text"
                          value={profileStage}
                          onChange={(e) => setProfileStage(e.target.value)}
                          placeholder="@username"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Телефон
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          О себе
                        </label>
                        <textarea
                          rows={4}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Music2 className="w-6 h-6 text-cyan-400" />
                      Музыкальные жанры
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">Выберите до 5 жанров</p>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => {
                        const isSelected = profileGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            onClick={() =>
                              setProfileGenres((prev) =>
                                prev.includes(genre)
                                  ? prev.filter((g) => g !== genre)
                                  : [...prev, genre]
                              )
                            }
                            disabled={!isSelected && profileGenres.length >= 5}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                              isSelected
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50'
                            }`}
                          >
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                      Выбрано: {profileGenres.length}/5
                    </p>
                  </div>

                  <button
                    onClick={() => toast.success('Профиль сохранён!')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Сохранить изменения
                  </button>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-purple-400" />
                      Безопасность
                    </h3>
                    <div className="space-y-3">
                      <SettingCard
                        title="Изменить пароль"
                        description="Последнее изменение: 3 месяца назад"
                        action={
                          <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm"
                          >
                            Изменить
                          </button>
                        }
                      />
                      <SettingCard
                        title="Двухфакторная аутентификация"
                        description={twoFactorEnabled ? 'Включена' : 'Отключена'}
                        action={
                          <ToggleSwitch
                            enabled={twoFactorEnabled}
                            onChange={() => {
                              setTwoFactorEnabled(!twoFactorEnabled);
                              toast.success(twoFactorEnabled ? '2FA отключена' : '2FA включена');
                            }}
                          />
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-6 h-6 text-cyan-400" />
                      Уведомления
                    </h3>
                    <div className="space-y-3">
                      <SettingCard
                        title="Push-уведомления"
                        description="Получайте уведомления в браузере"
                        action={
                          <ToggleSwitch
                            enabled={pushNotifications}
                            onChange={() => setPushNotifications(!pushNotifications)}
                          />
                        }
                      />
                      <SettingCard
                        title="Email-уведомления"
                        description="Получайте уведомления на почту"
                        action={
                          <ToggleSwitch
                            enabled={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                          />
                        }
                      />
                      <SettingCard
                        title="Новые донаты"
                        description="Уведомлять о новых донатах"
                        action={
                          <ToggleSwitch
                            enabled={notifyNewDonations}
                            onChange={() => setNotifyNewDonations(!notifyNewDonations)}
                          />
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-emerald-400" />
                      Приватность
                    </h3>
                    <div className="space-y-3">
                      {/* Visibility of Profile */}
                      <div className="p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-2">
                          Видимость профиля
                        </label>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3">
                          Кто может видеть ваш профиль
                        </p>
                        <select
                          value={profileVisibility}
                          onChange={(e) => {
                            setProfileVisibility(e.target.value as 'public' | 'private' | 'followers');
                            toast.success('Настройки приватности обновлены');
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 [&>option]:bg-gray-900 [&>option]:text-white"
                        >
                          <option value="public">Публичный - все могут видеть</option>
                          <option value="followers">Только подписчики</option>
                          <option value="private">Приватный - никто не видит</option>
                        </select>
                      </div>

                      {/* Allow Messages From */}
                      <div className="p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-2">
                          Кто может писать сообщения
                        </label>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3">
                          Настройте кто может отправлять вам сообщения
                        </p>
                        <select
                          value={allowMessages}
                          onChange={(e) => {
                            setAllowMessages(e.target.value as 'everyone' | 'followers' | 'none');
                            toast.success('Настройки сообщений обновлены');
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 [&>option]:bg-gray-900 [&>option]:text-white"
                        >
                          <option value="everyone">Все пользователи</option>
                          <option value="followers">Только подписчики</option>
                          <option value="none">Никто</option>
                        </select>
                      </div>

                      <SettingCard
                        title="Онлайн статус"
                        description="Показывать когда вы онлайн"
                        action={
                          <ToggleSwitch
                            enabled={showOnlineStatus}
                            onChange={() => setShowOnlineStatus(!showOnlineStatus)}
                          />
                        }
                      />
                      <SettingCard
                        title="Время последнего визита"
                        description="Показывать последнюю активность"
                        action={
                          <ToggleSwitch
                            enabled={showLastSeen}
                            onChange={() => setShowLastSeen(!showLastSeen)}
                          />
                        }
                      />
                      <SettingCard
                        title="Статистика профиля"
                        description="Показывать статистику прослушиваний"
                        action={
                          <ToggleSwitch
                            enabled={showStats}
                            onChange={() => setShowStats(!showStats)}
                          />
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-green-400" />
                        Способы оплаты
                      </h3>
                      <button
                        onClick={() => {
                          const newId = Math.max(...paymentMethods.map(m => m.id)) + 1;
                          setPaymentMethods([...paymentMethods, {
                            id: newId,
                            type: 'visa',
                            last4: '0000',
                            expires: '12/28',
                            isDefault: false
                          }]);
                          toast.success('Способ оплаты добавлен');
                        }}
                        className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Добавить
                      </button>
                    </div>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold">
                                    {method.type.toUpperCase()} •••• {method.last4}
                                  </span>
                                  {method.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                                      Основной
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Истекает {method.expires}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!method.isDefault && (
                                <button
                                  onClick={() => {
                                    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === method.id })));
                                    toast.success('Способ по умолчанию');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-semibold"
                                >
                                  По умолчанию
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
                                  toast.success('Способ удалён');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Current Plan */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      Текущий план
                    </h3>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-6 h-6 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">PRO Plan</span>
                          </div>
                          <p className="text-gray-300">Активен до 27 февраля 2026</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white">₽990</div>
                          <div className="text-gray-400 text-sm">/месяц</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span>Безлимитные треки</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span>Продвинутая аналитика</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span>Приоритетная поддержка</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span>Без комиссий</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                          Продлить
                        </button>
                        <button
                          onClick={() => toast.info('Подписка отменена')}
                          className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold"
                        >
                          Отменить
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Other Plans */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Другие планы</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="text-lg font-bold text-white mb-2">Базовый</h4>
                        <div className="text-2xl font-bold text-cyan-400 mb-3">Бесплатно</div>
                        <ul className="space-y-2 text-sm text-gray-300 mb-4">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            До 5 треков
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            Базовая аналитика
                          </li>
                          <li className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400" />
                            Комиссия 15%
                          </li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                        <h4 className="text-lg font-bold text-white mb-2">Enterprise</h4>
                        <div className="text-2xl font-bold text-purple-400 mb-3">По запросу</div>
                        <ul className="space-y-2 text-sm text-gray-300 mb-4">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            Всё из PRO
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            Персональный менеджер
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            API доступ
                          </li>
                        </ul>
                        <button className="w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold">
                          Связаться
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'integrations' && (
                <motion.div
                  key="integrations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Social Networks */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Share2 className="w-6 h-6 text-blue-400" />
                      Социальные сети
                    </h3>
                    <div className="space-y-3">
                      {socialLinks.map((link) => (
                        <div key={link.platform} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                link.connected ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-white/10'
                              }`}>
                                <Share2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold">{link.platform}</span>
                                  {link.connected && (
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                      Подключено
                                    </span>
                                  )}
                                </div>
                                {link.connected ? (
                                  <div className="text-gray-400 text-sm">
                                    {link.username} • {link.followers?.toLocaleString()} подписчиков
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm">Не подключено</div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSocialLinks(prev => prev.map(l => 
                                  l.platform === link.platform ? { ...l, connected: !l.connected } : l
                                ));
                                toast.success(link.connected ? 'Отключено' : 'Подключено');
                              }}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                                link.connected
                                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                              }`}
                            >
                              {link.connected ? 'Отключить' : 'Подключить'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Streaming Platforms */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Headphones className="w-6 h-6 text-purple-400" />
                      Стриминговые платформы
                    </h3>
                    <div className="space-y-3">
                      {streamingPlatforms.map((platform) => (
                        <div key={platform.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                platform.connected ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-white/10'
                              }`}>
                                <Headphones className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold">{platform.name}</span>
                                  {platform.connected && (
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                      Подключено
                                    </span>
                                  )}
                                </div>
                                {platform.connected ? (
                                  <div className="text-gray-400 text-sm">
                                    {platform.streams?.toLocaleString()} прослушиваний • ₽{platform.revenue}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm">Не подключено</div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setStreamingPlatforms(prev => prev.map(p => 
                                  p.id === platform.id ? { ...p, connected: !p.connected } : p
                                ));
                                toast.success(platform.connected ? 'Отключено' : 'Подключено');
                              }}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                                platform.connected
                                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                              }`}
                            >
                              {platform.connected ? 'Отключить' : 'Подключить'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-pink-400" />
                      Настройки аналитики
                    </h3>
                    <div className="space-y-3">
                      <SettingCard
                        title="Отслеживать просмотры страниц"
                        description="Собирать статистику посещений профиля"
                        action={
                          <ToggleSwitch
                            enabled={trackPageViews}
                            onChange={() => setTrackPageViews(!trackPageViews)}
                          />
                        }
                      />
                      <SettingCard
                        title="Отслеживать клики"
                        description="Анализировать взаимодействия пользователей"
                        action={
                          <ToggleSwitch
                            enabled={trackClicks}
                            onChange={() => setTrackClicks(!trackClicks)}
                          />
                        }
                      />
                      <SettingCard
                        title="Отслеживать прослушивания"
                        description="Собирать данные о прослушиваниях треков"
                        action={
                          <ToggleSwitch
                            enabled={trackListens}
                            onChange={() => setTrackListens(!trackListens)}
                          />
                        }
                      />
                      <SettingCard
                        title="Отслеживать донаты"
                        description="Анализировать транзакции и донаты"
                        action={
                          <ToggleSwitch
                            enabled={trackDonations}
                            onChange={() => setTrackDonations(!trackDonations)}
                          />
                        }
                      />
                      <SettingCard
                        title="Делиться данными с партнёрами"
                        description="Передавать анонимную аналитику партнёрам"
                        action={
                          <ToggleSwitch
                            enabled={shareDataWithPartners}
                            onChange={() => setShareDataWithPartners(!shareDataWithPartners)}
                          />
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Theme */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Moon className="w-6 h-6 text-indigo-400" />
                      Тема оформления
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark' as const, label: 'Тёмная', icon: Moon },
                        { id: 'light' as const, label: 'Светлая', icon: Sun },
                        { id: 'auto' as const, label: 'Авто', icon: Monitor },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setTheme(item.id);
                            toast.success(`Тема: ${item.label}`);
                          }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            theme === item.id
                              ? 'bg-cyan-500/20 border-cyan-400'
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <item.icon className={`w-8 h-8 mx-auto mb-2 ${theme === item.id ? 'text-cyan-400' : 'text-gray-400'}`} />
                          <div className="text-center text-white font-semibold text-sm">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Palette className="w-6 h-6 text-rose-400" />
                      Акцентный цвет
                    </h3>
                    <div className="flex gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => {
                            setAccentColor(color.id);
                            toast.success(`Цвет: ${color.name}`);
                          }}
                          className={`w-16 h-16 rounded-xl ${color.bg} flex items-center justify-center transition-all ${
                            accentColor === color.id ? 'ring-4 ring-white/50 scale-110' : 'hover:scale-105'
                          }`}
                        >
                          {accentColor === color.id && <Check className="w-8 h-8 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Other Settings */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Дополнительные настройки</h3>
                    <div className="space-y-3">
                      <SettingCard
                        title="Компактный режим"
                        description="Уменьшить отступы между элементами"
                        action={
                          <ToggleSwitch
                            enabled={compactMode}
                            onChange={() => setCompactMode(!compactMode)}
                          />
                        }
                      />
                      <SettingCard
                        title="Анимации"
                        description="Включить плавные анимации интерфейса"
                        action={
                          <ToggleSwitch
                            enabled={animationsEnabled}
                            onChange={() => setAnimationsEnabled(!animationsEnabled)}
                          />
                        }
                      />
                      <div className="p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-2">Размер шрифта: {fontSize}px</label>
                        <input
                          type="range"
                          min="12"
                          max="20"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Language */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-6 h-6 text-blue-400" />
                      Язык интерфейса
                    </h3>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        toast.success('Язык изменён');
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="uk">Українська</option>
                      <option value="kz">Қазақша</option>
                    </select>
                  </div>

                  {/* Data Export */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Download className="w-6 h-6 text-green-400" />
                      Экспорт данных
                    </h3>
                    <p className="text-gray-400 mb-4">Скачайте копию ваших данных в формате JSON</p>
                    <button
                      onClick={() => toast.success('Экспорт запущен!')}
                      className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Экспортировать данные
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      Удаление аккаунта
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Внимание! Это действие необратимо. Все ваши данные, треки и статистика будут удалены навсегда.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Вы уверены? Это действие нельзя отменить!')) {
                          toast.error('Аккаунт удалён');
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Удалить аккаунт навсегда
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}