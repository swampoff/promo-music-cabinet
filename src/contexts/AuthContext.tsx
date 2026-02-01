/**
 * AUTH CONTEXT
 * Полная авторизация через Supabase Auth
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userAvatar: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github' | 'vk') => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<{ error?: string }>;
  clearError: () => void;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Демо режим для разработки без авторизации
const DEMO_MODE = false; // Установить true для локальной разработки

const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@promo.music',
  user_metadata: { name: 'Demo Artist', avatar_url: null }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация и подписка на изменения auth состояния
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Получить текущую сессию
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        if (mounted) {
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
          } else if (DEMO_MODE) {
            // Demo mode fallback
            setUser(DEMO_USER as any);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          if (DEMO_MODE) {
            setUser(DEMO_USER as any);
          }
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Подписка на изменения auth состояния (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] State changed:', event);

        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? (DEMO_MODE ? DEMO_USER as any : null));

          if (event === 'SIGNED_OUT') {
            setError(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (error: AuthError | Error): string => {
    const message = error.message || 'Произошла ошибка';

    // Переводим типичные ошибки
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Неверный email или пароль',
      'Email not confirmed': 'Email не подтверждён. Проверьте почту',
      'User already registered': 'Пользователь уже зарегистрирован',
      'Password should be at least 6 characters': 'Пароль должен быть минимум 6 символов',
      'Unable to validate email address: invalid format': 'Неверный формат email',
    };

    return translations[message] || message;
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        const errorMsg = handleAuthError(authError);
        setError(errorMsg);
        return { error: errorMsg };
      }

      return {};
    } catch (err: any) {
      const errorMsg = handleAuthError(err);
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
        },
      });

      if (authError) {
        const errorMsg = handleAuthError(authError);
        setError(errorMsg);
        return { error: errorMsg };
      }

      // Создать профиль артиста в БД
      if (data.user) {
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/profile`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session?.access_token || publicAnonKey}`,
                'X-User-Id': data.user.id,
              },
              body: JSON.stringify({
                email: email.trim(),
                username: email.split('@')[0],
                full_name: name,
              }),
            }
          );
        } catch (profileErr) {
          console.error('Profile creation error:', profileErr);
        }
      }

      return {};
    } catch (err: any) {
      const errorMsg = handleAuthError(err);
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github' | 'vk') => {
    try {
      setError(null);

      // VK использует кастомный OIDC провайдер в Supabase
      // Настраивается в Dashboard -> Authentication -> Providers -> Add provider -> OIDC
      const providerConfig = provider === 'vk'
        ? {
            provider: 'vk' as const,
            options: {
              redirectTo: window.location.origin,
              scopes: 'email',
            },
          }
        : {
            provider,
            options: {
              redirectTo: window.location.origin,
            },
          };

      const { error: authError } = await supabase.auth.signInWithOAuth(providerConfig);

      if (authError) {
        setError(handleAuthError(authError));
      }
    } catch (err: any) {
      setError(handleAuthError(err));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (authError) {
        const errorMsg = handleAuthError(authError);
        setError(errorMsg);
        return { error: errorMsg };
      }

      return {};
    } catch (err: any) {
      const errorMsg = handleAuthError(err);
      setError(errorMsg);
      return { error: errorMsg };
    }
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; avatar_url?: string }) => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          avatar_url: data.avatar_url,
        },
      });

      if (authError) {
        const errorMsg = handleAuthError(authError);
        setError(errorMsg);
        return { error: errorMsg };
      }

      return {};
    } catch (err: any) {
      const errorMsg = handleAuthError(err);
      setError(errorMsg);
      return { error: errorMsg };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAccessToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  const value: AuthContextType = {
    user,
    session,
    userId: user?.id || null,
    userEmail: user?.email || null,
    userName: user?.user_metadata?.name || user?.user_metadata?.full_name || null,
    userAvatar: user?.user_metadata?.avatar_url || null,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updateProfile,
    clearError,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}