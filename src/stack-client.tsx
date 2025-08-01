'use client';

import { StackClientApp } from '@stackframe/stack';
import { stackConfig } from './stack';

// Create a singleton instance
export const stackClientApp = new StackClientApp({
  ...stackConfig,
  urls: {
    ...stackConfig.urls,
    emailVerification: '/handler/email-verification',
    afterSignUp: '/auth/verify-email',
  }
});

// Also export as a function for compatibility
export function getStackClientApp() {
  return stackClientApp;
}