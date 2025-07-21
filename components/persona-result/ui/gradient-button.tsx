'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gradientButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group will-change-transform',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-persona-primary to-persona-secondary text-white shadow-lg hover:shadow-xl hover:shadow-persona-primary/25',
        secondary: 'bg-gradient-to-r from-persona-secondary to-persona-accent text-white shadow-lg hover:shadow-xl hover:shadow-persona-secondary/25',
        accent: 'bg-gradient-to-r from-persona-accent to-persona-primary text-white shadow-lg hover:shadow-xl hover:shadow-persona-accent/25',
        success: 'bg-gradient-to-r from-quality-excellent to-success-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25',
        warning: 'bg-gradient-to-r from-quality-good to-warning-600 text-white shadow-lg hover:shadow-xl hover:shadow-yellow-500/25',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25',
        outline: 'border-2 border-transparent bg-gradient-to-r from-persona-primary to-persona-secondary bg-clip-border text-persona-primary hover:text-white relative before:absolute before:inset-0 before:bg-white before:dark:bg-gray-900 before:rounded-lg before:m-[2px] before:transition-opacity before:duration-300 hover:before:opacity-0',
        ghost: 'text-persona-primary hover:bg-gradient-to-r hover:from-persona-primary/10 hover:to-persona-secondary/10 hover:text-persona-primary-700',
        glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 text-white hover:bg-white/20 hover:dark:bg-black/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        hover: 'hover:-translate-y-0.5 hover:scale-105',
        pulse: 'hover:animate-pulse',
        bounce: 'hover:animate-bounce',
        glow: 'hover:shadow-2xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      animation: 'hover',
    },
  }
);

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation, 
    asChild = false, 
    loading = false, 
    icon, 
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    
    const Comp = asChild ? Slot : 'button';
    
    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsPressed(false);

    return (
      <Comp
        className={cn(
          gradientButtonVariants({ variant, size, animation }),
          {
            'transform scale-95': isPressed && !disabled && !loading,
            'cursor-not-allowed': disabled || loading,
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Shimmer effect for hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        {/* Content */}
        <span className={cn('relative z-10 flex items-center gap-2', {
          'opacity-0': loading,
        })}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </span>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 opacity-0 group-active:opacity-20 transition-opacity duration-150 bg-white dark:bg-black rounded-lg" />
        </div>
      </Comp>
    );
  }
);

GradientButton.displayName = 'GradientButton';

// Utility component for button groups
const GradientButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
  }
>(({ className, orientation = 'horizontal', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex',
      {
        'flex-row space-x-1': orientation === 'horizontal',
        'flex-col space-y-1': orientation === 'vertical',
      },
      className
    )}
    {...props}
  />
));
GradientButtonGroup.displayName = 'GradientButtonGroup';

export { GradientButton, GradientButtonGroup, gradientButtonVariants };