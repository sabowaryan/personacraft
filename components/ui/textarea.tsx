import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'resize'> {
  error?: boolean;
  helperText?: string;
  label?: string;
  variant?: 'default' | 'filled' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error, 
    helperText, 
    label, 
    variant = 'default',
    size = 'md',
    resize = 'vertical',
    autoResize = false,
    disabled,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value.length > 0);
      
      // Auto-resize functionality
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      
      props.onChange?.(e);
    };

    // Auto-resize effect
    React.useEffect(() => {
      if (autoResize && textareaRef.current && props.value) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize, props.value]);

    // Variantes de style
    const variantStyles = {
      default: "bg-white/90 dark:bg-gray-900/90 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
      filled: "bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700",
      outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
      glass: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/20"
    };

    // Tailles
    const sizeStyles = {
      sm: "min-h-[80px] px-3 py-2 text-sm",
      md: "min-h-[100px] px-4 py-3 text-sm",
      lg: "min-h-[120px] px-4 py-3 text-base"
    };

    // Types de redimensionnement
    const resizeStyles = {
      none: "resize-none",
      both: "resize",
      horizontal: "resize-x",
      vertical: "resize-y"
    };

    const containerClasses = cn(
      "relative group transition-all duration-300",
      disabled && "opacity-50 cursor-not-allowed"
    );

    const textareaClasses = cn(
      // Base styles
      "w-full rounded-lg border transition-all duration-300 ease-in-out",
      "text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400",
      "focus:outline-none focus:ring-0",
      
      // Variant styles
      variantStyles[variant],
      
      // Size styles
      sizeStyles[size],
      
      // Resize styles
      resizeStyles[resize],
      
      // Auto-resize override
      autoResize && "overflow-hidden resize-none",
      
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
      "transform hover:scale-[1.01] focus:scale-[1.01]",
      
      // Disabled styles
      disabled && "cursor-not-allowed opacity-50 hover:shadow-none hover:scale-100 focus:scale-100",
      
      className
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

        {/* Textarea Container */}
        <div className="relative">
          {/* Textarea */}
          <textarea
            className={textareaClasses}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            ref={textareaRef}
        {...props}
      />

          {/* Focus Ring Effect */}
          <div className={cn(
            "absolute inset-0 rounded-lg pointer-events-none transition-all duration-300",
            "ring-2 ring-transparent",
            isFocused && "ring-primary-500/20 dark:ring-primary-400/20",
            error && isFocused && "ring-red-500/20 dark:ring-red-400/20"
          )} />

          {/* Character Count (if maxLength is provided) */}
          {props.maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm">
              {props.value?.toString().length || 0}/{props.maxLength}
            </div>
          )}
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

Textarea.displayName = 'Textarea';

export { Textarea };
