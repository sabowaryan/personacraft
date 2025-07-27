'use client';

import { useUser } from '@stackframe/stack';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import LogoWithText from './LogoWithText';

// Types pour les thèmes de sections
type SectionTheme = {
    background: string;
    text: string;
    textHover: string;
    border: string;
    logoVariant: 'primary' | 'white' | 'dark';
    buttonStyle: string;
    buttonHoverStyle: string;
};

// Configuration des thèmes par section
const sectionThemes: Record<string, SectionTheme> = {
    hero: {
        background: 'bg-transparent',
        text: 'text-white',
        textHover: 'hover:text-white/80',
        border: 'border-white/20',
        logoVariant: 'white',
        buttonStyle: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20',
        buttonHoverStyle: 'bg-white text-gray-900 hover:bg-gray-100'
    },
    features: {
        background: 'bg-blue-50/80 backdrop-blur-sm',
        text: 'text-blue-900',
        textHover: 'hover:text-blue-700',
        border: 'border-blue-200',
        logoVariant: 'primary',
        buttonStyle: 'text-blue-700 hover:text-blue-900 hover:bg-blue-100',
        buttonHoverStyle: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    pricing: {
        background: 'bg-purple-50/80 backdrop-blur-sm',
        text: 'text-purple-900',
        textHover: 'hover:text-purple-700',
        border: 'border-purple-200',
        logoVariant: 'primary',
        buttonStyle: 'text-purple-700 hover:text-purple-900 hover:bg-purple-100',
        buttonHoverStyle: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    testimonials: {
        background: 'bg-green-50/80 backdrop-blur-sm',
        text: 'text-green-900',
        textHover: 'hover:text-green-700',
        border: 'border-green-200',
        logoVariant: 'primary',
        buttonStyle: 'text-green-700 hover:text-green-900 hover:bg-green-100',
        buttonHoverStyle: 'bg-green-600 hover:bg-green-700 text-white'
    },
    contact: {
        background: 'bg-gray-900/90 backdrop-blur-sm',
        text: 'text-white',
        textHover: 'hover:text-gray-200',
        border: 'border-gray-700',
        logoVariant: 'white',
        buttonStyle: 'text-gray-300 hover:text-white hover:bg-gray-800',
        buttonHoverStyle: 'bg-white text-gray-900 hover:bg-gray-100'
    },
    default: {
        background: 'bg-white/95 backdrop-blur-sm',
        text: 'text-gray-700',
        textHover: 'hover:text-violet-700',
        border: 'border-gray-300',
        logoVariant: 'primary',
        buttonStyle: 'text-gray-700 hover:text-violet-700 hover:bg-gray-100',
        buttonHoverStyle: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'
    }
};

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState('hero');

    // Utiliser Stack Auth pour l'authentification
    const user = useUser();
    const isUserAuthenticated = user && user.primaryEmailVerified;
    const isUserLoggedButUnverified = user && !user.primaryEmailVerified;

    // Hook pour détecter le scroll et les sections
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            // Détecter la section actuelle
            let activeSection = 'hero'; // Par défaut

            // Vérifier d'abord si on est sur une page dédiée
            if (pathname === '/pricing') {
                activeSection = 'pricing';
            } else if (pathname === '/features') {
                activeSection = 'features';
            } else if (pathname === '/contact') {
                activeSection = 'contact';
            } else if (pathname.startsWith('/dashboard')) {
                activeSection = 'default';
            } else if (pathname === '/404' || pathname === '/403' || pathname === '/maintenance' || pathname.startsWith('/error')) {
                activeSection = 'default';
            } else if (pathname === '/') {
                // Page d'accueil - détecter les sections par scroll
                const sections = ['hero', 'features', 'pricing', 'testimonials', 'contact'];

                // Si on est tout en haut de la page (moins de 100px), forcer le thème hero
                if (scrollY < 100) {
                    activeSection = 'hero';
                } else {
                    // Sinon, détecter la section active
                    for (const section of sections) {
                        const element = document.getElementById(section);
                        if (element) {
                            const rect = element.getBoundingClientRect();
                            const elementTop = rect.top + scrollY;
                            const elementHeight = rect.height;

                            // Si la navbar est dans cette section (avec un offset pour la navbar)
                            if (scrollY >= elementTop - 100 && scrollY < elementTop + elementHeight - 100) {
                                activeSection = section;
                                break;
                            }
                        }
                    }
                }
            } else {
                // Autres pages - utiliser le thème par défaut
                activeSection = 'default';
            }

            setCurrentSection(activeSection);
        };

        // Écouter le scroll
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Appel initial

        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // Obtenir le thème actuel
    const currentTheme = sectionThemes[currentSection] || sectionThemes.default;

    const getLinkClasses = (href: string) => {
        const isActive = pathname === href;
        const baseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-all duration-300";

        if (isActive) {
            return `${baseClasses} bg-white/20 backdrop-blur-sm ${currentTheme.text} border border-white/30`;
        }

        return `${baseClasses} ${currentTheme.text} ${currentTheme.textHover} hover:bg-white/10`;
    };

    const getMobileLinkClasses = (href: string) => {
        const isActive = pathname === href;
        const baseClasses = "block px-3 py-2 rounded-md text-base font-medium transition-all duration-300";

        if (isActive) {
            return `${baseClasses} bg-violet-100 text-violet-700 border border-violet-200`;
        }

        return `${baseClasses} text-gray-700 hover:text-violet-700 hover:bg-gray-100`;
    };
    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${currentTheme.background} border-b ${currentTheme.border}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Left */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <LogoWithText
                                text="PersonaCraft"
                                size="md"
                                variant={currentTheme.logoVariant}
                                className="hover:opacity-80 transition-opacity duration-300"
                            />
                        </Link>
                    </div>

                    {/* Navigation Links - Center (Desktop only) */}
                    <div className="hidden lg:flex flex-1 justify-center">
                        <div className="flex items-center space-x-1">
                            <Link
                                href="/"
                                className={getLinkClasses("/")}
                            >
                                Accueil
                            </Link>
                            <Link
                                href="/features"
                                className={getLinkClasses("/features")}
                            >
                                Fonctionnalités
                            </Link>
                            <Link
                                href="/docs"
                                className={getLinkClasses("/docs")}
                            >
                                Documentation
                            </Link>
                            <Link
                                href="/pricing"
                                className={getLinkClasses("/pricing")}
                            >
                                Tarifs
                            </Link>
                        </div>
                    </div>

                    {/* Right Section - Desktop: User Avatar or CTA Buttons + Mobile: Hamburger */}
                    <div className="flex items-center space-x-4">
                        {/* Desktop CTA/Avatar */}
                        {isUserAuthenticated ? (
                            /* User Avatar and Menu */
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                        {user.profileImageUrl ? (
                                            <Image
                                                src={user.profileImageUrl}
                                                alt={user.displayName || user.primaryEmail || 'User'}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.primaryEmail || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className={`hidden md:block font-medium ${currentTheme.text}`}>
                                        {user.displayName || user.primaryEmail || 'User'}
                                    </span>
                                    <svg className={`w-4 h-4 ${currentTheme.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                <span>Dashboard</span>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/dashboard/personas"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                <span>Mes Personas</span>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/dashboard/templates"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>Templates</span>
                                            </div>
                                        </Link>
                                        <hr className="my-1 border-gray-200 dark:border-gray-600" />
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>Paramètres</span>
                                            </div>
                                        </Link>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            onClick={async () => {
                                                setIsUserMenuOpen(false);
                                                await user?.signOut();
                                            }}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Déconnexion</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : isUserLoggedButUnverified ? (
                            /* User logged but email not verified */
                            <div className="hidden md:flex items-center space-x-3">
                                <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="text-sm text-yellow-800">Email non vérifié</span>
                                </div>
                                <Link href="/auth/verify-email">
                                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                        Vérifier l'email
                                    </Button>
                                </Link>
                                <button
                                    onClick={async () => await user?.signOut()}
                                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            /* CTA Buttons for non-logged users */
                            <div className="hidden md:flex items-center space-x-3">
                                <Link href="/auth/signin">
                                    <Button variant="ghost" size="sm" className={currentTheme.buttonStyle}>
                                        Connexion
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm" className={currentTheme.buttonHoverStyle}>
                                        Commencer gratuitement
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <div className="lg:hidden">
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`${currentTheme.text} ${currentTheme.textHover} focus:outline-none transition-colors duration-300 p-2 rounded-md hover:bg-white/10`}
                                aria-label="Menu"
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/"
                        className={getMobileLinkClasses("/")}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Accueil
                    </Link>
                    <Link
                        href="/features"
                        className={getMobileLinkClasses("/features")}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Fonctionnalités
                    </Link>
                    <Link
                        href="/docs"
                        className={getMobileLinkClasses("/docs")}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Documentation
                    </Link>
                    <Link
                        href="/pricing"
                        className={getMobileLinkClasses("/pricing")}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Tarifs
                    </Link>

                    {/* Mobile CTA Buttons */}
                    {!isUserAuthenticated && !isUserLoggedButUnverified && (
                        <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-600 mt-4">
                            <div className="space-y-2">
                                <Link
                                    href="/auth/signin"
                                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white transition-all duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Commencer gratuitement
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Mobile Unverified User */}
                    {isUserLoggedButUnverified && (
                        <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-600 mt-4">
                            <div className="px-3 py-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-center space-x-2 mb-2">
                                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="text-sm font-medium text-yellow-800">Email non vérifié</span>
                                </div>
                                <p className="text-xs text-yellow-700 mb-2">
                                    Veuillez vérifier votre email pour accéder à toutes les fonctionnalités.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Link
                                    href="/auth/verify-email"
                                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Vérifier l'email
                                </Link>
                                <button
                                    onClick={async () => {
                                        setIsMenuOpen(false);
                                        await user?.signOut();
                                    }}
                                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile User Menu */}
                    {isUserAuthenticated && (
                        <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-600 mt-4">
                            <div className="flex items-center px-3 py-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                                    {user.profileImageUrl ? (
                                        <Image
                                            src={user.profileImageUrl}
                                            alt={user.displayName || user.primaryEmail || 'User'}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        (user.displayName || user.primaryEmail || 'User').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.displayName || user.primaryEmail || 'User'}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.primaryEmail || 'No email'}</div>
                                </div>
                            </div>
                            <Link
                                href="/dashboard"
                                className={getMobileLinkClasses("/dashboard")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/dashboard/personas"
                                className={getMobileLinkClasses("/dashboard/personas")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Mes Personas
                            </Link>
                            <Link
                                href="/dashboard/templates"
                                className={getMobileLinkClasses("/dashboard/templates")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Templates
                            </Link>
                            <Link
                                href="/settings"
                                className={getMobileLinkClasses("/settings")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Paramètres
                            </Link>
                            <button
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                onClick={async () => {
                                    setIsMenuOpen(false);
                                    await user?.signOut();
                                }}
                            >
                                Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}