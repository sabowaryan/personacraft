'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Menu, 
  X, 
  ArrowLeft, 
  Settings, 
  Download, 
  Share2,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { PersonaBreadcrumbs } from './persona-breadcrumbs';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';

export interface PersonaResultLayoutProps {
  children: React.ReactNode;
  persona?: {
    id: string;
    name: string;
    avatar?: string;
  };
  viewMode?: 'detailed' | 'compact';
  onViewModeChange?: (mode: 'detailed' | 'compact') => void;
  onBack?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  sidebarContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function PersonaResultLayout({
  children,
  persona,
  viewMode = 'detailed',
  onViewModeChange,
  onBack,
  onExport,
  onShare,
  sidebarContent,
  headerActions,
  className,
}: PersonaResultLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { preferences, updatePreferences } = usePersonaPreferences();

  // Handle scroll detection for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleViewModeToggle = () => {
    const newMode = viewMode === 'detailed' ? 'compact' : 'detailed';
    onViewModeChange?.(newMode);
    updatePreferences({ defaultView: newMode });
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      <header 
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-all duration-300',
          {
            'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60': isScrolled,
            'bg-transparent border-transparent': !isScrolled,
          }
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    {sidebarContent}
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>

            {/* Back button */}
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Breadcrumbs */}
            <PersonaBreadcrumbs persona={persona} />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleViewModeToggle}
              title={viewMode === 'detailed' ? 'Vue compacte' : 'Vue détaillée'}
            >
              {viewMode === 'detailed' ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            {/* Export button */}
            {onExport && (
              <Button variant="ghost" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* Share button */}
            {onShare && (
              <Button variant="ghost" size="icon" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}

            {/* Custom header actions */}
            {headerActions}

            {/* Settings menu */}
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex">
        {/* Desktop sidebar */}
        {sidebarContent && (
          <aside className="hidden md:flex w-80 flex-col border-r bg-muted/30">
            <div className="sticky top-16 h-[calc(100vh-4rem)]">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {sidebarContent}
                </div>
              </ScrollArea>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div 
            className={cn(
              'mx-auto transition-all duration-300',
              {
                'max-w-7xl px-4 py-6': viewMode === 'detailed',
                'max-w-5xl px-3 py-4': viewMode === 'compact',
              }
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Quick navigation component for sidebar
export function PersonaQuickNav({ 
  sections = [],
  activeSection,
  onSectionChange,
}: {
  sections?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
  }>;
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
}) {
  return (
    <nav className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Sections
      </h3>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange?.(section.id)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
            {
              'bg-primary/10 text-primary': activeSection === section.id,
              'text-muted-foreground hover:text-foreground hover:bg-muted': activeSection !== section.id,
            }
          )}
        >
          {section.icon}
          <span className="flex-1 text-left">{section.label}</span>
          {section.badge && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {section.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

// Layout context for child components
const PersonaLayoutContext = React.createContext<{
  viewMode: 'detailed' | 'compact';
  isScrolled: boolean;
}>({
  viewMode: 'detailed',
  isScrolled: false,
});

export const usePersonaLayout = () => {
  const context = React.useContext(PersonaLayoutContext);
  if (!context) {
    throw new Error('usePersonaLayout must be used within PersonaResultLayout');
  }
  return context;
};