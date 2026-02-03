/**
 * ROOT APP - Главный файл приложения с роутингом
 */

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { DataProvider } from '@/contexts/DataContext';
import { UnifiedLogin } from '@/app/components/unified-login';
import ArtistApp from '@/app/ArtistApp';
import { AdminApp } from '@/admin/AdminApp';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    if (import.meta.env.DEV) {
      console.log('🔐 Initial auth state:', auth);
    }
    return auth;
  });
  
  const [userRole, setUserRole] = useState<'artist' | 'admin'>(() => {
    const role = (localStorage.getItem('userRole') as 'artist' | 'admin') || 'artist';
    if (import.meta.env.DEV) {
      console.log('👤 Initial user role:', role);
    }
    return role;
  });

  // Handle login success
  const handleLoginSuccess = (role: 'artist' | 'admin') => {
    if (import.meta.env.DEV) {
      console.log('✅ Login success, role:', role);
    }
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  };

  // Handle logout
  const handleLogout = () => {
    if (import.meta.env.DEV) {
      console.log('👋 Logout triggered');
    }
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  if (import.meta.env.DEV) {
    console.log('🎯 Current state - Auth:', isAuthenticated, 'Role:', userRole);
  }

  // If not authenticated, show unified login
  if (!isAuthenticated) {
    if (import.meta.env.DEV) {
      console.log('🔒 Showing login screen');
    }
    return (
      <ErrorBoundary>
        <UnifiedLogin onLoginSuccess={handleLoginSuccess} />
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </ErrorBoundary>
    );
  }

  // Route based on role
  if (import.meta.env.DEV) {
    console.log('🚀 Rendering app for role:', userRole);
  }
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <DataProvider>
            {userRole === 'admin' ? (
              <>
                {import.meta.env.DEV && console.log('🔵 Loading AdminApp')}
                <AdminApp onLogout={handleLogout} />
              </>
            ) : (
              <>
                {import.meta.env.DEV && console.log('🟢 Loading ArtistApp')}
                <ArtistApp onLogout={handleLogout} />
              </>
            )}
            <Toaster position="top-right" theme="dark" richColors closeButton />
          </DataProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}