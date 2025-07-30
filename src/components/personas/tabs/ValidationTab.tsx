'use client';

import React, { useState } from 'react';
import { EnrichedPersona } from '@/types/enhanced-persona';

interface ValidationTabProps {
  persona: EnrichedPersona;
}

interface ValidationRuleDisplayProps {
  rule: string;
  passed: boolean;
  score: number;
  message: string;
  category: 'format' | 'content' | 'cultural' | 'demographic';
}

const ValidationRuleDisplay: React.FC<ValidationRuleDisplayProps> = ({
  rule,
  passed,
  score,
  message,
  category
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'format': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'content': return 'text-green-600 bg-green-50 border-green-200';
      case 'cultural': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'demographic': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'format': return 'Format';
      case 'content': return 'Contenu';
      case 'cultural': return 'Culturel';
      case 'demographic': return 'Démographique';
      default: return 'Autre';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {passed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900">{rule}</h4>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(category)}`}>
              {getCategoryLabel(category)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {score}%
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-700 ml-9">{message}</p>
    </div>
  );
};

const ValidationScoreCircle: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  score, 
  size = 'md' 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const sizeClasses = {
    sm: { container: 'w-16 h-16', text: 'text-sm', svg: 'w-16 h-16' },
    md: { container: 'w-24 h-24', text: 'text-lg', svg: 'w-24 h-24' },
    lg: { container: 'w-32 h-32', text: 'text-2xl', svg: 'w-32 h-32' }
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size].container}`}>
      <svg className={sizeClasses[size].svg} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-neutral-200"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={getScoreBackground(score)}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${getScoreColor(score)} ${sizeClasses[size].text}`}>
          {score}%
        </span>
      </div>
    </div>
  );
};

const ValidationTimeline: React.FC<{ validationTime: number; templateName: string }> = ({
  validationTime,
  templateName
}) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Chronologie de validation
    </h4>
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-900">Template sélectionné</div>
          <div className="text-xs text-neutral-600">{templateName}</div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-900">Validation exécutée</div>
          <div className="text-xs text-neutral-600">Durée: {validationTime}ms</div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-900">Résultats générés</div>
          <div className="text-xs text-neutral-600">Score calculé et règles évaluées</div>
        </div>
      </div>
    </div>
  </div>
);

export const ValidationTab: React.FC<ValidationTabProps> = ({ persona }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { validationMetadata, qualityScore } = persona;

  if (!validationMetadata) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune donnée de validation</h3>
        <p className="text-neutral-600">Ce persona n'a pas été validé avec le système de templates.</p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-amber-800">
              Score de qualité général: {qualityScore}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'all', label: 'Toutes les règles', count: validationMetadata.validationDetails?.length || 0 },
    { id: 'format', label: 'Format', count: validationMetadata.validationDetails?.filter(d => d.category === 'format').length || 0 },
    { id: 'content', label: 'Contenu', count: validationMetadata.validationDetails?.filter(d => d.category === 'content').length || 0 },
    { id: 'cultural', label: 'Culturel', count: validationMetadata.validationDetails?.filter(d => d.category === 'cultural').length || 0 },
    { id: 'demographic', label: 'Démographique', count: validationMetadata.validationDetails?.filter(d => d.category === 'demographic').length || 0 }
  ];

  const filteredRules = activeCategory === 'all' 
    ? validationMetadata.validationDetails || []
    : validationMetadata.validationDetails?.filter(d => d.category === activeCategory) || [];

  const passedRulesCount = validationMetadata.passedRules?.length || 0;
  const failedRulesCount = validationMetadata.failedRules?.length || 0;
  const totalRules = passedRulesCount + failedRulesCount;

  return (
    <div className="space-y-8">
      {/* Header with score */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text mb-2 flex items-center">
              <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Résultats de validation
            </h2>
            <p className="text-neutral-600">
              Template utilisé: <span className="font-semibold">{validationMetadata.templateName}</span>
            </p>
          </div>
          <ValidationScoreCircle score={validationMetadata.validationScore} size="lg" />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Règles respectées</h3>
              <p className="text-3xl font-bold text-green-600">{passedRulesCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Règles échouées</h3>
              <p className="text-3xl font-bold text-red-600">{failedRulesCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Temps de validation</h3>
              <p className="text-3xl font-bold text-blue-600">{validationMetadata.validationTime}ms</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Filtrer par catégorie</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-persona-violet text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Validation rules */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">
          Détail des règles de validation
          {activeCategory !== 'all' && (
            <span className="text-base font-normal text-neutral-600 ml-2">
              - {categories.find(c => c.id === activeCategory)?.label}
            </span>
          )}
        </h3>
        
        {filteredRules.length === 0 ? (
          <div className="text-center py-8 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600">Aucune règle trouvée pour cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRules.map((detail, index) => (
              <ValidationRuleDisplay
                key={index}
                rule={detail.rule}
                passed={detail.passed}
                score={detail.score}
                message={detail.message}
                category={detail.category}
              />
            ))}
          </div>
        )}
      </div>

      {/* Template information and timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informations du template
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">Nom du template:</span>
              <span className="font-semibold">{validationMetadata.templateName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Score de validation:</span>
              <span className="font-semibold">{validationMetadata.validationScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Règles totales:</span>
              <span className="font-semibold">{totalRules}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Taux de réussite:</span>
              <span className="font-semibold">
                {totalRules > 0 ? Math.round((passedRulesCount / totalRules) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <ValidationTimeline 
          validationTime={validationMetadata.validationTime}
          templateName={validationMetadata.templateName}
        />
      </div>
    </div>
  );
};