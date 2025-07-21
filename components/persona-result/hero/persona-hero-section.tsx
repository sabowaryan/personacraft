'use client';

import * as React from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { cn } from '@/lib/utils';
import { PersonaAvatar } from './persona-avatar';
import { PersonaQuickActions } from './persona-quick-actions';
import { AnimatedCard, AnimatedCardContent } from '../ui/animated-card';
import { Badge } from '@/components/ui/badge';

interface PersonaHeroSectionProps {
  persona: Persona | EnhancedPersona;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  onExport?: () => void;
  onShare?: () => void;
  onBack?: () => void;
}

export function PersonaHeroSection({
  persona,
  showActions = true,
  compact = false,
  className,
  onExport,
  onShare,
  onBack,
}: PersonaHeroSectionProps) {
  return (
    <section className={cn(
      'relative w-full persona-animate-in',
      compact ? 'py-6' : 'py-8 md:py-12',
      className
    )}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-persona-primary/5 via-transparent to-persona-secondary/5 rounded-2xl" />
      
      <div className="relative z-10">
        <AnimatedCard 
          variant="glass" 
          size={compact ? "md" : "lg"}
          animation="glow"
          className="backdrop-blur-md border-white/20 dark:border-gray-700/30"
        >
          <AnimatedCardContent>
            <div className={cn(
              'flex gap-6 items-center',
              compact ? 'flex-row' : 'flex-col md:flex-row'
            )}>
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <PersonaAvatar
                  persona={persona}
                  size={compact ? 'md' : 'lg'}
                  showStatus
                  animated
                />
              </div>
              
              {/* Main Info Section */}
              <div className={cn(
                'flex-1 min-w-0',
                compact ? 'text-left' : 'text-center md:text-left'
              )}>
                {/* Name and Basic Info */}
                <div className="mb-4">
                  <h1 className={cn(
                    'font-bold tracking-tight text-gray-900 dark:text-white',
                    compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl lg:text-4xl'
                  )}>
                    {persona.name}
                  </h1>
                  <p className={cn(
                    'text-gray-600 dark:text-gray-300 mt-1',
                    compact ? 'text-sm' : 'text-base md:text-lg'
                  )}>
                    {persona.age} ans • {persona.location}
                  </p>
                </div>
                
                {/* Values and Tags */}
                <div className={cn(
                  'flex flex-wrap gap-2 mb-4',
                  compact ? 'justify-start' : 'justify-center md:justify-start'
                )}>
                  {persona.values.slice(0, compact ? 2 : 3).map((value, index) => (
                    <Badge 
                      key={index}
                      variant="secondary"
                      className="bg-persona-primary/10 text-persona-primary hover:bg-persona-primary/20 transition-colors duration-200"
                    >
                      {value}
                    </Badge>
                  ))}
                  {persona.values.length > (compact ? 2 : 3) && (
                    <Badge variant="outline" className="text-xs">
                      +{persona.values.length - (compact ? 2 : 3)} autres
                    </Badge>
                  )}
                </div>
                
                {/* Quote Section */}
                {persona.quote && !compact && (
                  <div className="relative">
                    <AnimatedCard 
                      variant="outline" 
                      size="sm"
                      animation="none"
                      className="bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 border-persona-primary/20"
                    >
                      <AnimatedCardContent>
                        <blockquote className="relative">
                          <div className="absolute -top-2 -left-2 text-4xl text-persona-primary/30 font-serif leading-none">
                            "
                          </div>
                          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 italic pl-4">
                            {persona.quote}
                          </p>
                          <div className="absolute -bottom-2 -right-2 text-4xl text-persona-primary/30 font-serif leading-none rotate-180">
                            "
                          </div>
                        </blockquote>
                      </AnimatedCardContent>
                    </AnimatedCard>
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              {showActions && (
                <div className={cn(
                  'flex-shrink-0',
                  compact ? 'ml-auto' : 'w-full md:w-auto'
                )}>
                  <PersonaQuickActions
                    persona={persona}
                    onExport={onExport}
                    onShare={onShare}
                    onBack={onBack}
                    compact={compact}
                  />
                </div>
              )}
            </div>
            
            {/* Floating Info Cards - Only in non-compact mode */}
            {!compact && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <AnimatedCard 
                  variant="glass" 
                  size="sm"
                  animation="hover"
                  className="text-center"
                >
                  <AnimatedCardContent>
                    <div className="text-2xl font-bold text-persona-primary">
                      {Object.values(persona.interests).flat().length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Intérêts identifiés
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
                
                <AnimatedCard 
                  variant="glass" 
                  size="sm"
                  animation="hover"
                  className="text-center"
                >
                  <AnimatedCardContent>
                    <div className="text-2xl font-bold text-persona-secondary">
                      {persona.communication.preferredChannels.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Canaux préférés
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
                
                <AnimatedCard 
                  variant="glass" 
                  size="sm"
                  animation="hover"
                  className="text-center"
                >
                  <AnimatedCardContent>
                    <div className="text-2xl font-bold text-persona-accent">
                      {persona.marketing.painPoints.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Points de douleur
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </div>
            )}
          </AnimatedCardContent>
        </AnimatedCard>
      </div>
    </section>
  );
}