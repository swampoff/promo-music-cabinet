/**
 * UNIFIED LOGIN - Единое окно входа с выбором роли
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Shield, Radio, ArrowLeft, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';

type Role = 'artist' | 'admin' | 'radio_station' | null;

interface UnifiedLoginProps {
  onLoginSuccess: (role: 'artist' | 'admin' | 'radio_station') => void;
}

export function UnifiedLogin({ onLoginSuccess }: UnifiedLoginProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'artist' | 'admin' | 'radio_station') => {
    setSelectedRole(role);
    // Предзаполнение для демо
    if (role === 'artist') {
      setEmail('artist@promo.fm');
      setPassword('artist123');
    } else if (role === 'admin') {
      setEmail('admin@promo.fm');
      setPassword('admin123');
    } else if (role === 'radio_station') {
      setEmail('radio@promo.fm');
      setPassword('radio123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Демо-проверка
    const validCredentials = 
      (selectedRole === 'artist' && email === 'artist@promo.fm' && password === 'artist123') ||
      (selectedRole === 'admin' && email === 'admin@promo.fm' && password === 'admin123') ||
      (selectedRole === 'radio_station' && email === 'radio@promo.fm' && password === 'radio123');

    setTimeout(() => {
      if (validCredentials) {
        // Генерируем userId и userName на основе роли
        const userId = selectedRole === 'artist' ? 'artist_001' : 
                      selectedRole === 'admin' ? 'admin_001' : 'radio_001';
        const userName = selectedRole === 'artist' ? 'Александр Иванов' : 
                        selectedRole === 'admin' ? 'Администратор' : 'PROMO.FM Radio';
        
        toast.success(`Вход выполнен как ${
          selectedRole === 'artist' ? 'артист' : 
          selectedRole === 'admin' ? 'администратор' : 
          'радиостанция'
        }!`);
        
        // Сохраняем данные пользователя
        localStorage.setItem('userRole', selectedRole!);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('isAuthenticated', 'true');
        
        onLoginSuccess(selectedRole!);
      } else {
        toast.error('Неверный email или пароль');
      }
      setLoading(false);
    }, 1000);
  };

  const roles = [
    {
      id: 'artist' as const,
      name: 'Кабинет артиста',
      description: 'Для музыкантов и творческих людей',
      icon: Music2,
      color: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/50',
      hoverBorder: 'hover:border-cyan-400',
      features: ['Управление треками', 'Аналитика стримов', 'Донаты и подписки', 'Продвижение'],
    },
    {
      id: 'radio_station' as const,
      name: 'Радиостанция',
      description: 'Для радиостанций и медиа',
      icon: Radio,
      color: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/20 to-purple-500/20',
      borderColor: 'border-indigo-500/50',
      hoverBorder: 'hover:border-indigo-400',
      features: ['Заявки артистов', 'Рекламные слоты', 'Ротация треков', 'Доход 15%'],
    },
    {
      id: 'admin' as const,
      name: 'Администратор',
      description: 'CRM и модерация платформы',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/50',
      hoverBorder: 'hover:border-purple-400',
      features: ['Управление пользователями', 'Модерация контента', 'Финансы', 'Аналитика'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {!selectedRole ? (
            // Role Selection Screen
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Music2 className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  PROMO.MUSIC
                </h1>
                <p className="text-gray-400 text-lg">
                  Выберите способ входа в систему
                </p>
              </div>

              {/* Role Cards */}
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  
                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`relative p-8 rounded-2xl backdrop-blur-xl bg-white/5 border-2 ${role.borderColor} ${role.hoverBorder} transition-all duration-300 group overflow-hidden`}
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-2 text-left">
                          {role.name}
                        </h2>
                        <p className="text-gray-400 text-sm mb-6 text-left">
                          {role.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-2">
                          {role.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-left">
                              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Arrow */}
                        <div className="mt-6 flex items-center justify-end text-white/60 group-hover:text-white transition-colors">
                          <span className="text-sm font-medium mr-2">Войти</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-gray-500 mt-8">
                © 2026 PROMO.MUSIC • Enterprise Marketing Ecosystem
              </p>
            </motion.div>
          ) : (
            // Login Form Screen
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className={`bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} p-8 text-center relative`}>
                  <button
                    onClick={() => {
                      setSelectedRole(null);
                      setEmail('');
                      setPassword('');
                    }}
                    className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>

                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {selectedRole === 'artist' ? (
                      <Music2 className="w-8 h-8 text-white" />
                    ) : (
                      <Shield className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedRole === 'artist' ? 'Вход для артиста' : 'Вход для администратора'}
                  </h2>
                  <p className="text-white/80 text-sm mt-2">
                    {selectedRole === 'artist' ? 'Управление творчеством' : 'Управление платформой'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={selectedRole === 'artist' ? 'artist@promo.fm' : 'admin@promo.fm'}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Пароль
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} hover:opacity-90 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Вход...
                      </div>
                    ) : (
                      'Войти'
                    )}
                  </button>

                  {/* Demo Info */}
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-400 text-center mb-2">Демо-доступ:</p>
                    <div className="bg-white/5 rounded-lg p-3 space-y-1">
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold">Email:</span> {selectedRole === 'artist' ? 'artist@promo.fm' : 'admin@promo.fm'}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold">Пароль:</span> {selectedRole === 'artist' ? 'artist123' : 'admin123'}
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}