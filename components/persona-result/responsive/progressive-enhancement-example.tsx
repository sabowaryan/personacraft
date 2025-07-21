'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AdaptiveContentLoader,
  InteractionPattern,
  AdvancedResponsiveImage,
  ConnectionSpeedIndicator,
  OrientationLayout,
  ConnectionAware,
} from './progressive-enhancement';
import { useProgressiveEnhancement } from '@/hooks/use-progressive-enhancement';

/**
 * Example component demonstrating all progressive enhancement features
 * This shows how the features work together in a real persona result display
 */
export function ProgressiveEnhancementExample() {
  const { 
    connectionSpeed, 
    isSlowConnection, 
    deviceType, 
    orientation,
    getOptimizedImageProps,
    getInteractionClasses,
    shouldLoadContent,
  } = useProgressiveEnhancement({
    adaptiveLoading: true,
    connectionAwareContent: true,
    touchOptimizations: true,
    orientationAware: true,
    responsiveImages: true,
    adaptiveQuality: true,
    performanceTracking: true,
  });

  const samplePersona = {
    name: 'Sarah Marketing Manager',
    avatar: '/images/personas/sarah.jpg',
    description: 'Digital marketing professional focused on B2B campaigns and lead generation strategies.',
    metrics: {
      completeness: 95,
      realism: 88,
      engagement: 92,
    },
    interests: ['Digital Marketing', 'Analytics', 'Content Strategy', 'Lead Generation'],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Status indicator showing current optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progressive Enhancement Status</span>
            <ConnectionSpeedIndicator />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Device:</span>
              <p className="text-muted-foreground capitalize">{deviceType}</p>
            </div>
            <div>
              <span className="font-medium">Orientation:</span>
              <p className="text-muted-foreground capitalize">{orientation}</p>
            </div>
            <div>
              <span className="font-medium">Connection:</span>
              <p className="text-muted-foreground">{connectionSpeed.toUpperCase()}</p>
            </div>
            <div>
              <span className="font-medium">Optimized:</span>
              <p className="text-muted-foreground">
                {isSlowConnection ? 'Yes' : 'Standard'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main persona card with all progressive enhancements */}
      <ConnectionAware
        slowConnectionFallback={
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Optimized view for slow connection. Some features may be limited.
              </p>
            </CardContent>
          </Card>
        }
        dataSaverFallback={
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Data saver mode active. Images and animations are reduced.
              </p>
            </CardContent>
          </Card>
        }
      >
        <AdaptiveContentLoader
          priority="high"
          loadingFallback={
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <InteractionPattern
            hoverBehavior="scale"
            touchBehavior="scale"
            focusBehavior="ring"
          >
            <Card className="transition-all duration-200">
              <CardHeader>
                <OrientationLayout
                  portraitLayout={
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <AdvancedResponsiveImage
                          {...getOptimizedImageProps(samplePersona.avatar, 120, 120)}
                          alt={`${samplePersona.name} avatar`}
                          className="w-20 h-20 rounded-full border-2 border-primary/20"
                          priority
                          adaptiveQuality
                        />
                      </div>
                      <div className="text-center">
                        <CardTitle className="text-xl font-bold">
                          {samplePersona.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                          {samplePersona.description}
                        </p>
                      </div>
                    </div>
                  }
                  landscapeLayout={
                    <div className="flex items-center space-x-6">
                      <AdvancedResponsiveImage
                        {...getOptimizedImageProps(samplePersona.avatar, 120, 120)}
                        alt={`${samplePersona.name} avatar`}
                        className="w-20 h-20 rounded-full border-2 border-primary/20"
                        priority
                        adaptiveQuality
                      />
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold">
                          {samplePersona.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                          {samplePersona.description}
                        </p>
                      </div>
                    </div>
                  }
                >
                  <div className="flex items-center space-x-4">
                    <AdvancedResponsiveImage
                      {...getOptimizedImageProps(samplePersona.avatar, 120, 120)}
                      alt={`${samplePersona.name} avatar`}
                      className="w-16 h-16 rounded-full border border-border"
                      priority
                      adaptiveQuality
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {samplePersona.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {samplePersona.description}
                      </p>
                    </div>
                  </div>
                </OrientationLayout>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Metrics with adaptive loading */}
                <AdaptiveContentLoader
                  priority={shouldLoadContent('medium') ? 'medium' : 'low'}
                  loadingFallback={
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  }
                >
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(samplePersona.metrics).map(([key, value]) => (
                      <InteractionPattern
                        key={key}
                        hoverBehavior="shadow"
                        touchBehavior="opacity"
                      >
                        <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                          <div className="text-2xl font-bold text-primary">
                            {value}%
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {key}
                          </div>
                        </div>
                      </InteractionPattern>
                    ))}
                  </div>
                </AdaptiveContentLoader>

                {/* Interests with conditional loading */}
                {shouldLoadContent('low') && (
                  <AdaptiveContentLoader
                    priority="low"
                    loadingFallback={
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-6 w-20 bg-muted rounded animate-pulse" />
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <div>
                      <h3 className="font-medium mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {samplePersona.interests.map((interest) => (
                          <InteractionPattern
                            key={interest}
                            hoverBehavior="scale"
                            touchBehavior="opacity"
                          >
                            <Badge variant="secondary" className="cursor-pointer">
                              {interest}
                            </Badge>
                          </InteractionPattern>
                        ))}
                      </div>
                    </div>
                  </AdaptiveContentLoader>
                )}
              </CardContent>
            </Card>
          </InteractionPattern>
        </AdaptiveContentLoader>
      </ConnectionAware>

      {/* Feature demonstration cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adaptive Loading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✅ Connection speed detection</p>
            <p>✅ Priority-based content loading</p>
            <p>✅ Intersection observer optimization</p>
            <p>✅ Data saver mode support</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Optimizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✅ Touch vs mouse interactions</p>
            <p>✅ Screen density awareness</p>
            <p>✅ Orientation-specific layouts</p>
            <p>✅ Responsive image formats</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}