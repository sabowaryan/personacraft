import React, { useState } from 'react';
import Link from 'next/link';
import { EnrichedPersona } from '@/types/enhanced-persona';
import { MetadataBadge, QualityIndicator } from './MetadataBadge';

interface PersonaCardProps {
  persona: EnrichedPersona;
  onSelect: (persona: EnrichedPersona | null) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  showMetadata?: boolean;
  viewMode?: 'grid' | 'list';
}

// Utility function to calculate cultural richness
const calculateCulturalRichness = (culturalData: any): 'low' | 'medium' | 'high' => {
  if (!culturalData) return 'low';

  const totalItems = Object.values(culturalData).flat().length;
  if (totalItems > 50) return 'high';
  if (totalItems > 20) return 'medium';
  return 'low';
};

// Quality score badge component
const QualityScoreBadge = ({ score, compact = false }: { score: number; compact?: boolean }) => {
  const getScoreConfig = (score: number) => {
    if (score >= 90) return {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      text: 'text-white',
      ring: 'ring-green-500/20',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    };
    if (score >= 75) return {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      text: 'text-white',
      ring: 'ring-amber-500/20',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    };
    return {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      text: 'text-white',
      ring: 'ring-red-500/20',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    };
  };

  const config = getScoreConfig(score);

  if (compact) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold shadow-sm ring-1 ${config.bg} ${config.text} ${config.ring}`}>
        {config.icon}
        <span className="ml-1">{score}%</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm ring-1 ${config.bg} ${config.text} ${config.ring}`}>
      {config.icon}
      <span className="ml-2">{score}%</span>
    </div>
  );
};

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onSelect,
  onDelete,
  isSelected = false,
  showMetadata = true,
  viewMode = 'grid'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const culturalRichness = calculateCulturalRichness(persona.culturalData);
  const validationScore = persona.validationMetadata?.validationScore || persona.qualityScore;
  const generationSource = persona.generationMetadata?.source || 'legacy-fallback';

  // Conditional classes based on view mode
  const containerClasses = viewMode === 'list'
    ? "group bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 hover:shadow-lg hover:shadow-slate-200/30 hover:border-persona-violet/20 transition-all duration-200 relative flex items-center gap-4"
    : "group bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 lg:p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-persona-violet/20 transition-all duration-300 relative";

  // Render list view
  if (viewMode === 'list') {
    return (
      <div className={containerClasses}>
        {/* Avatar and basic info */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-persona-violet/10 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <svg className="w-5 h-5 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${generationSource === 'qloo-first'
              ? 'bg-green-500'
              : 'bg-amber-500'
              }`}>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-persona-violet transition-colors duration-200 truncate">{persona.name}</h3>
              <p className="text-xs text-slate-600 font-medium truncate">{persona.occupation}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{persona.age} ans</span>
                <span className="truncate">{persona.location}</span>
              </div>
            </div>
            <QualityScoreBadge score={persona.qualityScore} compact />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/dashboard/personas/${persona.id}`}
            className="px-3 py-2 bg-gradient-to-r from-persona-violet to-purple-600 text-white rounded-lg text-xs font-semibold hover:from-persona-violet/90 hover:to-purple-600/90 transition-all duration-200 inline-flex items-center space-x-1.5 shadow-sm hover:shadow-md relative z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Voir</span>
          </Link>

          <button
            onClick={() => onSelect(isSelected ? null : persona)}
            className="px-2.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors duration-200 inline-flex items-center justify-center relative z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSelected ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>

          <button
            onClick={() => onDelete(persona.id)}
            className="px-2.5 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors duration-200 inline-flex items-center justify-center relative z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Render grid view (default)
  return (
    <div className={containerClasses}>
      {/* Enhanced header with better responsive layout */}
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-persona-violet/10 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {/* Enhanced status indicator with animation */}
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${generationSource === 'qloo-first'
              ? 'bg-green-500 shadow-green-500/30 shadow-lg'
              : 'bg-amber-500 shadow-amber-500/30 shadow-lg'
              }`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-persona-violet transition-colors duration-200 truncate">{persona.name}</h3>
            <p className="text-slate-600 font-medium mb-2 text-sm truncate">{persona.occupation}</p>
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                </svg>
                {persona.age} ans
              </span>
              <span className="flex items-center min-w-0">
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{persona.location}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <QualityScoreBadge score={persona.qualityScore} />
        </div>
      </div>

      {/* Enhanced metadata section with improved responsive layout */}
      {showMetadata && (
        <div className="mb-4 sm:mb-5 space-y-3">
          {/* Primary metadata badges with better spacing */}
          <div className="flex flex-wrap items-center gap-2">
            <MetadataBadge
              metadata={persona.generationMetadata}
              validationData={persona.validationMetadata}
              size="sm"
              variant="compact"
              showTooltip={true}
            />
          </div>

          {/* Enhanced quality indicators with responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3">
            <QualityIndicator
              culturalRichness={culturalRichness}
              validationScore={validationScore}
              size="sm"
              showIcons={true}
            />
          </div>

          {/* Additional metadata row with responsive layout */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Processing time indicator */}
            {persona.generationMetadata?.processingTime && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors duration-200">
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  {persona.generationMetadata.processingTime < 1000
                    ? `${persona.generationMetadata.processingTime}ms`
                    : `${(persona.generationMetadata.processingTime / 1000).toFixed(1)}s`
                  }
                </span>
              </div>
            )}

            {/* Template used indicator */}
            {(persona.generationMetadata?.templateUsed || persona.validationMetadata?.templateName) && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors duration-200">
                <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium truncate max-w-16 sm:max-w-20">
                  {persona.generationMetadata?.templateUsed || persona.validationMetadata?.templateName}
                </span>
              </div>
            )}

            {/* Qloo data usage indicator */}
            {persona.generationMetadata?.qlooDataUsed && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors duration-200">
                <span className="text-blue-500">📊</span>
                <span className="font-medium text-xs">Qloo Data</span>
              </div>
            )}

            {/* Cultural constraints count */}
            {persona.generationMetadata?.culturalConstraintsUsed?.length && persona.generationMetadata.culturalConstraintsUsed.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors duration-200">
                <span className="text-purple-500">🎯</span>
                <span className="font-medium text-xs">
                  {persona.generationMetadata.culturalConstraintsUsed.length} contrainte{persona.generationMetadata.culturalConstraintsUsed.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Validation rules summary for mobile */}
          {persona.validationMetadata && (
            <div className="sm:hidden flex items-center justify-between text-xs bg-slate-50 rounded-lg p-2">
              <span className="text-slate-600 font-medium">Validation</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-semibold">✓ {persona.validationMetadata.passedRules.length}</span>
                {persona.validationMetadata.failedRules.length > 0 && (
                  <span className="text-red-600 font-semibold">✗ {persona.validationMetadata.failedRules.length}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bio et Citation */}
      {persona.bio && (
        <div className="mb-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200/50">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Biographie
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">{persona.bio}</p>
        </div>
      )}

      {persona.quote && (
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200/50">
          <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Citation
          </h4>
          <p className="text-sm text-indigo-800 italic">"{persona.quote}"</p>
        </div>
      )}

      {/* Expandable metadata section */}
      {isExpanded && (
        <div className="mb-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200/60 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4">
            {/* Generation source and quality score */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${persona.generationMetadata?.source === 'qloo-first'
                    ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                    : 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                    }`}>
                    {persona.generationMetadata?.source === 'qloo-first' ? '🎯 Qloo First' : '⚡ Legacy'}
                  </span>
                  {persona.generationMetadata?.qlooDataUsed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-blue-200">
                      📊 Qloo
                    </span>
                  )}
                </div>
                {persona.generationMetadata?.fallbackReason && (
                  <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    Fallback: {persona.generationMetadata.fallbackReason}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">
                  {validationScore}%
                </div>
                <div className="text-xs text-slate-500">Validation</div>
              </div>
            </div>

            {/* Cultural data richness and processing metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${culturalRichness === 'high'
                    ? 'bg-green-500'
                    : culturalRichness === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-slate-400'
                    }`}></span>
                  <span className="font-medium text-slate-700">
                    {culturalRichness === 'high' ? 'Données riches' :
                      culturalRichness === 'medium' ? 'Données moyennes' : 'Données limitées'}
                  </span>
                </div>
                <div className="text-slate-500 text-xs">
                  {Object.values(persona.culturalData || {}).flat().length} éléments culturels
                </div>
              </div>

              {persona.generationMetadata?.processingTime && (
                <div className="space-y-1 text-right">
                  <div className="font-medium text-slate-700">
                    {persona.generationMetadata.processingTime < 1000
                      ? `${persona.generationMetadata.processingTime}ms`
                      : `${(persona.generationMetadata.processingTime / 1000).toFixed(1)}s`
                    }
                  </div>
                  <div className="text-slate-500 text-xs">Traitement</div>
                </div>
              )}
            </div>

            {/* Template and validation details */}
            <div className="flex items-center justify-between text-xs bg-slate-100 rounded-lg p-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">📋</span>
                <span className="font-medium text-slate-700">
                  {persona.generationMetadata?.templateUsed || persona.validationMetadata?.templateName || 'Standard'}
                </span>
              </div>
              {persona.validationMetadata && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-green-600">✓</span>
                    <span className="text-slate-700">{persona.validationMetadata.passedRules.length}</span>
                  </div>
                  {persona.validationMetadata.failedRules.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-red-600">✗</span>
                      <span className="text-slate-700">{persona.validationMetadata.failedRules.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cultural constraints and additional metadata */}
            {(persona.generationMetadata?.culturalConstraintsUsed?.length ?? 0) > 0 && (
              <div className="text-xs bg-slate-100 rounded-lg p-2.5">
                <div className="font-medium text-purple-700 mb-1">Contraintes culturelles:</div>
                <div className="flex flex-wrap gap-1">
                  {persona.generationMetadata?.culturalConstraintsUsed?.slice(0, 3).map((constraint, index) => (
                    <span key={index} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                      {constraint}
                    </span>
                  ))}
                  {(persona.generationMetadata?.culturalConstraintsUsed?.length ?? 0) > 3 && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                      +{(persona.generationMetadata?.culturalConstraintsUsed?.length ?? 0) - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Cache and API usage info for Qloo First personas */}
            {persona.generationMetadata?.source === 'qloo-first' && (
              <div className="flex items-center justify-between text-xs text-slate-600">
                {persona.generationMetadata?.cacheHitRate !== undefined && (
                  <div className="flex items-center space-x-1">
                    <span>💾</span>
                    <span>Cache: {Math.round((persona.generationMetadata?.cacheHitRate || 0) * 100)}%</span>
                  </div>
                )}
                {persona.generationMetadata?.qlooApiCallsCount && (
                  <div className="flex items-center space-x-1">
                    <span>🔗</span>
                    <span>{persona.generationMetadata.qlooApiCallsCount} API calls</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced responsive actions */}
      <div className="flex flex-col xs:flex-row gap-2">
        <Link
          href={`/dashboard/personas/${persona.id}`}
          className="flex-1 px-3 py-2.5 bg-gradient-to-r from-persona-violet to-purple-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-persona-violet/90 hover:to-purple-600/90 transition-all duration-200 inline-flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md group/link relative z-10"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="truncate">Voir détails</span>
        </Link>

        <div className="flex gap-1.5 xs:gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 xs:flex-none px-2.5 sm:px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors duration-200 inline-flex items-center justify-center space-x-1 sm:space-x-1.5 shadow-sm hover:shadow-sm min-w-0 relative z-10"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="hidden xs:inline truncate">{isExpanded ? 'Masquer' : 'Détails'}</span>
          </button>

          <button
            onClick={() => onDelete(persona.id)}
            className="flex-1 xs:flex-none px-2.5 sm:px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-100 transition-colors duration-200 inline-flex items-center justify-center space-x-1 sm:space-x-1.5 shadow-sm hover:shadow-md group/delete min-w-0 relative z-10"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/delete:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden xs:inline truncate">Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaCard;