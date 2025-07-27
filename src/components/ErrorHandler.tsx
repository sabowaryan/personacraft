'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorHandlerProps {
  statusCode: number;
  message?: string;
}

export default function ErrorHandler({ statusCode, message }: ErrorHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to appropriate error page based on status code
    switch (statusCode) {
      case 401:
        router.push('/401');
        break;
      case 403:
        router.push('/403');
        break;
      case 404:
        router.push('/404');
        break;
      case 500:
      default:
        // For 500 and other server errors, we'll let the error.tsx handle it
        throw new Error(message || `HTTP ${statusCode} Error`);
    }
  }, [statusCode, message, router]);

  return null;
}

// Utility function to handle API errors
export function handleApiError(error: any) {
  if (error.response) {
    const statusCode = error.response.status;
    const message = error.response.data?.message || error.message;
    
    return { statusCode, message };
  }
  
  return { statusCode: 500, message: error.message || 'Une erreur inattendue s\'est produite' };
}