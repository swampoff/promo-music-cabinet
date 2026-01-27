/**
 * APP WRAPPER
 * Обертка приложения с провайдерами для Figma Make
 */

import App from '@/app/App';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

// Demo Pro subscription для демонстрации возможностей
const demoSubscription = {
  tier: 'pro' as const,
  expires_at: '2026-12-31',
  features: ['priority_support', 'advanced_analytics', 'marketing_discount'],
  limits: {
    tracks: 100,
    videos: 50,
    storage_gb: 50,
    donation_fee: 0.05,
    marketing_discount: 0.15,
    coins_bonus: 0.15,
    pitching_discount: 0.15,
  },
  price: 1490,
  status: 'active' as const,
};

export default function AppWrapper() {
  console.log('[AppWrapper] Rendering with providers');
  
  return (
    <AuthProvider>
      <SubscriptionProvider userId="demo-user-123" initialSubscription={demoSubscription}>
        <App />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
