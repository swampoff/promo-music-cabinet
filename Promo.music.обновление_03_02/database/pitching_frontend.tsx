# 🎨 PROMO.MUSIC - PITCHING FRONTEND INTEGRATION

## TypeScript Types для фронтенда

```typescript
// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Статусы кампании
export type CampaignStatus = 
  | 'draft' 
  | 'pending_payment' 
  | 'paid' 
  | 'in_moderation' 
  | 'approved' 
  | 'rejected' 
  | 'active' 
  | 'completed' 
  | 'cancelled';

// Типы кампаний
export type CampaignType = 
  | 'radio' 
  | 'playlist' 
  | 'blogger' 
  | 'media' 
  | 'venue';

// Приоритет
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

// Статус отправки партнеру
export type SubmissionStatus = 
  | 'pending' 
  | 'sent' 
  | 'opened' 
  | 'clicked' 
  | 'approved' 
  | 'rejected' 
  | 'no_response';

// Статус платежа
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled';

// Категории партнеров
export type PartnerCategory = 
  | 'radio' 
  | 'playlist' 
  | 'blogger' 
  | 'media' 
  | 'venue' 
  | 'all';

// ============================================================================
// MAIN INTERFACES
// ============================================================================

export interface PitchingCampaign {
  id: number;
  uuid: string;
  user_id: number;
  track_id: number;
  
  // Основная информация
  campaign_name: string;
  campaign_type: CampaignType;
  pitch_text: string;
  additional_info?: AdditionalInfo;
  press_kit_url?: string;
  
  // Статус
  status: CampaignStatus;
  priority: Priority;
  
  // Партнеры
  target_partners: TargetPartner[];
  total_partners_count: number;
  
  // Финансы
  total_cost: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_id?: number;
  discount_percentage: number;
  final_cost: number;
  
  // Даты
  start_date?: string;
  end_date?: string;
  deadline?: string;
  
  // Статистика
  views_count: number;
  clicks_count: number;
  responses_count: number;
  approvals_count: number;
  rejections_count: number;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  completed_at?: string;
  deleted_at?: string;
}

export interface AdditionalInfo {
  genre?: string;
  subgenre?: string;
  mood?: string;
  bpm?: number;
  key?: string;
  similar_artists?: string[];
  target_audience?: string;
  backstory?: string;
}

export interface TargetPartner {
  id: number;
  name: string;
  category: PartnerCategory;
  price: number;
  logo_url?: string;
}

export interface PitchingSubmission {
  id: number;
  uuid: string;
  campaign_id: number;
  partner_id: number;
  
  // Статус
  status: SubmissionStatus;
  
  // Ответ партнера
  partner_response?: string;
  partner_rating?: number;
  partner_feedback?: Record<string, any>;
  
  // Детали размещения
  placement_details?: PlacementDetails;
  playlist_url?: string;
  airplay_date?: string;
  airplay_time_slot?: string;
  
  // Статистика
  opened_at?: string;
  clicked_at?: string;
  responded_at?: string;
  views_count: number;
  track_plays_count: number;
  
  // Финансы
  partner_commission: number;
  partner_paid: boolean;
  partner_payout_date?: string;
  
  is_priority: boolean;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  
  // Populated
  partner?: Partner;
}

export interface PlacementDetails {
  airplay_date?: string;
  time_slot?: string;
  rotation?: 'Light' | 'Medium' | 'Heavy';
  estimated_listeners?: number;
  playlist_name?: string;
  playlist_position?: number;
  blog_post_url?: string;
  social_post_url?: string;
  article_url?: string;
  event_date?: string;
}

export interface Partner {
  id: number;
  uuid: string;
  
  // Основная информация
  name: string;
  category: PartnerCategory;
  logo_url?: string;
  
  // Контакты
  email: string;
  phone?: string;
  website?: string;
  
  // Локация
  country: string;
  city?: string;
  address?: string;
  
  // Статус
  status: 'active' | 'pending' | 'blocked' | 'archived';
  verified: boolean;
  
  // Аудитория
  audience_size: number;
  reach_monthly: number;
  
  // Жанры
  genres: string[];
  languages: string[];
  
  // Цены
  base_price: number;
  currency: string;
  commission_percentage: number;
  
  // Рейтинг
  rating: number;
  total_pitches_received: number;
  total_pitches_approved: number;
  approval_rate: number;
  average_response_time_hours: number;
  
  // Контакт
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Описание
  description?: string;
  pitch_guidelines?: string;
  
  // Соцсети
  social_links?: Record<string, string>;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
  added_by: 'admin' | 'auto' | 'user';
  deleted_at?: string;
}

export interface Track {
  id: number;
  uuid: string;
  user_id: number;
  
  // Основная информация
  title: string;
  artist_name: string;
  featuring?: string;
  
  // Файлы
  audio_url: string;
  cover_url?: string;
  waveform_data?: number[];
  
  // Метаданные
  duration_seconds: number;
  genre?: string;
  subgenre?: string;
  mood?: string;
  bpm?: number;
  key?: string;
  
  // Релиз
  release_date?: string;
  isrc?: string;
  label?: string;
  
  // Тексты
  lyrics?: string;
  description?: string;
  
  // Права
  copyright_holder?: string;
  is_original: boolean;
  
  // Ссылки
  spotify_url?: string;
  apple_music_url?: string;
  youtube_url?: string;
  soundcloud_url?: string;
  
  // Статистика
  plays_count: number;
  likes_count: number;
  shares_count: number;
  downloads_count: number;
  
  // Модерация
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_notes?: string;
  
  // Статус
  status: 'active' | 'archived' | 'deleted';
  is_public: boolean;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PitchingPayment {
  id: number;
  uuid: string;
  campaign_id: number;
  user_id: number;
  
  // Сумма
  amount: number;
  currency: string;
  
  // Детали
  payment_method: 'card' | 'balance' | 'yookassa' | 'stripe';
  transaction_id?: string;
  
  // Статус
  status: PaymentStatus;
  
  // Описание
  description?: string;
  invoice_number?: string;
  
  // Метаданные
  payment_metadata?: Record<string, any>;
  
  // Даты
  created_at: string;
  completed_at?: string;
  refunded_at?: string;
}

export interface PitchingTemplate {
  id: number;
  uuid: string;
  user_id?: number;
  
  // Контент
  template_name: string;
  template_category: CampaignType;
  pitch_text: string;
  placeholders: Record<string, string>;
  
  // Тип
  is_system_template: boolean;
  is_public: boolean;
  
  // Статистика
  usage_count: number;
  success_rate: number;
  
  // Метаданные
  created_at: string;
  updated_at: string;
}

export interface PitchingStatistics {
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  total_pitches_sent: number;
  total_approvals: number;
  total_rejections: number;
  pending_responses: number;
  overall_approval_rate: number;
  total_spent: number;
  average_campaign_cost: number;
  by_type: Record<CampaignType, {
    campaigns: number;
    approval_rate: number;
  }>;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateCampaignRequest {
  track_id: number;
  campaign_name: string;
  campaign_type: CampaignType;
  pitch_text: string;
  additional_info?: AdditionalInfo;
  press_kit_url?: string;
  target_partners: TargetPartner[];
  start_date?: string;
  end_date?: string;
  deadline?: string;
  priority?: Priority;
}

export interface UpdateCampaignRequest {
  campaign_name?: string;
  pitch_text?: string;
  additional_info?: AdditionalInfo;
  target_partners?: TargetPartner[];
  deadline?: string;
  priority?: Priority;
}

export interface PartnersFilterParams {
  category?: PartnerCategory;
  country?: string;
  city?: string;
  genre?: string;
  min_rating?: number;
  min_approval_rate?: number;
  sort?: 'rating' | 'approval_rate' | 'audience_size' | 'base_price';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CampaignsFilterParams {
  status?: CampaignStatus;
  type?: CampaignType;
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'deadline' | 'cost';
  order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook для работы с кампаниями
 */
export function usePitchingCampaigns(filters?: CampaignsFilterParams) {
  const [campaigns, setCampaigns] = useState<PitchingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/pitching/campaigns?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      
      const result: ApiResponse<{ campaigns: PitchingCampaign[] }> = await response.json();
      
      if (result.success && result.data) {
        setCampaigns(result.data.campaigns);
      } else {
        setError(result.error?.message || 'Ошибка загрузки кампаний');
      }
    } catch (err) {
      setError('Ошибка соединения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns
  };
}

/**
 * Hook для работы с одной кампанией
 */
export function usePitchingCampaign(campaignId: number) {
  const [campaign, setCampaign] = useState<PitchingCampaign | null>(null);
  const [submissions, setSubmissions] = useState<PitchingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/pitching/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      
      const result: ApiResponse<{ campaign: PitchingCampaign; submissions: PitchingSubmission[] }> = await response.json();
      
      if (result.success && result.data) {
        setCampaign(result.data.campaign);
        setSubmissions(result.data.submissions || []);
      } else {
        setError(result.error?.message || 'Ошибка загрузки кампании');
      }
    } catch (err) {
      setError('Ошибка соединения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    campaign,
    submissions,
    loading,
    error,
    refetch: fetchCampaign
  };
}

/**
 * Hook для создания кампании
 */
export function useCreateCampaign() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = async (data: CreateCampaignRequest): Promise<PitchingCampaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/pitching/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result: ApiResponse<{ campaign: PitchingCampaign }> = await response.json();
      
      if (result.success && result.data) {
        toast.success('Кампания создана!');
        return result.data.campaign;
      } else {
        const errorMsg = result.error?.message || 'Ошибка создания кампании';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = 'Ошибка соединения';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCampaign,
    loading,
    error
  };
}

/**
 * Hook для работы с партнерами
 */
export function usePartners(filters?: PartnersFilterParams) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchPartners();
  }, [filters]);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/pitching/partners?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      
      const result: ApiResponse<{ partners: Partner[]; pagination: any }> = await response.json();
      
      if (result.success && result.data) {
        setPartners(result.data.partners);
        setPagination(result.data.pagination);
      } else {
        setError(result.error?.message || 'Ошибка загрузки партнеров');
      }
    } catch (err) {
      setError('Ошибка соединения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    partners,
    pagination,
    loading,
    error,
    refetch: fetchPartners
  };
}

/**
 * Hook для статистики
 */
export function usePitchingStats() {
  const [stats, setStats] = useState<PitchingStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/pitching/statistics', {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      
      const result: ApiResponse<{ statistics: PitchingStatistics }> = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data.statistics);
      } else {
        setError(result.error?.message || 'Ошибка загрузки статистики');
      }
    } catch (err) {
      setError('Ошибка соединения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Получить цвет статуса
 */
export function getStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    draft: 'gray',
    pending_payment: 'yellow',
    paid: 'blue',
    in_moderation: 'purple',
    approved: 'green',
    rejected: 'red',
    active: 'cyan',
    completed: 'emerald',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
}

/**
 * Получить название статуса на русском
 */
export function getStatusLabel(status: CampaignStatus): string {
  const labels: Record<CampaignStatus, string> = {
    draft: 'Черновик',
    pending_payment: 'Ожидание оплаты',
    paid: 'Оплачено',
    in_moderation: 'На модерации',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    active: 'Активна',
    completed: 'Завершена',
    cancelled: 'Отменена'
  };
  return labels[status] || status;
}

/**
 * Получить название типа кампании
 */
export function getCampaignTypeLabel(type: CampaignType): string {
  const labels: Record<CampaignType, string> = {
    radio: 'Радио',
    playlist: 'Плейлист',
    blogger: 'Блогер',
    media: 'СМИ',
    venue: 'Заведение'
  };
  return labels[type] || type;
}

/**
 * Форматировать деньги
 */
export function formatCurrency(amount: number, currency: string = 'RUB'): string {
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€'
  };
  
  return `${amount.toLocaleString('ru-RU')} ${symbols[currency] || currency}`;
}

/**
 * Рассчитать процент одобрений
 */
export function calculateApprovalRate(approvals: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((approvals / total) * 100);
}

/**
 * Получить access token
 */
function getAccessToken(): string {
  // Implement your token retrieval logic
  return localStorage.getItem('access_token') || '';
}

/**
 * Заменить плейсхолдеры в шаблоне
 */
export function replacePlaceholders(
  template: string, 
  values: Record<string, string | number>
): string {
  let result = template;
  
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return result;
}

/**
 * Валидация формы создания кампании
 */
export function validateCampaignForm(data: Partial<CreateCampaignRequest>): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.track_id) {
    errors.track_id = 'Выберите трек';
  }
  
  if (!data.campaign_name?.trim()) {
    errors.campaign_name = 'Введите название кампании';
  }
  
  if (!data.campaign_type) {
    errors.campaign_type = 'Выберите тип кампании';
  }
  
  if (!data.pitch_text?.trim()) {
    errors.pitch_text = 'Введите текст питча';
  } else if (data.pitch_text.length < 50) {
    errors.pitch_text = 'Текст питча должен содержать минимум 50 символов';
  }
  
  if (!data.target_partners || data.target_partners.length === 0) {
    errors.target_partners = 'Выберите хотя бы одного партнера';
  }
  
  if (data.deadline) {
    const deadline = new Date(data.deadline);
    const today = new Date();
    if (deadline <= today) {
      errors.deadline = 'Дедлайн должен быть в будущем';
    }
  }
  
  return errors;
}

/**
 * Экспорт данных в CSV
 */
export function exportCampaignsToCSV(campaigns: PitchingCampaign[]): void {
  const headers = [
    'ID', 'Название', 'Тип', 'Статус', 'Партнеры', 'Одобрено', 
    'Стоимость', 'Создано', 'Дедлайн'
  ];
  
  const rows = campaigns.map(c => [
    c.id,
    c.campaign_name,
    getCampaignTypeLabel(c.campaign_type),
    getStatusLabel(c.status),
    c.total_partners_count,
    c.approvals_count,
    formatCurrency(c.final_cost, c.currency),
    new Date(c.created_at).toLocaleDateString('ru-RU'),
    c.deadline ? new Date(c.deadline).toLocaleDateString('ru-RU') : '-'
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pitching_campaigns_${Date.now()}.csv`;
  link.click();
}
```

Это полный набор TypeScript типов, React hooks и утилит для интеграции системы питчинга на фронтенде! 🚀
