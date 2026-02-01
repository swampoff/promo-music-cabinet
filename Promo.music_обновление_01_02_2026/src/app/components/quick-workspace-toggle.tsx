/**
 * QUICK WORKSPACE TOGGLE - Быстрое переключение кабинетов
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Shield, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface QuickWorkspaceToggleProps {
  currentRole: 'artist' | 'admin';
  onSwitch: () => void;
}

export function QuickWorkspaceToggle({ currentRole, onSwitch }: QuickWorkspaceToggleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onSwitch}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative px-4 py-2 rounded-lg font-semibold transition-all ${
        currentRole === 'artist'
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {currentRole === 'artist' ? (
          <>
            <Music2 className="w-4 h-4" />
            <span>Артист</span>
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            <span>Админ</span>
          </>
        )}
        <motion.div
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -5 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg whitespace-nowrap"
          >
            Переключить на {currentRole === 'artist' ? 'Админ' : 'Артист'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}