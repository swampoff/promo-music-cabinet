import { z } from 'zod';

export const performanceHistorySchema = z.object({
  event_name: z.string()
    .min(3, 'Название события должно содержать минимум 3 символа')
    .max(200, 'Название слишком длинное'),
  
  venue_name: z.string()
    .min(2, 'Введите название площадки')
    .max(200, 'Название площадки слишком длинное'),
  
  city: z.string()
    .min(2, 'Введите город')
    .max(100, 'Название города слишком длинное'),
  
  date: z.string()
    .min(1, 'Выберите дату выступления')
    .refine((date) => {
      const performanceDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return performanceDate <= today;
    }, 'Дата выступления не может быть в будущем (это история)'),
  
  audience_size: z.number()
    .min(0, 'Размер аудитории не может быть отрицательным')
    .max(1000000, 'Размер аудитории слишком большой')
    .optional(),
  
  type: z.enum([
    'Концерт',
    'Фестиваль',
    'Клубное выступление',
    'Арена шоу',
    'Уличный концерт',
    'Акустический сет',
    'DJ сет',
    'Другое'
  ], {
    errorMap: () => ({ message: 'Выберите тип выступления' })
  }),
  
  description: z.string()
    .max(2000, 'Описание слишком длинное')
    .optional(),
  
  photos: z.array(z.string().url('Неверный URL фотографии'))
    .max(10, 'Максимум 10 фотографий')
    .optional(),
});

export type PerformanceHistoryFormData = z.infer<typeof performanceHistorySchema>;
