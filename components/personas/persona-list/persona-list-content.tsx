/**
 * PersonaListContent - Main content area with virtualized grid and persona cards
 * Will be implemented in subsequent tasks
 */

'use client';

import { cn } from '@/lib/utils';
import type { PersonaListContentProps } from './types';

export function PersonaListContent({
  personas,
  viewMode,
  cardSize,
  selectedIds,
  onSelectionChange,
  onPersonaClick,
  loading,
  className
}: PersonaListContentProps) {
  if (loading) {
    return (
      <div className={cn('persona-list-content', className)}>
        {/* LoadingSkeletons - Task 11 */}
        <div className="text-sm text-muted-foreground">Loading personas...</div>
      </div>
    );
  }

  return (
    <div className={cn('persona-list-content', className)}>
      {/* VirtualizedGrid - Task 5 */}
      {/* PersonaCard - Task 4 */}
      <div className="text-sm text-muted-foreground">
        Content area with {personas.length} personas in {viewMode} mode ({cardSize} size)
      </div>
    </div>
  );
}