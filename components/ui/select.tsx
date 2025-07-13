'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  variant?: 'default' | 'filled' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  leftIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ 
  className, 
  children, 
  variant = 'default',
  size = 'md',
  error = false,
  leftIcon,
  label,
  helperText,
  disabled,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Variantes de style
  const variantStyles = {
    default: "bg-white/90 dark:bg-gray-900/90 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
    filled: "bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700",
    outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
    glass: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/20"
  };

  // Tailles
  const sizeStyles = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-4 text-base"
  };

  const iconSizeStyles = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const containerClasses = cn(
    "relative group transition-all duration-300",
    disabled && "opacity-50 cursor-not-allowed"
  );

  const triggerClasses = cn(
    // Base styles
    "flex w-full items-center justify-between rounded-lg border transition-all duration-300 ease-in-out",
    "text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400",
    "focus:outline-none focus:ring-0",
    
    // Variant styles
    variantStyles[variant],
    
    // Size styles
    sizeStyles[size],
    
    // Icon padding
    leftIcon && "pl-10",
    
    // States
    !disabled && "hover:shadow-md dark:hover:shadow-gray-900/50",
    
    // Focus styles
    "focus:border-primary-500 dark:focus:border-primary-400",
    "focus:shadow-lg focus:shadow-primary-500/20 dark:focus:shadow-primary-400/20",
    "focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20",
    
    // Error styles
    error && "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400",
    error && "focus:ring-red-500/20 dark:focus:ring-red-400/20",
    
    // Animation
    "transform hover:scale-[1.02] focus:scale-[1.02]",
    
    // Disabled styles
    disabled && "cursor-not-allowed opacity-50 hover:shadow-none hover:scale-100 focus:scale-100",
    
    // Open state
    isOpen && "border-primary-500 dark:border-primary-400",
    
    className
  );

  const iconClasses = cn(
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200",
    iconSizeStyles[size]
  );

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label className={cn(
          "block text-sm font-medium mb-2 transition-colors duration-200",
          "text-gray-700 dark:text-gray-300",
          error && "text-red-600 dark:text-red-400"
        )}>
          {label}
        </label>
      )}

      {/* Trigger Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={iconClasses}>
            {leftIcon}
          </div>
        )}

        {/* Trigger */}
  <SelectPrimitive.Trigger
    ref={ref}
          className={triggerClasses}
          disabled={disabled}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 dark:text-gray-500 transition-all duration-300",
              isOpen && "rotate-180 text-primary-500 dark:text-primary-400"
            )} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>

        {/* Focus Ring Effect */}
        <div className={cn(
          "absolute inset-0 rounded-lg pointer-events-none transition-all duration-300",
          "ring-2 ring-transparent",
          isOpen && "ring-primary-500/20 dark:ring-primary-400/20",
          error && isOpen && "ring-red-500/20 dark:ring-red-400/20"
        )} />
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className={cn(
          "mt-2 text-xs transition-colors duration-200",
          error 
            ? "text-red-600 dark:text-red-400" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-900 dark:text-gray-100 shadow-2xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        'border-gray-200 dark:border-gray-700',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-2',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      'py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg',
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none',
      'transition-all duration-200 ease-in-out',
      'hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300',
      'focus:bg-primary-50 dark:focus:bg-primary-900/20 focus:text-primary-700 dark:focus:text-primary-300',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'data-[state=checked]:bg-primary-100 dark:data-[state=checked]:bg-primary-900/30',
      'data-[state=checked]:text-primary-800 dark:data-[state=checked]:text-primary-200',
      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText className="flex items-center gap-2">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('mx-2 my-1 h-px bg-gray-200 dark:bg-gray-700', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
