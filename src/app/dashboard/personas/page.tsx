'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Persona } from '@/types';
import BriefForm from '@/components/forms/BriefForm';
import { usePersona } from '@/hooks/use-persona';
import { useExport } from '@/hooks/use-export';
import { useStackSessions } from '@/hooks/use-stack-sessions';
import { PersonaMigration } from '@/components/personas/PersonaMigration';
import { FILTER_OPTIONS, SORT_OPTIONS, DEFAULT_EXPORT_CONFIG } from '@/data/form-constants';

// Constants moved to separate file for better bundle optimization

// Composant optimisé pour le badge de score de qualité
const QualityScoreBadge = ({ score }: { score: number }) => {
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

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm ring-1 ${config.bg} ${config.text} ${config.ring}`}>
      {config.icon}
      <span className="ml-2">{score}%</span>
    </div>
  );
};

export default function PersonasPage() {
  // Utilisation des nouveaux hooks
  const {
    personas,
    selectedPersona,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'age'>('score');
  const [showModal, setShowModal] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [goToLastStep, setGoToLastStep] = useState(false);

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

  // Filtrage et tri optimisé avec useMemo
  const sortedPersonas = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();

    return personas
      .filter(persona => {
        const matchesSearch = persona.name.toLowerCase().includes(searchLower) ||
          persona.occupation.toLowerCase().includes(searchLower);

        const matchesFilter = filterBy === 'all' ||
          (filterBy === 'high' && persona.qualityScore >= 90) ||
          (filterBy === 'medium' && persona.qualityScore >= 75 && persona.qualityScore < 90) ||
          (filterBy === 'low' && persona.qualityScore < 75);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'score':
            return b.qualityScore - a.qualityScore;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'age':
            return a.age - b.age;
          default:
            return 0;
        }
      });
  }, [personas, searchQuery, filterBy, sortBy]);

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
        // Ajouter chaque nouveau persona via le hook
        for (const personaData of data.personas) {
          await addPersona(personaData);
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

  const handleExportJSON = useCallback(async (personasToExport: Persona[]) => {
    try {
      await exportPersonas(personasToExport, {
        format: 'json',
        ...DEFAULT_EXPORT_CONFIG
      });
    } catch (error) {
      console.error('Erreur lors de l\'export JSON:', error);
      alert('Erreur lors de l\'export JSON');
    }
  }, [exportPersonas]);

  const handleExportCSV = useCallback(async (personasToExport: Persona[]) => {
    try {
      await exportPersonas(personasToExport, {
        format: 'csv',
        ...DEFAULT_EXPORT_CONFIG
      });
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      alert('Erreur lors de l\'export CSV');
    }
  }, [exportPersonas]);

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
      {/* Actions principales */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-persona-violet text-white rounded-lg hover:bg-persona-violet/90 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Créer des Personas
        </button>
        <button
          onClick={handleExportAll}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? `Export... ${exportProgress}%` : 'Exporter Tout'}
        </button>
      </div>

      {/* Migration des personas */}
      <PersonaMigration />



      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher un persona..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>
        <div className="flex space-x-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet bg-white"
          >
            {FILTER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet bg-white"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Personas List */}
      {sortedPersonas.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            {searchQuery ? 'Aucun persona trouvé' : 'Aucun persona créé'}
          </h3>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? 'Essayez de modifier votre recherche ou vos filtres.'
              : 'Commencez par décrire votre projet pour générer vos premiers personas marketing'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sortedPersonas.map((persona) => (
            <div key={persona.id} className="group bg-white border border-slate-200/80 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:border-persona-violet/20 transition-all duration-300 hover:-translate-y-1">
              {/* Header avec avatar et score */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-persona-violet/10 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <svg className="w-8 h-8 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-persona-violet transition-colors">{persona.name}</h3>
                    <p className="text-slate-600 font-medium mb-2">{persona.occupation}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                        </svg>
                        {persona.age} ans
                      </span>
                      <span className="flex items-center min-w-0">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{persona.location}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 self-start">
                  <QualityScoreBadge score={persona.qualityScore} />
                </div>
              </div>

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

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/personas/${persona.id}`}
                  className="flex-1 min-w-0 px-4 py-3 bg-gradient-to-r from-persona-violet to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-persona-violet/90 hover:to-purple-600/90 transition-all duration-200 inline-flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Voir détails</span>
                </Link>

                <button
                  onClick={() => selectPersona(selectedPersona?.id === persona.id ? null : persona)}
                  className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors inline-flex items-center space-x-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedPersona?.id === persona.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                  <span className="hidden sm:inline">{selectedPersona?.id === persona.id ? 'Masquer' : 'Aperçu'}</span>
                </button>

                <button
                  onClick={() => handleDeletePersona(persona.id)}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors inline-flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Supprimer</span>
                </button>
              </div>

              {selectedPersona?.id === persona.id && (
                <div className="mt-8 pt-8 border-t border-slate-200 animate-in slide-in-from-top-2 duration-300">
                  {/* Sections Bio et Citation améliorées */}
                  {(persona.bio || persona.quote) && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {persona.bio && (
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50/80 rounded-xl p-4 border border-slate-200/60 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-slate-900">Biographie</h4>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{persona.bio}</p>
                        </div>
                      )}

                      {persona.quote && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50/80 rounded-xl p-4 border border-indigo-200/60 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-indigo-900">Citation</h4>
                          </div>
                          <blockquote className="text-sm text-indigo-800 italic leading-relaxed">
                            <span className="text-lg text-indigo-400 leading-none">"</span>
                            {persona.quote}
                            <span className="text-lg text-indigo-400 leading-none">"</span>
                          </blockquote>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grille principale des informations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Colonne gauche */}
                    <div className="space-y-4">
                      {/* Démographiques */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50/80 rounded-xl p-4 border border-blue-200/60 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-slate-900">Démographiques</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/60 rounded-lg">
                            <span className="text-slate-600 font-medium flex items-center text-sm">
                              <svg className="w-3 h-3 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              Revenus
                            </span>
                            <span className="text-slate-900 font-semibold text-sm">{persona.demographics?.income || 'Non spécifié'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/60 rounded-lg">
                            <span className="text-slate-600 font-medium flex items-center text-sm">
                              <svg className="w-3 h-3 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Éducation
                            </span>
                            <span className="text-slate-900 font-semibold text-sm">{persona.demographics?.education || 'Non spécifié'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/60 rounded-lg">
                            <span className="text-slate-600 font-medium flex items-center text-sm">
                              <svg className="w-3 h-3 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Situation familiale
                            </span>
                            <span className="text-slate-900 font-semibold text-sm">{persona.demographics?.familyStatus || 'Non spécifié'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Psychographiques */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50/80 rounded-xl p-4 border border-purple-200/60 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-slate-900">Psychographiques</h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-slate-700 font-semibold mb-2 text-sm flex items-center">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                              Personnalité
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {persona.psychographics?.personality && persona.psychographics.personality.length > 0 ? (
                                persona.psychographics.personality.map((trait: string, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                                    {trait}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 text-xs italic">Non défini</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-slate-700 font-semibold mb-2 text-sm flex items-center">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                              Valeurs
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {persona.psychographics?.values && persona.psychographics.values.length > 0 ? (
                                persona.psychographics.values.map((value, index) => (
                                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                                    {value}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 text-xs italic">Non défini</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-slate-700 font-semibold mb-2 text-sm flex items-center">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                              Intérêts
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {persona.psychographics?.interests && persona.psychographics.interests.length > 0 ? (
                                persona.psychographics.interests.map((interest, index) => (
                                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                                    {interest}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 text-xs italic">Non défini</span>
                              )}
                            </div>
                          </div>
                          {persona.psychographics?.lifestyle && (
                            <div className="p-3 bg-white/60 rounded-lg">
                              <h5 className="text-slate-700 font-semibold mb-1 text-sm flex items-center">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                                Style de vie
                              </h5>
                              <p className="text-slate-900 text-sm">{persona.psychographics.lifestyle}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Colonne droite */}
                    <div className="space-y-4">
                      {/* Points de douleur */}
                      <div className="bg-gradient-to-br from-red-50 to-rose-50/80 rounded-xl p-4 border border-red-200/60 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-slate-900">Points de Douleur</h4>
                        </div>
                        <div className="space-y-2">
                          {persona.painPoints.map((point, index) => (
                            <div key={index} className="flex items-start p-3 bg-white/60 rounded-lg">
                              <div className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-slate-700 text-sm leading-relaxed">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Objectifs */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50/80 rounded-xl p-4 border border-green-200/60 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-slate-900">Objectifs</h4>
                        </div>
                        <div className="space-y-3">
                          {persona.goals.map((goal, index) => (
                            <div key={index} className="flex items-start p-4 bg-white/60 rounded-xl">
                              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-slate-700 font-medium leading-relaxed">{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights Marketing améliorés */}
                  {persona.marketingInsights?.messagingTone && (
                    <div className="mb-8 bg-gradient-to-br from-orange-50 to-amber-50/80 rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-orange-200 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Insights Marketing</h4>
                      </div>
                      <div className="bg-white/60 rounded-xl p-5">
                        <p className="text-slate-700 leading-relaxed font-medium">{persona.marketingInsights.messagingTone}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions d'export améliorées */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50/80 rounded-2xl p-6 border border-slate-200/60">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Actions d'Export
                    </h4>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={() => handleExportJSON([persona])}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Exporter JSON</span>
                      </button>
                      <button
                        onClick={() => handleExportCSV([persona])}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                        </svg>
                        <span>Exporter CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de génération */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-50">
              <h2 className="text-xl font-bold text-neutral-900">
                {templateData ? 'Template - Créer des Personas' : 'Créer des Personas'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTemplateData(null);
                  setGoToLastStep(false);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
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