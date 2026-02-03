import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  Target, ListMusic, Radio, Users, Newspaper, LineChart, Coins, Plus, 
  Eye, Heart, BarChart3, Play, X, ChevronRight, Info, Music2, Video, 
  Calendar, Send, Star, TrendingUp, Clock, Headphones, MessageCircle,
  Globe, Award, Zap, CheckCircle, ArrowRight
} from 'lucide-react';

type TabType = 'campaigns' | 'playlists' | 'radio' | 'influencers' | 'media' | 'analytics';

interface PitchingPageProps {
  userCoins: number;
  onCoinsUpdate: (coins: number) => void;
}

export function PitchingPage({ 
  userCoins = 1250, 
  onCoinsUpdate = () => {}
}: PitchingPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');

  const tabs = [
    { id: 'campaigns' as TabType, label: 'Кампании', icon: Target },
    { id: 'playlists' as TabType, label: 'Плейлисты', icon: ListMusic },
    { id: 'radio' as TabType, label: 'Радио', icon: Radio },
    { id: 'influencers' as TabType, label: 'Блогеры', icon: Users },
    { id: 'media' as TabType, label: 'Медиа', icon: Newspaper },
    { id: 'analytics' as TabType, label: 'Аналитика', icon: LineChart },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 space-y-4 sm:space-y-5 lg:space-y-6 pb-8">
      {/* Header - АДАПТИВНЫЙ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            Продвижение
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Все инструменты для продвижения вашей музыки
          </p>
        </div>
        
        <motion.div 
          key={userCoins}
          initial={{ scale: 1.2, backgroundColor: 'rgba(234, 179, 8, 0.3)' }}
          animate={{ scale: 1, backgroundColor: 'rgba(234, 179, 8, 0.125)' }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
          <span className="text-white font-semibold text-sm sm:text-base">{(userCoins || 0).toLocaleString()}</span>
          <span className="text-gray-400 text-xs sm:text-sm">коинов</span>
        </motion.div>
      </motion.div>

      {/* Tabs - АДАПТИВНАЯ ПРОКРУТКА */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0"
      >
        <div className="flex gap-2 min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'campaigns' && <CampaignsTab userCoins={userCoins} onCoinsUpdate={onCoinsUpdate} />}
          {activeTab === 'playlists' && <PlaylistsTab userCoins={userCoins} onCoinsUpdate={onCoinsUpdate} />}
          {activeTab === 'radio' && <RadioTab userCoins={userCoins} onCoinsUpdate={onCoinsUpdate} />}
          {activeTab === 'influencers' && <InfluencersTab userCoins={userCoins} onCoinsUpdate={onCoinsUpdate} />}
          {activeTab === 'media' && <MediaTab userCoins={userCoins} onCoinsUpdate={onCoinsUpdate} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==================== CAMPAIGNS TAB ====================
function CampaignsTab({ userCoins, onCoinsUpdate }: { userCoins: number; onCoinsUpdate: (coins: number) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Summer Vibes Promo',
      type: 'track',
      budget: 500,
      spent: 320,
      views: 12500,
      likes: 1240,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'
    }
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0" />
            <h2 className="text-white font-bold text-lg sm:text-xl">Рекламные кампании</h2>
          </div>
          <motion.div 
            key={userCoins}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/30"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{userCoins}</span>
          </motion.div>
        </div>
        
        <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
          Запускайте таргетированные рекламные кампании для продвижения музыки
        </p>

        {/* Stats - АДАПТИВНАЯ СЕТКА */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="text-emerald-400 text-xs mb-1">Активных</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{campaigns.length}</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-400/30">
            <div className="text-orange-400 text-xs mb-1">Потрачено</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{campaigns.reduce((s, c) => s + c.spent, 0)}</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-cyan-500/10 border border-cyan-400/30">
            <div className="text-cyan-400 text-xs mb-1">Охват</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{(campaigns.reduce((s, c) => s + c.views, 0) / 1000).toFixed(1)}K</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-pink-500/10 border border-pink-400/30">
            <div className="text-pink-400 text-xs mb-1">Лайков</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{campaigns.reduce((s, c) => s + c.likes, 0)}</div>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Создать кампанию
        </button>

        {/* Campaigns List - АДАПТИВНЫЕ КАРТОЧКИ */}
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <img 
                  src={campaign.image} 
                  alt={campaign.name}
                  className="w-full sm:w-16 md:w-20 h-32 sm:h-16 md:h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-bold text-sm sm:text-base md:text-lg truncate">{campaign.name}</h3>
                    <div className="px-2 sm:px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-1 flex-shrink-0">
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">Активна</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{campaign.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{campaign.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400 col-span-2 sm:col-span-2">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                      <span className="truncate">{campaign.spent} / {campaign.budget}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL - ПОЛНЫЙ ФУНКЦИОНАЛ */}
      <AnimatePresence>
        {showModal && (
          <CreateCampaignModal 
            onClose={() => setShowModal(false)}
            userCoins={userCoins}
            onCoinsUpdate={onCoinsUpdate}
            onCreated={(newCampaign) => {
              setCampaigns([...campaigns, newCampaign]);
              toast.success('Кампания успешно создана!');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== CREATE CAMPAIGN MODAL - ПОЛНАЯ ВЕРСИЯ ====================
function CreateCampaignModal({ 
  onClose, 
  userCoins, 
  onCoinsUpdate,
  onCreated 
}: { 
  onClose: () => void; 
  userCoins: number;
  onCoinsUpdate: (coins: number) => void;
  onCreated: (campaign: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    type: 'track' as 'track' | 'video' | 'concert' | 'news',
    budget: 500,
  });

  const handleCreate = () => {
    if (!data.name.trim()) {
      toast.error('Введите название кампании');
      return;
    }
    if (userCoins < data.budget) {
      toast.error('Недостаточно коинов!');
      return;
    }

    console.log('💰 Создание кампании:', {
      текущий_баланс: userCoins,
      стоимость: data.budget,
      новый_баланс: userCoins - data.budget
    });

    const newCampaign = {
      id: Date.now(),
      name: data.name,
      type: data.type,
      budget: data.budget,
      spent: 0,
      views: 0,
      likes: 0,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'
    };

    onCreated(newCampaign);
    const newBalance = userCoins - data.budget;
    onCoinsUpdate(newBalance);
    console.log('✅ Баланс обновлен:', newBalance);
    toast.success(`Кампания создана! Списано ${data.budget} коинов`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base sm:text-lg md:text-xl">Создать кампанию</h2>
                <p className="text-gray-400 text-xs sm:text-sm">Шаг {step} из 3</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all ${
                  s <= step ? 'bg-cyan-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block text-sm sm:text-base">Название кампании</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="Например: Летнее промо"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block text-sm sm:text-base">Тип контента</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { id: 'track', label: 'Трек', icon: Music2 },
                    { id: 'video', label: 'Видео', icon: Video },
                    { id: 'concert', label: 'Концерт', icon: Calendar },
                    { id: 'news', label: 'Новость', icon: Newspaper }
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setData({ ...data, type: type.id as any })}
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all ${
                          data.type === type.id
                            ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm font-semibold">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block text-sm sm:text-base">Бюджет</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={data.budget}
                    onChange={(e) => setData({ ...data, budget: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-yellow-500/20 border border-yellow-400/30 flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                    <span className="text-white font-bold text-sm sm:text-base">{data.budget}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Прогноз охвата: ~{(data.budget * 50).toLocaleString()} человек
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block text-sm sm:text-base">Целевые города</label>
                <input
                  type="text"
                  placeholder="Москва, Санкт-Петербург..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block text-sm sm:text-base">Жанры</label>
                <div className="flex flex-wrap gap-2">
                  {['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Indie'].map((genre) => (
                    <button
                      key={genre}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-cyan-500/20 hover:border-cyan-400/30 hover:text-cyan-400 transition-all text-xs sm:text-sm"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-cyan-500/10 border border-cyan-400/30">
                <div className="flex gap-2 sm:gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-cyan-400 font-semibold mb-1 text-sm sm:text-base">Подтверждение</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      Проверьте данные перед запуском кампании
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-sm sm:text-base">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Название:</span>
                  <span className="text-white font-semibold truncate">{data.name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Тип:</span>
                  <span className="text-white font-semibold capitalize">{data.type}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Бюджет:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-semibold">{data.budget}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-400/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-white font-semibold text-xs sm:text-sm md:text-base">Баланс после:</span>
                  </div>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">{(userCoins - data.budget).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 sm:p-5 md:p-6">
          <div className="flex gap-2 sm:gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold text-sm sm:text-base"
              >
                Назад
              </button>
            )}
            <button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  handleCreate();
                }
              }}
              disabled={!data.name}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {step < 3 ? 'Далее' : 'Запустить кампанию'}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PLAYLISTS TAB ====================
function PlaylistsTab({ userCoins, onCoinsUpdate }: { userCoins: number; onCoinsUpdate: (coins: number) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  const playlists = [
    { id: 1, name: 'Top Hits 2026', followers: 125000, acceptance: 45, coins: 150, curator: 'MusicFlow', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
    { id: 2, name: 'Indie Vibes', followers: 87000, acceptance: 62, coins: 120, curator: 'IndieStation', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
    { id: 3, name: 'Electronic Dreams', followers: 210000, acceptance: 28, coins: 250, curator: 'ElectroHub', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
    { id: 4, name: 'Chill Lounge', followers: 156000, acceptance: 71, coins: 100, curator: 'ChillBeats', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ListMusic className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
            <h2 className="text-white font-bold text-lg sm:text-xl">Питчинг в плейлисты</h2>
          </div>
          <motion.div 
            key={userCoins}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/30"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{userCoins}</span>
          </motion.div>
        </div>
        
        <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
          Отправьте свой трек кураторам популярных плейлистов
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-400/30">
            <div className="text-purple-400 text-xs mb-1">Отправлено</div>
            <div className="text-xl sm:text-2xl font-bold text-white">12</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="text-emerald-400 text-xs mb-1">Принято</div>
            <div className="text-xl sm:text-2xl font-bold text-white">7</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-cyan-500/10 border border-cyan-400/30">
            <div className="text-cyan-400 text-xs mb-1">Плейлистов</div>
            <div className="text-xl sm:text-2xl font-bold text-white">156</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-400/30">
            <div className="text-orange-400 text-xs mb-1">Охват</div>
            <div className="text-xl sm:text-2xl font-bold text-white">2.3M</div>
          </div>
        </div>

        {/* Playlists Grid */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex gap-3 sm:gap-4">
                <img 
                  src={playlist.image} 
                  alt={playlist.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold mb-1 truncate text-sm sm:text-base">{playlist.name}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2 truncate">{playlist.curator}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{(playlist.followers / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
                      <span>{playlist.acceptance}%</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 border border-yellow-400/40">
                      <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">{playlist.coins}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      setShowModal(true);
                    }}
                    disabled={userCoins < playlist.coins}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      userCoins < playlist.coins 
                        ? 'bg-gray-500/10 border-gray-500/30 text-gray-500 cursor-not-allowed' 
                        : 'bg-purple-500/20 border-purple-400/30 text-purple-400 hover:bg-purple-500/30'
                    }`}
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    {userCoins < playlist.coins ? 'Недостаточно коинов' : 'Отправить трек'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PITCH MODAL */}
      <AnimatePresence>
        {showModal && selectedPlaylist && (
          <PitchModal
            playlist={selectedPlaylist}
            onClose={() => {
              setShowModal(false);
              setSelectedPlaylist(null);
            }}
            userCoins={userCoins}
            onCoinsUpdate={onCoinsUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== PITCH MODAL ====================
function PitchModal({ playlist, onClose, userCoins, onCoinsUpdate }: any) {
  const [selectedTrack, setSelectedTrack] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!selectedTrack) {
      toast.error('Выберите трек');
      return;
    }
    if (userCoins < playlist.coins) {
      toast.error('Недостаточно коинов!');
      return;
    }

    console.log('💰 Питчинг в плейлист:', {
      текущий_баланс: userCoins,
      стоимость: playlist.coins,
      новый_баланс: userCoins - playlist.coins
    });

    const newBalance = userCoins - playlist.coins;
    onCoinsUpdate(newBalance);
    console.log('✅ Баланс обновлен:', newBalance);
    toast.success(`Трек отправлен в "${playlist.name}"! Списано ${playlist.coins} коинов`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md sm:max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl"
      >
        <div className="p-4 sm:p-5 md:p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <img src={playlist.image} alt={playlist.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-white font-bold text-sm sm:text-base truncate">{playlist.name}</h3>
                <p className="text-gray-400 text-xs sm:text-sm truncate">{playlist.curator}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center flex-shrink-0 ml-2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-white">{(playlist.followers / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-white">{playlist.acceptance}%</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-white font-bold">{playlist.coins}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block text-sm sm:text-base">Выберите трек</label>
            <select 
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-400 focus:outline-none text-sm sm:text-base"
            >
              <option value="">-- Выберите трек --</option>
              <option value="1">Summer Vibes</option>
              <option value="2">Midnight Dreams</option>
              <option value="3">Electric Soul</option>
            </select>
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block text-sm sm:text-base">Сообщение (необязательно)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Расскажите о своем треке..."
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none resize-none text-sm sm:text-base"
            />
          </div>

          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-400/30">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-300 text-xs sm:text-sm">Стоимость:</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="text-white font-bold text-base sm:text-lg">{playlist.coins}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedTrack}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            Отправить заявку
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== RADIO TAB ====================
function RadioTab({ userCoins, onCoinsUpdate }: { userCoins: number; onCoinsUpdate: (coins: number) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);

  const stations = [
    { id: 1, name: 'Energy FM', listeners: 450000, genre: 'Dance/Electronic', coins: 300, slots: 12, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' },
    { id: 2, name: 'Rock Nation', listeners: 320000, genre: 'Rock/Alternative', coins: 250, slots: 8, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
    { id: 3, name: 'Chill Waves', listeners: 280000, genre: 'Chill/Lounge', coins: 200, slots: 15, image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
    { id: 4, name: 'Hip-Hop Central', listeners: 590000, genre: 'Hip-Hop/Rap', coins: 350, slots: 5, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 flex-shrink-0" />
            <h2 className="text-white font-bold text-lg sm:text-xl">Радиостанции</h2>
          </div>
          <motion.div 
            key={userCoins}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/30"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{userCoins}</span>
          </motion.div>
        </div>
        
        <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
          Размещайте музыку на популярных интернет-радиостанциях
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-pink-500/10 border border-pink-400/30">
            <div className="text-pink-400 text-xs mb-1">Ротаций</div>
            <div className="text-xl sm:text-2xl font-bold text-white">24</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-cyan-500/10 border border-cyan-400/30">
            <div className="text-cyan-400 text-xs mb-1">Станций</div>
            <div className="text-xl sm:text-2xl font-bold text-white">6</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="text-emerald-400 text-xs mb-1">Слушателей</div>
            <div className="text-xl sm:text-2xl font-bold text-white">1.8M</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-400/30">
            <div className="text-orange-400 text-xs mb-1">Прослушиваний</div>
            <div className="text-xl sm:text-2xl font-bold text-white">45.2K</div>
          </div>
        </div>

        {/* Stations */}
        <div className="space-y-3 sm:space-y-4">
          {stations.map((station) => (
            <div key={station.id} className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <img 
                  src={station.image} 
                  alt={station.name}
                  className="w-full sm:w-20 md:w-24 h-32 sm:h-20 md:h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-white font-bold text-sm sm:text-base md:text-lg truncate">{station.name}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">{station.genre}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-400/40 flex items-center gap-1.5 flex-shrink-0">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-xs sm:text-sm">{station.coins}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Headphones className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{(station.listeners / 1000).toFixed(0)}K слушателей</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{station.slots} слотов</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedStation(station);
                      setShowModal(true);
                    }}
                    disabled={userCoins < station.coins}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-all ${
                      userCoins < station.coins
                        ? 'bg-gray-500/10 border-gray-500/30 text-gray-500 cursor-not-allowed'
                        : 'bg-pink-500/20 border-pink-400/30 text-pink-400 hover:bg-pink-500/30'
                    }`}
                  >
                    <Radio className="w-3 h-3 sm:w-4 sm:h-4" />
                    {userCoins < station.coins ? 'Недостаточно коинов' : 'Разместить трек'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RADIO MODAL */}
      <AnimatePresence>
        {showModal && selectedStation && (
          <RadioModal
            station={selectedStation}
            onClose={() => {
              setShowModal(false);
              setSelectedStation(null);
            }}
            userCoins={userCoins}
            onCoinsUpdate={onCoinsUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== RADIO MODAL ====================
function RadioModal({ station, onClose, userCoins, onCoinsUpdate }: any) {
  const [selectedTrack, setSelectedTrack] = useState('');

  const handleSubmit = () => {
    if (!selectedTrack) {
      toast.error('Выберите трек');
      return;
    }
    if (userCoins < station.coins) {
      toast.error('Недостаточно коинов!');
      return;
    }

    console.log('💰 Размещение на радио:', {
      текущий_баланс: userCoins,
      стоимость: station.coins,
      новый_баланс: userCoins - station.coins
    });

    const newBalance = userCoins - station.coins;
    onCoinsUpdate(newBalance);
    console.log('✅ Баланс обновлен:', newBalance);
    toast.success(`Трек размещен на ${station.name}! Списано ${station.coins} коинов`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gray-900 rounded-xl sm:rounded-2xl border border-white/10"
      >
        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-base sm:text-lg">Размещение на радио</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img src={station.image} alt={station.name} className="w-12 h-12 rounded-lg" />
            <div>
              <h4 className="text-white font-semibold text-sm">{station.name}</h4>
              <p className="text-gray-400 text-xs">{station.genre}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block text-sm">Выберите трек</label>
            <select 
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="">-- Выберите трек --</option>
              <option value="1">Summer Vibes</option>
              <option value="2">Midnight Dreams</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-400/30">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Стоимость:</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold">{station.coins}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedTrack}
            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-sm"
          >
            Разместить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== INFLUENCERS TAB ====================
function InfluencersTab({ userCoins, onCoinsUpdate }: { userCoins: number; onCoinsUpdate: (coins: number) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);

  const influencers = [
    { id: 1, name: 'DJ MaxFlow', followers: 856000, platform: 'Instagram + YouTube', engagement: 8.5, coins: 500, category: 'Electronic/Dance', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
    { id: 2, name: 'MusicReview Pro', followers: 620000, platform: 'YouTube', engagement: 12.3, coins: 400, category: 'Reviews', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
    { id: 3, name: 'IndieDiscovery', followers: 425000, platform: 'TikTok', engagement: 15.8, coins: 350, category: 'Indie', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
    { id: 4, name: 'BeatsDaily', followers: 1200000, platform: 'TikTok', engagement: 9.7, coins: 600, category: 'Hip-Hop', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-orange-400" />
            <h2 className="text-white font-bold text-xl">Блогеры и инфлюенсеры</h2>
          </div>
          <motion.div 
            key={userCoins}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/30"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{userCoins}</span>
          </motion.div>
        </div>
        
        <p className="text-gray-300 text-sm mb-6">
          Сотрудничайте с популярными музыкальными блогерами
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/30">
            <div className="text-orange-400 text-xs mb-1">Коллабораций</div>
            <div className="text-2xl font-bold text-white">8</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30">
            <div className="text-purple-400 text-xs mb-1">Блогеров</div>
            <div className="text-2xl font-bold text-white">42</div>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
            <div className="text-cyan-400 text-xs mb-1">Охват</div>
            <div className="text-2xl font-bold text-white">3.2M</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="text-emerald-400 text-xs mb-1">Конверсия</div>
            <div className="text-2xl font-bold text-white">11.4%</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {influencers.map((inf) => (
            <div key={inf.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex gap-3 mb-3">
                <img src={inf.image} alt={inf.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{inf.name}</h3>
                  <p className="text-gray-400 text-xs truncate">{inf.category}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{(inf.followers / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>{inf.engagement}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-xs">{inf.platform}</p>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/20 border border-yellow-400/40">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-xs">{inf.coins}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedInfluencer(inf);
                  setShowModal(true);
                }}
                disabled={userCoins < inf.coins}
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  userCoins < inf.coins
                    ? 'bg-gray-500/10 border-gray-500/30 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500/20 border-orange-400/30 text-orange-400 hover:bg-orange-500/30'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                {userCoins < inf.coins ? 'Недостаточно коинов' : 'Связаться'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* INFLUENCER MODAL */}
      <AnimatePresence>
        {showModal && selectedInfluencer && (
          <InfluencerModal
            influencer={selectedInfluencer}
            onClose={() => {
              setShowModal(false);
              setSelectedInfluencer(null);
            }}
            userCoins={userCoins}
            onCoinsUpdate={onCoinsUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== INFLUENCER MODAL ====================
function InfluencerModal({ influencer, onClose, userCoins, onCoinsUpdate }: any) {
  const [selectedTrack, setSelectedTrack] = useState('');
  const [collaborationType, setCollaborationType] = useState('review');
  const [message, setMessage] = useState('');

  const collabTypes = [
    { id: 'review', label: 'Обзор' },
    { id: 'story', label: 'Сторис' },
    { id: 'post', label: 'Пост' },
    { id: 'video', label: 'Видео' },
  ];

  const handleSubmit = () => {
    if (!selectedTrack) {
      toast.error('Выберите трек');
      return;
    }
    if (userCoins < influencer.coins) {
      toast.error('Недостаточно коинов!');
      return;
    }

    console.log('💰 Коллаборация с блогером:', {
      текущий_баланс: userCoins,
      стоимость: influencer.coins,
      новый_баланс: userCoins - influencer.coins
    });

    const newBalance = userCoins - influencer.coins;
    onCoinsUpdate(newBalance);
    console.log('✅ Баланс обновлен:', newBalance);
    toast.success(`Заявка отправлена блогеру ${influencer.name}! Списано ${influencer.coins} коинов`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <img src={influencer.image} alt={influencer.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h3 className="text-white font-bold">{influencer.name}</h3>
                <p className="text-gray-400 text-sm">{influencer.category}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-white">{(influencer.followers / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-white">{influencer.engagement}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold">{influencer.coins}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">Тип коллаборации</label>
            <div className="grid grid-cols-2 gap-2">
              {collabTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setCollaborationType(type.id)}
                  className={`p-3 rounded-lg border transition-all text-sm ${
                    collaborationType === type.id
                      ? 'bg-orange-500/20 border-orange-400/30 text-orange-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">Выберите трек</label>
            <select 
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-orange-400 focus:outline-none"
            >
              <option value="">-- Выберите трек --</option>
              <option value="1">Summer Vibes</option>
              <option value="2">Midnight Dreams</option>
              <option value="3">Electric Soul</option>
            </select>
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">Сообщение блогеру</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Расскажите о своем треке..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none resize-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Стоимость:</span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold text-lg">{influencer.coins}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedTrack}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Отправить заявку
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== MEDIA TAB ====================
function MediaTab({ userCoins, onCoinsUpdate }: { userCoins: number; onCoinsUpdate: (coins: number) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);

  const outlets = [
    { id: 1, name: 'Music Today', readers: 520000, type: 'Онлайн-журнал', coins: 250, reach: 'Международный', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
    { id: 2, name: 'Beat Magazine', readers: 350000, type: 'Печатный + Digital', coins: 300, reach: 'Национальный', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
    { id: 3, name: 'Indie Press', readers: 180000, type: 'Онлайн-платформа', coins: 180, reach: 'Специализированный', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
    { id: 4, name: 'Electronic Sound', readers: 420000, type: 'Онлайн + Podcast', coins: 280, reach: 'Международный', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-blue-400" />
            <h2 className="text-white font-bold text-xl">Медиа и пресса</h2>
          </div>
          <motion.div 
            key={userCoins}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/30"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{userCoins}</span>
          </motion.div>
        </div>
        
        <p className="text-gray-300 text-sm mb-6">
          Получите освещение в музыкальных изданиях
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/30">
            <div className="text-blue-400 text-xs mb-1">Публикаций</div>
            <div className="text-2xl font-bold text-white">14</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30">
            <div className="text-purple-400 text-xs mb-1">Изданий</div>
            <div className="text-2xl font-bold text-white">28</div>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
            <div className="text-cyan-400 text-xs mb-1">Охват</div>
            <div className="text-2xl font-bold text-white">1.5M</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="text-emerald-400 text-xs mb-1">Рейтинг</div>
            <div className="text-2xl font-bold text-white">4.8</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {outlets.map((outlet) => (
            <div key={outlet.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex gap-3 mb-3">
                <img src={outlet.image} alt={outlet.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{outlet.name}</h3>
                  <p className="text-gray-400 text-xs truncate">{outlet.type}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{(outlet.readers / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{outlet.reach}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/20 border border-yellow-400/40">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-xs">{outlet.coins}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedOutlet(outlet);
                  setShowModal(true);
                }}
                disabled={userCoins < outlet.coins}
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  userCoins < outlet.coins
                    ? 'bg-gray-500/10 border-gray-500/30 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                {userCoins < outlet.coins ? 'Недостаточно коинов' : 'Подать пресс-релиз'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MEDIA MODAL */}
      <AnimatePresence>
        {showModal && selectedOutlet && (
          <MediaModal
            outlet={selectedOutlet}
            onClose={() => {
              setShowModal(false);
              setSelectedOutlet(null);
            }}
            userCoins={userCoins}
            onCoinsUpdate={onCoinsUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== MEDIA MODAL ====================
function MediaModal({ outlet, onClose, userCoins, onCoinsUpdate }: any) {
  const [title, setTitle] = useState('');
  const [pressRelease, setPressRelease] = useState('');
  const [releaseType, setReleaseType] = useState('new-release');

  const types = [
    { id: 'new-release', label: 'Новый релиз' },
    { id: 'tour', label: 'Тур' },
    { id: 'achievement', label: 'Достижение' },
    { id: 'other', label: 'Другое' },
  ];

  const handleSubmit = () => {
    if (!title.trim() || !pressRelease.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    if (userCoins < outlet.coins) {
      toast.error('Недостаточно коинов!');
      return;
    }

    console.log('💰 Отправка пресс-релиза:', {
      текущий_баланс: userCoins,
      стоимость: outlet.coins,
      новый_баланс: userCoins - outlet.coins
    });

    const newBalance = userCoins - outlet.coins;
    onCoinsUpdate(newBalance);
    console.log('✅ Баланс обновлен:', newBalance);
    toast.success(`Пресс-релиз отправлен в "${outlet.name}"! Списано ${outlet.coins} коинов`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <img src={outlet.image} alt={outlet.name} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <h3 className="text-white font-bold">{outlet.name}</h3>
                <p className="text-gray-400 text-sm">{outlet.type}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-white">{(outlet.readers / 1000).toFixed(0)}K читателей</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-white">{outlet.reach}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">Тип новости</label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReleaseType(type.id)}
                  className={`p-3 rounded-lg border transition-all text-sm ${
                    releaseType === type.id
                      ? 'bg-blue-500/20 border-blue-400/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Новый альбом уже в продаже"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">Пресс-релиз</label>
            <textarea
              value={pressRelease}
              onChange={(e) => setPressRelease(e.target.value)}
              placeholder="Расскажите вашу историю..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none resize-none"
            />
            <p className="text-gray-500 text-xs mt-1">{pressRelease.length} / 1000 символов</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Стоимость публикации:</span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold text-lg">{outlet.coins}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title || !pressRelease}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Отправить пресс-релиз
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== ANALYTICS TAB ====================
function AnalyticsTab() {
  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <LineChart className="w-6 h-6 text-emerald-400" />
        <h2 className="text-white font-bold text-xl">Аналитика</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-400 text-xs mb-1">Охват</div>
          <div className="text-2xl font-bold text-white">127.8K</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs">+24.5%</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
          <div className="text-cyan-400 text-xs mb-1">Вовлечение</div>
          <div className="text-2xl font-bold text-white">15.4K</div>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30">
          <div className="text-purple-400 text-xs mb-1">Конверсия</div>
          <div className="text-2xl font-bold text-white">12.1%</div>
        </div>
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/30">
          <div className="text-orange-400 text-xs mb-1">ROI</div>
          <div className="text-2xl font-bold text-white">287%</div>
        </div>
      </div>
    </div>
  );
}
