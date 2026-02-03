/**
 * SUPABASE CLIENT - SINGLETON EXPORT
 * 
 * ⚠️ ВАЖНО: Этот файл НЕ создает новый Supabase клиент!
 * Он реэкспортирует singleton из /src/utils/supabase/client.ts
 * 
 * Зачем это нужно:
 * - Предотвращает "Multiple GoTrueClient instances" warning
 * - Обеспечивает единый экземпляр клиента во всём приложении
 * - Использует один storage key для auth токенов
 * 
 * Правило: ВСЕГДА импортируйте из этого файла или из @/utils/supabase/client
 * Никогда не создавайте новый клиент через createClient!
 */

import { supabase as supabaseSingleton, getSupabaseClient } from '@/utils/supabase/client';

// Export singleton instance (тот же экземпляр что используется везде)
export const supabase = supabaseSingleton;

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper to get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Helper to get access token
export const getAccessToken = async () => {
  const session = await getCurrentSession();
  return session?.access_token || null;
};