import { X, CheckCircle, Coins, TrendingUp, Sparkles, Download, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PaymentSuccessModalProps {
  coins: number;
  baseCoins: number;
  bonusCoins: number;
  amount: number;
  newBalance: number;
  onClose: () => void;
  onStartCampaign?: () => void;
}

export function PaymentSuccessModal({ 
  coins, 
  baseCoins,
  bonusCoins,
  amount, 
  newBalance, 
  onClose,
  onStartCampaign,
}: PaymentSuccessModalProps) {
  
  const handleDownloadReceipt = () => {
    alert('Скачивание чека...');
    // В реальном приложении - генерация и скачивание PDF
  };

  const handleShare = () => {
    alert('Поделиться успехом...');
    // В реальном приложении - шаринг в соцсети
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-2 sm:p-3 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 border border-emerald-400/30 shadow-2xl overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-8 md:p-10">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
              </div>
              
              {/* Confetti particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 8) * 60,
                    y: Math.sin((i * Math.PI * 2) / 8) * 60,
                  }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-yellow-400"
                />
              ))}
            </motion.div>
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
              Оплата прошла успешно!
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Коины зачислены на ваш баланс
            </p>
          </motion.div>

          {/* Coins Received */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 mb-6"
          >
            <div className="text-center">
              <div className="text-gray-400 text-xs sm:text-sm mb-2">Вы получили</div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Coins className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-400" />
                </motion.div>
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                  {coins.toLocaleString()}
                </span>
              </div>
              {bonusCoins > 0 && (
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold">
                    {baseCoins.toLocaleString()} + {bonusCoins} бонусных коинов
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Transaction Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 mb-6"
          >
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-gray-400 text-sm sm:text-base">Оплачено</span>
              <span className="text-white font-semibold text-sm sm:text-base">{amount}₽</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-gray-400 text-sm sm:text-base">Новый баланс</span>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  {newBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-gray-400 text-sm sm:text-base">Дата и время</span>
              <span className="text-white font-semibold text-sm sm:text-base">
                {new Date().toLocaleString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            {/* Main Action */}
            {onStartCampaign && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onStartCampaign();
                }}
                className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                Запустить рекламную кампанию
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadReceipt}
                className="py-2.5 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Чек
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="py-2.5 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Поделиться
              </motion.button>
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs sm:text-sm transition-all"
            >
              Закрыть
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}