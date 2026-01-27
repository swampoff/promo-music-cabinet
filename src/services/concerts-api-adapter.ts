/**
 * Concerts API Adapter with Fallback Support
 * 
 * Этот адаптер автоматически определяет какой backend использовать:
 * - Если Postgres настроен -> использует новый API
 * - Если нет -> использует mock данные (для разработки)
 * 
 * Это позволяет безопасно деплоить без breaking changes
 */

import { concertsApi } from './concerts-api';
import type { TourDate, CreateTourDateInput, UpdateTourDateInput } from '@/types/database';

// Mock данные для fallback (если Postgres еще не настроен)
const MOCK_CONCERTS: TourDate[] = [
  {
    id: 'mock-1',
    artist_id: 'mock-artist',
    title: 'Summer Music Fest 2026',
    description: 'Грандиозный летний фестиваль с участием топовых артистов',
    event_type: 'Фестиваль',
    venue_name: 'Олимпийский',
    city: 'Москва',
    country: 'Россия',
    date: '2026-06-15',
    doors_open: '18:00',
    show_start: '19:00',
    ticket_url: 'https://tickets.example.com/summer-fest',
    ticket_price_min: 2000,
    ticket_price_max: 8000,
    venue_capacity: 30000,
    tickets_sold: 15400,
    status: 'on_sale',
    moderation_status: 'approved',
    banner_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    photos: [],
    views: 15400,
    clicks: 850,
    is_promoted: true,
    promotion_expires_at: '2026-06-30T00:00:00Z',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    artist_id: 'mock-artist',
    title: 'Acoustic Night',
    description: 'Интимный акустический концерт в камерной обстановке',
    event_type: 'Акустический сет',
    venue_name: 'A2 Green Concert',
    city: 'Санкт-Петербург',
    country: 'Россия',
    date: '2026-04-20',
    show_start: '20:00',
    ticket_url: 'https://tickets.example.com/acoustic',
    ticket_price_min: 1500,
    ticket_price_max: 3500,
    venue_capacity: 500,
    tickets_sold: 420,
    status: 'on_sale',
    moderation_status: 'approved',
    banner_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    photos: [],
    views: 8200,
    clicks: 420,
    is_promoted: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Хранилище mock данных в памяти
let mockConcertsStore = [...MOCK_CONCERTS];

/**
 * Определяет доступен ли Postgres backend
 */
async function isPostgresAvailable(): Promise<boolean> {
  try {
    // Пытаемся сделать легкий запрос к API
    const response = await concertsApi.getAll();
    // Если запрос прошел успешно (даже если данных нет), Postgres доступен
    return response.success;
  } catch (error) {
    console.warn('Postgres backend недоступен, используем mock данные:', error);
    return false;
  }
}

/**
 * Unified API Adapter
 */
export const concertsApiAdapter = {
  /**
   * Получить все концерты
   */
  async getAll() {
    const usePostgres = await isPostgresAvailable();
    
    if (usePostgres) {
      return await concertsApi.getAll();
    } else {
      // Fallback: mock данные
      return {
        success: true,
        data: mockConcertsStore,
      };
    }
  },

  /**
   * Получить концерт по ID
   */
  async getById(id: string) {
    const usePostgres = await isPostgresAvailable();
    
    if (usePostgres) {
      return await concertsApi.getById(id);
    } else {
      // Fallback: mock данные
      const concert = mockConcertsStore.find(c => c.id === id);
      if (concert) {
        return { success: true, data: concert };
      } else {
        return { success: false, error: 'Concert not found' };
      }
    }
  },

  /**
   * Создать концерт
   */
  async create(data: CreateTourDateInput) {
    const usePostgres = await isPostgresAvailable();
    
    if (usePostgres) {
      return await concertsApi.create(data);
    } else {
      // Fallback: добавляем в mock данные
      const newConcert: TourDate = {
        id: `mock-${Date.now()}`,
        artist_id: 'mock-artist',
        ...data,
        country: data.country || 'Россия',
        status: 'draft',
        moderation_status: 'draft',
        views: 0,
        clicks: 0,
        tickets_sold: 0,
        is_promoted: false,
        photos: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockConcertsStore.push(newConcert);
      
      return { success: true, data: newConcert };
    }
  },

  /**
   * Обновить концерт
   */
  async update(id: string, data: UpdateTourDateInput) {
    const usePostgres = await isPostgresAvailable();
    
    if (usePostgres) {
      return await concertsApi.update(id, data);
    } else {
      // Fallback: обновляем mock данные
      const index = mockConcertsStore.findIndex(c => c.id === id);
      if (index !== -1) {
        mockConcertsStore[index] = {
          ...mockConcertsStore[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return { success: true, data: mockConcertsStore[index] };
      } else {
        return { success: false, error: 'Concert not found' };
      }
    }
  },

  /**
   * Удалить концерт
   */
  async delete(id: string) {
    const usePostgres = await isPostgresAvailable();
    
    if (usePostgres) {
      return await concertsApi.delete(id);
    } else {
      // Fallback: удаляем из mock данных
      const index = mockConcertsStore.findIndex(c => c.id === id);
      if (index !== -1) {
        mockConcertsStore.splice(index, 1);
        return { success: true, message: 'Concert deleted' };
      } else {
        return { success: false, error: 'Concert not found' };
      }
    }
  },

  /**
   * Отправить на модерацию
   */
  async submit(id: string) {
    const usePostgres = await isPostgresAvailable();
    
    if (usePostgres) {
      return await concertsApi.submit(id);
    } else {
      // Fallback: обновляем статус в mock данных
      return await this.update(id, { moderation_status: 'pending' });
    }
  },

  /**
   * Продвинуть концерт
   */
  async promote(id: string, days: number = 7) {
    const usePostgres = await isPostgresAvailable();
    
    if (usePostgres) {
      return await concertsApi.promote(id, days);
    } else {
      // Fallback: обновляем в mock данных
      const promotionExpiresAt = new Date();
      promotionExpiresAt.setDate(promotionExpiresAt.getDate() + days);
      
      return await this.update(id, {
        is_promoted: true,
        promotion_expires_at: promotionExpiresAt.toISOString(),
      });
    }
  },

  /**
   * Сбросить mock данные (только для разработки)
   */
  resetMockData() {
    mockConcertsStore = [...MOCK_CONCERTS];
  },
};

/**
 * Hook для проверки статуса backend
 */
export async function useBackendStatus() {
  const isPostgres = await isPostgresAvailable();
  return {
    isPostgres,
    backendType: isPostgres ? 'Postgres' : 'Mock',
    message: isPostgres 
      ? '✅ Подключено к Postgres' 
      : '⚠️ Используются тестовые данные (Postgres не настроен)',
  };
}
