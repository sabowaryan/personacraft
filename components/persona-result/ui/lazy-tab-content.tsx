'use client';

import { Suspense, lazy, memo } from 'react';
import { useLazyLoad } from '@/hooks/use-intersection-observer';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Persona } from '@/lib/types/persona';

interface LazyTabContentProps {
  isActive: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Wrapper component for lazy loading tab content
 * Only loads content when tab becomes active or comes into view
 */
export const LazyTabContent = memo(function LazyTabContent({
  isActive,
  children,
  fallback,
  priority = 'medium',
}: LazyTabContentProps) {
  const { ref, shouldLoad } = useLazyLoad({
    rootMargin: priority === 'high' ? '200px' : priority === 'medium' ? '100px' : '50px',
    freezeOnceVisible: true,
  });

  // Load immediately if active, otherwise wait for intersection
  const shouldRender = isActive || shouldLoad;

  return (
    <div ref={ref} className="min-h-[200px]">
      {shouldRender ? (
        <Suspense fallback={fallback || <TabContentSkeleton />}>
          {children}
        </Suspense>
      ) : (
        <TabContentSkeleton />
      )}
    </div>
  );
});

/**
 * Skeleton component for tab content loading
 */
function TabContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Lazy loaded tab components
export const LazyPersonaProfileTab = lazy(() => 
  import('../tabs/persona-profile-tab').then(module => ({ 
    default: module.PersonaProfileTab 
  }))
);

export const LazyPersonaInterestsTab = lazy(() => 
  import('../tabs/persona-interests-tab').then(module => ({ 
    default: module.PersonaInterestsTab 
  }))
);

export const LazyPersonaCommunicationTab = lazy(() => 
  import('../tabs/persona-communication-tab').then(module => ({ 
    default: module.PersonaCommunicationTab 
  }))
);

export const LazyPersonaMarketingTab = lazy(() => 
  import('../tabs/persona-marketing-tab').then(module => ({ 
    default: module.PersonaMarketingTab 
  }))
);

// Memoized tab wrapper components
interface TabWrapperProps {
  persona: Persona;
  isActive: boolean;
}

export const MemoizedProfileTab = memo(function MemoizedProfileTab({ persona, isActive }: TabWrapperProps) {
  return (
    <LazyTabContent isActive={isActive} priority="high">
      <LazyPersonaProfileTab persona={persona} />
    </LazyTabContent>
  );
});

export const MemoizedInterestsTab = memo(function MemoizedInterestsTab({ persona, isActive }: TabWrapperProps) {
  return (
    <LazyTabContent isActive={isActive} priority="medium">
      <LazyPersonaInterestsTab persona={persona} />
    </LazyTabContent>
  );
});

export const MemoizedCommunicationTab = memo(function MemoizedCommunicationTab({ persona, isActive }: TabWrapperProps) {
  return (
    <LazyTabContent isActive={isActive} priority="medium">
      <LazyPersonaCommunicationTab persona={persona} />
    </LazyTabContent>
  );
});

export const MemoizedMarketingTab = memo(function MemoizedMarketingTab({ persona, isActive }: TabWrapperProps) {
  return (
    <LazyTabContent isActive={isActive} priority="low">
      <LazyPersonaMarketingTab persona={persona} />
    </LazyTabContent>
  );
});