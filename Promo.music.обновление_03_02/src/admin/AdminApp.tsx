import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Music2, Video, Calendar, FileText, Users, 
  Briefcase, DollarSign, HeadphonesIcon, Settings, LogOut, 
  X, Menu, Bell, Shield, Send
} from 'lucide-react';
import { Toaster } from 'sonner';

// Admin pages
import { Dashboard } from './pages/Dashboard';
import { Moderation } from './pages/Moderation';
import { TrackModeration } from './pages/TrackModeration';
import { VideoModeration } from './pages/VideoModeration';
import { ConcertModeration } from './pages/ConcertModeration';
import { NewsModeration } from './pages/NewsModeration';
import { PitchingDistribution } from './pages/PitchingDistribution';
import { FeedbackDemo } from './pages/FeedbackDemo';
import { UsersManagement } from './pages/UsersManagement';
import { PartnersManagement } from './pages/PartnersManagement';
import { Finances } from './pages/Finances';
import { Support } from './pages/Support';
import { AdminSettings } from './pages/Settings';
import { WorkspaceSwitcher } from '@/app/components/workspace-switcher';

// Assets
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

interface AdminAppProps {
  onLogout: () => void;
}

export function AdminApp({ onLogout }: AdminAppProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(47); // Общее количество ожидающих модерации

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard, badge: null },
    { id: 'moderation', label: 'Модерация', icon: Shield, badge: 47 },
    { id: 'pitching_distribution', label: 'Питчинг', icon: Send, badge: 3 },
    { id: 'users', label: 'Пользователи', icon: Users, badge: null },
    { id: 'partners', label: 'Партнеры', icon: Briefcase, badge: null },
    { id: 'finances', label: 'Финансы', icon: DollarSign, badge: null },
    { id: 'support', label: 'Поддержка', icon: HeadphonesIcon, badge: 12 },
    { id: 'settings', label: 'Настройки', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[150] w-12 h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg touch-manipulation hover:bg-white/20 transition-all"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : -288,
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
            setActiveSection('dashboard');
            setIsMobileMenuOpen(false);
          }}
        >
          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
            <img 
              src={promoLogo} 
              alt="PROMO.MUSIC Logo" 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">PROMO.MUSIC</div>
            <div className="text-red-400 text-xs font-semibold">Панель администратора</div>
          </div>
        </motion.div>

        {/* Admin Badge */}
        <div className="mb-8">
          <div className="p-4 rounded-2xl backdrop-blur-md bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Администратор</div>
                <div className="text-gray-300 text-xs">admin@promo.music</div>
              </div>
            </div>
          </div>

          {/* Pending Items Badge */}
          {pendingCount > 0 && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-bold">Ожидают</span>
                </div>
                <span className="text-yellow-400 text-lg font-bold">{pendingCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        <div className="mb-6">
          <WorkspaceSwitcher 
            currentWorkspace="admin" 
            onSwitch={(workspace) => {
              // WorkspaceSwitcher сам обрабатывает переключение
            }} 
          />
        </div>

        {/* Menu */}
        <nav className="space-y-1 mb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-white shadow-lg shadow-red-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-red-400' : ''} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Выход</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="ml-0 lg:ml-72 flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'moderation' && <Moderation />}
            {activeSection === 'pitching_distribution' && <PitchingDistribution />}
            {activeSection === 'users' && <UsersManagement />}
            {activeSection === 'partners' && <PartnersManagement />}
            {activeSection === 'finances' && <Finances />}
            {activeSection === 'support' && <Support />}
            {activeSection === 'settings' && <AdminSettings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
  );
}