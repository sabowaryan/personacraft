'use client';

import NavbarWithAuth from './NavbarWithAuth';
import NavbarWithoutAuth from './NavbarWithoutAuth';

export default function ConditionalNavbar() {
  // Utiliser les variables d'environnement publiques côté client
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
  const devDisableAuth = process.env.NEXT_PUBLIC_DEV_DISABLE_AUTH === 'true';
  const isDev = process.env.NODE_ENV === 'development';
  
  // Désactiver l'auth si explicitement désactivée ou en mode dev avec flag
  const shouldShowAuthNavbar = authEnabled && !(isDev && devDisableAuth);
  
  if (shouldShowAuthNavbar) {
    return <NavbarWithAuth />;
  }
  
  return <NavbarWithoutAuth />;
}