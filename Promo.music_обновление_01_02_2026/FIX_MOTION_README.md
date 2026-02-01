# ИСПРАВЛЕНИЕ - ИМПОРТ MOTION

## Проблема
В 28 файлах используется неправильный импорт: `from 'motion/react'`  
Нужно заменить на: `from 'motion'`

## Файлы для исправления

✅ ИСПРАВЛЕНО:
- /src/app/App.tsx
- /src/app/components/stats-cards.tsx
- /src/app/components/home-page.tsx  
- /src/app/components/coins-modal.tsx

❌ ТРЕБУЕТ ИСПРАВЛЕНИЯ:
- /src/app/components/tracks-page.tsx
- /src/app/components/upload-page.tsx
- /src/app/components/profile-page.tsx
- /src/app/components/video-page.tsx
- /src/app/components/concerts-page.tsx
- /src/app/components/news-page.tsx
- /src/app/components/rating-page.tsx
- /src/app/components/messages-page.tsx
- /src/app/components/settings-page.tsx
- /src/app/components/public-content-manager.tsx
- /src/app/components/track-pitching-modal.tsx
- /src/app/components/video-pitching-modal.tsx
- /src/app/components/video-upload-modal.tsx
- /src/app/components/concert-upload-modal.tsx
- /src/app/components/promoted-concerts-sidebar.tsx
- /src/app/components/promoted-news-block.tsx
- /src/app/components/donations-page.tsx
- /src/app/components/pitching-page.tsx
- /src/app/components/payment-method-modal.tsx
- /src/app/components/payment-confirmation-modal.tsx
- /src/app/components/payment-success-modal.tsx
- /src/app/components/analytics-page.tsx
- /src/app/components/track-detail-page.tsx
- /src/app/components/video-detail-page.tsx
- /src/app/components/demo-data-button.tsx

## Команда для замены (если есть доступ к sed)

```bash
find src -name "*.tsx" -type f -exec sed -i "s/from 'motion\/react'/from 'motion'/g" {} \;
```

## Альтернатива - VS Code

1. Откройте VS Code
2. Нажмите Ctrl+Shift+F (поиск во всех файлах)
3. Введите: `from 'motion/react'`
4. Замените на: `from 'motion'`
5. Нажмите "Replace All"

## Альтернатива - вручную

Замените в каждом файле строку:
```tsx
import { motion } from 'motion/react';
```
на:
```tsx
import { motion } from 'motion';
```

или:
```tsx
import { motion, AnimatePresence } from 'motion/react';
```
на:
```tsx
import { motion, AnimatePresence } from 'motion';
```
