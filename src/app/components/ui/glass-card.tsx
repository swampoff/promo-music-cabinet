import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: 'none' | 'default' | 'accent';
  gradient?: boolean;
  animated?: boolean;
}

/**
 * GlassCard - Универсальный компонент с glassmorphism эффектом
 * 
 * @example
 * ```tsx
 * <GlassCard padding="lg" hover>
 *   <h2>Содержимое</h2>
 * </GlassCard>
 * ```
 */
export function GlassCard({
  children,
  className,
  hover = false,
  padding = 'md',
  border = 'default',
  gradient = false,
  animated = false,
}: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-5 sm:p-6 lg:p-8',
    xl: 'p-6 sm:p-8 lg:p-10',
  };

  const borderClasses = {
    none: '',
    default: 'border border-white/10',
    accent: 'border border-cyan-400/30',
  };

  const baseClasses = cn(
    'rounded-2xl backdrop-blur-xl',
    gradient ? 'bg-gradient-to-br from-white/5 to-white/10' : 'bg-white/5',
    paddingClasses[padding],
    borderClasses[border],
    hover && 'hover:bg-white/10 transition-all duration-300 cursor-pointer',
    className
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={hover ? { scale: 1.02 } : undefined}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}

interface GlassCardHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: ReactNode;
}

/**
 * GlassCardHeader - Заголовок для GlassCard
 */
export function GlassCardHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-cyan-400',
  action,
}: GlassCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4 sm:mb-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          {Icon && <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', iconColor)} />}
          <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-gray-300 text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

interface GlassStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'emerald' | 'cyan' | 'purple' | 'orange' | 'pink' | 'blue';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
}

/**
 * GlassStatCard - Карточка для отображения статистики
 * 
 * @example
 * ```tsx
 * <GlassStatCard
 *   label="Просмотры"
 *   value={12500}
 *   icon={Eye}
 *   color="cyan"
 *   trend={{ value: 24.5, isPositive: true }}
 * />
 * ```
 */
export function GlassStatCard({
  label,
  value,
  icon: Icon,
  color = 'cyan',
  trend,
  size = 'md',
}: GlassStatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400',
    cyan: 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400',
    purple: 'bg-purple-500/10 border-purple-400/30 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-400/30 text-orange-400',
    pink: 'bg-pink-500/10 border-pink-400/30 text-pink-400',
    blue: 'bg-blue-500/10 border-blue-400/30 text-blue-400',
  };

  const sizeClasses = {
    sm: {
      padding: 'p-3',
      label: 'text-xs',
      value: 'text-lg',
      icon: 'w-4 h-4',
    },
    md: {
      padding: 'p-4',
      label: 'text-xs sm:text-sm',
      value: 'text-xl sm:text-2xl',
      icon: 'w-4 h-4 sm:w-5 sm:h-5',
    },
    lg: {
      padding: 'p-5 sm:p-6',
      label: 'text-sm sm:text-base',
      value: 'text-2xl sm:text-3xl md:text-4xl',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('rounded-xl border', colorClasses[color], sizes.padding)}>
      <div className="flex items-center justify-between mb-1">
        <div className={cn('font-medium', sizes.label, colorClasses[color].split(' ')[2])}>
          {label}
        </div>
        {Icon && <Icon className={cn(sizes.icon, colorClasses[color].split(' ')[2])} />}
      </div>
      <div className={cn('text-white font-bold', sizes.value)}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 mt-1', sizes.label)}>
          <span className={trend.isPositive ? 'text-emerald-400' : 'text-red-400'}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * GlassButton - Кнопка в стиле glassmorphism
 */
export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  fullWidth = false,
  className,
}: GlassButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white',
    secondary: 'bg-white/10 border border-white/20 hover:bg-white/20 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
      {children}
    </button>
  );
}

export default GlassCard;
