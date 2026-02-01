/**
 * EMAIL SERVICE
 * Сервис для отправки email уведомлений через Supabase Edge Function
 */

import { supabase } from '@/lib/supabase';

export type EmailTemplate =
  | 'welcome'
  | 'track_approved'
  | 'track_rejected'
  | 'new_follower'
  | 'payment_success'
  | 'migration_welcome';

interface SendEmailParams {
  to: string | string[];
  subject?: string;
  template?: EmailTemplate;
  data?: Record<string, any>;
  html?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

/**
 * Отправить email через Edge Function
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to send email' };
    }

    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('[EmailService] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Отправить приветственное письмо
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    template: 'welcome',
    data: { name },
  });
}

/**
 * Уведомление об одобрении трека
 */
export async function sendTrackApprovedEmail(
  email: string,
  trackTitle: string,
  trackId: string
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    template: 'track_approved',
    data: { trackTitle, trackId },
  });
}

/**
 * Уведомление об отклонении трека
 */
export async function sendTrackRejectedEmail(
  email: string,
  trackTitle: string,
  reason: string
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    template: 'track_rejected',
    data: { trackTitle, reason },
  });
}

/**
 * Уведомление о новом подписчике
 */
export async function sendNewFollowerEmail(
  email: string,
  followerName: string,
  totalFollowers: number
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    template: 'new_follower',
    data: { followerName, totalFollowers },
  });
}

/**
 * Уведомление об успешном платеже
 */
export async function sendPaymentSuccessEmail(
  email: string,
  amount: number,
  description: string,
  transactionId: string
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    template: 'payment_success',
    data: { amount, description, transactionId },
  });
}

/**
 * Приглашение для мигрированных пользователей
 */
export async function sendMigrationWelcomeEmail(
  email: string,
  name: string,
  tracksCount: number,
  videosCount: number
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    template: 'migration_welcome',
    data: { email, name, tracksCount, videosCount },
  });
}

/**
 * Отправить массовую рассылку мигрированным пользователям
 */
export async function sendBulkMigrationEmails(
  users: Array<{ email: string; name: string; tracksCount: number; videosCount: number }>
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const user of users) {
    const result = await sendMigrationWelcomeEmail(
      user.email,
      user.name,
      user.tracksCount,
      user.videosCount
    );

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(`${user.email}: ${result.error}`);
    }

    // Задержка между письмами чтобы не превысить лимиты
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

export const emailService = {
  send: sendEmail,
  sendWelcome: sendWelcomeEmail,
  sendTrackApproved: sendTrackApprovedEmail,
  sendTrackRejected: sendTrackRejectedEmail,
  sendNewFollower: sendNewFollowerEmail,
  sendPaymentSuccess: sendPaymentSuccessEmail,
  sendMigrationWelcome: sendMigrationWelcomeEmail,
  sendBulkMigrationEmails,
};

export default emailService;
