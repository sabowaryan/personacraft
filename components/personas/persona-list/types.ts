/**
 * TypeScript interfaces for PersonaList refactoring
 * Comprehensive type definitions for all components and state management
 */

import { ReactNode } from 'react';

// ============================================================================
// CORE PERSONA INTERFACE (Enhanced from existing)
// ============================================================================

export interface Persona {
  id: string;
  name: string;
  description: string;
  demographics: PersonaDemographics;
  culturalData: PersonaCulturalData;
  qualityScore: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  avatar?: string;
  // Legacy compatibility
  age: number;
  location: string;
  bio: string;
  values: string[];
  interests: PersonaInterests;
  communication: CommunicationProfile;
  marketing: MarketingProfile;
  quote: string;
  generatedAt: Date | string;
  sources: string[];
}

export interface PersonaDemographics {
  age: number;
  location: string;
  income?: string;
  education?: string;
  occupation?: string;
  familyStatus?: string;
}

export interface PersonaCulturalData {
  music: string[];
  movies: string[];
  brands: string[];
  lifestyle: string[];
  food?: string[];
  books?: string[];
}

// Legacy interfaces for compatibility
export interface PersonaInterests {
  music: string[];
  brands: string[];
  movies: string[];
  food: string[];
  books: string[];
  lifestyle: string[];
}

export interface CommunicationProfile {
  preferredChannels: string[];
  tone: string;
  contentTypes: string[];
  frequency: string;
}

export interface MarketingProfile {
  painPoints: string[];
  motivations: string[];
  buyingBehavior: string;
  influences: string[];
}

// ============================================================================
// VIEW PREFERENCES & STATE MANAGEMENT
// ============================================================================

export interface ViewPreferences {
  mode: ViewMode;
  cardSize: CardSize;
  visibleFields: PersonaField[];
  sortBy: SortOption;
  filtersApplied: FilterState;
  gridColumns?: number;
  showMetrics: boolean;
}

export type ViewMode = 'compact' | 'detailed' | 'list';
export type CardSize = 'small' | 'medium' | 'large';

export interface PersonaField {
  key: keyof Persona;
  label: string;
  visible: boolean;
  order: number;
}

export interface SortOption {
  field: keyof Persona | 'qualityScore' | 'createdAt' | 'name';
  direction: 'asc' | 'desc';
  label: string;
}

export interface FilterState {
  search: string;
  ageRange: [number, number];
  locations: string[];
  qualityScoreMin: number;
  dateRange: [Date, Date] | null;
  tags: string[];
  hasAvatar: boolean | null;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

// Main Container Props
export interface PersonaListContainerProps {
  personas: Persona[];
  loading: boolean;
  error?: string;
  onPersonaSelect: (persona: Persona) => void;
  onBulkAction: (action: BulkAction, personas: Persona[]) => void;
  onRefresh?: () => void;
  className?: string;
}

// Header Components Props
export interface PersonaListHeaderProps {
  totalPersonas: number;
  selectedCount: number;
  viewPreferences: ViewPreferences;
  onViewPreferencesChange: (preferences: Partial<ViewPreferences>) => void;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  className?: string;
}

export interface MetricsDashboardProps {
  totalPersonas: number;
  averageQualityScore: number;
  demographicBreakdown: DemographicData;
  trends: TrendData[];
  loading?: boolean;
  className?: string;
}

export interface SearchAndFiltersProps {
  filterState: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  availableLocations: string[];
  availableTags: string[];
  onClearFilters: () => void;
  className?: string;
}

export interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  cardSize: CardSize;
  onCardSizeChange: (size: CardSize) => void;
  className?: string;
}

// Content Components Props
export interface PersonaListContentProps {
  personas: Persona[];
  viewMode: ViewMode;
  cardSize: CardSize;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onPersonaClick: (persona: Persona) => void;
  loading?: boolean;
  className?: string;
}

export interface VirtualizedGridProps {
  personas: Persona[];
  viewMode: ViewMode;
  cardSize: CardSize;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onPersonaClick: (persona: Persona) => void;
  itemHeight?: number;
  overscan?: number;
  className?: string;
}

export interface PersonaCardProps {
  persona: Persona;
  viewMode: ViewMode;
  cardSize: CardSize;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (action: PersonaAction) => void;
  onClick?: () => void;
  visibleFields?: PersonaField[];
  className?: string;
}

export interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: BulkAction) => void;
  visible: boolean;
  className?: string;
}

// Actions Components Props
export interface PersonaListActionsProps {
  selectedPersonas: Persona[];
  onExport: (options: ExportOptions) => void;
  onBulkDelete: (personas: Persona[]) => void;
  onCompare: (personas: Persona[]) => void;
  className?: string;
}

export interface BulkActionsProps {
  selectedPersonas: Persona[];
  onAction: (action: BulkAction, personas: Persona[]) => void;
  disabled?: boolean;
  className?: string;
}

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonas: Persona[];
  onExport: (options: ExportOptions) => void;
  loading?: boolean;
}

// States Components Props
export interface PersonaListStatesProps {
  loading: boolean;
  error?: string;
  empty: boolean;
  onRetry?: () => void;
  className?: string;
}

export interface LoadingSkeletonsProps {
  count?: number;
  viewMode: ViewMode;
  cardSize: CardSize;
  className?: string;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: ReactNode;
  className?: string;
}

export interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

// ============================================================================
// ACTION & EVENT TYPES
// ============================================================================

export type PersonaAction = 
  | 'view'
  | 'edit'
  | 'duplicate'
  | 'export'
  | 'delete'
  | 'share'
  | 'compare';

export type BulkAction = 
  | 'export'
  | 'delete'
  | 'compare'
  | 'archive'
  | 'tag'
  | 'move';

export interface PersonaActionEvent {
  action: PersonaAction;
  persona: Persona;
  timestamp: Date;
}

export interface BulkActionEvent {
  action: BulkAction;
  personas: Persona[];
  timestamp: Date;
}

// ============================================================================
// EXPORT & SHARING TYPES
// ============================================================================

export interface ExportOptions {
  format: ExportFormat;
  personas: Persona[];
  fields: PersonaField[];
  includeMetrics: boolean;
  includeCharts: boolean;
  customization?: ExportCustomization;
}

export type ExportFormat = 'pdf' | 'csv' | 'json' | 'powerpoint';

export interface ExportCustomization {
  title?: string;
  logo?: string;
  branding: boolean;
  colors?: string[];
  template?: string;
}

export interface ExportProgress {
  stage: ExportStage;
  progress: number;
  estimatedTime?: number;
  message?: string;
}

export type ExportStage = 
  | 'preparing'
  | 'processing'
  | 'generating'
  | 'finalizing'
  | 'complete'
  | 'error';

// ============================================================================
// METRICS & ANALYTICS TYPES
// ============================================================================

export interface DemographicData {
  ageDistribution: AgeDistribution[];
  locationDistribution: LocationDistribution[];
  qualityScoreDistribution: QualityScoreDistribution[];
}

export interface AgeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface LocationDistribution {
  location: string;
  count: number;
  percentage: number;
}

export interface QualityScoreDistribution {
  range: string;
  count: number;
  percentage: number;
  averageScore: number;
}

export interface TrendData {
  period: string;
  totalGenerated: number;
  averageQuality: number;
  topLocations: string[];
  topTags: string[];
}

export interface PersonaMetrics {
  totalPersonas: number;
  averageQualityScore: number;
  completionRate: number;
  generationTrends: TrendData[];
  demographicBreakdown: DemographicData;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  scrollPerformance: number;
}

// ============================================================================
// ACCESSIBILITY & RESPONSIVE TYPES
// ============================================================================

export interface AccessibilityOptions {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'longPress';
  direction?: 'left' | 'right' | 'up' | 'down';
  action: PersonaAction | BulkAction;
}

// ============================================================================
// VIRTUALIZATION & PERFORMANCE TYPES
// ============================================================================

export interface VirtualizationConfig {
  itemHeight: number;
  overscan: number;
  threshold: number;
  estimatedItemSize?: number;
  scrollingDelay?: number;
}

export interface GridLayout {
  columns: number;
  gap: number;
  minItemWidth: number;
  maxItemWidth: number;
}

export interface ScrollState {
  scrollTop: number;
  scrollLeft: number;
  isScrolling: boolean;
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

// ============================================================================
// CUSTOMIZATION & PERSONALIZATION TYPES
// ============================================================================

export interface CustomizationOptions {
  theme: 'light' | 'dark' | 'auto';
  colorScheme?: string;
  fontFamily?: string;
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  sounds: boolean;
}

export interface UserPreferences extends ViewPreferences {
  accessibility: AccessibilityOptions;
  customization: CustomizationOptions;
  shortcuts: KeyboardShortcut[];
  notifications: NotificationSettings;
}

export interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  action: PersonaAction | BulkAction | 'selectAll' | 'clearSelection';
  description: string;
}

export interface NotificationSettings {
  showToasts: boolean;
  showProgress: boolean;
  soundEnabled: boolean;
  duration: number;
}

// ============================================================================
// ERROR HANDLING & VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  errorType: 'network' | 'render' | 'export' | 'unknown';
  retryCount: number;
  lastError?: Error;
}

// ============================================================================
// HOOKS & UTILITIES TYPES
// ============================================================================

export interface UsePersonaListReturn {
  personas: Persona[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  viewPreferences: ViewPreferences;
  filterState: FilterState;
  metrics: PersonaMetrics;
  actions: PersonaListActions;
}

export interface PersonaListActions {
  selectPersona: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  updateViewPreferences: (preferences: Partial<ViewPreferences>) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  exportPersonas: (options: ExportOptions) => Promise<void>;
  deletePersonas: (ids: string[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

export interface UseVirtualizationReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  scrollElementRef: React.RefObject<HTMLDivElement>;
  visibleItems: VirtualItem[];
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
}

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
  persona: Persona;
}