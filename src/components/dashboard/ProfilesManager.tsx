'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Plus, Check } from 'lucide-react';

export interface Profile {
  id: string;
  name: string;
  penName: string;
}

const DEFAULT_PROFILES: Profile[] = [
  { id: 'profile_1', name: 'Advriqum', penName: 'A. R. Vriqum' },
  { id: 'profile_2', name: 'Aurelia Vance', penName: 'A. Vance' },
];

export function useActiveProfile() {
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('capitulando_active_profile_id') || 'profile_1';
    }
    return 'profile_1';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_active_profile_id', activeProfileId);
    }
  }, [activeProfileId]);

  return { activeProfileId, setActiveProfileId };
}