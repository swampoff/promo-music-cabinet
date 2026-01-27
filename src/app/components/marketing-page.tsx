/**
 * MARKETING & SALES PAGE
 * Страница маркетинга: уведомления, рассылки, билеты, аналитика
 */

import { Bell, Mail, Ticket, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { NotificationsManager } from '@/app/components/notifications-manager';
import { EmailCampaigns } from '@/app/components/email-campaigns';
import { TicketingIntegration } from '@/app/components/ticketing-integration';
import { MarketingAnalytics } from '@/app/components/marketing-analytics';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface MarketingPageProps {
  userId: string;
}

export function MarketingPage({ userId }: MarketingPageProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'campaigns' | 'ticketing' | 'analytics'>('notifications');
  const [concerts, setConcerts] = useState<any[]>([]);

  useEffect(() => {
    loadConcerts();
  }, []);

  const loadConcerts = async () => {
    try {
      const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;
      const response = await fetch(`${API_URL}/concerts`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setConcerts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading concerts:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Маркетинг и продажи
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-400 mt-2">Уведомления, рассылки и билетные системы</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-white/10 overflow-x-auto pb-px scrollbar-hide">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-semibold transition-all relative whitespace-nowrap text-xs sm:text-sm lg:text-base ${
            activeTab === 'notifications'
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bell className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 inline-block mr-1 sm:mr-2" />
          <span className="hidden xs:inline sm:hidden lg:inline">Уведомления</span>
          <span className="xs:hidden sm:inline lg:hidden">Уведом.</span>
          <span className="sm:hidden">🔔</span>
          {activeTab === 'notifications' && (
            <motion.div
              layoutId="marketingTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-semibold transition-all relative whitespace-nowrap text-xs sm:text-sm lg:text-base ${
            activeTab === 'campaigns'
              ? 'text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Mail className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 inline-block mr-1 sm:mr-2" />
          <span className="hidden xs:inline sm:hidden lg:inline">Email-рассылки</span>
          <span className="xs:hidden sm:inline lg:hidden">Email</span>
          <span className="sm:hidden">✉️</span>
          {activeTab === 'campaigns' && (
            <motion.div
              layoutId="marketingTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ticketing')}
          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-semibold transition-all relative whitespace-nowrap text-xs sm:text-sm lg:text-base ${
            activeTab === 'ticketing'
              ? 'text-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Ticket className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 inline-block mr-1 sm:mr-2" />
          <span className="hidden xs:inline sm:hidden lg:inline">Билетные системы</span>
          <span className="xs:hidden sm:inline lg:hidden">Билеты</span>
          <span className="sm:hidden">🎫</span>
          {activeTab === 'ticketing' && (
            <motion.div
              layoutId="marketingTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-semibold transition-all relative whitespace-nowrap text-xs sm:text-sm lg:text-base ${
            activeTab === 'analytics'
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 inline-block mr-1 sm:mr-2" />
          <span className="hidden xs:inline sm:hidden lg:inline">Аналитика</span>
          <span className="xs:hidden sm:inline lg:hidden">Отчёты</span>
          <span className="sm:hidden">📊</span>
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="marketingTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400"
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'notifications' && <NotificationsManager userId={userId} />}
        {activeTab === 'campaigns' && <EmailCampaigns artistId={userId} concerts={concerts} />}
        {activeTab === 'ticketing' && <TicketingIntegration artistId={userId} concerts={concerts} />}
        {activeTab === 'analytics' && <MarketingAnalytics artistId={userId} concerts={concerts} />}
      </motion.div>
    </div>
  );
}