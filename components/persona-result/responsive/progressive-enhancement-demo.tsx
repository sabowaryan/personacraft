'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AdaptiveContentLoader,
  InteractionPattern,
  DensityAware,
  AdvancedResponsiveImage,
  ConnectionSpeedIndicator,
  OrientationLayout,
  ConnectionAware,
  AdaptiveGrid,
} from './progressive-enhancement';
import { useProgressiveEnhancement, useDeviceInteractions } from '@/hooks/use-progressive-enhancement';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
  persona: {
    id: string;
    name: string;
    avatar: string;
    description: string;
    metrics: {
      completeness: number;
      realism: number;
      engagement: number;
    };
  };
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

function PersonaCard({ persona, priority = 'medium' }: PersonaCardProps) {
  const { getOptimizedImageProps, getOrientationClasses } = useProgressiveEnhancement();
  const { getInteractionProps } = useDeviceInteractions();

  const imageProps = getOptimizedImageProps(persona.avatar, 120, 120);
  const orientationClasses = getOrientationClasses();

  return (
    <AdaptiveContentLoader
      priority={priority}
      loadingFallback={
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      }
      className={cn('h-full', orientationClasses)}
    >
      <InteractionPattern
        hoverBehavior="scale"
        touchBehavior="scale"
        focusBehavior="ring"
      >
        <Card className="h-full transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <DensityAware
                highDensityContent={
                  <AdvancedResponsiveImage
                    {...imageProps}
                    alt={`${persona.name} avatar`}
                    className="w-20 h-20 rounded-full border-2 border-primary/20"
                    priority={priority === 'critical'}
                    adaptiveQuality
                  />
                }
              >
                <AdvancedResponsiveImage
                  {...imageProps}
                  alt={`${persona.name} avatar`}
                  className="w-16 h-16 rounded-full border border-border"
                  priority={priority === 'critical'}
                  adaptiveQuality
                />
              </DensityAware>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate">
                  {persona.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {persona.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <OrientationLayout
              portraitLayout={
                <div className="space-y-3">
                  <MetricsDisplay metrics={persona.metrics} layout="vertical" />
                </div>
              }
              landscapeLayout={
                <div className="flex items-center justify-between">
                  <MetricsDisplay metrics={persona.metrics} layout="horizontal" />
                </div>
              }
            >
              <MetricsDisplay metrics={persona.metrics} layout="grid" />
            </OrientationLayout>
          </CardContent>
        </Card>
      </InteractionPattern>
    </AdaptiveContentLoader>
  );
}

interface MetricsDisplayProps {
  metrics: {
    completeness: number;
    realism: number;
    engagement: number;
  };
  layout: 'vertical' | 'horizontal' | 'grid';
}

function MetricsDisplay({ metrics, layout }: MetricsDisplayProps) {
  const { getInteractionProps } = useDeviceInteractions();

  const metricItems = [
    { label: 'Completeness', value: metrics.completeness, color: 'bg-green-500' },
    { label: 'Realism', value: metrics.realism, color: 'bg-blue-500' },
    { label: 'Engagement', value: metrics.engagement, color: 'bg-purple-500' },
  ];

  const layoutClasses = {
    vertical: 'space-y-2',
    horizontal: 'flex space-x-4',
    grid: 'grid grid-cols-3 gap-2',
  };

  return (
    <div className={layoutClasses[layout]}>
      {metricItems.map((metric) => (
        <div
          key={metric.label}
          {...getInteractionProps('card')}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
        >
          <div className={cn('w-3 h-3 rounded-full', metric.color)} />
          <span className="text-xs font-medium">{metric.label}</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {metric.value}%
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function ProgressiveEnhancementDemo() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const { 
    connectionSpeed, 
    isSlowConnection, 
    deviceType, 
    orientation,
    getPerformanceMetrics 
  } = useProgressiveEnhancement();

  const samplePersonas = [
    {
      id: '1',
      name: 'Sarah Marketing Manager',
      avatar: '/images/personas/sarah.jpg',
      description: 'Digital marketing professional focused on B2B campaigns and lead generation.',
      metrics: { completeness: 95, realism: 88, engagement: 92 },
    },
    {
      id: '2',
      name: 'Alex Tech Enthusiast',
      avatar: '/images/personas/alex.jpg',
      description: 'Early adopter of technology with strong influence in developer communities.',
      metrics: { completeness: 87, realism: 94, engagement: 89 },
    },
    {
      id: '3',
      name: 'Maria Small Business Owner',
      avatar: '/images/personas/maria.jpg',
      description: 'Entrepreneur running a local retail business with focus on customer experience.',
      metrics: { completeness: 91, realism: 85, engagement: 96 },
    },
  ];

  const performanceMetrics = getPerformanceMetrics();

  return (
    <div className="space-y-6 p-6">
      {/* Status Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progressive Enhancement Demo</span>
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

      {/* Connection-aware content */}
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
        {/* Adaptive grid of persona cards */}
        <AdaptiveGrid minItemWidth={320} gap={24}>
          {samplePersonas.map((persona, index) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              priority={index === 0 ? 'high' : 'medium'}
            />
          ))}
        </AdaptiveGrid>
      </ConnectionAware>

      {/* Performance metrics (only shown in development or with performance tracking enabled) */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Images Loaded:</span>
                <p className="text-muted-foreground">
                  {performanceMetrics.loadedImages}/{performanceMetrics.totalImages}
                </p>
              </div>
              <div>
                <span className="font-medium">Avg Load Time:</span>
                <p className="text-muted-foreground">
                  {Math.round(performanceMetrics.averageLoadTime)}ms
                </p>
              </div>
              <div>
                <span className="font-medium">P95 Load Time:</span>
                <p className="text-muted-foreground">
                  {Math.round(performanceMetrics.percentiles?.p95 || 0)}ms
                </p>
              </div>
              <div>
                <span className="font-medium">Failed Images:</span>
                <p className="text-muted-foreground">
                  {performanceMetrics.failedImages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orientation-specific layout example */}
      <OrientationLayout
        portraitLayout={
          <Card>
            <CardHeader>
              <CardTitle>Portrait Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This content is optimized for portrait orientation with vertical stacking.
              </p>
              <div className="mt-4 space-y-2">
                <Button className="w-full">Full Width Button</Button>
                <Button variant="outline" className="w-full">Another Button</Button>
              </div>
            </CardContent>
          </Card>
        }
        landscapeLayout={
          <Card>
            <CardHeader>
              <CardTitle>Landscape Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This content is optimized for landscape orientation with horizontal layout.
              </p>
              <div className="flex space-x-4">
                <Button className="flex-1">Button One</Button>
                <Button variant="outline" className="flex-1">Button Two</Button>
              </div>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Default Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is the default layout when no orientation-specific content is provided.
            </p>
          </CardContent>
        </Card>
      </OrientationLayout>
    </div>
  );
}