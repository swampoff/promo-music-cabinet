import { z } from 'zod';

export const concertSchema = z.object({
  title: z.string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(200, 'Название слишком длинное'),
  
  tour_name: z.string()
    .min(2, 'Название тура слишком короткое')
    .max(200, 'Название тура слишком длинное')
    .optional()
    .or(z.literal('')),
  
  description: z.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(2000, 'Описание слишком длинное')
    .optional(),
  
  event_type: z.enum([
    'Концерт',
    'Фестиваль',
    'Клубное выступление',
    'Арена шоу',
    'Уличный концерт',
    'Акустический сет',
    'DJ сет',
    'Другое'
  ], {
    errorMap: () => ({ message: 'Выберите тип события' })
  }),
  
  date: z.string()
    .min(1, 'Выберите дату концерта')
    .refine((date) => {
      const concertDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return concertDate >= today;
    }, 'Дата концерта не может быть в прошлом'),
  
  show_start: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени (ЧЧ:ММ)')
    .optional(),
  
  doors_open: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени (ЧЧ:ММ)')
    .optional(),
  
  city: z.string()
    .min(2, 'Введите город')
    .max(100, 'Название города слишком длинное'),
  
  country: z.string()
    .min(2, 'Введите страну')
    .max(100, 'Название страны слишком длинное')
    .default('Россия'),
  
  venue_name: z.string()
    .min(2, 'Введите название площадки')
    .max(200, 'Название площадки слишком длинное'),
  
  venue_address: z.string()
    .max(500, 'Адрес слишком длинный')
    .optional(),
  
  venue_capacity: z.number()
    .min(1, 'Вместимость должна быть больше 0')
    .max(1000000, 'Вместимость слишком большая')
    .optional(),
  
  ticket_price_min: z.number()
    .min(0, 'Цена не может быть отрицательной')
    .max(1000000, 'Цена слишком высокая')
    .optional(),
  
  ticket_price_max: z.number()
    .min(0, 'Цена не может быть отрицательной')
    .max(1000000, 'Цена слишком высокая')
    .optional(),
  
  ticket_url: z.string()
    .url('Введите корректный URL')
    .optional()
    .or(z.literal('')),
  
  banner_url: z.string()
    .url('Введите корректный URL изображения')
    .optional()
    .or(z.literal('')),
  
  genre: z.string()
    .max(100, 'Жанр слишком длинный')
    .optional(),
}).refine((data) => {
  if (data.ticket_price_min && data.ticket_price_max) {
    return data.ticket_price_min <= data.ticket_price_max;
  }
  return true;
}, {
  message: 'Минимальная цена не может быть больше максимальной',
  path: ['ticket_price_max'],
});

export type ConcertFormData = z.infer<typeof concertSchema>;