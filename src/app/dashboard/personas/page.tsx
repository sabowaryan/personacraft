'use client';

import { useState, useEffect, useCallback } from 'react';
import { EnrichedPersona } from '@/types/enhanced-persona';
import BriefForm from '@/components/forms/BriefForm';
import { usePersona } from '@/hooks/use-persona';
import { useExport } from '@/hooks/use-export';
import { useStackSessions } from '@/hooks/use-stack-sessions';
import { PersonaMigration } from '@/components/personas/PersonaMigration';
import { EnhancedPersonaList } from '@/components/personas/EnhancedPersonaList';
import { DEFAULT_EXPORT_CONFIG } from '@/data/form-constants';

// Fonction utilitaire pour convertir les personas legacy vers le format enrichi
const convertToEnrichedPersona = (persona: any): EnrichedPersona => {
  // Vérifier si les métadonnées existent et ont un contenu valide
  const hasValidGenerationMetadata = persona.generationMetadata && 
    typeof persona.generationMetadata === 'object' && 
    persona.generationMetadata.source;

  const hasValidValidationMetadata = persona.validationMetadata && 
    typeof persona.validationMetadata === 'object' && 
    persona.validationMetadata.templateName;

  return {
    ...persona,
    // Ajouter les métadonnées par défaut seulement si elles n'existent pas ou sont invalides
    generationMetadata: hasValidGenerationMetadata ? persona.generationMetadata : {
      source: 'legacy-fallback' as const,
      method: 'legacy-import',
      culturalConstraintsUsed: [],
      processingTime: 0,
      qlooDataUsed: false,
      templateUsed: 'standard',
      fallbackReason: 'Legacy persona',
      generatedAt: new Date().toISOString()
    },
    validationMetadata: hasValidValidationMetadata ? persona.validationMetadata : {
      templateName: 'standard',
      validationScore: persona.qualityScore || 75,
      validationDetails: [],
      passedRules: [],
      failedRules: [],
      validationTime: 0,
      validatedAt: new Date().toISOString(),
      overallStatus: 'passed' as const,
      categoryScores: {
        format: 100,
        content: persona.qualityScore || 75,
        cultural: 50,
        demographic: 75
      }
    },
    culturalData: persona.culturalData || {}
  };
};

export default function PersonasPage() {
  // Utilisation des hooks existants
  const {
    personas,
    selectedPersona,
    isLoading,
    error,
    loadPersonas,
    addPersona,
    deletePersona: removePersona,
    selectPersona
  } = usePersona();

  const {
    exportPersonas,
    exportAll,
    isExporting,
    exportProgress
  } = useExport();

  const { incrementGenerations } = useStackSessions();

  // États locaux pour l'UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [goToLastStep, setGoToLastStep] = useState(false);

  // Conversion des personas vers le format enrichi
  const enrichedPersonas: EnrichedPersona[] = Array.isArray(personas) ? personas.map(convertToEnrichedPersona) : [];

  // Debug: afficher l'état des personas
  console.log('Debug PersonasPage:', {
    personas,
    personasLength: personas?.length,
    enrichedPersonasLength: enrichedPersonas.length,
    isArray: Array.isArray(personas)
  });

  // Charger les personas au montage et vérifier les données de template
  useEffect(() => {
    loadPersonas();

    // Vérifier si on doit ouvrir automatiquement le modal avec des données de template
    const autoOpenModal = sessionStorage.getItem('autoOpenModal');
    const templateDataStr = sessionStorage.getItem('templateData');
    const shouldGoToLastStep = sessionStorage.getItem('goToLastStep');

    if (autoOpenModal === 'true' && templateDataStr) {
      try {
        const parsedTemplateData = JSON.parse(templateDataStr);
        setTemplateData(parsedTemplateData);
        setGoToLastStep(shouldGoToLastStep === 'true');
        setShowModal(true);

        // Nettoyer le sessionStorage après utilisation
        sessionStorage.removeItem('autoOpenModal');
        sessionStorage.removeItem('templateData');
        sessionStorage.removeItem('goToLastStep');
      } catch (error) {
        console.error('Erreur lors du parsing des données de template:', error);
        // Nettoyer en cas d'erreur
        sessionStorage.removeItem('autoOpenModal');
        sessionStorage.removeItem('templateData');
        sessionStorage.removeItem('goToLastStep');
      }
    }
  }, [loadPersonas]);



  const generatePersonas = useCallback(async (formData: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const data = await response.json();

      if (data.personas && Array.isArray(data.personas)) {
        // Ajouter chaque nouveau persona via le hook avec les métadonnées de génération
        for (const personaData of data.personas) {
          // Préserver les métadonnées existantes et ajouter les nouvelles si nécessaire
          const enrichedPersonaData = {
            ...personaData,
            // Préserver generationMetadata existant ou utiliser les données de l'API
            generationMetadata: personaData.generationMetadata || {
              source: data.generation?.method === 'qloo-first' ? 'qloo-first' : 'legacy-fallback',
              method: data.generation?.method || 'unknown',
              culturalConstraintsUsed: data.culturalConstraints?.applied || [],
              processingTime: data.generation?.processingTime || 0,
              qlooDataUsed: data.sources?.culturalData === 'qloo',
              templateUsed: data.validation?.templateId || 'unknown',
              generatedAt: new Date().toISOString(),
              qlooApiCallsCount: data.performance?.qlooApiCalls || 0,
              cacheHitRate: data.performance?.cacheHitRate || 0,
              retryCount: data.validation?.retryCount || 0
            },
            // Métadonnées temporaires pour compatibilité
            metadata: {
              ...personaData.metadata,
              generationMethod: data.generation?.method || 'unknown',
              culturalDataSource: data.sources?.culturalData || 'unknown',
              templateUsed: data.validation?.templateId || 'unknown',
              processingTime: data.generation?.processingTime || 0,
              qlooConstraintsUsed: data.culturalConstraints?.applied || [],
              validationScore: data.validation?.score || 0,
              validationErrors: data.validation?.errorCount || 0,
              validationWarnings: data.validation?.warningCount || 0
            }
          };
          
          await addPersona(enrichedPersonaData);
        }

        // Incrémenter le compteur de générations
        incrementGenerations();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération des personas');
    } finally {
      setIsGenerating(false);
    }
  }, [addPersona, incrementGenerations]);

  const handleDeletePersona = useCallback(async (id: string) => {
    try {
      await removePersona(id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du persona');
    }
  }, [removePersona]);

  const handlePersonaSelect = useCallback((persona: EnrichedPersona | null) => {
    selectPersona(persona);
  }, [selectPersona]);

  const handleExportAll = useCallback(async () => {
    try {
      await exportAll({
        format: 'json',
        ...DEFAULT_EXPORT_CONFIG
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export');
    }
  }, [exportAll]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header avec actions principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Personas Marketing</h1>
          <p className="text-slate-600 mt-1">Gérez et analysez vos personas avec des outils avancés</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-persona-violet text-white rounded-lg hover:bg-persona-violet/90 transition-colors shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer des Personas
          </button>
          <button
            onClick={handleExportAll}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isExporting ? `Export... ${exportProgress}%` : 'Exporter Tout'}
          </button>
        </div>
      </div>

      {/* Migration des personas */}
      <PersonaMigration />

      

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* Liste des personas avec le nouveau composant */}
      <EnhancedPersonaList
        personas={enrichedPersonas}
        onPersonaSelect={handlePersonaSelect}
        onPersonaDelete={handleDeletePersona}
        selectedPersona={selectedPersona}
        showFilters={true}
        defaultSort={{ field: 'qualityScore', direction: 'desc' }}
        className="mt-8"
      />

      {/* Modal de création de personas */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Créer des Personas</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <BriefForm
                onSubmit={generatePersonas}
                isLoading={isGenerating}
                templateData={templateData}
                goToLastStep={goToLastStep}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}