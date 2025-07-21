'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  children: ReactNode;
  className?: string;
}

// Hook for detecting swipe gestures
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: Omit<SwipeGestureProps, 'children' | 'className'>) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    // Prioritize horizontal swipes over vertical ones
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}

// Swipe gesture wrapper component
export function SwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  children,
  className
}: SwipeGestureProps) {
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold
  });

  return (
    <div
      className={cn('touch-pan-y', className)}
      {...swipeHandlers}
    >
      {children}
    </div>
  );
}

// Mobile-first responsive layout component
export function MobileLayout({
  children,
  header,
  sidebar,
  footer,
  className
}: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && !isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className={cn(
      'min-h-screen flex flex-col',
      'bg-background text-foreground',
      className
    )}>
      {/* Mobile Header */}
      {header && (
        <header className={cn(
          'sticky top-0 z-40',
          'bg-background/95 backdrop-blur-sm',
          'border-b border-border',
          'px-4 py-3',
          'flex items-center justify-between',
          'md:px-6 lg:px-8'
        )}>
          {/* Mobile menu button */}
          {sidebar && (isMobile || isTablet) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                'h-10 w-10',
                'touch-manipulation',
                'active:scale-95 transition-transform'
              )}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <div className="flex-1 flex items-center justify-center md:justify-start">
            {header}
          </div>
        </header>
      )}

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile/Tablet Sidebar Overlay */}
            {(isMobile || isTablet) && sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Sidebar Content */}
            <aside
              id="mobile-sidebar"
              className={cn(
                // Base styles
                'bg-card border-r border-border',
                'flex flex-col',
                // Mobile styles
                'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw]',
                'transform transition-transform duration-300 ease-in-out',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                // Tablet styles
                'md:w-64',
                // Desktop styles
                'lg:relative lg:translate-x-0 lg:w-72',
                // Show/hide based on screen size
                (isMobile || isTablet) ? '' : 'lg:block'
              )}
              aria-hidden={!sidebarOpen && (isMobile || isTablet)}
            >
              {/* Sidebar Header */}
              <div className={cn(
                'flex items-center justify-between',
                'p-4 border-b border-border',
                'lg:hidden'
              )}>
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 flex flex-col',
          'min-w-0', // Prevent flex item from overflowing
          'px-4 py-6',
          'md:px-6 lg:px-8',
          // Add margin for sidebar on desktop
          sidebar && !isMobile && !isTablet ? 'lg:ml-0' : ''
        )}>
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className={cn(
          'border-t border-border',
          'px-4 py-6',
          'md:px-6 lg:px-8',
          'bg-muted/30'
        )}>
          {footer}
        </footer>
      )}
    </div>
  );
}

// Touch-friendly button component
interface TouchButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  'aria-label': ariaLabel,
  ...props
}: TouchButtonProps) {
  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'touch-manipulation',
    'select-none',
    // Touch feedback
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Focus styles
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    // Size variants
    {
      'px-3 py-2 text-sm min-h-[44px]': size === 'sm',
      'px-4 py-3 text-base min-h-[48px]': size === 'md',
      'px-6 py-4 text-lg min-h-[52px]': size === 'lg',
    },
    // Color variants
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
      'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
    },
    className
  );

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}

// Tab navigation with swipe support
interface SwipeableTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    content: ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function SwipeableTabs({
  tabs,
  activeTab,
  onTabChange,
  className
}: SwipeableTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSwipeLeft = useCallback(() => {
    const nextIndex = Math.min(activeIndex + 1, tabs.length - 1);
    if (nextIndex !== activeIndex) {
      onTabChange(tabs[nextIndex].id);
    }
  }, [activeIndex, tabs, onTabChange]);

  const handleSwipeRight = useCallback(() => {
    const prevIndex = Math.max(activeIndex - 1, 0);
    if (prevIndex !== activeIndex) {
      onTabChange(tabs[prevIndex].id);
    }
  }, [activeIndex, tabs, onTabChange]);

  const handlePrevTab = useCallback(() => {
    handleSwipeRight();
  }, [handleSwipeRight]);

  const handleNextTab = useCallback(() => {
    handleSwipeLeft();
  }, [handleSwipeLeft]);

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Navigation */}
      <div className="relative">
        {/* Mobile navigation arrows */}
        {isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevTab}
              disabled={activeIndex === 0}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                'h-8 w-8 rounded-full',
                'bg-background/80 backdrop-blur-sm',
                'border border-border',
                'shadow-sm'
              )}
              aria-label="Previous tab"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextTab}
              disabled={activeIndex === tabs.length - 1}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                'h-8 w-8 rounded-full',
                'bg-background/80 backdrop-blur-sm',
                'border border-border',
                'shadow-sm'
              )}
              aria-label="Next tab"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Tab List */}
        <div
          className={cn(
            'flex overflow-x-auto scrollbar-hide',
            'border-b border-border',
            'px-8 md:px-0' // Add padding on mobile for arrows
          )}
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2',
                'px-4 py-3 min-w-max',
                'text-sm font-medium',
                'border-b-2 transition-colors',
                'touch-manipulation',
                'whitespace-nowrap',
                // Active state
                tab.id === activeTab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
                // Touch-friendly sizing
                'min-h-[48px]'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content with Swipe Support */}
      <SwipeGesture
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="mt-6"
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={tab.id !== activeTab}
            className={cn(
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'rounded-lg'
            )}
            tabIndex={0}
          >
            {tab.content}
          </div>
        ))}
      </SwipeGesture>

      {/* Mobile tab indicator */}
      {isMobile && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-1">
            {tabs.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 w-6 rounded-full transition-colors',
                  index === activeIndex
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}