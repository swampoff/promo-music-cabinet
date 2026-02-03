/**
 * FINANCES PAGE - Страница финансов артиста
 * Интеграция с DataContext для отображения транзакций и баланса
 */

import { motion } from 'motion/react';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Coins } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function FinancesPage() {
  const { getTransactionsByUser, getUserBalance } = useData();
  const { userId, userName } = useCurrentUser();

  // Получаем транзакции и баланс пользователя
  const transactions = getTransactionsByUser(userId);
  const balance = getUserBalance(userId);

  // Статистика
  const stats = {
    totalIncome: transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpense: transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    pendingCount: transactions.filter(t => t.status === 'pending').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'pending':
        return 'В обработке';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Финансы</h1>
        <p className="text-gray-400">Управление балансом и транзакциями</p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Текущий баланс</p>
              <p className="text-4xl font-bold text-white">{balance} 🪙</p>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Доход</span>
          </div>
          <p className="text-2xl font-bold text-white">+{stats.totalIncome} 🪙</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Расход</span>
          </div>
          <p className="text-2xl font-bold text-white">-{stats.totalExpense} 🪙</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">В обработке</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pendingCount}</p>
        </motion.div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">История транзакций</h2>

        {transactions.length === 0 ? (
          <div className="p-12 text-center rounded-xl backdrop-blur-xl bg-white/5 border border-white/10">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Пока нет транзакций</p>
            <p className="text-sm text-gray-500 mt-2">
              Транзакции появятся после загрузки контента и модерации
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Type Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <p className="font-medium text-white">{transaction.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-400">{formatDate(transaction.date)}</p>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          <span className="text-sm text-gray-400">{getStatusText(transaction.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={`text-xl font-bold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}{transaction.amount} 🪙
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl backdrop-blur-xl bg-blue-500/10 border border-blue-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">О балансе коинов</h3>
            <p className="text-sm text-gray-300">
              Коины используются для оплаты модерации контента, продвижения треков и других услуг платформы.
              При загрузке контента на модерацию списывается 50 коинов после одобрения.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
