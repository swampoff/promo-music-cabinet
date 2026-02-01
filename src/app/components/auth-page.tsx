/**
 * AUTH PAGE
 * Страница авторизации и регистрации
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'forgot-password';

export function AuthPage() {
  const { signIn, signUp, signInWithOAuth, resetPassword, error, clearError, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError(null);
    clearError();
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setLocalError('Введите email');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Введите корректный email');
      return false;
    }

    if (mode !== 'forgot-password') {
      if (!formData.password) {
        setLocalError('Введите пароль');
        return false;
      }

      if (formData.password.length < 6) {
        setLocalError('Пароль должен быть минимум 6 символов');
        return false;
      }
    }

    if (mode === 'register') {
      if (!formData.name.trim()) {
        setLocalError('Введите имя');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setLocalError('Пароли не совпадают');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSuccessMessage(null);

    if (mode === 'login') {
      const result = await signIn(formData.email, formData.password);
      if (!result.error) {
        // Success - AuthContext will update the state
      }
    } else if (mode === 'register') {
      const result = await signUp(formData.email, formData.password, formData.name);
      if (!result.error) {
        setSuccessMessage('Регистрация успешна! Проверьте email для подтверждения.');
        setMode('login');
      }
    } else if (mode === 'forgot-password') {
      const result = await resetPassword(formData.email);
      if (!result.error) {
        setSuccessMessage('Инструкции по сбросу пароля отправлены на email');
        setMode('login');
      }
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'vk') => {
    await signInWithOAuth(provider);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setLocalError(null);
    setSuccessMessage(null);
    clearError();
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-12 h-12">
              <Music2 className="w-full h-full text-cyan-400" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg"></div>
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-2xl tracking-tight">PROMO.MUSIC</div>
              <div className="text-gray-400 text-sm">Кабинет артиста</div>
            </div>
          </div>
        </motion.div>

        {/* Auth Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Title */}
          <motion.h2
            key={mode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {mode === 'login' && 'Вход в кабинет'}
            {mode === 'register' && 'Регистрация'}
            {mode === 'forgot-password' && 'Восстановление пароля'}
          </motion.h2>

          <p className="text-gray-400 mb-4">
            {mode === 'login' && 'Введите данные для входа'}
            {mode === 'register' && 'Создайте аккаунт артиста'}
            {mode === 'forgot-password' && 'Введите email для сброса пароля'}
          </p>

          {/* Подсказка для мигрированных пользователей */}
          {mode === 'login' && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-cyan-400 text-sm">
                <strong>Пользователи promo.fm:</strong> Ваш аккаунт перенесён.
                Используйте <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="underline hover:text-cyan-300"
                >
                  восстановление пароля
                </button> для установки нового пароля.
              </p>
            </div>
          )}

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-sm">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{displayError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Имя артиста</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ваше имя или псевдоним"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <AnimatePresence>
              {mode !== 'forgot-password' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Минимум 6 символов"
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm Password Field (Register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Подтвердите пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Повторите пароль"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Забыли пароль?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Загрузка...</span>
                </>
              ) : (
                <span>
                  {mode === 'login' && 'Войти'}
                  {mode === 'register' && 'Создать аккаунт'}
                  {mode === 'forgot-password' && 'Отправить инструкции'}
                </span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          {mode !== 'forgot-password' && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-gray-400 bg-transparent">или</span>
              </div>
            </div>
          )}

          {/* OAuth Buttons */}
          {mode !== 'forgot-password' && (
            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Продолжить с Google</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
                </svg>
                <span>Продолжить с GitHub</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleOAuthLogin('vk')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-[#0077FF]/20 border border-[#0077FF]/30 text-white font-medium hover:bg-[#0077FF]/30 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.712-1.033-1.033-1.49-1.173-1.744-1.173-.356 0-.458.102-.458.593v1.562c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.684 4 8.282c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.716-.576.716z"/>
                </svg>
                <span>Продолжить с VK</span>
              </motion.button>
            </div>
          )}

          {/* Switch Mode Links */}
          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <p className="text-gray-400">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Зарегистрироваться
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-gray-400">
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Войти
                </button>
              </p>
            )}
            {mode === 'forgot-password' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Вернуться к входу
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          Продолжая, вы соглашаетесь с{' '}
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Условиями использования</a>
          {' '}и{' '}
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Политикой конфиденциальности</a>
        </p>
      </motion.div>
    </div>
  );
}
