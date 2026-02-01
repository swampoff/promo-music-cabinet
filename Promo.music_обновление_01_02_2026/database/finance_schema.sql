-- ============================================================================
-- PROMO.MUSIC - FINANCE MODULE DATABASE SCHEMA
-- Полная структура БД для финансовой системы
-- PostgreSQL / Supabase compatible
-- КРИТИЧЕСКИ ВАЖНЫЙ МОДУЛЬ - ТРЕБУЕТ ПОВЫШЕННОЙ БЕЗОПАСНОСТИ
-- ============================================================================

-- ============================================================================
-- 1. ОСНОВНАЯ ТАБЛИЦА ТРАНЗАКЦИЙ
-- ============================================================================

CREATE TABLE finance_transactions (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    user_id BIGINT, -- Пользователь (может быть NULL для системных транзакций)
    partner_id BIGINT, -- Партнер (если применимо)
    
    -- Тип и категория транзакции
    transaction_type VARCHAR(50) NOT NULL,
    -- 'payment', 'refund', 'payout', 'commission', 'deposit', 'withdrawal', 
    -- 'bonus', 'penalty', 'correction', 'subscription', 'order_payment'
    
    transaction_category VARCHAR(100) NOT NULL,
    -- 'campaign', 'subscription', 'service', 'pitching', 'production', 
    -- 'promo_lab', 'partner_payout', 'platform_commission'
    
    -- Сумма и валюта
    amount DECIMAL(12, 2) NOT NULL, -- Сумма (может быть отрицательной)
    currency VARCHAR(3) DEFAULT 'RUB' NOT NULL,
    
    -- Конвертация валюты (если применимо)
    original_amount DECIMAL(12, 2),
    original_currency VARCHAR(3),
    exchange_rate DECIMAL(10, 6),
    
    -- Баланс до и после
    balance_before DECIMAL(12, 2),
    balance_after DECIMAL(12, 2),
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    -- 'pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold', 'reversed'
    
    -- Описание
    description TEXT NOT NULL,
    internal_note TEXT, -- Внутренние заметки (не видны пользователю)
    
    -- Связь с другими сущностями
    reference_type VARCHAR(100), -- 'campaign', 'order', 'subscription', 'invoice', 'payout'
    reference_id BIGINT, -- ID связанной сущности
    
    -- Платежная система
    payment_provider VARCHAR(50), -- 'yookassa', 'stripe', 'paypal', 'bank_transfer', 'balance'
    payment_method VARCHAR(50), -- 'card', 'bank_account', 'e_wallet', 'crypto'
    
    -- Идентификаторы платежной системы
    external_transaction_id VARCHAR(255), -- ID в платежной системе
    external_payment_id VARCHAR(255), -- ID платежа в платежной системе
    
    -- Детали платежа
    payment_details JSONB,
    -- {'card_last4': '1234', 'card_type': 'visa', 'bank': 'Sberbank'}
    
    -- НДС и налоги
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    includes_tax BOOLEAN DEFAULT FALSE,
    
    -- Комиссии
    platform_commission DECIMAL(12, 2) DEFAULT 0.00,
    payment_gateway_fee DECIMAL(12, 2) DEFAULT 0.00,
    total_fees DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Документы
    invoice_id BIGINT, -- Связь с инвойсом
    receipt_id BIGINT, -- Связь с чеком
    
    -- IP и безопасность
    ip_address INET,
    user_agent TEXT,
    
    -- Fraud detection
    fraud_score DECIMAL(5, 2), -- 0-100
    is_suspicious BOOLEAN DEFAULT FALSE,
    fraud_notes TEXT,
    
    -- Обработка
    processed_by_admin_id BIGINT,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Даты
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    reversed_at TIMESTAMP WITH TIME ZONE,
    
    -- Ошибки
    error_code VARCHAR(100),
    error_message TEXT,
    
    -- Метаданные
    metadata JSONB,
    
    -- Мягкое удаление
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Ограничения
    CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_transaction_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    CONSTRAINT fk_transaction_processed_by FOREIGN KEY (processed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_transaction_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold', 'reversed'))
);

-- Индексы
CREATE INDEX idx_transactions_user_id ON finance_transactions(user_id);
CREATE INDEX idx_transactions_partner_id ON finance_transactions(partner_id);
CREATE INDEX idx_transactions_type ON finance_transactions(transaction_type);
CREATE INDEX idx_transactions_category ON finance_transactions(transaction_category);
CREATE INDEX idx_transactions_status ON finance_transactions(status);
CREATE INDEX idx_transactions_created_at ON finance_transactions(created_at DESC);
CREATE INDEX idx_transactions_reference ON finance_transactions(reference_type, reference_id);
CREATE INDEX idx_transactions_external_id ON finance_transactions(external_transaction_id);
CREATE INDEX idx_transactions_provider ON finance_transactions(payment_provider);
CREATE INDEX idx_transactions_deleted_at ON finance_transactions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_suspicious ON finance_transactions(is_suspicious) WHERE is_suspicious = TRUE;

COMMENT ON TABLE finance_transactions IS 'Все финансовые транзакции платформы';


-- ============================================================================
-- 2. ТАБЛИЦА СЧЕТОВ (INVOICES)
-- ============================================================================

CREATE TABLE finance_invoices (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Номер счета
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- INV-2024-00001
    
    -- Связи
    user_id BIGINT NOT NULL,
    partner_id BIGINT, -- Если счет для партнера
    
    -- Тип счета
    invoice_type VARCHAR(50) NOT NULL,
    -- 'service', 'subscription', 'campaign', 'partner_payout'
    
    -- Суммы
    subtotal DECIMAL(12, 2) NOT NULL, -- Сумма без НДС
    tax_amount DECIMAL(12, 2) DEFAULT 0.00, -- НДС
    discount_amount DECIMAL(12, 2) DEFAULT 0.00, -- Скидка
    total_amount DECIMAL(12, 2) NOT NULL, -- Итого к оплате
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Статус
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    -- 'draft', 'pending', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded'
    
    -- Описание
    description TEXT,
    notes TEXT, -- Дополнительные заметки
    
    -- Позиции счета
    line_items JSONB NOT NULL,
    -- [{'name': 'Услуга', 'quantity': 1, 'price': 5000, 'tax_rate': 20}]
    
    -- Даты
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Реквизиты плательщика
    billing_details JSONB,
    -- {'name': 'ООО...', 'inn': '...', 'kpp': '...', 'address': '...'}
    
    -- Документы
    pdf_url VARCHAR(500), -- Ссылка на PDF
    
    -- Связь с транзакциями
    payment_transaction_id BIGINT,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Мягкое удаление
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoice_transaction FOREIGN KEY (payment_transaction_id) REFERENCES finance_transactions(id) ON DELETE SET NULL,
    CONSTRAINT check_invoice_status CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')),
    CONSTRAINT check_invoice_amounts CHECK (total_amount >= 0 AND subtotal >= 0)
);

CREATE INDEX idx_invoices_user_id ON finance_invoices(user_id);
CREATE INDEX idx_invoices_partner_id ON finance_invoices(partner_id);
CREATE INDEX idx_invoices_number ON finance_invoices(invoice_number);
CREATE INDEX idx_invoices_status ON finance_invoices(status);
CREATE INDEX idx_invoices_due_date ON finance_invoices(due_date);
CREATE INDEX idx_invoices_created_at ON finance_invoices(created_at DESC);

COMMENT ON TABLE finance_invoices IS 'Счета на оплату';


-- ============================================================================
-- 3. ТАБЛИЦА ЧЕКОВ И КВИТАНЦИЙ
-- ============================================================================

CREATE TABLE finance_receipts (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Номер чека
    receipt_number VARCHAR(100) UNIQUE NOT NULL, -- RCP-2024-00001
    
    -- Связи
    transaction_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    invoice_id BIGINT,
    
    -- Данные для фискализации
    fiscal_data JSONB,
    -- {'fn': '...', 'fd': '...', 'fp': '...', 'ofd_url': '...'}
    
    -- Статус фискализации
    is_fiscalized BOOLEAN DEFAULT FALSE,
    fiscalized_at TIMESTAMP WITH TIME ZONE,
    
    -- Документ
    pdf_url VARCHAR(500),
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_receipt_transaction FOREIGN KEY (transaction_id) REFERENCES finance_transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receipt_invoice FOREIGN KEY (invoice_id) REFERENCES finance_invoices(id) ON DELETE SET NULL
);

CREATE INDEX idx_receipts_transaction_id ON finance_receipts(transaction_id);
CREATE INDEX idx_receipts_user_id ON finance_receipts(user_id);
CREATE INDEX idx_receipts_number ON finance_receipts(receipt_number);

COMMENT ON TABLE finance_receipts IS 'Чеки и квитанции';


-- ============================================================================
-- 4. ТАБЛИЦА ВЫПЛАТ
-- ============================================================================

CREATE TABLE finance_payouts (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Получатель
    user_id BIGINT, -- Пользователь
    partner_id BIGINT, -- Партнер
    
    -- Тип выплаты
    payout_type VARCHAR(50) NOT NULL,
    -- 'partner_commission', 'affiliate_reward', 'refund', 'withdrawal', 'salary'
    
    -- Сумма
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Комиссия за вывод
    withdrawal_fee DECIMAL(12, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2) NOT NULL, -- amount - withdrawal_fee
    
    -- Период
    period_start DATE,
    period_end DATE,
    
    -- Метод выплаты
    payout_method VARCHAR(50) NOT NULL,
    -- 'bank_transfer', 'card', 'paypal', 'yoomoney', 'crypto'
    
    -- Реквизиты получателя
    payout_details JSONB NOT NULL,
    -- {'bank_name': 'Сбербанк', 'account': '...', 'inn': '...'}
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    -- 'pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected'
    
    -- Связь с транзакцией
    transaction_id BIGINT,
    
    -- Внешний ID
    external_payout_id VARCHAR(255),
    
    -- Обработка
    approved_by_admin_id BIGINT,
    approved_at TIMESTAMP WITH TIME ZONE,
    processed_by_admin_id BIGINT,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    rejection_reason TEXT,
    
    -- Документы
    invoice_number VARCHAR(100),
    document_url VARCHAR(500),
    
    -- Даты
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_date DATE, -- Запланированная дата выплаты
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Метаданные
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_payout_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_payout_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    CONSTRAINT fk_payout_transaction FOREIGN KEY (transaction_id) REFERENCES finance_transactions(id) ON DELETE SET NULL,
    CONSTRAINT fk_payout_approved_by FOREIGN KEY (approved_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_payout_processed_by FOREIGN KEY (processed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_payout_status CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected')),
    CONSTRAINT check_one_recipient CHECK ((user_id IS NOT NULL AND partner_id IS NULL) OR (user_id IS NULL AND partner_id IS NOT NULL))
);

CREATE INDEX idx_payouts_user_id ON finance_payouts(user_id);
CREATE INDEX idx_payouts_partner_id ON finance_payouts(partner_id);
CREATE INDEX idx_payouts_status ON finance_payouts(status);
CREATE INDEX idx_payouts_period ON finance_payouts(period_start, period_end);
CREATE INDEX idx_payouts_created_at ON finance_payouts(created_at DESC);

COMMENT ON TABLE finance_payouts IS 'Выплаты пользователям и партнерам';


-- ============================================================================
-- 5. ТАБЛИЦА ВОЗВРАТОВ (REFUNDS)
-- ============================================================================

CREATE TABLE finance_refunds (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связь с оригинальной транзакцией
    original_transaction_id BIGINT NOT NULL,
    
    -- Связь с транзакцией возврата
    refund_transaction_id BIGINT,
    
    -- Сумма возврата
    refund_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Тип возврата
    refund_type VARCHAR(50) NOT NULL,
    -- 'full', 'partial', 'chargeback'
    
    -- Причина
    reason VARCHAR(100) NOT NULL,
    -- 'user_request', 'service_not_delivered', 'duplicate_payment', 'fraud', 'other'
    description TEXT,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    -- 'pending', 'approved', 'processing', 'completed', 'rejected', 'failed'
    
    -- Кто инициировал
    initiated_by VARCHAR(50) NOT NULL, -- 'user', 'admin', 'system', 'payment_provider'
    initiated_by_user_id BIGINT,
    
    -- Одобрение
    approved_by_admin_id BIGINT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Внешний ID (от платежной системы)
    external_refund_id VARCHAR(255),
    
    -- Даты
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Метаданные
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_refund_original_transaction FOREIGN KEY (original_transaction_id) REFERENCES finance_transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_refund_transaction FOREIGN KEY (refund_transaction_id) REFERENCES finance_transactions(id) ON DELETE SET NULL,
    CONSTRAINT fk_refund_initiated_by FOREIGN KEY (initiated_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_refund_approved_by FOREIGN KEY (approved_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_refund_status CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'failed')),
    CONSTRAINT check_refund_type CHECK (refund_type IN ('full', 'partial', 'chargeback'))
);

CREATE INDEX idx_refunds_original_transaction ON finance_refunds(original_transaction_id);
CREATE INDEX idx_refunds_status ON finance_refunds(status);
CREATE INDEX idx_refunds_created_at ON finance_refunds(created_at DESC);

COMMENT ON TABLE finance_refunds IS 'Возвраты платежей';


-- ============================================================================
-- 6. ТАБЛИЦА БАЛАНСОВ (АГРЕГИРОВАННАЯ)
-- ============================================================================

CREATE TABLE finance_balances (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    
    -- Владелец баланса
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'partner', 'platform'
    entity_id BIGINT, -- NULL для platform
    
    -- Валюта
    currency VARCHAR(3) DEFAULT 'RUB' NOT NULL,
    
    -- Балансы
    available_balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL, -- Доступно
    pending_balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL, -- Ожидает (холд)
    reserved_balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL, -- Зарезервировано
    total_balance DECIMAL(12, 2) GENERATED ALWAYS AS (available_balance + pending_balance + reserved_balance) STORED,
    
    -- Лимиты
    credit_limit DECIMAL(12, 2) DEFAULT 0.00, -- Кредитный лимит
    
    -- Lifetime статистика
    lifetime_income DECIMAL(12, 2) DEFAULT 0.00, -- Всего получено
    lifetime_expense DECIMAL(12, 2) DEFAULT 0.00, -- Всего потрачено
    
    -- Последние операции
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    last_deposit_at TIMESTAMP WITH TIME ZONE,
    last_withdrawal_at TIMESTAMP WITH TIME ZONE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальность: один баланс на entity+currency
    CONSTRAINT unique_balance_entity_currency UNIQUE (entity_type, entity_id, currency),
    CONSTRAINT check_entity_type CHECK (entity_type IN ('user', 'partner', 'platform'))
);

CREATE INDEX idx_balances_entity ON finance_balances(entity_type, entity_id);
CREATE INDEX idx_balances_currency ON finance_balances(currency);

COMMENT ON TABLE finance_balances IS 'Агрегированные балансы пользователей и партнеров';


-- ============================================================================
-- 7. ТАБЛИЦА КОМИССИЙ ПЛАТФОРМЫ
-- ============================================================================

CREATE TABLE finance_commission_rules (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    
    -- Название правила
    rule_name VARCHAR(255) NOT NULL,
    
    -- Тип операции
    operation_type VARCHAR(50) NOT NULL,
    -- 'campaign', 'order', 'partner_service', 'withdrawal', 'deposit'
    
    -- Категория
    category VARCHAR(100),
    
    -- Процент комиссии
    commission_percentage DECIMAL(5, 2) NOT NULL,
    
    -- Фиксированная комиссия
    fixed_commission DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Минимальная и максимальная комиссия
    min_commission DECIMAL(12, 2),
    max_commission DECIMAL(12, 2),
    
    -- Валюта
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Условия применения
    conditions JSONB,
    -- {'min_amount': 1000, 'subscription_tier': 'premium'}
    
    -- Приоритет (чем выше, тем приоритетнее)
    priority INT DEFAULT 0,
    
    -- Активность
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Период действия
    valid_from DATE,
    valid_until DATE,
    
    -- Метаданные
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_commission_rules_operation ON finance_commission_rules(operation_type);
CREATE INDEX idx_commission_rules_active ON finance_commission_rules(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE finance_commission_rules IS 'Правила комиссий платформы';


-- ============================================================================
-- 8. ТАБЛИЦА НАЛОГОВЫХ ОТЧЕТОВ
-- ============================================================================

CREATE TABLE finance_tax_reports (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Номер отчета
    report_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- Период
    period_type VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Тип отчета
    report_type VARCHAR(50) NOT NULL,
    -- 'vat', 'income_tax', 'withholding_tax', '6_ndfl'
    
    -- Суммы
    total_revenue DECIMAL(12, 2) DEFAULT 0.00,
    total_expenses DECIMAL(12, 2) DEFAULT 0.00,
    taxable_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Данные отчета
    report_data JSONB NOT NULL,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'draft',
    -- 'draft', 'pending', 'submitted', 'accepted', 'rejected'
    
    -- Документы
    pdf_url VARCHAR(500),
    xml_url VARCHAR(500),
    
    -- Подача
    submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_by_admin_id BIGINT,
    
    -- Метаданные
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_tax_report_submitted_by FOREIGN KEY (submitted_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tax_reports_period ON finance_tax_reports(period_start, period_end);
CREATE INDEX idx_tax_reports_type ON finance_tax_reports(report_type);
CREATE INDEX idx_tax_reports_status ON finance_tax_reports(status);

COMMENT ON TABLE finance_tax_reports IS 'Налоговые отчеты';


-- ============================================================================
-- 9. ТАБЛИЦА АУДИТА ФИНАНСОВЫХ ОПЕРАЦИЙ
-- ============================================================================

CREATE TABLE finance_audit_log (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    
    -- Тип операции
    action_type VARCHAR(100) NOT NULL,
    -- 'transaction_created', 'transaction_completed', 'refund_issued', 
    -- 'payout_approved', 'balance_adjusted'
    
    -- Связи
    transaction_id BIGINT,
    invoice_id BIGINT,
    payout_id BIGINT,
    refund_id BIGINT,
    
    -- Кто совершил действие
    actor_type VARCHAR(50), -- 'user', 'admin', 'system', 'cron'
    actor_id BIGINT,
    
    -- Что изменилось
    old_values JSONB,
    new_values JSONB,
    
    -- Детали
    description TEXT,
    
    -- Контекст
    ip_address INET,
    user_agent TEXT,
    
    -- Метаданные
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_audit_transaction FOREIGN KEY (transaction_id) REFERENCES finance_transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_invoice FOREIGN KEY (invoice_id) REFERENCES finance_invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_payout FOREIGN KEY (payout_id) REFERENCES finance_payouts(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_refund FOREIGN KEY (refund_id) REFERENCES finance_refunds(id) ON DELETE CASCADE
);

CREATE INDEX idx_audit_action_type ON finance_audit_log(action_type);
CREATE INDEX idx_audit_transaction_id ON finance_audit_log(transaction_id);
CREATE INDEX idx_audit_created_at ON finance_audit_log(created_at DESC);
CREATE INDEX idx_audit_actor ON finance_audit_log(actor_type, actor_id);

COMMENT ON TABLE finance_audit_log IS 'Аудит всех финансовых операций';


-- ============================================================================
-- 10. ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================================================

-- View: Дневная финансовая сводка
CREATE VIEW v_finance_daily_summary AS
SELECT 
    DATE(created_at) AS date,
    currency,
    COUNT(*) FILTER (WHERE transaction_type = 'payment' AND status = 'completed') AS payments_count,
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'payment' AND status = 'completed'), 0) AS total_payments,
    COUNT(*) FILTER (WHERE transaction_type = 'refund' AND status = 'completed') AS refunds_count,
    COALESCE(SUM(ABS(amount)) FILTER (WHERE transaction_type = 'refund' AND status = 'completed'), 0) AS total_refunds,
    COUNT(*) FILTER (WHERE transaction_type = 'payout' AND status = 'completed') AS payouts_count,
    COALESCE(SUM(ABS(amount)) FILTER (WHERE transaction_type = 'payout' AND status = 'completed'), 0) AS total_payouts,
    COALESCE(SUM(platform_commission) FILTER (WHERE status = 'completed'), 0) AS total_commission,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_count
FROM finance_transactions
WHERE deleted_at IS NULL
GROUP BY DATE(created_at), currency
ORDER BY date DESC;

COMMENT ON VIEW v_finance_daily_summary IS 'Дневная финансовая сводка';


-- View: Балансы с детализацией
CREATE VIEW v_finance_balances_detailed AS
SELECT 
    fb.entity_type,
    fb.entity_id,
    CASE 
        WHEN fb.entity_type = 'user' THEN u.name
        WHEN fb.entity_type = 'partner' THEN p.name
        ELSE 'Платформа'
    END AS entity_name,
    fb.currency,
    fb.available_balance,
    fb.pending_balance,
    fb.reserved_balance,
    fb.total_balance,
    fb.lifetime_income,
    fb.lifetime_expense,
    fb.last_transaction_at
FROM finance_balances fb
LEFT JOIN users u ON fb.entity_type = 'user' AND fb.entity_id = u.id
LEFT JOIN partners p ON fb.entity_type = 'partner' AND fb.entity_id = p.id;

COMMENT ON VIEW v_finance_balances_detailed IS 'Балансы с именами владельцев';


-- View: Неоплаченные счета
CREATE VIEW v_finance_overdue_invoices AS
SELECT 
    fi.*,
    u.name AS user_name,
    u.email AS user_email,
    CURRENT_DATE - fi.due_date AS days_overdue
FROM finance_invoices fi
JOIN users u ON fi.user_id = u.id
WHERE fi.status IN ('pending', 'sent', 'partially_paid')
  AND fi.due_date < CURRENT_DATE
  AND fi.deleted_at IS NULL
ORDER BY fi.due_date ASC;

COMMENT ON VIEW v_finance_overdue_invoices IS 'Просроченные счета';


-- ============================================================================
-- 11. ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================================================

-- Функция: Обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER trigger_update_transactions_timestamp
    BEFORE UPDATE ON finance_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_invoices_timestamp
    BEFORE UPDATE ON finance_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_payouts_timestamp
    BEFORE UPDATE ON finance_payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_refunds_timestamp
    BEFORE UPDATE ON finance_refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Функция: Автоматическое обновление баланса
CREATE OR REPLACE FUNCTION update_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_entity_type VARCHAR(50);
    v_entity_id BIGINT;
BEGIN
    -- Определяем тип и ID сущности
    IF NEW.user_id IS NOT NULL THEN
        v_entity_type := 'user';
        v_entity_id := NEW.user_id;
    ELSIF NEW.partner_id IS NOT NULL THEN
        v_entity_type := 'partner';
        v_entity_id := NEW.partner_id;
    ELSE
        RETURN NEW; -- Системная транзакция
    END IF;
    
    -- Обновляем баланс только для завершенных транзакций
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Создаем баланс если не существует
        INSERT INTO finance_balances (entity_type, entity_id, currency)
        VALUES (v_entity_type, v_entity_id, NEW.currency)
        ON CONFLICT (entity_type, entity_id, currency) DO NOTHING;
        
        -- Обновляем баланс
        UPDATE finance_balances
        SET 
            available_balance = available_balance + NEW.amount,
            lifetime_income = CASE WHEN NEW.amount > 0 THEN lifetime_income + NEW.amount ELSE lifetime_income END,
            lifetime_expense = CASE WHEN NEW.amount < 0 THEN lifetime_expense + ABS(NEW.amount) ELSE lifetime_expense END,
            last_transaction_at = NOW(),
            last_deposit_at = CASE WHEN NEW.amount > 0 THEN NOW() ELSE last_deposit_at END,
            last_withdrawal_at = CASE WHEN NEW.amount < 0 THEN NOW() ELSE last_withdrawal_at END
        WHERE entity_type = v_entity_type
          AND entity_id = v_entity_id
          AND currency = NEW.currency;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance
    AFTER INSERT OR UPDATE ON finance_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_balance_on_transaction();


-- Функция: Автоматическое логирование
CREATE OR REPLACE FUNCTION log_finance_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO finance_audit_log (
            action_type,
            transaction_id,
            new_values,
            description
        ) VALUES (
            TG_TABLE_NAME || '_created',
            NEW.id,
            row_to_json(NEW)::jsonb,
            'Запись создана'
        );
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO finance_audit_log (
            action_type,
            transaction_id,
            old_values,
            new_values,
            description
        ) VALUES (
            TG_TABLE_NAME || '_updated',
            NEW.id,
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb,
            'Запись обновлена'
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_transaction_changes
    AFTER INSERT OR UPDATE ON finance_transactions
    FOR EACH ROW
    EXECUTE FUNCTION log_finance_changes();


-- Функция: Генерация номера счета
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year VARCHAR(4);
    v_seq INT;
    v_number VARCHAR(100);
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        v_year := TO_CHAR(NEW.issue_date, 'YYYY');
        
        -- Получаем следующий номер для этого года
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(invoice_number FROM '\d+$') AS INT)
        ), 0) + 1 INTO v_seq
        FROM finance_invoices
        WHERE invoice_number LIKE 'INV-' || v_year || '-%';
        
        -- Формируем номер
        NEW.invoice_number := 'INV-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON finance_invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();


-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только свои транзакции
CREATE POLICY transactions_select_own 
    ON finance_transactions FOR SELECT 
    USING (
        user_id = current_setting('app.current_user_id', TRUE)::bigint OR
        partner_id = current_setting('app.current_partner_id', TRUE)::bigint OR
        EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::bigint AND role = 'admin')
    );

-- Только админы могут модифицировать
CREATE POLICY transactions_modify_admin_only 
    ON finance_transactions FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = current_setting('app.current_user_id', TRUE)::bigint 
          AND role IN ('admin', 'accountant')
    ));


ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только свои счета
CREATE POLICY invoices_select_own 
    ON finance_invoices FOR SELECT 
    USING (
        user_id = current_setting('app.current_user_id', TRUE)::bigint OR
        EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::bigint AND role = 'admin')
    );


-- ============================================================================
-- 13. НАЧАЛЬНЫЕ ДАННЫЕ (SEED)
-- ============================================================================

-- Правила комиссий по умолчанию
INSERT INTO finance_commission_rules (rule_name, operation_type, commission_percentage, is_active) VALUES
('Комиссия за кампанию', 'campaign', 5.00, TRUE),
('Комиссия партнера', 'partner_service', 15.00, TRUE),
('Комиссия за вывод средств', 'withdrawal', 2.50, TRUE);

-- Баланс платформы
INSERT INTO finance_balances (entity_type, entity_id, currency) VALUES
('platform', NULL, 'RUB'),
('platform', NULL, 'USD'),
('platform', NULL, 'EUR');


-- ============================================================================
-- КОНЕЦ СХЕМЫ
-- ============================================================================
