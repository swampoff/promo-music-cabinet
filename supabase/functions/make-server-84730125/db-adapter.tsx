/**
 * DATABASE ADAPTER
 * Автоматическое переключение между KV и SQL хранилищем
 */

import { getSupabaseClient } from './supabase-client.tsx';
import * as kv from './kv_store.tsx';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Supabase client - используем singleton
const supabase = getSupabaseClient();

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

// ============================================
// ARTISTS / PROFILES
// ============================================

export async function getArtistByUserId(userId: string) {
  if (STORAGE_MODE === 'sql') {
    // Для мигрированных данных ищем по id напрямую
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', userId)
      .single();

    // PGRST116 = no rows found - это нормально, вернём null
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message || 'Database error');
    }
    return data;
  } else {
    return await kv.get(`profile:${userId}`);
  }
}

export async function getArtistById(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } else {
    return await kv.get(`profile:${id}`);
  }
}

export async function updateArtist(id: string, updates: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('artists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const profile = await kv.get(`profile:${id}`);
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`profile:${id}`, updated);
    return updated;
  }
}

export async function getArtistByEmail(email: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } else {
    // In KV mode, we'd need to search all profiles - not efficient
    // For now, return null (no migration linking in KV mode)
    return null;
  }
}

export async function createArtist(artist: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('artists')
      .insert({
        ...artist,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const id = artist.id || `artist_${Date.now()}`;
    const newArtist = {
      ...artist,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await kv.set(`profile:${id}`, newArtist);
    return newArtist;
  }
}

export async function linkArtistToUser(oldArtistId: string, newUserId: string) {
  if (STORAGE_MODE === 'sql') {
    // Простой подход: возвращаем существующий профиль без изменения id
    // Пользователь будет использовать старый artist_id из миграции
    // Фронтенд будет получать профиль по email

    try {
      const { data: artist, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', oldArtistId)
        .single();

      if (error) throw new Error(`Artist not found: ${error.message}`);

      console.log(`Artist ${oldArtistId} found for email-based access. New auth user: ${newUserId}`);

      // Возвращаем существующий профиль - пользователь будет работать с ним
      // Auth user id != artist id, но это OK - связываем по email
      return artist;
    } catch (err: any) {
      throw new Error(`Link failed: ${err.message || err}`);
    }
  } else {
    // KV mode: just copy the profile with new id
    const oldProfile = await kv.get(`profile:${oldArtistId}`);
    if (!oldProfile) throw new Error('Profile not found');

    const newProfile = { ...oldProfile, id: newUserId, updated_at: new Date().toISOString() };
    await kv.set(`profile:${newUserId}`, newProfile);
    await kv.del(`profile:${oldArtistId}`);
    return newProfile;
  }
}

// ============================================
// TRACKS
// ============================================

export async function getTracks(artistId: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } else {
    return await kv.getByPrefix(`track:${artistId}:`);
  }
}

export async function getTrackById(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } else {
    // В KV нужно искать по всем артистам
    const allTracks = await kv.getByPrefix('track:');
    return allTracks.find(t => t.id === id);
  }
}

export async function createTrack(track: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('tracks')
      .insert(track)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const id = track.id || `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTrack = { ...track, id, created_at: new Date().toISOString() };
    await kv.set(`track:${track.artist_id}:${id}`, newTrack);
    return newTrack;
  }
}

export async function updateTrack(id: string, updates: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('tracks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const allTracks = await kv.getByPrefix('track:');
    const track = allTracks.find(t => t.id === id);
    if (!track) throw new Error('Track not found');

    const updated = { ...track, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`track:${track.artist_id}:${id}`, updated);
    return updated;
  }
}

export async function deleteTrack(id: string, artistId: string) {
  if (STORAGE_MODE === 'sql') {
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } else {
    await kv.del(`track:${artistId}:${id}`);
  }
}

export async function incrementTrackPlays(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { error } = await supabase.rpc('increment_track_plays', { track_uuid: id });
    if (error) {
      // Fallback: обычный update
      const { data: track } = await supabase.from('tracks').select('plays_count').eq('id', id).single();
      if (track) {
        await supabase.from('tracks').update({ plays_count: (track.plays_count || 0) + 1 }).eq('id', id);
      }
    }
  } else {
    const allTracks = await kv.getByPrefix('track:');
    const track = allTracks.find(t => t.id === id);
    if (track) {
      track.plays = (track.plays || 0) + 1;
      await kv.set(`track:${track.artist_id}:${id}`, track);
    }
  }
}

// ============================================
// VIDEOS
// ============================================

export async function getVideos(artistId: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } else {
    return await kv.getByPrefix(`video:${artistId}:`);
  }
}

export async function getVideoById(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } else {
    const allVideos = await kv.getByPrefix('video:');
    return allVideos.find(v => v.id === id);
  }
}

export async function createVideo(video: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const id = video.id || `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newVideo = { ...video, id, created_at: new Date().toISOString() };
    await kv.set(`video:${video.artist_id}:${id}`, newVideo);
    return newVideo;
  }
}

export async function updateVideo(id: string, updates: any) {
  if (STORAGE_MODE === 'sql') {
    const { data, error } = await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const allVideos = await kv.getByPrefix('video:');
    const video = allVideos.find(v => v.id === id);
    if (!video) throw new Error('Video not found');

    const updated = { ...video, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`video:${video.artist_id}:${id}`, updated);
    return updated;
  }
}

export async function deleteVideo(id: string, artistId: string) {
  if (STORAGE_MODE === 'sql') {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } else {
    await kv.del(`video:${artistId}:${id}`);
  }
}

export async function incrementVideoViews(id: string) {
  if (STORAGE_MODE === 'sql') {
    const { error } = await supabase.rpc('increment_video_views', { video_uuid: id });
    if (error) {
      // Fallback
      const { data: video } = await supabase.from('videos').select('views_count').eq('id', id).single();
      if (video) {
        await supabase.from('videos').update({ views_count: (video.views_count || 0) + 1 }).eq('id', id);
      }
    }
  } else {
    const allVideos = await kv.getByPrefix('video:');
    const video = allVideos.find(v => v.id === id);
    if (video) {
      video.views = (video.views || 0) + 1;
      await kv.set(`video:${video.artist_id}:${id}`, video);
    }
  }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(artistId: string) {
  if (STORAGE_MODE === 'sql') {
    // Получаем статистику из таблицы artists
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('total_plays, total_followers, coins_balance, total_coins_earned, total_coins_spent')
      .eq('id', artistId)
      .single();

    // Получаем количество треков
    const { count: tracksCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artistId);

    // Получаем количество видео
    const { count: videosCount } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artistId);

    // Суммируем прослушивания со всех треков
    const { data: tracksStats } = await supabase
      .from('tracks')
      .select('plays_count, likes_count')
      .eq('artist_id', artistId);

    const totalPlays = tracksStats?.reduce((sum, t) => sum + (t.plays_count || 0), 0) || 0;
    const totalLikes = tracksStats?.reduce((sum, t) => sum + (t.likes_count || 0), 0) || 0;

    return {
      totalPlays: artist?.total_plays || totalPlays,
      totalLikes,
      totalDownloads: 0,
      tracksCount: tracksCount || 0,
      videosCount: videosCount || 0,
      coinsBalance: artist?.coins_balance || 0,
      totalFollowers: artist?.total_followers || 0,
      donationsCount: 0,
      totalDonations: 0,
      updatedAt: new Date().toISOString()
    };
  } else {
    // KV mode - существующая логика
    const tracks = await kv.getByPrefix(`track:${artistId}:`);
    const videos = await kv.getByPrefix(`video:${artistId}:`);

    let totalPlays = 0;
    let totalLikes = 0;

    tracks.forEach(track => {
      totalPlays += track.plays || 0;
      totalLikes += track.likes || 0;
    });

    return {
      totalPlays,
      totalLikes,
      totalDownloads: 0,
      tracksCount: tracks.length,
      videosCount: videos.length,
      coinsBalance: 0,
      totalFollowers: 0,
      donationsCount: 0,
      totalDonations: 0,
      updatedAt: new Date().toISOString()
    };
  }
}