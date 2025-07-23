/**
 * PersonaListHeader - Header component with metrics, search, filters, and view controls
 * Will be implemented in subsequent tasks
 */

'use client';

import { cn } from '@/lib/utils';
import type { PersonaListHeaderProps } from './types';

export function PersonaListHeader({
  totalPersonas,
  selectedCount,
  viewPreferences,
  onViewPreferencesChange,
  onFiltersChange,
  className
}: PersonaListHeaderProps) {
  return (
    <div className={cn('persona-list-header space-y-4', className)}>
      {/* MetricsDashboard - Task 8 */}
      <div className="metrics-dashboard">
        <div className="text-sm text-muted-foreground">
          Total: {totalPersonas} personas
          {selectedCount > 0 && ` (${selectedCount} selected)`}
        </div>
      </div>

      {/* SearchAndFilters - Task 6 */}
      <div className="search-and-filters">
        <div className="text-sm text-muted-foreground">
          Search and filters will be implemented in task 6
        </div>
      </div>

      {/* ViewModeToggle - Task 7 */}
      <div className="view-mode-toggle">
        <div className="text-sm text-muted-foreground">
          Current view: {viewPreferences.mode} | Size: {viewPreferences.cardSize}
        </div>
      </div>
    </div>
  );
}