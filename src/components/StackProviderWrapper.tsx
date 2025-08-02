'use client';

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack-client";
import { useState, useEffect } from "react";

interface StackProviderWrapperProps {
  children: React.ReactNode;
  customTheme: any;
}

// Vérification côté client si l'auth est désactivée
const isAuthDisabled = () => {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_AUTH_ENABLED === 'false' || 
         (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_DISABLE_AUTH === 'true');
};

export default function StackProviderWrapper({ children, customTheme }: StackProviderWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [authDisabled, setAuthDisabled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setAuthDisabled(isAuthDisabled());
  }, []);

  // Éviter l'hydratation mismatch en attendant le côté client
  if (!isClient) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Si l'auth est désactivée, retourner directement les enfants sans le provider Stack
  if (authDisabled) {
    console.log('🚫 Auth disabled - bypassing StackProvider');
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <StackProvider app={stackClientApp}>
      <StackTheme theme={customTheme}>
        {children}
      </StackTheme>
    </StackProvider>
  );
}