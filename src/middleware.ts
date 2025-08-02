import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getStackServerApp } from './stack-server';
import { shouldBypassAuth, isFeatureEnabled } from './lib/feature-flags';
// import { permissionService } from './services/permissionService'; // Temporairement désactivé

export async function middleware(request: NextRequest) {
  const start = Date.now();

  // Si l'authentification est désactivée, permettre l'accès à toutes les routes
  if (shouldBypassAuth()) {
    console.log(`🚫 Auth disabled - allowing access to: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  }

  // Routes d'API d'authentification qui doivent être accessibles sans authentification
  const publicApiRoutes = ['/api/auth/', '/api/webhooks/'];
  const isPublicApiRoute = publicApiRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isPublicApiRoute) {
    console.log(`Allowing access to public API route: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  }

  // Récupérer la session utilisateur avec Stack Auth
  let user = null;
  try {
    const stackServerApp = await getStackServerApp();
    user = await stackServerApp.getUser();
  } catch (error) {
    console.warn('Stack auth temporarily disabled or error occurred:', error);
    user = null;
  }

  // Routes d'authentification - rediriger les utilisateurs connectés vers le dashboard
  // Exception: permettre l'accès à /auth/verify-email pour les utilisateurs avec email non vérifié
  const authRoutes = ['/auth/signin', '/auth/signup', '/handler/signin', '/handler/signup'];
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  const isVerifyEmailRoute = request.nextUrl.pathname === '/auth/verify-email';

  // Handle verify-email route separately
  if (isVerifyEmailRoute && user) {
    // If email is already verified, redirect to dashboard
    if (user.primaryEmailVerified) {
      console.log(`Redirecting authenticated user from ${request.nextUrl.pathname} to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If email is not verified, allow access to verify-email page
    return NextResponse.next();
  }

  if (isAuthRoute && user) {
    // Si l'email n'est pas vérifié, rediriger vers la page de vérification
    if (!user.primaryEmailVerified) {
      console.log(`Redirecting user with unverified email from ${request.nextUrl.pathname} to /auth/verify-email`);
      return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    }
    console.log(`Redirecting authenticated user from ${request.nextUrl.pathname} to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Routes protégées - rediriger les utilisateurs non connectés vers la connexion
  const protectedRoutes = ['/dashboard', '/admin', '/create-persona', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    console.log(`Redirecting unauthenticated user from ${request.nextUrl.pathname} to /auth/signin`);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Vérification de l'email vérifié pour les routes protégées (si activée)
  if (isProtectedRoute && user && 'primaryEmailVerified' in user && !user.primaryEmailVerified && isFeatureEnabled('EMAIL_VERIFICATION_REQUIRED')) {
    console.log(`Redirecting user with unverified email from ${request.nextUrl.pathname} to /auth/verify-email`);
    return NextResponse.redirect(new URL('/auth/verify-email', request.url));
  }

  // Vérification de l'onboarding pour les routes protégées (sauf /onboarding) - si activée
  const isOnboardingRoute = request.nextUrl.pathname === '/onboarding';
  if (isProtectedRoute && !isOnboardingRoute && user && 'primaryEmailVerified' in user && user.primaryEmailVerified && isFeatureEnabled('ONBOARDING_REQUIRED')) {
    const isOnboarded = user.clientReadOnlyMetadata?.onboardedAt;
    if (!isOnboarded) {
      console.log(`Redirecting user without onboarding from ${request.nextUrl.pathname} to /onboarding`);
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Si l'utilisateur est déjà onboardé et essaie d'accéder à /onboarding, rediriger vers dashboard
  if (isOnboardingRoute && user && 'primaryEmailVerified' in user && user.primaryEmailVerified && isFeatureEnabled('ONBOARDING_REQUIRED')) {
    const isOnboarded = user.clientReadOnlyMetadata?.onboardedAt;
    if (isOnboarded) {
      console.log(`Redirecting onboarded user from /onboarding to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Vérification des permissions admin (temporairement désactivée pour éviter les boucles)
  /*
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    try {
      const isAdmin = await permissionService.hasPermission(user.id, 'admin_access');
      if (!isAdmin) {
        console.log(`Access denied for user ${user.id} to admin route`);
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      return NextResponse.json({ error: 'Erreur de vérification des permissions' }, { status: 500 });
    }
  }

  // Vérification des limites de création de personas (temporairement désactivée pour éviter les boucles)
  if (request.nextUrl.pathname.startsWith('/create-persona') && user) {
    try {
      const canCreate = await permissionService.checkPersonaLimit(user.id);
      if (!canCreate) {
        console.log(`Persona creation limit reached for user ${user.id}`);
        return NextResponse.json({
          error: 'Limite de création de personas atteinte pour votre plan.'
        }, { status: 403 });
      }
    } catch (error) {
      console.error('Error checking persona limit:', error);
      return NextResponse.json({ error: 'Erreur de vérification des limites' }, { status: 500 });
    }
  }
  */

  const response = NextResponse.next();

  const end = Date.now();
  const duration = end - start;
  console.log(`Request to ${request.nextUrl.pathname} took ${duration}ms`);

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/create-persona/:path*', '/api/:path*', '/auth/:path*', '/onboarding', '/handler/signin', '/handler/signup'],
};


