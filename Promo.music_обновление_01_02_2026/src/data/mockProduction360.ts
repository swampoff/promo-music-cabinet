/**
 * MOCK PRODUCTION 360 DATA - Тестовые данные для услуги Production 360
 * Комплексная услуга полного цикла создания музыкального проекта
 */

import type { Production360 } from '@/contexts/DataContext';

// Базовая цена консультации
const BASE_PRICE = 50000;

// Скидки по подписке
const DISCOUNTS = {
  basic: 0,           // 0% → ₽50,000
  artist_start: 5,    // 5% → ₽47,500
  artist_pro: 15,     // 15% → ₽42,500
  artist_elite: 25,   // 25% → ₽37,500
};

export const mockProduction360: Production360[] = [
  {
    id: 5001,
    projectName: 'Debut Album "Neon Nights"',
    artist: 'DJ Catalyst',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    userRole: 'artist',
    subscriptionPlan: 'artist_pro',
    genre: 'Electronic / House',
    projectDescription: 'Дебютный альбом в жанре progressive house с элементами synthwave. 10 треков, 45 минут звучания. Концепция: ночная жизнь мегаполиса.',
    projectGoals: 'Релиз на крупных платформах, попадание в editorial плейлисты Spotify, запуск маркетинговой кампании с охватом 500K+.',
    targetAudience: '18-35, любители электронной музыки, клабберы, фестивали',
    services: {
      concept: true,
      recording: false, // уже есть демки
      mixing: true,
      videoContent: true,
      distribution: true,
      promotion: true,
    },
    references: [
      'https://open.spotify.com/artist/deadmau5',
      'https://open.spotify.com/artist/eric-prydz',
    ],
    existingMaterial: '10 демо-треков в Logic Pro, предварительная аранжировка готова',
    basePrice: BASE_PRICE,
    discount: DISCOUNTS.artist_pro,
    finalPrice: BASE_PRICE * (1 - DISCOUNTS.artist_pro / 100), // ₽42,500
    estimatedFullPrice: 850000, // Оценка после консультации
    isPaid: true,
    paymentStatus: 'paid',
    status: 'in_progress',
    moderationNote: 'Одобрено. Проект запущен.',
    progress: {
      currentStage: 'mixing',
      completedPercentage: 65,
      estimatedCompletion: '2026-04-15T00:00:00Z',
    },
    submittedDate: '2026-01-10T12:00:00Z',
    approvedDate: '2026-01-12T10:00:00Z',
    userId: 'artist_1',
  },
  {
    id: 5002,
    projectName: 'Single "Midnight Drive" + Music Video',
    artist: 'Neon Dreams',
    artistAvatar: 'https://i.pravatar.cc/150?img=4',
    userRole: 'artist',
    subscriptionPlan: 'artist_elite',
    genre: 'Synthwave / Retrowave',
    projectDescription: 'Сингл с полноценным музыкальным видео в стиле 80-х. Хронометраж: 3:45.',
    projectGoals: 'Вирусное видео на YouTube/TikTok, релиз перед туром, 1M+ просмотров за первый месяц.',
    targetAudience: '25-40, ностальгия по 80-м, retrofuture эстетика',
    services: {
      concept: true,
      recording: true,
      mixing: true,
      videoContent: true, // Основной фокус
      distribution: true,
      promotion: true,
    },
    references: [
      'https://www.youtube.com/watch?v=MV_3Dpw-BRY', // Gunship - Tech Noir
    ],
    basePrice: BASE_PRICE,
    discount: DISCOUNTS.artist_elite,
    finalPrice: BASE_PRICE * (1 - DISCOUNTS.artist_elite / 100), // ₽37,500
    estimatedFullPrice: 450000,
    isPaid: true,
    paymentStatus: 'paid',
    status: 'pending_review',
    submittedDate: '2026-01-30T14:00:00Z',
    userId: 'artist_4',
  },
  {
    id: 5003,
    projectName: 'EP "Underground Sessions" (4 tracks)',
    artist: 'The Soundwaves',
    artistAvatar: 'https://i.pravatar.cc/150?img=2',
    userRole: 'artist',
    subscriptionPlan: 'artist_start',
    genre: 'Techno / Minimal',
    projectDescription: 'Мини-альбом из 4 треков в стиле minimal techno для релиза на виниле и цифровых платформах.',
    projectGoals: 'Релиз на Beatport Top 100, vinyl pressing (300 копий), промо на underground фестивалях.',
    targetAudience: 'Techno heads, vinyl collectors, DJs',
    services: {
      concept: true,
      recording: true, // студийная запись модульных синтов
      mixing: true,
      videoContent: false, // только visualizers
      distribution: true,
      promotion: false, // сами продвигают через DJ network
    },
    references: [
      'https://open.spotify.com/artist/richie-hawtin',
    ],
    existingMaterial: 'Предварительные jam sessions на модулярах (2 часа материала)',
    basePrice: BASE_PRICE,
    discount: DISCOUNTS.artist_start,
    finalPrice: BASE_PRICE * (1 - DISCOUNTS.artist_start / 100), // ₽47,500
    isPaid: false,
    paymentStatus: 'pending',
    status: 'pending_payment',
    submittedDate: '2026-02-01T09:00:00Z',
    userId: 'artist_2',
  },
  {
    id: 5004,
    projectName: 'Full Album + Tour Promo Package',
    artist: 'Beatmaker Pro',
    artistAvatar: 'https://i.pravatar.cc/150?img=3',
    userRole: 'artist',
    subscriptionPlan: 'artist_elite',
    genre: 'Hip-Hop / Trap',
    projectDescription: 'Полноценный альбом из 12 треков + маркетинговая кампания для тура по России.',
    projectGoals: 'Альбом года, тур по 15 городам, коллаборации с топовыми артистами.',
    targetAudience: 'Hip-hop комьюнити, 16-30, urban culture',
    services: {
      concept: true,
      recording: true,
      mixing: true,
      videoContent: true, // 3 клипа
      distribution: true,
      promotion: true, // полная кампания
    },
    references: [],
    basePrice: BASE_PRICE,
    discount: DISCOUNTS.artist_elite,
    finalPrice: BASE_PRICE * (1 - DISCOUNTS.artist_elite / 100), // ₽37,500
    estimatedFullPrice: 1200000, // Большой проект
    isPaid: true,
    paymentStatus: 'paid',
    status: 'approved',
    moderationNote: 'Одобрено. Ожидаем старта работ.',
    submittedDate: '2026-01-25T11:00:00Z',
    approvedDate: '2026-01-27T15:00:00Z',
    userId: 'artist_3',
  },
  {
    id: 5005,
    projectName: 'Soundtrack for Indie Game',
    artist: 'Electronic Nation',
    artistAvatar: 'https://i.pravatar.cc/150?img=5',
    userRole: 'artist',
    subscriptionPlan: 'artist_pro',
    genre: 'Ambient / Cinematic Electronic',
    projectDescription: 'Саундтрек для инди-игры. 20 треков разной длины (от 1 до 5 минут), адаптивная музыка.',
    projectGoals: 'Интеграция в игру, отдельный релиз на Spotify/Bandcamp, номинация на Game Audio Awards.',
    targetAudience: 'Геймеры, ambient слушатели',
    services: {
      concept: true,
      recording: true,
      mixing: true,
      videoContent: false, // только game trailer music
      distribution: true,
      promotion: false, // продвижение через игровое комьюнити
    },
    references: [
      'https://open.spotify.com/artist/c418', // Minecraft OST
    ],
    basePrice: BASE_PRICE,
    discount: DISCOUNTS.artist_pro,
    finalPrice: BASE_PRICE * (1 - DISCOUNTS.artist_pro / 100), // ₽42,500
    isPaid: true,
    paymentStatus: 'paid',
    status: 'rejected',
    rejectionReason: 'Проект требует специализированного game audio опыта, который выходит за рамки наших услуг. Рекомендуем обратиться в специализированную игровую студию.',
    moderationNote: 'Отклонено. Возвращены средства.',
    submittedDate: '2026-01-20T16:00:00Z',
    userId: 'artist_5',
  },
  {
    id: 5006,
    projectName: 'Remix Package для лейбла',
    artist: 'Indie Hearts',
    artistAvatar: 'https://i.pravatar.cc/150?img=6',
    userRole: 'label',
    subscriptionPlan: 'basic',
    genre: 'Various / Remixes',
    projectDescription: 'Пакет из 5 ремиксов на треки артистов лейбла для промо-релиза.',
    projectGoals: 'Обновление каталога, привлечение новой аудитории через ремиксы.',
    targetAudience: 'Existing fanbase + новые слушатели',
    services: {
      concept: false,
      recording: false,
      mixing: true, // только финальное сведение ремиксов
      videoContent: false,
      distribution: true,
      promotion: false,
    },
    references: [],
    basePrice: BASE_PRICE,
    discount: DISCOUNTS.basic,
    finalPrice: BASE_PRICE, // ₽50,000
    isPaid: false,
    paymentStatus: 'pending',
    status: 'pending_payment',
    submittedDate: '2026-01-31T10:00:00Z',
    userId: 'label_1',
  },
  {
    id: 5007,
    projectName: 'Live Session Recording + Streaming',
    artist: 'DJ Catalyst',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    userRole: 'artist',
    subscriptionPlan: 'artist_elite',
    genre: 'Live Electronic',
    projectDescription: 'Запись полноценной live-сессии с multi-camera setup для стриминга и последующего релиза.',
    projectGoals: 'Live album, YouTube Premium content, Boiler Room style session.',
    targetAudience: 'Фанаты live электроники, YouTube аудитория',
    services: {
      concept: true,
      recording: true, // multi-track live recording
      mixing: true,
      videoContent: true, // multi-camera edit
      distribution: true,
      promotion: true,
    },
    references: [
      'https://www.youtube.com/c/boilerroom',
    ],
    basePrice: BASE_PRICE,
    discount: DISCOUNTS.artist_elite,
    finalPrice: BASE_PRICE * (1 - DISCOUNTS.artist_elite / 100), // ₽37,500
    estimatedFullPrice: 650000,
    isPaid: true,
    paymentStatus: 'paid',
    status: 'completed',
    moderationNote: 'Проект завершён успешно. Релиз состоялся.',
    progress: {
      currentStage: 'promotion',
      completedPercentage: 100,
      estimatedCompletion: '2026-01-28T00:00:00Z',
    },
    submittedDate: '2025-12-01T10:00:00Z',
    approvedDate: '2025-12-03T14:00:00Z',
    completedDate: '2026-01-28T18:00:00Z',
    userId: 'artist_1',
  },
];
