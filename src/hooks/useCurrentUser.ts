/**
 * CURRENT USER HOOK
 * Получение ID и роли текущего пользователя
 */

import { useState, useEffect } from 'react';

export function useCurrentUser() {
  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('userId') || 'unknown';
  });

  const [userRole, setUserRole] = useState<'artist' | 'admin'>(() => {
    return (localStorage.getItem('userRole') as 'artist' | 'admin') || 'artist';
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('userName') || 'User';
  });

  useEffect(() => {
    // Listen for storage changes (when user switches accounts)
    const handleStorageChange = () => {
      setUserId(localStorage.getItem('userId') || 'unknown');
      setUserRole((localStorage.getItem('userRole') as 'artist' | 'admin') || 'artist');
      setUserName(localStorage.getItem('userName') || 'User');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    userId,
    userRole,
    userName,
    isArtist: userRole === 'artist',
    isAdmin: userRole === 'admin',
  };
}
