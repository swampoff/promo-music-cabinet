import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;
const MOCK_USER_ID = 'user_12345'; // В реальном приложении брать из auth

export interface UserSettings {
  profile: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    genres: string[];
  };
  security: {
    twoFactorEnabled: boolean;
  };
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    soundEnabled: boolean;
    notifyNewDonations: boolean;
    notifyNewMessages: boolean;
    notifyNewComments: boolean;
    notifyNewFollowers: boolean;
    notifyAnalytics: boolean;
    notifyStreamMilestones: boolean;
    notifyMarketingCampaigns: boolean;
    notifySubscriptionExpiry: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'followers';
    allowMessages: 'everyone' | 'followers' | 'none';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowTagging: boolean;
  };
  analytics: {
    trackPageViews: boolean;
    trackClicks: boolean;
    trackListens: boolean;
    trackDonations: boolean;
    shareDataWithPartners: boolean;
  };
  appearance: {
    theme: 'dark' | 'light' | 'auto';
    accentColor: string;
    compactMode: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    highContrast: boolean;
  };
  advanced: {
    language: string;
  };
}

export const settingsAPI = {
  // Get user settings
  async getSettings(): Promise<UserSettings | null> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.settings;
      }
      return null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  // Save all settings
  async saveSettings(settings: UserSettings): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  // Update profile only
  async updateProfile(profile: Partial<UserSettings['profile']>): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  },

  // Get active sessions
  async getSessions(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}/sessions`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.sessions || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  },

  // Terminate session
  async terminateSession(sessionId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error terminating session:', error);
      return false;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  },

  // Get payment methods
  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.methods || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  // Add payment method
  async addPaymentMethod(method: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}/payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(method),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding payment method:', error);
      return false;
    }
  },

  // Delete payment method
  async deletePaymentMethod(methodId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/settings/user/${MOCK_USER_ID}/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }
  },

  // Get current subscription
  async getCurrentSubscription(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/subscriptions/${MOCK_USER_ID}/current`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.subscription;
      }
      return null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  // Get available plans
  async getAvailablePlans(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/subscriptions/plans`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.plans || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  },

  // Get payment history
  async getPaymentHistory(): Promise<any[]> {
    // No backend integration - payment history is managed client-side
    return [];
  },

  // Change subscription plan
  async changePlan(planId: string, interval: 'month' | 'year'): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/subscriptions/${MOCK_USER_ID}/change-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, interval }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error changing plan:', error);
      return false;
    }
  },

  // Cancel subscription
  async cancelSubscription(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/subscriptions/${MOCK_USER_ID}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  },
};
