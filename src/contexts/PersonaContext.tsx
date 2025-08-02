'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { Persona } from '@/types';
import { PersonaManager } from '@/lib/session';
import { validateAndCleanPersona } from '@/lib/persona-utils';
import { handleApiResponse, isAuthTimeoutError, getErrorMessage } from '@/lib/client-error-utils';
import { shouldBypassAuth } from '@/lib/feature-flags';

interface PersonaContextType {
  personas: Persona[];
  loading: boolean;
  error: string | null;
  refreshPersonas: () => Promise<void>;
  addPersona: (persona: Persona) => Promise<void>;
  updatePersona: (id: string, updates: Partial<Persona>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  generatePersonas: (formData: any) => Promise<Persona[]>;
  isGenerating: boolean;
  generationProgress: { step: string; progress: number } | null;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: ReactNode;
}

export function PersonaProvider({ children }: PersonaProviderProps) {
  const bypassAuth = shouldBypassAuth();
  // En mode développement sans auth, forcer user à null
  const user = null;
  
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDatabase, setUseDatabase] = useState(!bypassAuth);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ step: string; progress: number } | null>(null);

  // Memoize personas to prevent unnecessary re-renders
  const memoizedPersonas = useMemo(() => personas, [personas]);

  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching personas...');
      console.log('📡 Bypass Auth:', bypassAuth);
      console.log('📡 Use Database:', useDatabase);
      console.log('📡 User:', user);

      if (useDatabase && (user || bypassAuth)) {
        // Charger depuis la base de données
        console.log('📡 Fetching personas from API...');
        const response = await fetch('/api/personas');
        console.log('📡 API Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const apiResponse = await handleApiResponse<any>(response);
        console.log('📡 Full API Response:', apiResponse);

        // L'API retourne un objet avec une propriété personas
        const loadedPersonas = apiResponse.personas || apiResponse;
        console.log('✅ Loaded personas from API:', loadedPersonas.length);
        setPersonas(loadedPersonas);
      } else {
        // Fallback vers localStorage
        console.log('💾 Falling back to localStorage');
        const loadedPersonas = PersonaManager.getPersonas();
        console.log('💾 Loaded personas from localStorage:', loadedPersonas.length);
        setPersonas(loadedPersonas);
      }
    } catch (err) {
      if (isAuthTimeoutError(err)) {
        setError('La connexion a pris trop de temps. Veuillez réessayer.');
      } else {
        setError(getErrorMessage(err));
      }

      // En cas d'erreur avec la DB, essayer localStorage
      if (useDatabase) {
        try {
          const loadedPersonas = PersonaManager.getPersonas();
          setPersonas(loadedPersonas);
          setUseDatabase(false); // Basculer vers localStorage
        } catch (localErr) {
          console.error('Erreur localStorage aussi:', localErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [bypassAuth, useDatabase, user]);

  const refreshPersonas = useCallback(async () => {
    await fetchPersonas();
  }, [fetchPersonas]);

  const addPersona = useCallback(async (persona: Persona) => {
    setLoading(true);
    setError(null);

    try {
      const cleanedPersona = validateAndCleanPersona(persona);

      if (useDatabase && (user || bypassAuth)) {
        // Sauvegarder en base de données
        const response = await fetch('/api/personas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedPersona)
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la création du persona');
        }

        const newPersona = await response.json();
        setPersonas(prev => [newPersona, ...prev]);
      } else {
        // Fallback vers localStorage
        PersonaManager.addPersona(cleanedPersona);
        setPersonas(prev => [...prev, cleanedPersona]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bypassAuth, useDatabase, user]);

  const updatePersona = useCallback(async (id: string, updates: Partial<Persona>) => {
    setLoading(true);
    setError(null);

    try {
      if (useDatabase && (user || bypassAuth)) {
        // Mettre à jour en base de données
        const response = await fetch(`/api/personas/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du persona');
        }

        const updatedPersona = await response.json();
        setPersonas(prev => prev.map(p =>
          p.id === id ? updatedPersona : p
        ));
      } else {
        // Fallback vers localStorage
        PersonaManager.updatePersona(id, updates);
        setPersonas(prev => prev.map(p =>
          p.id === id ? { ...p, ...updates } : p
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bypassAuth, useDatabase, user]);

  const deletePersona = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      if (useDatabase && (user || bypassAuth)) {
        // Supprimer de la base de données
        const response = await fetch(`/api/personas/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du persona');
        }

        setPersonas(prev => prev.filter(p => p.id !== id));
      } else {
        // Fallback vers localStorage
        PersonaManager.deletePersona(id);
        setPersonas(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bypassAuth, useDatabase, user]);

  const generatePersonas = useCallback(async (formData: any): Promise<Persona[]> => {
    setIsGenerating(true);
    setGenerationProgress({ step: 'Initialisation', progress: 0 });
    setError(null);

    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      setGenerationProgress({ step: 'Extraction des signaux', progress: 10 });

      const response = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          optimizations: {
            enableCaching: true,
            batchRequests: true,
            prioritizeRequests: true,
            maxRetries: 2,
            timeout: 8000
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response for progress updates
      if (response.headers.get('content-type')?.includes('text/stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalResult: Persona[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'progress') {
                    setGenerationProgress({ step: data.step, progress: data.progress });
                  } else if (data.type === 'complete') {
                    finalResult = data.personas;
                  }
                } catch (e) {
                  console.warn('Failed to parse SSE data:', line);
                }
              }
            }
          }
        }

        if (finalResult.length > 0) {
          setPersonas(prev => [...finalResult, ...prev]);
          return finalResult;
        }
      }

      // Fallback to regular JSON response
      setGenerationProgress({ step: 'Finalisation', progress: 90 });
      const result = await response.json();
      const newPersonas = result.personas || result;

      if (Array.isArray(newPersonas) && newPersonas.length > 0) {
        setPersonas(prev => [...newPersonas, ...prev]);
        setGenerationProgress({ step: 'Terminé', progress: 100 });
        return newPersonas;
      } else {
        throw new Error('Aucun persona généré');
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('La génération a pris trop de temps. Veuillez réessayer avec moins de personas.');
      } else {
        setError(getErrorMessage(err));
      }
      throw err;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const value: PersonaContextType = {
    personas: memoizedPersonas,
    loading,
    error,
    refreshPersonas,
    addPersona,
    updatePersona,
    deletePersona,
    generatePersonas,
    isGenerating,
    generationProgress,
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersonaContext() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersonaContext must be used within a PersonaProvider');
  }
  return context;
}