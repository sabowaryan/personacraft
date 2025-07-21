'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, Home, User, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

export interface PersonaBreadcrumbsProps {
  persona?: {
    id: string;
    name: string;
    avatar?: string;
  };
  customItems?: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

export function PersonaBreadcrumbs({
  persona,
  customItems,
  showBackButton = false,
  className,
}: PersonaBreadcrumbsProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Generate breadcrumb items based on current path and persona
  const breadcrumbItems = React.useMemo(() => {
    if (customItems) {
      return customItems;
    }

    const items: BreadcrumbItem[] = [
      {
        label: 'Accueil',
        href: '/',
        icon: <Home className="h-4 w-4" />,
      },
    ];

    // Add generator link if we're in persona context
    if (pathname.includes('/generator') || pathname.includes('/personas')) {
      items.push({
        label: 'Générateur',
        href: '/generator',
        icon: <Users className="h-4 w-4" />,
      });
    }

    // Add personas list if we're viewing a specific persona
    if (persona && pathname.includes('/personas/')) {
      items.push({
        label: 'Mes Personas',
        href: '/personas',
        icon: <Users className="h-4 w-4" />,
      });
    }

    // Add current persona
    if (persona) {
      items.push({
        label: persona.name,
        icon: persona.avatar ? (
          <img 
            src={persona.avatar} 
            alt={persona.name}
            className="h-4 w-4 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4" />
        ),
        current: true,
      });
    }

    return items;
  }, [pathname, persona, customItems]);

  const handleBack = () => {
    router.back();
  };

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm', className)}
      aria-label="Breadcrumb"
    >
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mr-2 h-8 px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      )}

      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
            
            {item.current ? (
              <span 
                className="flex items-center gap-2 text-foreground font-medium max-w-[200px] truncate"
                aria-current="page"
              >
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || '#'}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors max-w-[200px] truncate"
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Breadcrumb context for managing navigation history
interface BreadcrumbContextType {
  history: BreadcrumbItem[];
  addBreadcrumb: (item: BreadcrumbItem) => void;
  removeBreadcrumb: (index: number) => void;
  clearHistory: () => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = React.useState<BreadcrumbItem[]>([]);

  const addBreadcrumb = React.useCallback((item: BreadcrumbItem) => {
    setHistory(prev => {
      // Avoid duplicates
      const exists = prev.some(existing => existing.href === item.href);
      if (exists) return prev;
      
      return [...prev, item];
    });
  }, []);

  const removeBreadcrumb = React.useCallback((index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
  }, []);

  const value = React.useMemo(() => ({
    history,
    addBreadcrumb,
    removeBreadcrumb,
    clearHistory,
  }), [history, addBreadcrumb, removeBreadcrumb, clearHistory]);

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within BreadcrumbProvider');
  }
  return context;
}

// Smart breadcrumb component that automatically tracks navigation
export function SmartBreadcrumbs({ 
  className,
  maxItems = 4,
}: { 
  className?: string;
  maxItems?: number;
}) {
  const { history } = useBreadcrumbs();
  const pathname = usePathname();

  // Limit the number of breadcrumb items shown
  const visibleItems = React.useMemo(() => {
    if (history.length <= maxItems) {
      return history;
    }

    // Show first item, ellipsis, and last few items
    return [
      history[0],
      { label: '...', icon: null },
      ...history.slice(-(maxItems - 2)),
    ];
  }, [history, maxItems]);

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      <ol className="flex items-center space-x-1">
        {visibleItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            
            {item.label === '...' ? (
              <span className="text-muted-foreground px-2">...</span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-2 text-foreground font-medium">
                {item.icon}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}