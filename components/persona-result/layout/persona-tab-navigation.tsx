'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Heart, 
  MessageCircle, 
  Target,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  description?: string;
}

export interface PersonaTabNavigationProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'default' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showBadges?: boolean;
  showIcons?: boolean;
  scrollable?: boolean;
  className?: string;
}

export function PersonaTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'default',
  orientation = 'horizontal',
  showBadges = true,
  showIcons = true,
  scrollable = true,
  className,
}: PersonaTabNavigationProps) {
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab && !nextTab.disabled) {
      onTabChange(nextTab.id);
    }
  }, [tabs, activeTab, onTabChange]);

  // Check scroll state
  const checkScrollState = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollState();
    container.addEventListener('scroll', checkScrollState);
    
    const resizeObserver = new ResizeObserver(checkScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollState);
      resizeObserver.disconnect();
    };
  }, [checkScrollState]);

  // Scroll functions
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Scroll active tab into view
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    const activeButton = container?.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    
    if (container && activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
        activeButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  const getTabVariantClasses = (isActive: boolean, disabled: boolean) => {
    const baseClasses = 'relative transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
      default: cn(
        'border-b-2 bg-transparent hover:bg-muted/50',
        {
          'border-primary text-primary': isActive,
          'border-transparent text-muted-foreground hover:text-foreground': !isActive,
          'opacity-50 cursor-not-allowed': disabled,
        }
      ),
      pills: cn(
        'rounded-full',
        {
          'bg-primary text-primary-foreground': isActive,
          'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground': !isActive,
          'opacity-50 cursor-not-allowed': disabled,
        }
      ),
      underline: cn(
        'border-b-2 bg-transparent',
        {
          'border-primary text-primary': isActive,
          'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground': !isActive,
          'opacity-50 cursor-not-allowed': disabled,
        }
      ),
      cards: cn(
        'rounded-lg border',
        {
          'bg-background border-primary text-primary shadow-sm': isActive,
          'bg-transparent border-transparent text-muted-foreground hover:bg-muted hover:text-foreground': !isActive,
          'opacity-50 cursor-not-allowed': disabled,
        }
      ),
    };

    return cn(baseClasses, sizeClasses[size], variantClasses[variant]);
  };

  const containerClasses = cn(
    'flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
      'border-b': variant === 'default' || variant === 'underline',
    },
    className
  );

  const scrollContainerClasses = cn(
    'flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
      'overflow-x-auto scrollbar-hide': scrollable && orientation === 'horizontal',
      'overflow-y-auto scrollbar-hide': scrollable && orientation === 'vertical',
    }
  );

  return (
    <div className={containerClasses}>
      {/* Left scroll button */}
      {scrollable && orientation === 'horizontal' && canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollLeft}
          className="flex-shrink-0 h-full rounded-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Tab container */}
      <div 
        ref={scrollContainerRef}
        className={scrollContainerClasses}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              className={getTabVariantClasses(isActive, !!tab.disabled)}
              title={tab.description}
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                {showIcons && IconComponent && (
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{tab.label}</span>
                {showBadges && tab.badge && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className="ml-1 text-xs"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </span>

              {/* Active indicator for underline variant */}
              {variant === 'underline' && isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {scrollable && orientation === 'horizontal' && canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollRight}
          className="flex-shrink-0 h-full rounded-none"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Default tab configurations for persona sections
export const defaultPersonaTabs: TabConfig[] = [
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    description: 'Informations démographiques et personnelles',
  },
  {
    id: 'interests',
    label: 'Intérêts',
    icon: Heart,
    description: 'Centres d\'intérêt et préférences culturelles',
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    description: 'Préférences de communication et canaux',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Target,
    description: 'Insights marketing et points de douleur',
  },
];

// Hook for managing tab state
export function usePersonaTabs(initialTab?: string) {
  const [activeTab, setActiveTab] = React.useState(initialTab || defaultPersonaTabs[0].id);
  const [visitedTabs, setVisitedTabs] = React.useState<Set<string>>(new Set([activeTab]));

  const handleTabChange = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
    setVisitedTabs(prev => new Set(Array.from(prev).concat(tabId)));
  }, []);

  const isTabVisited = React.useCallback((tabId: string) => {
    return visitedTabs.has(tabId);
  }, [visitedTabs]);

  const resetVisitedTabs = React.useCallback(() => {
    setVisitedTabs(new Set([activeTab]));
  }, [activeTab]);

  return {
    activeTab,
    visitedTabs,
    handleTabChange,
    isTabVisited,
    resetVisitedTabs,
  };
}