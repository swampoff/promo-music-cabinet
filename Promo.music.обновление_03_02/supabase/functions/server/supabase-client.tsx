/**
 * SUPABASE CLIENT SINGLETON
 * Единый экземпляр клиента для всех серверных роутов
 */

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Получить единственный экземпляр Supabase клиента
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    console.log('[Supabase Singleton] Creating single instance');
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  return supabaseInstance;
}

/**
 * Создать клиент с кастомным токеном доступа
 */
export function createUserClient(accessToken: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
