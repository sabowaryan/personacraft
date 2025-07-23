/**
 * PersonaListActions - Actions component for bulk operations and exports
 * Will be implemented in subsequent tasks (Tasks 9-10)
 */

'use client';

import { cn } from '@/lib/utils';
import type { PersonaListActionsProps } from './types';

export function PersonaListActions({
  selectedPersonas,
  onExport,
  onBulkDelete,
  onCompare,
  className
}: PersonaListActionsProps) {
  return (
    <div className={cn('persona-list-actions', className)}>
      {/* BulkActions - Task 9 */}
      {/* ExportModal - Task 10 */}
      <div className="text-sm text-muted-foreground">
        Actions for {selectedPersonas.length} selected personas
      </div>
    </div>
  );
}