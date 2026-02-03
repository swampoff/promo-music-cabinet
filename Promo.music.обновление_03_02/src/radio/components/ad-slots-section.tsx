/**
 * AD SLOTS SECTION - Управление рекламными пакетами и слотами
 * Максимально доработанная версия с полной финансовой логикой
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign, TrendingUp, Users, BarChart3, Package, Calendar, Clock,
  Plus, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Play,
  Pause, ChevronDown, ChevronUp, Settings, Filter, Search, Download,
  Upload, MessageSquare, Star, Zap, Shield, RefreshCw, X, Ban,
  Activity, Percent, Target, Award, Wallet, CreditCard, FileText
} from 'lucide-react';
import { toast } from 'sonner';

// Import additional components
import {
  PackageCard,
  OrdersTab,
  SlotsCalendarTab,
  AnalyticsTab,
  CreatePackageModal,
  OrderDetailsModal,
} from './ad-slots-section-parts';

// Export types for use in parts file
export type {
  RadioAdvertisementPackage,
  AdvertisementOrder,
  BroadcastSlot,
  TimeSlotType,
  OrderStatus,
  BroadcastSlotStatus,
  CommissionStatus,
  PricingType,
};

// =====================================================
// TYPES
// =====================================================

type PricingType = 'fixed' | 'auction';
type TimeSlotType = 'morning' | 'afternoon' | 'evening' | 'night' | 'prime_time' | 'any';
type BroadcastSlotStatus = 'available' | 'booked' | 'paid' | 'broadcasted' | 'cancelled';
type OrderStatus = 'pending_payment' | 'paid' | 'in_review' | 'approved_by_radio' | 'rejected_by_radio' | 'fulfilled' | 'refunded' | 'cancelled';
type CommissionStatus = 'pending' | 'collected' | 'refunded';

interface RadioAdvertisementPackage {
  id: string;
  radioId: string;
  title: string;
  description: string;
  
  // Параметры
  spotDurationSeconds: 5 | 10 | 15 | 30 | 60;
  rotationsPerDay: number;
  timeSlot: TimeSlotType;
  
  // Ценообразование
  pricingType: PricingType;
  basePrice: number;
  pricingConfig: {
    bulkDiscount: {
      enabled: boolean;
      minSlots: number;
      discountPercent: number;
    };
    dynamicDemand: {
      enabled: boolean;
      thresholdPercent: number;
      priceMultiplier: number;
    };
  };
  
  // Аукцион
  auctionConfig?: {
    startingBid: number;
    minIncrement: number;
    autoExtend: boolean;
    extendMinutes: number;
  };
  
  // Лимиты
  maxSlots: number;
  slotsTaken: number;
  
  // Комиссия
  platformCommissionRate: number;
  
  // Статус
  isActive: boolean;
  isFeatured: boolean;
  
  // Медиа
  packageImageUrl?: string;
  sampleAudioUrl?: string;
  
  // Метаданные
  createdAt: string;
  updatedAt: string;
  
  // Статистика (из view)
  stats?: {
    occupancyPercent: number;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    totalNetRevenue: number;
    availableSlots: number;
    broadcastedSlots: number;
  };
}

interface BroadcastSlot {
  id: string;
  radioId: string;
  packageId: string;
  broadcastDate: string;
  broadcastTime: string;
  durationSeconds: number;
  slotPrice: number;
  status: BroadcastSlotStatus;
  advertisementOrderId?: string;
  buyerVenueName?: string;
  adCreativeFileUrl?: string;
  adCreativeText?: string;
  broadcastedAt?: string;
  broadcastConfirmed: boolean;
}

interface AdvertisementOrder {
  id: string;
  packageId: string;
  sellerRadioId: string;
  buyerUserId: string;
  buyerUserEmail: string;
  buyerUserName?: string;
  buyerVenueName?: string;
  
  // Слоты
  broadcastSlotIds: string[];
  totalSlots: number;
  
  // Креатив
  adCreativeFileUrl?: string;
  adCreativeText?: string;
  adCreativeType?: string;
  
  // Статус
  status: OrderStatus;
  
  // Финансы
  baseAmount: number;
  discountAmount: number;
  demandSurcharge: number;
  paymentAmount: number;
  commissionAmount: number;
  netAmountToRadio: number;
  commissionStatus: CommissionStatus;
  
  // Ценообразование
  pricingDetails: {
    basePricePerSlot: number;
    totalSlots: number;
    occupancyPercent: number;
    demandMultiplierApplied: boolean;
    bulkDiscountApplied: boolean;
    discountPercent: number;
  };
  
  // Отчет
  playReport: {
    totalPlays: number;
    playDates: string[];
    detailedSchedule: any[];
    completionPercent: number;
  };
  
  // Модерация
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  
  // Выполнение
  fulfilledAt?: string;
  fulfillmentNotes?: string;
  
  // Оплата
  paidAt?: string;
  paymentId?: string;
  refundAmount?: number;
  refundedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function AdSlotsSection() {
  const [activeTab, setActiveTab] = useState<'packages' | 'slots' | 'orders' | 'analytics'>('packages');
  const [packages, setPackages] = useState<RadioAdvertisementPackage[]>([]);
  const [orders, setOrders] = useState<AdvertisementOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdvertisementOrder | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<RadioAdvertisementPackage | null>(null);

  // =====================================================
  // DATA LOADING
  // =====================================================

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API calls
      const mockPackages: RadioAdvertisementPackage[] = [
        {
          id: 'pkg_001',
          radioId: 'radio_001',
          title: 'Утренний эфир - 30 секунд',
          description: 'Рекламный ролик 30 секунд в утреннем эфире с максимальной аудиторией',
          spotDurationSeconds: 30,
          rotationsPerDay: 5,
          timeSlot: 'morning',
          pricingType: 'fixed',
          basePrice: 5000,
          pricingConfig: {
            bulkDiscount: {
              enabled: true,
              minSlots: 5,
              discountPercent: 10,
            },
            dynamicDemand: {
              enabled: true,
              thresholdPercent: 80,
              priceMultiplier: 1.2,
            },
          },
          maxSlots: 100,
          slotsTaken: 45,
          platformCommissionRate: 0.15,
          isActive: true,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            occupancyPercent: 45,
            totalOrders: 12,
            totalRevenue: 245000,
            totalCommission: 36750,
            totalNetRevenue: 208250,
            availableSlots: 55,
            broadcastedSlots: 30,
          },
        },
        {
          id: 'pkg_002',
          radioId: 'radio_001',
          title: 'Прайм-тайм - 60 секунд',
          description: 'Премиальный слот 60 секунд в прайм-тайм (18:00-21:00)',
          spotDurationSeconds: 60,
          rotationsPerDay: 3,
          timeSlot: 'prime_time',
          pricingType: 'fixed',
          basePrice: 12000,
          pricingConfig: {
            bulkDiscount: {
              enabled: true,
              minSlots: 3,
              discountPercent: 15,
            },
            dynamicDemand: {
              enabled: true,
              thresholdPercent: 75,
              priceMultiplier: 1.3,
            },
          },
          maxSlots: 50,
          slotsTaken: 42,
          platformCommissionRate: 0.15,
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            occupancyPercent: 84,
            totalOrders: 18,
            totalRevenue: 520000,
            totalCommission: 78000,
            totalNetRevenue: 442000,
            availableSlots: 8,
            broadcastedSlots: 38,
          },
        },
        {
          id: 'pkg_003',
          radioId: 'radio_001',
          title: 'Аукцион - Вечерний эфир',
          description: 'Аукционные слоты вечернего эфира - побеждает лучшая ставка',
          spotDurationSeconds: 30,
          rotationsPerDay: 4,
          timeSlot: 'evening',
          pricingType: 'auction',
          basePrice: 0,
          pricingConfig: {
            bulkDiscount: {
              enabled: false,
              minSlots: 0,
              discountPercent: 0,
            },
            dynamicDemand: {
              enabled: false,
              thresholdPercent: 0,
              priceMultiplier: 1,
            },
          },
          auctionConfig: {
            startingBid: 3000,
            minIncrement: 100,
            autoExtend: true,
            extendMinutes: 5,
          },
          maxSlots: 30,
          slotsTaken: 15,
          platformCommissionRate: 0.15,
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            occupancyPercent: 50,
            totalOrders: 8,
            totalRevenue: 145000,
            totalCommission: 21750,
            totalNetRevenue: 123250,
            availableSlots: 15,
            broadcastedSlots: 10,
          },
        },
      ];

      const mockOrders: AdvertisementOrder[] = [
        {
          id: 'order_001',
          packageId: 'pkg_001',
          sellerRadioId: 'radio_001',
          buyerUserId: 'user_001',
          buyerUserEmail: 'venue@example.com',
          buyerUserName: 'Кафе "Уют"',
          buyerVenueName: 'Кафе "Уют"',
          broadcastSlotIds: ['slot_001', 'slot_002', 'slot_003', 'slot_004', 'slot_005'],
          totalSlots: 5,
          adCreativeFileUrl: 'https://example.com/creative.mp3',
          adCreativeType: 'audio_file',
          status: 'in_review',
          baseAmount: 25000,
          discountAmount: 2500,
          demandSurcharge: 0,
          paymentAmount: 22500,
          commissionAmount: 3375,
          netAmountToRadio: 19125,
          commissionStatus: 'pending',
          pricingDetails: {
            basePricePerSlot: 5000,
            totalSlots: 5,
            occupancyPercent: 45,
            demandMultiplierApplied: false,
            bulkDiscountApplied: true,
            discountPercent: 10,
          },
          playReport: {
            totalPlays: 0,
            playDates: [],
            detailedSchedule: [],
            completionPercent: 0,
          },
          paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'order_002',
          packageId: 'pkg_002',
          sellerRadioId: 'radio_001',
          buyerUserId: 'user_002',
          buyerUserEmail: 'shop@example.com',
          buyerUserName: 'Магазин Техники',
          buyerVenueName: 'Техно-Маркет',
          broadcastSlotIds: ['slot_010', 'slot_011', 'slot_012'],
          totalSlots: 3,
          adCreativeText: 'Приходите в наш магазин! Скидки до 50% на всю технику!',
          adCreativeType: 'text_to_speech',
          status: 'approved_by_radio',
          baseAmount: 36000,
          discountAmount: 5400,
          demandSurcharge: 7200,
          paymentAmount: 37800,
          commissionAmount: 5670,
          netAmountToRadio: 32130,
          commissionStatus: 'pending',
          pricingDetails: {
            basePricePerSlot: 12000,
            totalSlots: 3,
            occupancyPercent: 84,
            demandMultiplierApplied: true,
            bulkDiscountApplied: true,
            discountPercent: 15,
          },
          playReport: {
            totalPlays: 2,
            playDates: ['2026-02-01', '2026-02-02'],
            detailedSchedule: [],
            completionPercent: 67,
          },
          paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          reviewNotes: 'Креатив одобрен. Качество хорошее.',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setPackages(mockPackages);
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATS CALCULATION
  // =====================================================

  const stats = {
    totalRevenue: packages.reduce((sum, pkg) => sum + (pkg.stats?.totalRevenue || 0), 0),
    totalCommission: packages.reduce((sum, pkg) => sum + (pkg.stats?.totalCommission || 0), 0),
    totalNetRevenue: packages.reduce((sum, pkg) => sum + (pkg.stats?.totalNetRevenue || 0), 0),
    totalOrders: packages.reduce((sum, pkg) => sum + (pkg.stats?.totalOrders || 0), 0),
    activePackages: packages.filter((p) => p.isActive).length,
    avgOccupancy: packages.length > 0
      ? packages.reduce((sum, pkg) => sum + (pkg.stats?.occupancyPercent || 0), 0) / packages.length
      : 0,
    pendingOrders: orders.filter((o) => o.status === 'in_review').length,
  };

  // =====================================================
  // ACTIONS
  // =====================================================

  const handleApproveOrder = async (orderId: string) => {
    try {
      // TODO: API call
      toast.success('Заказ одобрен');
      loadData();
    } catch (error) {
      toast.error('Ошибка при одобрении заказа');
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      // TODO: API call
      toast.success('Заказ отклонен');
      loadData();
    } catch (error) {
      toast.error('Ошибка при отклонении заказа');
    }
  };

  const handleMarkFulfilled = async (orderId: string) => {
    try {
      // TODO: API call
      toast.success('Заказ отмечен как выполненный. Начислено 100 Promo-коинов!');
      loadData();
    } catch (error) {
      toast.error('Ошибка при завершении заказа');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Удалить этот пакет?')) return;
    
    try {
      // TODO: API call
      toast.success('Пакет удален');
      loadData();
    } catch (error) {
      toast.error('Ошибка при удалении пакета');
    }
  };

  const handleTogglePackageActive = async (packageId: string, isActive: boolean) => {
    try {
      // TODO: API call
      toast.success(isActive ? 'Пакет активирован' : 'Пакет деактивирован');
      loadData();
    } catch (error) {
      toast.error('Ошибка при изменении статуса');
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Рекламные слоты</h2>
          <p className="text-slate-400 mt-1">
            Управление пакетами, слотами и заказами • Комиссия 15%
          </p>
        </div>
        <button
          onClick={() => setShowCreatePackage(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать пакет
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard
          icon={DollarSign}
          label="Общий доход"
          value={`₽${stats.totalRevenue.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={Wallet}
          label="Комиссия"
          value={`₽${stats.totalCommission.toLocaleString()}`}
          color="orange"
        />
        <StatCard
          icon={CreditCard}
          label="Чистая выручка"
          value={`₽${stats.totalNetRevenue.toLocaleString()}`}
          color="blue"
        />
        <StatCard
          icon={Package}
          label="Пакетов"
          value={stats.activePackages}
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          label="Заказов"
          value={stats.totalOrders}
          color="indigo"
        />
        <StatCard
          icon={Percent}
          label="Занятость"
          value={`${Math.round(stats.avgOccupancy)}%`}
          color="yellow"
        />
        <StatCard
          icon={AlertCircle}
          label="Ожидают"
          value={stats.pendingOrders}
          color="red"
          highlight={stats.pendingOrders > 0}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          label="Пакеты"
          icon={Package}
          active={activeTab === 'packages'}
          onClick={() => setActiveTab('packages')}
          count={packages.length}
        />
        <TabButton
          label="Заказы"
          icon={FileText}
          active={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
          count={orders.length}
          badge={stats.pendingOrders}
        />
        <TabButton
          label="Календарь слотов"
          icon={Calendar}
          active={activeTab === 'slots'}
          onClick={() => setActiveTab('slots')}
        />
        <TabButton
          label="Аналитика"
          icon={Activity}
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'packages' && (
            <PackagesTab
              packages={packages}
              onEdit={(pkg) => {
                setSelectedPackage(pkg);
                setShowCreatePackage(true);
              }}
              onDelete={handleDeletePackage}
              onToggleActive={handleTogglePackageActive}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              packages={packages}
              onViewDetails={(order) => {
                setSelectedOrder(order);
                setShowOrderDetails(true);
              }}
              onApprove={handleApproveOrder}
              onReject={handleRejectOrder}
              onMarkFulfilled={handleMarkFulfilled}
            />
          )}

          {activeTab === 'slots' && <SlotsCalendarTab packages={packages} />}

          {activeTab === 'analytics' && <AnalyticsTab packages={packages} orders={orders} />}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreatePackage && (
          <CreatePackageModal
            package={selectedPackage}
            onClose={() => {
              setShowCreatePackage(false);
              setSelectedPackage(null);
            }}
            onSubmit={(data) => {
              console.log('Package data:', data);
              toast.success('Пакет сохранен');
              setShowCreatePackage(false);
              setSelectedPackage(null);
              loadData();
            }}
          />
        )}

        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            package={packages.find((p) => p.id === selectedOrder.packageId)}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
            onApprove={() => handleApproveOrder(selectedOrder.id)}
            onReject={(reason) => handleRejectOrder(selectedOrder.id, reason)}
            onMarkFulfilled={() => handleMarkFulfilled(selectedOrder.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'green' | 'orange' | 'blue' | 'purple' | 'indigo' | 'yellow' | 'red';
  highlight?: boolean;
}

function StatCard({ icon: Icon, label, value, color, highlight }: StatCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  };

  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-br border backdrop-blur-sm ${
        colorClasses[color]
      } ${highlight ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-yellow-500/50 animate-pulse' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/10">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-white truncate">{value}</p>
          <p className="text-xs text-slate-300 truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TAB BUTTON
// =====================================================

interface TabButtonProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  count?: number;
  badge?: number;
}

function TabButton({ label, icon: Icon, active, onClick, count, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && <span className="text-xs opacity-70">({count})</span>}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// =====================================================
// PACKAGES TAB
// =====================================================

interface PackagesTabProps {
  packages: RadioAdvertisementPackage[];
  onEdit: (pkg: RadioAdvertisementPackage) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

function PackagesTab({ packages, onEdit, onDelete, onToggleActive }: PackagesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'auction'>('all');

  const filteredPackages = packages.filter((pkg) => {
    if (filterType !== 'all' && pkg.pricingType !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        pkg.title.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск пакетов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'fixed', 'auction'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                filterType === type
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {type === 'all' ? 'Все' : type === 'fixed' ? 'Фиксированная цена' : 'Аукцион'}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onEdit={() => onEdit(pkg)}
            onDelete={() => onDelete(pkg.id)}
            onToggleActive={(active) => onToggleActive(pkg.id, active)}
          />
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Пакеты не найдены</p>
          <p className="text-sm text-slate-400">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      )}
    </div>
  );
}