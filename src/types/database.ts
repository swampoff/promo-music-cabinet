// Database types for Supabase integration

export type TourDateStatus = 
  | 'draft' 
  | 'announced' 
  | 'on_sale' 
  | 'sold_out' 
  | 'cancelled' 
  | 'postponed' 
  | 'completed';

export type ModerationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type EventType = 
  | 'Концерт' 
  | 'Фестиваль' 
  | 'Клубное выступление' 
  | 'Арена шоу' 
  | 'Уличный концерт' 
  | 'Акустический сет' 
  | 'DJ сет' 
  | 'Другое';

export interface TourDate {
  id: string;
  artist_id: string;
  
  // Tour and event details
  tour_name?: string;
  title: string;
  description?: string;
  genre?: string;
  
  // Venue information
  venue_name: string;
  venue_id?: string;
  venue_address?: string;
  city: string;
  country: string;
  
  // Date and time
  date: string; // ISO date string
  doors_open?: string; // Time string HH:MM
  show_start: string; // Time string HH:MM
  
  // Ticketing
  ticket_url?: string;
  ticket_price_min?: number;
  ticket_price_max?: number;
  venue_capacity?: number;
  tickets_sold: number;
  
  // Event type and status
  event_type: EventType;
  status: TourDateStatus;
  
  // Moderation
  moderation_status: ModerationStatus;
  rejection_reason?: string;
  
  // Media
  banner_url?: string;
  photos?: string[];
  
  // Analytics
  views: number;
  clicks: number;
  
  // Promotion
  is_promoted: boolean;
  promotion_expires_at?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface PerformanceHistoryItem {
  id: string;
  event_name: string;
  venue_name: string;
  city: string;
  date: string; // ISO date string
  audience_size?: number;
  type: EventType;
  description?: string;
  photos?: string[];
}

export interface ArtistProfile {
  id: string;
  user_id: string;
  
  // Basic info
  display_name: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  
  // Location
  city?: string;
  country: string;
  studio_address?: string;
  
  // Social links
  social_links?: Record<string, string>;
  streaming_links?: Record<string, string>;
  
  // Genres and influences
  genres?: string[];
  influences?: string[];
  
  // EPK and riders
  epk_url?: string;
  tech_rider_url?: string;
  hospitality_rider_url?: string;
  
  // Performance history
  performance_history: PerformanceHistoryItem[];
  
  // Calendars
  release_calendar?: any[];
  events_calendar?: any[];
  
  // Stats
  total_streams: number;
  monthly_listeners: number;
  total_fans: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types for creating/updating
export interface CreateTourDateInput {
  tour_name?: string;
  title: string;
  description?: string;
  venue_name: string;
  venue_address?: string;
  city: string;
  country?: string;
  date: string;
  doors_open?: string;
  show_start: string;
  ticket_url?: string;
  ticket_price_min?: number;
  ticket_price_max?: number;
  venue_capacity?: number;
  event_type: EventType;
  banner_url?: string;
  genre?: string;
}

export interface UpdateTourDateInput extends Partial<CreateTourDateInput> {
  status?: TourDateStatus;
  moderation_status?: ModerationStatus;
  tickets_sold?: number;
  is_promoted?: boolean;
}

export interface CreatePerformanceHistoryInput {
  event_name: string;
  venue_name: string;
  city: string;
  date: string;
  audience_size?: number;
  type: EventType;
  description?: string;
  photos?: string[];
}

// ============================================
// TRACKS TYPES
// ============================================

export type TrackStatus = 'draft' | 'processing' | 'ready' | 'published' | 'archived';
export type TrackModerationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Track {
  id: string;
  artist_id: string;

  // Basic info
  title: string;
  description?: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  key?: string;
  duration: number; // in seconds

  // Files
  audio_url: string;
  cover_url?: string;
  waveform_data?: number[];

  // Status
  status: TrackStatus;
  moderation_status: TrackModerationStatus;
  rejection_reason?: string;

  // Release info
  release_date?: string;
  album_id?: string;
  album_name?: string;
  track_number?: number;

  // Streaming links
  spotify_url?: string;
  apple_music_url?: string;
  youtube_music_url?: string;
  soundcloud_url?: string;

  // Analytics
  plays: number;
  downloads: number;
  likes: number;
  shares: number;

  // Pitching
  is_pitched: boolean;
  pitched_playlists?: string[];

  // Promotion
  is_promoted: boolean;
  promotion_expires_at?: string;

  // Monetization
  price?: number;
  is_free: boolean;

  // Metadata
  tags?: string[];
  credits?: Record<string, string>;
  lyrics?: string;
  isrc?: string;
  upc?: string;

  created_at: string;
  updated_at: string;
}

export interface CreateTrackInput {
  title: string;
  description?: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  key?: string;
  duration: number;
  audio_url: string;
  cover_url?: string;
  release_date?: string;
  tags?: string[];
  is_free?: boolean;
  price?: number;
  lyrics?: string;
  credits?: Record<string, string>;
}

export interface UpdateTrackInput extends Partial<CreateTrackInput> {
  status?: TrackStatus;
  moderation_status?: TrackModerationStatus;
  is_pitched?: boolean;
  is_promoted?: boolean;
}

// ============================================
// VIDEO TYPES
// ============================================

export type VideoType = 'music_video' | 'live_performance' | 'behind_scenes' | 'interview' | 'lyric_video' | 'visualizer' | 'other';
export type VideoStatus = 'draft' | 'processing' | 'ready' | 'published' | 'archived';

export interface Video {
  id: string;
  artist_id: string;

  // Basic info
  title: string;
  description?: string;
  video_type: VideoType;
  duration: number; // in seconds

  // Files
  video_url: string;
  thumbnail_url?: string;

  // External links
  youtube_url?: string;
  rutube_url?: string;
  vk_video_url?: string;

  // Status
  status: VideoStatus;
  moderation_status: TrackModerationStatus;

  // Analytics
  views: number;
  likes: number;
  comments: number;
  shares: number;

  // Promotion
  is_promoted: boolean;
  promotion_expires_at?: string;

  // Related
  track_id?: string;

  // Metadata
  tags?: string[];

  created_at: string;
  updated_at: string;
}

export interface CreateVideoInput {
  title: string;
  description?: string;
  video_type: VideoType;
  duration: number;
  video_url: string;
  thumbnail_url?: string;
  youtube_url?: string;
  rutube_url?: string;
  track_id?: string;
  tags?: string[];
}

export interface UpdateVideoInput extends Partial<CreateVideoInput> {
  status?: VideoStatus;
  moderation_status?: TrackModerationStatus;
  is_promoted?: boolean;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | 'system'           // Системные уведомления
  | 'moderation'       // Статус модерации
  | 'achievement'      // Достижения
  | 'analytics'        // Аналитика (новые слушатели, просмотры)
  | 'promotion'        // Продвижение
  | 'payment'          // Платежи
  | 'subscription'     // Подписка
  | 'concert'          // Концерты
  | 'release'          // Релизы
  | 'collaboration';   // Коллаборации

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;

  // Content
  type: NotificationType;
  title: string;
  message: string;

  // Priority and status
  priority: NotificationPriority;
  is_read: boolean;

  // Related entity
  entity_type?: 'track' | 'video' | 'concert' | 'payment' | 'profile';
  entity_id?: string;

  // Action
  action_url?: string;
  action_label?: string;

  // Metadata
  metadata?: Record<string, any>;

  // Timestamps
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;

  // By type
  system: boolean;
  moderation: boolean;
  achievement: boolean;
  analytics: boolean;
  promotion: boolean;
  payment: boolean;
  subscription: boolean;
  concert: boolean;
  release: boolean;
  collaboration: boolean;

  // Digest settings
  daily_digest: boolean;
  weekly_digest: boolean;
}

// ============================================
// PAYMENT & SUBSCRIPTION TYPES
// ============================================

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'yookassa' | 'sbp' | 'crypto';

export interface Subscription {
  id: string;
  user_id: string;

  // Plan details
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  // Billing
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';

  // Dates
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at?: string;

  // Trial
  trial_ends_at?: string;
  is_trial: boolean;

  // Features
  features: string[];
  limits: {
    tracks_per_month: number;
    videos_per_month: number;
    storage_gb: number;
    analytics_days: number;
    promotions_per_month: number;
  };

  // Payment
  payment_method?: PaymentMethod;
  last_payment_id?: string;

  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id?: string;

  // Amount
  amount: number;
  currency: string;

  // Status
  status: PaymentStatus;

  // Method
  payment_method: PaymentMethod;
  external_payment_id?: string;

  // Details
  description: string;
  receipt_url?: string;

  // Refund
  refund_amount?: number;
  refunded_at?: string;
  refund_reason?: string;

  // Timestamps
  created_at: string;
  completed_at?: string;
}

export interface CreatePaymentInput {
  amount: number;
  currency?: string;
  payment_method: PaymentMethod;
  description: string;
  subscription_id?: string;
}