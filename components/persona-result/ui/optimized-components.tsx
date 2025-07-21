'use client';

import { memo, useMemo, useCallback, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useOptimizedAnimations, useOptimizedHover } from '@/hooks/use-optimized-animations';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OptimizedCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    variant?: 'default' | 'elevated' | 'glass';
}

/**
 * Optimized card component with memoization and performance optimizations
 */
export const OptimizedCard = memo(forwardRef<HTMLDivElement, OptimizedCardProps>(
    function OptimizedCard({ children, className, hover = true, onClick, variant = 'default' }, ref) {
        const { preferences } = usePersonaPreferences();

        const cardClasses = useMemo(() => {
            const baseClasses = 'persona-result-card';
            const variantClasses = {
                default: '',
                elevated: 'persona-card-elevated',
                glass: 'persona-card-glass',
            };

            return cn(
                baseClasses,
                variantClasses[variant],
                hover && !preferences.reducedMotion && 'persona-hover-lift',
                onClick && 'cursor-pointer persona-click-feedback',
                className
            );
        }, [variant, hover, preferences.reducedMotion, onClick, className]);

        const handleClick = useCallback(() => {
            if (onClick) {
                onClick();
            }
        }, [onClick]);

        return (
            <div
                ref={ref}
                className={cardClasses}
                onClick={handleClick}
                role={onClick ? 'button' : undefined}
                tabIndex={onClick ? 0 : undefined}
            >
                {children}
            </div>
        );
    }
));

interface OptimizedButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

/**
 * Optimized button component with performance enhancements
 */
export const OptimizedButton = memo(function OptimizedButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className,
}: OptimizedButtonProps) {
    const { preferences } = usePersonaPreferences();

    const buttonClasses = useMemo(() => {
        const baseClasses = 'persona-button';
        const variantClasses = {
            primary: 'persona-button-primary',
            secondary: 'persona-button-secondary',
            ghost: 'persona-button-ghost',
        };
        const sizeClasses = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        return cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            !preferences.reducedMotion && 'persona-hover-scale',
            disabled && 'opacity-50 cursor-not-allowed',
            loading && 'cursor-wait',
            className
        );
    }, [variant, size, preferences.reducedMotion, disabled, loading, className]);

    const handleClick = useCallback(() => {
        if (!disabled && !loading && onClick) {
            onClick();
        }
    }, [disabled, loading, onClick]);

    return (
        <button
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled || loading}
            type="button"
        >
            {loading && (
                <span className="persona-spinner mr-2" />
            )}
            {children}
        </button>
    );
});

interface OptimizedBadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    className?: string;
}

/**
 * Optimized badge component with animation controls
 */
export const OptimizedBadge = memo(function OptimizedBadge({
    children,
    variant = 'default',
    size = 'md',
    pulse = false,
    className,
}: OptimizedBadgeProps) {
    const { preferences } = usePersonaPreferences();

    // Map custom variants to supported Badge variants
    const mappedVariant = useMemo(() => {
        const variantMap = {
            'success': 'default' as const,
            'warning': 'secondary' as const,
            'default': 'default' as const,
            'destructive': 'destructive' as const,
            'outline': 'outline' as const,
        };
        return variantMap[variant];
    }, [variant]);

    const badgeClasses = useMemo(() => {
        const sizeClasses = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-0.5 text-sm',
            lg: 'px-3 py-1 text-sm',
        };

        // Add color classes for custom variants
        const colorClasses = {
            success: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300',
            warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
        };

        return cn(
            sizeClasses[size],
            pulse && !preferences.reducedMotion && 'animate-pulse',
            variant === 'success' && colorClasses.success,
            variant === 'warning' && colorClasses.warning,
            className
        );
    }, [size, pulse, preferences.reducedMotion, variant, className]);

    return (
        <Badge variant={mappedVariant} className={badgeClasses}>
            {children}
        </Badge>
    );
});

interface OptimizedMetricCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'stable';
    color?: 'primary' | 'success' | 'warning' | 'destructive';
    loading?: boolean;
}

/**
 * Optimized metric card with memoized calculations
 */
export const OptimizedMetricCard = memo(function OptimizedMetricCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = 'primary',
    loading = false,
}: OptimizedMetricCardProps) {
    const { preferences } = usePersonaPreferences();

    const cardContent = useMemo(() => {
        if (loading) {
            return (
                <div className="space-y-2">
                    <div className="persona-skeleton h-4 w-3/4" />
                    <div className="persona-skeleton h-8 w-1/2" />
                    <div className="persona-skeleton h-3 w-full" />
                </div>
            );
        }

        const colorClasses = {
            primary: 'text-primary',
            success: 'text-green-600',
            warning: 'text-yellow-600',
            destructive: 'text-red-600',
        };

        const trendIcons = {
            up: '↗',
            down: '↘',
            stable: '→',
        };

        return (
            <>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    {Icon && <Icon className={cn('h-4 w-4', colorClasses[color])} />}
                </div>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">{value}</span>
                    {trend && (
                        <span className={cn('text-sm', colorClasses[color])}>
                            {trendIcons[trend]}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </>
        );
    }, [title, value, description, Icon, trend, color, loading]);

    return (
        <OptimizedCard className="p-4">
            {cardContent}
        </OptimizedCard>
    );
});

interface OptimizedListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor: (item: T, index: number) => string | number;
    className?: string;
    stagger?: boolean;
    virtualScroll?: boolean;
    itemHeight?: number;
    containerHeight?: number;
}

/**
 * Optimized list component with virtual scrolling support
 */
export function OptimizedList<T>({
    items,
    renderItem,
    keyExtractor,
    className,
    stagger = false,
    virtualScroll = false,
    itemHeight = 60,
    containerHeight = 400,
}: OptimizedListProps<T>) {
    const { preferences } = usePersonaPreferences();

    // Memoize rendered items
    const renderedItems = useMemo(() => {
        return items.map((item, index) => {
            const key = keyExtractor(item, index);
            const animationDelay = stagger && !preferences.reducedMotion
                ? { animationDelay: `${index * 50}ms` }
                : {};

            return (
                <div
                    key={key}
                    className={stagger ? 'persona-animate-in' : undefined}
                    style={animationDelay}
                >
                    {renderItem(item, index)}
                </div>
            );
        });
    }, [items, renderItem, keyExtractor, stagger, preferences.reducedMotion]);

    if (virtualScroll && items.length > 20) {
        // Virtual scrolling implementation would go here
        // For now, return regular list with warning
        console.warn('Virtual scrolling not implemented in this example');
    }

    return (
        <div className={cn('space-y-2', className)}>
            {renderedItems}
        </div>
    );
}

interface OptimizedGridProps {
    children: React.ReactNode;
    columns?: number;
    gap?: number;
    responsive?: boolean;
    className?: string;
}

/**
 * Optimized grid component with responsive support
 */
export const OptimizedGrid = memo(function OptimizedGrid({
    children,
    columns = 3,
    gap = 4,
    responsive = true,
    className,
}: OptimizedGridProps) {
    const gridClasses = useMemo(() => {
        const baseClasses = 'grid';
        const gapClass = `gap-${gap}`;

        if (responsive) {
            return cn(
                baseClasses,
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                gapClass,
                className
            );
        }

        return cn(
            baseClasses,
            `grid-cols-${columns}`,
            gapClass,
            className
        );
    }, [columns, gap, responsive, className]);

    return (
        <div className={gridClasses}>
            {children}
        </div>
    );
});

/**
 * Higher-order component for memoizing expensive components
 */
export function withOptimization<P extends object>(
    Component: React.ComponentType<P>,
    areEqual?: (prevProps: P, nextProps: P) => boolean
) {
    return memo(Component, areEqual);
}

/**
 * Custom comparison function for persona objects
 */
export const personaPropsAreEqual = (prevProps: any, nextProps: any) => {
    // Compare persona ID and generation timestamp
    return (
        prevProps.persona?.id === nextProps.persona?.id &&
        prevProps.persona?.generatedAt === nextProps.persona?.generatedAt
    );
};