'use client';

import { useState, useEffect } from "react";
import { shouldBypassAuth } from "@/lib/feature-flags";

interface StackProviderWrapperProps {
  children: React.ReactNode;
  customTheme?: any; // Made optional since we're not using Stack Auth themes
}

export default function StackProviderWrapper({ children, customTheme }: StackProviderWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR or when auth is bypassed, just return children
  if (!isClient || shouldBypassAuth()) {
    if (shouldBypassAuth() && isClient) {
      console.log('🚫 Auth disabled - using dev auth system');
    }
    return <div className="min-h-screen">{children}</div>;
  }

  // If we reach here, auth is enabled but Stack Auth is not available
  // This should not happen in the current setup, but we'll handle it gracefully
  console.warn('Auth enabled but Stack Auth not configured - falling back to dev mode');
  return <div className="min-h-screen">{children}</div>;
}