'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface EmailVerificationSuccessProps {
  redirectUrl?: string;
  countdown?: number;
}

export default function EmailVerificationSuccess({ 
  redirectUrl = '/dashboard', 
  countdown = 5 
}: EmailVerificationSuccessProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, redirectUrl]);

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Email vérifié avec succès !
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Votre adresse email a été confirmée. Vous allez être redirigé automatiquement.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <p className="text-sm text-green-800">
          Redirection dans <span className="font-semibold">{timeLeft}</span> seconde{timeLeft > 1 ? 's' : ''}...
        </p>
      </div>

      <button
        onClick={() => router.push(redirectUrl)}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
      >
        Continuer maintenant
      </button>
    </div>
  );
}