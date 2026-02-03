/**
 * AD SLOTS SECTION - PART 2
 * Дополнительные компоненты для рекламных слотов
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Package, Edit, Trash2, Eye, Play, Clock, DollarSign, Percent,
  CheckCircle, XCircle, AlertCircle, Calendar, FileText, Download,
  MessageSquare, Star, Award, TrendingUp, Users, BarChart3, Settings,
  Zap, Shield, Ban, Activity, Target, Upload, X, ChevronDown, ChevronUp,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

// Import types from main file
import type {
  RadioAdvertisementPackage,
  AdvertisementOrder,
  BroadcastSlot,
  TimeSlotType,
  OrderStatus,
  PricingType
} from './ad-slots-section';

// =====================================================
// PACKAGE CARD
// =====================================================

interface PackageCardProps {
  package: RadioAdvertisementPackage;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
}

export function PackageCard({ package: pkg, onEdit, onDelete, onToggleActive }: PackageCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const occupancy = pkg.stats?.occupancyPercent || 0;
  const isHighDemand = occupancy >= (pkg.pricingConfig.dynamicDemand.thresholdPercent || 80);

  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white truncate">{pkg.title}</h3>
            {pkg.isFeatured && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
            {!pkg.isActive && (
              <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-slate-400 line-clamp-2">{pkg.description}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Редактировать"
          >
            <Edit className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span className="text-xs text-slate-400">Длительность</span>
          </div>
          <p className="text-white font-medium">{pkg.spotDurationSeconds} сек</p>
        </div>
        
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-xs text-slate-400">Базовая цена</span>
          </div>
          <p className="text-white font-medium">₽{pkg.basePrice.toLocaleString()}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-slate-400">Ротация/день</span>
          </div>
          <p className="text-white font-medium">{pkg.rotationsPerDay}x</p>
        </div>
        
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-slate-400">Комиссия</span>
          </div>
          <p className="text-white font-medium">{(pkg.platformCommissionRate * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Occupancy Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Занятость слотов</span>
          <span className="text-white font-medium">{occupancy.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              occupancy >= 90
                ? 'bg-red-500'
                : occupancy >= 75
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(occupancy, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{pkg.slotsTaken} занято</span>
          <span>{pkg.maxSlots} всего</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            pkg.pricingType === 'fixed'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
          }`}
        >
          {pkg.pricingType === 'fixed' ? 'Фиксированная цена' : 'Аукцион'}
        </span>
        
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {getTimeSlotLabel(pkg.timeSlot)}
        </span>
        
        {isHighDemand && (
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Высокий спрос
          </span>
        )}
        
        {pkg.pricingConfig.bulkDiscount.enabled && (
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            Скидка за объем
          </span>
        )}
      </div>

      {/* Stats (if available) */}
      {pkg.stats && (
        <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{pkg.stats.totalOrders}</p>
            <p className="text-xs text-slate-400">Заказов</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              ₽{(pkg.stats.totalNetRevenue / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-slate-400">Выручка</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-400">
              {pkg.stats.broadcastedSlots}
            </p>
            <p className="text-xs text-slate-400">Вышло</p>
          </div>
        </div>
      )}

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center justify-between text-sm"
      >
        <span>Подробнее</span>
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-white/10 space-y-3"
        >
          {/* Pricing Config */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Ценообразование:</h4>
            <div className="space-y-2 text-sm">
              {pkg.pricingConfig.bulkDiscount.enabled && (
                <div className="flex justify-between text-slate-300">
                  <span>Скидка за объем:</span>
                  <span>
                    {pkg.pricingConfig.bulkDiscount.discountPercent}% при {pkg.pricingConfig.bulkDiscount.minSlots}+ слотах
                  </span>
                </div>
              )}
              {pkg.pricingConfig.dynamicDemand.enabled && (
                <div className="flex justify-between text-slate-300">
                  <span>Наценка при спросе:</span>
                  <span>
                    +{((pkg.pricingConfig.dynamicDemand.priceMultiplier - 1) * 100).toFixed(0)}% при {pkg.pricingConfig.dynamicDemand.thresholdPercent}%+ занятости
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Auction Config */}
          {pkg.pricingType === 'auction' && pkg.auctionConfig && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Аукцион:</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Стартовая ставка:</span>
                  <span>₽{pkg.auctionConfig.startingBid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Мин. шаг:</span>
                  <span>₽{pkg.auctionConfig.minIncrement.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-sm text-white">Статус пакета:</span>
            <button
              onClick={() => onToggleActive(!pkg.isActive)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pkg.isActive
                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                  : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
              }`}
            >
              {pkg.isActive ? 'Активен' : 'Неактивен'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// =====================================================
// ORDERS TAB
// =====================================================

interface OrdersTabProps {
  orders: AdvertisementOrder[];
  packages: RadioAdvertisementPackage[];
  onViewDetails: (order: AdvertisementOrder) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onMarkFulfilled: (id: string) => void;
}

export function OrdersTab({
  orders,
  packages,
  onViewDetails,
  onApprove,
  onReject,
  onMarkFulfilled,
}: OrdersTabProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.buyerUserName?.toLowerCase().includes(query) ||
        order.buyerVenueName?.toLowerCase().includes(query) ||
        order.buyerUserEmail.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по покупателю..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'in_review', 'approved_by_radio', 'fulfilled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {getOrderStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const pkg = packages.find((p) => p.id === order.packageId);
          return (
            <OrderCard
              key={order.id}
              order={order}
              package={pkg}
              onViewDetails={() => onViewDetails(order)}
              onApprove={() => onApprove(order.id)}
              onReject={(reason) => onReject(order.id, reason)}
              onMarkFulfilled={() => onMarkFulfilled(order.id)}
            />
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Заказы не найдены</p>
          <p className="text-sm text-slate-400">
            Попробуйте изменить фильтры
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// ORDER CARD
// =====================================================

interface OrderCardProps {
  order: AdvertisementOrder;
  package?: RadioAdvertisementPackage;
  onViewDetails: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onMarkFulfilled: () => void;
}

function OrderCard({
  order,
  package: pkg,
  onViewDetails,
  onApprove,
  onReject,
  onMarkFulfilled,
}: OrderCardProps) {
  const statusColors: Record<OrderStatus, string> = {
    pending_payment: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    paid: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    in_review: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    approved_by_radio: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected_by_radio: 'bg-red-500/20 text-red-300 border-red-500/30',
    fulfilled: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    refunded: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    cancelled: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {order.buyerVenueName || order.buyerUserName}
              </h3>
              <p className="text-sm text-slate-400">{order.buyerUserEmail}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                statusColors[order.status]
              }`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          {/* Package Info */}
          {pkg && (
            <div className="mb-3 p-3 rounded-lg bg-white/5">
              <p className="text-sm text-slate-300">{pkg.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span>{order.totalSlots} слотов</span>
                <span>•</span>
                <span>{pkg.spotDurationSeconds} сек</span>
              </div>
            </div>
          )}

          {/* Financial Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div>
              <p className="text-xs text-slate-400">Сумма заказа</p>
              <p className="text-white font-medium">₽{order.paymentAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Комиссия (15%)</p>
              <p className="text-orange-400 font-medium">₽{order.commissionAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Ваша выручка</p>
              <p className="text-green-400 font-medium">₽{order.netAmountToRadio.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Выполнено</p>
              <p className="text-white font-medium">{order.playReport.completionPercent}%</p>
            </div>
          </div>

          {/* Pricing Details */}
          {(order.pricingDetails.demandMultiplierApplied || order.pricingDetails.bulkDiscountApplied) && (
            <div className="flex flex-wrap gap-2">
              {order.pricingDetails.demandMultiplierApplied && (
                <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                  +Наценка за спрос
                </span>
              )}
              {order.pricingDetails.bulkDiscountApplied && (
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
                  −{order.pricingDetails.discountPercent}% скидка
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm"
          >
            Подробнее
          </button>

          {order.status === 'in_review' && (
            <>
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                ✓ Одобрить
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Причина отклонения:');
                  if (reason) onReject(reason);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                ✗ Отклонить
              </button>
            </>
          )}

          {order.status === 'approved_by_radio' && order.playReport.completionPercent === 100 && (
            <button
              onClick={onMarkFulfilled}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Завершить (+100 коинов)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getTimeSlotLabel(timeSlot: TimeSlotType): string {
  const labels: Record<TimeSlotType, string> = {
    morning: 'Утро',
    afternoon: 'День',
    evening: 'Вечер',
    night: 'Ночь',
    prime_time: 'Прайм-тайм',
    any: 'Любое время',
  };
  return labels[timeSlot];
}

function getOrderStatusLabel(status: OrderStatus | 'all'): string {
  const labels: Record<OrderStatus | 'all', string> = {
    all: 'Все',
    pending_payment: 'Ожидает оплаты',
    paid: 'Оплачен',
    in_review: 'На модерации',
    approved_by_radio: 'Одобрен',
    rejected_by_radio: 'Отклонен',
    fulfilled: 'Выполнен',
    refunded: 'Возвращен',
    cancelled: 'Отменен',
  };
  return labels[status];
}

// =====================================================
// SLOTS CALENDAR TAB (Simplified)
// =====================================================

export function SlotsCalendarTab({ packages }: { packages: RadioAdvertisementPackage[] }) {
  return (
    <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
      <Calendar className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Календарь слотов</h3>
      <p className="text-slate-400 max-w-md mx-auto">
        Интерактивный календарь с доступными и забронированными слотами
      </p>
      <p className="text-sm text-slate-500 mt-4">
        В разработке...
      </p>
    </div>
  );
}

// =====================================================
// ANALYTICS TAB (Simplified)
// =====================================================

export function AnalyticsTab({
  packages,
  orders,
}: {
  packages: RadioAdvertisementPackage[];
  orders: AdvertisementOrder[];
}) {
  const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.stats?.totalRevenue || 0), 0);
  const totalCommission = packages.reduce((sum, pkg) => sum + (pkg.stats?.totalCommission || 0), 0);
  const totalNetRevenue = packages.reduce((sum, pkg) => sum + (pkg.stats?.totalNetRevenue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-green-500/20">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-300">Общий доход</p>
              <p className="text-2xl font-bold text-white">₽{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Percent className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-orange-300">Комиссия платформы</p>
              <p className="text-2xl font-bold text-white">₽{totalCommission.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-300">Ваша выручка</p>
              <p className="text-2xl font-bold text-white">₽{totalNetRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
        <BarChart3 className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Расширенная аналитика</h3>
        <p className="text-slate-400">
          Графики доходов, статистика по пакетам, прогнозирование
        </p>
      </div>
    </div>
  );
}

// =====================================================
// CREATE PACKAGE MODAL (Full version)
// =====================================================

export function CreatePackageModal({
  package: pkg,
  onClose,
  onSubmit,
}: {
  package: RadioAdvertisementPackage | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  // Form state
  const [title, setTitle] = useState(pkg?.title || '');
  const [description, setDescription] = useState(pkg?.description || '');
  const [spotDuration, setSpotDuration] = useState<5 | 10 | 15 | 30 | 60>(pkg?.spotDurationSeconds || 30);
  const [rotationsPerDay, setRotationsPerDay] = useState(pkg?.rotationsPerDay || 5);
  const [timeSlot, setTimeSlot] = useState<TimeSlotType>(pkg?.timeSlot || 'any');
  const [pricingType, setPricingType] = useState<PricingType>(pkg?.pricingType || 'fixed');
  const [basePrice, setBasePrice] = useState(pkg?.basePrice?.toString() || '');
  
  // Bulk discount
  const [bulkDiscountEnabled, setBulkDiscountEnabled] = useState(pkg?.pricingConfig.bulkDiscount.enabled ?? true);
  const [bulkDiscountMinSlots, setBulkDiscountMinSlots] = useState(pkg?.pricingConfig.bulkDiscount.minSlots || 5);
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState(pkg?.pricingConfig.bulkDiscount.discountPercent || 10);
  
  // Dynamic demand
  const [dynamicDemandEnabled, setDynamicDemandEnabled] = useState(pkg?.pricingConfig.dynamicDemand.enabled ?? true);
  const [dynamicDemandThreshold, setDynamicDemandThreshold] = useState(pkg?.pricingConfig.dynamicDemand.thresholdPercent || 80);
  const [dynamicDemandMultiplier, setDynamicDemandMultiplier] = useState(pkg?.pricingConfig.dynamicDemand.priceMultiplier || 1.2);
  
  // Auction (if applicable)
  const [auctionStartingBid, setAuctionStartingBid] = useState(pkg?.auctionConfig?.startingBid?.toString() || '');
  const [auctionMinIncrement, setAuctionMinIncrement] = useState(pkg?.auctionConfig?.minIncrement?.toString() || '100');
  const [auctionAutoExtend, setAuctionAutoExtend] = useState(pkg?.auctionConfig?.autoExtend ?? true);
  
  // Other
  const [maxSlots, setMaxSlots] = useState(pkg?.maxSlots?.toString() || '100');
  const [isFeatured, setIsFeatured] = useState(pkg?.isFeatured || false);
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      toast.error('Введите название пакета');
      return;
    }
    
    if (pricingType === 'fixed' && (!basePrice || parseFloat(basePrice) <= 0)) {
      toast.error('Укажите базовую цену');
      return;
    }
    
    if (pricingType === 'auction' && (!auctionStartingBid || parseFloat(auctionStartingBid) <= 0)) {
      toast.error('Укажите стартовую ставку для аукциона');
      return;
    }
    
    if (!maxSlots || parseInt(maxSlots) <= 0) {
      toast.error('Укажите максимальное количество слотов');
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
      spotDurationSeconds: spotDuration,
      rotationsPerDay,
      timeSlot,
      pricingType,
      basePrice: pricingType === 'fixed' ? parseFloat(basePrice) : 0,
      pricingConfig: {
        bulkDiscount: {
          enabled: bulkDiscountEnabled,
          minSlots: bulkDiscountMinSlots,
          discountPercent: bulkDiscountPercent,
        },
        dynamicDemand: {
          enabled: dynamicDemandEnabled,
          thresholdPercent: dynamicDemandThreshold,
          priceMultiplier: dynamicDemandMultiplier,
        },
      },
      auctionConfig: pricingType === 'auction' ? {
        startingBid: parseFloat(auctionStartingBid),
        minIncrement: parseFloat(auctionMinIncrement),
        autoExtend: auctionAutoExtend,
        extendMinutes: 5,
      } : undefined,
      maxSlots: parseInt(maxSlots),
      isFeatured,
      platformCommissionRate: 0.15,
    };

    onSubmit(data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {pkg ? 'Редактировать пакет' : 'Создать пакет'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Шаг {currentStep} из {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i < currentStep ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Название пакета <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Утренний эфир - 30 секунд"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание пакета для покупателей"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Длительность ролика <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={spotDuration}
                    onChange={(e) => setSpotDuration(parseInt(e.target.value) as 5 | 10 | 15 | 30 | 60)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value={5}>5 секунд</option>
                    <option value={10}>10 секунд</option>
                    <option value={15}>15 секунд</option>
                    <option value={30}>30 секунд</option>
                    <option value={60}>60 секунд (1 минута)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Ротаций в день <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={rotationsPerDay}
                    onChange={(e) => setRotationsPerDay(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Количество выходов в эфир за день</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Временной слот <span className="text-red-400">*</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as TimeSlotType)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="any">Любое время</option>
                  <option value="morning">Утро (06:00-12:00)</option>
                  <option value="afternoon">День (12:00-18:00)</option>
                  <option value="evening">Вечер (18:00-22:00)</option>
                  <option value="night">Ночь (22:00-06:00)</option>
                  <option value="prime_time">Прайм-тайм (18:00-21:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Максимум слотов <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Общее количество слотов, которое можно продать
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 rounded bg-white/5 border-white/10 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="featured" className="flex-1 text-sm text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="font-medium">Рекомендованный пакет</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Пакет будет выделен в каталоге
                  </p>
                </label>
              </div>
            </motion.div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Тип ценообразования <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPricingType('fixed')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      pricingType === 'fixed'
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-indigo-400" />
                      <span className="font-medium text-white">Фиксированная цена</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Покупатель видит финальную цену сразу
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPricingType('auction')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      pricingType === 'auction'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-white">Аукцион</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Покупатели делают ставки на слоты
                    </p>
                  </button>
                </div>
              </div>

              {pricingType === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Базовая цена за слот <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="5000"
                      className="w-full px-4 py-3 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₽</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Цена может меняться динамически в зависимости от спроса и скидок
                  </p>
                </div>
              )}

              {pricingType === 'auction' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Стартовая ставка <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={auctionStartingBid}
                        onChange={(e) => setAuctionStartingBid(e.target.value)}
                        placeholder="3000"
                        className="w-full px-4 py-3 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₽</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Минимальный шаг ставки
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="10"
                        value={auctionMinIncrement}
                        onChange={(e) => setAuctionMinIncrement(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₽</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                    <input
                      type="checkbox"
                      id="autoExtend"
                      checked={auctionAutoExtend}
                      onChange={(e) => setAuctionAutoExtend(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border-white/10"
                    />
                    <label htmlFor="autoExtend" className="flex-1 text-sm text-white cursor-pointer">
                      Автопродление при новых ставках
                      <p className="text-xs text-slate-400 mt-1">
                        Продлевает аукцион на 5 минут при поступлении новой ставки
                      </p>
                    </label>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-start gap-3">
                  <Percent className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-300">Комиссия платформы</p>
                    <p className="text-xs text-slate-400 mt-1">
                      С каждого заказа взимается 15% комиссии. Вы получаете 85% от суммы заказа.
                    </p>
                    {pricingType === 'fixed' && basePrice && (
                      <p className="text-sm text-white mt-2">
                        Пример: При цене {basePrice}₽ вы получите{' '}
                        <span className="font-bold text-green-400">
                          {Math.floor(parseFloat(basePrice) * 0.85)}₽
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Dynamic Pricing */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Bulk Discount */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <h4 className="font-medium text-white">Скидка за объем</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkDiscountEnabled}
                      onChange={(e) => setBulkDiscountEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {bulkDiscountEnabled && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Минимум слотов
                        </label>
                        <input
                          type="number"
                          min="2"
                          value={bulkDiscountMinSlots}
                          onChange={(e) => setBulkDiscountMinSlots(parseInt(e.target.value) || 2)}
                          className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Скидка (%)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={bulkDiscountPercent}
                          onChange={(e) => setBulkDiscountPercent(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      При покупке {bulkDiscountMinSlots}+ слотов покупатель получит скидку {bulkDiscountPercent}%
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Demand */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-medium text-white">Наценка за спрос</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dynamicDemandEnabled}
                      onChange={(e) => setDynamicDemandEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>

                {dynamicDemandEnabled && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Порог занятости (%)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="100"
                          value={dynamicDemandThreshold}
                          onChange={(e) => setDynamicDemandThreshold(parseInt(e.target.value) || 50)}
                          className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Множитель цены
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          step="0.1"
                          value={dynamicDemandMultiplier}
                          onChange={(e) => setDynamicDemandMultiplier(parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      При занятости {dynamicDemandThreshold}%+ цена увеличивается в {dynamicDemandMultiplier}x раз (
                      +{Math.round((dynamicDemandMultiplier - 1) * 100)}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Example Calculation */}
              {pricingType === 'fixed' && basePrice && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-400" />
                    Пример расчета цены
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Базовая цена за слот:</span>
                      <span className="text-white">₽{parseFloat(basePrice).toLocaleString()}</span>
                    </div>
                    {bulkDiscountEnabled && (
                      <>
                        <div className="flex justify-between text-green-400">
                          <span>Скидка за объем ({bulkDiscountMinSlots}+ слотов):</span>
                          <span>-{bulkDiscountPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Цена со скидкой:</span>
                          <span className="text-white">
                            ₽{Math.floor(parseFloat(basePrice) * (1 - bulkDiscountPercent / 100)).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    {dynamicDemandEnabled && (
                      <>
                        <div className="flex justify-between text-yellow-400">
                          <span>Наценка за спрос ({dynamicDemandThreshold}%+):</span>
                          <span>×{dynamicDemandMultiplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Макс. цена при высоком спросе:</span>
                          <span className="text-white">
                            ₽{Math.floor(parseFloat(basePrice) * dynamicDemandMultiplier).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t border-white/10 flex justify-between">
                      <span className="text-slate-400">Ваша выручка (85%):</span>
                      <span className="text-green-400 font-bold">
                        ₽{Math.floor(parseFloat(basePrice) * 0.85).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
            >
              Назад
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
          >
            Отмена
          </button>
          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium"
            >
              Далее
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium"
            >
              {pkg ? 'Сохранить изменения' : 'Создать пакет'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// =====================================================
// ORDER DETAILS MODAL (Simplified)
// =====================================================

export function OrderDetailsModal({
  order,
  package: pkg,
  onClose,
  onApprove,
  onReject,
  onMarkFulfilled,
}: {
  order: AdvertisementOrder;
  package?: RadioAdvertisementPackage;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onMarkFulfilled: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Детали заказа #{order.id.slice(0, 8)}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Buyer Info */}
          <div className="p-4 rounded-xl bg-white/5">
            <h4 className="text-white font-medium mb-2">Покупатель</h4>
            <div className="space-y-1 text-sm">
              <p className="text-slate-300">{order.buyerVenueName || order.buyerUserName}</p>
              <p className="text-slate-400">{order.buyerUserEmail}</p>
            </div>
          </div>

          {/* Package Info */}
          {pkg && (
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="text-white font-medium mb-2">Пакет</h4>
              <p className="text-slate-300 text-sm">{pkg.title}</p>
              <p className="text-slate-400 text-xs mt-1">
                {order.totalSlots} слотов × {pkg.spotDurationSeconds} сек
              </p>
            </div>
          )}

          {/* Creative */}
          {(order.adCreativeFileUrl || order.adCreativeText) && (
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="text-white font-medium mb-2">Креатив</h4>
              {order.adCreativeFileUrl && (
                <div className="mb-2">
                  <audio controls className="w-full">
                    <source src={order.adCreativeFileUrl} />
                  </audio>
                </div>
              )}
              {order.adCreativeText && (
                <p className="text-slate-300 text-sm p-3 rounded-lg bg-black/20">
                  {order.adCreativeText}
                </p>
              )}
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl bg-white/5">
            <h4 className="text-white font-medium mb-3">Финансы</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Базовая стоимость:</span>
                <span>₽{order.baseAmount.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Скидка:</span>
                  <span>-₽{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              {order.demandSurcharge > 0 && (
                <div className="flex justify-between text-yellow-400">
                  <span>Наценка за спрос:</span>
                  <span>+₽{order.demandSurcharge.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-medium pt-2 border-t border-white/10">
                <span>Сумма заказа:</span>
                <span>₽{order.paymentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-orange-400">
                <span>Комиссия платформы (15%):</span>
                <span>₽{order.commissionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-400 font-medium">
                <span>Ваша выручка (85%):</span>
                <span>₽{order.netAmountToRadio.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {order.status === 'in_review' && (
            <>
              <button
                onClick={onApprove}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                ✓ Одобрить креатив
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Причина отклонения:');
                  if (reason) onReject(reason);
                }}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                ✗ Отклонить
              </button>
            </>
          )}
          {order.status === 'approved_by_radio' && (
            <button
              onClick={onMarkFulfilled}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              Отметить выполненным (+100 коинов)
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </div>
  );
}
