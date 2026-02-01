/**
 * Database Adapter
 * Слой адаптера между SQL и KV store
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv-utils.tsx'; // Use kv-utils with retry logic

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Supabase client - используем singleton
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage mode: 'kv' or 'sql'
const STORAGE_MODE = Deno.env.get('STORAGE_MODE') || 'kv';

console.log(`🗄️ Database Adapter initialized in ${STORAGE_MODE.toUpperCase()} mode`);

// ============================================
// CONCERTS
// ============================================

export async function getConcerts(artistId?: string) {
  if (STORAGE_MODE === 'sql') {
    let query = supabase.from('concerts').select('*');
    
    if (artistId) {
      query = query.eq('artist_id', artistId);
    }
    
    const { data, error } = await query.order('event_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } else {
    // KV Store mode
    const allConcerts = await kv.getByPrefix('concert:');
    return artistId 
      ? allConcerts.filter(c => c.artist_id === artistId)
      : allConcerts;
  }
}

export async function getConcertById(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } else {
    return await kv.get(`concert:${id}`);
  }
}

export async function createConcert(concert: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('concerts')
      .insert(concert)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const id = concert.id || `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConcert = { ...concert, id };
    await kv.set(`concert:${id}`, newConcert);
    return newConcert;
  }
}

export async function updateConcert(id: string, updates: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('concerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const concert = await kv.get(`concert:${id}`);
    if (!concert) throw new Error('Concert not found');
    
    const updated = { ...concert, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`concert:${id}`, updated);
    return updated;
  }
}

export async function deleteConcert(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { error } = await supabase
      .from('concerts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } else {
    await kv.del(`concert:${id}`);
  }
}

export async function incrementConcertViews(id: string) {
  if (STORAGE_MODE === 'sql') {
    // Use PostgreSQL function for atomic increment
    const { error } = await supabase.rpc('increment_concert_views', {
      concert_uuid: id
    });
    
    if (error) throw error;
  } else {
    const concert = await kv.get(`concert:${id}`);
    if (concert) {
      concert.views_count = (concert.views_count || 0) + 1;
      await kv.set(`concert:${id}`, concert);
    }
  }
}

export async function incrementConcertClicks(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { error } = await supabase.rpc('increment_concert_clicks', {
      concert_uuid: id
    });
    
    if (error) throw error;
  } else {
    const concert = await kv.get(`concert:${id}`);
    if (concert) {
      concert.clicks_count = (concert.clicks_count || 0) + 1;
      await kv.set(`concert:${id}`, concert);
    }
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function getNotifications(userId: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } else {
    return await kv.getByPrefix(`notification:${userId}:`);
  }
}

export async function createNotification(notification: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const id = notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotif = { ...notification, id };
    await kv.set(`notification:${notification.user_id}:${id}`, newNotif);
    return newNotif;
  }
}

export async function deleteNotification(userId: string, notificationId: string) {
  if (STORAGE_MODE === 'sql') {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);
    
    if (error) throw error;
  } else {
    await kv.del(`notification:${userId}:${notificationId}`);
  }
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================

export async function getNotificationSettings(userId: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found"
    return data;
  } else {
    return await kv.get(`notification_settings:${userId}`);
  }
}

export async function upsertNotificationSettings(userId: string, settings: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({ user_id: userId, ...settings })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    await kv.set(`notification_settings:${userId}`, { user_id: userId, ...settings });
    return { user_id: userId, ...settings };
  }
}

// ============================================
// EMAIL CAMPAIGNS
// ============================================

export async function getCampaigns(artistId: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } else {
    return await kv.getByPrefix(`campaign:${artistId}:`);
  }
}

export async function createCampaign(campaign: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaign)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const id = campaign.id || `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCampaign = { ...campaign, id };
    await kv.set(`campaign:${campaign.artist_id}:${id}`, newCampaign);
    return newCampaign;
  }
}

export async function updateCampaign(artistId: string, campaignId: string, updates: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', campaignId)
      .eq('artist_id', artistId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const campaign = await kv.get(`campaign:${artistId}:${campaignId}`);
    if (!campaign) throw new Error('Campaign not found');
    
    const updated = { ...campaign, ...updates };
    await kv.set(`campaign:${artistId}:${campaignId}`, updated);
    return updated;
  }
}

// ============================================
// TICKET SALES
// ============================================

export async function getTicketSales(concertId: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('ticket_sales')
      .select('*')
      .eq('concert_id', concertId)
      .order('purchased_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } else {
    return await kv.getByPrefix(`ticket_sale:${concertId}:`);
  }
}

export async function createTicketSale(sale: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('ticket_sales')
      .insert(sale)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const id = sale.id || `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSale = { ...sale, id };
    await kv.set(`ticket_sale:${sale.concert_id}:${id}`, newSale);
    return newSale;
  }
}

export async function updateTicketSale(concertId: string, saleId: string, updates: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('ticket_sales')
      .update(updates)
      .eq('id', saleId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const sale = await kv.get(`ticket_sale:${concertId}:${saleId}`);
    if (!sale) throw new Error('Sale not found');
    
    const updated = { ...sale, ...updates };
    await kv.set(`ticket_sale:${concertId}:${saleId}`, updated);
    return updated;
  }
}

// ============================================
// ANALYTICS
// ============================================

export async function getConcertAnalytics(concertId?: string) {
  if (STORAGE_MODE === 'sql') {
    let query = supabase.from('concert_analytics').select('*');
    
    if (concertId) {
      query = query.eq('id', concertId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } else {
    // Calculate analytics from KV data
    const concerts = concertId 
      ? [await kv.get(`concert:${concertId}`)].filter(Boolean)
      : await kv.getByPrefix('concert:');
    
    return Promise.all(concerts.map(async (concert) => {
      const sales = await kv.getByPrefix(`ticket_sale:${concert.id}:`);
      const confirmedSales = sales.filter(s => s.status === 'confirmed');
      
      return {
        id: concert.id,
        artist_id: concert.artist_id,
        title: concert.title,
        city: concert.city,
        event_date: concert.event_date,
        views_count: concert.views_count || 0,
        clicks_count: concert.clicks_count || 0,
        is_promoted: concert.is_promoted,
        total_tickets_sold: confirmedSales.reduce((sum, s) => sum + s.quantity, 0),
        total_revenue: confirmedSales.reduce((sum, s) => sum + s.total_amount, 0),
        net_revenue: confirmedSales.reduce((sum, s) => sum + s.net_amount, 0),
        total_commission: confirmedSales.reduce((sum, s) => sum + s.commission_amount, 0),
        click_through_rate: concert.views_count > 0 
          ? (concert.clicks_count / concert.views_count) * 100 
          : 0,
        conversion_rate: concert.clicks_count > 0 
          ? (confirmedSales.length / concert.clicks_count) * 100 
          : 0,
      };
    }));
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getStorageMode() {
  return STORAGE_MODE;
}

export function isSQLMode() {
  return STORAGE_MODE === 'sql';
}

export function isKVMode() {
  return STORAGE_MODE === 'kv';
}

// Export supabase client for direct queries when needed
export { supabase };