/**
 * PROMO LAB EXTENDED TABLES - РАСШИРЕННАЯ СИСТЕМА PROMO LAB
 * Дата создания: 28 января 2026
 * 
 * Дополнение к базовой таблице promo_lab_experiments из 001_promotion_tables.sql
 * 
 * Структура:
 * 1. promo_lab_experiments - уже существует (базовая)
 * 2. promo_lab_events - события эксперимента (NEW)
 * 3. promo_lab_metrics_daily - дневная аналитика (NEW)
 * 4. promo_lab_insights - инсайты и выводы (NEW)
 * 5. promo_lab_resources - ресурсы эксперимента (NEW)
 */

-- ============================================================================
-- 1. PROMO LAB EVENTS - СОБЫТИЯ ЭКСПЕРИМЕНТА
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_lab_events (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES promo_lab_experiments(id) ON DELETE CASCADE,
  
  -- Event info
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'started',           -- Эксперимент запущен
      'milestone',         -- Промежуточная веха достигнута
      'insight',           -- Получен новый инсайт
      'optimization',      -- Произведена оптимизация
      'pause',             -- Приостановлен
      'resume',            -- Возобновлён
      'completed',         -- Завершён
      'failed',            -- Провалился
      'cancelled',         -- Отменён
      'external_event'     -- Внешнее событие (упоминание в медиа, вирусность и т.д.)
    )
  ),
  
  event_title TEXT NOT NULL,
  event_description TEXT,
  
  -- Metrics at this moment
  metrics_snapshot JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  triggered_by TEXT, -- 'auto' | 'manual' | 'ai'
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'success', 'error')),
  
  -- Attachments
  attachments TEXT[], -- URLs к скриншотам, видео, документам
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_lab_events_experiment ON promo_lab_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_lab_events_type ON promo_lab_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lab_events_created ON promo_lab_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_events_severity ON promo_lab_events(severity);

-- Комментарии
COMMENT ON TABLE promo_lab_events IS 'События и вехи эксперимента Promo Lab';
COMMENT ON COLUMN promo_lab_events.event_type IS 'Тип события в жизненном цикле эксперимента';
COMMENT ON COLUMN promo_lab_events.metrics_snapshot IS 'Снимок метрик на момент события';

-- ============================================================================
-- 2. PROMO LAB METRICS DAILY - ДНЕВНАЯ АНАЛИТИКА
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_lab_metrics_daily (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES promo_lab_experiments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Reach metrics
  reach INTEGER DEFAULT 0,                    -- Охват
  impressions INTEGER DEFAULT 0,              -- Показы
  unique_views INTEGER DEFAULT 0,             -- Уникальные просмотры
  
  -- Engagement metrics
  engagement_rate DECIMAL(5, 2) DEFAULT 0,    -- Вовлечённость (%)
  likes INTEGER DEFAULT 0,                    -- Лайки
  comments INTEGER DEFAULT 0,                 -- Комментарии
  shares INTEGER DEFAULT 0,                   -- Репосты
  saves INTEGER DEFAULT 0,                    -- Сохранения
  
  -- Conversion metrics
  conversions INTEGER DEFAULT 0,              -- Конверсии (клики, переходы, подписки)
  conversion_rate DECIMAL(5, 2) DEFAULT 0,    -- Конверсия (%)
  leads INTEGER DEFAULT 0,                    -- Лиды
  
  -- Viral metrics (для вирусных челленджей)
  viral_coefficient DECIMAL(5, 2) DEFAULT 0,  -- Вирусный коэффициент
  ugc_count INTEGER DEFAULT 0,                -- UGC контент
  trending_score INTEGER DEFAULT 0,           -- Трендовость (0-100)
  
  -- Cost metrics
  spend DECIMAL(10, 2) DEFAULT 0,             -- Потрачено за день
  cpm DECIMAL(10, 2) DEFAULT 0,               -- Cost per mille
  cpc DECIMAL(10, 2) DEFAULT 0,               -- Cost per click
  cpa DECIMAL(10, 2) DEFAULT 0,               -- Cost per acquisition
  
  -- AI metrics (для AI-таргетинга)
  ai_confidence DECIMAL(5, 2) DEFAULT 0,      -- Уверенность AI (0-100)
  prediction_accuracy DECIMAL(5, 2) DEFAULT 0, -- Точность предсказаний (%)
  
  -- Sentiment
  sentiment_score DECIMAL(5, 2) DEFAULT 0,    -- Тональность (-100 до +100)
  positive_mentions INTEGER DEFAULT 0,        -- Позитивные упоминания
  negative_mentions INTEGER DEFAULT 0,        -- Негативные упоминания
  
  -- Additional data
  raw_data JSONB DEFAULT '{}'::jsonb,         -- Сырые данные для хранения любых метрик
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(experiment_id, date)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_lab_metrics_experiment ON promo_lab_metrics_daily(experiment_id);
CREATE INDEX IF NOT EXISTS idx_lab_metrics_date ON promo_lab_metrics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_lab_metrics_trending ON promo_lab_metrics_daily(trending_score DESC);

-- Комментарии
COMMENT ON TABLE promo_lab_metrics_daily IS 'Дневная детальная аналитика экспериментов';
COMMENT ON COLUMN promo_lab_metrics_daily.viral_coefficient IS 'K-factor: сколько новых пользователей привёл один пользователь';
COMMENT ON COLUMN promo_lab_metrics_daily.sentiment_score IS 'Анализ тональности упоминаний';

-- ============================================================================
-- 3. PROMO LAB INSIGHTS - ИНСАЙТЫ И ВЫВОДЫ
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_lab_insights (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES promo_lab_experiments(id) ON DELETE CASCADE,
  
  -- Insight info
  insight_type TEXT NOT NULL CHECK (
    insight_type IN (
      'discovery',         -- Открытие
      'optimization',      -- Рекомендация по оптимизации
      'warning',           -- Предупреждение
      'success_pattern',   -- Успешный паттерн
      'failure_pattern',   -- Провальный паттерн
      'ai_recommendation', -- Рекомендация AI
      'market_trend'       -- Рыночный тренд
    )
  ),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Impact
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  confidence DECIMAL(5, 2) DEFAULT 0,  -- Уверенность в инсайте (0-100%)
  
  -- Supporting data
  supporting_metrics JSONB DEFAULT '{}'::jsonb,
  evidence_urls TEXT[],  -- Ссылки на доказательства
  
  -- Action
  actionable BOOLEAN DEFAULT TRUE,
  recommended_action TEXT,
  action_taken BOOLEAN DEFAULT FALSE,
  action_result TEXT,
  
  -- AI generated
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_model TEXT,  -- 'gpt-4', 'claude', etc.
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'applied', 'dismissed', 'outdated')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_lab_insights_experiment ON promo_lab_insights(experiment_id);
CREATE INDEX IF NOT EXISTS idx_lab_insights_type ON promo_lab_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_lab_insights_importance ON promo_lab_insights(importance);
CREATE INDEX IF NOT EXISTS idx_lab_insights_status ON promo_lab_insights(status);
CREATE INDEX IF NOT EXISTS idx_lab_insights_created ON promo_lab_insights(created_at DESC);

-- Комментарии
COMMENT ON TABLE promo_lab_insights IS 'Инсайты и выводы из экспериментов';
COMMENT ON COLUMN promo_lab_insights.confidence IS 'Уверенность в корректности инсайта';
COMMENT ON COLUMN promo_lab_insights.ai_generated IS 'Инсайт сгенерирован AI или создан вручную';

-- ============================================================================
-- 4. PROMO LAB RESOURCES - РЕСУРСЫ ЭКСПЕРИМЕНТА
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_lab_resources (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES promo_lab_experiments(id) ON DELETE CASCADE,
  
  -- Resource info
  resource_type TEXT NOT NULL CHECK (
    resource_type IN (
      'creative',          -- Креатив (изображение, видео)
      'landing_page',      -- Лендинг
      'smart_contract',    -- Смарт-контракт (для NFT)
      'influencer',        -- Инфлюенсер
      'ad_copy',           -- Рекламный текст
      'dataset',           -- Датасет (для AI)
      'documentation',     -- Документация
      'report',            -- Отчёт
      'other'
    )
  ),
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Files
  file_url TEXT,
  file_type TEXT,  -- 'image/png', 'video/mp4', 'application/pdf', etc.
  file_size INTEGER, -- bytes
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Performance (если применимо)
  performance_score DECIMAL(5, 2),  -- Эффективность ресурса (0-100)
  usage_count INTEGER DEFAULT 0,    -- Сколько раз использован
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_lab_resources_experiment ON promo_lab_resources(experiment_id);
CREATE INDEX IF NOT EXISTS idx_lab_resources_type ON promo_lab_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_lab_resources_status ON promo_lab_resources(status);
CREATE INDEX IF NOT EXISTS idx_lab_resources_created ON promo_lab_resources(created_at DESC);

-- Комментарии
COMMENT ON TABLE promo_lab_resources IS 'Ресурсы и материалы эксперимента';
COMMENT ON COLUMN promo_lab_resources.performance_score IS 'Эффективность ресурса по результатам A/B тестов';

-- ============================================================================
-- 5. ФУНКЦИИ - АВТОМАТИЗАЦИЯ
-- ============================================================================

-- Функция: Обновление updated_at при изменении записи
CREATE OR REPLACE FUNCTION update_promo_lab_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_lab_metrics_updated_at ON promo_lab_metrics_daily;
CREATE TRIGGER trigger_update_lab_metrics_updated_at
  BEFORE UPDATE ON promo_lab_metrics_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_lab_updated_at();

DROP TRIGGER IF EXISTS trigger_update_lab_insights_updated_at ON promo_lab_insights;
CREATE TRIGGER trigger_update_lab_insights_updated_at
  BEFORE UPDATE ON promo_lab_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_lab_updated_at();

DROP TRIGGER IF EXISTS trigger_update_lab_resources_updated_at ON promo_lab_resources;
CREATE TRIGGER trigger_update_lab_resources_updated_at
  BEFORE UPDATE ON promo_lab_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_lab_updated_at();

-- Функция: Автоматический расчёт метрик
CREATE OR REPLACE FUNCTION calculate_promo_lab_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Рассчитываем engagement_rate
  IF NEW.impressions > 0 THEN
    NEW.engagement_rate = ((NEW.likes + NEW.comments + NEW.shares + NEW.saves)::DECIMAL / NEW.impressions::DECIMAL) * 100;
  ELSE
    NEW.engagement_rate = 0;
  END IF;
  
  -- Рассчитываем conversion_rate
  IF NEW.unique_views > 0 THEN
    NEW.conversion_rate = (NEW.conversions::DECIMAL / NEW.unique_views::DECIMAL) * 100;
  ELSE
    NEW.conversion_rate = 0;
  END IF;
  
  -- Рассчитываем CPM
  IF NEW.impressions > 0 AND NEW.spend > 0 THEN
    NEW.cpm = (NEW.spend / (NEW.impressions::DECIMAL / 1000));
  ELSE
    NEW.cpm = 0;
  END IF;
  
  -- Рассчитываем CPC
  IF NEW.conversions > 0 AND NEW.spend > 0 THEN
    NEW.cpc = NEW.spend / NEW.conversions::DECIMAL;
  ELSE
    NEW.cpc = 0;
  END IF;
  
  -- Рассчитываем CPA
  IF NEW.leads > 0 AND NEW.spend > 0 THEN
    NEW.cpa = NEW.spend / NEW.leads::DECIMAL;
  ELSE
    NEW.cpa = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического расчёта метрик
DROP TRIGGER IF EXISTS trigger_calculate_lab_metrics ON promo_lab_metrics_daily;
CREATE TRIGGER trigger_calculate_lab_metrics
  BEFORE INSERT OR UPDATE ON promo_lab_metrics_daily
  FOR EACH ROW
  EXECUTE FUNCTION calculate_promo_lab_metrics();

-- Функция: Создание события при изменении статуса эксперимента
CREATE OR REPLACE FUNCTION log_experiment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO promo_lab_events (
      experiment_id,
      event_type,
      event_title,
      event_description,
      triggered_by,
      severity
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.status = 'running' THEN 'started'
        WHEN NEW.status = 'completed' THEN 'completed'
        WHEN NEW.status = 'failed' THEN 'failed'
        WHEN NEW.status = 'cancelled' THEN 'cancelled'
        ELSE 'milestone'
      END,
      'Изменение статуса: ' || OLD.status || ' → ' || NEW.status,
      'Статус эксперимента изменён с "' || OLD.status || '" на "' || NEW.status || '"',
      'auto',
      CASE 
        WHEN NEW.status = 'completed' THEN 'success'
        WHEN NEW.status = 'failed' THEN 'error'
        WHEN NEW.status = 'cancelled' THEN 'warning'
        ELSE 'info'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для логирования изменений статуса
DROP TRIGGER IF EXISTS trigger_log_experiment_status ON promo_lab_experiments;
CREATE TRIGGER trigger_log_experiment_status
  AFTER UPDATE ON promo_lab_experiments
  FOR EACH ROW
  EXECUTE FUNCTION log_experiment_status_change();

COMMENT ON FUNCTION log_experiment_status_change IS 'Автоматически создаёт событие при смене статуса эксперимента';

-- ============================================================================
-- 6. VIEWS - ПРЕДСТАВЛЕНИЯ ДЛЯ АНАЛИТИКИ
-- ============================================================================

-- View: Эксперименты с агрегированной статистикой
CREATE OR REPLACE VIEW promo_lab_experiments_with_stats AS
SELECT 
  e.*,
  
  -- Агрегированные метрики
  COALESCE(SUM(m.reach), 0) as total_reach,
  COALESCE(SUM(m.impressions), 0) as total_impressions,
  COALESCE(SUM(m.conversions), 0) as total_conversions,
  COALESCE(SUM(m.spend), 0) as total_spend,
  
  -- Средние значения
  COALESCE(AVG(m.engagement_rate), 0) as avg_engagement_rate,
  COALESCE(AVG(m.conversion_rate), 0) as avg_conversion_rate,
  COALESCE(AVG(m.sentiment_score), 0) as avg_sentiment,
  
  -- ROI
  CASE 
    WHEN e.budget > 0 THEN 
      ROUND(((COALESCE(SUM(m.conversions), 0) * 100) - e.budget)::DECIMAL / e.budget * 100, 2)
    ELSE 0
  END as roi_percentage,
  
  -- Количество событий и инсайтов
  (SELECT COUNT(*) FROM promo_lab_events WHERE experiment_id = e.id) as events_count,
  (SELECT COUNT(*) FROM promo_lab_insights WHERE experiment_id = e.id AND status = 'active') as insights_count,
  (SELECT COUNT(*) FROM promo_lab_resources WHERE experiment_id = e.id AND status = 'active') as resources_count,
  
  -- Длительность
  CASE 
    WHEN e.status IN ('running', 'analyzing') THEN 
      EXTRACT(DAY FROM (NOW() - e.created_at))
    WHEN e.status IN ('completed', 'failed', 'cancelled') THEN
      EXTRACT(DAY FROM (e.updated_at - e.created_at))
    ELSE 0
  END as days_running

FROM promo_lab_experiments e
LEFT JOIN promo_lab_metrics_daily m ON m.experiment_id = e.id
GROUP BY e.id;

COMMENT ON VIEW promo_lab_experiments_with_stats IS 'Эксперименты с агрегированной статистикой';

-- View: Топ эксперименты по эффективности
CREATE OR REPLACE VIEW promo_lab_top_performers AS
SELECT 
  e.id,
  e.artist_id,
  e.experiment_name,
  e.experiment_type,
  e.status,
  e.budget,
  
  COALESCE(SUM(m.reach), 0) as total_reach,
  COALESCE(SUM(m.conversions), 0) as total_conversions,
  COALESCE(AVG(m.engagement_rate), 0) as avg_engagement,
  COALESCE(AVG(m.viral_coefficient), 0) as avg_viral_coefficient,
  
  -- ROI
  CASE 
    WHEN e.budget > 0 THEN 
      ROUND(((COALESCE(SUM(m.conversions), 0) * 100) - e.budget)::DECIMAL / e.budget * 100, 2)
    ELSE 0
  END as roi,
  
  e.created_at
  
FROM promo_lab_experiments e
LEFT JOIN promo_lab_metrics_daily m ON m.experiment_id = e.id
WHERE e.status IN ('completed', 'running')
GROUP BY e.id
HAVING COALESCE(SUM(m.reach), 0) > 1000  -- Минимум 1000 охвата
ORDER BY roi DESC;

COMMENT ON VIEW promo_lab_top_performers IS 'Топ экспериментов по ROI и эффективности';

-- View: Активные инсайты с приоритетом
CREATE OR REPLACE VIEW promo_lab_active_insights AS
SELECT 
  i.*,
  e.experiment_name,
  e.experiment_type,
  e.status as experiment_status,
  
  -- Приоритет (чем выше, тем важнее)
  (CASE i.importance
    WHEN 'critical' THEN 4
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 1
  END) * i.confidence as priority_score
  
FROM promo_lab_insights i
JOIN promo_lab_experiments e ON e.id = i.experiment_id
WHERE i.status = 'active'
  AND i.actionable = TRUE
ORDER BY priority_score DESC, i.created_at DESC;

COMMENT ON VIEW promo_lab_active_insights IS 'Активные инсайты с расчётом приоритета';

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Включаем RLS
ALTER TABLE promo_lab_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_lab_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_lab_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_lab_resources ENABLE ROW LEVEL SECURITY;

-- Политики для promo_lab_events
CREATE POLICY promo_lab_events_select ON promo_lab_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_events.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_events_insert ON promo_lab_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_events.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

-- Политики для promo_lab_metrics_daily
CREATE POLICY promo_lab_metrics_select ON promo_lab_metrics_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_metrics_daily.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_metrics_insert ON promo_lab_metrics_daily
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_metrics_daily.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_metrics_update ON promo_lab_metrics_daily
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_metrics_daily.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

-- Политики для promo_lab_insights
CREATE POLICY promo_lab_insights_select ON promo_lab_insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_insights.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_insights_insert ON promo_lab_insights
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_insights.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_insights_update ON promo_lab_insights
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_insights.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

-- Политики для promo_lab_resources
CREATE POLICY promo_lab_resources_select ON promo_lab_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_resources.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_resources_insert ON promo_lab_resources
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_resources.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_resources_update ON promo_lab_resources
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_resources.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

CREATE POLICY promo_lab_resources_delete ON promo_lab_resources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM promo_lab_experiments
      WHERE promo_lab_experiments.id = promo_lab_resources.experiment_id
      AND promo_lab_experiments.artist_id = auth.uid()::TEXT
    )
  );

-- Админские политики (полный доступ)
CREATE POLICY promo_lab_events_admin ON promo_lab_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY promo_lab_metrics_admin ON promo_lab_metrics_daily
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY promo_lab_insights_admin ON promo_lab_insights
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY promo_lab_resources_admin ON promo_lab_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================================

-- Успешное завершение
DO $$
BEGIN
  RAISE NOTICE '✅ Promo Lab Extended tables created successfully';
  RAISE NOTICE '📊 New tables: promo_lab_events, promo_lab_metrics_daily, promo_lab_insights, promo_lab_resources';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Triggers and functions ready';
  RAISE NOTICE '📈 Views created: promo_lab_experiments_with_stats, promo_lab_top_performers, promo_lab_active_insights';
END $$;