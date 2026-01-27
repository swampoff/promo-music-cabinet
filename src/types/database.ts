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