import { X, CreditCard, Smartphone, Zap, Wallet, Coins, Lock, Shield, AlertCircle, Check, Loader } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface PaymentConfirmationModalProps {
  amount: number;
  coins: number;
  baseCoins: number;
  bonusCoins: number;
  methodId: string;
  methodLabel: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentConfirmationModal({ 
  amount, 
  coins, 
  baseCoins,
  bonusCoins,
  methodId, 
  methodLabel, 
  onClose, 
  onSuccess 
}: PaymentConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Получить иконку метода
  const getMethodIcon = () => {
    switch (methodId) {
      case 'card': return CreditCard;
      case 'phone': return Smartphone;
      case 'sbp': return Zap;
      case 'wallet': return Wallet;
      default: return CreditCard;
    }
  };

  const MethodIcon = getMethodIcon();

  // Обработка оплаты
  const handlePayment = () => {
    // Простая валидация для демо
    if (methodId === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
        alert('Заполните все поля карты!');
        return;
      }
    }

    setIsProcessing(true);

    // Симуляция обработки платежа
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  // Форматирование номера карты
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19); // 16 цифр + 3 пробела
  };

  // Форматирование срока
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-2 sm:p-3 md:p-4"
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
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-green-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Подтверждение оплаты</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="relative z-50 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            disabled={isProcessing}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.button>
        </div>

        {/* Content - Scrollable */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          {/* Order Summary */}
          <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 mb-6">
            <div className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">Детали заказа</div>
            
            <div className="space-y-3">
              {/* Coins */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  <span className="text-white text-sm sm:text-base">Коины</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg sm:text-xl">{coins.toLocaleString()}</div>
                  {bonusCoins > 0 && (
                    <div className="text-emerald-400 text-xs sm:text-sm">
                      {baseCoins.toLocaleString()} + {bonusCoins} бонус
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <MethodIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  <span className="text-white text-sm sm:text-base">Способ оплаты</span>
                </div>
                <div className="text-gray-400 text-sm sm:text-base">{methodLabel}</div>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-white font-semibold text-base sm:text-lg">К оплате</span>
                <span className="text-white font-bold text-xl sm:text-2xl">{amount}₽</span>
              </div>
            </div>
          </div>

          {/* Payment Form - Only for Card */}
          {methodId === 'card' && (
            <div className="space-y-4 mb-6">
              <div className="text-white font-semibold text-sm sm:text-base mb-3">Данные карты</div>

              {/* Card Number */}
              <div>
                <label className="block text-gray-400 text-xs sm:text-sm mb-2">Номер карты</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all disabled:opacity-50 text-sm sm:text-base"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-400 text-xs sm:text-sm mb-2">Срок действия</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all disabled:opacity-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs sm:text-sm mb-2">CVV</label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substr(0, 3))}
                    placeholder="123"
                    maxLength={3}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all disabled:opacity-50 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Card Holder */}
              <div>
                <label className="block text-gray-400 text-xs sm:text-sm mb-2">Имя владельца</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="IVAN IVANOV"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all disabled:opacity-50 text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          {/* For other methods */}
          {methodId !== 'card' && (
            <div className="p-4 sm:p-5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-cyan-400 font-semibold text-sm sm:text-base mb-1">
                    Вы будете перенаправлены
                  </div>
                  <div className="text-gray-300 text-xs sm:text-sm">
                    После нажатия кнопки вы будете перенаправлены на страницу оплаты {methodLabel}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0" />
            <div className="text-gray-300 text-xs sm:text-sm">
              Защищено SSL-шифрованием и PCI DSS сертификацией
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl p-4 sm:p-5 md:p-6">
          <motion.button
            whileHover={!isProcessing ? { scale: 1.02 } : {}}
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Обработка платежа...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Оплатить {amount}₽
              </>
            )}
          </motion.button>

          <div className="mt-3 text-center text-xs text-gray-400">
            Нажимая кнопку, вы соглашаетесь с условиями оплаты
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}