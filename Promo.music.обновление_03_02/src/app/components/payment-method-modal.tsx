import { X, CreditCard, Smartphone, Zap, Wallet, Shield, Clock, Check, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface PaymentMethod {
  id: string;
  label: string;
  icon: any;
  description: string;
  processingTime: string;
  fee?: string;
  color: string;
}

interface PaymentMethodModalProps {
  amount: number;
  coins: number;
  baseCoins: number;
  bonusCoins: number;
  onClose: () => void;
  onConfirm: (methodId: string) => void;
}

const paymentMethods: PaymentMethod[] = [
  { 
    id: 'card', 
    label: 'Банковская карта', 
    icon: CreditCard,
    description: 'Visa, Mastercard, МИР',
    processingTime: 'Мгновенно',
    color: 'from-blue-500 to-cyan-500',
  },
  { 
    id: 'phone', 
    label: 'Мобильный платёж', 
    icon: Smartphone,
    description: 'МегаФон, МТС, Билайн, Tele2',
    processingTime: '1-5 минут',
    fee: '+5%',
    color: 'from-purple-500 to-pink-500',
  },
  { 
    id: 'sbp', 
    label: 'СБП', 
    icon: Zap,
    description: 'Система быстрых платежей',
    processingTime: 'Мгновенно',
    color: 'from-orange-500 to-red-500',
  },
  { 
    id: 'wallet', 
    label: 'Электронный кошелёк', 
    icon: Wallet,
    description: 'ЮMoney, QIWI, WebMoney',
    processingTime: '1-3 минуты',
    color: 'from-emerald-500 to-green-500',
  },
];

export function PaymentMethodModal({ amount, coins, baseCoins, bonusCoins, onClose, onConfirm }: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('phone');

  const handleContinue = () => {
    onConfirm(selectedMethod);
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
  const finalAmount = selectedMethodData?.fee ? amount * 1.05 : amount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-3 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 shadow-2xl overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Способ оплаты</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="relative z-50 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.button>
        </div>

        {/* Content - Scrollable */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          {/* Payment Methods Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {/* Selected Check */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-3 sm:mb-4`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Label */}
                  <div className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">{method.label}</div>

                  {/* Description */}
                  <div className="text-gray-400 text-xs sm:text-sm mb-3">{method.description}</div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{method.processingTime}</span>
                    </div>
                    {method.fee && (
                      <div className="text-orange-400 font-semibold">{method.fee}</div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Security Notice */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-400/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-blue-400 font-bold text-sm sm:text-base mb-1 sm:mb-2">Безопасные платежи</div>
                <div className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Все платежи защищены SSL-шифрованием. Мы не храним данные ваших банковских карт.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl p-4 sm:p-5 md:p-6">
          {/* Amount Summary */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-400 text-xs sm:text-sm mb-1">К оплате:</div>
              <div className="text-white text-2xl sm:text-3xl font-bold">
                {finalAmount.toFixed(0)}₽
              </div>
            </div>
            {selectedMethodData?.fee && (
              <div className="text-right">
                <div className="text-gray-400 text-xs sm:text-sm mb-1">Комиссия:</div>
                <div className="text-orange-400 text-base sm:text-lg font-semibold">
                  +{(finalAmount - amount).toFixed(0)}₽
                </div>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            Продолжить
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}