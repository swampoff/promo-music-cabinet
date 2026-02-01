# ⚡ QUICK START - Концерты с Postgres

## 🎯 ЗА 5 МИНУТ

### Вариант 1: С Postgres (Полноценный)

```bash
# 1. Открыть Supabase Dashboard
https://app.supabase.com/project/[your-project]/editor

# 2. SQL Editor -> New Query
# 3. Вставить содержимое файла:
/supabase/migrations/20260126_create_concerts_tables.sql

# 4. Run (F5)
# 5. Deploy!
```

### Вариант 2: Без Postgres (Mock данные)

```bash
# Просто задеплоить!
git push

# Адаптер автоматически использует mock данные
# Всё будет работать "из коробки"
```

---

## 📦 ЧТО БЫЛО СОЗДАНО

```
✅ SQL миграция             (/supabase/migrations/)
✅ TypeScript типы           (/src/types/database.ts)
✅ Backend API               (/supabase/functions/server/concerts-routes.tsx)
✅ Frontend API Service      (/src/services/concerts-api.ts)
✅ Fallback Adapter          (/src/services/concerts-api-adapter.ts)
✅ React компонент           (/src/app/components/my-concerts-page.tsx)
✅ Документация              (/ARCHITECTURE.md)
✅ Deploy чек-лист           (/DEPLOY_CHECKLIST.md)
```

---

## 🎨 КАК ИСПОЛЬЗОВАТЬ

### В коде:

```typescript
import { MyConcertsPage } from '@/app/components/my-concerts-page';

// В App.tsx или где используется:
<MyConcertsPage 
  userCoins={coins} 
  onCoinsUpdate={setCoins} 
/>
```

### Создать концерт:

```typescript
import { concertsApiAdapter } from '@/services/concerts-api-adapter';

const response = await concertsApiAdapter.create({
  title: 'My Concert',
  venue_name: 'Олимпийский',
  city: 'Москва',
  date: '2026-06-15',
  show_start: '19:00',
  event_type: 'Концерт'
});
```

---

## 🔧 ГЛАВНЫЕ ФИЧИ

1. **Автоматический Fallback** - работает с/без Postgres
2. **Type-safe API** - полная типизация TypeScript
3. **RLS Security** - безопасность на уровне базы
4. **Glassmorphism UI** - красивый дизайн
5. **Real-time Updates** - мгновенное обновление
6. **Moderation System** - система модерации
7. **Promotion System** - продвижение за коины
8. **Analytics** - просмотры и клики

---

## ⚠️ ВАЖНО!

- Компонент **безопасен для деплоя** - не сломает ничего
- Если Postgres не настроен - **автоматически использует mock данные**
- Все ошибки **gracefully handled**
- **Нет breaking changes** - старый код продолжит работать

---

## 📊 СТАТУС

| Компонент | Статус |
|-----------|--------|
| SQL Migration | ✅ Ready |
| Backend API | ✅ Ready |
| Frontend | ✅ Ready |
| Types | ✅ Ready |
| Docs | ✅ Ready |
| **DEPLOY** | ✅ **READY!** |

---

## 🚀 ДЕПЛОЙ СЕЙЧАС

```bash
git add .
git commit -m "feat: concerts with Postgres + fallback"
git push
```

Всё! 🎉
