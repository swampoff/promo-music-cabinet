/**
 * WORKSPACE SWITCHER - Переключатель между кабинетами
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, Music2, Shield, Check, Building2, 
  Radio, Headphones, UserCheck, Users, BarChart3, 
  Store, Trophy, Newspaper, TrendingUp, Briefcase, Lock 
} from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  type: string;
  icon: typeof Music2;
  color: string;
  description: string;
  isLocked?: boolean;
}

const WORKSPACES: Workspace[] = [
  {
    id: 'artist',
    name: 'Кабинет артиста',
    type: 'Александр Иванов',
    icon: Music2,
    color: 'from-cyan-500 to-blue-500',
    description: 'Управление творчеством',
  },
  {
    id: 'admin',
    name: 'Администратор',
    type: 'PROMO.MUSIC',
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    description: 'CRM и модерация',
  },
  {
    id: 'label',
    name: 'Лейбл',
    type: 'Скоро',
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    description: 'Управление каталогом',
    isLocked: true,
  },
  {
    id: 'radio',
    name: 'Радиостанция',
    type: 'Скоро',
    icon: Radio,
    color: 'from-green-500 to-emerald-500',
    description: 'Трансляции и плейлисты',
    isLocked: true,
  },
  {
    id: 'dj',
    name: 'DJ / Плейлистер',
    type: 'Скоро',
    icon: Headphones,
    color: 'from-orange-500 to-yellow-500',
    description: 'Кураторство плейлистов',
    isLocked: true,
  },
  {
    id: 'blogger',
    name: 'Блогер / Медиа',
    type: 'Скоро',
    icon: Newspaper,
    color: 'from-pink-500 to-rose-500',
    description: 'Контент и обзоры',
    isLocked: true,
  },
  {
    id: 'manager',
    name: 'Менеджер артиста',
    type: 'Скоро',
    icon: UserCheck,
    color: 'from-indigo-500 to-blue-500',
    description: 'Управление карьерой',
    isLocked: true,
  },
  {
    id: 'promoter',
    name: 'Промоутер',
    type: 'Скоро',
    icon: TrendingUp,
    color: 'from-teal-500 to-cyan-500',
    description: 'Организация мероприятий',
    isLocked: true,
  },
  {
    id: 'venue',
    name: 'Площадка / Клуб',
    type: 'Скоро',
    icon: Store,
    color: 'from-violet-500 to-purple-500',
    description: 'Букинг и календарь',
    isLocked: true,
  },
  {
    id: 'agency',
    name: 'Агентство',
    type: 'Скоро',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-500',
    description: 'Управление портфолио',
    isLocked: true,
  },
  {
    id: 'analytics',
    name: 'Аналитика Pro',
    type: 'Скоро',
    icon: BarChart3,
    color: 'from-lime-500 to-green-500',
    description: 'Расширенная аналитика',
    isLocked: true,
  },
  {
    id: 'fan',
    name: 'Кабинет фаната',
    type: 'Скоро',
    icon: Trophy,
    color: 'from-rose-500 to-pink-500',
    description: 'Подписки и поддержка',
    isLocked: true,
  },
];

interface WorkspaceSwitcherProps {
  currentWorkspace: string;
  onSwitch: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({ currentWorkspace, onSwitch }: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const current = WORKSPACES.find(w => w.id === currentWorkspace) || WORKSPACES[0];

  const handleSwitch = (workspaceId: string) => {
    const workspace = WORKSPACES.find(w => w.id === workspaceId);
    if (!workspace || workspace.isLocked) {
      return;
    }

    // Сохраняем роль и перезагружаем приложение
    localStorage.setItem('userRole', workspaceId === 'admin' ? 'admin' : 'artist');
    setIsOpen(false);
    
    // Триггерим перезагрузку приложения
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Current Workspace Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${current.color} flex items-center justify-center flex-shrink-0`}>
            <current.icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-white font-semibold text-sm truncate">{current.name}</div>
            <div className="text-gray-400 text-xs truncate">{current.type}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl backdrop-blur-xl bg-gray-900/95 border border-white/20 shadow-2xl z-50 overflow-hidden max-h-[500px] overflow-y-auto"
            >
              <div className="space-y-1">
                {WORKSPACES.map((workspace) => {
                  const Icon = workspace.icon;
                  const isActive = workspace.id === currentWorkspace;
                  const isLocked = workspace.isLocked;
                  
                  return (
                    <motion.button
                      key={workspace.id}
                      whileHover={{ x: isLocked ? 0 : 4 }}
                      onClick={() => !isLocked && handleSwitch(workspace.id)}
                      disabled={isLocked}
                      className={`w-full p-3 rounded-lg transition-all group relative ${
                        isActive
                          ? 'bg-white/10 border border-white/20'
                          : isLocked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${workspace.color} flex items-center justify-center flex-shrink-0 relative`}>
                          <Icon className="w-5 h-5 text-white" />
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-white font-semibold text-sm truncate flex items-center gap-2">
                            {workspace.name}
                            {isActive && <Check className="w-4 h-4 text-green-400" />}
                            {isLocked && <span className="text-xs text-yellow-400">🔒</span>}
                          </div>
                          <div className="text-gray-400 text-xs truncate">{workspace.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 my-2" />

              {/* Info */}
              <div className="px-3 py-2">
                <p className="text-xs text-gray-400">
                  Переключайтесь между кабинетами для управления разными аспектами платформы
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}