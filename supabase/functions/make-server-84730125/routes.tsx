import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import * as db from './db-adapter.tsx';

const routes = new Hono();

// ============================================
// TRACKS API (SQL + KV fallback)
// ============================================

// Get all tracks for current user
routes.get('/tracks', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';

    // Используем db-adapter который автоматически выбирает KV или SQL
    const tracks = await db.getTracks(userId);

    // Преобразуем данные из SQL формата в формат фронтенда
    const formattedTracks = tracks.map((t: any) => ({
      id: t.id,
      title: t.title || '',
      cover_url: t.cover_url || null,
      audio_url: t.audio_url || null,
      genre: t.genre || '',
      description: t.description || '',
      tags: t.tags || [],
      release_year: t.release_year || new Date().getFullYear(),
      label: t.label || '',
      artist_name: t.artist_name || '',
      artist_id: t.artist_id,
      duration: t.duration || '0:00',
      play_count: t.plays_count || t.plays || 0,
      like_count: t.likes_count || t.likes || 0,
      status: t.status || 'draft',
      rejection_reason: t.rejection_reason || null,
      is_promoted: t.is_promoted || false,
      created_at: t.created_at,
      updated_at: t.updated_at,
      credits: t.credits || {},
      rights: t.rights || {},
    }));

    return c.json({ success: true, data: formattedTracks });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single track by ID
routes.get('/tracks/:id', async (c) => {
  try {
    const trackId = c.req.param('id');

    const track = await db.getTrackById(trackId);

    if (!track) {
      return c.json({ success: false, error: 'Track not found' }, 404);
    }

    return c.json({ success: true, data: track });
  } catch (error) {
    console.error('Error fetching track:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new track
routes.post('/tracks', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();

    const trackData = {
      artist_id: userId,
      title: body.title,
      description: body.description || null,
      genre: body.genre || null,
      tags: body.tags || [],
      release_year: body.release_year || new Date().getFullYear(),
      label: body.label || null,
      artist_name: body.artist_name || null,
      audio_url: body.audio_url || null,
      cover_url: body.cover_url || null,
      duration: body.duration || null,
      status: body.status || 'draft',
      plays_count: 0,
      likes_count: 0,
      shares_count: 0,
    };

    const track = await db.createTrack(trackData);

    console.log(`Track created: ${track.id}`);
    return c.json({ success: true, data: track }, 201);
  } catch (error) {
    console.error('Error creating track:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update track
routes.put('/tracks/:id', async (c) => {
  try {
    const trackId = c.req.param('id');
    const body = await c.req.json();

    const track = await db.updateTrack(trackId, body);

    if (!track) {
      return c.json({ success: false, error: 'Track not found' }, 404);
    }

    console.log(`Track updated: ${trackId}`);
    return c.json({ success: true, data: track });
  } catch (error) {
    console.error('Error updating track:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete track
routes.delete('/tracks/:id', async (c) => {
  try {
    const trackId = c.req.param('id');
    const userId = c.req.header('X-User-Id') || 'demo-user';

    await db.deleteTrack(trackId, userId);

    console.log(`Track deleted: ${trackId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting track:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ANALYTICS API
// ============================================

// Get track analytics
routes.get('/analytics/track/:id', async (c) => {
  try {
    const trackId = c.req.param('id');
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const key = `analytics:${userId}:track:${trackId}`;
    
    const analytics = await kv.get(key);
    
    if (!analytics) {
      // Return default analytics if not found
      return c.json({ 
        success: true, 
        data: {
          trackId,
          plays: 0,
          likes: 0,
          downloads: 0,
          shares: 0,
          comments: 0,
          dailyStats: []
        }
      });
    }
    
    return c.json({ success: true, data: JSON.parse(analytics) });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Increment track play count
routes.post('/analytics/track/:id/play', async (c) => {
  try {
    const trackId = c.req.param('id');

    // Используем db-adapter для инкремента прослушиваний
    await db.incrementTrackPlays(trackId);

    // Получаем обновленный трек для ответа
    const track = await db.getTrackById(trackId);

    console.log(`Track play recorded: ${trackId}`);
    return c.json({
      success: true,
      data: {
        trackId,
        plays: track?.plays_count || track?.plays || 1,
      }
    });
  } catch (error) {
    console.error('Error recording play:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CONCERTS API
// ============================================

// Get all concerts
routes.get('/concerts', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const concerts = await kv.getByPrefix(`concert:${userId}:`);
    
    // If no concerts, return empty array
    if (!concerts || concerts.length === 0) {
      return c.json({ 
        success: true, 
        data: [] 
      });
    }
    
    return c.json({ 
      success: true, 
      data: concerts.map(c => typeof c === 'string' ? JSON.parse(c) : c) 
    });
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create concert
routes.post('/concerts', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    
    const concertId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const concert = {
      id: concertId,
      ...body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const key = `concert:${userId}:${concertId}`;
    await kv.set(key, JSON.stringify(concert));
    
    console.log(`Concert created: ${key}`);
    return c.json({ success: true, data: concert }, 201);
  } catch (error) {
    console.error('Error creating concert:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// VIDEOS API (SQL + KV fallback)
// ============================================

// Get all videos
routes.get('/videos', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';

    const videos = await db.getVideos(userId);

    // Преобразуем данные из SQL формата
    const formattedVideos = videos.map((v: any) => ({
      id: v.id,
      title: v.title || '',
      description: v.description || '',
      video_url: v.video_url || v.youtube_url || null,
      youtube_url: v.youtube_url || null,
      thumbnail_url: v.thumbnail_url || null,
      artist_id: v.artist_id,
      duration: v.duration || null,
      views_count: v.views_count || v.views || 0,
      likes_count: v.likes_count || v.likes || 0,
      status: v.status || 'draft',
      created_at: v.created_at,
      updated_at: v.updated_at,
    }));

    return c.json({ success: true, data: formattedVideos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single video
routes.get('/videos/:id', async (c) => {
  try {
    const videoId = c.req.param('id');
    const video = await db.getVideoById(videoId);

    if (!video) {
      return c.json({ success: false, error: 'Video not found' }, 404);
    }

    return c.json({ success: true, data: video });
  } catch (error) {
    console.error('Error fetching video:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create video
routes.post('/videos', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();

    const videoData = {
      artist_id: userId,
      title: body.title,
      description: body.description || null,
      video_url: body.video_url || null,
      youtube_url: body.youtube_url || null,
      thumbnail_url: body.thumbnail_url || null,
      duration: body.duration || null,
      status: body.status || 'draft',
      views_count: 0,
      likes_count: 0,
      shares_count: 0,
    };

    const video = await db.createVideo(videoData);

    console.log(`Video created: ${video.id}`);
    return c.json({ success: true, data: video }, 201);
  } catch (error) {
    console.error('Error creating video:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update video
routes.put('/videos/:id', async (c) => {
  try {
    const videoId = c.req.param('id');
    const body = await c.req.json();

    const video = await db.updateVideo(videoId, body);

    if (!video) {
      return c.json({ success: false, error: 'Video not found' }, 404);
    }

    console.log(`Video updated: ${videoId}`);
    return c.json({ success: true, data: video });
  } catch (error) {
    console.error('Error updating video:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete video
routes.delete('/videos/:id', async (c) => {
  try {
    const videoId = c.req.param('id');
    const userId = c.req.header('X-User-Id') || 'demo-user';

    await db.deleteVideo(videoId, userId);

    console.log(`Video deleted: ${videoId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// NEWS API
// ============================================

// Get all news
routes.get('/news', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const news = await kv.getByPrefix(`news:${userId}:`);
    
    // If no news, return empty array
    if (!news || news.length === 0) {
      return c.json({ 
        success: true, 
        data: [] 
      });
    }
    
    return c.json({ 
      success: true, 
      data: news.map(n => typeof n === 'string' ? JSON.parse(n) : n) 
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create news
routes.post('/news', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    
    const newsId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newsItem = {
      id: newsId,
      ...body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    
    const key = `news:${userId}:${newsId}`;
    await kv.set(key, JSON.stringify(newsItem));
    
    console.log(`News created: ${key}`);
    return c.json({ success: true, data: newsItem }, 201);
  } catch (error) {
    console.error('Error creating news:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// DONATIONS API
// ============================================

// Get all donations
routes.get('/donations', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const donations = await kv.getByPrefix(`donation:${userId}:`);
    
    // If no donations, return empty array
    if (!donations || donations.length === 0) {
      return c.json({ 
        success: true, 
        data: [] 
      });
    }
    
    return c.json({ 
      success: true, 
      data: donations.map(d => typeof d === 'string' ? JSON.parse(d) : d) 
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create donation
routes.post('/donations', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    
    const donationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const donation = {
      id: donationId,
      ...body,
      artistId: userId,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    
    const key = `donation:${userId}:${donationId}`;
    await kv.set(key, JSON.stringify(donation));
    
    console.log(`Donation created: ${key}`);
    return c.json({ success: true, data: donation }, 201);
  } catch (error) {
    console.error('Error creating donation:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// COINS API
// ============================================

// Get user coins balance
routes.get('/coins/balance', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const key = `coins:balance:${userId}`;
    
    const balance = await kv.get(key);
    
    return c.json({ 
      success: true, 
      data: { 
        balance: balance ? parseInt(balance) : 0,
        userId 
      }
    });
  } catch (error) {
    console.error('Error fetching coins balance:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get coins transactions
routes.get('/coins/transactions', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const transactions = await kv.getByPrefix(`coins:tx:${userId}:`);
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return c.json({ 
        success: true, 
        data: [] 
      });
    }
    
    return c.json({ 
      success: true, 
      data: transactions.map(t => typeof t === 'string' ? JSON.parse(t) : t) 
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add coins transaction
routes.post('/coins/transactions', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    
    const txId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      id: txId,
      userId,
      ...body,
      createdAt: new Date().toISOString()
    };
    
    // Save transaction
    const txKey = `coins:tx:${userId}:${txId}`;
    await kv.set(txKey, JSON.stringify(transaction));
    
    // Update balance
    const balanceKey = `coins:balance:${userId}`;
    const currentBalance = await kv.get(balanceKey);
    const newBalance = (currentBalance ? parseInt(currentBalance) : 0) + (body.amount || 0);
    await kv.set(balanceKey, String(newBalance));
    
    console.log(`Coins transaction created: ${txKey}, new balance: ${newBalance}`);
    return c.json({ success: true, data: { transaction, balance: newBalance } }, 201);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PROFILE API (SQL + KV fallback)
// ============================================

// Get user profile
routes.get('/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';

    const artist = await db.getArtistByUserId(userId);

    if (!artist) {
      // Возвращаем дефолтный профиль если не найден
      return c.json({
        success: true,
        data: {
          id: userId,
          user_id: userId,
          username: 'demo',
          full_name: 'Demo Artist',
          email: null,
          avatar_url: null,
          bio: null,
          city: null,
          total_plays: 0,
          total_followers: 0,
          coins_balance: 0,
        }
      });
    }

    // Преобразуем данные из SQL формата
    const profile = {
      id: artist.id,
      user_id: artist.user_id || artist.id,
      username: artist.username || '',
      full_name: artist.full_name || '',
      email: artist.email || null,
      avatar_url: artist.avatar_url || null,
      cover_url: artist.cover_url || null,
      bio: artist.bio || null,
      city: artist.city || null,
      country: artist.country || null,
      website: artist.website || null,
      social_links: artist.social_links || {},
      streaming_links: artist.streaming_links || {},
      total_plays: artist.total_plays || 0,
      total_followers: artist.total_followers || 0,
      coins_balance: artist.coins_balance || 0,
      total_coins_earned: artist.total_coins_earned || 0,
      total_coins_spent: artist.total_coins_spent || 0,
      created_at: artist.created_at,
      updated_at: artist.updated_at,
    };

    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create or link profile (for new signups and migrated users)
routes.post('/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    const email = body.email?.toLowerCase().trim();

    // 1. Check if user already has a profile
    const existingProfile = await db.getArtistByUserId(userId);
    if (existingProfile) {
      console.log(`Profile already exists for user: ${userId}`);
      return c.json({ success: true, data: existingProfile });
    }

    // 2. Check if there's a migrated artist with the same email
    if (email) {
      const migratedArtist = await db.getArtistByEmail(email);
      if (migratedArtist) {
        // Link migrated profile to new auth user by updating the id
        console.log(`Linking migrated artist ${migratedArtist.id} to new user ${userId}`);

        // Update the artist record with the new user's id
        const linkedProfile = await db.linkArtistToUser(migratedArtist.id, userId);

        return c.json({
          success: true,
          data: linkedProfile,
          message: 'Profile linked from migrated account'
        });
      }
    }

    // 3. Create new profile
    const newProfile = await db.createArtist({
      id: userId,
      email: email,
      username: body.username || email?.split('@')[0] || `user_${Date.now()}`,
      full_name: body.full_name || body.name || '',
    });

    console.log(`New profile created: ${userId}`);
    return c.json({ success: true, data: newProfile }, 201);
  } catch (error) {
    console.error('Error creating/linking profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update user profile
routes.put('/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();

    // Сначала получаем текущий профиль чтобы найти id
    const existingArtist = await db.getArtistByUserId(userId);

    if (!existingArtist) {
      return c.json({ success: false, error: 'Profile not found' }, 404);
    }

    const profile = await db.updateArtist(existingArtist.id, body);

    console.log(`Profile updated: ${existingArtist.id}`);
    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// STATS API (Dashboard) - SQL + KV fallback
// ============================================

// Get dashboard stats
routes.get('/stats/dashboard', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';

    // Используем db-adapter для получения статистики
    const stats = await db.getDashboardStats(userId);

    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default routes;