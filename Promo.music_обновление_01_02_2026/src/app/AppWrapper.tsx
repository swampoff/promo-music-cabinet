/**
 * APP WRAPPER
 * Обертка приложения с провайдерами для Figma Make
 * Updated: 2026-02-01 (финансовая система + питчинг feedback)
 */

import MainRouter from '@/main-router';

export default function AppWrapper() {
  console.log('[AppWrapper] Rendering MainRouter - v2.1 with feedback portal');
  
  return <MainRouter />;
}