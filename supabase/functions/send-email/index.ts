/**
 * SEND EMAIL - Supabase Edge Function
 * Отправка email уведомлений через Resend или SMTP
 *
 * Настройка:
 * 1. Получите API ключ Resend: https://resend.com
 * 2. Добавьте секрет: supabase secrets set RESEND_API_KEY=re_xxxxx
 *
 * Использование:
 * POST /functions/v1/send-email
 * {
 *   "to": "user@example.com",
 *   "subject": "Тема письма",
 *   "template": "welcome" | "track_approved" | "new_follower" | "payment",
 *   "data": { ... }
 * }
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'PROMO.MUSIC <noreply@promo.music>';

// Email шаблоны
const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  // Приветственное письмо
  welcome: (data) => ({
    subject: 'Добро пожаловать в PROMO.MUSIC!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00d4ff; font-size: 28px; margin: 0; }
            .content { line-height: 1.6; }
            .button { display: inline-block; background: linear-gradient(135deg, #00d4ff, #0066ff); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>PROMO.MUSIC</h1>
            </div>
            <div class="content">
              <h2>Привет, ${data.name || 'Артист'}!</h2>
              <p>Добро пожаловать в PROMO.MUSIC — платформу для продвижения твоей музыки!</p>
              <p>Теперь ты можешь:</p>
              <ul>
                <li>Загружать треки и видео</li>
                <li>Отправлять музыку на радиостанции</li>
                <li>Отслеживать статистику</li>
                <li>Находить новых слушателей</li>
              </ul>
              <p style="text-align: center;">
                <a href="https://promo.music/dashboard" class="button">Войти в кабинет</a>
              </p>
            </div>
            <div class="footer">
              <p>С любовью к музыке,<br>Команда PROMO.MUSIC</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Трек одобрен
  track_approved: (data) => ({
    subject: `Трек "${data.trackTitle}" одобрен!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00d4ff; font-size: 28px; margin: 0; }
            .success { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .success h3 { color: #22c55e; margin: 0 0 10px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #00d4ff, #0066ff); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>PROMO.MUSIC</h1>
            </div>
            <div class="success">
              <h3>Трек одобрен!</h3>
              <p style="font-size: 18px; margin: 0;">"${data.trackTitle}"</p>
            </div>
            <p>Отличные новости! Твой трек прошёл модерацию и теперь доступен для прослушивания.</p>
            <p>Трек будет автоматически добавлен в ротацию и станет доступен радиостанциям для эфира.</p>
            <p style="text-align: center;">
              <a href="https://promo.music/tracks/${data.trackId}" class="button">Посмотреть трек</a>
            </p>
            <div class="footer">
              <p>Команда PROMO.MUSIC</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Трек отклонён
  track_rejected: (data) => ({
    subject: `Трек "${data.trackTitle}" не прошёл модерацию`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00d4ff; font-size: 28px; margin: 0; }
            .warning { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
            .warning h3 { color: #ef4444; margin: 0 0 10px 0; }
            .reason { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #00d4ff, #0066ff); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>PROMO.MUSIC</h1>
            </div>
            <div class="warning">
              <h3>Трек не прошёл модерацию</h3>
              <p style="margin: 0;">"${data.trackTitle}"</p>
              <div class="reason">
                <strong>Причина:</strong> ${data.reason || 'Не соответствует требованиям платформы'}
              </div>
            </div>
            <p>Ты можешь исправить замечания и загрузить трек повторно.</p>
            <p style="text-align: center;">
              <a href="https://promo.music/tracks/upload" class="button">Загрузить новый трек</a>
            </p>
            <div class="footer">
              <p>Команда PROMO.MUSIC</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Новый подписчик
  new_follower: (data) => ({
    subject: `У тебя новый подписчик!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00d4ff; font-size: 28px; margin: 0; }
            .follower { text-align: center; margin: 30px 0; }
            .avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff, #0066ff); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
            .button { display: inline-block; background: linear-gradient(135deg, #00d4ff, #0066ff); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>PROMO.MUSIC</h1>
            </div>
            <div class="follower">
              <div class="avatar">${(data.followerName || 'U')[0].toUpperCase()}</div>
              <h3 style="margin: 0;">${data.followerName || 'Пользователь'}</h3>
              <p style="color: #888;">подписался на тебя</p>
            </div>
            <p style="text-align: center;">Теперь у тебя <strong>${data.totalFollowers || 1}</strong> подписчиков!</p>
            <p style="text-align: center;">
              <a href="https://promo.music/fans" class="button">Посмотреть подписчиков</a>
            </p>
            <div class="footer">
              <p>Команда PROMO.MUSIC</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Платёж успешен
  payment_success: (data) => ({
    subject: `Платёж на ${data.amount} ₽ успешно проведён`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00d4ff; font-size: 28px; margin: 0; }
            .success { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #22c55e; }
            .details { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .details-row:last-child { border-bottom: none; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>PROMO.MUSIC</h1>
            </div>
            <div class="success">
              <p style="margin: 0 0 10px 0; color: #22c55e;">Платёж успешен!</p>
              <div class="amount">${data.amount} ₽</div>
            </div>
            <div class="details">
              <div class="details-row">
                <span style="color: #888;">Описание:</span>
                <span>${data.description || 'Пополнение баланса'}</span>
              </div>
              <div class="details-row">
                <span style="color: #888;">Дата:</span>
                <span>${new Date().toLocaleDateString('ru-RU')}</span>
              </div>
              <div class="details-row">
                <span style="color: #888;">ID транзакции:</span>
                <span>${data.transactionId || '-'}</span>
              </div>
            </div>
            <div class="footer">
              <p>Спасибо за использование PROMO.MUSIC!</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Приглашение для мигрированных пользователей
  migration_welcome: (data) => ({
    subject: 'Ваш аккаунт promo.fm перенесён в PROMO.MUSIC',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00d4ff; font-size: 28px; margin: 0; }
            .highlight { background: rgba(0, 212, 255, 0.2); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #00d4ff, #0066ff); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #00d4ff; }
            .stat-label { color: #888; font-size: 12px; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>PROMO.MUSIC</h1>
            </div>
            <h2>Привет, ${data.name || 'Артист'}!</h2>
            <p>Мы рады сообщить, что твой аккаунт с promo.fm успешно перенесён на новую платформу PROMO.MUSIC!</p>

            <div class="highlight">
              <strong>Что перенесено:</strong>
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${data.tracksCount || 0}</div>
                  <div class="stat-label">треков</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${data.videosCount || 0}</div>
                  <div class="stat-label">видео</div>
                </div>
              </div>
            </div>

            <p><strong>Для входа:</strong></p>
            <ol>
              <li>Перейдите на <a href="https://promo.music" style="color: #00d4ff;">promo.music</a></li>
              <li>Нажмите "Забыли пароль?"</li>
              <li>Введите ваш email: <strong>${data.email}</strong></li>
              <li>Установите новый пароль</li>
            </ol>

            <p style="text-align: center;">
              <a href="https://promo.music/reset-password?email=${encodeURIComponent(data.email || '')}" class="button">Установить пароль</a>
            </p>

            <div class="footer">
              <p>С любовью к музыке,<br>Команда PROMO.MUSIC</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data, html: customHtml } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing "to" field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailSubject = subject;
    let emailHtml = customHtml;

    // Использовать шаблон если указан
    if (template && templates[template]) {
      const templateResult = templates[template](data || {});
      emailSubject = emailSubject || templateResult.subject;
      emailHtml = emailHtml || templateResult.html;
    }

    if (!emailSubject || !emailHtml) {
      return new Response(
        JSON.stringify({ error: 'Missing subject or html content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Отправка через Resend
    if (!RESEND_API_KEY) {
      console.log('[Email] RESEND_API_KEY not set, logging email instead:');
      console.log({ to, subject: emailSubject });
      return new Response(
        JSON.stringify({ success: true, message: 'Email logged (no RESEND_API_KEY)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Email] Resend error:', result);
      return new Response(
        JSON.stringify({ error: result.message || 'Failed to send email' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
