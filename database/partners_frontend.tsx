/**
 * PROMO.MUSIC - PARTNERS MANAGEMENT FRONTEND INTEGRATION
 * Примеры интеграции API управления партнерами
 */

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Partner {
  id: number;
  uuid: string;
  name: string;
  legal_name?: string;
  slug: string;
  category: 'radio' | 'playlist' | 'blogger' | 'media' | 'venue' | 'label' | 'agency' | 'studio';
  subcategory?: string;
  logo_url?: string;
  banner_url?: string;
  gallery?: string[];
  email: string;
  phone?: string;
  website?: string;
  social_links?: {
    instagram?: string;
    vk?: string;
    youtube?: string;
    telegram?: string;
    facebook?: string;
    twitter?: string;
  };
  country: string;
  city?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  short_description?: string;
  pitch_guidelines?: string;
  about_audience?: string;
  audience_size: number;
  monthly_reach: number;
  audience_demographics?: {
    age_18_24?: number;
    age_25_34?: number;
    age_35_44?: number;
    age_45_plus?: number;
    male?: number;
    female?: number;
  };
  genres: string[];
  languages: string[];
  status: 'pending' | 'active' | 'blocked' | 'suspended' | 'archived' | 'on_hold';
  verified: boolean;
  premium: boolean;
  featured: boolean;
  base_price: number;
  price_range_min: number;
  price_range_max: number;
  currency: string;
  rating: number;
  reviews_count: number;
  response_quality_rating: number;
  professionalism_rating: number;
  value_for_money_rating: number;
  total_orders: number;
  completed_orders: number;
  approval_rate: number;
  average_response_time_hours: number;
  working_hours?: Record<string, string>;
  is_available: boolean;
  tags?: string[];
  created_at: string;
}

export interface PartnerService {
  id: number;
  uuid: string;
  partner_id: number;
  service_name: string;
  service_type: 'airplay' | 'playlist_placement' | 'review' | 'interview' | 'live_performance' | 'production';
  description?: string;
  price: number;
  currency: string;
  discount_percentage: number;
  duration_days?: number;
  guaranteed_plays?: number;
  guaranteed_reach?: number;
  delivery_time_days?: number;
  is_active: boolean;
  is_popular: boolean;
  total_orders: number;
}

export interface PartnerReview {
  id: number;
  uuid: string;
  partner_id: number;
  user_id: number;
  overall_rating: number;
  response_quality_rating?: number;
  professionalism_rating?: number;
  value_for_money_rating?: number;
  communication_rating?: number;
  review_title?: string;
  review_text?: string;
  pros?: string;
  cons?: string;
  would_recommend?: boolean;
  is_verified_purchase: boolean;
  helpful_count: number;
  not_helpful_count: number;
  partner_response?: string;
  partner_responded_at?: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  created_at: string;
}

export interface PartnerPayout {
  id: number;
  uuid: string;
  partner_id: number;
  amount: number;
  currency: string;
  period_start: string;
  period_end: string;
  total_orders: number;
  commission_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payout_method?: string;
  transaction_id?: string;
  created_at: string;
  processed_at?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

class PartnersAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data.data;
  }

  // ========== PUBLIC METHODS ==========

  async getPartners(params: {
    category?: string;
    country?: string;
    city?: string;
    verified?: boolean;
    premium?: boolean;
    price_min?: number;
    price_max?: number;
    rating_min?: number;
    genres?: string[];
    search?: string;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ partners: Partner[]; pagination: any }>(`/partners?${query}`);
  }

  async getPartner(id: number) {
    return this.request<Partner>(`/partners/${id}`);
  }

  async getPartnerBySlug(slug: string) {
    return this.request<Partner>(`/partners/slug/${slug}`);
  }

  async searchPartners(q: string, limit = 50) {
    return this.request<{ results: Partner[]; total: number }>(`/partners/search?q=${q}&limit=${limit}`);
  }

  async getFeaturedPartners() {
    return this.request<{ partners: Partner[] }>('/partners/featured');
  }

  async getTopPartners(category?: string, limit = 20) {
    const query = new URLSearchParams({ category: category || '', limit: String(limit) }).toString();
    return this.request<{ partners: Partner[] }>(`/partners/top?${query}`);
  }

  // ========== PARTNER CABINET ==========

  async getPartnerProfile() {
    return this.request<Partner>('/partner/me');
  }

  async updatePartnerProfile(data: Partial<Partner>) {
    return this.request<Partner>('/partner/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);

    return fetch(`${this.baseURL}/partner/me/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    }).then(res => res.json());
  }

  async updateAvailability(is_available: boolean, notes?: string) {
    return this.request('/partner/me/availability', {
      method: 'PATCH',
      body: JSON.stringify({ is_available, availability_notes: notes }),
    });
  }

  // ========== SERVICES ==========

  async getPartnerServices(partnerId: number) {
    return this.request<{ services: PartnerService[] }>(`/partners/${partnerId}/services`);
  }

  async createService(data: Partial<PartnerService>) {
    return this.request<PartnerService>('/partner/me/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: number, data: Partial<PartnerService>) {
    return this.request(`/partner/me/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: number) {
    return this.request(`/partner/me/services/${id}`, { method: 'DELETE' });
  }

  // ========== REVIEWS ==========

  async getPartnerReviews(partnerId: number, params: { limit?: number; offset?: number; sort_by?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ reviews: PartnerReview[]; pagination: any; summary: any }>(`/partners/${partnerId}/reviews?${query}`);
  }

  async createReview(partnerId: number, data: {
    order_id?: number;
    overall_rating: number;
    review_title?: string;
    review_text?: string;
    pros?: string;
    cons?: string;
    response_quality_rating?: number;
    professionalism_rating?: number;
    value_for_money_rating?: number;
    communication_rating?: number;
    would_recommend?: boolean;
  }) {
    return this.request(`/partners/${partnerId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async respondToReview(reviewId: number, response: string) {
    return this.request(`/partner/me/reviews/${reviewId}/response`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    });
  }

  async markReviewHelpful(partnerId: number, reviewId: number, isHelpful: boolean) {
    return this.request(`/partners/${partnerId}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ is_helpful: isHelpful }),
    });
  }

  // ========== PAYOUTS ==========

  async getPayouts(params: { status?: string; limit?: number; offset?: number } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ payouts: PartnerPayout[]; pagination: any; summary: any }>(`/partner/me/payouts?${query}`);
  }

  async requestPayout(data: { amount: number; payout_method: string; payout_details: any }) {
    return this.request('/partner/me/payouts/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBalance() {
    return this.request<{
      balance: number;
      pending_payout: number;
      total_earned: number;
      available_for_payout: number;
    }>('/partner/me/balance');
  }

  // ========== ADMIN ==========

  async adminGetPartners(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ partners: Partner[]; pagination: any; statistics: any }>(`/admin/partners?${query}`);
  }

  async adminCreatePartner(data: Partial<Partner>) {
    return this.request('/admin/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminModeratePartner(id: number, status: string, notes?: string) {
    return this.request(`/admin/partners/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ moderation_status: status, moderation_notes: notes }),
    });
  }

  async adminVerifyPartner(id: number) {
    return this.request(`/admin/partners/${id}/verify`, { method: 'PATCH' });
  }

  async adminSetPremium(id: number, premium: boolean) {
    return this.request(`/admin/partners/${id}/premium`, {
      method: 'PATCH',
      body: JSON.stringify({ premium }),
    });
  }

  async adminSetFeatured(id: number, featured: boolean) {
    return this.request(`/admin/partners/${id}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ featured }),
    });
  }

  async adminGetStatistics() {
    return this.request('/admin/partners/statistics');
  }
}

export const partnersAPI = new PartnersAPI();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function usePartners(filters: any = {}) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await partnersAPI.getPartners(filters);
      setPartners(data.partners);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return { partners, pagination, loading, error, refetch: fetchPartners };
}

export function usePartner(id: number) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    partnersAPI.getPartner(id)
      .then(data => {
        setPartner(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { partner, loading, error };
}

export function usePartnerServices(partnerId: number) {
  const [services, setServices] = useState<PartnerService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partnersAPI.getPartnerServices(partnerId)
      .then(data => setServices(data.services))
      .finally(() => setLoading(false));
  }, [partnerId]);

  return { services, loading };
}

export function usePartnerReviews(partnerId: number, params: any = {}) {
  const [reviews, setReviews] = useState<PartnerReview[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await partnersAPI.getPartnerReviews(partnerId, params);
      setReviews(data.reviews);
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  }, [partnerId, params]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, summary, loading, refetch: fetchReviews };
}

// ============================================================================
// EXAMPLE COMPONENTS
// ============================================================================

export function PartnerCardExample({ partner }: { partner: Partner }) {
  return (
    <div className="partner-card">
      <img src={partner.logo_url || '/default-logo.png'} alt={partner.name} />
      <h3>{partner.name}</h3>
      <p>{partner.short_description}</p>
      <div className="details">
        <span className="category">{partner.category}</span>
        <span className="location">{partner.city}, {partner.country}</span>
      </div>
      <div className="rating">
        ⭐ {partner.rating} ({partner.reviews_count} отзывов)
      </div>
      <div className="price">
        От {partner.base_price} {partner.currency}
      </div>
      {partner.verified && <span className="badge verified">✓ Проверен</span>}
      {partner.premium && <span className="badge premium">👑 Premium</span>}
    </div>
  );
}

export function PartnersListExample() {
  const { partners, loading, error } = usePartners({ verified: true, limit: 20 });

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="partners-grid">
      {partners.map(partner => (
        <PartnerCardExample key={partner.id} partner={partner} />
      ))}
    </div>
  );
}

export function PartnerReviewsExample({ partnerId }: { partnerId: number }) {
  const { reviews, summary, loading } = usePartnerReviews(partnerId);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="reviews-section">
      <div className="summary">
        <h3>Рейтинг: {summary?.average_rating}⭐</h3>
        <p>Всего отзывов: {summary?.total_reviews}</p>
      </div>
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review">
            <div className="rating">{review.overall_rating}⭐</div>
            <h4>{review.review_title}</h4>
            <p>{review.review_text}</p>
            <div className="author">{review.reviewer_name}</div>
            <div className="date">{new Date(review.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default partnersAPI;
