-- =====================================================
-- PROMO.MUSIC - EXTENSIONS & TYPES
-- Enterprise маркетинговая экосистема для музыкантов
-- =====================================================

-- Расширения PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID генерация
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Криптография
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Полнотекстовый поиск
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- Расширенные индексы
CREATE EXTENSION IF NOT EXISTS "tablefunc";      -- Кросс-таблицы

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- Роли пользователей
CREATE TYPE user_role AS ENUM (
  'artist',           -- Артист
  'label',           -- Лейбл
  'manager',         -- Менеджер
  'curator',         -- Куратор плейлистов
  'radio_station',   -- Радиостанция
  'admin',           -- Администратор
  'moderator',       -- Модератор
  'support',         -- Техподдержка
  'partner'          -- Партнер/Реферал
);

-- Статусы пользователей
CREATE TYPE user_status AS ENUM (
  'active',          -- Активен
  'inactive',        -- Неактивен
  'suspended',       -- Заблокирован
  'pending',         -- Ожидает верификации
  'banned'           -- Забанен
);

-- Статусы питчинга
CREATE TYPE pitch_status AS ENUM (
  'draft',           -- Черновик
  'pending',         -- На модерации
  'approved',        -- Одобрен модератором
  'submitted',       -- Отправлен куратору
  'in_review',       -- На рассмотрении у куратора
  'accepted',        -- Принят в плейлист
  'rejected',        -- Отклонен
  'expired',         -- Истек срок
  'cancelled'        -- Отменен
);

-- Приоритеты питчинга
CREATE TYPE pitch_priority AS ENUM (
  'standard',        -- Стандартный
  'premium',         -- Премиум
  'express',         -- Экспресс (24ч)
  'guaranteed'       -- Гарантированное рассмотрение
);

-- Статусы модерации
CREATE TYPE moderation_status AS ENUM (
  'pending',         -- Ожидает проверки
  'in_progress',     -- В процессе
  'approved',        -- Одобрено
  'rejected',        -- Отклонено
  'flagged',         -- Помечено для ревью
  'appealed'         -- Подана апелляция
);

-- Типы транзакций
CREATE TYPE transaction_type AS ENUM (
  'deposit',         -- Пополнение
  'withdrawal',      -- Вывод
  'pitch_payment',   -- Оплата питчинга
  'subscription',    -- Подписка
  'refund',          -- Возврат
  'commission',      -- Комиссия
  'bonus',           -- Бонус
  'penalty',         -- Штраф
  'partner_payout'   -- Выплата партнеру
);

-- Статусы транзакций
CREATE TYPE transaction_status AS ENUM (
  'pending',         -- В обработке
  'processing',      -- Обрабатывается
  'completed',       -- Завершена
  'failed',          -- Ошибка
  'cancelled',       -- Отменена
  'refunded'         -- Возвращена
);

-- Платежные системы
CREATE TYPE payment_method AS ENUM (
  'card',            -- Банковская карта
  'paypal',          -- PayPal
  'stripe',          -- Stripe
  'crypto',          -- Криптовалюта
  'bank_transfer',   -- Банковский перевод
  'balance'          -- Баланс аккаунта
);

-- Типы тарифов
CREATE TYPE plan_type AS ENUM (
  'free',            -- Бесплатный
  'starter',         -- Начальный
  'professional',    -- Профессиональный
  'business',        -- Бизнес
  'enterprise',      -- Enterprise
  'custom'           -- Индивидуальный
);

-- Периоды подписки
CREATE TYPE billing_period AS ENUM (
  'monthly',         -- Ежемесячно
  'quarterly',       -- Ежеквартально
  'yearly',          -- Ежегодно
  'lifetime'         -- Навсегда
);

-- Типы скидок
CREATE TYPE discount_type AS ENUM (
  'percentage',      -- Процентная
  'fixed',           -- Фиксированная сумма
  'credits',         -- Кредиты/бонусы
  'free_pitches'     -- Бесплатные питчи
);

-- Статусы support тикетов
CREATE TYPE ticket_status AS ENUM (
  'open',            -- Открыт
  'waiting_response',-- Ожидает ответа
  'in_progress',     -- В работе
  'resolved',        -- Решен
  'closed',          -- Закрыт
  'escalated'        -- Эскалирован
);

-- Приоритеты тикетов
CREATE TYPE ticket_priority AS ENUM (
  'low',             -- Низкий
  'medium',          -- Средний
  'high',            -- Высокий
  'urgent',          -- Срочный
  'critical'         -- Критический
);

-- Типы уведомлений
CREATE TYPE notification_type AS ENUM (
  'pitch_status',    -- Статус питчинга
  'payment',         -- Платеж
  'message',         -- Сообщение
  'system',          -- Системное
  'marketing',       -- Маркетинговое
  'moderation',      -- Модерация
  'support',         -- Техподдержка
  'partner'          -- Партнерская программа
);

-- Жанры музыки
CREATE TYPE music_genre AS ENUM (
  'pop', 'rock', 'hip_hop', 'rap', 'rb', 'soul', 'funk',
  'electronic', 'house', 'techno', 'dubstep', 'dnb',
  'jazz', 'blues', 'country', 'folk', 'indie', 'alternative',
  'classical', 'metal', 'punk', 'reggae', 'latin', 'world',
  'ambient', 'experimental', 'other'
);

-- Платформы стриминга
CREATE TYPE streaming_platform AS ENUM (
  'spotify',
  'apple_music',
  'youtube_music',
  'soundcloud',
  'tidal',
  'deezer',
  'amazon_music',
  'other'
);

-- Статусы партнеров
CREATE TYPE partner_status AS ENUM (
  'active',          -- Активен
  'inactive',        -- Неактивен
  'suspended',       -- Приостановлен
  'pending_approval',-- Ожидает подтверждения
  'rejected'         -- Отклонен
);

-- Уровни партнеров
CREATE TYPE partner_tier AS ENUM (
  'bronze',          -- 3% комиссия
  'silver',          -- 5% комиссия
  'gold',            -- 7% комиссия
  'platinum',        -- 10% комиссия
  'diamond'          -- 15% комиссия
);

-- Статусы email кампаний
CREATE TYPE campaign_status AS ENUM (
  'draft',           -- Черновик
  'scheduled',       -- Запланирована
  'sending',         -- Отправляется
  'sent',            -- Отправлена
  'paused',          -- Приостановлена
  'cancelled'        -- Отменена
);

-- Типы логов
CREATE TYPE log_type AS ENUM (
  'info',            -- Информация
  'warning',         -- Предупреждение
  'error',           -- Ошибка
  'security',        -- Безопасность
  'audit'            -- Аудит
);

-- Типы контента для модерации
CREATE TYPE content_type AS ENUM (
  'track',           -- Трек
  'profile',         -- Профиль
  'message',         -- Сообщение
  'review',          -- Отзыв
  'comment',         -- Комментарий
  'avatar',          -- Аватар
  'cover'            -- Обложка
);

COMMENT ON TYPE user_role IS 'Роли пользователей в системе';
COMMENT ON TYPE pitch_status IS 'Статусы питчинга треков';
COMMENT ON TYPE transaction_type IS 'Типы финансовых транзакций';
COMMENT ON TYPE plan_type IS 'Типы тарифных планов';
COMMENT ON TYPE ticket_status IS 'Статусы тикетов техподдержки';
COMMENT ON TYPE notification_type IS 'Типы уведомлений';
COMMENT ON TYPE partner_tier IS 'Уровни партнерской программы с комиссией';