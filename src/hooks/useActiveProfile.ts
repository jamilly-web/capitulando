'use client';

import { useState, useEffect } from 'react';

export interface AuthorProfileData {
  id: string;
  name: string;
  penName: string;
  email: string;
}

export function useActiveProfile() {
  const [activeProfileId, setActiveProfileId] = useState<string>('guest');
  const [currentProfile, setCurrentProfile] = useState<AuthorProfileData>({
    id: 'guest',
    name: 'Autor',
    penName: 'Autor',
    email: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeId = localStorage.getItem('capitulando_active_profile_id') || 'guest';
      setActiveProfileId(activeId);

      // Tenta recuperar os dados do perfil do utilizador autenticado
      const savedProfile = localStorage.getItem(`capitulando_${activeId}_author_profile`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setCurrentProfile({
            id: activeId,
            name: parsed.name || 'Autor',
            penName: parsed.penName || parsed.name || 'Autor',
            email: parsed.email || '',
          });
        } catch (e) {
          console.error('Erro ao ler perfil ativo:', e);
        }
      } else {
        setCurrentProfile({
          id: activeId,
          name: 'Autor',
          penName: 'Autor',
          email: '',
        });
      }
    }
  }, []);

  return { activeProfileId, currentProfile };
}