import { Music2, Home, User, Video, Calendar, Newspaper, DollarSign, TrendingUp, BarChart3, MessageSquare, User as UserIcon, Coins, Menu, X, Target, Rocket, Crown, Image as ImageIcon, Bell, Wallet } from 'lucide-react';
import { HomePage } from '@/app/components/home-page';
import { AnalyticsPage } from '@/app/components/analytics-page';
import { ProfilePage } from '@/app/components/profile-page';
import { TracksPage } from '@/app/components/tracks-page';
import { VideoPage } from '@/app/components/video-page';
import { MyConcertsPage } from '@/app/components/my-concerts-page';
import { NewsPage } from '@/app/components/news-page';
import { DonationsPage } from '@/app/components/donations-page';
import { PitchingPage } from '@/app/components/pitching-page';
import { RatingPage } from '@/app/components/rating-page';
import { MessagesPage } from '@/app/components/messages-page';
import { SettingsPage } from '@/app/components/settings-page';
import { CoinsModal } from '@/app/components/coins-modal';
import { TrackDetailPage } from '@/app/components/track-detail-page';
import { DemoDataButton } from '@/app/components/demo-data-button';
import { QuickTestButton } from '@/app/components/quick-test-button';
import { StorageTestButton } from '@/app/components/storage-test-button';
import { MarketingPage } from '@/app/components/marketing-page';
import { PromotionMarketing } from '@/app/components/promotion-marketing';
import { SubscriptionPage } from '@/app/components/subscription-page';
import { NotificationsPage } from '@/app/components/notifications-page';
import { NotificationBell } from '@/app/components/notification-bell';
import { PaymentsPage } from '@/app/components/payments-page';
import { TestStorage } from '@/app/pages/TestStorage';
import { PromotionHub } from '@/app/pages/PromotionHub';
import { PromotionPitching } from '@/app/pages/PromotionPitching';
import { BannerHub } from '@/app/pages/BannerHub';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

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

interface ConcertData {
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
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  views: number;
  clicks: number;
  isPaid: boolean;
}

interface NewsData {
  id: number;
  title: string;
  content: string;
  preview: string;
  coverImage: string;
  date: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  views: number;
  likes: number;
  comments: number;
  isPaid: boolean;
  createdAt: string;
}

// Demo Pro subscription для демонстрации возможностей
const DEMO_SUBSCRIPTION = {
  tier: 'pro' as const,
  expires_at: '2026-12-31',
  features: ['priority_support', 'advanced_analytics', 'marketing_discount'],
  limits: {
    tracks: 100,
    videos: 50,
    storage_gb: 50,
    donation_fee: 0.05,
    marketing_discount: 0.15,
    coins_bonus: 0.15,
    pitching_discount: 0.15,
  },
  price: 1490,
  status: 'active' as const,
};

// Основной компонент приложения (без провайдеров)
function AppContent() {
  const [activeSection, setActiveSection] = useState('home');
  const [coinsBalance, setCoinsBalance] = useState(1250);
  const [newsItems, setNewsItems] = useState<NewsData[]>([]);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Message context - для открытия чата с конкретным пользователем
  const [messageContext, setMessageContext] = useState<{
    userId: string;
    userName: string;
    userAvatar?: string;
  } | null>(null);
  
  // Subscription state - добавлено для системы подписок
  const [userSubscription, setUserSubscription] = useState<{
    tier: 'free' | 'basic' | 'pro' | 'premium';
    expires_at: string;
    features: string[];
  }>({
    tier: 'pro', // Для демо используем Pro подписку
    expires_at: '2026-12-31',
    features: ['priority_support', 'advanced_analytics', 'marketing_discount'],
  });
  
  // Global profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Александр Иванов',
    username: 'alexandr_music',
    bio: 'Электронный музыкант из Москвы. Создаю атмосферную музыку на стыке ambient и techno. 🎵',
    location: 'Москва, Россия',
    website: 'https://alexandrmusic.com',
    email: 'contact@alexandrmusic.com',
    phone: '+7 (999) 123-45-67',
    avatar: (import.meta.env.VITE_PLACEHOLDER_IMAGE_BASE_URL || 'https://picsum.photos') + "/200/200?sig=artist",
    socials: {
      instagram: 'alexandr_music',
      twitter: 'alexandr_music',
      facebook: '',
      youtube: '@alexandrmusic',
    }
  });

  // Global concerts state
  const [globalConcerts, setGlobalConcerts] = useState<ConcertData[]>([
    {
      id: 1,
      title: 'Summer Music Fest 2026',
      date: '2026-06-15',
      time: '19:00',
      city: 'Москва',
      venue: 'Олимпийский',
      type: 'Фестиваль',
      description: 'Грандиозный летний фестиваль с участием топовых артистов',
      banner: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      ticketPriceFrom: '2000',
      ticketPriceTo: '8000',
      ticketLink: 'https://tickets.example.com/summer-fest',
      status: 'approved',
      views: 15400,
      clicks: 850,
      isPaid: true,
    },
    {
      id: 2,
      title: 'Acoustic Night',
      date: '2026-04-20',
      time: '20:00',
      city: 'Санкт-Петербург',
      venue: 'A2 Green Concert',
      type: 'Акустический сет',
      description: 'Интимный акустический концерт в камерной обстановке',
      banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      ticketPriceFrom: '1500',
      ticketPriceTo: '3500',
      ticketLink: 'https://tickets.example.com/acoustic',
      status: 'approved',
      views: 8200,
      clicks: 420,
      isPaid: true,
    },
  ]);

  // Get promoted concerts (approved + paid)
  const promotedConcerts = globalConcerts
    .filter(c => c.status === 'approved' && c.isPaid)
    .map(c => ({
      id: c.id,
      title: c.title,
      date: c.date,
      time: c.time,
      city: c.city,
      venue: c.venue,
      type: c.type,
      description: c.description,
      banner: c.banner,
      ticketPriceFrom: c.ticketPriceFrom,
      ticketPriceTo: c.ticketPriceTo,
      ticketLink: c.ticketLink,
      views: c.views,
      clicks: c.clicks,
    }));

  // Get promoted news (approved + paid)
  const promotedNews = newsItems.filter(n => n.status === 'approved' && n.isPaid);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'tracks', icon: Music2, label: 'Мои треки' },
    { id: 'video', icon: Video, label: 'Мои видео' },
    { id: 'banner-list', icon: ImageIcon, label: 'Баннерная реклама' },
    { id: 'concerts', icon: Calendar, label: 'Мои концерты' },
    { id: 'promotion', icon: Rocket, label: 'Продвижение' },
    { id: 'news', icon: Newspaper, label: 'Мои новости' },
    { id: 'settings', icon: UserIcon, label: 'Настройки' },
  ];

  const appContent = (
    <div className="relative min-h-screen">
      {/* Mobile Menu Button - только на мобильных */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[110] w-12 h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg touch-manipulation"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - адаптивный */}
      <motion.div
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : -288, // -288px = -w-72
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:translate-x-0 fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-gray-900/95 lg:bg-white/5 border-r border-white/10 overflow-y-auto z-[100] lg:z-10"
      >
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-8 cursor-pointer group"
          onClick={() => {
            setActiveSection('home');
            setIsMobileMenuOpen(false);
          }}
        >
          <div className="relative w-10 h-10 flex-shrink-0">
            <Music2 className="w-full h-full text-cyan-400" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg group-hover:opacity-100 opacity-0 transition-opacity"></div>
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">PROMO.MUSIC</div>
            <div className="text-gray-400 text-xs">Кабинет артиста</div>
          </div>
        </motion.div>

        {/* User Profile */}
        <div className="mb-8 space-y-3">
          {/* Avatar and Name */}
          <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <button
              onClick={() => {
                setActiveSection('profile');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 flex-shrink-0 rounded-full ring-2 ring-cyan-400/50 group-hover:ring-cyan-400 bg-cover bg-center bg-no-repeat transition-all duration-300 cursor-pointer group-hover:scale-105"
                  style={{ 
                    backgroundImage: `url(${profileData.avatar})`,
                    aspectRatio: '1/1'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate group-hover:text-cyan-400 transition-colors">{profileData.name}</div>
                  <div className="text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors">{profileData.email}</div>
                </div>
              </div>
            </button>
          </div>
          
          {/* Subscription Badge */}
          {userSubscription.tier !== 'free' && (
            <button
              onClick={() => {
                console.log('PRO button clicked! Navigating to payments -> subscription...');
                setActiveSection('payments');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all duration-300 flex items-center justify-between group cursor-pointer touch-manipulation select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center gap-2 pointer-events-none">
                <Crown className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-purple-400 text-sm font-bold">{userSubscription.tier.toUpperCase()}</span>
              </div>
              <span className="text-xs text-gray-300 group-hover:text-white transition-colors pointer-events-none">Управление</span>
            </button>
          )}
          
          {/* Coins Balance */}
          <button 
            onClick={() => {
              setShowCoinsModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400/50 transition-all duration-300 flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />
              <span className="text-yellow-400 text-sm font-bold">{coinsBalance}</span>
            </div>
            <span className="text-xs text-gray-300 group-hover:text-white transition-colors">Купить</span>
          </button>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false); // Закрыть меню на мобильных
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-white shadow-lg shadow-cyan-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''} group-hover:scale-110 transition-transform`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Main Content - адаптивный */}
      <main className="ml-0 lg:ml-72 flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        <AnimatePresence>
          {activeSection === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsPage />
            </motion.div>
          )}

          {activeSection === 'donations' && (
            <motion.div
              key="donations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DonationsPage 
                userCoins={coinsBalance} 
                onCoinsUpdate={setCoinsBalance}
              />
            </motion.div>
          )}

          {activeSection === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage 
                onNavigate={setActiveSection} 
                promotedConcerts={promotedConcerts}
                promotedNews={promotedNews}
              />
            </motion.div>
          )}

          {activeSection === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfilePage 
                profileData={profileData}
                onProfileUpdate={setProfileData}
              />
            </motion.div>
          )}

          {activeSection === 'tracks' && (
            <motion.div
              key="tracks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {selectedTrackId !== null ? (
                <TrackDetailPage 
                  trackId={selectedTrackId} 
                  onBack={() => setSelectedTrackId(null)}
                  onNavigate={setActiveSection}
                  profileData={{
                    name: profileData.name,
                    avatar: profileData.avatar
                  }}
                />
              ) : (
                <TracksPage 
                  userCoins={coinsBalance} 
                  onCoinsUpdate={setCoinsBalance}
                  onTrackClick={setSelectedTrackId}
                />
              )}
            </motion.div>
          )}

          {activeSection === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <VideoPage userCoins={coinsBalance} onCoinsUpdate={setCoinsBalance} />
            </motion.div>
          )}

          {activeSection === 'concerts' && (
            <motion.div
              key="concerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <MyConcertsPage userCoins={coinsBalance} onCoinsUpdate={setCoinsBalance} />
            </motion.div>
          )}

          {activeSection === 'promotion' && (
            <motion.div
              key="promotion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PromotionHub />
            </motion.div>
          )}

          {activeSection === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <NewsPage 
                userCoins={coinsBalance} 
                onCoinsUpdate={setCoinsBalance}
                onNewsUpdate={setNewsItems}
              />
            </motion.div>
          )}

          {activeSection === 'rating' && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <RatingPage />
            </motion.div>
          )}

          {activeSection === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsPage />
            </motion.div>
          )}

          {activeSection === 'subscription' && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SubscriptionPage 
                userId="artist_demo_001"
                currentSubscription={{
                  ...userSubscription,
                  price: 1490,
                  status: 'active' as const,
                }}
                onSubscriptionChange={(sub) => {
                  setUserSubscription({
                    tier: sub.tier,
                    expires_at: sub.expires_at,
                    features: sub.features,
                  });
                }}
              />
            </motion.div>
          )}

          {(activeSection === 'banner-list') && (
            <motion.div
              key="banner-hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <BannerHub 
                userId="artist_demo_001" 
                userEmail={profileData.email}
              />
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <NotificationsPage 
                onOpenChat={(userId, userName, userAvatar) => {
                  setMessageContext({ userId, userName, userAvatar });
                  setActiveSection('messages');
                }}
              />
            </motion.div>
          )}

          {activeSection === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentsPage 
                onReplyToDonator={(userId, userName, userAvatar) => {
                  setMessageContext({ userId, userName, userAvatar });
                  setActiveSection('messages');
                }}
              />
            </motion.div>
          )}

          {activeSection === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <MessagesPage 
                initialUser={messageContext}
                onMessageContextClear={() => setMessageContext(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {appContent}

      {/* Top Right Actions */}
      <div className="fixed top-4 right-4 z-[120] flex items-center gap-2">
        {/* Wallet/Payments Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setActiveSection('payments');
            setIsMobileMenuOpen(false);
          }}
          className="w-12 h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg hover:bg-white/20 transition-all touch-manipulation relative group"
        >
          <Wallet className="w-6 h-6" />
          {/* Tooltip */}
          <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Платежи и финансы
          </div>
        </motion.button>

        {/* Notification Bell */}
        <NotificationBell onClick={() => {
          setActiveSection('notifications');
          setIsMobileMenuOpen(false);
        }} />
      </div>

      {/* Coins Modal */}
      {showCoinsModal && (
        <CoinsModal
          balance={coinsBalance}
          onClose={() => setShowCoinsModal(false)}
          onBalanceUpdate={setCoinsBalance}
        />
      )}

      {/* Demo Data Button */}
      <DemoDataButton />
      
      {/* Quick Test Button - только в разделе "Мои концерты" */}
      {activeSection === 'concerts' && <QuickTestButton />}
      
      {/* Storage Test Button */}
      <StorageTestButton />
      
      {/* Toast Notifications */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
  );
}

export default function App() {
  console.log('[App] Rendering with providers');
  
  return (
    <AuthProvider>
      <SubscriptionProvider userId="demo-user-123" initialSubscription={DEMO_SUBSCRIPTION}>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
}