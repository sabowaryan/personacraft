'use client';

import { SignUp, useUser } from "@stackframe/stack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CustomSignUpPage() {
  const user = useUser();
  const router = useRouter();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      // Si l'email est vérifié, rediriger vers le dashboard
      if (user.primaryEmailVerified) {
        router.push('/dashboard');
      }
      // Si l'email n'est pas vérifié, laisser Stack Auth gérer la redirection automatique
    }
  }, [user, router]);

  // Ne pas afficher la page si l'utilisateur est connecté
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              PersonaCraft
            </h1>
          </Link>
          <p className="text-gray-600 text-lg">
            Créez votre compte et commencez à générer des personas marketing
          </p>
        </div>

        {/* Sign Up Component */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-100 to-purple-100 rounded-full translate-y-8 -translate-x-8 opacity-50"></div>

          <div className="relative z-10">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Créer un compte
              </h2>
              <p className="text-gray-600 text-center mt-2">
                Rejoignez PersonaCraft gratuitement
              </p>
            </div>

            <SignUp />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{" "}
                <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>


        {/* Trust indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Sécurisé</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Gratuit</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

