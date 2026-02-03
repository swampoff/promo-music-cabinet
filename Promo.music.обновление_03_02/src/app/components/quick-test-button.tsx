import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestTube, CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { concertsApi } from '@/services/concerts-api';
import { getPerformanceHistory } from '@/services/performance-history-adapter';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

export function QuickTestButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    api: 'pending' | 'success' | 'error';
    concerts: 'pending' | 'success' | 'error';
    history: 'pending' | 'success' | 'error';
    message?: string;
  }>({
    api: 'pending',
    concerts: 'pending',
    history: 'pending',
  });

  const runQuickTest = async () => {
    setIsRunning(true);
    setResults({ api: 'pending', concerts: 'pending', history: 'pending' });

    // Test API Health
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
      setResults(prev => ({
        ...prev,
        api: data.status === 'ok' ? 'success' : 'error',
      }));
    } catch (error) {
      setResults(prev => ({ ...prev, api: 'error' }));
    }

    // Test Concerts API
    try {
      const result = await concertsApi.getAll();
      setResults(prev => ({
        ...prev,
        concerts: result.success ? 'success' : 'error',
        message: result.success ? `Загружено ${result.data?.length || 0} концертов` : result.error,
      }));
    } catch (error) {
      setResults(prev => ({ ...prev, concerts: 'error' }));
    }

    // Test Performance History
    try {
      const result = await getPerformanceHistory();
      setResults(prev => ({
        ...prev,
        history: result.success ? 'success' : 'error',
      }));
    } catch (error) {
      setResults(prev => ({ ...prev, history: 'error' }));
    }

    setIsRunning(false);
  };

  const getIcon = (status: 'pending' | 'success' | 'error') => {
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
  };

  return (
    <>
      {/* Test Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          if (!isRunning && results.api === 'pending') {
            runQuickTest();
          }
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full shadow-lg flex items-center justify-center group"
        title="Быстрый тест"
      >
        <TestTube className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
          !
        </div>
      </motion.button>

      {/* Test Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  <h3 className="font-bold text-white">Быстрый тест API</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* API Health */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">API Health</span>
                  {getIcon(results.api)}
                </div>

                {/* Concerts */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">Concerts API</span>
                  {getIcon(results.concerts)}
                </div>

                {/* Performance History */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">History API</span>
                  {getIcon(results.history)}
                </div>

                {/* Message */}
                {results.message && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-xs text-cyan-300">{results.message}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={runQuickTest}
                    disabled={isRunning}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Тестирую...
                      </>
                    ) : (
                      'Запустить тест'
                    )}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-sm"
                  >
                    Закрыть
                  </button>
                </div>

                {/* Status */}
                {!isRunning && results.api !== 'pending' && (
                  <div className="text-center pt-2">
                    {results.api === 'success' && results.concerts === 'success' && results.history === 'success' ? (
                      <p className="text-sm text-green-400">✅ Все тесты пройдены!</p>
                    ) : (
                      <p className="text-sm text-red-400">❌ Есть ошибки</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}