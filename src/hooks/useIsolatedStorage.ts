'use client';

import { useState, useEffect } from 'react';

export function useIsolatedStorage<T>(sectionKey: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [userKey, setUserKey] = useState<string>('default_user');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Obtém o ID do utilizador/perfil autenticado na sessão atual
      const activeUser = localStorage.getItem('capitulando_active_profile_id') || localStorage.getItem('capitulando_logged_user') || 'default_user';
      setUserKey(activeUser);
    }
  }, []);

  const fullKey = `capitulando_${userKey}_${sectionKey}`;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const activeUser = localStorage.getItem('capitulando_active_profile_id') || localStorage.getItem('capitulando_logged_user') || 'default_user';
      const item = localStorage.getItem(`capitulando_${activeUser}_${sectionKey}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao carregar dados isolados (${fullKey}):`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        const activeUser = localStorage.getItem('capitulando_active_profile_id') || localStorage.getItem('capitulando_logged_user') || 'default_user';
        localStorage.setItem(`capitulando_${activeUser}_${sectionKey}`, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao guardar dados isolados (${fullKey}):`, error);
    }
  };

  return [storedValue, setValue];
}