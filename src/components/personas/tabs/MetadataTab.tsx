'use client';

import React, { useState } from 'react';
import { EnrichedPersona } from '@/types/enhanced-persona';

interface MetadataTabProps {
  persona: EnrichedPersona;
}

interface MetadataCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  colorScheme?: {
    bg: string;
    border: string;
    icon: string;
  };
}

const MetadataCard: React.FC<MetadataCardProps> = ({ 
  title, 
  icon, 
  children, 
  colorScheme = {
    bg: 'bg-white',
    border: 'border-neutral-200',
    icon: 'text-persona-violet'
  }
}) => (
  <div className={`${colorScheme.bg} rounded-xl border ${colorScheme.border} p-6 card-hover`}>
    <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
      <span className={`${colorScheme.icon} mr-3`}>{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; value: string | number | React.ReactNode; highlight?: boolean }> = ({ 
  label, 
  value, 
  highlight = false 
}) => (
  <div className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
    <span className="text-neutral-600 font-medium">{label}:</span>
    <span className={`font-semibold ${highlight ? 'text-persona-violet' : 'text-neutral-900'}`}>
      {value}
    </span>
  </div>
);

const StatusBadge: React.FC<{ 
  status: 'qloo-first' | 'legacy-fallback' | string;
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'qloo-first':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          text: 'text-white',
          icon: '🎯',
          label: 'Qloo First'
        };
      case 'legacy-fallback':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          text: 'text-white',
          icon: '⚡',
          label: 'Legacy Fallback'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-600',
          text: 'text-white',
          icon: '❓',
          label: status
        };
    }
  };

  const style = getStatusStyle(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`${style.bg} ${style.text} ${sizeClasses} rounded-full font-medium inline-flex items-center`}>
      <span className="mr-1">{style.icon}</span>
      {style.label}
    </span>
  );
};

const ProcessingTimeIndicator: React.FC<{ time: number }> = ({ time }) => {
  const getTimeColor = (time: number) => {
    if (time < 1000) return 'text-green-600';
    if (time < 5000) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        time < 1000 ? 'bg-green-500' : time < 5000 ? 'bg-amber-500' : 'bg-red-500'
      }`} />
      <span className={`font-semibold ${getTimeColor(time)}`}>
        {formatTime(time)}
      </span>
    </div>
  );
};

const ConstraintsList: React.FC<{ constraints: string[] }> = ({ constraints }) => {
  if (!constraints || constraints.length === 0) {
    return <span className="text-neutral-500 italic">Aucune contrainte appliquée</span>;
  }

  return (
    <div className="space-y-2">
      {constraints.map((constraint, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-persona-violet rounded-full flex-shrink-0" />
          <span className="text-sm text-neutral-700">{constraint}</span>
        </div>
      ))}
    </div>
  );
};

const TechnicalDetailsSection: React.FC<{ persona: EnrichedPersona }> = ({ persona }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-neutral-900">Détails techniques</h4>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-persona-violet hover:text-persona-violet/80 font-medium"
        >
          {showAdvanced ? 'Masquer' : 'Afficher'} les détails avancés
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-50 rounded-lg p-4">
          <h5 className="font-medium text-neutral-900 mb-2">Identifiants</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">ID Persona:</span>
              <code className="text-xs bg-white px-2 py-1 rounded border">{persona.id}</code>
            </div>
            {persona.templateUsed && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Template:</span>
                <code className="text-xs bg-white px-2 py-1 rounded border">{persona.templateUsed}</code>
              </div>
            )}
          </div>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4">
          <h5 className="font-medium text-neutral-900 mb-2">Horodatage</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Créé le:</span>
              <span className="text-neutral-900">
                {new Date(persona.createdAt).toLocaleString('fr-FR')}
              </span>
            </div>
            {persona.generationMetadata?.generatedAt && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Généré le:</span>
                <span className="text-neutral-900">
                  {new Date(persona.generationMetadata.generatedAt).toLocaleString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="font-medium text-slate-900 mb-3">Informations avancées</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h6 className="font-medium text-slate-800 mb-2">Données brutes</h6>
              <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
                {JSON.stringify({
                  generationMetadata: persona.generationMetadata,
                  validationMetadata: persona.validationMetadata
                }, null, 2)}
              </pre>
            </div>
            <div>
              <h6 className="font-medium text-slate-800 mb-2">Statistiques</h6>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Taille des données culturelles:</span>
                  <span className="text-slate-900">
                    {persona.culturalData ? Object.values(persona.culturalData).flat().length : 0} éléments
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Score de qualité:</span>
                  <span className="text-slate-900">{persona.qualityScore}%</span>
                </div>
                {persona.validationMetadata && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Score de validation:</span>
                    <span className="text-slate-900">{persona.validationMetadata.validationScore}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MetadataTab: React.FC<MetadataTabProps> = ({ persona }) => {
  const { generationMetadata, validationMetadata } = persona;

  if (!generationMetadata && !validationMetadata) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Métadonnées limitées</h3>
        <p className="text-neutral-600 mb-4">
          Ce persona a été créé avec le système legacy et ne contient pas de métadonnées détaillées.
        </p>
        <div className="inline-block p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-amber-800">
              Persona legacy - Considérez une re-génération avec Qloo First
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-text mb-2 flex items-center">
          <svg className="w-7 h-7 mr-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Métadonnées de génération et traitement
        </h2>
        <p className="text-neutral-600">
          Informations détaillées sur la création et le traitement de ce persona
        </p>
      </div>

      {/* Generation metadata */}
      {generationMetadata && (
        <MetadataCard
          title="Informations de génération"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          colorScheme={{
            bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
            border: 'border-green-200',
            icon: 'text-green-600'
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-700 font-medium">Méthode de génération:</span>
              <StatusBadge status={generationMetadata.source} />
            </div>
            
            <InfoRow label="Méthode utilisée" value={generationMetadata.method} />
            <InfoRow 
              label="Temps de traitement" 
              value={<ProcessingTimeIndicator time={generationMetadata.processingTime} />} 
            />
            <InfoRow 
              label="Données Qloo utilisées" 
              value={generationMetadata.qlooDataUsed ? '✅ Oui' : '❌ Non'} 
              highlight={generationMetadata.qlooDataUsed}
            />
            
            {generationMetadata.templateUsed && (
              <InfoRow label="Template utilisé" value={generationMetadata.templateUsed} />
            )}
            
            {generationMetadata.cacheHitRate !== undefined && (
              <InfoRow 
                label="Taux de cache hit" 
                value={`${Math.round(generationMetadata.cacheHitRate * 100)}%`} 
              />
            )}
            
            {generationMetadata.fallbackReason && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-1">Raison du fallback:</h4>
                <p className="text-sm text-amber-800">{generationMetadata.fallbackReason}</p>
              </div>
            )}
          </div>
        </MetadataCard>
      )}

      {/* Cultural constraints */}
      {generationMetadata?.culturalConstraintsUsed && (
        <MetadataCard
          title="Contraintes culturelles appliquées"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          colorScheme={{
            bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
            border: 'border-purple-200',
            icon: 'text-purple-600'
          }}
        >
          <ConstraintsList constraints={generationMetadata.culturalConstraintsUsed} />
        </MetadataCard>
      )}

      {/* Qloo data usage */}
      {generationMetadata?.qlooDataUsed && (
        <MetadataCard
          title="Utilisation des données Qloo"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          }
          colorScheme={{
            bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
            border: 'border-blue-200',
            icon: 'text-blue-600'
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-neutral-700">
                Données culturelles enrichies via l'API Qloo
              </span>
            </div>
            
            {generationMetadata.cacheHitRate !== undefined && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-neutral-700">
                  Taux de cache: {Math.round(generationMetadata.cacheHitRate * 100)}%
                </span>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Les données culturelles de ce persona ont été enrichies grâce à l'intelligence 
                artificielle de Qloo, offrant des recommandations plus précises et contextuelles.
              </p>
            </div>
          </div>
        </MetadataCard>
      )}

      {/* Validation metadata summary */}
      {validationMetadata && (
        <MetadataCard
          title="Résumé de validation"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          colorScheme={{
            bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
            border: 'border-indigo-200',
            icon: 'text-indigo-600'
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {validationMetadata.validationScore}%
              </div>
              <div className="text-sm text-neutral-600">Score de validation</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {validationMetadata.passedRules?.length || 0}
              </div>
              <div className="text-sm text-neutral-600">Règles respectées</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-600">
              Template: <span className="font-semibold">{validationMetadata.templateName}</span>
            </p>
          </div>
        </MetadataCard>
      )}

      {/* Technical details */}
      <MetadataCard
        title="Détails techniques et développeur"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        }
        colorScheme={{
          bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
          border: 'border-slate-200',
          icon: 'text-slate-600'
        }}
      >
        <TechnicalDetailsSection persona={persona} />
      </MetadataCard>
    </div>
  );
};