import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, Music, Building2, DollarSign, User, Wallet, Bell, 
  Mail, Star, Clock, CheckCircle, XCircle, Play, BarChart3,
  Calendar, TrendingUp, Users, Award, Settings, X, Menu, LogOut,
  MapPin, Phone, Globe, Instagram, Facebook, Twitter, Youtube,
  Edit, Save, Upload, FileText, Shield, Headphones, Zap, Signal
} from 'lucide-react';
import { WorkspaceSwitcher } from '@/app/components/workspace-switcher';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';
import { ArtistRequestsSection } from '@/radio/components/artist-requests-section';
import { AdSlotsSection } from '@/radio/components/ad-slots-section';
import { FinanceSection } from '@/radio/components/finance-section';
import { NotificationsSection } from '@/radio/components/notifications-section';

type RadioSection = 
  | 'artist-requests'
  | 'venue-requests'
  | 'ad-slots'
  | 'profile'
  | 'finance'
  | 'notifications';

interface RadioAppProps {
  onLogout: () => void;
}

export default function RadioApp({ onLogout }: RadioAppProps) {
  const [activeSection, setActiveSection] = useState<RadioSection>('artist-requests');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stationData = {
    name: 'PROMO.FM Radio',
    frequency: 'FM 100.5',
    status: 'Online',
    initials: 'PR'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            <h1 className="text-xl font-bold text-white">PROMO.FM</h1>
            <p className="text-xs text-indigo-300">Radio Cabinet</p>
          </div>
        </div>

        {/* Station Profile Card */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setActiveSection('profile');
            setIsSidebarOpen(false);
          }}
          className="w-full mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {stationData.initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-white font-semibold truncate">{stationData.name}</div>
              <div className="text-gray-400 text-sm truncate">{stationData.status} • {stationData.frequency}</div>
            </div>
          </div>
        </motion.button>

        {/* Workspace Switcher */}
        <div className="mb-6">
          <WorkspaceSwitcher 
            currentWorkspace="radio" 
            onSwitch={() => {}} 
          />
        </div>

        {/* Menu - Основные функции */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-4">
            Основные функции
          </div>
          <nav className="space-y-1">
            <NavButton
              icon={Mail}
              label="Заявки артистов"
              badge={23}
              active={activeSection === 'artist-requests'}
              onClick={() => {
                setActiveSection('artist-requests');
                setIsSidebarOpen(false);
              }}
            />
            <NavButton
              icon={Building2}
              label="Заявки заведений"
              badge={5}
              active={activeSection === 'venue-requests'}
              onClick={() => {
                setActiveSection('venue-requests');
                setIsSidebarOpen(false);
              }}
            />
            <NavButton
              icon={DollarSign}
              label="Рекламные слоты"
              active={activeSection === 'ad-slots'}
              onClick={() => {
                setActiveSection('ad-slots');
                setIsSidebarOpen(false);
              }}
            />
          </nav>
        </div>

        {/* Menu - Управление */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-4">
            Управление
          </div>
          <nav className="space-y-1">
            <NavButton
              icon={User}
              label="Профиль"
              active={activeSection === 'profile'}
              onClick={() => {
                setActiveSection('profile');
                setIsSidebarOpen(false);
              }}
            />
            <NavButton
              icon={Wallet}
              label="Финансы"
              active={activeSection === 'finance'}
              onClick={() => {
                setActiveSection('finance');
                setIsSidebarOpen(false);
              }}
            />
            <NavButton
              icon={Bell}
              label="Уведомления"
              active={activeSection === 'notifications'}
              onClick={() => {
                setActiveSection('notifications');
                setIsSidebarOpen(false);
              }}
            />
          </nav>
        </div>

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
            {activeSection === 'artist-requests' && <ArtistRequestsSection />}
            {activeSection === 'venue-requests' && <VenueRequestsSection />}
            {activeSection === 'ad-slots' && <AdSlotsSection />}
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'finance' && <FinanceSection />}
            {activeSection === 'notifications' && <NotificationsSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// =====================================================
// NAVIGATION COMPONENTS
// =====================================================

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

function NavButton({ icon: Icon, label, badge, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium flex-1 text-left">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

// =====================================================
// SECTION 2: ЗАЯВКИ ЗАВЕДЕНИЙ
// =====================================================

function VenueRequestsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Заявки заведений</h2>
        <p className="text-slate-400 mt-1">Партнерство с барами, ресторанами и клубами</p>
      </div>

      <div className="p-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Скоро появится</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Функционал для работы с заведениями находится в разработке
        </p>
      </div>
    </div>
  );
}

// =====================================================
// OTHER SECTIONS
// =====================================================

function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'broadcast' | 'social' | 'documents'>('general');

  // Station data from registration
  const [stationInfo, setStationInfo] = useState({
    name: 'PROMO.FM Radio',
    frequency: 'FM 100.5',
    city: 'Москва',
    country: 'Россия',
    genres: ['Pop', 'Rock', 'Electronic', 'Hip-Hop'],
    description: 'Современная радиостанция с лучшей музыкой 24/7. Мы создаем атмосферу и делимся эмоциями через музыку.',
    founded: '2020',
    
    // Contact info
    email: 'radio@promo.fm',
    phone: '+7 (495) 123-45-67',
    website: 'https://promo.fm',
    address: 'ул. Тверская, д. 1, Москва, 125009',
    
    // Broadcast settings
    bitrate: '320 kbps',
    format: 'MP3',
    streamUrl: 'https://stream.promo.fm/live',
    backupStreamUrl: 'https://backup.stream.promo.fm/live',
    
    // Social media
    instagram: '@promofm',
    facebook: 'PromoFMRadio',
    twitter: '@promofm',
    youtube: '@PromoFMRadio',
    
    // Stats
    listeners: '125K+',
    tracksInRotation: 450,
    partners: 28,
    monthlyReach: '2.5M'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Профиль радиостанции</h2>
          <p className="text-slate-400 mt-1">Управление информацией о вашей радиостанции</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              Сохранить
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Редактировать
            </>
          )}
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Station Avatar */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-5xl font-bold text-white">PR</span>
              {isEditing && (
                <button className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Station Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{stationInfo.name}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Signal className="w-4 h-4 text-indigo-400" />
                  {stationInfo.frequency}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {stationInfo.city}, {stationInfo.country}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  С {stationInfo.founded}
                </div>
              </div>
            </div>

            {/* Genres */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Жанры:</p>
              <div className="flex flex-wrap gap-2">
                {stationInfo.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-sm bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30"
                  >
                    {genre}
                  </span>
                ))}
                {isEditing && (
                  <button className="px-3 py-1 text-sm bg-white/5 text-slate-400 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    + Добавить
                  </button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-white">{stationInfo.listeners}</p>
                <p className="text-xs text-slate-400">Слушателей</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stationInfo.tracksInRotation}</p>
                <p className="text-xs text-slate-400">Треков</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stationInfo.partners}</p>
                <p className="text-xs text-slate-400">Партнеров</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stationInfo.monthlyReach}</p>
                <p className="text-xs text-slate-400">Охват/мес</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton label="Основная информация" icon={FileText} active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
        <TabButton label="Трансляция" icon={Radio} active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} />
        <TabButton label="Соцсети" icon={Globe} active={activeTab === 'social'} onClick={() => setActiveTab('social')} />
        <TabButton label="Документы" icon={Shield} active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* About */}
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  О радиостанции
                </h4>
                {isEditing ? (
                  <textarea
                    value={stationInfo.description}
                    onChange={(e) => setStationInfo({ ...stationInfo, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-slate-300">{stationInfo.description}</p>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <ProfileInfoCard
                  icon={Mail}
                  label="Email"
                  value={stationInfo.email}
                  isEditing={isEditing}
                  onChange={(value) => setStationInfo({ ...stationInfo, email: value })}
                />
                <ProfileInfoCard
                  icon={Phone}
                  label="Телефон"
                  value={stationInfo.phone}
                  isEditing={isEditing}
                  onChange={(value) => setStationInfo({ ...stationInfo, phone: value })}
                />
                <ProfileInfoCard
                  icon={Globe}
                  label="Сайт"
                  value={stationInfo.website}
                  isEditing={isEditing}
                  onChange={(value) => setStationInfo({ ...stationInfo, website: value })}
                />
                <ProfileInfoCard
                  icon={MapPin}
                  label="Адрес"
                  value={stationInfo.address}
                  isEditing={isEditing}
                  onChange={(value) => setStationInfo({ ...stationInfo, address: value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <ProfileInfoCard
                  icon={Zap}
                  label="Битрейт"
                  value={stationInfo.bitrate}
                  isEditing={isEditing}
                  onChange={(value) => setStationInfo({ ...stationInfo, bitrate: value })}
                />
                <ProfileInfoCard
                  icon={Music}
                  label="Формат"
                  value={stationInfo.format}
                  isEditing={isEditing}
                  onChange={(value) => setStationInfo({ ...stationInfo, format: value })}
                />
              </div>

              {/* Stream URLs */}
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Основной поток</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={stationInfo.streamUrl}
                      onChange={(e) => setStationInfo({ ...stationInfo, streamUrl: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                    />
                  ) : (
                    <p className="text-white font-mono text-sm bg-black/20 p-3 rounded-xl">{stationInfo.streamUrl}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Резервный поток</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={stationInfo.backupStreamUrl}
                      onChange={(e) => setStationInfo({ ...stationInfo, backupStreamUrl: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                    />
                  ) : (
                    <p className="text-white font-mono text-sm bg-black/20 p-3 rounded-xl">{stationInfo.backupStreamUrl}</p>
                  )}
                </div>
              </div>

              {/* Broadcasting Status */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Signal className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Статус трансляции</h4>
                    <p className="text-green-400 text-sm">● В эфире • 1247 слушателей</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <SocialMediaCard
                icon={Instagram}
                platform="Instagram"
                username={stationInfo.instagram}
                color="from-pink-500 to-purple-500"
                isEditing={isEditing}
                onChange={(value) => setStationInfo({ ...stationInfo, instagram: value })}
              />
              <SocialMediaCard
                icon={Facebook}
                platform="Facebook"
                username={stationInfo.facebook}
                color="from-blue-600 to-blue-500"
                isEditing={isEditing}
                onChange={(value) => setStationInfo({ ...stationInfo, facebook: value })}
              />
              <SocialMediaCard
                icon={Twitter}
                platform="Twitter / X"
                username={stationInfo.twitter}
                color="from-slate-700 to-slate-600"
                isEditing={isEditing}
                onChange={(value) => setStationInfo({ ...stationInfo, twitter: value })}
              />
              <SocialMediaCard
                icon={Youtube}
                platform="YouTube"
                username={stationInfo.youtube}
                color="from-red-600 to-red-500"
                isEditing={isEditing}
                onChange={(value) => setStationInfo({ ...stationInfo, youtube: value })}
              />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* License */}
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Лицензия на вещание
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">№ РВ-123456 • Действительна до 31.12.2026</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                    Активна
                  </span>
                </div>
                <button className="px-4 py-2 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors text-sm">
                  Скачать документ
                </button>
              </div>

              {/* Registration */}
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      Свидетельство о регистрации
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">ИНН 7710123456 • ОГРН 1234567890123</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
                    Подтверждено
                  </span>
                </div>
                <button className="px-4 py-2 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors text-sm">
                  Скачать документ
                </button>
              </div>

              {/* Upload New */}
              {isEditing && (
                <button className="w-full p-6 rounded-2xl bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 transition-colors flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-white font-medium">Загрузить новый документ</p>
                  <p className="text-sm text-slate-400">PDF, JPG или PNG до 10 МБ</p>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface ProfileInfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

function ProfileInfoCard({ icon: Icon, label, value, isEditing, onChange }: ProfileInfoCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-indigo-400" />
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      ) : (
        <p className="text-white font-medium">{value}</p>
      )}
    </div>
  );
}

interface SocialMediaCardProps {
  icon: React.ElementType;
  platform: string;
  username: string;
  color: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

function SocialMediaCard({ icon: Icon, platform, username, color, isEditing, onChange }: SocialMediaCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-white font-bold">{platform}</h4>
          <p className="text-xs text-slate-400">Социальная сеть</p>
        </div>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={username}
          onChange={(e) => onChange(e.target.value)}
          placeholder="@username"
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      ) : (
        <p className="text-white font-medium mb-3">{username}</p>
      )}
      {!isEditing && (
        <button className="w-full px-4 py-2 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors text-sm">
          Открыть профиль
        </button>
      )}
    </div>
  );
}

interface TabButtonProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, icon: Icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// =====================================================
// SHARED COMPONENTS
// =====================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

function StatCard({ icon: Icon, label, value, color = 'indigo' }: StatCardProps) {
  const colors = {
    indigo: 'text-indigo-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <Icon className={`w-5 h-5 mb-3 ${colors[color as keyof typeof colors]}`} />
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

function FilterButton({ label, active, onClick, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl transition-all font-medium ${
        active 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );
}