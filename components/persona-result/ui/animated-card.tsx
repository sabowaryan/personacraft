'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const animatedCardVariants = cva(
  'relative overflow-hidden rounded-xl border transition-all duration-300 ease-out will-change-transform',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-persona-md hover:shadow-persona-lg',
        elevated: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-persona-lg hover:shadow-persona-xl',
        glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/50 shadow-persona-glass',
        gradient: 'bg-gradient-to-br from-persona-primary to-persona-secondary text-white shadow-persona-lg border-0',
        outline: 'bg-transparent border-2 border-persona-primary/20 hover:border-persona-primary/40 hover:bg-persona-primary/5',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      animation: {
        none: '',
        hover: 'hover:-translate-y-1 hover:scale-[1.02]',
        lift: 'hover:-translate-y-2',
        scale: 'hover:scale-105',
        glow: 'hover:shadow-persona-xl hover:shadow-persona-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animation: 'hover',
    },
  }
);

export interface AnimatedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedCardVariants> {
  asChild?: boolean;
  interactive?: boolean;
  loading?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant, size, animation, asChild = false, interactive = true, loading = false, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);

    const handleMouseEnter = () => {
      if (interactive && !loading) {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsPressed(false);
    };

    const handleMouseDown = () => {
      if (interactive && !loading) {
        setIsPressed(true);
      }
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const Comp = asChild ? React.Fragment : 'div';
    const cardProps = asChild ? {} : {
      ref,
      className: cn(
        animatedCardVariants({ variant, size, animation }),
        {
          'cursor-pointer': interactive && !loading,
          'opacity-60 pointer-events-none': loading,
          'transform-gpu': true,
        },
        className
      ),
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      ...props,
    };

    return (
      <Comp {...cardProps}>
        {/* Shimmer effect for loading state */}
        {loading && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        {/* Hover glow effect */}
        {isHovered && animation === 'glow' && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-persona-primary/10 to-persona-secondary/10 opacity-0 animate-in fade-in duration-300" />
        )}
        
        {/* Press effect */}
        {isPressed && (
          <div className="absolute inset-0 rounded-xl bg-black/5 dark:bg-white/5" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Ripple effect container */}
        {interactive && (
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        )}
      </Comp>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Sub-components for structured content
const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
AnimatedCardHeader.displayName = 'AnimatedCardHeader';

const AnimatedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AnimatedCardTitle.displayName = 'AnimatedCardTitle';

const AnimatedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AnimatedCardDescription.displayName = 'AnimatedCardDescription';

const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
AnimatedCardContent.displayName = 'AnimatedCardContent';

const AnimatedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
AnimatedCardFooter.displayName = 'AnimatedCardFooter';

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
  animatedCardVariants,
};