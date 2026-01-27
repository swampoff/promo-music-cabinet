/**
 * TICKETING INTEGRATION & SALES FUNNEL
 * Интеграция с билетными системами и воронка продаж
 */

import { Ticket, TrendingUp, DollarSign, Users, BarChart3, ExternalLink, Plus, CheckCircle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { AreaChart, Area, FunnelChart, Funnel, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface TicketProvider {
  id: string;
  name: string;
  enabled: boolean;
  commission: number;
  logo?: string;
  connected?: boolean;
}

interface SalesFunnel {
  concertId: string;
  views: number;
  clicks: number;
  cartAdds: number;
  checkoutInitiated: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  averageTicketPrice: number;
}

interface TicketingIntegrationProps {
  artistId: string;
  concertId?: string;
  concerts?: any[];
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

export function TicketingIntegration({ artistId, concertId, concerts = [] }: TicketingIntegrationProps) {
  const [providers, setProviders] = useState<TicketProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<TicketProvider[]>([]);
  const [funnel, setFunnel] = useState<SalesFunnel | null>(null);
  const [salesStats, setSalesStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState(concertId || '');

  useEffect(() => {
    loadProviders();
    loadConnectedProviders();
  }, [artistId]);

  // Auto-select first concert if available and no concert is selected
  useEffect(() => {
    if (!selectedConcert && concerts.length > 0) {
      setSelectedConcert(concerts[0].id);
    }
  }, [concerts]);

  useEffect(() => {
    if (selectedConcert) {
      loadFunnel(selectedConcert);
      loadSalesStats(selectedConcert);
    }
  }, [selectedConcert]);

  const loadProviders = async () => {
    try {
      const response = await fetch(`${API_URL}/ticketing/providers`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.data);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnectedProviders = async () => {
    try {
      const response = await fetch(`${API_URL}/ticketing/providers/connected/${artistId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setConnectedProviders(data.data);
      }
    } catch (error) {
      console.error('Error loading connected providers:', error);
    }
  };

  const loadFunnel = async (concertId: string) => {
    try {
      const response = await fetch(`${API_URL}/ticketing/funnel/${concertId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setFunnel(data.data);
      }
    } catch (error) {
      console.error('Error loading funnel:', error);
    }
  };

  const loadSalesStats = async (concertId: string) => {
    try {
      const response = await fetch(`${API_URL}/ticketing/sales/${concertId}/stats`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setSalesStats(data.data);
      }
    } catch (error) {
      console.error('Error loading sales stats:', error);
    }
  };

  const connectProvider = async (providerId: string) => {
    try {
      const response = await fetch(`${API_URL}/ticketing/providers/${providerId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          artistId,
          apiKey: 'demo_api_key_' + Math.random().toString(36).substr(2, 9),
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setConnectedProviders([...connectedProviders, data.data]);
        toast.success('✅ ' + data.message);
      }
    } catch (error) {
      console.error('Error connecting provider:', error);
      toast.error('Не удалось подключить провайдера');
    }
  };

  const generateTestSales = async () => {
    if (!selectedConcert) {
      toast.error('Выберите концерт');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ticketing/generate-test-sales/${selectedConcert}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ artistId, count: 20 }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('🎉 ' + data.message);
        loadFunnel(selectedConcert);
        loadSalesStats(selectedConcert);
      }
    } catch (error) {
      console.error('Error generating sales:', error);
      toast.error('Не удалось сгенерировать продажи');
    }
  };

  const isConnected = (providerId: string) => {
    return connectedProviders.some(p => p.id === providerId);
  };

  // Prepare funnel data for chart
  const funnelChartData = funnel ? [
    { name: 'Просмотры', value: funnel.views, fill: '#06b6d4' },
    { name: 'Клики', value: funnel.clicks, fill: '#8b5cf6' },
    { name: 'В корзину', value: funnel.cartAdds, fill: '#ec4899' },
    { name: 'Оформление', value: funnel.checkoutInitiated, fill: '#10b981' },
    { name: 'Покупки', value: funnel.purchases, fill: '#f59e0b' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Ticket className="w-7 h-7 text-cyan-400" />
          Билетные системы
        </h2>
        <p className="text-gray-400 mt-1">Интеграция с платформами продажи билетов</p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl border transition-all ${
              isConnected(provider.id)
                ? 'bg-green-500/10 border-green-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {provider.logo && (
                  <img src={provider.logo} alt={provider.name} className="w-12 h-12 rounded-xl object-cover" />
                )}
                <div>
                  <h3 className="font-bold text-white">{provider.name}</h3>
                  <p className="text-xs text-gray-400">Комиссия: {provider.commission}%</p>
                </div>
              </div>
              
              {isConnected(provider.id) ? (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Подключено
                </span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => connectProvider(provider.id)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all"
                >
                  Подключить
                </motion.button>
              )}
            </div>

            {isConnected(provider.id) && (
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <ExternalLink className="w-3 h-3" />
                  <span>API подключён</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sales Funnel Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            Воронка продаж
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {concerts.length > 0 ? (
              <>
                <select
                  value={selectedConcert}
                  onChange={(e) => setSelectedConcert(e.target.value)}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 text-sm"
                >
                  <option value="">Выберите концерт</option>
                  {concerts.map(concert => (
                    <option key={concert.id} value={concert.id}>
                      {concert.title} - {concert.city}
                    </option>
                  ))}
                </select>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateTestSales}
                  disabled={!selectedConcert}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Генерировать продажи</span>
                  <span className="sm:hidden">Генерировать</span>
                </motion.button>
              </>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-sm">
                ⚠️ Сначала создайте концерт в разделе "Мои концерты"
              </div>
            )}
          </div>
        </div>

        {funnel ? (
          <>
            {/* Funnel Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30"
              >
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{funnel.views.toLocaleString()}</p>
                <p className="text-xs text-cyan-300">Просмотры</p>
                <div className="mt-1 sm:mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <ArrowRight className="w-3 h-3" />
                  <span>100%</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30"
              >
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{funnel.clicks.toLocaleString()}</p>
                <p className="text-xs text-purple-300">Клики</p>
                <div className="mt-1 sm:mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <ArrowRight className="w-3 h-3" />
                  <span>{funnel.views > 0 ? ((funnel.clicks / funnel.views) * 100).toFixed(1) : 0}%</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30"
              >
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{funnel.cartAdds.toLocaleString()}</p>
                <p className="text-xs text-pink-300">В корзину</p>
                <div className="mt-1 sm:mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <ArrowRight className="w-3 h-3" />
                  <span>{funnel.clicks > 0 ? ((funnel.cartAdds / funnel.clicks) * 100).toFixed(1) : 0}%</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30"
              >
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{funnel.checkoutInitiated.toLocaleString()}</p>
                <p className="text-xs text-green-300">Оформление</p>
                <div className="mt-1 sm:mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <ArrowRight className="w-3 h-3" />
                  <span>{funnel.cartAdds > 0 ? ((funnel.checkoutInitiated / funnel.cartAdds) * 100).toFixed(1) : 0}%</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30"
              >
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{funnel.purchases.toLocaleString()}</p>
                <p className="text-xs text-yellow-300">Покупки</p>
                <div className="mt-1 sm:mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <ArrowRight className="w-3 h-3" />
                  <span>{funnel.checkoutInitiated > 0 ? ((funnel.purchases / funnel.checkoutInitiated) * 100).toFixed(1) : 0}%</span>
                </div>
              </motion.div>
            </div>

            {/* Funnel Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h4 className="text-sm sm:text-base font-bold text-white mb-4">Визуализация воронки</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={window.innerWidth < 640 ? 70 : 100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30"
              >
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2 sm:mb-3" />
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{funnel.revenue.toLocaleString()} ₽</p>
                <p className="text-xs sm:text-sm text-green-300">Общая выручка</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30"
              >
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-2 sm:mb-3" />
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{funnel.conversionRate.toFixed(2)}%</p>
                <p className="text-xs sm:text-sm text-purple-300">Конверсия (просмотры → покупки)</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30"
              >
                <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mb-2 sm:mb-3" />
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{funnel.averageTicketPrice.toFixed(0)} ₽</p>
                <p className="text-xs sm:text-sm text-cyan-300">Средний чек</p>
              </motion.div>
            </div>

            {/* Sales Stats by Provider */}
            {salesStats && Object.keys(salesStats.byProvider).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <h4 className="font-bold text-white mb-4">Продажи по платформам</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(salesStats.byProvider).map(([provider, count]: [string, any]) => {
                    const providerData = providers.find(p => p.id === provider);
                    return (
                      <div key={provider} className="text-center p-4 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold text-white mb-1">{count}</p>
                        <p className="text-xs text-gray-400">{providerData?.name || provider}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Выберите концерт</h3>
            <p className="text-sm text-gray-500">Чтобы увидеть воронку продаж</p>
          </div>
        )}
      </div>
    </div>
  );
}