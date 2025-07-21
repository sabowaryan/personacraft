'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { KeyboardShortcut, SkipLinkConfig } from '@/hooks/use-keyboard-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Keyboard,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Enter,
  Escape,
  Tab,
  Command,
  Download,
  Share2,
  RotateCcw
} from 'lucide-react';

interface PersonaKeyboardNavigationProps {
  onExport?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  onTabChange?: (tab: string) => void;
  currentTab?: string;
  children: React.ReactNode;
}

export function PersonaKeyboardNavigation({
  onExport,
  onShare,
  onBack,
  onTabChange,
  currentTab = 'profile',
  children
}: PersonaKeyboardNavigationProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'e',
      ctrlKey: true,
      action: () => onExport?.(),
      description: 'Export persona',
      disabled: !onExport
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => onShare?.(),
      description: 'Share persona',
      disabled: !onShare
    },
    {
      key: 'Escape',
      action: () => onBack?.(),
      description: 'Go back',
      disabled: !onBack
    },
    {
      key: '1',
      altKey: true,
      action: () => onTabChange?.('profile'),
      description: 'Switch to Profile tab'
    },
    {
      key: '2',
      altKey: true,
      action: () => onTabChange?.('interests'),
      description: 'Switch to Interests tab'
    },
    {
      key: '3',
      altKey: true,
      action: () => onTabChange?.('communication'),
      description: 'Switch to Communication tab'
    },
    {
      key: '4',
      altKey: true,
      action: () => onTabChange?.('marketing'),
      description: 'Switch to Marketing tab'
    },
    {
      key: '?',
      shiftKey: true,
      action: () => setShowShortcuts(prev => !prev),
      description: 'Show/hide keyboard shortcuts'
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => setShowShortcuts(prev => !prev),
      description: 'Show/hide help'
    }
  ];

  // Define skip links
  const skipLinks: SkipLinkConfig[] = [
    {
      targetId: 'persona-header',
      label: 'Skip to persona header'
    },
    {
      targetId: 'persona-hero',
      label: 'Skip to persona overview'
    },
    {
      targetId: 'persona-metrics',
      label: 'Skip to quality metrics'
    },
    {
      targetId: 'persona-tabs',
      label: 'Skip to persona details'
    },
    {
      targetId: 'persona-actions',
      label: 'Skip to actions'
    }
  ];

  const {
    containerRef,
    announceChange,
    announceStatus,
    focusFirst,
    focusNext,
    focusPrevious,
    focusByGroup,
    reducedMotion
  } = useAccessibility(shortcuts, skipLinks, {
    enableKeyboardNavigation: true,
    enableScreenReaderSupport: true,
    enableFocusManagement: true,
    enableSkipLinks: true,
    trapFocus: false,
    restoreFocus: true,
    announceChanges: true
  });

  // Announce tab changes
  useEffect(() => {
    if (currentTab) {
      const tabLabels: Record<string, string> = {
        profile: 'Profile',
        interests: 'Interests and Culture',
        communication: 'Communication Preferences',
        marketing: 'Marketing Insights'
      };

      announceChange(`Switched to ${tabLabels[currentTab]} tab`, 'polite');
    }
  }, [currentTab, announceChange]);

  // Handle keyboard shortcuts help
  const handleShortcutsToggle = useCallback(() => {
    setShowShortcuts(prev => {
      const newState = !prev;
      announceChange(
        newState ? 'Keyboard shortcuts panel opened' : 'Keyboard shortcuts panel closed',
        'polite'
      );
      return newState;
    });
  }, [announceChange]);

  // Close shortcuts on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
        announceChange('Keyboard shortcuts panel closed', 'polite');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showShortcuts, announceChange]);

  return (
    <div ref={containerRef} className="relative">
      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite" id="keyboard-instructions">
        Use Tab to navigate between elements. Press Shift+? to view keyboard shortcuts.
        Use Alt+1-4 to switch between tabs. Press Ctrl+E to export, Ctrl+S to share.
      </div>

      {/* Main content */}
      <div className="focus-within:outline-none">
        {children}
      </div>

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          aria-describedby="shortcuts-description"
        >
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle id="shortcuts-title" className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Keyboard Shortcuts
                  </CardTitle>
                  <CardDescription id="shortcuts-description">
                    Use these keyboard shortcuts to navigate the persona interface efficiently
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShortcutsToggle}
                  aria-label="Close keyboard shortcuts"
                >
                  <Escape className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Navigation shortcuts */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Navigation
                </h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={[{ key: 'Tab' }]}
                    description="Navigate between interactive elements"
                    icon={<Tab className="h-4 w-4" />}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Shift', modifier: true }, { key: 'Tab' }]}
                    description="Navigate backwards"
                    icon={<Tab className="h-4 w-4 rotate-180" />}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Enter' }]}
                    description="Activate focused element"
                    icon={<Enter className="h-4 w-4" />}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Escape' }]}
                    description="Go back or close dialogs"
                    icon={<Escape className="h-4 w-4" />}
                  />
                </div>
              </div>

              {/* Tab navigation */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Tab Navigation
                </h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={[{ key: 'Alt', modifier: true }, { key: '1' }]}
                    description="Switch to Profile tab"
                    icon={<span className="text-xs font-mono">1</span>}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Alt', modifier: true }, { key: '2' }]}
                    description="Switch to Interests tab"
                    icon={<span className="text-xs font-mono">2</span>}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Alt', modifier: true }, { key: '3' }]}
                    description="Switch to Communication tab"
                    icon={<span className="text-xs font-mono">3</span>}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Alt', modifier: true }, { key: '4' }]}
                    description="Switch to Marketing tab"
                    icon={<span className="text-xs font-mono">4</span>}
                  />
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Actions
                </h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={[{ key: 'Ctrl', modifier: true }, { key: 'E' }]}
                    description="Export persona"
                    icon={<Download className="h-4 w-4" />}
                    disabled={!onExport}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Ctrl', modifier: true }, { key: 'S' }]}
                    description="Share persona"
                    icon={<Share2 className="h-4 w-4" />}
                    disabled={!onShare}
                  />
                </div>
              </div>

              {/* Help */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Help
                </h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={[{ key: 'Shift', modifier: true }, { key: '?' }]}
                    description="Show/hide this help panel"
                    icon={<span className="text-xs font-mono">?</span>}
                  />
                  <ShortcutItem
                    keys={[{ key: 'Ctrl', modifier: true }, { key: 'H' }]}
                    description="Show/hide help"
                    icon={<span className="text-xs font-mono">H</span>}
                  />
                </div>
              </div>

              {/* Arrow key navigation info */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Arrow Key Navigation
                </h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={[{ key: '←' }, { key: '→' }]}
                    description="Navigate between tabs"
                    icon={<div className="flex gap-1"><ArrowLeft className="h-4 w-4" /><ArrowRight className="h-4 w-4" /></div>}
                  />
                  <ShortcutItem
                    keys={[{ key: '↑' }, { key: '↓' }]}
                    description="Navigate within tab content"
                    icon={<div className="flex gap-1"><ArrowUp className="h-4 w-4" /><ArrowDown className="h-4 w-4" /></div>}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating help button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 shadow-lg"
        onClick={handleShortcutsToggle}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Shift+?)"
      >
        <Keyboard className="h-4 w-4" />
        <span className="sr-only">Show keyboard shortcuts</span>
      </Button>
    </div>
  );
}

interface ShortcutItemProps {
  keys: Array<{ key: string; modifier?: boolean }>;
  description: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function ShortcutItem({ keys, description, icon, disabled = false }: ShortcutItemProps) {
  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <span className={`text-sm ${disabled ? 'text-muted-foreground' : ''}`}>
          {description}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {keys.map((keyInfo, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <span className="text-xs text-muted-foreground">+</span>}
            <Badge
              variant="outline"
              className={`text-xs font-mono px-2 py-1 ${keyInfo.modifier ? 'bg-muted' : 'bg-background'
                }`}
            >
              {keyInfo.key}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}