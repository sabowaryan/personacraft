'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ServerErrorIllustration from '@/components/illustrations/ServerErrorIllustration';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen">
      {/* Background extension to cover navbar area */}
      <div className="absolute top-0 left-0 right-0 min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 -z-10">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-orange-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1000ms' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2000ms' }}></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-red-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '500ms' }}></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="max-w-lg w-full text-center z-10">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 tracking-tight">
            500
          </h1>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80">
            <ServerErrorIllustration />
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Erreur interne du serveur
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Quelque chose s'est mal passé de notre côté. Nos serveurs rencontrent des difficultés techniques.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
              <summary className="cursor-pointer font-medium text-red-800 mb-2">
                Détails de l'erreur (développement)
              </summary>
              <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Réessayer
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}