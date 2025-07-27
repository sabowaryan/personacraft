import React from 'react';
import Logo from './Logo';

interface LogoWithTextProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white' | 'dark';
  text?: string;
  showText?: boolean;
}

const LogoWithText: React.FC<LogoWithTextProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'primary',
  text = 'Mon Site',
  showText = true
}) => {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const colorClasses = {
    primary: 'text-persona-violet',
    secondary: 'text-secondary',
    white: 'text-white',
    dark: 'text-text'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} variant={variant} />
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${colorClasses[variant]} transition-colors duration-200`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LogoWithText;