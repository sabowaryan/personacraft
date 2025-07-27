'use client';

import { useRouter } from 'next/navigation';

interface EmailVerificationErrorProps {
  error: string;
  onRetry?: () => void;
}

export default function EmailVerificationError({ error, onRetry }: EmailVerificationErrorProps) {
  const router = useRouter();

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Erreur de vérification
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {error}
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">
          Le lien de vérification peut avoir expiré ou être invalide.
        </p>
      </div>

      <div className="space-y-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full flex justify-center py-2 px-4 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Réessayer
          </button>
        )}
        
        <button
          onClick={() => router.push('/auth/signin')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}