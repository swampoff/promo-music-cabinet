/**
 * AUTH ROUTES
 * Заглушки для auth endpoints (реальная авторизация через Supabase)
 */

import { Hono } from 'npm:hono';

const auth = new Hono();

/**
 * POST /auth/signup
 * Заглушка - в реальном приложении используется Supabase Auth напрямую
 */
auth.post('/signup', async (c) => {
  return c.json({
    success: false,
    error: 'Please use Supabase Auth directly for signup. This endpoint is deprecated.',
  }, 501);
});

/**
 * POST /auth/signin
 * Заглушка - в реальном приложении используется Supabase Auth напрямую
 */
auth.post('/signin', async (c) => {
  return c.json({
    success: false,
    error: 'Please use Supabase Auth directly for signin. This endpoint is deprecated.',
  }, 501);
});

/**
 * POST /auth/signout
 * Заглушка - в реальном приложении используется Supabase Auth напрямую
 */
auth.post('/signout', async (c) => {
  return c.json({
    success: false,
    error: 'Please use Supabase Auth directly for signout. This endpoint is deprecated.',
  }, 501);
});

/**
 * GET /auth/session
 * Заглушка - в реальном приложении используется Supabase Auth напрямую
 */
auth.get('/session', async (c) => {
  return c.json({
    success: false,
    error: 'Please use Supabase Auth directly for session management. This endpoint is deprecated.',
  }, 501);
});

export default auth;
