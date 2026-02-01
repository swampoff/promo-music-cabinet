/**
 * EMAIL CAMPAIGNS MANAGER
 * Управление email-рассылками и анонсами
 */

import { Mail, Send, Plus, Trash2, Edit2, Eye, BarChart3, Calendar, Users, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface EmailCampaign {
  id: string;
  artistId: string;
  concertId?: string;
  subject: string;
  content: string;
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
}

interface EmailCampaignsProps {
  artistId: string;
  concerts?: any[];
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

export function EmailCampaigns({ artistId, concerts = [] }: EmailCampaignsProps) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    concertId: '',
    recipientCount: 0,
    scheduledFor: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, [artistId]);

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/campaigns/${artistId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Не удалось загрузить кампании');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!formData.subject || !formData.content) {
      toast.error('Заполните тему и содержание');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notifications/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ...formData,
          artistId,
          recipientCount: formData.recipientCount || Math.floor(Math.random() * 5000) + 1000,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setCampaigns([data.data, ...campaigns]);
        setShowCreateModal(false);
        setFormData({ subject: '', content: '', concertId: '', recipientCount: 0, scheduledFor: '' });
        toast.success('✅ Кампания создана!');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Не удалось создать кампанию');
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ artistId }),
      });
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(campaigns.map(c => c.id === campaignId ? data.data : c));
        toast.success('🎉 Кампания отправлена!', {
          description: data.message,
        });
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Не удалось отправить кампанию');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-300 text-xs">Черновик</span>;
      case 'scheduled':
        return <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">Запланирована</span>;
      case 'sending':
        return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">Отправляется</span>;
      case 'sent':
        return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">Отправлена</span>;
      case 'failed':
        return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">Ошибка</span>;
    }
  };

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalRecipients: campaigns.reduce((sum, c) => sum + c.recipientCount, 0),
    avgOpenRate: campaigns.filter(c => c.openRate).length > 0
      ? campaigns.filter(c => c.openRate).reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.filter(c => c.openRate).length
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-cyan-400" />
            Email-рассылки
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {stats.sent} отправлено • {stats.draft} черновиков • {stats.totalRecipients.toLocaleString()} получателей
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/20 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Создать кампанию</span>
          <span className="sm:hidden">Создать</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-xs sm:text-sm text-cyan-300">Всего кампаний</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">{stats.sent}</span>
          </div>
          <p className="text-xs sm:text-sm text-green-300">Отправлено</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">{(stats.totalRecipients / 1000).toFixed(0)}K</span>
          </div>
          <p className="text-xs sm:text-sm text-purple-300">Получателей</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">{(stats.avgOpenRate * 100).toFixed(1)}%</span>
          </div>
          <p className="text-xs sm:text-sm text-yellow-300">Средний Open Rate</p>
        </motion.div>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
          <Mail className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Нет кампаний</h3>
          <p className="text-sm text-gray-500">Создайте первую email-рассылку</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{campaign.subject}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{campaign.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.recipientCount.toLocaleString()} получателей
                      </span>
                      {campaign.sentAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(campaign.sentAt).toLocaleDateString('ru-RU')}
                          </span>
                        </>
                      )}
                      {campaign.openRate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Open: {(campaign.openRate * 100).toFixed(1)}%
                          </span>
                        </>
                      )}
                      {campaign.clickRate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            Click: {(campaign.clickRate * 100).toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendCampaign(campaign.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Отправить
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Campaign Stats */}
                {campaign.status === 'sent' && campaign.openRate && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-cyan-400">{(campaign.openRate * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Open Rate</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-purple-400">{(campaign.clickRate! * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Click Rate</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Создать email-кампанию</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Тема письма</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Новый концерт в Москве!"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                {concerts.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Связать с концертом (опционально)</label>
                    <select
                      value={formData.concertId}
                      onChange={(e) => setFormData({ ...formData, concertId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50"
                    >
                      <option value="">Без привязки</option>
                      {concerts.map(concert => (
                        <option key={concert.id} value={concert.id}>
                          {concert.title} - {concert.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Содержание</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Приглашаем на концерт..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Запланировать отправку (опционально)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createCampaign}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition-all"
                  >
                    Создать
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
                  >
                    Отмена
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}