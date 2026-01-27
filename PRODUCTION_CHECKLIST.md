# ✅ PRODUCTION DEPLOYMENT CHECKLIST
## promo.music - Полный чеклист перед запуском

---

## 🎯 ВВЕДЕНИЕ

Этот чеклист поможет убедиться, что ваше приложение promo.music готово к production deployment и обеспечит:
- ✅ Безопасность данных пользователей
- ✅ Стабильную работу под нагрузкой
- ✅ Быстрый отклик интерфейса
- ✅ Соответствие best practices

---

## 📚 СОДЕРЖАНИЕ

1. [Supabase Configuration](#supabase-configuration)
2. [Database](#database)
3. [Security](#security)
4. [Performance](#performance)
5. [Frontend](#frontend)
6. [Monitoring](#monitoring)
7. [Legal & Compliance](#legal--compliance)
8. [Pre-Launch](#pre-launch)

---

## 🗄️ SUPABASE CONFIGURATION

### Project Settings

- [ ] **Project Plan:** Переключен на Pro ($25/month) или выше
- [ ] **Region:** Выбран ближайший к вашей аудитории (Europe/Frankfurt для России)
- [ ] **Database Password:** Сильный пароль (минимум 20 символов)
- [ ] **Connection Pooling:** Включен для большого числа подключений
- [ ] **Auto Pause:** Отключен (только для Pro plan)

### Environment Variables

```bash
# Production
- [ ] SUPABASE_URL установлен
- [ ] SUPABASE_ANON_KEY установлен
- [ ] SUPABASE_SERVICE_ROLE_KEY в секретах (не в frontend!)

# Optional
- [ ] STRIPE_PUBLIC_KEY (production)
- [ ] SENTRY_DSN
- [ ] PLAUSIBLE_DOMAIN
```

### Backups

- [ ] **Automatic Backups:** Включены (ежедневные)
- [ ] **Point-in-Time Recovery (PITR):** Включен (Pro plan)
- [ ] **Backup Retention:** Настроено (минимум 7 дней)
- [ ] **Test Restore:** Проведен тест восстановления из бэкапа

---

## 💾 DATABASE

### Schema

- [ ] **Все миграции применены:** `supabase db push`
- [ ] **Indexes созданы:** На часто запрашиваемых колонках
- [ ] **Foreign Keys:** Настроены с правильными ON DELETE действиями
- [ ] **Constraints:** Проверены все CHECK constraints
- [ ] **Triggers:** Работают корректно (updated_at, counters, etc)

### Row Level Security (RLS)

```sql
-- Критически важно!
- [ ] RLS включен на ВСЕХ таблицах
- [ ] SELECT policies тестированы
- [ ] INSERT policies тестированы
- [ ] UPDATE policies тестированы
- [ ] DELETE policies тестированы
- [ ] Нет policies, позволяющих доступ к чужим данным
```

### Performance

- [ ] **Indexes:**
  ```sql
  -- Проверить наличие индексов на:
  - [ ] profiles(username)
  - [ ] profiles(email)
  - [ ] tracks(user_id)
  - [ ] tracks(created_at)
  - [ ] messages(conversation_id)
  - [ ] messages(created_at)
  - [ ] play_events(track_id)
  - [ ] play_events(created_at)
  - [ ] notifications(user_id, is_read)
  ```

- [ ] **Query Performance:**
  ```sql
  -- Запустить EXPLAIN ANALYZE для медленных запросов
  EXPLAIN ANALYZE SELECT ...;
  
  -- Все основные запросы < 100ms
  ```

- [ ] **Connection Pooling:**
  ```
  Transaction mode: для коротких транзакций
  Session mode: для долгих соединений
  Max connections: настроено под нагрузку
  ```

### Data Integrity

- [ ] **Required Fields:** Все NOT NULL поля имеют значения по умолчанию
- [ ] **Unique Constraints:** Проверены (username, email, etc)
- [ ] **Cascading Deletes:** Настроены правильно
- [ ] **Data Validation:** Функции проверки работают

---

## 🔒 SECURITY

### Authentication

- [ ] **Email Verification:** Включена
- [ ] **Password Requirements:**
  - [ ] Минимум 8 символов
  - [ ] Сложность проверяется
  - [ ] Rate limiting на попытки входа

- [ ] **OAuth Providers:**
  - [ ] Google (если используется)
  - [ ] GitHub (если используется)
  - [ ] Callback URLs настроены правильно

- [ ] **Session Management:**
  - [ ] JWT expiration настроен (default 1 hour)
  - [ ] Refresh tokens работают
  - [ ] Logout очищает все сессии

- [ ] **2FA:**
  - [ ] TOTP доступен для пользователей
  - [ ] Backup codes генерируются
  - [ ] Recovery process работает

### API Security

- [ ] **Rate Limiting:**
  ```
  Auth endpoints: 10 req/min per IP
  API endpoints: 100 req/min per user
  File uploads: ограничения по размеру
  ```

- [ ] **CORS:**
  ```typescript
  // Только разрешенные домены
  allowed_origins: ['https://promo.music', 'https://www.promo.music']
  ```

- [ ] **API Keys:**
  - [ ] Anon key - только для frontend
  - [ ] Service role key - только для backend
  - [ ] Ротация ключей возможна

### Storage Security

- [ ] **Bucket Policies:**
  ```sql
  - [ ] Правильные размеры файлов
  - [ ] MIME types ограничены
  - [ ] Пользователи могут загружать только в свои папки
  - [ ] Публичный доступ только к публичным файлам
  ```

- [ ] **File Validation:**
  ```typescript
  - [ ] Проверка типа файла
  - [ ] Проверка размера
  - [ ] Проверка содержимого (image magic numbers)
  - [ ] Sanitization имен файлов
  ```

### Data Protection

- [ ] **PII (Personally Identifiable Information):**
  - [ ] Email захеширован в логах
  - [ ] Телефоны не видны публично
  - [ ] Адреса защищены RLS

- [ ] **Encryption:**
  - [ ] SSL/TLS включен (HTTPS everywhere)
  - [ ] Database encryption at rest (Supabase default)
  - [ ] Sensitive data encrypted

- [ ] **GDPR Compliance:**
  - [ ] Экспорт данных работает
  - [ ] Удаление данных работает
  - [ ] Privacy Policy написан
  - [ ] Cookie consent добавлен

---

## ⚡ PERFORMANCE

### Database Optimization

- [ ] **Connection Pooling:**
  ```
  Min connections: 5
  Max connections: 20 (для Pro plan)
  Idle timeout: 300s
  ```

- [ ] **Query Optimization:**
  ```sql
  - [ ] Использование indexes
  - [ ] Избегание N+1 queries
  - [ ] Pagination для больших списков
  - [ ] Денормализация где нужно (last_message в conversations)
  ```

- [ ] **Caching:**
  ```typescript
  - [ ] React Query для кэширования запросов
  - [ ] Stale-while-revalidate стратегия
  - [ ] Cache invalidation работает
  ```

### Storage Optimization

- [ ] **Image Optimization:**
  ```
  - [ ] WebP формат где возможно
  - [ ] Responsive images (srcset)
  - [ ] Lazy loading
  - [ ] CDN для статики
  ```

- [ ] **Audio/Video:**
  ```
  - [ ] Streaming вместо full download
  - [ ] Adaptive bitrate где возможно
  - [ ] Chunked uploads для больших файлов
  ```

### Frontend Performance

- [ ] **Bundle Size:**
  ```bash
  - [ ] < 500KB initial bundle (gzipped)
  - [ ] Code splitting по routes
  - [ ] Tree shaking работает
  - [ ] Unused deps удалены
  ```

- [ ] **Loading Performance:**
  ```
  - [ ] First Contentful Paint < 1.5s
  - [ ] Time to Interactive < 3.5s
  - [ ] Lighthouse score > 90
  ```

- [ ] **Runtime Performance:**
  ```
  - [ ] No memory leaks
  - [ ] useCallback/useMemo где нужно
  - [ ] Виртуализация длинных списков
  - [ ] Debounce на search inputs
  ```

### Real-time Performance

- [ ] **Channels:**
  ```
  - [ ] Максимум 1-2 активных канала на пользователя
  - [ ] Cleanup на unmount
  - [ ] Reconnection логика работает
  ```

- [ ] **Presence:**
  ```
  - [ ] Throttle updates (max 1/sec)
  - [ ] Cleanup неактивных пользователей
  ```

---

## 🎨 FRONTEND

### Code Quality

- [ ] **TypeScript:**
  ```bash
  - [ ] No `any` types (кроме исключений)
  - [ ] Strict mode включен
  - [ ] Build без errors
  - [ ] npm run build успешен
  ```

- [ ] **Linting:**
  ```bash
  - [ ] ESLint настроен
  - [ ] Prettier настроен
  - [ ] No warnings в production build
  ```

- [ ] **Testing:**
  ```bash
  - [ ] Unit tests для utils
  - [ ] Integration tests для hooks
  - [ ] E2E tests для critical paths
  - [ ] Test coverage > 70%
  ```

### UX/UI

- [ ] **Responsive Design:**
  ```
  - [ ] Mobile (320px+)
  - [ ] Tablet (768px+)
  - [ ] Desktop (1024px+)
  - [ ] Large screens (1920px+)
  ```

- [ ] **Accessibility (a11y):**
  ```
  - [ ] Semantic HTML
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Screen reader friendly
  - [ ] Color contrast WCAG AA
  ```

- [ ] **Loading States:**
  ```
  - [ ] Skeleton screens
  - [ ] Spinners для async operations
  - [ ] Progress bars для uploads
  - [ ] Optimistic updates где возможно
  ```

- [ ] **Error Handling:**
  ```
  - [ ] User-friendly error messages
  - [ ] Error boundaries
  - [ ] Network error handling
  - [ ] 404/500 pages
  ```

### SEO

- [ ] **Meta Tags:**
  ```html
  - [ ] Title уникален для каждой страницы
  - [ ] Description < 160 chars
  - [ ] Open Graph tags
  - [ ] Twitter Card tags
  - [ ] Canonical URLs
  ```

- [ ] **Performance:**
  ```
  - [ ] Core Web Vitals проходят
  - [ ] Sitemap.xml генерируется
  - [ ] robots.txt настроен
  - [ ] Schema.org markup добавлен
  ```

### Analytics

- [ ] **Tracking:**
  ```typescript
  - [ ] Page views
  - [ ] User events (play, donate, etc)
  - [ ] Conversion funnel
  - [ ] Error tracking
  ```

- [ ] **Privacy:**
  ```
  - [ ] Cookie consent
  - [ ] GDPR compliant
  - [ ] Opt-out доступен
  ```

---

## 📊 MONITORING

### Application Monitoring

- [ ] **Vercel Analytics:**
  ```
  - [ ] Установлен
  - [ ] Dashboard настроен
  - [ ] Alerts настроены
  ```

- [ ] **Error Tracking (Sentry):**
  ```typescript
  - [ ] Установлен
  - [ ] Source maps загружены
  - [ ] Release tracking
  - [ ] Email alerts настроены
  - [ ] Slack integration (опционально)
  ```

- [ ] **Performance Monitoring:**
  ```
  - [ ] Web Vitals отслеживаются
  - [ ] API latency мониторится
  - [ ] Database performance tracked
  ```

### Database Monitoring

- [ ] **Supabase Dashboard:**
  ```
  - [ ] Query performance tracked
  - [ ] Connection pool monitored
  - [ ] Storage usage tracked
  - [ ] API usage tracked
  ```

- [ ] **Alerts:**
  ```
  - [ ] High CPU usage > 80%
  - [ ] High memory usage > 80%
  - [ ] Slow queries > 1s
  - [ ] Connection pool exhaustion
  - [ ] Storage quota > 80%
  ```

### Uptime Monitoring

- [ ] **Uptime Service:**
  ```
  - [ ] UptimeRobot или аналог
  - [ ] Check every 5 minutes
  - [ ] Multi-location checks
  - [ ] Email/SMS alerts
  ```

- [ ] **Status Page:**
  ```
  - [ ] Публичная status page
  - [ ] Incident history
  - [ ] Scheduled maintenance
  ```

---

## ⚖️ LEGAL & COMPLIANCE

### Legal Documents

- [ ] **Terms of Service:**
  ```
  - [ ] Написаны и опубликованы
  - [ ] Ссылка в footer
  - [ ] Версия и дата обновления
  ```

- [ ] **Privacy Policy:**
  ```
  - [ ] Описаны собираемые данные
  - [ ] Цели использования
  - [ ] Права пользователей
  - [ ] Cookie policy
  - [ ] GDPR compliance
  ```

- [ ] **Cookie Consent:**
  ```
  - [ ] Banner на первом посещении
  - [ ] Описание cookies
  - [ ] Opt-in/opt-out
  - [ ] Настройки cookies
  ```

### Content Moderation

- [ ] **User Generated Content:**
  ```
  - [ ] Report/flag функционал
  - [ ] Moderation queue
  - [ ] Content guidelines
  - [ ] DMCA takedown процесс
  ```

- [ ] **Copyright:**
  ```
  - [ ] Watermarks на контенте (опционально)
  - [ ] Copyright notices
  - [ ] License information
  ```

### Payments & Monetization

- [ ] **Payment Provider:**
  ```
  - [ ] Production API keys
  - [ ] Webhook endpoints настроены
  - [ ] Test transactions проведены
  - [ ] Refund process работает
  ```

- [ ] **Taxes:**
  ```
  - [ ] НДС настроен (для России)
  - [ ] Tax reporting готов
  - [ ] Invoice generation
  ```

---

## 🚀 PRE-LAUNCH

### Final Testing

- [ ] **User Acceptance Testing (UAT):**
  ```
  - [ ] Тест всех основных флоу
  - [ ] Тест на реальных данных
  - [ ] Тест с реальными пользователями
  - [ ] Bug fixes завершены
  ```

- [ ] **Load Testing:**
  ```bash
  # Используйте k6, Artillery или аналог
  - [ ] 100 concurrent users
  - [ ] 1000 requests/minute
  - [ ] Spike test
  - [ ] Soak test (30 min)
  ```

- [ ] **Security Audit:**
  ```
  - [ ] Penetration testing
  - [ ] OWASP Top 10 проверены
  - [ ] Dependencies audit (npm audit)
  - [ ] No exposed secrets
  ```

### Deployment

- [ ] **Staging Environment:**
  ```
  - [ ] Deploy на staging
  - [ ] Full E2E test на staging
  - [ ] Performance test на staging
  - [ ] Sign-off от команды
  ```

- [ ] **Production Deployment:**
  ```bash
  - [ ] Git tag создан (v1.0.0)
  - [ ] Changelog написан
  - [ ] Database migrations applied
  - [ ] Environment variables проверены
  - [ ] Build successful
  - [ ] Deploy на Vercel
  - [ ] DNS настроен (если custom domain)
  - [ ] SSL certificate активен
  ```

### Post-Launch

- [ ] **Monitoring:**
  ```
  - [ ] Error rates < 1%
  - [ ] Response times < 500ms
  - [ ] Uptime > 99.9%
  - [ ] No critical bugs
  ```

- [ ] **Marketing:**
  ```
  - [ ] Press release готов
  - [ ] Social media posts
  - [ ] Product Hunt submission (опционально)
  - [ ] Email announcement
  ```

- [ ] **Support:**
  ```
  - [ ] Support email настроен
  - [ ] FAQ страница создана
  - [ ] Help docs написаны
  - [ ] On-call rotation (если команда)
  ```

---

## 📋 DAILY CHECKLIST (после запуска)

### Ежедневно

```bash
- [ ] Проверить error rate (Sentry)
- [ ] Проверить uptime (UptimeRobot)
- [ ] Проверить user feedback
- [ ] Проверить support tickets
- [ ] Review database performance
```

### Еженедельно

```bash
- [ ] Review analytics
- [ ] Check storage usage
- [ ] Review slow queries
- [ ] Update dependencies (patch versions)
- [ ] Backup verification
```

### Ежемесячно

```bash
- [ ] Security audit
- [ ] Performance review
- [ ] Cost optimization
- [ ] Feature planning
- [ ] User feedback analysis
```

---

## 🎯 КРИТИЧЕСКИЕ ПУНКТЫ (MUST HAVE)

### Перед запуском ОБЯЗАТЕЛЬНО:

```bash
✅ RLS включен на всех таблицах
✅ HTTPS работает
✅ Backups настроены
✅ Error tracking работает
✅ Rate limiting включен
✅ Storage policies настроены
✅ Email verification работает
✅ Privacy Policy опубликован
✅ Error pages (404, 500) работают
✅ Mobile responsive working
```

---

## 📞 EMERGENCY CONTACTS

### На случай проблем:

```yaml
Supabase Support:
  Email: support@supabase.io
  Dashboard: https://supabase.com/dashboard

Vercel Support:
  Email: support@vercel.com
  Dashboard: https://vercel.com/support

DNS Provider:
  Cloudflare: https://dash.cloudflare.com

Payment Provider:
  Stripe: https://dashboard.stripe.com
  YooKassa: https://yookassa.ru
```

---

## 🎊 LAUNCH DAY CHECKLIST

### За 1 день до запуска:

```bash
- [ ] Final staging test
- [ ] Team briefing
- [ ] Support готова отвечать
- [ ] Rollback plan готов
- [ ] Monitoring alerts настроены
- [ ] Marketing materials готовы
```

### В день запуска:

```bash
09:00 - [ ] Deploy на production
09:30 - [ ] Smoke tests
10:00 - [ ] Monitoring check
11:00 - [ ] Public announcement
12:00 - [ ] Monitor user feedback
15:00 - [ ] First metrics review
18:00 - [ ] End of day review
```

### После запуска:

```bash
Day 1:  - [ ] Hourly monitoring
Day 2-7: - [ ] Daily review
Week 2+: - [ ] Weekly review
```

---

## ✅ ГОТОВО К ЗАПУСКУ!

Если все пункты в этом чеклисте отмечены, ваше приложение **promo.music** готово к production!

### Следующие шаги:

1. ✅ Финальная проверка всех пунктов
2. 🚀 Deploy на production
3. 📊 Мониторинг первых 24 часов
4. 🎉 Празднование запуска!
5. 🔄 Итерация на основе feedback

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Best Practices](https://react.dev)
- [Web Vitals](https://web.dev/vitals)
- [OWASP Top 10](https://owasp.org/www-project-top-ten)
- [GDPR Compliance](https://gdpr.eu)

---

**Удачного запуска! 🚀🎉**
