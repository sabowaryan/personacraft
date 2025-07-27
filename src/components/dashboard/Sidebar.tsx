'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LogoWithText from '@/components/LogoWithText';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
      </svg>
    ),
    href: '/dashboard',
    badge: null
  },
  {
    id: 'personas',
    label: 'Mes Personas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/dashboard/personas',
    badge: null
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    href: '/dashboard/analytics',
    badge: 'Bientôt'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '/dashboard/templates',
    badge: 'Nouveau'
  }
];

const quickActions = [
  {
    id: 'generate',
    label: 'Générer Personas',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    action: 'generate'
  },
  {
    id: 'import',
    label: 'Importer',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    action: 'import'
  }
];

export default function Sidebar({ 
  isCollapsed = false, 
  onToggleCollapse, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleQuickAction = async (actionType: string) => {
    if (isMobile && onClose) {
      onClose();
    }

    switch (actionType) {
      case 'generate':
        // Rediriger vers la page de génération de personas
        router.push('/dashboard/personas');
        break;
      
      case 'import':
        // Simuler l'ouverture d'un dialogue d'import
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            handleFileImport(file);
          }
        };
        input.click();
        break;
      
      default:
        console.log('Action non implémentée:', actionType);
    }
  };

  const handleFileImport = async (file: File) => {
    try {
      setIsGenerating(true);
      const text = await file.text();
      
      // Vérifier le format du fichier
      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(text);
          console.log('Données JSON importées:', data);
          // Ici vous pourriez traiter les données importées
          alert(`Fichier JSON importé avec succès: ${file.name}`);
        } catch (jsonError) {
          console.error('Erreur de parsing JSON:', jsonError);
          alert(`Erreur: Le fichier JSON n'est pas valide - ${jsonError instanceof Error ? jsonError.message : 'Format invalide'}`);
        }
      } else if (file.name.endsWith('.csv')) {
        console.log('Données CSV importées:', text);
        // Ici vous pourriez traiter le CSV
        alert(`Fichier CSV importé avec succès: ${file.name}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import du fichier');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside className={`bg-white border-r border-neutral-200 transition-all duration-300 ${
      isMobile ? 'w-64' : (isCollapsed ? 'w-16' : 'w-64')
    } flex flex-col h-screen`}>
      {/* Logo et Toggle */}
      <div className="p-4 border-b border-neutral-200">
        {!isCollapsed || isMobile ? (
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              onClick={handleLinkClick}
              className="hover:opacity-80 transition-opacity"
            >
              <LogoWithText 
                text="PersonaCraft" 
                size="sm" 
                variant="primary"
              />
            </Link>
            <button
              onClick={isMobile ? onClose : onToggleCollapse}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative z-10"
            >
              {isMobile ? (
                <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg 
                  className="w-4 h-4 text-neutral-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg 
                className="w-4 h-4 text-neutral-600 rotate-180" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center rounded-lg transition-colors group ${
                  isCollapsed && !isMobile 
                    ? 'justify-center px-2 py-2' 
                    : 'space-x-3 px-3 py-2'
                } ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className={`${isActive ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-700'}`}>
                  {item.icon}
                </div>
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        item.badge === 'Nouveau' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions rapides */}
        {(!isCollapsed || isMobile) && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Actions Rapides
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.action)}
                  disabled={isGenerating}
                  className={`w-full flex items-center rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCollapsed && !isMobile 
                      ? 'justify-center px-2 py-2' 
                      : 'space-x-3 px-3 py-2'
                  }`}
                >
                  <div className="text-neutral-500 group-hover:text-neutral-700">
                    {isGenerating && action.action === 'import' ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      action.icon
                    )}
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <span className="text-sm">
                      {isGenerating && action.action === 'import' ? 'Import...' : action.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Section inférieure */}
      <div className="p-4 border-t border-neutral-200 space-y-3">
        {/* Bouton retour à l'accueil */}
        {(!isCollapsed || isMobile) && (
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </Link>
        )}

        {(!isCollapsed || isMobile) && (
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-neutral-900">Statut</span>
            </div>
            <p className="text-xs text-neutral-600">
              Tous les systèmes opérationnels
            </p>
          </div>
        )}
        
        {isCollapsed && !isMobile && (
          <div className="flex flex-col items-center space-y-3">
            <Link
              href="/"
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Retour à l'accueil"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </aside>
  );
}