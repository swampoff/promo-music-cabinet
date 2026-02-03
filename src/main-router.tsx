/**
 * MAIN ROUTER - Роутинг всего приложения
 * Включает публичные и приватные роуты
 * Updated: 2026-02-01
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import RootApp from '@/app/RootApp';
import FeedbackPortal from '@/feedback/FeedbackPortal';

export default function MainRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Публичный роут - Портал обратной связи */}
          <Route path="/feedback/:token" element={<FeedbackPortal />} />
          
          {/* Приватные роуты - Основное приложение */}
          <Route path="/*" element={<RootApp />} />
        </Routes>
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
