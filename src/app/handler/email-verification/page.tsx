'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useStackApp } from '@stackframe/stack';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const app = useStackApp();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const code = searchParams.get('code');
        const afterAuthReturnTo = searchParams.get('after_auth_return_to');

        if (!code) {
          setStatus('error');
          setMessage('Code de vérification manquant');
          return;
        }

        // Utiliser l'API native de Stack Auth pour vérifier l'email
        try {
          await app.verifyEmail(code);

          // Attendre que l'état utilisateur soit mis à jour
          if (user && user.primaryEmailVerified) {
            setStatus('success');
            setMessage('Email vérifié avec succès !');

            // Rediriger après succès - vérifier si l'onboarding est nécessaire
            setTimeout(() => {
              // Si l'utilisateur n'a pas encore fait l'onboarding, l'y rediriger
              const isOnboarded = user?.clientReadOnlyMetadata?.onboardedAt;
              
              if (!isOnboarded) {
                router.push('/onboarding');
              } else {
                const redirectUrl = afterAuthReturnTo ?
                  decodeURIComponent(afterAuthReturnTo) : '/dashboard';
                router.push(redirectUrl);
              }
            }, 2000);
          }
        } catch (verifyError) {
          console.error('Erreur lors de la vérification du code:', verifyError);
          setStatus('error');
          setMessage('Code de vérification invalide ou expiré');
        }

      } catch (error) {
        console.error('Erreur de vérification:', error);
        setStatus('error');
        setMessage('Erreur de connexion');
      }
    };

    verifyEmail();
  }, [searchParams, router, app, user]);

  // Fonction pour renvoyer l'email de vérification
  const resendVerificationEmail = async () => {
    if (user && !user.primaryEmailVerified) {
      try {
        await user.sendVerificationEmail();
        setMessage('Email de vérification renvoyé');
      } catch (error) {
        console.error('Erreur lors du renvoi:', error);
        setMessage('Erreur lors du renvoi de l\'email');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Vérification d'email
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600">Vérification en cours...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-gray-500 text-sm">Redirection en cours...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{message}</p>
                <div className="space-y-2">
                  <button
                    onClick={resendVerificationEmail}
                    className="w-full flex justify-center py-2 px-4 border border-purple-600 rounded-md shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Renvoyer l'email de vérification
                  </button>
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
