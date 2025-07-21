'use client';

import React, { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
  showProgress?: boolean;
  estimatedTime?: number;
  stage?: string;
}

// Main persona result loading skeleton
export const PersonaResultSkeleton = memo(function PersonaResultSkeleton({
  className,
  showProgress = false,
  estimatedTime = 3000,
  stage = 'Chargement du persona...',
}: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(stage);

  useEffect(() => {
    if (!showProgress) return;

    const stages = [
      'Chargement des données...',
      'Validation des informations...',
      'Calcul des métriques...',
      'Préparation de l\'affichage...',
    ];

    let currentStageIndex = 0;
    const stageInterval = estimatedTime / stages.length;
    const progressInterval = 50;
    const progressStep = 100 / (estimatedTime / progressInterval);

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + progressStep, 100);
        
        // Update stage based on progress
        const stageIndex = Math.floor((newProgress / 100) * stages.length);
        if (stageIndex !== currentStageIndex && stageIndex < stages.length) {
          currentStageIndex = stageIndex;
          setCurrentStage(stages[stageIndex]);
        }
        
        return newProgress;
      });
    }, progressInterval);

    return () => clearInterval(timer);
  }, [showProgress, estimatedTime]);

  return (
    <div className={cn('flex flex-col w-full max-w-7xl mx-auto space-y-6', className)}>
      {/* Progress indicator */}
      {showProgress && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentStage}</span>
                <Badge variant="outline">{Math.round(progress)}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header skeleton */}
      <PersonaHeaderSkeleton />
      
      {/* Hero section skeleton */}
      <PersonaHeroSkeleton />
      
      {/* Stats grid skeleton */}
      <PersonaStatsGridSkeleton />
      
      {/* Tabs skeleton */}
      <PersonaTabsSkeleton />
    </div>
  );
});

// Header section skeleton
export const PersonaHeaderSkeleton = memo(function PersonaHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
});

// Hero section skeleton
export const PersonaHeroSkeleton = memo(function PersonaHeroSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4">
      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar skeleton */}
            <div className="relative">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="absolute -bottom-2 -right-2">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            
            {/* Info skeleton */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Score card skeleton */}
      <div className="space-y-4">
        <PersonaScoreCardSkeleton />
      </div>
    </section>
  );
});

// Score card skeleton
export const PersonaScoreCardSkeleton = memo(function PersonaScoreCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
});

// Stats grid skeleton
export const PersonaStatsGridSkeleton = memo(function PersonaStatsGridSkeleton() {
  return (
    <section className="mb-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});

// Tabs skeleton
export const PersonaTabsSkeleton = memo(function PersonaTabsSkeleton() {
  return (
    <section className="px-4">
      <div className="space-y-8">
        {/* Tab navigation skeleton */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-md" />
          ))}
        </div>
        
        {/* Tab content skeleton */}
        <PersonaTabContentSkeleton />
      </div>
    </section>
  );
});

// Tab content skeleton
export const PersonaTabContentSkeleton = memo(function PersonaTabContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-28" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Progressive loading component
interface ProgressiveLoadingProps {
  children: React.ReactNode;
  isLoading: boolean;
  skeleton: React.ComponentType;
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
}

export const ProgressiveLoading = memo(function ProgressiveLoading({
  children,
  isLoading,
  skeleton: SkeletonComponent,
  priority = 'medium',
  delay = 0,
}: ProgressiveLoadingProps) {
  const [showContent, setShowContent] = useState(!isLoading);
  const [showSkeleton, setShowSkeleton] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
      setShowSkeleton(true);
    } else {
      // Delay based on priority
      const loadDelay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 200;
      const totalDelay = delay + loadDelay;
      
      if (totalDelay > 0) {
        const timer = setTimeout(() => {
          setShowSkeleton(false);
          setShowContent(true);
        }, totalDelay);
        
        return () => clearTimeout(timer);
      } else {
        setShowSkeleton(false);
        setShowContent(true);
      }
    }
  }, [isLoading, priority, delay]);

  if (showSkeleton) {
    return <SkeletonComponent />;
  }

  if (showContent) {
    return <>{children}</>;
  }

  return null;
});

// Loading indicator with estimated time
interface LoadingIndicatorProps {
  message?: string;
  estimatedTime?: number;
  showSpinner?: boolean;
  className?: string;
}

export const LoadingIndicator = memo(function LoadingIndicator({
  message = 'Chargement en cours...',
  estimatedTime,
  showSpinner = true,
  className,
}: LoadingIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);

  useEffect(() => {
    if (!estimatedTime) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (!prev || prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [estimatedTime]);

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="text-center space-y-4">
        {showSpinner && (
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium">{message}</p>
          {timeRemaining && timeRemaining > 0 && (
            <p className="text-xs text-muted-foreground">
              Temps estimé: {Math.ceil(timeRemaining / 1000)}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
});