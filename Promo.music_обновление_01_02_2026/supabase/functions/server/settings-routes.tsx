import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Get user settings
app.get("/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Get settings from KV store
    const settingsKey = `settings:${userId}`;
    const settings = await kv.get(settingsKey);

    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        profile: {
          displayName: "DJ Артём",
          bio: "Музыкальный продюсер и диджей",
          location: "Москва, Россия",
          website: "https://example.com",
          genres: ["House", "Techno"],
        },
        security: {
          twoFactorEnabled: false,
        },
        notifications: {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          soundEnabled: true,
          notifyNewDonations: true,
          notifyNewMessages: true,
          notifyNewComments: true,
          notifyNewFollowers: true,
          notifyAnalytics: true,
          notifyStreamMilestones: true,
          notifyMarketingCampaigns: false,
          notifySubscriptionExpiry: true,
        },
        privacy: {
          profileVisibility: "public",
          allowMessages: "everyone",
          showOnlineStatus: true,
          showLastSeen: true,
          allowTagging: true,
        },
        analytics: {
          trackPageViews: true,
          trackClicks: true,
          trackListens: true,
          trackDonations: true,
          shareDataWithPartners: false,
        },
        appearance: {
          theme: "dark",
          accentColor: "cyan",
          compactMode: false,
          reducedMotion: false,
          largeText: false,
          highContrast: false,
        },
        advanced: {
          language: "ru",
        },
      };
      
      return c.json({ settings: defaultSettings });
    }

    return c.json({ settings });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

// Update user settings
app.put("/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    if (!body.settings) {
      return c.json({ error: "Settings data is required" }, 400);
    }

    // Save settings to KV store
    const settingsKey = `settings:${userId}`;
    await kv.set(settingsKey, body.settings);

    return c.json({ 
      success: true, 
      message: "Settings updated successfully",
      settings: body.settings 
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

// Update profile section
app.patch("/user/:userId/profile", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Get current settings
    const settingsKey = `settings:${userId}`;
    const currentSettings = await kv.get(settingsKey) || {};

    // Update profile section
    const updatedSettings = {
      ...currentSettings,
      profile: {
        ...(currentSettings.profile || {}),
        ...body,
      },
    };

    await kv.set(settingsKey, updatedSettings);

    return c.json({ 
      success: true, 
      message: "Profile updated successfully",
      profile: updatedSettings.profile 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Get active sessions
app.get("/user/:userId/sessions", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const sessionsKey = `sessions:${userId}`;
    const sessions = await kv.get(sessionsKey);

    // Return mock sessions if none exist
    if (!sessions) {
      const mockSessions = [
        {
          id: 1,
          device: "Chrome на Windows",
          location: "Москва, Россия",
          ip: "192.168.1.1",
          lastActive: "Сейчас",
          current: true,
        },
        {
          id: 2,
          device: "Safari на iPhone",
          location: "Москва, Россия",
          ip: "192.168.1.2",
          lastActive: "2 часа назад",
          current: false,
        },
      ];
      
      return c.json({ sessions: mockSessions });
    }

    return c.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return c.json({ error: "Failed to fetch sessions" }, 500);
  }
});

// Terminate session
app.delete("/user/:userId/sessions/:sessionId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const sessionId = parseInt(c.req.param("sessionId"));

    if (!userId || !sessionId) {
      return c.json({ error: "User ID and Session ID are required" }, 400);
    }

    const sessionsKey = `sessions:${userId}`;
    const sessions = await kv.get(sessionsKey) || [];

    // Filter out the session to terminate
    const updatedSessions = sessions.filter((s: any) => s.id !== sessionId);
    await kv.set(sessionsKey, updatedSessions);

    return c.json({ 
      success: true, 
      message: "Session terminated successfully" 
    });
  } catch (error) {
    console.error("Error terminating session:", error);
    return c.json({ error: "Failed to terminate session" }, 500);
  }
});

// Change password
app.post("/user/:userId/change-password", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return c.json({ error: "Current and new passwords are required" }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    // In a real app, you would verify the current password and hash the new one
    // For now, we'll just simulate success
    return c.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return c.json({ error: "Failed to change password" }, 500);
  }
});

// Get payment methods
app.get("/user/:userId/payment-methods", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const paymentKey = `payment_methods:${userId}`;
    const methods = await kv.get(paymentKey);

    // Return mock data if none exist
    if (!methods) {
      const mockMethods = [
        {
          id: 1,
          type: "visa",
          last4: "4242",
          expires: "12/25",
          isDefault: true,
        },
        {
          id: 2,
          type: "mastercard",
          last4: "8888",
          expires: "06/26",
          isDefault: false,
        },
      ];
      
      return c.json({ methods: mockMethods });
    }

    return c.json({ methods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return c.json({ error: "Failed to fetch payment methods" }, 500);
  }
});

// Add payment method
app.post("/user/:userId/payment-methods", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const paymentKey = `payment_methods:${userId}`;
    const methods = await kv.get(paymentKey) || [];

    const newMethod = {
      id: Date.now(),
      ...body,
      isDefault: methods.length === 0,
    };

    const updatedMethods = [...methods, newMethod];
    await kv.set(paymentKey, updatedMethods);

    return c.json({ 
      success: true, 
      message: "Payment method added successfully",
      method: newMethod 
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    return c.json({ error: "Failed to add payment method" }, 500);
  }
});

// Delete payment method
app.delete("/user/:userId/payment-methods/:methodId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const methodId = parseInt(c.req.param("methodId"));

    if (!userId || !methodId) {
      return c.json({ error: "User ID and Method ID are required" }, 400);
    }

    const paymentKey = `payment_methods:${userId}`;
    const methods = await kv.get(paymentKey) || [];

    const updatedMethods = methods.filter((m: any) => m.id !== methodId);
    await kv.set(paymentKey, updatedMethods);

    return c.json({ 
      success: true, 
      message: "Payment method deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return c.json({ error: "Failed to delete payment method" }, 500);
  }
});

export default app;
