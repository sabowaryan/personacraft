'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface ClientDynamicWrapperProps {
  importPath: string;
  loadingComponent?: ComponentType;
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

export default function ClientDynamicWrapper({ importPath, loadingComponent: Loading = LoadingSpinner }: ClientDynamicWrapperProps) {
  const DynamicComponent = dynamic(
    () => {
      switch (importPath) {
        case 'signin':
          return import('@/app/auth/signin/SignInContent');
        case 'signup':
          return import('@/app/auth/signup/SignUpContent');
        case 'verify-email':
          return import('@/app/auth/verify-email/VerifyEmailContent');
        case 'onboarding':
          return import('@/app/onboarding/OnboardingContent');
        default:
          throw new Error(`Unknown import path: ${importPath}`);
      }
    },
    {
      ssr: false,
      loading: Loading
    }
  );

  return <DynamicComponent />;
}