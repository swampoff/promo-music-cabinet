/**
 * EMAIL CENTER COMPONENT
 * Полноценный центр управления email-уведомлениями
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Settings,
  History,
  BarChart3,
  Bell,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MousePointerClick,
  Filter,
  Search,
  Download,
  RefreshCw,
  Loader2,
  Info,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { toast } from 'sonner';

type EmailSubTab = 'settings' | 'history' | 'stats';

interface EmailSubscription {
  user_id: string;
  notifications: Record<string, boolean>;
  newsletter: Record<string, boolean>;
  frequency: 'realtime' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

interface EmailHistory {
  id: string;
  user_id: string;
  to_email: string;
  subject: string;
  template: string | null;
  content: string;
  type: 'notification' | 'newsletter' | 'transactional';
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  opened: boolean;
  clicked: boolean;
  metadata: any;
}

interface EmailStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: string;
  click_rate: string;
  by_type: {
    notification: number;
    newsletter: number;
    transactional: number;
  };
  last_30_days: number;
}

export function EmailCenter() {
  const { userId, isAuthenticated } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<EmailSubTab>('settings');
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<EmailSubscription | null>(null);
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [userId, isAuthenticated, activeSubTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'settings') {
        await loadSubscriptions();
      } else if (activeSubTab === 'history') {
        await loadHistory();
      } else if (activeSubTab === 'stats') {
        await loadStats();
      }
    } catch (error) {
      console.error('Error loading email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/email/subscriptions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Ошибка загрузки настроек');
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/email/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/email/stats/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Ошибка загрузки статистики');
    }
  };

  const updateSubscriptions = async (updates: Partial<EmailSubscription>) => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/email/subscriptions/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data);
        toast.success('Настройки сохранены');
      }
    } catch (error) {
      console.error('Error updating subscriptions:', error);
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: string) => {
    if (!subscriptions) return;
    
    const updatedNotifications = {
      ...subscriptions.notifications,
      [key]: !subscriptions.notifications[key],
    };
    
    updateSubscriptions({ notifications: updatedNotifications });
  };

  const toggleNewsletter = (key: string) => {
    if (!subscriptions) return;
    
    const updatedNewsletter = {
      ...subscriptions.newsletter,
      [key]: !subscriptions.newsletter[key],
    };
    
    updateSubscriptions({ newsletter: updatedNewsletter });
  };

  const setFrequency = (frequency: 'realtime' | 'daily' | 'weekly') => {
    updateSubscriptions({ frequency });
  };

  const filteredHistory = history.filter((email) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(query) ||
      email.to_email.toLowerCase().includes(query) ||
      email.type.toLowerCase().includes(query)
    );
  });

  const subTabs = [
    { id: 'settings' as EmailSubTab, label: 'Настройки', icon: Settings },
    { id: 'history' as EmailSubTab, label: 'История', icon: History },
    { id: 'stats' as EmailSubTab, label: 'Статистика', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Prototype Warning */}
      <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">Это прототип</h3>
            <p className="text-blue-200/80 text-sm leading-relaxed">
              Email-центр показывает <strong>настройки подписок</strong> и <strong>историю</strong>, но физически email <strong>не отправляются</strong>. 
              Для production нужно настроить SMTP-сервер (Sendgrid, Mailgun, AWS SES).
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tabs - Mobile Responsive */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2">
        {/* Desktop View */}
        <div className="hidden md:flex gap-2">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all flex-1 ${
                  activeSubTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile View - Scrollable */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Settings Tab */}
        {activeSubTab === 'settings' && subscriptions && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Frequency Settings */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Частота отправки</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'realtime', label: 'Мгновенно', desc: 'Получать каждое уведомление сразу' },
                  { value: 'daily', label: 'Раз в день', desc: 'Ежедневный дайджест' },
                  { value: 'weekly', label: 'Раз в неделю', desc: 'Еженедельный отчёт' },
                ].map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => setFrequency(freq.value as any)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      subscriptions.frequency === freq.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium text-white mb-1">{freq.label}</div>
                    <div className="text-sm text-white/60">{freq.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Types */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Типы уведомлений</h3>
              </div>

              <div className="space-y-3">
                {Object.entries(subscriptions.notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-white">{formatNotificationName(key)}</div>
                      <div className="text-sm text-white/60">{getNotificationDescription(key)}</div>
                    </div>
                    <button
                      onClick={() => toggleNotification(key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-green-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Settings */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-white">Рассылки</h3>
              </div>

              <div className="space-y-3">
                {Object.entries(subscriptions.newsletter).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-white">{formatNewsletterName(key)}</div>
                      <div className="text-sm text-white/60">{getNewsletterDescription(key)}</div>
                    </div>
                    <button
                      onClick={() => toggleNewsletter(key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-green-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-blue-400">
                <Info className="w-5 h-5" />
                <p className="text-sm">Настройки сохраняются автоматически</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeSubTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Search and Refresh */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по теме или email..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <button
                  onClick={loadHistory}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Обновить
                </button>
              </div>
            </div>

            {/* Email List */}
            {filteredHistory.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Нет истории</h3>
                <p className="text-white/60">Email-уведомления появятся здесь</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        email.status === 'sent' ? 'bg-green-500/20' :
                        email.status === 'failed' ? 'bg-red-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        {email.status === 'sent' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {email.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                        {email.status === 'pending' && <Clock className="w-5 h-5 text-yellow-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold">{email.subject}</h4>
                            <p className="text-white/60 text-sm">{email.to_email}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            email.type === 'notification' ? 'bg-blue-500/20 text-blue-400' :
                            email.type === 'newsletter' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {email.type === 'notification' ? 'Уведомление' :
                             email.type === 'newsletter' ? 'Рассылка' :
                             'Транзакция'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(email.sent_at).toLocaleString('ru-RU')}
                          </span>
                          {email.opened && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Eye className="w-4 h-4" />
                              Открыто
                            </span>
                          )}
                          {email.clicked && (
                            <span className="flex items-center gap-1 text-blue-400">
                              <MousePointerClick className="w-4 h-4" />
                              Переход
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeSubTab === 'stats' && stats && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-5 h-5 text-blue-400" />
                  <p className="text-white/60 text-sm">Отправлено</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats.total_sent}</p>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-green-400" />
                  <p className="text-white/60 text-sm">Открыто</p>
                </div>
                <p className="text-3xl font-bold text-green-400">{stats.total_opened}</p>
                <p className="text-white/40 text-xs mt-1">{stats.open_rate}%</p>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="w-5 h-5 text-purple-400" />
                  <p className="text-white/60 text-sm">Клики</p>
                </div>
                <p className="text-3xl font-bold text-purple-400">{stats.total_clicked}</p>
                <p className="text-white/40 text-xs mt-1">{stats.click_rate}%</p>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <p className="text-white/60 text-sm">За 30 дней</p>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{stats.last_30_days}</p>
              </div>
            </div>

            {/* By Type */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">По типам</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-blue-400 text-sm mb-1">Уведомления</div>
                  <div className="text-2xl font-bold text-white">{stats.by_type.notification}</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-purple-400 text-sm mb-1">Рассылки</div>
                  <div className="text-2xl font-bold text-white">{stats.by_type.newsletter}</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="text-green-400 text-sm mb-1">Транзакции</div>
                  <div className="text-2xl font-bold text-white">{stats.by_type.transactional}</div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Эффективность</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Open Rate</span>
                    <span className="text-green-400 font-bold">{stats.open_rate}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${stats.open_rate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Click Rate</span>
                    <span className="text-purple-400 font-bold">{stats.click_rate}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${stats.click_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions
function formatNotificationName(key: string): string {
  const names: Record<string, string> = {
    new_message: 'Новое сообщение',
    new_follower: 'Новый подписчик',
    new_donation: 'Новый донат',
    track_approved: 'Трек одобрен',
    track_rejected: 'Трек отклонён',
    concert_approved: 'Концерт одобрен',
    payment_success: 'Успешный платёж',
    payment_failed: 'Ошибка платежа',
    pitching_response: 'Ответ на питчинг',
    marketing_started: 'Кампания запущена',
    marketing_completed: 'Кампания завершена',
  };
  return names[key] || key;
}

function getNotificationDescription(key: string): string {
  const descriptions: Record<string, string> = {
    new_message: 'При получении нового сообщения',
    new_follower: 'Когда кто-то подписывается',
    new_donation: 'При получении доната',
    track_approved: 'Когда трек проходит модерацию',
    track_rejected: 'Когда трек отклоняют',
    concert_approved: 'Когда концерт одобрен',
    payment_success: 'При успешной оплате',
    payment_failed: 'При ошибке оплаты',
    pitching_response: 'Ответы на заявки питчинга',
    marketing_started: 'Запуск маркетинговой кампании',
    marketing_completed: 'Завершение кампании',
  };
  return descriptions[key] || '';
}

function formatNewsletterName(key: string): string {
  const names: Record<string, string> = {
    weekly_digest: 'Еженедельный дайджест',
    monthly_report: 'Ежемесячный отчёт',
    product_updates: 'Обновления платформы',
    promotional: 'Промо-рассылки',
  };
  return names[key] || key;
}

function getNewsletterDescription(key: string): string {
  const descriptions: Record<string, string> = {
    weekly_digest: 'Сводка активности за неделю',
    monthly_report: 'Подробная статистика за месяц',
    product_updates: 'Новые функции и улучшения',
    promotional: 'Специальные предложения',
  };
  return descriptions[key] || '';
}