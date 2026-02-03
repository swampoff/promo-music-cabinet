import { useState } from 'react';
import { Database, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestStorage } from '@/app/pages/TestStorage';

export function StorageTestButton() {
  const [showTest, setShowTest] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTest(true)}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-white z-50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all"
        title="Test Storage"
      >
        <Database className="w-6 h-6" />
      </motion.button>

      {/* Full Screen Test Modal */}
      <AnimatePresence>
        {showTest && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTest(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl z-[101] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowTest(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="h-full overflow-auto">
                <TestStorage />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
