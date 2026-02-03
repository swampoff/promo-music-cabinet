import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { initDemoData } from '@/utils/initDemoData';

export function DemoDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await initDemoData();
      
      if (result) {
        setStatus('success');
        setMessage('Демо-данные успешно загружены! Обновите страницу.');
        
        // Автоматически обновляем страницу через 2 секунды
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Данные уже существуют или произошла ошибка.');
      }
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      setStatus('error');
      setMessage('Произошла ошибка при загрузке данных.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.button
            key="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInitialize}
            disabled={isLoading}
            className="group relative px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <div>
                    <div className="text-white font-semibold text-left">Загрузка...</div>
                    <div className="text-white/70 text-sm">Создаём демо-данные</div>
                  </div>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-white font-semibold text-left">Загрузить демо-данные</div>
                    <div className="text-white/70 text-sm">Треки, концерты, донаты</div>
                  </div>
                </>
              )}
            </div>

            {/* Animated glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          </motion.button>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-green-500/20"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <div>
                <div className="text-white font-semibold text-left">Успешно!</div>
                <div className="text-white/70 text-sm">{message}</div>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-red-500/20"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-white" />
              <div>
                <div className="text-white font-semibold text-left">Ошибка</div>
                <div className="text-white/70 text-sm">{message}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
