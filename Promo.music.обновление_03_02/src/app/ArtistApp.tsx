import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Music2, Video, Calendar, FileText, FlaskConical,
  Rocket, TrendingUp, Wallet, Settings, LogOut, X, Menu, Coins, DollarSign,
  HelpCircle
} from 'lucide-react';

// Components
import { HomePage } from '@/app/components/home-page';
import { TracksPage } from '@/app/components/tracks-page';
import { VideoPage } from '@/app/components/video-page';
import { MyConcertsPage } from '@/app/components/my-concerts-page';
import { NewsPage } from '@/app/components/news-page';
import TrackTestPage from '@/app/pages/TrackTestPage';
import { PitchingPage } from '@/app/components/pitching-page';
import { AnalyticsPage } from '@/app/components/analytics-page';
import { PaymentsPage } from '@/app/components/payments-page';
import { FinancesPage } from '@/app/components/finances-page';
import { SettingsPage } from '@/app/components/settings-page';
import { PricingPage } from '@/app/components/pricing-page';
import { SupportPage } from '@/app/components/support-page';
import { CoinsModal } from '@/app/components/coins-modal';
import { WorkspaceSwitcher } from '@/app/components/workspace-switcher';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Toaster } from 'sonner';

// Assets
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

interface ArtistAppProps {
  onLogout: () => void;
}

export default function ArtistApp({ onLogout }: ArtistAppProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coinsBalance, setCoinsBalance] = useState(1250);
  const [showCoinsModal, setShowCoinsModal] = useState(false);

  // User data
  const userData = {
    name: 'Александр Иванов',
    email: 'contact@alexandr.music',
    avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400',
    initials: 'АИ',
  };

  // Menu structure according to /ARCHITECTURE.md and /MENU_FIX_JANUARY_29.md
  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Главная' },
    { id: 'tracks', icon: Music2, label: 'Мои треки' },
    { id: 'video', icon: Video, label: 'Мои видео' },
    { id: 'concerts', icon: Calendar, label: 'Мои концерты' },
    { id: 'news', icon: FileText, label: 'Мои новости' },
    { id: 'track-test', icon: FlaskConical, label: 'Тест трека' },
    { id: 'pitching', icon: Rocket, label: 'Продвижение' },
    { id: 'pricing', icon: DollarSign, label: 'Тарифы' },
    { id: 'analytics', icon: TrendingUp, label: 'Аналитика' },
    { id: 'payments', icon: Wallet, label: 'Финансы' },
    { id: 'support', icon: HelpCircle, label: 'Поддержка' },
    { id: 'settings', icon: Settings, label: 'Настройки' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      case 'tracks':
        return <TracksPage />;
      case 'video':
        return <VideoPage />;
      case 'concerts':
        return <MyConcertsPage />;
      case 'news':
        return <NewsPage />;
      case 'track-test':
        return <TrackTestPage />;
      case 'pitching':
        return <PitchingPage userCoins={coinsBalance} onCoinsUpdate={setCoinsBalance} />;
      case 'pricing':
        return <PricingPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'payments':
        return <FinancesPage />;
      case 'support':
        return <SupportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[150] w-12 h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-gray-900/95 lg:bg-white/5 border-r border-white/10 overflow-y-auto z-[100] lg:z-10 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
            <img src={promoLogo} alt="promo.music" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">PROMO.MUSIC</h1>
            <p className="text-xs text-purple-300">Кабинет артиста</p>
          </div>
        </div>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {userData.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">{userData.name}</div>
              <div className="text-gray-400 text-sm truncate">{userData.email}</div>
            </div>
          </div>
          
          {/* Coins Balance */}
          <button
            onClick={() => setShowCoinsModal(true)}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-100 font-semibold">{coinsBalance}</span>
              </div>
              <span className="text-yellow-200 text-sm group-hover:scale-105 transition-transform">
                Купить
              </span>
            </div>
          </button>
        </motion.div>

        {/* Workspace Switcher */}
        <div className="mb-6">
          <WorkspaceSwitcher 
            currentWorkspace="artist" 
            onSwitch={(workspace) => {
              // WorkspaceSwitcher сам обрабатывает переключение
            }} 
          />
        </div>

        {/* Menu Items - 10 основных разделов */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выход</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 relative z-0 min-h-screen p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Coins Modal */}
      <AnimatePresence>
        {showCoinsModal && (
          <CoinsModal
            isOpen={showCoinsModal}
            balance={coinsBalance}
            onClose={() => setShowCoinsModal(false)}
            onBalanceUpdate={(newBalance) => {
              setCoinsBalance(newBalance);
              setShowCoinsModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
  );
}