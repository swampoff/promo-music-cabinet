/**
 * TRANSACTION DETAIL CARD - Детализированная карточка транзакции
 * Максимальная адаптивность и полная детализация всех 18+ полей
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Copy,
  Download,
  Heart,
  MessageCircle,
  Ticket,
  Coffee,
  Store,
  Clock,
  Check,
  X,
  Music,
  Radio,
  Megaphone,
  Crown,
  TrendingUp,
  DollarSign,
  Coins as CoinsIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface TransactionDetailCardProps {
  transaction: any;
  getCategoryIcon: (category: string) => JSX.Element;
  getStatusBadge: (status: string) => JSX.Element | null;
  onReplyToDonator?: (userId: string, userName: string, userAvatar?: string) => void;
}

export function TransactionDetailCard({ 
  transaction, 
  getCategoryIcon, 
  getStatusBadge,
  onReplyToDonator 
}: TransactionDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors"
    >
      {/* Основная информация - всегда видна */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 md:p-4 cursor-pointer"
      >
        <div className="flex items-start gap-3 md:gap-4">
          {/* Иконка */}
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            transaction.type === 'income' ? 'bg-green-500/20' : 
            transaction.type === 'expense' ? 'bg-red-500/20' : 
            'bg-gray-500/20'
          }`}>
            {getCategoryIcon(transaction.category)}
          </div>

          {/* Информация */}
          <div className="flex-1 min-w-0">
            {/* Мобильная версия */}
            <div className="md:hidden">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-white font-medium text-sm leading-tight flex-1">{transaction.description}</p>
                <ChevronDown className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              <p className="text-white/60 text-xs mb-1.5 truncate">{transaction.from || transaction.to}</p>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-white/40 text-xs">{transaction.date} {transaction.time}</span>
                <p className={`font-bold text-base ${
                  transaction.type === 'income' ? 'text-green-400' : 
                  transaction.type === 'expense' ? 'text-red-400' : 
                  'text-gray-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                {getStatusBadge(transaction.status)}
                <span className="text-white/40 text-xs">Нажмите для деталей</span>
              </div>
            </div>

            {/* Десктопная версия */}
            <div className="hidden md:block">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium mb-1">{transaction.description}</p>
                  <p className="text-white/60 text-sm">
                    {transaction.from || transaction.to} • {transaction.date} {transaction.time}
                  </p>
                  {transaction.message && !isExpanded && (
                    <p className="text-green-400 text-xs mt-1 italic truncate">"{transaction.message}"</p>
                  )}
                </div>
                <div className="text-right flex items-center gap-4 flex-shrink-0">
                  <div>
                    <p className={`font-bold text-lg whitespace-nowrap ${
                      transaction.type === 'income' ? 'text-green-400' : 
                      transaction.type === 'expense' ? 'text-red-400' : 
                      'text-gray-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {transaction.amount.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  {getStatusBadge(transaction.status)}
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Детализация - раскрывается по клику */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-white/10"
          >
            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
              {/* Финансовые детали */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                <div className="bg-white/5 rounded-lg p-2.5 md:p-3">
                  <p className="text-white/40 text-xs mb-1">Валовая сумма</p>
                  <p className="text-white font-semibold text-sm md:text-base">{transaction.amount.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 md:p-3">
                  <p className="text-white/40 text-xs mb-1">Комиссия</p>
                  <p className="text-red-400 font-semibold text-sm md:text-base">{transaction.fee.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2.5 md:p-3 col-span-2 md:col-span-1">
                  <p className="text-green-400/70 text-xs mb-1">Чистыми</p>
                  <p className="text-green-400 font-bold text-sm md:text-base">{transaction.netAmount.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>

              {/* ПРОДАЖА БИЛЕТОВ */}
              {transaction.category === 'ticket_sales' && transaction.ticketsSold && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-5 h-5 text-blue-400" />
                    <h4 className="text-white font-semibold text-sm md:text-base">Детали продажи билетов</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 text-xs mb-1">Событие</p>
                        <p className="text-white font-medium">{transaction.eventName}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 text-xs mb-1">Дата концерта</p>
                        <p className="text-white font-medium">{transaction.eventDate}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5 sm:col-span-2">
                        <p className="text-white/40 text-xs mb-1">Площадка</p>
                        <p className="text-white font-medium">{transaction.venue}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <div className="bg-blue-500/20 rounded-lg p-2.5 text-center">
                        <p className="text-blue-400 font-bold text-lg md:text-xl">{transaction.ticketsSold}</p>
                        <p className="text-white/60 text-xs mt-1">билетов</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-2.5 text-center">
                        <p className="text-blue-400 font-bold text-lg md:text-xl">{transaction.ticketPrice} ₽</p>
                        <p className="text-white/60 text-xs mt-1">цена</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-2.5 text-center">
                        <p className="text-blue-400 font-bold text-lg md:text-xl">{(transaction.ticketsSold * transaction.ticketPrice).toLocaleString('ru-RU')}</p>
                        <p className="text-white/60 text-xs mt-1">выручка</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ОТЧИСЛЕНИЯ ОТ ЗАВЕДЕНИЙ */}
              {transaction.category === 'venue_royalties' && transaction.playsCount && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Coffee className="w-5 h-5 text-orange-400" />
                    <h4 className="text-white font-semibold text-sm md:text-base">Отчисления от заведений</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <div className="bg-orange-500/20 rounded-lg p-2.5 text-center">
                        <p className="text-orange-400 font-bold text-lg md:text-xl">{transaction.venuesCount}</p>
                        <p className="text-white/60 text-xs mt-1">заведений</p>
                      </div>
                      <div className="bg-orange-500/20 rounded-lg p-2.5 text-center">
                        <p className="text-orange-400 font-bold text-lg md:text-xl">{transaction.playsCount}</p>
                        <p className="text-white/60 text-xs mt-1">прослушиваний</p>
                      </div>
                      <div className="bg-orange-500/20 rounded-lg p-2.5 text-center col-span-1">
                        <p className="text-orange-400 font-bold text-base md:text-lg">{(transaction.amount / transaction.playsCount).toFixed(2)} ₽</p>
                        <p className="text-white/60 text-xs mt-1">за трек</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-2.5">
                      <p className="text-white/40 text-xs mb-1">Период</p>
                      <p className="text-white font-medium text-sm">{transaction.period}</p>
                    </div>
                    
                    {/* Список треков */}
                    {transaction.tracks && transaction.tracks.length > 0 && (
                      <div>
                        <p className="text-white/40 text-xs mb-2">Проигранные треки ({transaction.tracks.length})</p>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {transaction.tracks.map((track: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-white/10 rounded-lg text-white text-xs flex items-center gap-1">
                              <Music className="w-3 h-3 text-orange-400" />
                              {track}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Список заведений */}
                    {transaction.venues && transaction.venues.length > 0 && (
                      <div>
                        <p className="text-white/40 text-xs mb-2">Заведения ({transaction.venues.length})</p>
                        <div className="space-y-1.5">
                          {transaction.venues.map((venue: string, idx: number) => (
                            <div key={idx} className="px-3 py-2 bg-white/10 rounded-lg text-white text-xs flex items-center gap-2">
                              <Store className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                              <span className="flex-1">{venue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ДОНАТЫ */}
              {transaction.category === 'donate' && transaction.message && (
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <h4 className="text-white font-semibold text-sm">Сообщение от донатера</h4>
                  </div>
                  <p className="text-pink-400 text-sm italic mb-3 leading-relaxed">"{transaction.message}"</p>
                  {onReplyToDonator && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const userId = `user_${transaction.id}`;
                        const userName = transaction.from || 'Донатер';
                        onReplyToDonator(userId, userName, `${transaction.id}`);
                        toast.success(`Открываем чат с ${userName}...`);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Ответить донатеру
                    </motion.button>
                  )}
                </div>
              )}

              {/* КОИНЫ */}
              {transaction.coinsAmount && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CoinsIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-white/60 text-sm">Коинов {transaction.type === 'income' ? 'начислено' : 'потрачено'}</span>
                    </div>
                    <span className="text-yellow-400 font-bold text-lg">{transaction.coinsAmount || transaction.coinsSpent}</span>
                  </div>
                </div>
              )}

              {/* ПОДПИСКА */}
              {transaction.category === 'subscription' && transaction.subscriptionPeriod && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-semibold text-sm">Подписка</h4>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Период</span>
                    <span className="text-white">{transaction.subscriptionPeriod}</span>
                  </div>
                  {transaction.nextBilling && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Следующее списание</span>
                      <span className="text-white">{transaction.nextBilling}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Общая информация о платеже */}
              <div className="bg-white/5 rounded-lg p-3 md:p-4 space-y-2.5 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <span className="text-white/40 text-xs">ID транзакции</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-xs break-all flex-1 text-left sm:text-right">{transaction.transactionId}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(transaction.transactionId);
                        toast.success('ID скопирован');
                      }}
                      className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-white/60" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                  <span className="text-white/40 text-xs">Способ оплаты</span>
                  <span className="text-white text-xs">{transaction.paymentMethod}</span>
                </div>
                {transaction.fromEmail && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-white/40 text-xs">Email</span>
                    <span className="text-white text-xs break-all">{transaction.fromEmail}</span>
                  </div>
                )}
                {transaction.receipt && (
                  <div className="pt-2 border-t border-white/10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Скачивание чека...');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Скачать чек
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
