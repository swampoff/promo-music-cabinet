import { tracksApi, concertsApi, videosApi, newsApi, donationsApi, coinsApi, profileApi } from '@/utils/api';

/**
 * Инициализация демо-данных для нового пользователя
 * Вызывается при первом запуске приложения
 */
export async function initDemoData() {
  console.log('🎵 Инициализация демо-данных...');

  try {
    // Проверяем, есть ли уже данные
    const existingTracks = await tracksApi.getAll();
    
    if (existingTracks.success && existingTracks.data && existingTracks.data.length > 0) {
      console.log('✅ Данные уже существуют, инициализация не требуется');
      return;
    }

    // Создаем профиль
    await profileApi.update({
      name: 'Александр Иванов',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      bio: 'Российский музыкант, продюсер электронной музыки. Работаю в жанрах House, Techno, Ambient.',
      subscribers: 12500,
      totalPlays: 0,
      totalTracks: 0,
    });

    // Создаем треки
    const tracks = [
      {
        title: 'Midnight Dreams',
        artist: 'Александр Иванов',
        album: 'Summer Nights',
        genre: 'Electronic',
        duration: 245,
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        audioUrl: 'https://example.com/tracks/midnight-dreams.mp3',
      },
      {
        title: 'Neon Lights',
        artist: 'Александр Иванов',
        album: 'City Pulse',
        genre: 'Synthwave',
        duration: 198,
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        audioUrl: 'https://example.com/tracks/neon-lights.mp3',
      },
      {
        title: 'Ocean Waves',
        artist: 'Александр Иванов',
        album: 'Natural Sounds',
        genre: 'Ambient',
        duration: 320,
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
        audioUrl: 'https://example.com/tracks/ocean-waves.mp3',
      },
    ];

    for (const track of tracks) {
      await tracksApi.create(track);
    }
    console.log(`✅ Создано ${tracks.length} треков`);

    // Создаем концерты
    const concerts = [
      {
        title: 'Summer Electronic Festival 2024',
        venue: 'Парк Горького',
        city: 'Москва',
        date: '2024-07-15',
        time: '20:00',
        ticketPrice: 2500,
        ticketUrl: 'https://example.com/tickets/1',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
        description: 'Грандиозный летний фестиваль электронной музыки под открытым небом',
      },
      {
        title: 'Night Vibes Tour',
        venue: 'Aurora Concert Hall',
        city: 'Санкт-Петербург',
        date: '2024-08-20',
        time: '21:00',
        ticketPrice: 3000,
        ticketUrl: 'https://example.com/tickets/2',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop',
        description: 'Эксклюзивное шоу в рамках всероссийского тура',
      },
    ];

    for (const concert of concerts) {
      await concertsApi.create(concert);
    }
    console.log(`✅ Создано ${concerts.length} концертов`);

    // Создаем видео
    const videos = [
      {
        title: 'Midnight Dreams - Official Music Video',
        description: 'Официальный музыкальный клип на трек Midnight Dreams',
        thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=450&fit=crop',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 245,
      },
      {
        title: 'Behind The Scenes: Making of City Pulse',
        description: 'Процесс создания альбома City Pulse в студии',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=450&fit=crop',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 420,
      },
    ];

    for (const video of videos) {
      await videosApi.create(video);
    }
    console.log(`✅ Создано ${videos.length} видео`);

    // Создаем новости
    const newsItems = [
      {
        title: 'Новый альбом "Summer Nights" уже доступен!',
        content: 'Рад представить вам мой новый альбом "Summer Nights"! 10 треков, созданных специально для летних вечеров. Слушайте на всех площадках!',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop',
      },
      {
        title: 'Анонс летнего тура 2024',
        content: 'Этим летом я отправляюсь в большой тур по России! Уже сейчас доступны билеты на концерты в Москве, Санкт-Петербурге, Казани и других городах.',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
      },
    ];

    for (const newsItem of newsItems) {
      await newsApi.create(newsItem);
    }
    console.log(`✅ Создано ${newsItems.length} новостей`);

    // Добавляем начальный баланс коинов
    await coinsApi.addTransaction({
      amount: 5000,
      type: 'reward',
      description: 'Приветственный бонус',
    });
    console.log('✅ Добавлен приветственный бонус коинов');

    // Создаем несколько донатов для демо
    const donations = [
      {
        donorName: 'Мария Петрова',
        amount: 500,
        message: 'Спасибо за прекрасную музыку! 💙',
      },
      {
        donorName: 'Иван Сидоров',
        amount: 1000,
        message: 'Жду нового альбома!',
      },
      {
        donorName: 'Анна Козлова',
        amount: 300,
        message: 'Отлично выступили на фестивале! 🎵',
      },
    ];

    for (const donation of donations) {
      await donationsApi.create(donation);
    }
    console.log(`✅ Создано ${donations.length} донатов`);

    console.log('🎉 Инициализация завершена!');
    return true;
  } catch (error) {
    console.error('❌ Ошибка при инициализации данных:', error);
    return false;
  }
}

/**
 * Проверка необходимости инициализации
 */
export async function checkNeedsInit(): Promise<boolean> {
  try {
    const tracks = await tracksApi.getAll();
    return !tracks.success || !tracks.data || tracks.data.length === 0;
  } catch (error) {
    console.error('Ошибка проверки данных:', error);
    return true;
  }
}
