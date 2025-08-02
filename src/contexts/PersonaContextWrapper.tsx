'use client';

import React, { ReactNode } from 'react';
import { PersonaProvider as PersonaProviderBase } from './PersonaContext';
import { shouldBypassAuth } from '@/lib/feature-flags';

interface PersonaProviderWrapperProps {
  children: ReactNode;
}

export function PersonaProviderWrapper({ children }: PersonaProviderWrapperProps) {
  const bypassAuth = shouldBypassAuth();
  
  if (bypassAuth) {
    // Mode développement sans authentification
    return <PersonaProviderBase>{children}</PersonaProviderBase>;
  }
  
  // Mode production avec authentification
  // Ici on pourrait importer dynamiquement les composants Stack si nécessaire
  return <PersonaProviderBase>{children}</PersonaProviderBase>;
}