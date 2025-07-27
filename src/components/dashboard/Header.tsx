'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePersona } from '@/hooks/use-persona';
import { useExport } from '@/hooks/use-export';
import { useStackSessions } from '@/hooks/use-stack-sessions';
import { useUser } from '@stackframe/stack';

interface PageConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

const getPageConfig = (pathname: string, personasCount: number): PageConfig => {
  if (pathname === '/dashboard') {
    return {
      title: 'Dashboard',
      subtitle: 'Vue d\'ensemble de vos personas et analytics',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      gradient: 'from-blue-500 to-purple-600',
      breadcrumb: [{ label: 'Dashboard' }]
    };
  }
  
  if (pathname === '/dashboard/personas') {
    return {
      title: 'Mes Personas',
      subtitle: `${personasCount} personas créés • Gérez et analysez vos audiences`,
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-persona-violet to-purple-600',
      breadcrumb: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Personas' }
      ]
    };
  }
  
  if (pathname.startsWith('/dashboard/personas/')) {
    return {
      title: 'Détail Persona',
      subtitle: 'Analyse complète et insights détaillés',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-purple-600',
      breadcrumb: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Personas', href: '/dashboard/personas' },
        { label: 'Détail' }
      ]
    };
  }
  
  if (pathname === '/dashboard/templates') {
    return {
      title: 'Templates',
      subtitle: 'Modèles prêts à utiliser pour créer vos personas',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-green-500 to-teal-600',
      breadcrumb: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Templates' }
      ]
    };
  }
  
  if (pathname === '/dashboard/analytics') {
    return {
      title: 'Analytics',
      subtitle: 'Analysez les performances de vos personas',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600',
      breadcrumb: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analytics' }
      ]
    };
  }
  
  return {
    title: 'Dashboard',
    subtitle: 'PersonaCraft - AI-Powered Marketing Personas',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-purple-600',
    breadcrumb: [{ label: 'Dashboard' }]
  };
};

export default function Header() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { personas } = usePersona();
  const { exportAll, isExporting, exportProgress } = useExport();
  const { stats, currentSession, isLoading } = useStackSessions();
  const user = useUser();
  
  const pageConfig = getPageConfig(pathname, personas.length);

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleExportAll = async () => {
    try {
      await exportAll({
        format: 'json',
        includeMetadata: true,
        includeAnalytics: false
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      // Utiliser la méthode de déconnexion de Stack Auth
      await user?.signOut();
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Fallback vers la redirection manuelle
      window.location.href = '/auth/signin?signout=true';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-200/60 shadow-sm">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${pageConfig.gradient} opacity-5`}></div>
      
      <div className="relative">
        <div className="px-2 py-2 sm:px-4 sm:py-3">
          {/* Breadcrumb */}
          {pageConfig.breadcrumb && pageConfig.breadcrumb.length > 1 && (
            <nav className="hidden sm:flex items-center space-x-2 text-xs text-neutral-500 mb-2 overflow-x-auto">
              {pageConfig.breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center space-x-1 flex-shrink-0">
                  {index > 0 && (
                    <svg className="w-3 h-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {item.href ? (
                    <Link 
                      href={item.href} 
                      className="hover:text-persona-violet transition-colors font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-neutral-700 font-semibold whitespace-nowrap">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          <div className="flex items-center justify-between">
            {/* Titre et informations de la page */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${pageConfig.gradient} rounded-xl flex items-center justify-center text-sm sm:text-lg shadow-md flex-shrink-0`}>
                {pageConfig.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center space-x-2 sm:space-x-3 truncate">
                  <span className="truncate">{pageConfig.title}</span>
                  {pathname === '/dashboard/personas' && personas.length > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-persona-violet/10 to-purple-100 text-persona-violet border border-persona-violet/20 flex-shrink-0">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-persona-violet rounded-full mr-1 animate-pulse"></span>
                      {personas.length}
                    </span>
                  )}
                </h1>
                <p className="text-neutral-600 text-xs sm:text-sm truncate hidden sm:block">{pageConfig.subtitle}</p>
              </div>
            </div>

            {/* Actions et statistiques */}
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              {/* Statistiques en temps réel - Desktop */}
              <div className="hidden xl:flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-xs">
                    <span className="text-green-700 font-semibold">
                      {isLoading ? '...' : stats.activeSessions}
                    </span>
                    <span className="text-green-600 ml-1">sessions</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-700 font-semibold text-xs">
                    {currentTime.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>

              {/* Version mobile/tablet des stats */}
              <div className="flex xl:hidden items-center space-x-1 sm:space-x-2">
                <div className="flex items-center space-x-1 px-1.5 py-1 sm:px-2 sm:py-1 bg-green-50 rounded-md">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 font-semibold">
                    {isLoading ? '...' : stats.activeSessions}
                  </span>
                </div>
                <div className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-md">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-700 font-semibold text-xs">
                    {currentTime.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>

              {/* Actions contextuelles */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Bouton d'export global */}
                {personas.length > 0 && (
                  <button
                    onClick={handleExportAll}
                    disabled={isExporting}
                    className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 text-xs font-semibold shadow-md"
                  >
                    <svg className="w-3 h-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">
                      {isExporting ? `Export... ${exportProgress}%` : 'Export'}
                    </span>
                  </button>
                )}

                {/* Bouton de création rapide */}
                {pathname !== '/dashboard/personas' && (
                  <Link
                    href="/dashboard/personas"
                    className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-persona-violet to-purple-600 text-white rounded-lg hover:from-persona-violet/90 hover:to-purple-700 transition-all duration-200 text-xs font-semibold shadow-md"
                  >
                    <svg className="w-3 h-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Nouveau</span>
                  </Link>
                )}
              </div>

              {/* Menu utilisateur */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg hover:bg-neutral-100/80 transition-all duration-200 group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-persona-violet to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden">
                    {user?.profileImageUrl ? (
                      <Image 
                        src={user.profileImageUrl} 
                        alt={user.displayName || user.primaryEmail || 'User'} 
                        width={32}
                        height={32}
                        className="w-full h-full object-cover rounded-full" 
                      />
                    ) : (
                      (user?.displayName || user?.primaryEmail || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-neutral-900">
                      {user?.displayName || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {user?.primaryEmail || 'user@example.com'}
                    </p>
                  </div>
                  <svg className={`w-3 h-3 text-neutral-600 transition-transform hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-persona-violet to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                          {user?.profileImageUrl ? (
                            <Image 
                              src={user.profileImageUrl} 
                              alt={user.displayName || user.primaryEmail || 'User'} 
                              width={32}
                              height={32}
                              className="w-full h-full object-cover rounded-full" 
                            />
                          ) : (
                            (user?.displayName || user?.primaryEmail || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">
                            {user?.displayName || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-neutral-600">
                            {user?.primaryEmail || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <button className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2 transition-colors">
                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profil</span>
                      </button>
                      <Link
                        href="/dashboard/sessions"
                        className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2 transition-colors"
                      >
                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Sessions</span>
                      </Link>
                      <button className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2 transition-colors">
                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Paramètres</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-neutral-100 pt-1">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}