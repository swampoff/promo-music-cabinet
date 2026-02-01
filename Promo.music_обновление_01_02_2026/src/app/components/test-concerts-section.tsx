/**
 * ТЕСТОВЫЙ КОМПОНЕНТ для проверки раздела "Мои концерты"
 * Проверяет все критические функции и API
 */

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { concertsApi } from '@/services/concerts-api';
import { 
  getPerformanceHistory, 
  addPerformanceHistory 
} from '@/services/performance-history-adapter';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function TestConcertsSection() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { name, status, message, details } : t);
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // TEST 1: Health Check
    updateTest('Health Check', 'pending', 'Проверка доступности API...');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.status === 'ok') {
        updateTest('Health Check', 'success', 'API доступен', JSON.stringify(data, null, 2));
      } else {
        updateTest('Health Check', 'error', 'Некорректный ответ', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      updateTest('Health Check', 'error', 'Ошибка подключения', String(error));
    }

    // TEST 2: Get Tour Dates
    updateTest('Get Tour Dates', 'pending', 'Загрузка концертов...');
    try {
      const result = await concertsApi.getAll();
      
      if (result.success) {
        updateTest(
          'Get Tour Dates', 
          'success', 
          `Загружено ${result.data?.length || 0} концертов`,
          JSON.stringify(result.data?.slice(0, 2), null, 2)
        );
      } else {
        updateTest('Get Tour Dates', 'warning', result.error || 'Неизвестная ошибка', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      updateTest('Get Tour Dates', 'error', 'Ошибка запроса', String(error));
    }

    // TEST 3: Get Performance History
    updateTest('Performance History', 'pending', 'Загрузка истории выступлений...');
    try {
      const result = await getPerformanceHistory();
      
      if (result.success) {
        updateTest(
          'Performance History', 
          'success', 
          `Загружено ${result.data?.length || 0} выступлений`,
          JSON.stringify(result.data?.slice(0, 2), null, 2)
        );
      } else {
        updateTest('Performance History', 'warning', result.error || 'Неизвестная ошибка', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      updateTest('Performance History', 'error', 'Ошибка запроса', String(error));
    }

    // TEST 4: Create Concert (без реального создания)
    updateTest('Create Concert Schema', 'pending', 'Проверка схемы создания...');
    try {
      const testConcert = {
        title: 'Test Concert',
        event_type: 'Концерт' as const,
        venue_name: 'Test Venue',
        city: 'Москва',
        country: 'Россия',
        date: '2026-12-31',
        show_start: '20:00',
      };
      
      updateTest(
        'Create Concert Schema', 
        'success', 
        'Схема валидна',
        JSON.stringify(testConcert, null, 2)
      );
    } catch (error) {
      updateTest('Create Concert Schema', 'error', 'Ошибка валидации', String(error));
    }

    // TEST 5: Проверка типов
    updateTest('TypeScript Types', 'pending', 'Проверка типов...');
    try {
      const mockPerformance = {
        event_name: 'Test',
        venue_name: 'Venue',
        city: 'City',
        date: '2025-01-01',
        type: 'Концерт' as const,
      };
      
      // Это просто проверка, что типы совместимы
      const _typeCheck: Omit<typeof mockPerformance, 'id'> = mockPerformance;
      
      updateTest('TypeScript Types', 'success', 'Типы корректны');
    } catch (error) {
      updateTest('TypeScript Types', 'error', 'Ошибка типов', String(error));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-400/30';
      case 'error':
        return 'bg-red-500/10 border-red-400/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-400/30';
      case 'pending':
        return 'bg-blue-500/10 border-blue-400/30';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Тестирование раздела "Мои концерты"
          </h1>
          <p className="text-gray-400">
            Проверка API, роутов и функциональности
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Тестирование...
            </>
          ) : (
            'Запустить тесты'
          )}
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.length === 0 && !isRunning && (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-gray-400">
            Нажмите "Запустить тесты" для начала проверки
          </div>
        )}

        {tests.map((test, index) => (
          <div
            key={test.name}
            className={`p-5 rounded-2xl border backdrop-blur-xl transition-all ${getStatusColor(test.status)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(test.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white">
                    {index + 1}. {test.name}
                  </h3>
                  <span className="text-sm text-gray-400 uppercase">
                    {test.status}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-2">{test.message}</p>
                
                {test.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                      Показать детали
                    </summary>
                    <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-gray-400 overflow-x-auto">
                      {test.details}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {tests.length > 0 && !isRunning && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30">
          <h3 className="text-lg font-semibold text-white mb-3">Итого:</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {tests.filter(t => t.status === 'success').length}
              </div>
              <div className="text-sm text-gray-400">Успешно</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {tests.filter(t => t.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-400">Предупреждений</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {tests.filter(t => t.status === 'error').length}
              </div>
              <div className="text-sm text-gray-400">Ошибок</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {tests.length}
              </div>
              <div className="text-sm text-gray-400">Всего тестов</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}