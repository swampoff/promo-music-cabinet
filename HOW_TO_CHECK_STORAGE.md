# 🧪 КАК ПРОВЕРИТЬ STORAGE

## ⚡ САМЫЙ ПРОСТОЙ СПОСОБ (РЕКОМЕНДУЕТСЯ)

### **Вариант 1: Через кнопку в приложении** ⭐

1. **Откройте ваше приложение** в браузере (preview в Figma Make)

2. **Найдите кнопку** с иконкой базы данных (Database) в правом нижнем углу
   - Голубая круглая кнопка
   - Над кнопкой "Demo Data"

3. **Нажмите на кнопку** → Откроется тестовая панель

4. **Нажмите "Refresh"** → Тест запустится автоматически

5. **Проверьте результат**:
   - ✅ **Зелёный** = Storage работает отлично!
   - ❌ **Красный** = Есть проблемы

6. **Ожидаемый результат**:
```json
Storage Status: {
  "success": true,
  "initialized": true,
  "buckets": [...]
}

Buckets: {
  "success": true,
  "buckets": [
    "make-84730125-concert-banners",
    "make-84730125-artist-avatars",
    "make-84730125-track-covers",
    "make-84730125-audio-files",
    "make-84730125-video-files",
    "make-84730125-campaign-attachments"
  ]
}
```

---

## 🌐 СПОСОБ 2: Через Supabase Dashboard

### **Шаг 1: Откройте Dashboard**
```
https://supabase.com/dashboard
```

### **Шаг 2: Выберите проект**
Найдите ваш проект Promo.Music

### **Шаг 3: Проверьте Edge Functions**
1. Левое меню → **Edge Functions**
2. Выберите **make-server-84730125**
3. Вкладка **Logs**

**Должны увидеть**:
```
🚀 Starting Promo.Music Server...
✅ Storage initialized successfully
📦 Buckets created: [...]
```

или

```
🚀 Starting Promo.Music Server...
✅ Storage initialized successfully
📦 All buckets already exist
```

### **Шаг 4: Проверьте Storage**
1. Левое меню → **Storage**
2. Должны увидеть **6 buckets**:

| Bucket | Тип | Лимит | Назначение |
|--------|-----|-------|------------|
| make-84730125-concert-banners | public | 5 MB | Баннеры концертов |
| make-84730125-artist-avatars | public | 2 MB | Аватары артистов |
| make-84730125-track-covers | public | 3 MB | Обложки треков |
| make-84730125-audio-files | private | 50 MB | Аудио файлы |
| make-84730125-video-files | private | 200 MB | Видео файлы |
| make-84730125-campaign-attachments | private | 10 MB | Вложения рассылок |

---

## 🔍 СПОСОБ 3: Через браузер (напрямую)

### **Найдите ваш Project ID**:
1. Dashboard → Settings → General → Reference ID
2. Или откройте `/utils/supabase/info.tsx`

### **Проверьте URL'ы** (замените YOUR_PROJECT_ID):

#### **1. Health Check**:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/health
```

**Ожидается**:
```json
{"status":"ok","timestamp":"2026-01-26T..."}
```

#### **2. Storage Status**:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/storage/status
```

**Ожидается**:
```json
{
  "success": true,
  "initialized": true,
  "buckets": [
    "make-84730125-concert-banners",
    "make-84730125-artist-avatars",
    "make-84730125-track-covers",
    "make-84730125-audio-files",
    "make-84730125-video-files",
    "make-84730125-campaign-attachments"
  ]
}
```

#### **3. Storage Buckets (детально)**:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/storage/buckets
```

**Ожидается**: Массив из 6 buckets с деталями

---

## 🖥️ СПОСОБ 4: Через консоль браузера

### **Шаг 1: Откройте приложение**

### **Шаг 2: Откройте Console**
Нажмите **F12** → вкладка **Console**

### **Шаг 3: Выполните код**:
```javascript
// Получить project ID и API key
import('@/utils/supabase/info').then(info => {
  console.log('Project ID:', info.projectId);
  console.log('Public Key:', info.publicAnonKey ? '✅ Loaded' : '❌ Missing');
  
  // Проверить Storage
  const url = `https://${info.projectId}.supabase.co/functions/v1/make-server-84730125/storage/status`;
  
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${info.publicAnonKey}`,
    },
  })
    .then(r => r.json())
    .then(data => {
      console.log('✅ Storage Status:', data);
      
      if (data.success && data.initialized) {
        console.log('🎉 Storage работает отлично!');
        console.log('📦 Buckets:', data.buckets.length);
        data.buckets.forEach(b => console.log('  -', b));
      } else {
        console.log('❌ Проблема с Storage');
      }
    })
    .catch(err => console.error('❌ Error:', err));
});
```

---

## ✅ ЧТО ДОЛЖНО БЫТЬ

### **Storage Status**:
```json
{
  "success": true,
  "initialized": true,
  "buckets": [
    "make-84730125-concert-banners",
    "make-84730125-artist-avatars",
    "make-84730125-track-covers",
    "make-84730125-audio-files",
    "make-84730125-video-files",
    "make-84730125-campaign-attachments"
  ]
}
```

### **Buckets (6 штук)**:
1. ✅ concert-banners (public, 5 MB)
2. ✅ artist-avatars (public, 2 MB)
3. ✅ track-covers (public, 3 MB)
4. ✅ audio-files (private, 50 MB)
5. ✅ video-files (private, 200 MB)
6. ✅ campaign-attachments (private, 10 MB)

---

## ❌ ЕСЛИ ЧТО-ТО НЕ ТАК

### **Ошибка "Failed to fetch"**:
- Проверьте что Edge Function развёрнут
- Проверьте Project ID
- Обновите страницу (F5)

### **Ошибка "Storage initialization failed"**:
- Проверьте логи Edge Function
- Убедитесь что Storage включён в проекте
- Проверьте права доступа

### **Buckets не созданы**:
- Посмотрите логи сервера в Dashboard
- Проверьте что сервер запустился
- Попробуйте перезапустить Edge Function

### **Некоторые buckets отсутствуют**:
- Проверьте логи на ошибки
- Попробуйте создать bucket вручную через Dashboard
- Убедитесь что квота Storage не исчерпана

---

## 🎯 БЫСТРАЯ ПРОВЕРКА

### **3 шага за 30 секунд**:

1. **Откройте приложение**
2. **Нажмите кнопку Database** (правый нижний угол)
3. **Проверьте зелёные галочки** ✅

**Готово!**

---

## 📊 ПРОВЕРОЧНЫЙ СПИСОК

- [ ] Приложение открывается
- [ ] Кнопка "Database" видна в правом нижнем углу
- [ ] При клике открывается тестовая панель
- [ ] Storage Status показывает success: true
- [ ] Видно 6 buckets
- [ ] Buckets имеют правильные названия
- [ ] 3 bucket'а public, 3 private
- [ ] Нет ошибок в консоли

---

## 🔧 ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ

### **Проверка загрузки файлов** (опционально):

Через API:
```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/storage/upload \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "make-84730125-concert-banners",
    "filePath": "test.jpg",
    "contentType": "image/jpeg"
  }'
```

### **Проверка статистики**:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/storage/stats
```

---

## 📞 ПОМОЩЬ

### **Всё работает?** ✅
Отлично! Storage полностью настроен и готов к использованию.

### **Есть проблемы?** ❌
1. Проверьте `/STORAGE_FIX.md` - описание исправления
2. Посмотрите логи Edge Function в Dashboard
3. Убедитесь что файл `/supabase/functions/server/storage-setup.tsx` обновлён

---

## 🎉 ИТОГ

После проверки вы должны увидеть:
- ✅ Storage initialized: true
- ✅ 6 buckets созданы
- ✅ Правильные лимиты (5/2/3/50/200/10 MB)
- ✅ 3 public + 3 private buckets
- ✅ Нет ошибок

**Статус**: 🚀 Storage Ready!

---

**Дата**: 26 января 2026  
**Версия**: 5.0.0  
**Проверка**: 30 секунд ⚡  
**Способов**: 4 варианта ✨