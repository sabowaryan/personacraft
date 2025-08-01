'use client';

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack-client";

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
  // Si l'auth est désactivée, retourner directement les enfants sans le provider Stack
  if (isAuthDisabled()) {
    console.log('🚫 Auth disabled - bypassing StackProvider');
    return <div style={customTheme}>{children}</div>;
  }

  return (
    <StackProvider app={stackClientApp}>
      <StackTheme theme={customTheme}>
        {children}
      </StackTheme>
    </StackProvider>
  );
}