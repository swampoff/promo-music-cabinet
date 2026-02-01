/**
 * TRACK MODERATION ROUTES - Упрощенная версия для прототипа
 * Возвращает демо-данные для тестирования UI
 */

import { Hono } from 'npm:hono@4';

const app = new Hono();

// ============================================
// ДЕМО-ДАННЫЕ ДЛЯ ПРОТОТИПА
// ============================================

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Dance',
  'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass',
  'Jazz', 'Blues', 'Classical', 'Country', 'Folk',
  'Reggae', 'Metal', 'Punk', 'Indie', 'Alternative',
  'Soul', 'Funk', 'Disco', 'Gospel', 'Latin', 'World'
];

// Демо-треки для прототипа
const DEMO_TRACKS = [
  {
    id: 'demo_track_1',
    title: 'Sunset Dreams',
    artist: 'DJ Maestro',
    cover_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
    audio_file_url: 'https://example.com/audio1.mp3',
    duration: 210,
    genre: 'Electronic',
    yandex_music_url: 'https://music.yandex.ru/track/123',
    youtube_url: 'https://youtube.com/watch?v=abc',
    spotify_url: 'https://open.spotify.com/track/xyz',
    uploaded_by_email: 'artist1@example.com',
    uploaded_by_user_id: 'user_1',
    moderation_status: 'pending',
    overall_score: null,
    moderator_notes: null,
    rejection_reason: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo_track_2',
    title: 'Midnight Jazz',
    artist: 'Sarah Connor',
    cover_image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop',
    audio_file_url: 'https://example.com/audio2.mp3',
    duration: 195,
    genre: 'Jazz',
    yandex_music_url: '',
    youtube_url: '',
    spotify_url: 'https://open.spotify.com/track/abc',
    uploaded_by_email: 'sarah@example.com',
    uploaded_by_user_id: 'user_2',
    moderation_status: 'pending',
    overall_score: null,
    moderator_notes: null,
    rejection_reason: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'demo_track_3',
    title: 'Rock Revolution',
    artist: 'Thunder Band',
    cover_image_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop',
    audio_file_url: 'https://example.com/audio3.mp3',
    duration: 240,
    genre: 'Rock',
    yandex_music_url: 'https://music.yandex.ru/track/456',
    youtube_url: 'https://youtube.com/watch?v=def',
    spotify_url: '',
    apple_music_url: 'https://music.apple.com/track/789',
    uploaded_by_email: 'thunder@example.com',
    uploaded_by_user_id: 'user_3',
    moderation_status: 'pending',
    overall_score: null,
    moderator_notes: null,
    rejection_reason: null,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'demo_track_4',
    title: 'Summer Vibes',
    artist: 'Beach Boys Modern',
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
    audio_file_url: 'https://example.com/audio4.mp3',
    duration: 180,
    genre: 'Pop',
    yandex_music_url: '',
    youtube_url: 'https://youtube.com/watch?v=ghi',
    spotify_url: 'https://open.spotify.com/track/qwe',
    uploaded_by_email: 'beachboys@example.com',
    uploaded_by_user_id: 'user_4',
    moderation_status: 'approved',
    overall_score: 8,
    moderator_notes: 'Отличный трек! Высокое качество звука.',
    rejection_reason: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo_track_5',
    title: 'Dark Techno',
    artist: 'Underground Crew',
    cover_image_url: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&h=500&fit=crop',
    audio_file_url: 'https://example.com/audio5.mp3',
    duration: 300,
    genre: 'Techno',
    yandex_music_url: 'https://music.yandex.ru/track/789',
    youtube_url: '',
    spotify_url: '',
    uploaded_by_email: 'underground@example.com',
    uploaded_by_user_id: 'user_5',
    moderation_status: 'rejected',
    overall_score: 3,
    moderator_notes: 'Звук требует доработки',
    rejection_reason: 'Низкое качество звука',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

// ============================================
// POST /submitTrack - Загрузить трек на модерацию
// ============================================
app.post('/submitTrack', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Track submission received:', body);

    // В прототипе просто возвращаем успех
    return c.json({
      success: true,
      pending_track_id: `demo_${Date.now()}`,
      message: 'Трек отправлен на модерацию (демо режим)'
    });
  } catch (error) {
    console.error('Error in submitTrack:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// ============================================
// GET /pendingTracks - Получить pending треки
// ============================================
app.get('/pendingTracks', async (c) => {
  try {
    const status = c.req.query('status') || 'pending';
    const genre = c.req.query('genre');
    const search = c.req.query('search');

    // Фильтрация демо-треков
    let filteredTracks = [...DEMO_TRACKS];

    // Фильтр по статусу
    if (status && status !== 'all') {
      filteredTracks = filteredTracks.filter(t => t.moderation_status === status);
    }

    // Фильтр по жанру
    if (genre) {
      filteredTracks = filteredTracks.filter(t => t.genre === genre);
    }

    // Поиск
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTracks = filteredTracks.filter(t => 
        t.title.toLowerCase().includes(searchLower) || 
        t.artist.toLowerCase().includes(searchLower)
      );
    }

    console.log(`Returning ${filteredTracks.length} tracks (status: ${status})`);
    return c.json({ tracks: filteredTracks });
  } catch (error) {
    console.error('Error in pendingTracks:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// POST /manageTrackModeration - Модерация трека
// ============================================
app.post('/manageTrackModeration', async (c) => {
  try {
    const body = await c.req.json();
    const { pendingTrackId, action } = body;

    console.log(`Track moderation: ${action} for ${pendingTrackId}`);

    if (action === 'approve') {
      return c.json({
        success: true,
        message: 'Track approved and published (демо режим)',
        trackId: `track_${Date.now()}`,
        coinsAwarded: 50
      });
    } else if (action === 'reject') {
      return c.json({
        success: true,
        message: 'Track rejected (демо режим)'
      });
    } else {
      return c.json({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Error in manageTrackModeration:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// ============================================
// POST /batchModeration - Массовая модерация
// ============================================
app.post('/batchModeration', async (c) => {
  try {
    const body = await c.req.json();
    const { trackIds, action } = body;

    console.log(`Batch moderation: ${action} for ${trackIds.length} tracks`);

    const results = trackIds.map(trackId => ({
      trackId,
      success: true,
      message: `${action} successful (демо режим)`
    }));

    return c.json({
      success: true,
      message: `Processed ${trackIds.length} tracks (демо режим)`,
      results
    });
  } catch (error) {
    console.error('Error in batchModeration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// GET /genres - Получить список жанров
// ============================================
app.get('/genres', async (c) => {
  return c.json({ genres: GENRES });
});

// ============================================
// GET /uploadStats - Статистика загрузок
// ============================================
app.get('/uploadStats', async (c) => {
  try {
    // Демо-данные
    return c.json({
      current: 0,
      limit: 10,
      remaining: 10,
      subscription: 'artist_pro'
    });
  } catch (error) {
    console.error('Error in uploadStats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// GET /stats - Статистика модерации для админов
// ============================================
app.get('/stats', async (c) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: DEMO_TRACKS.length,
      pending: DEMO_TRACKS.filter(t => t.moderation_status === 'pending').length,
      approved: DEMO_TRACKS.filter(t => 
        t.moderation_status === 'approved' || 
        t.moderation_status === 'approved_and_migrated'
      ).length,
      rejected: DEMO_TRACKS.filter(t => t.moderation_status === 'rejected').length,
      todayCount: DEMO_TRACKS.filter(t => {
        const trackDate = new Date(t.created_at);
        return trackDate >= today;
      }).length
    };

    console.log('Returning stats:', stats);
    return c.json(stats);
  } catch (error) {
    console.error('Error in stats:', error);
    return c.json({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      todayCount: 0
    }, 200);
  }
});

export default app;