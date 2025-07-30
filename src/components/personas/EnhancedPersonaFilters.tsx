import React from 'react';
import { EnhancedPersonaFilters, EnhancedSortOptions } from '@/types/enhanced-persona';

interface EnhancedPersonaFiltersProps {
  filters: EnhancedPersonaFilters;
  sortOptions: EnhancedSortOptions;
  onFiltersChange: (filters: EnhancedPersonaFilters) => void;
  onSortChange: (sortOptions: EnhancedSortOptions) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export const EnhancedPersonaFiltersComponent: React.FC<EnhancedPersonaFiltersProps> = ({
  filters,
  sortOptions,
  onFiltersChange,
  onSortChange,
  searchQuery,
  onSearchChange,
  className = ''
}) => {
  const handleFilterChange = (key: keyof EnhancedPersonaFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSortChange = (field: string, direction?: 'asc' | 'desc') => {
    onSortChange({
      field: field as any,
      direction: direction || sortOptions.direction
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (filters.generationSource?.length) count++;
    if (filters.validationScore) count++;
    if (filters.culturalDataRichness?.length) count++;
    if (filters.qualityScore) count++;
    if (filters.ageRange) count++;
    if (filters.occupation?.length) count++;
    if (filters.location?.length) count++;
    if (filters.templateUsed?.length) count++;
    if (filters.hasMetadata !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 space-y-6 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom, occupation, localisation..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet bg-white text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-4 w-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-slate-900">Filtres</h3>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-persona-violet text-white">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium"
          >
            Effacer tout
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Generation Source Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Source de génération
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.generationSource?.includes('qloo-first') || false}
                onChange={(e) => {
                  const current = filters.generationSource || [];
                  const updated = e.target.checked
                    ? [...current.filter(s => s !== 'qloo-first'), 'qloo-first']
                    : current.filter(s => s !== 'qloo-first');
                  handleFilterChange('generationSource', updated.length > 0 ? updated : undefined);
                }}
                className="rounded border-slate-300 text-persona-violet focus:ring-persona-violet/20"
              />
              <span className="ml-2 text-sm text-slate-600 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Qloo First
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.generationSource?.includes('legacy-fallback') || false}
                onChange={(e) => {
                  const current = filters.generationSource || [];
                  const updated = e.target.checked
                    ? [...current.filter(s => s !== 'legacy-fallback'), 'legacy-fallback']
                    : current.filter(s => s !== 'legacy-fallback');
                  handleFilterChange('generationSource', updated.length > 0 ? updated : undefined);
                }}
                className="rounded border-slate-300 text-persona-violet focus:ring-persona-violet/20"
              />
              <span className="ml-2 text-sm text-slate-600 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Legacy
              </span>
            </label>
          </div>
        </div>

        {/* Validation Score Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Score de validation
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                min="0"
                max="100"
                value={filters.validationScore?.[0] || ''}
                onChange={(e) => {
                  const min = e.target.value ? parseInt(e.target.value) : undefined;
                  const max = filters.validationScore?.[1];
                  handleFilterChange('validationScore', min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                max="100"
                value={filters.validationScore?.[1] || ''}
                onChange={(e) => {
                  const max = e.target.value ? parseInt(e.target.value) : undefined;
                  const min = filters.validationScore?.[0];
                  handleFilterChange('validationScore', min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet"
              />
            </div>
          </div>
        </div>

        {/* Cultural Data Richness */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Richesse culturelle
          </label>
          <div className="space-y-2">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.culturalDataRichness?.includes(level) || false}
                  onChange={(e) => {
                    const current = filters.culturalDataRichness || [];
                    const updated = e.target.checked
                      ? [...current.filter(l => l !== level), level]
                      : current.filter(l => l !== level);
                    handleFilterChange('culturalDataRichness', updated.length > 0 ? updated : undefined);
                  }}
                  className="rounded border-slate-300 text-persona-violet focus:ring-persona-violet/20"
                />
                <span className="ml-2 text-sm text-slate-600 flex items-center">
                  {level === 'high' ? (
                    <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ) : level === 'medium' ? (
                    <svg className="w-3.5 h-3.5 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  )}
                  {level === 'high' ? 'Élevée' : level === 'medium' ? 'Moyenne' : 'Faible'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quality Score Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Score de qualité
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              max="100"
              value={filters.qualityScore?.[0] || ''}
              onChange={(e) => {
                const min = e.target.value ? parseInt(e.target.value) : undefined;
                const max = filters.qualityScore?.[1];
                handleFilterChange('qualityScore', min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              max="100"
              value={filters.qualityScore?.[1] || ''}
              onChange={(e) => {
                const max = e.target.value ? parseInt(e.target.value) : undefined;
                const min = filters.qualityScore?.[0];
                handleFilterChange('qualityScore', min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet"
            />
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Tranche d'âge
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              max="100"
              value={filters.ageRange?.[0] || ''}
              onChange={(e) => {
                const min = e.target.value ? parseInt(e.target.value) : undefined;
                const max = filters.ageRange?.[1];
                handleFilterChange('ageRange', min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              max="100"
              value={filters.ageRange?.[1] || ''}
              onChange={(e) => {
                const max = e.target.value ? parseInt(e.target.value) : undefined;
                const min = filters.ageRange?.[0];
                handleFilterChange('ageRange', min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet"
            />
          </div>
        </div>

        {/* Has Metadata Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Métadonnées
          </label>
          <select
            value={filters.hasMetadata === undefined ? '' : filters.hasMetadata ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('hasMetadata', value === '' ? undefined : value === 'true');
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet bg-white"
          >
            <option value="">Tous</option>
            <option value="true">Avec métadonnées</option>
            <option value="false">Sans métadonnées</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Trier par
            </label>
            <select
              value={sortOptions.field}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet bg-white"
            >
              <option value="qualityScore">Score de qualité</option>
              <option value="validationScore">Score de validation</option>
              <option value="culturalRichness">Richesse culturelle</option>
              <option value="name">Nom</option>
              <option value="age">Âge</option>
              <option value="occupation">Profession</option>
              <option value="location">Localisation</option>
              <option value="createdAt">Date de création</option>
              <option value="processingTime">Temps de traitement</option>
              <option value="generatedAt">Date de génération</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Ordre
            </label>
            <select
              value={sortOptions.direction}
              onChange={(e) => handleSortChange(sortOptions.field, e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet bg-white"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPersonaFiltersComponent;