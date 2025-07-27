'use client';

import { useUser, useStackApp } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function VerifyEmailPage() {
    const user = useUser();
    const app = useStackApp();
    const router = useRouter();
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [resendError, setResendError] = useState('');

    useEffect(() => {
        // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
        if (!user) {
            router.push('/auth/signin');
            return;
        }

        // Si l'email est déjà vérifié, rediriger vers l'onboarding ou le dashboard
        if (user.primaryEmailVerified) {
            const isOnboarded = user?.clientReadOnlyMetadata?.onboardedAt;
            router.push(isOnboarded ? '/dashboard' : '/onboarding');
            return;
        }
    }, [user, router]);

    const handleResendVerification = async () => {
        if (!user) return;

        setIsResending(true);
        setResendMessage('');
        setResendError('');

        try {
            // Utiliser l'API interne pour renvoyer l'email de vérification
            const response = await fetch('/api/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.primaryEmail,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setResendMessage('Email de vérification renvoyé avec succès !');
            } else {
                setResendError(result.error || 'Erreur lors du renvoi de l\'email.');
            }
        } catch (error) {
            console.error('Erreur lors du renvoi de l\'email:', error);
            setResendError('Erreur lors du renvoi de l\'email. Veuillez réessayer.');
        } finally {
            setIsResending(false);
        }
    };

    const handleSignOut = async () => {
        if (user) {
            await user.signOut();
            router.push('/');
        }
    };

    // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
    if (!user) {
        return null;
    }

    // Si l'email est déjà vérifié, ne rien afficher (redirection en cours)
    if (user.primaryEmailVerified) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Vérifiez votre email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Nous avons envoyé un lien de vérification à
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        {user.primaryEmail}
                    </p>
                </div>

                <Card className="p-6">
                    <div className="space-y-4">
                        <Alert>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="font-medium">Vérification requise</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Pour accéder à votre dashboard et utiliser toutes les fonctionnalités de PersonaCraft,
                                    vous devez d'abord vérifier votre adresse email.
                                </p>
                            </div>
                        </Alert>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                Étapes à suivre :
                            </h3>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Vérifiez votre boîte de réception</li>
                                <li>Cliquez sur le lien de vérification dans l'email</li>
                                <li>Vous serez automatiquement redirigé vers votre dashboard</li>
                            </ol>
                        </div>

                        {resendMessage && (
                            <Alert className="border-green-200 bg-green-50">
                                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-green-800">{resendMessage}</p>
                            </Alert>
                        )}

                        {resendError && (
                            <Alert className="border-red-200 bg-red-50">
                                <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-800">{resendError}</p>
                            </Alert>
                        )}

                        <div className="space-y-3">
                            <Button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full bg-violet-600 hover:bg-violet-700"
                            >
                                {isResending ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Envoi en cours...</span>
                                    </div>
                                ) : (
                                    'Renvoyer l\'email de vérification'
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    onClick={handleSignOut}
                                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                                >
                                    Se déconnecter et utiliser un autre compte
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-xs text-gray-500">
                            <p>
                                Vous ne recevez pas l'email ? Vérifiez votre dossier spam ou
                                contactez notre support si le problème persiste.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
