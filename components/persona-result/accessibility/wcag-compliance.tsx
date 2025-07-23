'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Contrast,
  Type,
  Volume2,
  VolumeX,
  Settings,
  Check,
  AlertTriangle
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: 'fail' | 'aa' | 'aaa';
} {
  const ratio = getContrastRatio(foreground, background);
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

  return {
    ratio,
    passesAA,
    passesAAA,
    level: passesAAA ? 'aaa' : passesAA ? 'aa' : 'fail'
  };
}

// WCAG compliance hook
export function useWCAGCompliance() {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [complianceIssues, setComplianceIssues] = useState<string[]>([]);

  // Check for user preferences
  useEffect(() => {
    const checkPreferences = () => {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      setHighContrast(highContrastQuery.matches);
      setReducedMotion(reducedMotionQuery.matches);

      highContrastQuery.addEventListener('change', (e) => setHighContrast(e.matches));
      reducedMotionQuery.addEventListener('change', (e) => setReducedMotion(e.matches));
    };

    checkPreferences();
  }, []);

  // Apply accessibility preferences
  useEffect(() => {
    const root = document.documentElement;

    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);

    // Apply reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [highContrast, fontSize, reducedMotion]);

  // Audit accessibility issues
  const auditAccessibility = useCallback(() => {
    const issues: string[] = [];

    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push(`Image ${index + 1} is missing alt text`);
      }
    });

    // Check for missing form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        document.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        issues.push(`Form field ${index + 1} is missing a label`);
      }
    });

    // Check for missing headings structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push(`Heading level skipped at heading ${index + 1}`);
      }
      previousLevel = level;
    });

    // Check for missing ARIA landmarks
    const main = document.querySelector('main');
    if (!main) {
      issues.push('Missing main landmark');
    }

    // Check for interactive elements without proper roles
    const clickableElements = document.querySelectorAll('[onclick], .cursor-pointer');
    clickableElements.forEach((element, index) => {
      if (!element.getAttribute('role') &&
        !['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
        issues.push(`Interactive element ${index + 1} missing proper role`);
      }
    });

    setComplianceIssues(issues);
    return issues;
  }, []);

  return {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize,
    soundEnabled,
    setSoundEnabled,
    complianceIssues,
    auditAccessibility
  };
}

// Semantic HTML wrapper component
export function SemanticSection({
  as: Component = 'section',
  children,
  ariaLabel,
  ariaLabelledBy,
  role,
  className = '',
  ...props
}: {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  role?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <Component
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      role={role}
      {...props}
    >
      {children}
    </Component>
  );
}

// Accessible image component
export function AccessibleImage({
  src,
  alt,
  decorative = false,
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  decorative?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <img
      src={src}
      alt={decorative ? '' : alt}
      aria-hidden={decorative}
      className={className}
      {...props}
    />
  );
}

// Accessible button component
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  [key: string]: any;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

// Accessible form field component
export function AccessibleFormField({
  id,
  label,
  description,
  error,
  required = false,
  children,
  className = ''
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </label>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement<any>, {
          id,
          'aria-describedby': ariaDescribedBy || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required
        })}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Accessibility settings panel
export function AccessibilitySettings() {
  const {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize,
    soundEnabled,
    setSoundEnabled,
    complianceIssues,
    auditAccessibility
  } = useWCAGCompliance();

  const [showSettings, setShowSettings] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const handleAudit = () => {
    auditAccessibility();
    setShowAudit(true);
  };

  return (
    <>
      {/* Accessibility settings button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-16 right-4 z-40 shadow-lg"
        onClick={() => setShowSettings(!showSettings)}
        aria-label="Open accessibility settings"
        title="Accessibility settings"
      >
        <Settings className="h-4 w-4" />
        <span className="sr-only">Accessibility settings</span>
      </Button>

      {/* Settings panel */}
      {showSettings && (
        <div
          className="fixed bottom-20 right-4 z-50 w-80"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-settings-title"
        >
          <Card>
            <CardHeader>
              <CardTitle id="accessibility-settings-title" className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility Settings
              </CardTitle>
              <CardDescription>
                Customize the interface for your accessibility needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High contrast toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Contrast className="h-4 w-4" />
                  <span className="text-sm">High Contrast</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHighContrast(!highContrast)}
                  aria-pressed={highContrast}
                  aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                >
                  {highContrast ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>

              {/* Font size selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span className="text-sm">Font Size</span>
                </div>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFontSize(size)}
                      aria-pressed={fontSize === size}
                      className="flex-1"
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sound toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm">Sound Effects</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  aria-pressed={soundEnabled}
                  aria-label={`${soundEnabled ? 'Disable' : 'Enable'} sound effects`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>

              {/* Motion preference display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Reduced Motion</span>
                </div>
                <Badge variant={reducedMotion ? 'default' : 'outline'}>
                  {reducedMotion ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              {/* Accessibility audit */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAudit}
                  className="w-full"
                >
                  Run Accessibility Audit
                </Button>
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="w-full"
              >
                Close Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit results */}
      {showAudit && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-results-title"
        >
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle id="audit-results-title" className="flex items-center gap-2">
                {complianceIssues.length === 0 ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                Accessibility Audit Results
              </CardTitle>
              <CardDescription>
                {complianceIssues.length === 0
                  ? 'No accessibility issues found!'
                  : `Found ${complianceIssues.length} potential accessibility issue${complianceIssues.length === 1 ? '' : 's'}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceIssues.length === 0 ? (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Great! This page appears to meet basic accessibility standards.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {complianceIssues.map((issue, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{issue}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setShowAudit(false)}
                className="w-full"
              >
                Close Audit Results
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}