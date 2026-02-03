/**
 * MOCK PITCHING FEEDBACK DATA
 * Моковые данные получателей рассылок и их отзывов
 * Updated: 2026-02-01
 */

import { Recipient, FeedbackResponse, FeedbackType, RecipientStatus } from '@/contexts/DataContext';

// ==================== МОКОВЫЕ ПОЛУЧАТЕЛИ ====================

// Радиостанции (федеральные, региональные, интернет)
export const mockRadioRecipients: Recipient[] = [
  {
    id: 'rec_radio_1',
    name: 'Эхо Москвы FM',
    contactPerson: 'Ирина Смирнова',
    email: 'i.smirnova@echo.fm',
    phone: '+7 495 123-45-67',
    city: 'Москва',
    category: 'Федеральное',
    status: 'responded_positive',
    feedbackDate: '2026-01-28T14:30:00Z',
  },
  {
    id: 'rec_radio_2',
    name: 'Radio Energy',
    contactPerson: 'Дмитрий Ковалев',
    email: 'd.kovalev@energy.ru',
    city: 'Москва',
    category: 'Федеральное',
    status: 'responded_positive',
    feedbackDate: '2026-01-29T09:15:00Z',
  },
  {
    id: 'rec_radio_3',
    name: 'Дорожное радио',
    contactPerson: 'Анна Петрова',
    email: 'a.petrova@dorognoe.ru',
    city: 'Москва',
    category: 'Федеральное',
    status: 'responded_neutral',
    feedbackDate: '2026-01-29T16:45:00Z',
  },
  {
    id: 'rec_radio_4',
    name: 'Европа Плюс',
    contactPerson: 'Сергей Волков',
    email: 's.volkov@europaplus.ru',
    city: 'Москва',
    category: 'Федеральное',
    status: 'downloaded',
  },
  {
    id: 'rec_radio_5',
    name: 'Русское Радио',
    contactPerson: 'Елена Михайлова',
    email: 'e.mikhailova@rusradio.ru',
    city: 'Москва',
    category: 'Федеральное',
    status: 'opened',
  },
  {
    id: 'rec_radio_6',
    name: 'Максимум FM (СПб)',
    contactPerson: 'Алексей Соколов',
    email: 'a.sokolov@maximum.spb.ru',
    city: 'Санкт-Петербург',
    category: 'Региональное',
    status: 'responded_positive',
    feedbackDate: '2026-01-30T11:20:00Z',
  },
  {
    id: 'rec_radio_7',
    name: 'Наше Радио (Екб)',
    contactPerson: 'Ольга Кузнецова',
    email: 'o.kuznetsova@nashe.ekb.ru',
    city: 'Екатеринбург',
    category: 'Региональное',
    status: 'responded_neutral',
    feedbackDate: '2026-01-30T13:40:00Z',
  },
  {
    id: 'rec_radio_8',
    name: 'Рекорд FM (Казань)',
    contactPerson: 'Тимур Галиев',
    email: 't.galiev@record.kzn.ru',
    city: 'Казань',
    category: 'Региональное',
    status: 'sent',
  },
  {
    id: 'rec_radio_9',
    name: 'Love Radio (Новосибирск)',
    contactPerson: 'Мария Белова',
    email: 'm.belova@love.nsk.ru',
    city: 'Новосибирск',
    category: 'Региональное',
    status: 'opened',
  },
  {
    id: 'rec_radio_10',
    name: 'Хит FM (Ростов)',
    contactPerson: 'Игорь Романов',
    email: 'i.romanov@hitfm.rostov.ru',
    city: 'Ростов-на-Дону',
    category: 'Региональное',
    status: 'responded_negative',
    feedbackDate: '2026-01-31T10:05:00Z',
  },
];

// Заведения (кафе, рестораны, клубы)
export const mockVenueRecipients: Recipient[] = [
  {
    id: 'rec_venue_1',
    name: 'City Coffee Network',
    contactPerson: 'Артем Морозов',
    email: 'a.morozov@citycoffee.ru',
    city: 'Москва',
    category: 'Сеть кофеен',
    status: 'responded_positive',
    feedbackDate: '2026-01-29T15:20:00Z',
  },
  {
    id: 'rec_venue_2',
    name: 'Бар "Стерео"',
    contactPerson: 'Даниил Захаров',
    email: 'd.zakharov@stereobar.ru',
    city: 'Москва',
    category: 'Бар/Клуб',
    status: 'responded_positive',
    feedbackDate: '2026-01-30T12:10:00Z',
  },
  {
    id: 'rec_venue_3',
    name: 'Клуб "Космонавт"',
    contactPerson: 'Виктория Ларина',
    email: 'v.larina@kosmonavt.club',
    city: 'Санкт-Петербург',
    category: 'Бар/Клуб',
    status: 'responded_neutral',
    feedbackDate: '2026-01-30T18:35:00Z',
  },
  {
    id: 'rec_venue_4',
    name: 'Ресторан "Белое солнце"',
    contactPerson: 'Анастасия Павлова',
    email: 'a.pavlova@beloe-solntse.ru',
    city: 'Москва',
    category: 'Ресторан',
    status: 'downloaded',
  },
  {
    id: 'rec_venue_5',
    name: 'Лаундж "Небо"',
    contactPerson: 'Константин Орлов',
    email: 'k.orlov@nebo-lounge.ru',
    city: 'Москва',
    category: 'Лаундж',
    status: 'opened',
  },
  {
    id: 'rec_venue_6',
    name: 'Арт-кафе "Рисовать"',
    contactPerson: 'Софья Егорова',
    email: 's.egorova@risovat.cafe',
    city: 'Санкт-Петербург',
    category: 'Кафе',
    status: 'sent',
  },
  {
    id: 'rec_venue_7',
    name: 'Клуб "Родня"',
    contactPerson: 'Павел Крылов',
    email: 'p.krylov@rodnya.club',
    city: 'Екатеринбург',
    category: 'Бар/Клуб',
    status: 'responded_negative',
    feedbackDate: '2026-01-31T14:25:00Z',
  },
];

// СМИ (музыкальные блоги, журналы, порталы)
export const mockMediaRecipients: Recipient[] = [
  {
    id: 'rec_media_1',
    name: 'The Flow Magazine',
    contactPerson: 'Екатерина Новикова',
    email: 'e.novikova@theflow.ru',
    city: 'Москва',
    category: 'Музыкальный журнал',
    status: 'responded_positive',
    feedbackDate: '2026-01-28T11:50:00Z',
  },
  {
    id: 'rec_media_2',
    name: 'Soundbaza',
    contactPerson: 'Никита Федоров',
    email: 'n.fedorov@soundbaza.ru',
    city: 'Москва',
    category: 'Музыкальный портал',
    status: 'responded_positive',
    feedbackDate: '2026-01-29T14:15:00Z',
  },
  {
    id: 'rec_media_3',
    name: 'MusicBox Blog',
    contactPerson: 'Арина Козлова',
    email: 'a.kozlova@musicbox.blog',
    city: 'Санкт-Петербург',
    category: 'Блог',
    status: 'responded_neutral',
    feedbackDate: '2026-01-30T09:30:00Z',
  },
  {
    id: 'rec_media_4',
    name: 'Афиша Daily',
    contactPerson: 'Максим Воронов',
    email: 'm.voronov@afisha.ru',
    city: 'Москва',
    category: 'Медиа',
    status: 'downloaded',
  },
  {
    id: 'rec_media_5',
    name: 'Индюшата',
    contactPerson: 'Ксения Белкина',
    email: 'k.belkina@indushata.ru',
    city: 'Москва',
    category: 'Блог',
    status: 'responded_positive',
    feedbackDate: '2026-01-31T16:40:00Z',
  },
  {
    id: 'rec_media_6',
    name: 'Музыка.ру',
    contactPerson: 'Денис Лебедев',
    email: 'd.lebedev@muzyka.ru',
    city: 'Москва',
    category: 'Музыкальный портал',
    status: 'opened',
  },
  {
    id: 'rec_media_7',
    name: 'Pitchfork Russia',
    contactPerson: 'Александра Сидорова',
    email: 'a.sidorova@pitchfork.ru',
    city: 'Москва',
    category: 'Музыкальный журнал',
    status: 'sent',
  },
  {
    id: 'rec_media_8',
    name: 'BeatHub',
    contactPerson: 'Илья Морозов',
    email: 'i.morozov@beathub.ru',
    city: 'Санкт-Петербург',
    category: 'Блог',
    status: 'responded_neutral',
    feedbackDate: '2026-01-31T12:20:00Z',
  },
];

// Лейблы
export const mockLabelRecipients: Recipient[] = [
  {
    id: 'rec_label_1',
    name: 'Gazgolder Records',
    contactPerson: 'Артур Каспаров',
    email: 'a.kasparov@gazgolder.com',
    city: 'Москва',
    category: 'Мажорный лейбл',
    status: 'responded_neutral',
    feedbackDate: '2026-01-30T10:15:00Z',
  },
  {
    id: 'rec_label_2',
    name: 'Rhymes Music',
    contactPerson: 'Валерия Крылова',
    email: 'v.krylova@rhymes.ru',
    city: 'Москва',
    category: 'Инди-лейбл',
    status: 'responded_positive',
    feedbackDate: '2026-01-31T15:05:00Z',
  },
  {
    id: 'rec_label_3',
    name: 'Respect Production',
    contactPerson: 'Владимир Тихонов',
    email: 'v.tikhonov@respect.ru',
    city: 'Москва',
    category: 'Мажорный лейбл',
    status: 'downloaded',
  },
  {
    id: 'rec_label_4',
    name: 'Night Bass Records',
    contactPerson: 'Юлия Соловьева',
    email: 'y.solovyova@nightbass.ru',
    city: 'Санкт-Петербург',
    category: 'Инди-лейбл',
    status: 'opened',
  },
  {
    id: 'rec_label_5',
    name: 'Monstercat Russia',
    contactPerson: 'Андрей Жуков',
    email: 'a.zhukov@monstercat.ru',
    city: 'Москва',
    category: 'Инди-лейбл',
    status: 'sent',
  },
];

// ==================== МОКОВЫЕ ОТЗЫВЫ ====================

export const mockFeedbacks: FeedbackResponse[] = [
  // Положительные отзывы (Радио)
  {
    id: 'fb_1',
    recipientId: 'rec_radio_1',
    distributionId: 'dist_1',
    itemId: 1,
    type: 'positive',
    message: 'Отличный трек! Добавляем в вечернюю ротацию с 15 февраля.',
    respondedAt: '2026-01-28T14:30:00Z',
    respondedVia: 'portal',
    willRotate: true,
    rotationStartDate: '2026-02-15',
    estimatedReach: 150000,
  },
  {
    id: 'fb_2',
    recipientId: 'rec_radio_2',
    distributionId: 'dist_1',
    itemId: 1,
    type: 'positive',
    message: 'Крутой саунд, хорошее качество сведения. Берем в утреннее шоу.',
    respondedAt: '2026-01-29T09:15:00Z',
    respondedVia: 'portal',
    willRotate: true,
    rotationStartDate: '2026-02-10',
    estimatedReach: 200000,
  },
  {
    id: 'fb_6',
    recipientId: 'rec_radio_6',
    distributionId: 'dist_1',
    itemId: 1,
    type: 'positive',
    message: 'Интересный материал для нашей аудитории. Включим в ночную программу.',
    respondedAt: '2026-01-30T11:20:00Z',
    respondedVia: 'manual',
    addedBy: 'admin_1',
    willRotate: true,
    rotationStartDate: '2026-02-20',
    estimatedReach: 50000,
  },

  // Нейтральные отзывы (Радио)
  {
    id: 'fb_3',
    recipientId: 'rec_radio_3',
    distributionId: 'dist_1',
    itemId: 1,
    type: 'neutral',
    message: 'Трек интересный, обсудим на планерке и свяжемся позже.',
    respondedAt: '2026-01-29T16:45:00Z',
    respondedVia: 'portal',
  },
  {
    id: 'fb_7',
    recipientId: 'rec_radio_7',
    distributionId: 'dist_1',
    itemId: 1,
    type: 'neutral',
    message: 'Хороший трек, но нужно подумать, как он впишется в нашу сетку вещания.',
    respondedAt: '2026-01-30T13:40:00Z',
    respondedVia: 'portal',
  },

  // Отрицательные отзывы (Радио)
  {
    id: 'fb_10',
    recipientId: 'rec_radio_10',
    distributionId: 'dist_1',
    itemId: 1,
    type: 'negative',
    message: 'К сожалению, не наш формат. Но спасибо за материал!',
    respondedAt: '2026-01-31T10:05:00Z',
    respondedVia: 'portal',
  },

  // Положительные отзывы (Заведения)
  {
    id: 'fb_v1',
    recipientId: 'rec_venue_1',
    distributionId: 'dist_2',
    itemId: 2,
    type: 'positive',
    message: 'Отлично подходит для утреннего плейлиста во всех наших кофейнях. Добавили!',
    respondedAt: '2026-01-29T15:20:00Z',
    respondedVia: 'portal',
    playlistName: 'Morning Vibes',
    estimatedReach: 5000,
  },
  {
    id: 'fb_v2',
    recipientId: 'rec_venue_2',
    distributionId: 'dist_2',
    itemId: 2,
    type: 'positive',
    message: 'Классный трек для вечерней атмосферы. Добавим в пятничный сет.',
    respondedAt: '2026-01-30T12:10:00Z',
    respondedVia: 'manual',
    addedBy: 'admin_1',
    playlistName: 'Friday Night',
    estimatedReach: 300,
  },

  // Нейтральные отзывы (Заведения)
  {
    id: 'fb_v3',
    recipientId: 'rec_venue_3',
    distributionId: 'dist_2',
    itemId: 2,
    type: 'neutral',
    message: 'Прослушали, интересно. Возможно, включим в будущие сеты.',
    respondedAt: '2026-01-30T18:35:00Z',
    respondedVia: 'portal',
  },

  // Отрицательные отзывы (Заведения)
  {
    id: 'fb_v7',
    recipientId: 'rec_venue_7',
    distributionId: 'dist_2',
    itemId: 2,
    type: 'negative',
    message: 'Не совсем наш стиль, но спасибо!',
    respondedAt: '2026-01-31T14:25:00Z',
    respondedVia: 'portal',
  },

  // Положительные отзывы (СМИ)
  {
    id: 'fb_m1',
    recipientId: 'rec_media_1',
    distributionId: 'dist_3',
    itemId: 3,
    type: 'positive',
    message: 'Отличный материал! Напишем рецензию на следующей неделе.',
    respondedAt: '2026-01-28T11:50:00Z',
    respondedVia: 'portal',
    estimatedReach: 25000,
  },
  {
    id: 'fb_m2',
    recipientId: 'rec_media_2',
    distributionId: 'dist_3',
    itemId: 3,
    type: 'positive',
    message: 'Интересный релиз. Сделаем премьеру на нашем портале.',
    respondedAt: '2026-01-29T14:15:00Z',
    respondedVia: 'portal',
    estimatedReach: 30000,
  },
  {
    id: 'fb_m5',
    recipientId: 'rec_media_5',
    distributionId: 'dist_3',
    itemId: 3,
    type: 'positive',
    message: 'Классный трек! Добавим в нашу подборку "Новинки недели".',
    respondedAt: '2026-01-31T16:40:00Z',
    respondedVia: 'manual',
    addedBy: 'admin_2',
    estimatedReach: 15000,
  },

  // Нейтральные отзывы (СМИ)
  {
    id: 'fb_m3',
    recipientId: 'rec_media_3',
    distributionId: 'dist_3',
    itemId: 3,
    type: 'neutral',
    message: 'Прослушали, интересный саунд. Возможно, включим в будущий обзор.',
    respondedAt: '2026-01-30T09:30:00Z',
    respondedVia: 'portal',
  },
  {
    id: 'fb_m8',
    recipientId: 'rec_media_8',
    distributionId: 'dist_3',
    itemId: 3,
    type: 'neutral',
    message: 'Качественная работа. Рассмотрим для материала про новых артистов.',
    respondedAt: '2026-01-31T12:20:00Z',
    respondedVia: 'portal',
  },

  // Отзывы от лейблов
  {
    id: 'fb_l1',
    recipientId: 'rec_label_1',
    distributionId: 'dist_4',
    itemId: 4,
    type: 'neutral',
    message: 'Спасибо за материал. Пока не готовы предложить контракт, но интересный артист.',
    respondedAt: '2026-01-30T10:15:00Z',
    respondedVia: 'portal',
  },
  {
    id: 'fb_l2',
    recipientId: 'rec_label_2',
    distributionId: 'dist_4',
    itemId: 4,
    type: 'positive',
    message: 'Отличная работа! Хотим обсудить возможное сотрудничество. Свяжемся с артистом напрямую.',
    respondedAt: '2026-01-31T15:05:00Z',
    respondedVia: 'manual',
    addedBy: 'admin_1',
    estimatedReach: 100000,
  },
];

// ==================== СВЯЗЫВАНИЕ ОТЗЫВОВ С ПОЛУЧАТЕЛЯМИ ====================

// Функция для получения получателей с привязанными отзывами
export const getRecipientsWithFeedback = (recipients: Recipient[]): Recipient[] => {
  return recipients.map(recipient => {
    const feedback = mockFeedbacks.find(fb => fb.recipientId === recipient.id);
    return {
      ...recipient,
      feedback,
    };
  });
};

// Экспорт всех получателей (по направлениям)
export const getAllRecipients = (): Recipient[] => {
  return getRecipientsWithFeedback([
    ...mockRadioRecipients,
    ...mockVenueRecipients,
    ...mockMediaRecipients,
    ...mockLabelRecipients,
  ]);
};

// Экспорт по направлению
export const getRecipientsByDirection = (direction: 'radio' | 'venue' | 'media' | 'label'): Recipient[] => {
  switch (direction) {
    case 'radio':
      return getRecipientsWithFeedback(mockRadioRecipients);
    case 'venue':
      return getRecipientsWithFeedback(mockVenueRecipients);
    case 'media':
      return getRecipientsWithFeedback(mockMediaRecipients);
    case 'label':
      return getRecipientsWithFeedback(mockLabelRecipients);
    default:
      return [];
  }
};
