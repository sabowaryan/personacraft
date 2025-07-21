'use client';

import * as React from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { Star, Sparkles, User } from 'lucide-react';

const avatarVariants = cva(
  'relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-500 ease-out will-change-transform',
  {
    variants: {
      size: {
        sm: 'h-16 w-16',
        md: 'h-24 w-24',
        lg: 'h-32 w-32',
        xl: 'h-40 w-40',
      },
      variant: {
        default: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
        primary: 'bg-gradient-to-br from-persona-primary/20 to-persona-secondary/20',
        gradient: 'bg-gradient-to-br from-persona-primary to-persona-secondary',
        glass: 'bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-gray-600/30',
      },
      border: {
        none: '',
        simple: 'border-4 border-white dark:border-gray-800 shadow-lg',
        gradient: 'p-1 bg-gradient-to-br from-persona-primary via-persona-secondary to-persona-accent',
        animated: 'p-1 bg-gradient-to-br from-persona-primary via-persona-secondary to-persona-accent animate-pulse',
        glow: 'shadow-xl shadow-persona-primary/30',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      border: 'simple',
    },
  }
);

interface PersonaAvatarProps extends VariantProps<typeof avatarVariants> {
  persona: Persona | EnhancedPersona;
  showStatus?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function PersonaAvatar({
  persona,
  size = 'md',
  variant = 'default',
  border = 'gradient',
  showStatus = false,
  animated = false,
  className,
  onClick,
}: PersonaAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Enhanced persona quality score calculation
  const getQualityScore = () => {
    if ('validation_metrics' in persona) {
      const metrics = persona.validation_metrics;
      return Math.round((metrics.completeness_score + metrics.consistency_score + metrics.realism_score) / 3);
    }
    
    // Fallback calculation for regular personas
    return Math.round(
      (persona.values.length / 5 * 0.3 + 
       Object.keys(persona.interests).length / 10 * 0.3 + 
       persona.communication.preferredChannels.length / 5 * 0.2 + 
       persona.marketing.painPoints.length / 5 * 0.2) * 100
    );
  };

  const qualityScore = getQualityScore();
  const initials = persona.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const getStatusColor = () => {
    if (qualityScore >= 90) return 'bg-green-500';
    if (qualityScore >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getStatusIcon = () => {
    if (qualityScore >= 90) return <Star className="h-3 w-3" />;
    if (qualityScore >= 70) return <Sparkles className="h-3 w-3" />;
    return <User className="h-3 w-3" />;
  };

  return (
    <div 
      className={cn(
        'relative group cursor-pointer',
        animated && 'hover:scale-105 transition-transform duration-300',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Avatar Container */}
      <div className={cn(avatarVariants({ size, variant, border }))}>
        {/* Gradient Border Effect */}
        {border === 'gradient' || border === 'animated' && (
          <div className={cn(
            'absolute inset-0 rounded-full',
            border === 'animated' && 'animate-spin-slow'
          )} />
        )}
        
        {/* Inner Avatar */}
        <div className={cn(
          'relative rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center',
          size === 'sm' && 'h-14 w-14',
          size === 'md' && 'h-22 w-22',
          size === 'lg' && 'h-30 w-30',
          size === 'xl' && 'h-38 w-38',
          (border === 'gradient' || border === 'animated') && 'm-0.5'
        )}>
          {persona.avatar && !imageError ? (
            <img
              src={persona.avatar}
              alt={`Avatar de ${persona.name}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={cn(
              'flex items-center justify-center text-persona-primary font-bold bg-gradient-to-br from-persona-primary/10 to-persona-secondary/10',
              size === 'sm' && 'text-lg',
              size === 'md' && 'text-2xl',
              size === 'lg' && 'text-4xl',
              size === 'xl' && 'text-5xl'
            )}>
              {initials}
            </div>
          )}
          
          {/* Hover Overlay */}
          {isHovered && animated && (
            <div className="absolute inset-0 bg-persona-primary/10 flex items-center justify-center rounded-full transition-opacity duration-200">
              <Sparkles className={cn(
                'text-persona-primary animate-pulse',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-6 w-6',
                size === 'lg' && 'h-8 w-8',
                size === 'xl' && 'h-10 w-10'
              )} />
            </div>
          )}
        </div>
        
        {/* Glow Effect */}
        {border === 'glow' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-persona-primary to-persona-secondary opacity-20 blur-xl animate-pulse" />
        )}
      </div>
      
      {/* Status Badge */}
      {showStatus && (
        <div className={cn(
          'absolute -bottom-1 -right-1 z-10',
          size === 'sm' && '-bottom-0.5 -right-0.5',
          size === 'xl' && '-bottom-2 -right-2'
        )}>
          <Badge 
            variant="secondary"
            className={cn(
              'flex items-center gap-1 text-white border-2 border-white dark:border-gray-800 shadow-lg',
              getStatusColor(),
              size === 'sm' && 'text-xs px-1.5 py-0.5',
              size === 'xl' && 'text-sm px-2 py-1'
            )}
          >
            {getStatusIcon()}
            <span className="font-medium">{qualityScore}%</span>
          </Badge>
        </div>
      )}
      
      {/* Floating Particles Effect */}
      {animated && isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute w-1 h-1 bg-persona-primary rounded-full animate-ping opacity-75',
                `animation-delay-${i * 100}`
              )}
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${15 + (i * 12)}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}