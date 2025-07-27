'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  errorCode: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export default function ErrorPage({
  errorCode,
  title,
  description,
  illustration,
  showHomeButton = true,
  showBackButton = true,
}: ErrorPageProps) {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background extension to cover navbar area */}
      <div className="absolute top-0 left-0 right-0 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1000ms' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2000ms' }}></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '500ms' }}></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="max-w-lg w-full text-center z-10">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
            {errorCode}
          </h1>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80">
            {illustration}
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showHomeButton && (
            <Link href="/">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                Retour à l'accueil
              </Button>
            </Link>
          )}

          {showBackButton && (
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Retour en arrière
            </Button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}