'use client';

import Link from 'next/link';
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
    context: {
        background: 'bg-slate-50/80 backdrop-blur-sm',
        text: 'text-slate-900',
        textHover: 'hover:text-slate-700',
        border: 'border-slate-200',
        logoVariant: 'primary',
        buttonStyle: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100',
        buttonHoverStyle: 'bg-slate-600 hover:bg-slate-700 text-white'
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
    demo: {
        background: 'bg-white/80 backdrop-blur-md',
        text: 'text-slate-900',
        textHover: 'hover:text-blue-700',
        border: 'border-blue-200/60',
        logoVariant: 'primary',
        buttonStyle: 'text-slate-700 hover:text-blue-700 hover:bg-blue-50',
        buttonHoverStyle: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white'
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

export default function NavbarWithoutAuth() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState('hero');

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
            } else if (pathname === '/demo') {
                activeSection = 'demo';
            } else if (pathname.startsWith('/dashboard')) {
                activeSection = 'default';
            } else if (pathname === '/404' || pathname === '/403' || pathname === '/maintenance' || pathname.startsWith('/error')) {
                activeSection = 'default';
            } else if (pathname === '/') {
                // Page d'accueil - détecter les sections par scroll
                const sections = ['hero', 'features', 'context', 'pricing', 'testimonials', 'contact'];

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

                    {/* Right Section - Mode sans authentification */}
                    <div className="flex items-center space-x-4">
                        {/* Desktop - Mode développement */}
                        <div className="hidden md:flex items-center space-x-3">
                            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                                currentSection === 'hero' || currentSection === 'contact' 
                                    ? 'bg-white/10 border-white/20 text-white/90' 
                                    : 'bg-amber-50/80 border-amber-200/60 text-amber-800'
                            }`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                    currentSection === 'hero' || currentSection === 'contact' 
                                        ? 'bg-green-400' 
                                        : 'bg-amber-500'
                                }`}></div>
                                <span className="text-xs font-medium">DEV</span>
                            </div>
                            <Link href="/dashboard">
                                <Button 
                                    size="sm" 
                                    className={`relative overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${currentTheme.buttonHoverStyle} border-0`}
                                >
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span>Dashboard</span>
                                    </span>
                                </Button>
                            </Link>
                        </div>

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

                    {/* Mobile - Mode développement */}
                    <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-600 mt-4">
                        <div className="px-4 py-3 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold text-amber-800">Mode Développement</span>
                                </div>
                            </div>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Accès direct au dashboard sans authentification pour faciliter le développement.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="group block w-full text-center px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Accéder au Dashboard</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}