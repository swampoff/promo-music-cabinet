/**
 * SUPABASE HEALTH CHECK
 * Компонент для проверки правильной работы singleton Supabase клиента
 * 
 * Использование:
 * <SupabaseHealthCheck />
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabase as supabaseFromClient } from '@/utils/supabase/client';

export function SupabaseHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const checks: string[] = [];
    
    try {
      // 1. Проверяем что оба импорта ссылаются на ОДИН объект
      const isSameInstance = supabase === supabaseFromClient;
      checks.push(`✅ Singleton check: ${isSameInstance ? 'PASS' : 'FAIL'}`);
      
      if (!isSameInstance) {
        throw new Error('Multiple Supabase client instances detected!');
      }

      // 2. Проверяем storage key
      const storageKeys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'));
      checks.push(`✅ Storage keys: ${storageKeys.length} found`);
      storageKeys.forEach(key => {
        checks.push(`  - ${key}`);
      });

      // 3. Проверяем подключение
      const { error } = await supabase.auth.getSession();
      checks.push(`✅ Connection: ${error ? 'ERROR' : 'OK'}`);
      
      if (error) {
        checks.push(`  Error: ${error.message}`);
      }

      // 4. Проверяем что в консоли нет warning'ов
      checks.push(`✅ Check browser console for "Multiple GoTrueClient" warning`);
      checks.push(`  Should NOT appear!`);

      setStatus('ok');
      setDetails(checks);
    } catch (error) {
      setStatus('error');
      checks.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      setDetails(checks);
    }
  };

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm">
        <p className="text-blue-400">🔍 Checking Supabase health...</p>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 border rounded-lg p-4 text-sm max-w-md ${
      status === 'ok' 
        ? 'bg-green-500/10 border-green-500/20' 
        : 'bg-red-500/10 border-red-500/20'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
          {status === 'ok' ? '✅ Supabase Health: OK' : '❌ Supabase Health: ERROR'}
        </h4>
        <button
          onClick={() => setStatus('checking')}
          className="text-white/60 hover:text-white text-xs"
        >
          Recheck
        </button>
      </div>
      
      <div className="space-y-1 font-mono text-xs text-white/70">
        {details.map((detail, idx) => (
          <div key={idx}>{detail}</div>
        ))}
      </div>

      <button
        onClick={() => {
          const el = document.querySelector('[data-supabase-health]');
          if (el) el.remove();
        }}
        className="mt-3 text-xs text-white/40 hover:text-white/60"
      >
        Dismiss
      </button>
    </div>
  );
}

// Export wrapper с data attribute для легкого удаления
export function SupabaseHealthCheckWrapper() {
  // Показываем только в development
  if (import.meta.env.MODE === 'production') {
    return null;
  }

  return (
    <div data-supabase-health>
      <SupabaseHealthCheck />
    </div>
  );
}
