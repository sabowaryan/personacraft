'use client';

import { useState, useCallback, useEffect } from 'react';
import { Persona, BriefFormData } from '@/lib/types/persona';
import { generateMultiplePersonas } from '@/lib/utils/persona-generator';
import { usePersonasStorage, useUsageStats, useBriefHistory } from './use-local-storage';

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
}

export interface UsePersonaGenerationReturn {
  personas: Persona[];
  generationState: GenerationState;
  generatePersonas: (brief: BriefFormData) => Promise<void>;
  clearPersonas: () => void;
  addPersona: (persona: Persona) => void;
  removePersona: (personaId: string) => void;
  updatePersona: (personaId: string, updates: Partial<Persona>) => void;
  getPersonaById: (personaId: string) => Persona | undefined;
  savePersonas: () => void;
  loadPersonas: () => void;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Hook principal pour la gestion des personas
 * Intègre génération, stockage local et gestion d'état
 */
export function usePersonaGeneration(): UsePersonaGenerationReturn {
  // État local des personas
  const [personas, setPersonas] = useState<Persona[]>([]);
  
  // État de génération
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    error: null
  });

  // Hooks pour la persistance et les statistiques
  const { value: storedPersonas, setValue: setStoredPersonas } = usePersonasStorage();
  const { incrementPersonasGenerated, updateFavoriteAgeRange, addFavoriteInterest } = useUsageStats();
  const { addBrief } = useBriefHistory();

  // Charger les personas depuis le localStorage au montage
  useEffect(() => {
    if (storedPersonas && storedPersonas.length > 0) {
      setPersonas(storedPersonas);
    }
  }, [storedPersonas]);

  // Fonction pour mettre à jour l'état de génération
  const updateGenerationState = useCallback((updates: Partial<GenerationState>) => {
    setGenerationState(prev => ({ ...prev, ...updates }));
  }, []);

  // Fonction principale de génération
  const generatePersonas = useCallback(async (brief: BriefFormData) => {
    try {
      // Initialiser l'état de génération
      updateGenerationState({
        isGenerating: true,
        progress: 0,
        currentStep: 'Préparation de la génération...',
        error: null
      });

      // Étape 1: Validation du brief
      updateGenerationState({
        progress: 10,
        currentStep: 'Validation des données...'
      });

      if (!brief.description || brief.interests.length === 0 || brief.values.length === 0) {
        throw new Error('Données du brief incomplètes');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Étape 2: Appel aux APIs externes (simulation)
      updateGenerationState({
        progress: 30,
        currentStep: 'Récupération des données culturelles...'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 3: Génération des personas
      updateGenerationState({
        progress: 60,
        currentStep: 'Génération des personas avec IA...'
      });

      const count = brief.generateMultiple ? 3 : 1;
      const newPersonas = generateMultiplePersonas(brief, count);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Étape 4: Post-traitement
      updateGenerationState({
        progress: 90,
        currentStep: 'Finalisation...'
      });

      // Ajouter les nouveaux personas
      setPersonas(prev => [...prev, ...newPersonas]);

      // Sauvegarder dans localStorage
      setStoredPersonas(prev => [...prev, ...newPersonas]);

      // Mettre à jour les statistiques
      incrementPersonasGenerated(newPersonas.length);
      updateFavoriteAgeRange(brief.ageRange);
      brief.interests.forEach(interest => addFavoriteInterest(interest));

      // Sauvegarder le brief dans l'historique
      addBrief(brief);

      // Finaliser
      updateGenerationState({
        progress: 100,
        currentStep: 'Génération terminée!',
        isGenerating: false
      });

      // Reset après un délai
      setTimeout(() => {
        updateGenerationState({
          progress: 0,
          currentStep: '',
          error: null
        });
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      updateGenerationState({
        isGenerating: false,
        progress: 0,
        currentStep: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération'
      });
    }
  }, [updateGenerationState, setStoredPersonas, incrementPersonasGenerated, updateFavoriteAgeRange, addFavoriteInterest, addBrief]);

  // Fonction pour vider les personas
  const clearPersonas = useCallback(() => {
    setPersonas([]);
    setStoredPersonas([]);
    updateGenerationState({
      isGenerating: false,
      progress: 0,
      currentStep: '',
      error: null
    });
  }, [setStoredPersonas, updateGenerationState]);

  // Fonction pour ajouter un persona
  const addPersona = useCallback((persona: Persona) => {
    setPersonas(prev => [...prev, persona]);
    setStoredPersonas(prev => [...prev, persona]);
  }, [setStoredPersonas]);

  // Fonction pour supprimer un persona
  const removePersona = useCallback((personaId: string) => {
    setPersonas(prev => prev.filter(p => p.id !== personaId));
    setStoredPersonas(prev => prev.filter(p => p.id !== personaId));
  }, [setStoredPersonas]);

  // Fonction pour mettre à jour un persona
  const updatePersona = useCallback((personaId: string, updates: Partial<Persona>) => {
    const updateFn = (personas: Persona[]) => 
      personas.map(p => p.id === personaId ? { ...p, ...updates } : p);
    
    setPersonas(updateFn);
    setStoredPersonas(updateFn);
  }, [setStoredPersonas]);

  // Fonction pour récupérer un persona par ID
  const getPersonaById = useCallback((personaId: string) => {
    return personas.find(p => p.id === personaId);
  }, [personas]);

  // Fonction pour sauvegarder manuellement
  const savePersonas = useCallback(() => {
    setStoredPersonas(personas);
  }, [personas, setStoredPersonas]);

  // Fonction pour charger manuellement
  const loadPersonas = useCallback(() => {
    if (storedPersonas) {
      setPersonas(storedPersonas);
    }
  }, [storedPersonas]);

  return {
    personas,
    generationState,
    generatePersonas,
    clearPersonas,
    addPersona,
    removePersona,
    updatePersona,
    getPersonaById,
    savePersonas,
    loadPersonas,
    isGenerating: generationState.isGenerating,
    error: generationState.error
  };
}

/**
 * Hook pour la génération en temps réel avec WebSocket (simulation)
 */
export function useRealtimeGeneration() {
  const [isConnected, setIsConnected] = useState(false);
  const [generationQueue, setGenerationQueue] = useState<BriefFormData[]>([]);

  const connectToGenerationService = useCallback(() => {
    // Simulation d'une connexion WebSocket
    setIsConnected(true);
    console.log('Connecté au service de génération en temps réel');
  }, []);

  const disconnectFromGenerationService = useCallback(() => {
    setIsConnected(false);
    console.log('Déconnecté du service de génération');
  }, []);

  const queueGeneration = useCallback((brief: BriefFormData) => {
    setGenerationQueue(prev => [...prev, brief]);
  }, []);

  return {
    isConnected,
    generationQueue,
    connectToGenerationService,
    disconnectFromGenerationService,
    queueGeneration
  };
}

/**
 * Hook pour la validation des personas
 */
export function usePersonaValidation() {
  const validatePersona = useCallback((persona: Persona): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!persona.name || persona.name.length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!persona.age || persona.age < 16 || persona.age > 100) {
      errors.push('L\'âge doit être entre 16 et 100 ans');
    }

    if (!persona.location || persona.location.length < 2) {
      errors.push('La localisation est requise');
    }

    if (!persona.bio || persona.bio.length < 10) {
      errors.push('La biographie doit contenir au moins 10 caractères');
    }

    if (!persona.values || persona.values.length === 0) {
      errors.push('Au moins une valeur est requise');
    }

    if (!persona.quote || persona.quote.length < 10) {
      errors.push('La citation doit contenir au moins 10 caractères');
    }

    // Validation des intérêts
    const totalInterests = Object.values(persona.interests).flat().length;
    if (totalInterests === 0) {
      errors.push('Au moins un centre d\'intérêt est requis');
    }

    // Validation de la communication
    if (!persona.communication.preferredChannels || persona.communication.preferredChannels.length === 0) {
      errors.push('Au moins un canal de communication est requis');
    }

    // Validation du marketing
    if (!persona.marketing.painPoints || persona.marketing.painPoints.length === 0) {
      errors.push('Au moins un point de douleur est requis');
    }

    if (!persona.marketing.motivations || persona.marketing.motivations.length === 0) {
      errors.push('Au moins une motivation est requise');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validatePersonas = useCallback((personas: Persona[]) => {
    return personas.map(persona => ({
      persona,
      validation: validatePersona(persona)
    }));
  }, [validatePersona]);

  return {
    validatePersona,
    validatePersonas
  };
}