import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    helperText, 
    label, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    size = 'md',
    disabled,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

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

    const inputClasses = cn(
      // Base styles
      "w-full rounded-lg border transition-all duration-300 ease-in-out",
      "text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400",
      "focus:outline-none focus:ring-0",
      
      // Variant styles
      variantStyles[variant],
      
      // Size styles
      sizeStyles[size],
      
      // Icon padding
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      
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
      
      className
    );

    const iconClasses = cn(
      "absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200",
      isFocused && "text-primary-500 dark:text-primary-400",
      error && "text-red-500 dark:text-red-400",
      iconSizeStyles[size]
    );

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label 
        className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              "text-gray-700 dark:text-gray-300",
              isFocused && "text-primary-600 dark:text-primary-400",
              error && "text-red-600 dark:text-red-400"
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={cn(iconClasses, "left-3")}>
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            type={type}
            className={inputClasses}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
        ref={ref}
        {...props}
      />

          {/* Right Icon */}
          {rightIcon && (
            <div className={cn(iconClasses, "right-3")}>
              {rightIcon}
            </div>
          )}

          {/* Focus Ring Effect */}
          <div className={cn(
            "absolute inset-0 rounded-lg pointer-events-none transition-all duration-300",
            "ring-2 ring-transparent",
            isFocused && "ring-primary-500/20 dark:ring-primary-400/20",
            error && isFocused && "ring-red-500/20 dark:ring-red-400/20"
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
  }
);

Input.displayName = 'Input';

export { Input };
