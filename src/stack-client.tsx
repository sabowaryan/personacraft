'use client';

import { StackClientApp } from '@stackframe/stack';

// Create a singleton instance
export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    emailVerification: '/handler/email-verification',
    afterSignIn: '/auth/verify-email',
    afterSignUp: '/auth/verify-email',
  }
});

// Also export as a function for compatibility
export function getStackClientApp() {
  return stackClientApp;
}