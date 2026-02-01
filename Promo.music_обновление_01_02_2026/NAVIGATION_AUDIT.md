# 🔍 АУДИТ НАВИГАЦИИ: КНОПКИ "НАЗАД"

## 📋 СТАТУС ПО РАЗДЕЛАМ

### ✅ ЕСТЬ КНОПКА "НАЗАД" (ArrowLeft):

1. **track-detail-page.tsx** ✅
   - Line 663: `<ArrowLeft className="w-5 h-5" />`
   - Текст: "Назад к трекам"
   - Функция: `onClick={onBack}`

2. **video-detail-page.tsx** ✅  
   - Line 680: `<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />`
   - Текст: "Назад к видео" (desktop) / "Назад" (mobile)
   - Функция: `onClick={onBack}`

---

### ⚠️ ТОЛЬКО X (НЕТ СТРЕЛОЧКИ):

3. **concert-form-modal.tsx** ⚠️
   - Line 87: Только `<X className="w-5 h-5" />`
   - НЕТ ArrowLeft
   - НЕТ текста "Назад"

4. **video-upload-modal.tsx** ❓ (нужно проверить)

5. **track-pitching-modal.tsx** ❓ (нужно проверить)

6. **video-pitching-modal.tsx** ❓ (нужно проверить)

7. **payment-method-modal.tsx** ❓ (нужно проверить)

8. **payment-confirmation-modal.tsx** ❓ (нужно проверить)

9. **payment-success-modal.tsx** ❓ (нужно проверить)

10. **coins-modal.tsx** ❓ (нужно проверить)

---

## 🎯 РЕКОМЕНДАЦИЯ

### Для ВСЕХ модальных окон:
Добавить кнопку "Назад" с ArrowLeft слева от заголовка:

```tsx
<div className="flex items-center justify-between p-6">
  {/* Кнопка назад */}
  <motion.button
    whileHover={{ scale: 1.05, x: -3 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleClose}
    className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="hidden sm:inline">Назад</span>
  </motion.button>

  {/* Заголовок */}
  <h2 className="text-2xl font-bold">...</h2>

  {/* X для закрытия */}
  <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg">
    <X className="w-5 h-5" />
  </button>
</div>
```

### Альтернативный вариант (компактный):
Заменить X на ArrowLeft + текст "Назад":

```tsx
<div className="flex items-center gap-4 p-6">
  {/* Только кнопка назад */}
  <motion.button
    whileHover={{ scale: 1.05, x: -3 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleClose}
    className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
  >
    <ArrowLeft className="w-5 h-5" />
    <span>Назад</span>
  </motion.button>

  {/* Заголовок */}
  <h2 className="text-2xl font-bold flex-1">...</h2>
</div>
```

---

## 🔧 ФАЙЛЫ ТРЕБУЮЩИЕ ИЗМЕНЕНИЙ:

1. `/src/app/components/concert-form-modal.tsx` ⚠️ СРОЧНО
2. `/src/app/components/video-upload-modal.tsx`
3. `/src/app/components/track-pitching-modal.tsx`
4. `/src/app/components/video-pitching-modal.tsx`
5. `/src/app/components/payment-method-modal.tsx`
6. `/src/app/components/payment-confirmation-modal.tsx`
7. `/src/app/components/payment-success-modal.tsx`
8. `/src/app/components/coins-modal.tsx`

---

## ✅ ПРЕИМУЩЕСТВА КНОПКИ "НАЗАД":

1. **UX**: Интуитивнее чем X
2. **Мобильность**: На смартфонах привычнее ArrowLeft
3. **Accessibility**: Понятнее для пользователей
4. **Консистентность**: Единый стиль во всех разделах
5. **iOS/Android паттерн**: Стандарт для мобильных приложений

---

**Дата аудита:** 26 января 2026  
**Приоритет:** ВЫСОКИЙ ⚡  
**Время на исправление:** 20-30 минут
