import { Hono } from 'npm:hono@4';
import * as kv from './kv-utils.tsx'; // Use kv-utils with retry logic

const app = new Hono();

// ============================================
// TRACKS API
// ============================================

// Get all tracks for current user
app.get('/tracks', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const tracks = await kv.getByPrefix(`track:${userId}:`);
    
    // If no tracks, return empty array
    if (!tracks || tracks.length === 0) {
      return c.json({ 
        success: true, 
        data: [] 
      });
    }
    
    return c.json({ 
      success: true, 
      data: tracks.map(t => typeof t === 'string' ? JSON.parse(t) : t) 
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single track by ID
app.get('/tracks/:id', async (c) => {
  try {
    const trackId = c.req.param('id');
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const key = `track:${userId}:${trackId}`;
    
    const track = await kv.get(key);
    
    if (!track) {
      return c.json({ success: false, error: 'Track not found' }, 404);
    }
    
    return c.json({ success: true, data: JSON.parse(track) });
  } catch (error) {
    console.error('Error fetching track:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new track
app.post('/tracks', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    
    const trackId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const track = {
      id: trackId,
      ...body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plays: 0,
      likes: 0,
      downloads: 0
    };
    
    const key = `track:${userId}:${trackId}`;
    await kv.set(key, JSON.stringify(track));
    
    console.log(`Track created: ${key}`);
    return c.json({ success: true, data: track }, 201);
  } catch (error) {
    console.error('Error creating track:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update track
app.put('/tracks/:id', async (c) => {
  try {
    const trackId = c.req.param('id');
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const key = `track:${userId}:${trackId}`;
    
    const existing = await kv.get(key);
    if (!existing) {
      return c.json({ success: false, error: 'Track not found' }, 404);
    }
    
    const body = await c.req.json();
    const track = {
      ...JSON.parse(existing),
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(key, JSON.stringify(track));
    
    console.log(`Track updated: ${key}`);
    return c.json({ success: true, data: track });
  } catch (error) {
    console.error('Error updating track:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete track
app.delete('/tracks/:id', async (c) => {
  try {
    const trackId = c.req.param('id');
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const key = `track:${userId}:${trackId}`;
    
    await kv.del(key);
    
    console.log(`Track deleted: ${key}`);
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
app.get('/analytics/track/:id', async (c) => {
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
app.post('/analytics/track/:id/play', async (c) => {
  try {
    const trackId = c.req.param('id');
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const analyticsKey = `analytics:${userId}:track:${trackId}`;
    const trackKey = `track:${userId}:${trackId}`;
    
    // Update analytics
    let analytics = await kv.get(analyticsKey);
    let analyticsData;
    
    if (!analytics) {
      analyticsData = {
        trackId,
        plays: 1,
        likes: 0,
        downloads: 0,
        shares: 0,
        comments: 0,
        dailyStats: []
      };
    } else {
      analyticsData = JSON.parse(analytics);
      analyticsData.plays = (analyticsData.plays || 0) + 1;
    }
    
    await kv.set(analyticsKey, JSON.stringify(analyticsData));
    
    // Update track plays count
    const track = await kv.get(trackKey);
    if (track) {
      const trackData = JSON.parse(track);
      trackData.plays = (trackData.plays || 0) + 1;
      await kv.set(trackKey, JSON.stringify(trackData));
    }
    
    console.log(`Track play recorded: ${trackId}`);
    return c.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error('Error recording play:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CONCERTS API
// ============================================

// Get all concerts
app.get('/concerts', async (c) => {
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
app.post('/concerts', async (c) => {
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
// VIDEOS API
// ============================================

// Get all videos
app.get('/videos', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const videos = await kv.getByPrefix(`video:${userId}:`);
    
    // If no videos, return empty array
    if (!videos || videos.length === 0) {
      return c.json({ 
        success: true, 
        data: [] 
      });
    }
    
    return c.json({ 
      success: true, 
      data: videos.map(v => typeof v === 'string' ? JSON.parse(v) : v) 
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create video
app.post('/videos', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    
    const videoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const video = {
      id: videoId,
      ...body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0
    };
    
    const key = `video:${userId}:${videoId}`;
    await kv.set(key, JSON.stringify(video));
    
    console.log(`Video created: ${key}`);
    return c.json({ success: true, data: video }, 201);
  } catch (error) {
    console.error('Error creating video:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// NEWS API
// ============================================

// Get all news
app.get('/news', async (c) => {
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
app.post('/news', async (c) => {
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
app.get('/donations', async (c) => {
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
app.post('/donations', async (c) => {
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
app.get('/coins/balance', async (c) => {
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
app.get('/coins/transactions', async (c) => {
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
app.post('/coins/transactions', async (c) => {
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
// PROFILE API
// ============================================

// Get user profile
app.get('/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const key = `profile:${userId}`;
    
    const profile = await kv.get(key);
    
    if (!profile) {
      return c.json({ 
        success: true, 
        data: {
          userId,
          name: 'Demo Artist',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
          subscribers: 0,
          totalPlays: 0,
          totalTracks: 0
        }
      });
    }
    
    return c.json({ success: true, data: JSON.parse(profile) });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update user profile
app.put('/profile', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    const key = `profile:${userId}`;
    
    const existing = await kv.get(key);
    const profile = {
      ...(existing ? JSON.parse(existing) : {}),
      ...body,
      userId,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(key, JSON.stringify(profile));
    
    console.log(`Profile updated: ${key}`);
    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// STATS API (Dashboard)
// ============================================

// Get dashboard stats
app.get('/stats/dashboard', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    
    // Get tracks count
    const tracks = await kv.getByPrefix(`track:${userId}:`);
    const tracksCount = tracks.length;
    
    // Get total plays from all tracks
    let totalPlays = 0;
    let totalLikes = 0;
    let totalDownloads = 0;
    
    tracks.forEach(trackStr => {
      const track = JSON.parse(trackStr);
      totalPlays += track.plays || 0;
      totalLikes += track.likes || 0;
      totalDownloads += track.downloads || 0;
    });
    
    // Get coins balance
    const balanceKey = `coins:balance:${userId}`;
    const balance = await kv.get(balanceKey);
    const coinsBalance = balance ? parseInt(balance) : 0;
    
    // Get donations count and total
    const donations = await kv.getByPrefix(`donation:${userId}:`);
    const donationsCount = donations.length;
    let totalDonations = 0;
    
    donations.forEach(donationStr => {
      const donation = JSON.parse(donationStr);
      totalDonations += donation.amount || 0;
    });
    
    const stats = {
      totalPlays,
      totalLikes,
      totalDownloads,
      tracksCount,
      coinsBalance,
      donationsCount,
      totalDonations,
      updatedAt: new Date().toISOString()
    };
    
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default app;