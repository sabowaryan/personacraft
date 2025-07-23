/**
 * PersonaListStates - State components for loading, empty, and error states
 * Will be implemented in task 11
 */

'use client';

import { cn } from '@/lib/utils';
import type { PersonaListStatesProps } from './types';

export function PersonaListStates({
  loading,
  error,
  empty,
  onRetry,
  className
}: PersonaListStatesProps) {
  if (loading) {
    return (
      <div className={cn('persona-list-states loading', className)}>
        {/* LoadingSkeletons - Task 11 */}
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading personas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('persona-list-states error', className)}>
        {/* ErrorState - Task 11 */}
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-destructive">Error: {error}</div>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className={cn('persona-list-states empty', className)}>
        {/* EmptyState - Task 11 */}
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-muted-foreground">No personas found</div>
          <div className="text-sm text-muted-foreground">
            Create your first persona to get started
          </div>
        </div>
      </div>
    );
  }

  return null;
}