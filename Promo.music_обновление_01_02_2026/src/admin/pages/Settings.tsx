import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, Bell, Shield, Palette, Database, 
  Mail, Globe, Users, Zap, Save, Check, AlertTriangle, DollarSign,
  CreditCard, Percent, Tag, Share2, Key, Lock, Eye, EyeOff,
  RefreshCw, Download, Upload, Trash2, Server, Activity,
  MessageSquare, FileText, BarChart3, TrendingUp, Search,
  Filter, Calendar, Clock, CheckCircle, XCircle, Info,
  Copy, ExternalLink, PlayCircle, PauseCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Setting {
  label: string;
  type: 'text' | 'textarea' | 'number' | 'toggle' | 'select' | 'email' | 'password' | 'slider' | 'color';
  value: any;
  onChange: (value: any) => void;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  unit?: string;
  warning?: string;
  disabled?: boolean;
}

interface SettingsSection {
  title: string;
  icon: any;
  color: string;
  fields: Setting[];
  badge?: string;
  description?: string;
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [settings, setSettings] = useState({
    // ===== GENERAL SETTINGS =====
    siteName: 'PROMO.MUSIC',
    siteTagline: 'Маркетинговая экосистема для музыкантов',
    siteDescription: 'Enterprise-решение для продвижения музыки',
    siteLogo: '/logo.png',
    siteFavicon: '/favicon.ico',
    contactEmail: 'support@promo.music',
    supportEmail: 'help@promo.music',
    maintenanceMode: false,
    maintenanceMessage: 'Проводим технические работы. Скоро вернемся!',
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'artist',
    defaultLanguage: 'ru',
    timezone: 'Europe/Moscow',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    
    // ===== NOTIFICATIONS =====
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    moderationAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    realtimeAlerts: true,
    slackWebhook: '',
    discordWebhook: '',
    telegramBotToken: '',
    telegramChatId: '',
    notificationSound: true,
    desktopNotifications: true,
    emailDigestFrequency: 'daily',
    alertThreshold: 10,
    
    // ===== MODERATION =====
    autoModeration: true,
    aiModerationEnabled: true,
    moderationThreshold: 3,
    requireApproval: true,
    autoApproveVerified: true,
    moderationQueueLimit: 100,
    flaggedContentReview: true,
    contentScanningEnabled: true,
    spamDetection: true,
    profanityFilter: true,
    imageModeration: true,
    audioModeration: false,
    moderationTimeout: 48,
    escalationThreshold: 5,
    
    // ===== SECURITY =====
    twoFactorAuth: true,
    twoFactorRequired: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelisting: false,
    ipWhitelistAddresses: [],
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    passwordExpiryDays: 90,
    securityHeaders: true,
    csrfProtection: true,
    xssProtection: true,
    rateLimitEnabled: true,
    bruteForceProtection: true,
    
    // ===== API & PERFORMANCE =====
    apiEnabled: true,
    apiRateLimit: 1000,
    apiRateLimitWindow: 'hour',
    apiCaching: true,
    apiCacheDuration: 300,
    apiVersion: 'v1',
    apiKey: 'pm_live_xxxxxxxxxxxxxxxxxxxx',
    webhooksEnabled: true,
    maxWebhookRetries: 3,
    webhookTimeout: 30,
    enableCors: true,
    corsOrigins: '*',
    compressionEnabled: true,
    cdnEnabled: true,
    cdnUrl: 'https://cdn.promo.music',
    imageCdn: true,
    videoCdn: true,
    audioCdn: true,
    
    // ===== PAYMENTS =====
    paymentsEnabled: true,
    currency: 'USD',
    taxRate: 0,
    platformFee: 10,
    stripeEnabled: true,
    stripePublicKey: 'pk_live_xxxxx',
    stripeSecretKey: 'sk_live_xxxxx',
    stripeWebhookSecret: 'whsec_xxxxx',
    paypalEnabled: true,
    paypalClientId: '',
    paypalSecretKey: '',
    cryptoEnabled: false,
    minDepositAmount: 10,
    maxDepositAmount: 10000,
    minPayoutAmount: 50,
    maxPayoutAmount: 50000,
    autoPayoutEnabled: false,
    payoutSchedule: 'monthly',
    paymentRetryAttempts: 3,
    refundWindow: 14,
    
    // ===== SUBSCRIPTIONS =====
    subscriptionsEnabled: true,
    trialEnabled: true,
    trialDuration: 14,
    gracePeriod: 3,
    autoRenew: true,
    prorationEnabled: true,
    cancelAtPeriodEnd: false,
    downgradePolicy: 'immediate',
    upgradePolicy: 'immediate',
    
    // ===== DISCOUNTS & PROMOS =====
    discountsEnabled: true,
    firstTimeDiscount: 20,
    referralBonus: 10,
    seasonalPromosEnabled: true,
    bulkDiscountEnabled: true,
    loyaltyProgramEnabled: true,
    maxDiscountPercent: 50,
    promoCodePrefix: 'PROMO',
    
    // ===== PARTNERS PROGRAM =====
    partnersEnabled: true,
    autoApprovePartners: false,
    minPayoutPartner: 100,
    partnerCommissionBronze: 3,
    partnerCommissionSilver: 5,
    partnerCommissionGold: 7,
    partnerCommissionPlatinum: 10,
    partnerCommissionDiamond: 15,
    lifetimeCommission: true,
    cookieDuration: 30,
    partnerDashboardEnabled: true,
    partnerApiAccess: true,
    
    // ===== EMAIL SETTINGS =====
    emailProvider: 'sendgrid',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: 'noreply@promo.music',
    fromName: 'PROMO.MUSIC',
    replyToEmail: 'support@promo.music',
    emailTemplatesEnabled: true,
    emailFooter: '© 2024 PROMO.MUSIC. All rights reserved.',
    unsubscribeEnabled: true,
    trackEmailOpens: true,
    trackEmailClicks: true,
    emailBounceHandling: true,
    emailRetryAttempts: 3,
    
    // ===== PITCHING SETTINGS =====
    pitchingEnabled: true,
    minPitchPrice: 5,
    maxPitchPrice: 500,
    defaultPitchPrice: 29,
    expressEnabled: true,
    expressPriceMultiplier: 2,
    guaranteedEnabled: true,
    guaranteedPriceMultiplier: 3,
    pitchReviewTime: 72,
    autoCancelExpiredPitches: true,
    pitchExpiryDays: 30,
    allowMultiplePitches: true,
    maxSimultaneousPitches: 10,
    
    // ===== ANALYTICS =====
    analyticsEnabled: true,
    googleAnalyticsId: '',
    facebookPixelId: '',
    mixpanelToken: '',
    amplitudeKey: '',
    trackPageViews: true,
    trackEvents: true,
    trackConversions: true,
    heatmapsEnabled: false,
    sessionRecordingEnabled: false,
    
    // ===== BACKUP & MAINTENANCE =====
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: 's3',
    backupEncryption: true,
    databaseBackup: true,
    filesBackup: true,
    lastBackupDate: '2024-01-30',
    autoUpdateEnabled: false,
    maintenanceWindow: 'Sunday 02:00-04:00',
    
    // ===== GDPR & PRIVACY =====
    gdprCompliance: true,
    cookieConsent: true,
    dataRetentionDays: 365,
    anonymizeData: true,
    rightToBeForgotten: true,
    dataExportEnabled: true,
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms',
    
    // ===== FEATURE FLAGS =====
    betaFeaturesEnabled: false,
    experimentalFeaturesEnabled: false,
    darkModeForced: false,
    maintenanceBanner: false,
    announcementBar: false,
    announcementText: '',
  });

  // Отслеживание изменений
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Здесь будет API запрос для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Настройки сохранены', {
        description: 'Все изменения успешно применены',
        icon: <CheckCircle className="w-5 h-5" />,
      });
      setHasChanges(false);
    } catch (error) {
      toast.error('Ошибка сохранения', {
        description: 'Не удалось сохранить настройки',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Вы уверены? Все изменения будут сброшены.')) {
      window.location.reload();
      toast.info('Настройки сброшены');
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `settings_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Настройки экспортированы');
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const imported = JSON.parse(event.target.result);
          setSettings(imported);
          toast.success('Настройки импортированы');
        } catch (error) {
          toast.error('Ошибка импорта файла');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const tabs = [
    { id: 'general', label: 'Основные', icon: Globe, count: 15 },
    { id: 'notifications', label: 'Уведомления', icon: Bell, count: 14 },
    { id: 'security', label: 'Безопасность', icon: Shield, count: 16 },
    { id: 'payments', label: 'Платежи', icon: DollarSign, count: 18 },
    { id: 'partners', label: 'Партнеры', icon: Share2, count: 11 },
    { id: 'moderation', label: 'Модерация', icon: Eye, count: 14 },
    { id: 'api', label: 'API', icon: Zap, count: 12 },
    { id: 'email', label: 'Email', icon: Mail, count: 15 },
    { id: 'pitching', label: 'Питчинг', icon: TrendingUp, count: 13 },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, count: 8 },
    { id: 'backup', label: 'Backup', icon: Database, count: 10 },
    { id: 'features', label: 'Функции', icon: Zap, count: 6 },
  ];

  const settingsSections: Record<string, SettingsSection[]> = {
    general: [
      {
        title: 'Информация о сайте',
        icon: Globe,
        color: 'from-blue-500 to-cyan-500',
        description: 'Основные данные вашей платформы',
        fields: [
          {
            label: 'Название сайта',
            type: 'text',
            value: settings.siteName,
            onChange: (v) => updateSetting('siteName', v),
            placeholder: 'PROMO.MUSIC',
          },
          {
            label: 'Слоган',
            type: 'text',
            value: settings.siteTagline,
            onChange: (v) => updateSetting('siteTagline', v),
            placeholder: 'Маркетинговая экосистема',
          },
          {
            label: 'Описание',
            type: 'textarea',
            value: settings.siteDescription,
            onChange: (v) => updateSetting('siteDescription', v),
            placeholder: 'Краткое описание платформы',
          },
          {
            label: 'Email для контактов',
            type: 'email',
            value: settings.contactEmail,
            onChange: (v) => updateSetting('contactEmail', v),
            placeholder: 'contact@promo.music',
          },
          {
            label: 'Email поддержки',
            type: 'email',
            value: settings.supportEmail,
            onChange: (v) => updateSetting('supportEmail', v),
            placeholder: 'support@promo.music',
          },
        ],
      },
      {
        title: 'Региональные настройки',
        icon: Globe,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'Язык по умолчанию',
            type: 'select',
            value: settings.defaultLanguage,
            onChange: (v) => updateSetting('defaultLanguage', v),
            options: [
              { value: 'ru', label: 'Русский' },
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'de', label: 'Deutsch' },
            ],
          },
          {
            label: 'Часовой пояс',
            type: 'select',
            value: settings.timezone,
            onChange: (v) => updateSetting('timezone', v),
            options: [
              { value: 'Europe/Moscow', label: 'Москва (GMT+3)' },
              { value: 'America/New_York', label: 'Нью-Йорк (GMT-5)' },
              { value: 'Europe/London', label: 'Лондон (GMT+0)' },
              { value: 'Asia/Tokyo', label: 'Токио (GMT+9)' },
            ],
          },
          {
            label: 'Формат даты',
            type: 'select',
            value: settings.dateFormat,
            onChange: (v) => updateSetting('dateFormat', v),
            options: [
              { value: 'DD.MM.YYYY', label: 'ДД.ММ.ГГГГ' },
              { value: 'MM/DD/YYYY', label: 'ММ/ДД/ГГГГ' },
              { value: 'YYYY-MM-DD', label: 'ГГГГ-ММ-ДД' },
            ],
          },
        ],
      },
      {
        title: 'Режим обслуживания',
        icon: AlertTriangle,
        color: 'from-orange-500 to-red-500',
        badge: 'Важно',
        fields: [
          {
            label: 'Включить режим обслуживания',
            type: 'toggle',
            value: settings.maintenanceMode,
            onChange: (v) => updateSetting('maintenanceMode', v),
            description: 'Закрыть доступ к сайту для всех пользователей кроме админов',
            warning: settings.maintenanceMode ? 'Сайт находится в режиме обслуживания!' : undefined,
          },
          {
            label: 'Сообщение для пользователей',
            type: 'textarea',
            value: settings.maintenanceMessage,
            onChange: (v) => updateSetting('maintenanceMessage', v),
            placeholder: 'Проводим технические работы...',
            disabled: !settings.maintenanceMode,
          },
        ],
      },
      {
        title: 'Регистрация пользователей',
        icon: Users,
        color: 'from-green-500 to-emerald-500',
        fields: [
          {
            label: 'Разрешить регистрацию',
            type: 'toggle',
            value: settings.allowRegistration,
            onChange: (v) => updateSetting('allowRegistration', v),
          },
          {
            label: 'Требовать подтверждение email',
            type: 'toggle',
            value: settings.requireEmailVerification,
            onChange: (v) => updateSetting('requireEmailVerification', v),
          },
          {
            label: 'Роль по умолчанию',
            type: 'select',
            value: settings.defaultUserRole,
            onChange: (v) => updateSetting('defaultUserRole', v),
            options: [
              { value: 'artist', label: 'Артист' },
              { value: 'curator', label: 'Куратор' },
              { value: 'label', label: 'Лейбл' },
              { value: 'manager', label: 'Менеджер' },
            ],
          },
        ],
      },
    ],
    
    notifications: [
      {
        title: 'Email уведомления',
        icon: Mail,
        color: 'from-blue-500 to-indigo-500',
        fields: [
          {
            label: 'Email уведомления',
            type: 'toggle',
            value: settings.emailNotifications,
            onChange: (v) => updateSetting('emailNotifications', v),
          },
          {
            label: 'Частота дайджеста',
            type: 'select',
            value: settings.emailDigestFrequency,
            onChange: (v) => updateSetting('emailDigestFrequency', v),
            options: [
              { value: 'realtime', label: 'В реальном времени' },
              { value: 'hourly', label: 'Ежечасно' },
              { value: 'daily', label: 'Ежедневно' },
              { value: 'weekly', label: 'Еженедельно' },
            ],
          },
        ],
      },
      {
        title: 'Push-уведомления',
        icon: Bell,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'Push-уведомления',
            type: 'toggle',
            value: settings.pushNotifications,
            onChange: (v) => updateSetting('pushNotifications', v),
          },
          {
            label: 'Desktop уведомления',
            type: 'toggle',
            value: settings.desktopNotifications,
            onChange: (v) => updateSetting('desktopNotifications', v),
          },
          {
            label: 'Звуковые уведомления',
            type: 'toggle',
            value: settings.notificationSound,
            onChange: (v) => updateSetting('notificationSound', v),
          },
        ],
      },
      {
        title: 'Админ уведомления',
        icon: Shield,
        color: 'from-red-500 to-orange-500',
        fields: [
          {
            label: 'Оповещения о модерации',
            type: 'toggle',
            value: settings.moderationAlerts,
            onChange: (v) => updateSetting('moderationAlerts', v),
          },
          {
            label: 'Реалтайм алерты',
            type: 'toggle',
            value: settings.realtimeAlerts,
            onChange: (v) => updateSetting('realtimeAlerts', v),
          },
          {
            label: 'Порог алертов',
            type: 'slider',
            value: settings.alertThreshold,
            onChange: (v) => updateSetting('alertThreshold', v),
            min: 1,
            max: 50,
            unit: 'событий',
          },
        ],
      },
      {
        title: 'Отчеты',
        icon: FileText,
        color: 'from-green-500 to-teal-500',
        fields: [
          {
            label: 'Еженедельные отчеты',
            type: 'toggle',
            value: settings.weeklyReports,
            onChange: (v) => updateSetting('weeklyReports', v),
          },
          {
            label: 'Ежемесячные отчеты',
            type: 'toggle',
            value: settings.monthlyReports,
            onChange: (v) => updateSetting('monthlyReports', v),
          },
        ],
      },
      {
        title: 'Интеграции',
        icon: MessageSquare,
        color: 'from-yellow-500 to-orange-500',
        description: 'Webhook URLs для внешних сервисов',
        fields: [
          {
            label: 'Slack Webhook URL',
            type: 'text',
            value: settings.slackWebhook,
            onChange: (v) => updateSetting('slackWebhook', v),
            placeholder: 'https://hooks.slack.com/services/...',
          },
          {
            label: 'Discord Webhook URL',
            type: 'text',
            value: settings.discordWebhook,
            onChange: (v) => updateSetting('discordWebhook', v),
            placeholder: 'https://discord.com/api/webhooks/...',
          },
          {
            label: 'Telegram Bot Token',
            type: 'text',
            value: settings.telegramBotToken,
            onChange: (v) => updateSetting('telegramBotToken', v),
            placeholder: '123456:ABC-DEF...',
          },
          {
            label: 'Telegram Chat ID',
            type: 'text',
            value: settings.telegramChatId,
            onChange: (v) => updateSetting('telegramChatId', v),
            placeholder: '-1001234567890',
          },
        ],
      },
    ],

    security: [
      {
        title: 'Аутентификация',
        icon: Lock,
        color: 'from-red-500 to-pink-500',
        fields: [
          {
            label: '2FA (Двухфакторная аутентификация)',
            type: 'toggle',
            value: settings.twoFactorAuth,
            onChange: (v) => updateSetting('twoFactorAuth', v),
          },
          {
            label: 'Требовать 2FA для всех',
            type: 'toggle',
            value: settings.twoFactorRequired,
            onChange: (v) => updateSetting('twoFactorRequired', v),
            disabled: !settings.twoFactorAuth,
          },
          {
            label: 'Тайм-аут сессии (минуты)',
            type: 'slider',
            value: settings.sessionTimeout,
            onChange: (v) => updateSetting('sessionTimeout', v),
            min: 5,
            max: 120,
            unit: 'мин',
          },
          {
            label: 'Макс. попыток входа',
            type: 'slider',
            value: settings.maxLoginAttempts,
            onChange: (v) => updateSetting('maxLoginAttempts', v),
            min: 3,
            max: 10,
            unit: 'попыток',
          },
          {
            label: 'Длительность блокировки (минуты)',
            type: 'slider',
            value: settings.lockoutDuration,
            onChange: (v) => updateSetting('lockoutDuration', v),
            min: 5,
            max: 60,
            unit: 'мин',
          },
        ],
      },
      {
        title: 'Требования к паролям',
        icon: Key,
        color: 'from-orange-500 to-red-500',
        fields: [
          {
            label: 'Минимальная длина пароля',
            type: 'slider',
            value: settings.passwordMinLength,
            onChange: (v) => updateSetting('passwordMinLength', v),
            min: 6,
            max: 20,
            unit: 'символов',
          },
          {
            label: 'Требовать заглавные буквы',
            type: 'toggle',
            value: settings.passwordRequireUppercase,
            onChange: (v) => updateSetting('passwordRequireUppercase', v),
          },
          {
            label: 'Требовать строчные буквы',
            type: 'toggle',
            value: settings.passwordRequireLowercase,
            onChange: (v) => updateSetting('passwordRequireLowercase', v),
          },
          {
            label: 'Требовать цифры',
            type: 'toggle',
            value: settings.passwordRequireNumbers,
            onChange: (v) => updateSetting('passwordRequireNumbers', v),
          },
          {
            label: 'Требовать спецсимволы',
            type: 'toggle',
            value: settings.passwordRequireSpecial,
            onChange: (v) => updateSetting('passwordRequireSpecial', v),
          },
          {
            label: 'Срок действия пароля (дни)',
            type: 'slider',
            value: settings.passwordExpiryDays,
            onChange: (v) => updateSetting('passwordExpiryDays', v),
            min: 0,
            max: 365,
            unit: 'дней',
            description: '0 = пароль не истекает',
          },
        ],
      },
      {
        title: 'Защита от атак',
        icon: Shield,
        color: 'from-purple-500 to-indigo-500',
        fields: [
          {
            label: 'Rate Limiting',
            type: 'toggle',
            value: settings.rateLimitEnabled,
            onChange: (v) => updateSetting('rateLimitEnabled', v),
            description: 'Ограничение частоты запросов',
          },
          {
            label: 'Защита от брутфорса',
            type: 'toggle',
            value: settings.bruteForceProtection,
            onChange: (v) => updateSetting('bruteForceProtection', v),
          },
          {
            label: 'CSRF защита',
            type: 'toggle',
            value: settings.csrfProtection,
            onChange: (v) => updateSetting('csrfProtection', v),
          },
          {
            label: 'XSS защита',
            type: 'toggle',
            value: settings.xssProtection,
            onChange: (v) => updateSetting('xssProtection', v),
          },
          {
            label: 'Security Headers',
            type: 'toggle',
            value: settings.securityHeaders,
            onChange: (v) => updateSetting('securityHeaders', v),
          },
        ],
      },
      {
        title: 'IP Whitelisting',
        icon: Server,
        color: 'from-blue-500 to-cyan-500',
        fields: [
          {
            label: 'Включить IP whitelist',
            type: 'toggle',
            value: settings.ipWhitelisting,
            onChange: (v) => updateSetting('ipWhitelisting', v),
            warning: settings.ipWhitelisting ? 'Только разрешенные IP смогут войти' : undefined,
          },
        ],
      },
    ],

    payments: [
      {
        title: 'Основные настройки',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500',
        fields: [
          {
            label: 'Включить платежи',
            type: 'toggle',
            value: settings.paymentsEnabled,
            onChange: (v) => updateSetting('paymentsEnabled', v),
          },
          {
            label: 'Валюта',
            type: 'select',
            value: settings.currency,
            onChange: (v) => updateSetting('currency', v),
            options: [
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'RUB', label: 'RUB (₽)' },
            ],
          },
          {
            label: 'Налог (%)',
            type: 'slider',
            value: settings.taxRate,
            onChange: (v) => updateSetting('taxRate', v),
            min: 0,
            max: 30,
            step: 0.5,
            unit: '%',
          },
          {
            label: 'Комиссия платформы (%)',
            type: 'slider',
            value: settings.platformFee,
            onChange: (v) => updateSetting('platformFee', v),
            min: 0,
            max: 30,
            step: 0.5,
            unit: '%',
          },
        ],
      },
      {
        title: 'Stripe',
        icon: CreditCard,
        color: 'from-purple-500 to-indigo-500',
        fields: [
          {
            label: 'Включить Stripe',
            type: 'toggle',
            value: settings.stripeEnabled,
            onChange: (v) => updateSetting('stripeEnabled', v),
          },
          {
            label: 'Public Key',
            type: 'text',
            value: settings.stripePublicKey,
            onChange: (v) => updateSetting('stripePublicKey', v),
            placeholder: 'pk_live_xxxxx',
            disabled: !settings.stripeEnabled,
          },
          {
            label: 'Secret Key',
            type: 'password',
            value: settings.stripeSecretKey,
            onChange: (v) => updateSetting('stripeSecretKey', v),
            placeholder: 'sk_live_xxxxx',
            disabled: !settings.stripeEnabled,
          },
          {
            label: 'Webhook Secret',
            type: 'password',
            value: settings.stripeWebhookSecret,
            onChange: (v) => updateSetting('stripeWebhookSecret', v),
            placeholder: 'whsec_xxxxx',
            disabled: !settings.stripeEnabled,
          },
        ],
      },
      {
        title: 'PayPal',
        icon: DollarSign,
        color: 'from-blue-500 to-cyan-500',
        fields: [
          {
            label: 'Включить PayPal',
            type: 'toggle',
            value: settings.paypalEnabled,
            onChange: (v) => updateSetting('paypalEnabled', v),
          },
          {
            label: 'Client ID',
            type: 'text',
            value: settings.paypalClientId,
            onChange: (v) => updateSetting('paypalClientId', v),
            disabled: !settings.paypalEnabled,
          },
          {
            label: 'Secret Key',
            type: 'password',
            value: settings.paypalSecretKey,
            onChange: (v) => updateSetting('paypalSecretKey', v),
            disabled: !settings.paypalEnabled,
          },
        ],
      },
      {
        title: 'Лимиты транзакций',
        icon: TrendingUp,
        color: 'from-orange-500 to-red-500',
        fields: [
          {
            label: 'Мин. сумма депозита',
            type: 'number',
            value: settings.minDepositAmount,
            onChange: (v) => updateSetting('minDepositAmount', v),
            min: 1,
            unit: settings.currency,
          },
          {
            label: 'Макс. сумма депозита',
            type: 'number',
            value: settings.maxDepositAmount,
            onChange: (v) => updateSetting('maxDepositAmount', v),
            min: 100,
            unit: settings.currency,
          },
          {
            label: 'Мин. сумма вывода',
            type: 'number',
            value: settings.minPayoutAmount,
            onChange: (v) => updateSetting('minPayoutAmount', v),
            min: 10,
            unit: settings.currency,
          },
          {
            label: 'Макс. сумма вывода',
            type: 'number',
            value: settings.maxPayoutAmount,
            onChange: (v) => updateSetting('maxPayoutAmount', v),
            min: 1000,
            unit: settings.currency,
          },
        ],
      },
      {
        title: 'Подписки',
        icon: RefreshCw,
        color: 'from-pink-500 to-purple-500',
        fields: [
          {
            label: 'Включить подписки',
            type: 'toggle',
            value: settings.subscriptionsEnabled,
            onChange: (v) => updateSetting('subscriptionsEnabled', v),
          },
          {
            label: 'Пробный период',
            type: 'toggle',
            value: settings.trialEnabled,
            onChange: (v) => updateSetting('trialEnabled', v),
          },
          {
            label: 'Длительность триала (дни)',
            type: 'slider',
            value: settings.trialDuration,
            onChange: (v) => updateSetting('trialDuration', v),
            min: 3,
            max: 30,
            unit: 'дней',
            disabled: !settings.trialEnabled,
          },
          {
            label: 'Автопродление',
            type: 'toggle',
            value: settings.autoRenew,
            onChange: (v) => updateSetting('autoRenew', v),
          },
          {
            label: 'Пропорциональный перерасчет',
            type: 'toggle',
            value: settings.prorationEnabled,
            onChange: (v) => updateSetting('prorationEnabled', v),
            description: 'При изменении тарифа',
          },
        ],
      },
      {
        title: 'Возвраты',
        icon: RefreshCw,
        color: 'from-yellow-500 to-orange-500',
        fields: [
          {
            label: 'Период возврата (дни)',
            type: 'slider',
            value: settings.refundWindow,
            onChange: (v) => updateSetting('refundWindow', v),
            min: 0,
            max: 30,
            unit: 'дней',
            description: '0 = возвраты отключены',
          },
          {
            label: 'Попыток повтора платежа',
            type: 'slider',
            value: settings.paymentRetryAttempts,
            onChange: (v) => updateSetting('paymentRetryAttempts', v),
            min: 0,
            max: 5,
            unit: 'попыток',
          },
        ],
      },
    ],

    partners: [
      {
        title: 'Партнерская программа',
        icon: Share2,
        color: 'from-blue-500 to-purple-500',
        fields: [
          {
            label: 'Включить партнерскую программу',
            type: 'toggle',
            value: settings.partnersEnabled,
            onChange: (v) => updateSetting('partnersEnabled', v),
          },
          {
            label: 'Автоодобрение партнеров',
            type: 'toggle',
            value: settings.autoApprovePartners,
            onChange: (v) => updateSetting('autoApprovePartners', v),
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'Пожизненная комиссия',
            type: 'toggle',
            value: settings.lifetimeCommission,
            onChange: (v) => updateSetting('lifetimeCommission', v),
            description: 'Партнер получает комиссию пожизненно',
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'Срок действия cookie (дни)',
            type: 'slider',
            value: settings.cookieDuration,
            onChange: (v) => updateSetting('cookieDuration', v),
            min: 1,
            max: 90,
            unit: 'дней',
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'Мин. сумма выплаты',
            type: 'number',
            value: settings.minPayoutPartner,
            onChange: (v) => updateSetting('minPayoutPartner', v),
            min: 10,
            unit: settings.currency,
            disabled: !settings.partnersEnabled,
          },
        ],
      },
      {
        title: 'Комиссии по тарифам',
        icon: Percent,
        color: 'from-green-500 to-emerald-500',
        description: 'Процент комиссии для каждого уровня партнера',
        fields: [
          {
            label: 'Bronze (начальный)',
            type: 'slider',
            value: settings.partnerCommissionBronze,
            onChange: (v) => updateSetting('partnerCommissionBronze', v),
            min: 0,
            max: 20,
            step: 0.5,
            unit: '%',
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'Silver',
            type: 'slider',
            value: settings.partnerCommissionSilver,
            onChange: (v) => updateSetting('partnerCommissionSilver', v),
            min: 0,
            max: 20,
            step: 0.5,
            unit: '%',
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'Gold',
            type: 'slider',
            value: settings.partnerCommissionGold,
            onChange: (v) => updateSetting('partnerCommissionGold', v),
            min: 0,
            max: 20,
            step: 0.5,
            unit: '%',
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'Platinum',
            type: 'slider',
            value: settings.partnerCommissionPlatinum,
            onChange: (v) => updateSetting('partnerCommissionPlatinum', v),
            min: 0,
            max: 20,
            step: 0.5,
            unit: '%',
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'Diamond (максимальный)',
            type: 'slider',
            value: settings.partnerCommissionDiamond,
            onChange: (v) => updateSetting('partnerCommissionDiamond', v),
            min: 0,
            max: 25,
            step: 0.5,
            unit: '%',
            disabled: !settings.partnersEnabled,
          },
        ],
      },
      {
        title: 'Доступ партнеров',
        icon: Key,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'Партнерский dashboard',
            type: 'toggle',
            value: settings.partnerDashboardEnabled,
            onChange: (v) => updateSetting('partnerDashboardEnabled', v),
            disabled: !settings.partnersEnabled,
          },
          {
            label: 'API доступ для партнеров',
            type: 'toggle',
            value: settings.partnerApiAccess,
            onChange: (v) => updateSetting('partnerApiAccess', v),
            disabled: !settings.partnersEnabled,
          },
        ],
      },
    ],

    moderation: [
      {
        title: 'Автомодерация',
        icon: Eye,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'Включить автомодерацию',
            type: 'toggle',
            value: settings.autoModeration,
            onChange: (v) => updateSetting('autoModeration', v),
          },
          {
            label: 'AI модерация',
            type: 'toggle',
            value: settings.aiModerationEnabled,
            onChange: (v) => updateSetting('aiModerationEnabled', v),
            description: 'Использовать AI для автоматической проверки',
            disabled: !settings.autoModeration,
          },
          {
            label: 'Порог модерации',
            type: 'slider',
            value: settings.moderationThreshold,
            onChange: (v) => updateSetting('moderationThreshold', v),
            min: 1,
            max: 10,
            description: '1 = строгая, 10 = мягкая модерация',
            disabled: !settings.autoModeration,
          },
        ],
      },
      {
        title: 'Правила модерации',
        icon: Shield,
        color: 'from-red-500 to-orange-500',
        fields: [
          {
            label: 'Требовать ручное одобрение',
            type: 'toggle',
            value: settings.requireApproval,
            onChange: (v) => updateSetting('requireApproval', v),
          },
          {
            label: 'Автоодобрение verified',
            type: 'toggle',
            value: settings.autoApproveVerified,
            onChange: (v) => updateSetting('autoApproveVerified', v),
            description: 'Верифицированные пользователи без модерации',
          },
          {
            label: 'Проверка помеченного контента',
            type: 'toggle',
            value: settings.flaggedContentReview,
            onChange: (v) => updateSetting('flaggedContentReview', v),
          },
          {
            label: 'Порог эскалации',
            type: 'slider',
            value: settings.escalationThreshold,
            onChange: (v) => updateSetting('escalationThreshold', v),
            min: 1,
            max: 10,
            unit: 'жалоб',
            description: 'Количество жалоб для эскалации',
          },
        ],
      },
      {
        title: 'Типы контента',
        icon: FileText,
        color: 'from-blue-500 to-cyan-500',
        fields: [
          {
            label: 'Модерация изображений',
            type: 'toggle',
            value: settings.imageModeration,
            onChange: (v) => updateSetting('imageModeration', v),
          },
          {
            label: 'Модерация аудио',
            type: 'toggle',
            value: settings.audioModeration,
            onChange: (v) => updateSetting('audioModeration', v),
          },
          {
            label: 'Сканирование контента',
            type: 'toggle',
            value: settings.contentScanningEnabled,
            onChange: (v) => updateSetting('contentScanningEnabled', v),
          },
        ],
      },
      {
        title: 'Фильтры',
        icon: Filter,
        color: 'from-green-500 to-teal-500',
        fields: [
          {
            label: 'Детекция спама',
            type: 'toggle',
            value: settings.spamDetection,
            onChange: (v) => updateSetting('spamDetection', v),
          },
          {
            label: 'Фильтр ненормативной лексики',
            type: 'toggle',
            value: settings.profanityFilter,
            onChange: (v) => updateSetting('profanityFilter', v),
          },
        ],
      },
      {
        title: 'Тайминги',
        icon: Clock,
        color: 'from-yellow-500 to-orange-500',
        fields: [
          {
            label: 'Лимит очереди модерации',
            type: 'slider',
            value: settings.moderationQueueLimit,
            onChange: (v) => updateSetting('moderationQueueLimit', v),
            min: 10,
            max: 500,
            unit: 'элементов',
          },
          {
            label: 'Тайм-аут модерации (часы)',
            type: 'slider',
            value: settings.moderationTimeout,
            onChange: (v) => updateSetting('moderationTimeout', v),
            min: 1,
            max: 168,
            unit: 'ч',
            description: 'Автоодобрение после истечения',
          },
        ],
      },
    ],

    api: [
      {
        title: 'API настройки',
        icon: Zap,
        color: 'from-blue-500 to-indigo-500',
        fields: [
          {
            label: 'Включить API',
            type: 'toggle',
            value: settings.apiEnabled,
            onChange: (v) => updateSetting('apiEnabled', v),
          },
          {
            label: 'Версия API',
            type: 'select',
            value: settings.apiVersion,
            onChange: (v) => updateSetting('apiVersion', v),
            options: [
              { value: 'v1', label: 'v1 (текущая)' },
              { value: 'v2', label: 'v2 (beta)' },
            ],
            disabled: !settings.apiEnabled,
          },
        ],
      },
      {
        title: 'Rate Limiting',
        icon: TrendingUp,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'Лимит запросов',
            type: 'slider',
            value: settings.apiRateLimit,
            onChange: (v) => updateSetting('apiRateLimit', v),
            min: 100,
            max: 10000,
            step: 100,
            unit: 'req',
            disabled: !settings.apiEnabled,
          },
          {
            label: 'Окно лимита',
            type: 'select',
            value: settings.apiRateLimitWindow,
            onChange: (v) => updateSetting('apiRateLimitWindow', v),
            options: [
              { value: 'minute', label: 'В минуту' },
              { value: 'hour', label: 'В час' },
              { value: 'day', label: 'В день' },
            ],
            disabled: !settings.apiEnabled,
          },
        ],
      },
      {
        title: 'Кэширование',
        icon: Database,
        color: 'from-green-500 to-emerald-500',
        fields: [
          {
            label: 'Включить кэширование',
            type: 'toggle',
            value: settings.apiCaching,
            onChange: (v) => updateSetting('apiCaching', v),
            disabled: !settings.apiEnabled,
          },
          {
            label: 'Длительность кэша (сек)',
            type: 'slider',
            value: settings.apiCacheDuration,
            onChange: (v) => updateSetting('apiCacheDuration', v),
            min: 60,
            max: 3600,
            step: 60,
            unit: 'сек',
            disabled: !settings.apiEnabled || !settings.apiCaching,
          },
        ],
      },
      {
        title: 'Webhooks',
        icon: Share2,
        color: 'from-orange-500 to-red-500',
        fields: [
          {
            label: 'Включить webhooks',
            type: 'toggle',
            value: settings.webhooksEnabled,
            onChange: (v) => updateSetting('webhooksEnabled', v),
            disabled: !settings.apiEnabled,
          },
          {
            label: 'Макс. попыток retry',
            type: 'slider',
            value: settings.maxWebhookRetries,
            onChange: (v) => updateSetting('maxWebhookRetries', v),
            min: 0,
            max: 10,
            unit: 'попыток',
            disabled: !settings.webhooksEnabled,
          },
          {
            label: 'Тайм-аут webhook (сек)',
            type: 'slider',
            value: settings.webhookTimeout,
            onChange: (v) => updateSetting('webhookTimeout', v),
            min: 5,
            max: 120,
            unit: 'сек',
            disabled: !settings.webhooksEnabled,
          },
        ],
      },
      {
        title: 'CORS',
        icon: Globe,
        color: 'from-cyan-500 to-blue-500',
        fields: [
          {
            label: 'Включить CORS',
            type: 'toggle',
            value: settings.enableCors,
            onChange: (v) => updateSetting('enableCors', v),
            disabled: !settings.apiEnabled,
          },
          {
            label: 'Разрешенные origins',
            type: 'text',
            value: settings.corsOrigins,
            onChange: (v) => updateSetting('corsOrigins', v),
            placeholder: '* или https://example.com',
            disabled: !settings.enableCors,
          },
        ],
      },
      {
        title: 'API Key',
        icon: Key,
        color: 'from-yellow-500 to-orange-500',
        description: 'Ваш секретный API ключ',
        fields: [
          {
            label: 'API Key',
            type: showApiKey ? 'text' : 'password',
            value: settings.apiKey,
            onChange: (v) => updateSetting('apiKey', v),
            disabled: !settings.apiEnabled,
          },
        ],
      },
    ],

    email: [
      {
        title: 'Email провайдер',
        icon: Mail,
        color: 'from-blue-500 to-purple-500',
        fields: [
          {
            label: 'Провайдер',
            type: 'select',
            value: settings.emailProvider,
            onChange: (v) => updateSetting('emailProvider', v),
            options: [
              { value: 'sendgrid', label: 'SendGrid' },
              { value: 'mailgun', label: 'Mailgun' },
              { value: 'ses', label: 'Amazon SES' },
              { value: 'smtp', label: 'Custom SMTP' },
            ],
          },
        ],
      },
      {
        title: 'SMTP настройки',
        icon: Server,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'SMTP хост',
            type: 'text',
            value: settings.smtpHost,
            onChange: (v) => updateSetting('smtpHost', v),
            placeholder: 'smtp.example.com',
          },
          {
            label: 'SMTP порт',
            type: 'number',
            value: settings.smtpPort,
            onChange: (v) => updateSetting('smtpPort', v),
            min: 1,
            max: 65535,
          },
          {
            label: 'SMTP пользователь',
            type: 'text',
            value: settings.smtpUser,
            onChange: (v) => updateSetting('smtpUser', v),
          },
          {
            label: 'SMTP пароль',
            type: 'password',
            value: settings.smtpPassword,
            onChange: (v) => updateSetting('smtpPassword', v),
          },
          {
            label: 'Безопасное соединение (TLS)',
            type: 'toggle',
            value: settings.smtpSecure,
            onChange: (v) => updateSetting('smtpSecure', v),
          },
        ],
      },
      {
        title: 'Отправитель',
        icon: Mail,
        color: 'from-green-500 to-teal-500',
        fields: [
          {
            label: 'From Email',
            type: 'email',
            value: settings.fromEmail,
            onChange: (v) => updateSetting('fromEmail', v),
            placeholder: 'noreply@promo.music',
          },
          {
            label: 'From Name',
            type: 'text',
            value: settings.fromName,
            onChange: (v) => updateSetting('fromName', v),
            placeholder: 'PROMO.MUSIC',
          },
          {
            label: 'Reply-To Email',
            type: 'email',
            value: settings.replyToEmail,
            onChange: (v) => updateSetting('replyToEmail', v),
            placeholder: 'support@promo.music',
          },
        ],
      },
      {
        title: 'Шаблоны и контент',
        icon: FileText,
        color: 'from-orange-500 to-red-500',
        fields: [
          {
            label: 'Использовать шаблоны',
            type: 'toggle',
            value: settings.emailTemplatesEnabled,
            onChange: (v) => updateSetting('emailTemplatesEnabled', v),
          },
          {
            label: 'Футер email',
            type: 'textarea',
            value: settings.emailFooter,
            onChange: (v) => updateSetting('emailFooter', v),
            placeholder: '© 2024 PROMO.MUSIC',
          },
        ],
      },
      {
        title: 'Трекинг',
        icon: Activity,
        color: 'from-yellow-500 to-orange-500',
        fields: [
          {
            label: 'Отслеживать открытия',
            type: 'toggle',
            value: settings.trackEmailOpens,
            onChange: (v) => updateSetting('trackEmailOpens', v),
          },
          {
            label: 'Отслеживать клики',
            type: 'toggle',
            value: settings.trackEmailClicks,
            onChange: (v) => updateSetting('trackEmailClicks', v),
          },
          {
            label: 'Обработка bounce',
            type: 'toggle',
            value: settings.emailBounceHandling,
            onChange: (v) => updateSetting('emailBounceHandling', v),
          },
        ],
      },
      {
        title: 'Повторные попытки',
        icon: RefreshCw,
        color: 'from-cyan-500 to-blue-500',
        fields: [
          {
            label: 'Попыток отправки',
            type: 'slider',
            value: settings.emailRetryAttempts,
            onChange: (v) => updateSetting('emailRetryAttempts', v),
            min: 0,
            max: 5,
            unit: 'попыток',
          },
        ],
      },
      {
        title: 'Отписки',
        icon: XCircle,
        color: 'from-red-500 to-pink-500',
        fields: [
          {
            label: 'Включить отписки',
            type: 'toggle',
            value: settings.unsubscribeEnabled,
            onChange: (v) => updateSetting('unsubscribeEnabled', v),
            description: 'Добавить ссылку отписки в emails',
          },
        ],
      },
    ],

    pitching: [
      {
        title: 'Основные настройки',
        icon: TrendingUp,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'Включить питчинг',
            type: 'toggle',
            value: settings.pitchingEnabled,
            onChange: (v) => updateSetting('pitchingEnabled', v),
          },
          {
            label: 'Стандартная цена питча',
            type: 'slider',
            value: settings.defaultPitchPrice,
            onChange: (v) => updateSetting('defaultPitchPrice', v),
            min: 5,
            max: 100,
            unit: settings.currency,
            disabled: !settings.pitchingEnabled,
          },
        ],
      },
      {
        title: 'Ценовые диапазоны',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500',
        fields: [
          {
            label: 'Мин. цена питча',
            type: 'slider',
            value: settings.minPitchPrice,
            onChange: (v) => updateSetting('minPitchPrice', v),
            min: 1,
            max: 50,
            unit: settings.currency,
            disabled: !settings.pitchingEnabled,
          },
          {
            label: 'Макс. цена питча',
            type: 'slider',
            value: settings.maxPitchPrice,
            onChange: (v) => updateSetting('maxPitchPrice', v),
            min: 100,
            max: 1000,
            step: 50,
            unit: settings.currency,
            disabled: !settings.pitchingEnabled,
          },
        ],
      },
      {
        title: 'Premium опции',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        fields: [
          {
            label: 'Express питчинг',
            type: 'toggle',
            value: settings.expressEnabled,
            onChange: (v) => updateSetting('expressEnabled', v),
            description: 'Быстрое рассмотрение за 24 часа',
            disabled: !settings.pitchingEnabled,
          },
          {
            label: 'Множитель цены Express',
            type: 'slider',
            value: settings.expressPriceMultiplier,
            onChange: (v) => updateSetting('expressPriceMultiplier', v),
            min: 1.5,
            max: 5,
            step: 0.5,
            unit: 'x',
            disabled: !settings.expressEnabled,
          },
          {
            label: 'Гарантированное рассмотрение',
            type: 'toggle',
            value: settings.guaranteedEnabled,
            onChange: (v) => updateSetting('guaranteedEnabled', v),
            disabled: !settings.pitchingEnabled,
          },
          {
            label: 'Множитель цены Guaranteed',
            type: 'slider',
            value: settings.guaranteedPriceMultiplier,
            onChange: (v) => updateSetting('guaranteedPriceMultiplier', v),
            min: 2,
            max: 10,
            step: 0.5,
            unit: 'x',
            disabled: !settings.guaranteedEnabled,
          },
        ],
      },
      {
        title: 'Лимиты и сроки',
        icon: Clock,
        color: 'from-blue-500 to-cyan-500',
        fields: [
          {
            label: 'Время рассмотрения (часы)',
            type: 'slider',
            value: settings.pitchReviewTime,
            onChange: (v) => updateSetting('pitchReviewTime', v),
            min: 24,
            max: 168,
            step: 24,
            unit: 'ч',
            disabled: !settings.pitchingEnabled,
          },
          {
            label: 'Срок действия питча (дни)',
            type: 'slider',
            value: settings.pitchExpiryDays,
            onChange: (v) => updateSetting('pitchExpiryDays', v),
            min: 7,
            max: 90,
            unit: 'дней',
            disabled: !settings.pitchingEnabled,
          },
          {
            label: 'Автоотмена просроченных',
            type: 'toggle',
            value: settings.autoCancelExpiredPitches,
            onChange: (v) => updateSetting('autoCancelExpiredPitches', v),
            disabled: !settings.pitchingEnabled,
          },
        ],
      },
      {
        title: 'Множественные питчи',
        icon: TrendingUp,
        color: 'from-purple-500 to-indigo-500',
        fields: [
          {
            label: 'Разрешить множественные питчи',
            type: 'toggle',
            value: settings.allowMultiplePitches,
            onChange: (v) => updateSetting('allowMultiplePitches', v),
            description: 'Один трек в несколько плейлистов',
            disabled: !settings.pitchingEnabled,
          },
          {
            label: 'Макс. одновременных питчей',
            type: 'slider',
            value: settings.maxSimultaneousPitches,
            onChange: (v) => updateSetting('maxSimultaneousPitches', v),
            min: 1,
            max: 50,
            unit: 'питчей',
            disabled: !settings.allowMultiplePitches,
          },
        ],
      },
    ],

    analytics: [
      {
        title: 'Аналитика',
        icon: BarChart3,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'Включить аналитику',
            type: 'toggle',
            value: settings.analyticsEnabled,
            onChange: (v) => updateSetting('analyticsEnabled', v),
          },
          {
            label: 'Отслеживать просмотры страниц',
            type: 'toggle',
            value: settings.trackPageViews,
            onChange: (v) => updateSetting('trackPageViews', v),
            disabled: !settings.analyticsEnabled,
          },
          {
            label: 'Отслеживать события',
            type: 'toggle',
            value: settings.trackEvents,
            onChange: (v) => updateSetting('trackEvents', v),
            disabled: !settings.analyticsEnabled,
          },
          {
            label: 'Отслеживать конверсии',
            type: 'toggle',
            value: settings.trackConversions,
            onChange: (v) => updateSetting('trackConversions', v),
            disabled: !settings.analyticsEnabled,
          },
        ],
      },
      {
        title: 'Интеграции',
        icon: Share2,
        color: 'from-blue-500 to-indigo-500',
        fields: [
          {
            label: 'Google Analytics ID',
            type: 'text',
            value: settings.googleAnalyticsId,
            onChange: (v) => updateSetting('googleAnalyticsId', v),
            placeholder: 'G-XXXXXXXXXX',
            disabled: !settings.analyticsEnabled,
          },
          {
            label: 'Facebook Pixel ID',
            type: 'text',
            value: settings.facebookPixelId,
            onChange: (v) => updateSetting('facebookPixelId', v),
            placeholder: '000000000000000',
            disabled: !settings.analyticsEnabled,
          },
          {
            label: 'Mixpanel Token',
            type: 'text',
            value: settings.mixpanelToken,
            onChange: (v) => updateSetting('mixpanelToken', v),
            placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            disabled: !settings.analyticsEnabled,
          },
          {
            label: 'Amplitude API Key',
            type: 'text',
            value: settings.amplitudeKey,
            onChange: (v) => updateSetting('amplitudeKey', v),
            placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            disabled: !settings.analyticsEnabled,
          },
        ],
      },
      {
        title: 'Дополнительные опции',
        icon: Activity,
        color: 'from-green-500 to-teal-500',
        fields: [
          {
            label: 'Тепловые карты',
            type: 'toggle',
            value: settings.heatmapsEnabled,
            onChange: (v) => updateSetting('heatmapsEnabled', v),
            description: 'Hotjar, Crazy Egg и др.',
            disabled: !settings.analyticsEnabled,
          },
          {
            label: 'Запись сессий',
            type: 'toggle',
            value: settings.sessionRecordingEnabled,
            onChange: (v) => updateSetting('sessionRecordingEnabled', v),
            description: 'Fullstory, LogRocket и др.',
            disabled: !settings.analyticsEnabled,
          },
        ],
      },
    ],

    backup: [
      {
        title: 'Автоматический backup',
        icon: Database,
        color: 'from-blue-500 to-purple-500',
        fields: [
          {
            label: 'Включить автобэкап',
            type: 'toggle',
            value: settings.autoBackupEnabled,
            onChange: (v) => updateSetting('autoBackupEnabled', v),
          },
          {
            label: 'Частота бэкапов',
            type: 'select',
            value: settings.backupFrequency,
            onChange: (v) => updateSetting('backupFrequency', v),
            options: [
              { value: 'hourly', label: 'Ежечасно' },
              { value: 'daily', label: 'Ежедневно' },
              { value: 'weekly', label: 'Еженедельно' },
              { value: 'monthly', label: 'Ежемесячно' },
            ],
            disabled: !settings.autoBackupEnabled,
          },
          {
            label: 'Хранить бэкапы (дни)',
            type: 'slider',
            value: settings.backupRetention,
            onChange: (v) => updateSetting('backupRetention', v),
            min: 1,
            max: 365,
            unit: 'дней',
            disabled: !settings.autoBackupEnabled,
          },
        ],
      },
      {
        title: 'Расположение',
        icon: Server,
        color: 'from-green-500 to-emerald-500',
        fields: [
          {
            label: 'Хранилище',
            type: 'select',
            value: settings.backupLocation,
            onChange: (v) => updateSetting('backupLocation', v),
            options: [
              { value: 's3', label: 'Amazon S3' },
              { value: 'gcs', label: 'Google Cloud Storage' },
              { value: 'azure', label: 'Azure Storage' },
              { value: 'local', label: 'Локальное хранилище' },
            ],
            disabled: !settings.autoBackupEnabled,
          },
          {
            label: 'Шифрование бэкапов',
            type: 'toggle',
            value: settings.backupEncryption,
            onChange: (v) => updateSetting('backupEncryption', v),
            disabled: !settings.autoBackupEnabled,
          },
        ],
      },
      {
        title: 'Что бэкапить',
        icon: FileText,
        color: 'from-purple-500 to-pink-500',
        fields: [
          {
            label: 'База данных',
            type: 'toggle',
            value: settings.databaseBackup,
            onChange: (v) => updateSetting('databaseBackup', v),
            disabled: !settings.autoBackupEnabled,
          },
          {
            label: 'Файлы пользователей',
            type: 'toggle',
            value: settings.filesBackup,
            onChange: (v) => updateSetting('filesBackup', v),
            disabled: !settings.autoBackupEnabled,
          },
        ],
      },
      {
        title: 'Обслуживание',
        icon: Clock,
        color: 'from-orange-500 to-red-500',
        fields: [
          {
            label: 'Автообновления',
            type: 'toggle',
            value: settings.autoUpdateEnabled,
            onChange: (v) => updateSetting('autoUpdateEnabled', v),
            warning: settings.autoUpdateEnabled ? 'Включены автообновления' : undefined,
          },
          {
            label: 'Окно обслуживания',
            type: 'text',
            value: settings.maintenanceWindow,
            onChange: (v) => updateSetting('maintenanceWindow', v),
            placeholder: 'Sunday 02:00-04:00',
          },
          {
            label: 'Последний бэкап',
            type: 'text',
            value: settings.lastBackupDate,
            onChange: () => {},
            disabled: true,
          },
        ],
      },
      {
        title: 'GDPR & Privacy',
        icon: Shield,
        color: 'from-red-500 to-pink-500',
        fields: [
          {
            label: 'GDPR соответствие',
            type: 'toggle',
            value: settings.gdprCompliance,
            onChange: (v) => updateSetting('gdprCompliance', v),
          },
          {
            label: 'Cookie consent',
            type: 'toggle',
            value: settings.cookieConsent,
            onChange: (v) => updateSetting('cookieConsent', v),
          },
          {
            label: 'Хранение данных (дни)',
            type: 'slider',
            value: settings.dataRetentionDays,
            onChange: (v) => updateSetting('dataRetentionDays', v),
            min: 30,
            max: 3650,
            unit: 'дней',
          },
          {
            label: 'Анонимизация данных',
            type: 'toggle',
            value: settings.anonymizeData,
            onChange: (v) => updateSetting('anonymizeData', v),
          },
          {
            label: 'Право на забвение',
            type: 'toggle',
            value: settings.rightToBeForgotten,
            onChange: (v) => updateSetting('rightToBeForgotten', v),
          },
          {
            label: 'Экспорт данных',
            type: 'toggle',
            value: settings.dataExportEnabled,
            onChange: (v) => updateSetting('dataExportEnabled', v),
          },
        ],
      },
    ],

    features: [
      {
        title: 'Feature Flags',
        icon: Zap,
        color: 'from-purple-500 to-pink-500',
        description: 'Экспериментальные функции',
        fields: [
          {
            label: 'Beta функции',
            type: 'toggle',
            value: settings.betaFeaturesEnabled,
            onChange: (v) => updateSetting('betaFeaturesEnabled', v),
            warning: settings.betaFeaturesEnabled ? 'Beta функции могут быть нестабильны' : undefined,
          },
          {
            label: 'Экспериментальные функции',
            type: 'toggle',
            value: settings.experimentalFeaturesEnabled,
            onChange: (v) => updateSetting('experimentalFeaturesEnabled', v),
            warning: settings.experimentalFeaturesEnabled ? 'Только для тестирования!' : undefined,
          },
        ],
      },
      {
        title: 'UI/UX',
        icon: Palette,
        color: 'from-blue-500 to-indigo-500',
        fields: [
          {
            label: 'Принудительная темная тема',
            type: 'toggle',
            value: settings.darkModeForced,
            onChange: (v) => updateSetting('darkModeForced', v),
          },
        ],
      },
      {
        title: 'Баннеры',
        icon: MessageSquare,
        color: 'from-yellow-500 to-orange-500',
        fields: [
          {
            label: 'Баннер обслуживания',
            type: 'toggle',
            value: settings.maintenanceBanner,
            onChange: (v) => updateSetting('maintenanceBanner', v),
          },
          {
            label: 'Панель объявлений',
            type: 'toggle',
            value: settings.announcementBar,
            onChange: (v) => updateSetting('announcementBar', v),
          },
          {
            label: 'Текст объявления',
            type: 'textarea',
            value: settings.announcementText,
            onChange: (v) => updateSetting('announcementText', v),
            placeholder: 'Важное объявление...',
            disabled: !settings.announcementBar,
          },
        ],
      },
    ],
  };

  const renderField = (field: Setting) => {
    const baseClasses = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 transition-all";
    
    switch (field.type) {
      case 'toggle':
        return (
          <button
            onClick={() => !field.disabled && field.onChange(!field.value)}
            disabled={field.disabled}
            className={`relative w-16 h-8 rounded-full transition-all ${
              field.disabled ? 'opacity-50 cursor-not-allowed' :
              field.value
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                field.value ? 'right-1' : 'left-1'
              } ${field.value && !field.disabled ? 'shadow-lg shadow-green-500/50' : ''}`}
            />
          </button>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={field.value}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                disabled={field.disabled}
                className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-white font-semibold min-w-[80px] text-right">
                {field.value} {field.unit || ''}
              </span>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={field.disabled}
            className={`${baseClasses} ${field.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900">
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={`${baseClasses} resize-none ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            rows={3}
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
              min={field.min}
              max={field.max}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={`${baseClasses} ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {field.unit && (
              <span className="text-gray-400 min-w-[60px]">{field.unit}</span>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="flex items-center gap-2">
            <input
              type={field.type === 'password' && !showApiKey ? 'password' : 'text'}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={`${baseClasses} ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {field.label === 'API Key' && (
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(field.value);
                toast.success('Скопировано в буфер обмена');
              }}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              title="Копировать"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={`${baseClasses} ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        );
    }
  };

  const filteredSections = settingsSections[activeTab]?.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.fields.some(field => 
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Настройки</h1>
              <p className="text-sm sm:text-base text-gray-400">Управление платформой</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button
              onClick={handleResetSettings}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Сбросить</span>
            </button>
            <button
              onClick={handleExportSettings}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Экспорт</span>
            </button>
            <button
              onClick={handleImportSettings}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Импорт</span>
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isSaving}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                hasChanges && !isSaving
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Сохранить</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 sm:mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск настроек..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-2 sm:p-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4 sm:space-y-6"
        >
          {filteredSections.length > 0 ? (
            filteredSections.map((section, sectionIndex) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.05 }}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${section.color} bg-opacity-20`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">{section.title}</h2>
                        {section.description && (
                          <p className="text-xs sm:text-sm text-gray-400">{section.description}</p>
                        )}
                      </div>
                    </div>
                    {section.badge && (
                      <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs sm:text-sm font-semibold">
                        {section.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <label className="block text-white font-medium mb-1 text-sm sm:text-base">
                              {field.label}
                            </label>
                            {field.description && (
                              <p className="text-gray-400 text-xs sm:text-sm mb-2">{field.description}</p>
                            )}
                            {field.warning && (
                              <div className="flex items-center gap-2 text-orange-400 text-xs sm:text-sm mb-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>{field.warning}</span>
                              </div>
                            )}
                          </div>

                          {field.type === 'toggle' && (
                            <div className="flex-shrink-0">
                              {renderField(field)}
                            </div>
                          )}
                        </div>

                        {field.type !== 'toggle' && (
                          <div>
                            {renderField(field)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchQuery ? 'Настройки не найдены' : 'Нет доступных настроек'}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 bg-opacity-20">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Информация о системе</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Версия платформы', value: 'v2.4.1', icon: Activity },
            { label: 'Использование БД', value: '47%', icon: Database },
            { label: 'Активных пользователей', value: '1,247', icon: Users },
            { label: 'Uptime', value: '99.8%', icon: TrendingUp },
            { label: 'API запросов', value: '1.2M/день', icon: Zap },
            { label: 'Storage', value: '234 GB / 1 TB', icon: Server },
            { label: 'Последний backup', value: settings.lastBackupDate, icon: RefreshCw },
            { label: 'Модераций в очереди', value: '23', icon: Eye },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <p className="text-gray-400 text-xs sm:text-sm">{item.label}</p>
                </div>
                <p className="text-white font-semibold text-sm sm:text-base">{item.value}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-red-500/10 rounded-2xl border border-red-500/30 p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          <h2 className="text-lg sm:text-xl font-bold text-red-400">Опасная зона</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Очистить кэш', icon: Trash2 },
            { label: 'Сбросить статистику', icon: BarChart3 },
            { label: 'Экспорт данных', icon: Download },
            { label: 'Перезапустить сервисы', icon: RefreshCw },
            { label: 'Тестовый backup', icon: Database },
            { label: 'Проверка целостности БД', icon: CheckCircle },
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                onClick={() => toast.info(`Действие: ${btn.label}`)}
                className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {btn.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Save Changes Banner */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-50"
          >
            <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 rounded-2xl border border-orange-400/50 p-4 shadow-2xl shadow-orange-500/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm sm:text-base">Есть несохраненные изменения</p>
                    <p className="text-white/80 text-xs sm:text-sm">Не забудьте сохранить настройки</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleResetSettings}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all text-sm sm:text-base"
                  >
                    Отменить
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-white text-orange-600 hover:bg-gray-100 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Сохранение...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Сохранить</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
