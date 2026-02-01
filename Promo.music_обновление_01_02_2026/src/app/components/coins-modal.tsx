import { X, Coins, CreditCard, Smartphone, Zap, Wallet, Sparkles, Gift, TrendingUp, Check, Info, ArrowRight, Star, Crown, ChevronRight, Lock, Shield, Clock, Users, Target, Music2, Video, Calendar, Newspaper, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { PaymentMethodModal } from '@/app/components/payment-method-modal';
import { PaymentConfirmationModal } from '@/app/components/payment-confirmation-modal';
import { PaymentSuccessModal } from '@/app/components/payment-success-modal';
import { useSubscription, subscriptionHelpers } from '@/contexts/SubscriptionContext';

interface CoinsModalProps {
  isOpen: boolean;
  balance: number;
  onClose: () => void;
  onBalanceUpdate?: (newBalance: number) => void;
}

interface CoinsPackage {
  id: string;
  coins: number;
  baseCoins: number;
  bonusCoins: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  label?: string;
  popular?: boolean;
  best?: boolean;
  features: string[];
}

interface PaymentMethod {
  id: string;
  label: string;
  icon: any;
  description: string;
  processingTime: string;
  fee?: string;
}

const packages: CoinsPackage[] = [
  { 
    id: 'starter',
    coins: 100,
    baseCoins: 100,
    bonusCoins: 0,
    price: 9900,
    label: 'Стартовый',
    features: [
      '1 базовая кампания',
      'Продвижение трека 7 дней',
      'Базовая статистика',
    ]
  },
  { 
    id: 'standard',
    coins: 550,
    baseCoins: 500,
    bonusCoins: 50,
    price: 44900,
    originalPrice: 49900,
    discount: 10,
    label: 'Стандарт',
    popular: true,
    features: [
      '1-2 продвинутых кампании',
      'Продвижение в соцсетях',
      'Расширенная аналитика',
      'Приоритетная поддержка',
    ]
  },
  { 
    id: 'premium',
    coins: 1150,
    baseCoins: 1000,
    bonusCoins: 150,
    price: 79900,
    originalPrice: 99900,
    discount: 20,
    label: 'Премиум',
    features: [
      '2-3 профессиональных кампаний',
      'Максимальный охват',
      'Полная аналитика',
      'Персональный менеджер',
      'Продвижение на главной',
    ]
  },
  { 
    id: 'ultimate',
    coins: 3000,
    baseCoins: 2500,
    bonusCoins: 500,
    price: 189900,
    originalPrice: 249900,
    discount: 24,
    label: 'Максимум',
    best: true,
    features: [
      '5+ профессиональных кампаний',
      'Все платформы и соцсети',
      'Продвижение через инфлюенсеров',
      'Радио ротация',
      'VIP поддержка 24/7',
      'Индивидуальная стратегия',
    ]
  },
];

const paymentMethods: PaymentMethod[] = [
  { 
    id: 'card', 
    label: 'Банковская карта', 
    icon: CreditCard,
    description: 'Visa, Mastercard, МИР',
    processingTime: 'Мгновенно',
  },
  { 
    id: 'phone', 
    label: 'Мобильный платёж', 
    icon: Smartphone,
    description: 'МегаФон, МТС, Билайн, Tele2',
    processingTime: '1-5 минут',
    fee: '+5%',
  },
  { 
    id: 'sbp', 
    label: 'СБП', 
    icon: Zap,
    description: 'Система быстрых платежей',
    processingTime: 'Мгновенно',
  },
  { 
    id: 'wallet', 
    label: 'Электронный кошелёк', 
    icon: Wallet,
    description: 'ЮMoney, QIWI, WebMoney',
    processingTime: '1-3 минуты',
  },
];

const usageExamples = [
  {
    icon: Music2,
    title: 'Продвижение трека',
    description: 'От 100 коинов',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Video,
    title: 'Продвижение видео',
    description: 'От 100 коинов',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Calendar,
    title: 'Продвижение концерта',
    description: 'От 100 коинов',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Newspaper,
    title: 'Продвижение новости',
    description: 'От 100 коинов',
    color: 'from-emerald-500 to-green-500',
  },
];

export function CoinsModal({ isOpen, balance, onClose, onBalanceUpdate }: CoinsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [showDetails, setShowDetails] = useState(false);
  
  // Payment flow states
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [selectedMethodLabel, setSelectedMethodLabel] = useState('');

  // Get subscription bonus
  const { subscription } = useSubscription();
  const coinsBonus = subscriptionHelpers.getCoinsBonus(subscription);

  const selectedPkg = packages[selectedPackage];
  const selectedMethod = paymentMethods.find(m => m.id === selectedPayment);

  // Применяем бонус подписки
  const finalCoins = Math.round(selectedPkg.coins * (1 + coinsBonus));
  const subscriptionBonusCoins = finalCoins - selectedPkg.coins;

  const handlePurchase = () => {
    // Открываем модал выбора способа оплаты
    setShowMethodModal(true);
  };

  const handleMethodSelect = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedMethodId(methodId);
      setSelectedMethodLabel(method.label);
      setShowMethodModal(false);
      setShowConfirmModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true);
    
    // Обновляем баланс
    if (onBalanceUpdate) {
      onBalanceUpdate(balance + finalCoins);
    }
  };

  const handleCloseAll = () => {
    setShowSuccessModal(false);
    setShowConfirmModal(false);
    setShowMethodModal(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-2 sm:p-3 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/20 overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-[130] w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20"
                >
                  <Coins className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 text-white" />
                </motion.div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">Купить коины</h2>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                Текущий баланс: <span className="text-yellow-400 font-bold">{(balance || 0).toLocaleString()}</span> коинов
              </p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
              {packages.map((pkg, index) => (
                <motion.button
                  key={pkg.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPackage(index)}
                  className={`relative p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 text-left ${
                    selectedPackage === index
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {/* Badges */}
                  {(pkg.popular || pkg.best) && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-lg whitespace-nowrap">
                      {pkg.popular && (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          ПОПУЛЯРНЫЙ
                        </div>
                      )}
                      {pkg.best && (
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          ВЫГОДНО
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discount Badge */}
                  {pkg.discount && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] sm:text-xs font-bold">
                      -{pkg.discount}%
                    </div>
                  )}
                  
                  <div className="space-y-2 sm:space-y-3">
                    {/* Icon & Label */}
                    <div className="flex items-center justify-between">
                      <Coins className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${selectedPackage === index ? 'text-yellow-400' : 'text-gray-400'}`} />
                      {pkg.label && (
                        <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">{pkg.label}</span>
                      )}
                    </div>

                    {/* Coins */}
                    <div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-baseline gap-1.5">
                        {(pkg.coins || 0).toLocaleString()}
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                      </div>
                      {pkg.bonusCoins > 0 && (
                        <div className="text-[10px] sm:text-xs text-emerald-400 font-semibold mt-0.5 sm:mt-1 flex items-center gap-1">
                          <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          +{pkg.bonusCoins} бонус
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      {pkg.originalPrice && (
                        <div className="text-xs sm:text-sm text-gray-500 line-through">{pkg.originalPrice}₽</div>
                      )}
                      <div className="text-lg sm:text-xl md:text-2xl text-white font-bold">{pkg.price}₽</div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-1 sm:space-y-1.5 pt-2 sm:pt-3 border-t border-white/10">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] sm:text-xs text-gray-300">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Usage Examples */}
            <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-white font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  Как использовать коины
                </h3>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-cyan-400 text-xs sm:text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  {showDetails ? 'Скрыть' : 'Подробнее'}
                  <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {usageExamples.map((example, index) => {
                  const Icon = example.icon;
                  return (
                    <div
                      key={index}
                      className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${example.color} flex items-center justify-center mb-1.5 sm:mb-2`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="text-white font-semibold text-[10px] sm:text-xs mb-0.5">{example.title}</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs">{example.description}</div>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 space-y-2 text-xs sm:text-sm text-gray-300">
                      <p className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>Используйте коины для запуска рекламных кампаний любого вашего контента</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Выбирайте целевую аудиторию, платформы и длительность продвижения</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Отслеживайте статистику в реальном времени и оптимизируйте кампании</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Payment Methods */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h3 className="text-white font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Способ оплаты</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;
                  return (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-xl border-2 transition-all duration-300 text-left ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                        {isSelected && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-white font-semibold text-xs sm:text-sm mb-1">{method.label}</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs mb-1.5">{method.description}</div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {method.processingTime}
                        </span>
                        {method.fee && (
                          <span className="text-orange-400 font-semibold">{method.fee}</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Security Notice */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-400/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-blue-400 font-semibold text-xs sm:text-sm mb-1">Безопасные платежи</div>
                  <div className="text-gray-300 text-[10px] sm:text-xs">
                    Все платежи защищены SSL-шифрованием. Мы не храним данные ваших банковских карт.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="relative z-10 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl p-3 sm:p-4 md:p-6">
          {/* Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-full sm:w-auto">
              <div className="text-gray-400 text-xs sm:text-sm mb-1">Вы получите:</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white">{(finalCoins || 0).toLocaleString()}</span>
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                {selectedPkg.bonusCoins > 0 && (
                  <span className="text-xs sm:text-sm text-emerald-400 font-semibold">
                    ({(selectedPkg.baseCoins || 0).toLocaleString()} + {selectedPkg.bonusCoins} бонус)
                  </span>
                )}
                {subscriptionBonusCoins > 0 && (
                  <span className="text-xs sm:text-sm text-emerald-400 font-semibold">
                    +{subscriptionBonusCoins} бонус от подписки
                  </span>
                )}
              </div>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right">
              <div className="text-gray-400 text-xs sm:text-sm mb-1">К оплате:</div>
              <div className="flex items-baseline gap-2">
                {selectedPkg.originalPrice && (
                  <span className="text-base sm:text-lg text-gray-500 line-through">{selectedPkg.originalPrice}₽</span>
                )}
                <span className="text-2xl sm:text-3xl font-bold text-white">{selectedPkg.price}₽</span>
                {selectedPkg.discount && (
                  <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] sm:text-xs font-bold">
                    -{selectedPkg.discount}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePurchase}
            className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-sm sm:text-base md:text-lg shadow-lg shadow-yellow-500/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            Перейти к оплате
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>

          {/* Additional Info */}
          <div className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-gray-400">
            Оплачивая, вы принимаете <span className="text-cyan-400 cursor-pointer hover:underline">услвия использования</span> и <span className="text-cyan-400 cursor-pointer hover:underline">политику конфиденциальности</span>
          </div>
        </div>
      </motion.div>

      {/* Payment Method Modal */}
      <AnimatePresence>
        {showMethodModal && (
          <PaymentMethodModal
            amount={selectedPkg.price}
            coins={selectedPkg.coins}
            baseCoins={selectedPkg.baseCoins}
            bonusCoins={selectedPkg.bonusCoins}
            onClose={() => setShowMethodModal(false)}
            onConfirm={handleMethodSelect}
          />
        )}
      </AnimatePresence>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <PaymentConfirmationModal
            amount={selectedPkg.price}
            coins={selectedPkg.coins}
            baseCoins={selectedPkg.baseCoins}
            bonusCoins={selectedPkg.bonusCoins}
            methodId={selectedMethodId}
            methodLabel={selectedMethodLabel}
            onClose={() => setShowConfirmModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>

      {/* Payment Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <PaymentSuccessModal
            coins={selectedPkg.coins}
            baseCoins={selectedPkg.baseCoins}
            bonusCoins={selectedPkg.bonusCoins}
            amount={selectedPkg.price}
            newBalance={balance + finalCoins}
            onClose={handleCloseAll}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}