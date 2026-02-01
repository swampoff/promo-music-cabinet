// Validation utilities for promo.music platform

// Countries and cities data
export const countries = ['Россия', 'Украина', 'Беларусь', 'Казахстан', 'Азербайджан', 'Армения', 'Грузия', 'Узбекистан', 'Другая'];

export const citiesByCountry: Record<string, string[]> = {
  'Россия': ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону', 'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград', 'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Другой'],
  'Украина': ['Киев', 'Харьков', 'Одесса', 'Днепр', 'Донецк', 'Запорожье', 'Львов', 'Кривой Рог', 'Николаев', 'Мариуполь', 'Луганск', 'Винница', 'Херсон', 'Полтава', 'Чернигов', 'Черкассы', 'Другой'],
  'Беларусь': ['Минск', 'Гомель', 'Могилев', 'Витебск', 'Гродно', 'Брест', 'Бобруйск', 'Барановичи', 'Борисов', 'Пинск', 'Другой'],
  'Казахстан': ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау', 'Другой'],
  'Азербайджан': ['Баку', 'Гянджа', 'Сумгаит', 'Мингечевир', 'Нахичевань', 'Ленкорань', 'Другой'],
  'Армения': ['Ереван', 'Гюмри', 'Ванадзор', 'Вагаршапат', 'Раздан', 'Абовян', 'Другой'],
  'Грузия': ['Тбилиси', 'Кутаиси', 'Батуми', 'Рустави', 'Зугдиди', 'Гори', 'Другой'],
  'Узбекистан': ['Ташкент', 'Самарканд', 'Наманган', 'Андижан', 'Бухара', 'Фергана', 'Нукус', 'Другой'],
  'Другая': ['Другой'],
};

// Email validation
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return null; // Optional field
  }
  
  if (/[а-яА-ЯёЁ]/.test(email)) {
    return 'Email не может содержать кириллицу';
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Некорректный формат email';
  }
  
  return null;
}

// Phone validation
export function validatePhone(phone: string): string | null {
  if (!phone.trim()) {
    return null; // Optional field
  }
  
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!phone.startsWith('+')) {
    return 'Телефон должен начинаться с +';
  }
  
  if (digitsOnly.length !== 11 || !digitsOnly.startsWith('7')) {
    return 'Формат: +7 (XXX) XXX-XX-XX (11 цифр)';
  }
  
  return null;
}

// Format phone as user types: +7 (XXX) XXX-XX-XX
export function formatPhone(value: string): string {
  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +7
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  if (cleaned.length > 1 && !cleaned.startsWith('+7')) {
    cleaned = '+7' + cleaned.slice(1);
  }
  
  // Extract digits only (without +)
  const digits = cleaned.slice(1);
  
  // Format: +7 (XXX) XXX-XX-XX
  let formatted = '+7';
  if (digits.length > 1) {
    formatted += ' (' + digits.slice(1, 4);
  }
  if (digits.length >= 4) {
    formatted += ') ' + digits.slice(4, 7);
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(7, 9);
  }
  if (digits.length >= 9) {
    formatted += '-' + digits.slice(9, 11);
  }
  
  // Limit to 11 digits (18 characters with formatting)
  return formatted.slice(0, 18);
}
