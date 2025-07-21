'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Sparkles, 
  Wand2, 
  BarChart3, 
  FileText, 
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  Monitor 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Accueil',
    href: '/',
    icon: null
  },
  {
    name: 'Générateur',
    href: '/generator',
    icon: Wand2
  },
  {
    name: 'Personas',
    href: '/personas',
    icon: BarChart3,
    submenu: [
      { name: 'Liste des personas', href: '/personas' },
      { name: 'Résultats détaillés', href: '/personas/example-id/result' }
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3
  },
  {
    name: 'Documentation',
    href: '/docs',
    icon: FileText,
    submenu: [
      { name: 'Guide de démarrage', href: '/docs/getting-started' },
      { name: 'API Reference', href: '/docs/api' },
      { name: 'Exemples', href: '/docs/examples' }
    ]
  },
  {
    name: 'Support',
    href: '/support',
    icon: HelpCircle
  }
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Éviter l'hydratation mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Détection du scroll pour l'effet de transparence progressive
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Appel initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveSubmenu(null);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSubmenu = (itemName: string) => {
    setActiveSubmenu(activeSubmenu === itemName ? null : itemName);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Calculer l'opacité basée sur le scroll
  const getBackgroundOpacity = () => {
    if (scrollY <= 0) return 0;
    if (scrollY >= 100) return 1;
    return scrollY / 100;
  };

  // Calculer l'opacité du backdrop blur
  const getBlurOpacity = () => {
    if (scrollY <= 0) return 0;
    if (scrollY >= 80) return 1;
    return scrollY / 80;
  };

  if (!mounted) return null; // Attendre le montage pour éviter mismatch

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out">
      {/* Background avec opacité progressive */}
      <div 
        className="absolute inset-0 bg-white dark:bg-gray-900 transition-opacity duration-300"
        style={{ opacity: getBackgroundOpacity() }}
      />
      
      {/* Backdrop blur avec opacité progressive */}
      <div 
        className="absolute inset-0 backdrop-blur-md transition-opacity duration-300"
        style={{ opacity: getBlurOpacity() }}
      />
      
      {/* Border avec opacité progressive */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700 transition-opacity duration-300"
        style={{ opacity: getBackgroundOpacity() }}
      />
      
      {/* Contenu du header */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105"
          >
            <div className="relative">
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400 transition-colors duration-200" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-secondary-500 dark:bg-secondary-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
              PersonaCraft
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const hasSubmenu = item.submenu && item.submenu.length > 0;

              return (
                <div key={item.name} className="relative group">
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={cn(
                        "flex items-center space-x-1 text-sm font-medium transition-all duration-200 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105",
                        isActive 
                          ? "text-primary-600 dark:text-primary-400" 
                          : "text-gray-700 dark:text-gray-200"
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.name}</span>
                      <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-1 text-sm font-medium transition-all duration-200 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105 px-3 py-2 rounded-lg",
                        isActive 
                          ? "text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-900/40" 
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  )}

                  {/* Submenu Desktop */}
                  {hasSubmenu && (
                    <div className="absolute top-full left-0 mt-3 w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="py-2">
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              key={theme} // Forcer re-render sur changement de thème
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              className="w-9 h-9 p-0 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:scale-110 transition-all duration-200"
            >
              {getThemeIcon()}
            </Button>

            {/* CTA Button */}
            <Link href="/generator">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 dark:hover:from-primary-600 dark:hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Créer un persona
              </Button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Theme Toggle Mobile */}
            <Button
              key={theme}
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              className="w-9 h-9 p-0 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:scale-110 transition-all duration-200"
            >
              {getThemeIcon()}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="w-9 h-9 p-0 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:scale-110 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Mobile */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen 
            ? "max-h-screen opacity-100 pb-4" 
            : "max-h-0 opacity-0"
        )}>
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isSubmenuOpen = activeSubmenu === item.name;

                return (
                  <div key={item.name} className="space-y-1">
                    {hasSubmenu ? (
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]",
                          isActive 
                            ? "text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-900/40" 
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isSubmenuOpen ? "rotate-180" : ""
                        )} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]",
                          isActive 
                            ? "text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-900/40" 
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.name}</span>
                      </Link>
                    )}

                    {/* Submenu Mobile */}
                    {hasSubmenu && (
                      <div className={cn(
                        "ml-6 space-y-1 overflow-hidden transition-all duration-300",
                        isSubmenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                      )}>
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile CTA */}
            <div className="mt-6 px-4">
              <Link href="/generator" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 dark:hover:from-primary-600 dark:hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Créer un persona
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}