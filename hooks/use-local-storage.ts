'use client';

import { useState, useEffect, useCallback } from 'react';

// Types pour le hook localStorage
export interface UseLocalStorageOptions {
  serializer?: {
    read: (value: string) => any;
    write: (value: any) => string;
  };
  initializeWithValue?: boolean;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prevValue: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: Error | null;
}

// Sérialiseur par défaut
const defaultSerializer = {
  read: (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  write: (value: any) => JSON.stringify(value)
};

/**
 * Hook pour gérer le localStorage avec TypeScript
 * Gère la sérialisation, les erreurs et la synchronisation
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = defaultSerializer,
    initializeWithValue = true
  } = options;

  const [value, setValue] = useState<T>(() => {
    if (!initializeWithValue) return initialValue;

    try {
      if (typeof window === 'undefined') return initialValue;
      
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      
      return serializer.read(item);
    } catch (error) {
      console.warn(`Erreur lors de la lecture de localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour mettre à jour la valeur
  const setStoredValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    setIsLoading(true);
    setError(null);

    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prevValue: T) => T)(value)
        : newValue;

      setValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serializer.write(valueToStore));
      }

      // Déclencher un événement personnalisé pour synchroniser les onglets
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      console.error(`Erreur lors de l'écriture dans localStorage pour la clé "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, serializer, value]);

  // Fonction pour supprimer la valeur
  const removeValue = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      setValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }

      // Déclencher un événement personnalisé
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      console.error(`Erreur lors de la suppression de localStorage pour la clé "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  // Écouter les changements de localStorage (synchronisation entre onglets)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(serializer.read(e.newValue));
        } catch (error) {
          console.warn(`Erreur lors de la synchronisation localStorage pour la clé "${key}":`, error);
        }
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setValue(e.detail.value ?? initialValue);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('local-storage-change', handleCustomStorageChange as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage-change', handleCustomStorageChange as EventListener);
      }
    };
  }, [key, serializer, initialValue]);

  return {
    value,
    setValue: setStoredValue,
    removeValue,
    isLoading,
    error
  };
}

// Hook spécialisé pour les personas
export function usePersonasStorage() {
  return useLocalStorage('personacraft-personas', [], {
    serializer: {
      read: (value: string) => {
        try {
          const parsed = JSON.parse(value);
          // Convertir les dates string en objets Date
          return parsed.map((persona: any) => ({
            ...persona,
            generatedAt: new Date(persona.generatedAt)
          }));
        } catch {
          return [];
        }
      },
      write: (value: any[]) => JSON.stringify(value)
    }
  });
}

// Hook pour les préférences utilisateur
export function useUserPreferences() {
  const defaultPreferences = {
    theme: 'light' as 'light' | 'dark',
    language: 'fr' as 'fr' | 'en',
    exportFormat: 'pdf' as 'pdf' | 'csv',
    autoSave: true,
    showTutorial: true,
    analyticsEnabled: true
  };

  return useLocalStorage('personacraft-preferences', defaultPreferences);
}

// Hook pour l'historique des briefs
export function useBriefHistory() {
  const defaultHistory: any[] = [];
  
  const { value: history, setValue: setHistory } = useLocalStorage(
    'personacraft-brief-history', 
    defaultHistory
  );

  const addBrief = useCallback((brief: any) => {
    const briefWithTimestamp = {
      ...brief,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setHistory((prev: any[]) => {
      const updated = [briefWithTimestamp, ...prev];
      // Garder seulement les 10 derniers briefs
      return updated.slice(0, 10);
    });
  }, [setHistory]);

  const removeBrief = useCallback((briefId: string) => {
    setHistory((prev: any[]) => prev.filter((brief: any) => brief.id !== briefId));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    history,
    addBrief,
    removeBrief,
    clearHistory
  };
}

// Hook pour les statistiques d'utilisation
export function useUsageStats() {
  const defaultStats = {
    personasGenerated: 0,
    exportsCreated: 0,
    lastUsed: null as string | null,
    favoriteAgeRange: null as string | null,
    favoriteInterests: [] as string[]
  };

  const { value: stats, setValue: setStats } = useLocalStorage(
    'personacraft-usage-stats',
    defaultStats
  );

  const incrementPersonasGenerated = useCallback((count: number = 1) => {
    setStats(prev => ({
      ...prev,
      personasGenerated: prev.personasGenerated + count,
      lastUsed: new Date().toISOString()
    }));
  }, [setStats]);

  const incrementExportsCreated = useCallback(() => {
    setStats(prev => ({
      ...prev,
      exportsCreated: prev.exportsCreated + 1
    }));
  }, [setStats]);

  const updateFavoriteAgeRange = useCallback((ageRange: string) => {
    setStats(prev => ({
      ...prev,
      favoriteAgeRange: ageRange
    }));
  }, [setStats]);

  const addFavoriteInterest = useCallback((interest: string) => {
    setStats(prev => {
      const interests = [...prev.favoriteInterests];
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
      return {
        ...prev,
        favoriteInterests: interests.slice(0, 10) // Limiter à 10
      };
    });
  }, [setStats]);

  return {
    stats,
    incrementPersonasGenerated,
    incrementExportsCreated,
    updateFavoriteAgeRange,
    addFavoriteInterest
  };
}