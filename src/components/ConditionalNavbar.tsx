'use client';

import { useState, useEffect } from 'react';
import NavbarWithoutAuth from './NavbarWithoutAuth';

export default function ConditionalNavbar() {
  const [isClient, setIsClient] = useState(false);
  const [NavbarWithAuth, setNavbarWithAuth] = useState<any>(null);
  
  useEffect(() => {
    setIsClient(true);
    
    // Only load NavbarWithAuth if auth is enabled
    const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
    const devDisableAuth = process.env.NEXT_PUBLIC_DEV_DISABLE_AUTH === 'true';
    const isDev = process.env.NODE_ENV === 'development';
    const shouldShowAuthNavbar = authEnabled && !(isDev && devDisableAuth);
    
    if (shouldShowAuthNavbar) {
      import('./NavbarWithAuth').then((module) => {
        setNavbarWithAuth(() => module.default);
      }).catch((error) => {
        console.warn('NavbarWithAuth not available, falling back to NavbarWithoutAuth:', error);
      });
    }
  }, []);
  
  // During SSR or while loading, show the no-auth navbar
  if (!isClient || !NavbarWithAuth) {
    return <NavbarWithoutAuth />;
  }
  
  return <NavbarWithAuth />;
}