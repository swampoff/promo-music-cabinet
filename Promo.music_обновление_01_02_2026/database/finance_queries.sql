-- ============================================================================
-- PROMO.MUSIC - FINANCE MODULE SQL QUERIES
-- Готовые SQL запросы для финансовой системы
-- ============================================================================


-- ============================================================================
-- 1. ТРАНЗАКЦИИ - ОСНОВНЫЕ ОПЕРАЦИИ
-- ============================================================================

-- 1.1 Создание транзакции платежа
INSERT INTO finance_transactions (
    user_id,
    transaction_type,
    transaction_category,
    amount,
    currency,
    balance_before,
    balance_after,
    description,
    reference_type,
    reference_id,
    payment_provider,
    payment_method,
    status
) VALUES (
    $1, 'payment', 'campaign', $2, 'RUB',
    (SELECT available_balance FROM finance_balances WHERE entity_type = 'user' AND entity_id = $1 AND currency = 'RUB'),
    (SELECT available_balance FROM finance_balances WHERE entity_type = 'user' AND entity_id = $1 AND currency = 'RUB') - $2,
    $3, $4, $5, $6, $7, 'completed'
) RETURNING id, uuid, amount, status;


-- 1.2 Получение транзакций пользователя
SELECT 
    ft.id,
    ft.uuid,
    ft.transaction_type,
    ft.transaction_category,
    ft.amount,
    ft.currency,
    ft.status,
    ft.description,
    ft.reference_type,
    ft.reference_id,
    ft.payment_provider,
    ft.created_at,
    ft.completed_at
FROM finance_transactions ft
WHERE ft.user_id = $1
  AND ft.deleted_at IS NULL
ORDER BY ft.created_at DESC
LIMIT $2 OFFSET $3;


-- 1.3 Получение транзакции по ID
SELECT 
    ft.*,
    u.name AS user_name,
    u.email AS user_email,
    p.name AS partner_name
FROM finance_transactions ft
LEFT JOIN users u ON ft.user_id = u.id
LEFT JOIN partners p ON ft.partner_id = p.id
WHERE ft.id = $1
  AND ft.deleted_at IS NULL;


-- 1.4 Фильтрация транзакций с расширенными параметрами
SELECT 
    ft.id,
    ft.uuid,
    ft.transaction_type,
    ft.transaction_category,
    ft.amount,
    ft.currency,
    ft.status,
    ft.description,
    ft.created_at,
    u.name AS user_name,
    COUNT(*) OVER() AS total_count
FROM finance_transactions ft
LEFT JOIN users u ON ft.user_id = u.id
WHERE ft.deleted_at IS NULL
  AND ($1::VARCHAR IS NULL OR ft.transaction_type = $1)
  AND ($2::VARCHAR IS NULL OR ft.transaction_category = $2)
  AND ($3::VARCHAR IS NULL OR ft.status = $3)
  AND ($4::BIGINT IS NULL OR ft.user_id = $4)
  AND ($5::DATE IS NULL OR DATE(ft.created_at) >= $5)
  AND ($6::DATE IS NULL OR DATE(ft.created_at) <= $6)
  AND ($7::DECIMAL IS NULL OR ft.amount >= $7)
  AND ($8::DECIMAL IS NULL OR ft.amount <= $8)
ORDER BY ft.created_at DESC
LIMIT $9 OFFSET $10;


-- 1.5 Обновление статуса транзакции
UPDATE finance_transactions
SET 
    status = $2,
    completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
    failed_at = CASE WHEN $2 = 'failed' THEN NOW() ELSE failed_at END,
    error_code = $3,
    error_message = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 1.6 Подозрительные транзакции
SELECT 
    ft.*,
    u.name AS user_name,
    u.email AS user_email
FROM finance_transactions ft
LEFT JOIN users u ON ft.user_id = u.id
WHERE ft.is_suspicious = TRUE
  OR ft.fraud_score > 70
  AND ft.deleted_at IS NULL
ORDER BY ft.fraud_score DESC, ft.created_at DESC;


-- ============================================================================
-- 2. СЧЕТА (INVOICES)
-- ============================================================================

-- 2.1 Создание счета
INSERT INTO finance_invoices (
    user_id,
    invoice_type,
    subtotal,
    tax_amount,
    discount_amount,
    total_amount,
    currency,
    description,
    line_items,
    issue_date,
    due_date,
    billing_details
) VALUES (
    $1, $2, $3, $4, $5, $6, 'RUB', $7, $8, $9, $10, $11
) RETURNING id, uuid, invoice_number;


-- 2.2 Получение счетов пользователя
SELECT 
    fi.*
FROM finance_invoices fi
WHERE fi.user_id = $1
  AND fi.deleted_at IS NULL
ORDER BY fi.created_at DESC
LIMIT $2 OFFSET $3;


-- 2.3 Получение счета по номеру
SELECT 
    fi.*,
    u.name AS user_name,
    u.email AS user_email
FROM finance_invoices fi
JOIN users u ON fi.user_id = u.id
WHERE fi.invoice_number = $1
  AND fi.deleted_at IS NULL;


-- 2.4 Обновление статуса счета на "Оплачен"
UPDATE finance_invoices
SET 
    status = 'paid',
    paid_date = CURRENT_DATE,
    payment_transaction_id = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 2.5 Просроченные счета
SELECT 
    fi.*,
    u.name AS user_name,
    u.email AS user_email,
    CURRENT_DATE - fi.due_date AS days_overdue
FROM finance_invoices fi
JOIN users u ON fi.user_id = u.id
WHERE fi.status IN ('pending', 'sent')
  AND fi.due_date < CURRENT_DATE
  AND fi.deleted_at IS NULL
ORDER BY days_overdue DESC;


-- 2.6 Автоматическое обновление статуса на "Просрочен"
UPDATE finance_invoices
SET status = 'overdue'
WHERE status IN ('pending', 'sent')
  AND due_date < CURRENT_DATE
  AND deleted_at IS NULL
RETURNING id, invoice_number;


-- ============================================================================
-- 3. БАЛАНСЫ
-- ============================================================================

-- 3.1 Получение баланса пользователя
SELECT 
    fb.*
FROM finance_balances fb
WHERE fb.entity_type = 'user'
  AND fb.entity_id = $1
  AND fb.currency = $2;


-- 3.2 Получение всех балансов пользователя (все валюты)
SELECT 
    fb.*
FROM finance_balances fb
WHERE fb.entity_type = 'user'
  AND fb.entity_id = $1
ORDER BY fb.currency;


-- 3.3 Создание или обновление баланса
INSERT INTO finance_balances (entity_type, entity_id, currency, available_balance)
VALUES ('user', $1, $2, $3)
ON CONFLICT (entity_type, entity_id, currency) 
DO UPDATE SET 
    available_balance = finance_balances.available_balance + EXCLUDED.available_balance,
    updated_at = NOW()
RETURNING *;


-- 3.4 Резервирование средств (холд)
UPDATE finance_balances
SET 
    available_balance = available_balance - $2,
    reserved_balance = reserved_balance + $2,
    updated_at = NOW()
WHERE entity_type = 'user'
  AND entity_id = $1
  AND currency = $3
  AND available_balance >= $2 -- Проверка достаточности средств
RETURNING *;


-- 3.5 Освобождение зарезервированных средств
UPDATE finance_balances
SET 
    available_balance = available_balance + $2,
    reserved_balance = reserved_balance - $2,
    updated_at = NOW()
WHERE entity_type = 'user'
  AND entity_id = $1
  AND currency = $3
RETURNING *;


-- 3.6 Топ балансов пользователей
SELECT 
    fb.entity_id AS user_id,
    u.name,
    u.email,
    fb.available_balance,
    fb.lifetime_income,
    fb.lifetime_expense
FROM finance_balances fb
JOIN users u ON fb.entity_id = u.id
WHERE fb.entity_type = 'user'
  AND fb.currency = 'RUB'
ORDER BY fb.available_balance DESC
LIMIT 100;


-- 3.7 Баланс платформы
SELECT 
    fb.*
FROM finance_balances fb
WHERE fb.entity_type = 'platform'
  AND fb.currency = $1;


-- ============================================================================
-- 4. ВЫПЛАТЫ (PAYOUTS)
-- ============================================================================

-- 4.1 Создание заявки на выплату
INSERT INTO finance_payouts (
    user_id,
    payout_type,
    amount,
    currency,
    withdrawal_fee,
    net_amount,
    payout_method,
    payout_details,
    status
) VALUES (
    $1, $2, $3, 'RUB', $4, $3 - $4, $5, $6, 'pending'
) RETURNING id, uuid;


-- 4.2 Получение выплат пользователя
SELECT 
    fp.*
FROM finance_payouts fp
WHERE (fp.user_id = $1 OR fp.partner_id = $1)
ORDER BY fp.created_at DESC
LIMIT $2 OFFSET $3;


-- 4.3 Ожидающие одобрения выплаты (админ)
SELECT 
    fp.id,
    fp.uuid,
    fp.payout_type,
    fp.amount,
    fp.net_amount,
    fp.payout_method,
    fp.requested_at,
    CASE 
        WHEN fp.user_id IS NOT NULL THEN u.name
        WHEN fp.partner_id IS NOT NULL THEN p.name
    END AS recipient_name,
    CASE 
        WHEN fp.user_id IS NOT NULL THEN u.email
        WHEN fp.partner_id IS NOT NULL THEN p.email
    END AS recipient_email
FROM finance_payouts fp
LEFT JOIN users u ON fp.user_id = u.id
LEFT JOIN partners p ON fp.partner_id = p.id
WHERE fp.status = 'pending'
ORDER BY fp.requested_at ASC;


-- 4.4 Одобрение выплаты
UPDATE finance_payouts
SET 
    status = 'approved',
    approved_by_admin_id = $2,
    approved_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 4.5 Отклонение выплаты
UPDATE finance_payouts
SET 
    status = 'rejected',
    rejection_reason = $2,
    approved_by_admin_id = $3,
    approved_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 4.6 Завершение выплаты
UPDATE finance_payouts
SET 
    status = 'completed',
    external_payout_id = $2,
    processed_by_admin_id = $3,
    processed_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- ============================================================================
-- 5. ВОЗВРАТЫ (REFUNDS)
-- ============================================================================

-- 5.1 Создание возврата
INSERT INTO finance_refunds (
    original_transaction_id,
    refund_amount,
    currency,
    refund_type,
    reason,
    description,
    initiated_by,
    initiated_by_user_id
) VALUES (
    $1, $2, 'RUB', $3, $4, $5, $6, $7
) RETURNING id, uuid;


-- 5.2 Получение возвратов
SELECT 
    fr.*,
    ft.description AS original_description,
    ft.amount AS original_amount
FROM finance_refunds fr
JOIN finance_transactions ft ON fr.original_transaction_id = ft.id
WHERE fr.status = $1
ORDER BY fr.requested_at DESC
LIMIT $2 OFFSET $3;


-- 5.3 Одобрение возврата
UPDATE finance_refunds
SET 
    status = 'approved',
    approved_by_admin_id = $2,
    approved_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 5.4 Обработка возврата (создание транзакции возврата)
WITH refund_transaction AS (
    INSERT INTO finance_transactions (
        user_id,
        transaction_type,
        transaction_category,
        amount,
        currency,
        description,
        reference_type,
        reference_id,
        status
    )
    SELECT 
        ft.user_id,
        'refund',
        ft.transaction_category,
        fr.refund_amount,
        fr.currency,
        'Возврат: ' || ft.description,
        'refund',
        fr.id,
        'completed'
    FROM finance_refunds fr
    JOIN finance_transactions ft ON fr.original_transaction_id = ft.id
    WHERE fr.id = $1
    RETURNING id
)
UPDATE finance_refunds
SET 
    refund_transaction_id = (SELECT id FROM refund_transaction),
    status = 'completed',
    processed_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- ============================================================================
-- 6. СТАТИСТИКА И АНАЛИТИКА
-- ============================================================================

-- 6.1 Общая финансовая статистика платформы
SELECT 
    COUNT(*) FILTER (WHERE transaction_type = 'payment' AND status = 'completed') AS total_payments_count,
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'payment' AND status = 'completed'), 0) AS total_payments_amount,
    
    COUNT(*) FILTER (WHERE transaction_type = 'refund' AND status = 'completed') AS total_refunds_count,
    COALESCE(SUM(ABS(amount)) FILTER (WHERE transaction_type = 'refund' AND status = 'completed'), 0) AS total_refunds_amount,
    
    COUNT(*) FILTER (WHERE transaction_type = 'payout' AND status = 'completed') AS total_payouts_count,
    COALESCE(SUM(ABS(amount)) FILTER (WHERE transaction_type = 'payout' AND status = 'completed'), 0) AS total_payouts_amount,
    
    COALESCE(SUM(platform_commission) FILTER (WHERE status = 'completed'), 0) AS total_commission,
    
    COUNT(*) FILTER (WHERE status = 'failed') AS total_failed_count,
    
    COUNT(*) FILTER (WHERE is_suspicious = TRUE) AS suspicious_count
FROM finance_transactions
WHERE deleted_at IS NULL
  AND currency = 'RUB';


-- 6.2 Статистика по дням за период
SELECT 
    DATE(created_at) AS date,
    COUNT(*) FILTER (WHERE transaction_type = 'payment' AND status = 'completed') AS payments_count,
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'payment' AND status = 'completed'), 0) AS payments_sum,
    COUNT(*) FILTER (WHERE transaction_type = 'refund' AND status = 'completed') AS refunds_count,
    COALESCE(SUM(ABS(amount)) FILTER (WHERE transaction_type = 'refund' AND status = 'completed'), 0) AS refunds_sum,
    COALESCE(SUM(platform_commission) FILTER (WHERE status = 'completed'), 0) AS commission_sum
FROM finance_transactions
WHERE created_at >= $1
  AND created_at < $2
  AND deleted_at IS NULL
  AND currency = 'RUB'
GROUP BY DATE(created_at)
ORDER BY date DESC;


-- 6.3 Статистика по категориям транзакций
SELECT 
    transaction_category,
    COUNT(*) AS transactions_count,
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total_amount,
    COALESCE(SUM(platform_commission) FILTER (WHERE status = 'completed'), 0) AS total_commission,
    AVG(amount) FILTER (WHERE status = 'completed') AS avg_amount
FROM finance_transactions
WHERE deleted_at IS NULL
  AND created_at >= $1
  AND currency = 'RUB'
GROUP BY transaction_category
ORDER BY total_amount DESC;


-- 6.4 Топ пользователей по тратам
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(ft.id) AS transactions_count,
    COALESCE(SUM(ABS(ft.amount)) FILTER (WHERE ft.transaction_type = 'payment' AND ft.status = 'completed'), 0) AS total_spent
FROM users u
LEFT JOIN finance_transactions ft ON u.id = ft.user_id
WHERE ft.deleted_at IS NULL
  AND ft.created_at >= $1
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 100;


-- 6.5 Средний чек
SELECT 
    AVG(amount) AS average_transaction_amount,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_transaction_amount
FROM finance_transactions
WHERE transaction_type = 'payment'
  AND status = 'completed'
  AND deleted_at IS NULL
  AND created_at >= $1
  AND currency = 'RUB';


-- 6.6 Конверсия платежей (успешные/все)
SELECT 
    COUNT(*) AS total_attempts,
    COUNT(*) FILTER (WHERE status = 'completed') AS successful,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed,
    ROUND(COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS success_rate
FROM finance_transactions
WHERE transaction_type = 'payment'
  AND deleted_at IS NULL
  AND created_at >= $1;


-- 6.7 Распределение по платежным методам
SELECT 
    payment_method,
    COUNT(*) AS count,
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total_amount,
    AVG(amount) FILTER (WHERE status = 'completed') AS avg_amount
FROM finance_transactions
WHERE transaction_type = 'payment'
  AND deleted_at IS NULL
  AND created_at >= $1
GROUP BY payment_method
ORDER BY total_amount DESC;


-- ============================================================================
-- 7. КОМИССИИ
-- ============================================================================

-- 7.1 Получение применимых правил комиссии
SELECT *
FROM finance_commission_rules
WHERE operation_type = $1
  AND is_active = TRUE
  AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
  AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
ORDER BY priority DESC
LIMIT 1;


-- 7.2 Расчет комиссии для операции
SELECT 
    fcr.id,
    fcr.rule_name,
    CASE 
        WHEN fcr.fixed_commission > 0 THEN 
            fcr.fixed_commission
        ELSE 
            GREATEST(
                COALESCE(fcr.min_commission, 0),
                LEAST(
                    $2 * fcr.commission_percentage / 100,
                    COALESCE(fcr.max_commission, 999999)
                )
            )
    END AS calculated_commission
FROM finance_commission_rules fcr
WHERE fcr.operation_type = $1
  AND fcr.is_active = TRUE
  AND (fcr.valid_from IS NULL OR fcr.valid_from <= CURRENT_DATE)
  AND (fcr.valid_until IS NULL OR fcr.valid_until >= CURRENT_DATE)
ORDER BY fcr.priority DESC
LIMIT 1;


-- 7.3 Итоги комиссий за период
SELECT 
    DATE_TRUNC('day', created_at) AS period,
    transaction_category,
    COUNT(*) AS transactions_count,
    COALESCE(SUM(platform_commission), 0) AS total_commission
FROM finance_transactions
WHERE status = 'completed'
  AND created_at >= $1
  AND created_at < $2
  AND deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at), transaction_category
ORDER BY period DESC, total_commission DESC;


-- ============================================================================
-- 8. НАЛОГОВАЯ ОТЧЕТНОСТЬ
-- ============================================================================

-- 8.1 Создание налогового отчета
INSERT INTO finance_tax_reports (
    report_number,
    period_type,
    period_start,
    period_end,
    report_type,
    total_revenue,
    total_expenses,
    taxable_amount,
    tax_amount,
    report_data
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING id, uuid, report_number;


-- 8.2 Данные для НДС отчета
SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS revenue,
    COALESCE(SUM(tax_amount) FILTER (WHERE status = 'completed'), 0) AS vat_collected
FROM finance_transactions
WHERE transaction_type IN ('payment', 'order_payment')
  AND created_at >= $1
  AND created_at < $2
  AND deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;


-- 8.3 Данные для отчета по доходам
SELECT 
    transaction_category,
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND transaction_type = 'payment'), 0) AS income,
    COALESCE(SUM(ABS(amount)) FILTER (WHERE status = 'completed' AND transaction_type IN ('payout', 'refund')), 0) AS expenses
FROM finance_transactions
WHERE created_at >= $1
  AND created_at < $2
  AND deleted_at IS NULL
GROUP BY transaction_category;


-- ============================================================================
-- 9. ЧЕКИ И КВИТАНЦИИ
-- ============================================================================

-- 9.1 Создание чека
INSERT INTO finance_receipts (
    receipt_number,
    transaction_id,
    user_id,
    invoice_id,
    fiscal_data
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING id, uuid, receipt_number;


-- 9.2 Получение чеков пользователя
SELECT 
    fr.*,
    ft.amount,
    ft.description
FROM finance_receipts fr
JOIN finance_transactions ft ON fr.transaction_id = ft.id
WHERE fr.user_id = $1
ORDER BY fr.created_at DESC
LIMIT $2 OFFSET $3;


-- ============================================================================
-- 10. АУДИТ И ЛОГИРОВАНИЕ
-- ============================================================================

-- 10.1 Запись в аудит лог
INSERT INTO finance_audit_log (
    action_type,
    transaction_id,
    actor_type,
    actor_id,
    description,
    old_values,
    new_values,
    ip_address
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8::inet
);


-- 10.2 Получение истории изменений транзакции
SELECT 
    fal.*,
    u.name AS actor_name
FROM finance_audit_log fal
LEFT JOIN users u ON fal.actor_id = u.id AND fal.actor_type = 'admin'
WHERE fal.transaction_id = $1
ORDER BY fal.created_at DESC;


-- 10.3 Критические операции за период
SELECT 
    fal.*,
    u.name AS actor_name
FROM finance_audit_log fal
LEFT JOIN users u ON fal.actor_id = u.id
WHERE fal.action_type IN ('balance_adjusted', 'transaction_reversed', 'refund_issued')
  AND fal.created_at >= $1
ORDER BY fal.created_at DESC;


-- ============================================================================
-- 11. СВЕРКА И RECONCILIATION
-- ============================================================================

-- 11.1 Сверка балансов с транзакциями
SELECT 
    u.id AS user_id,
    u.name,
    fb.available_balance AS current_balance,
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.status = 'completed'), 0) AS calculated_balance,
    fb.available_balance - COALESCE(SUM(ft.amount) FILTER (WHERE ft.status = 'completed'), 0) AS difference
FROM users u
LEFT JOIN finance_balances fb ON fb.entity_type = 'user' AND fb.entity_id = u.id AND fb.currency = 'RUB'
LEFT JOIN finance_transactions ft ON ft.user_id = u.id AND ft.currency = 'RUB' AND ft.deleted_at IS NULL
GROUP BY u.id, u.name, fb.available_balance
HAVING ABS(fb.available_balance - COALESCE(SUM(ft.amount) FILTER (WHERE ft.status = 'completed'), 0)) > 0.01
ORDER BY ABS(difference) DESC;


-- 11.2 Незавершенные транзакции
SELECT 
    ft.*,
    u.name AS user_name,
    AGE(NOW(), ft.created_at) AS pending_duration
FROM finance_transactions ft
LEFT JOIN users u ON ft.user_id = u.id
WHERE ft.status IN ('pending', 'processing', 'on_hold')
  AND ft.deleted_at IS NULL
  AND ft.created_at < NOW() - INTERVAL '24 hours'
ORDER BY ft.created_at ASC;


-- ============================================================================
-- КОНЕЦ ЗАПРОСОВ
-- ============================================================================
