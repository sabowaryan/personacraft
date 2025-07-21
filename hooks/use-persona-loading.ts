'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Persona } from '@/lib/types/persona';

interface LoadingStage {
    id: string;
    name: string;
    estimatedDuration: number;
    completed: boolean;
}

interface LoadingState {
    isLoading: boolean;
    currentStage: LoadingStage | null;
    progress: number;
    estimatedTimeRemaining: number;
    error: Error | null;
    stages: LoadingStage[];
}

interface UsePersonaLoadingOptions {
    stages?: Omit<LoadingStage, 'completed'>[];
    onStageComplete?: (stage: LoadingStage) => void;
    onLoadingComplete?: (persona: Persona) => void;
    onError?: (error: Error) => void;
}

const DEFAULT_STAGES: Omit<LoadingStage, 'completed'>[] = [
    { id: 'fetch', name: 'Récupération des données...', estimatedDuration: 1000 },
    { id: 'validate', name: 'Validation des informations...', estimatedDuration: 500 },
    { id: 'metrics', name: 'Calcul des métriques...', estimatedDuration: 800 },
    { id: 'render', name: 'Préparation de l\'affichage...', estimatedDuration: 700 },
];

export const usePersonaLoading = (options: UsePersonaLoadingOptions = {}) => {
    const {
        stages = DEFAULT_STAGES,
        onStageComplete,
        onLoadingComplete,
        onError,
    } = options;

    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: false,
        currentStage: null,
        progress: 0,
        estimatedTimeRemaining: 0,
        error: null,
        stages: stages.map(stage => ({ ...stage, completed: false })),
    });

    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);

    const calculateTotalDuration = useCallback(() => {
        return stages.reduce((total, stage) => total + stage.estimatedDuration, 0);
    }, [stages]);

    const updateProgress = useCallback(() => {
        setLoadingState(prev => {
            const completedStages = prev.stages.filter(stage => stage.completed);
            const completedDuration = completedStages.reduce((total, stage) => total + stage.estimatedDuration, 0);
            const totalDuration = calculateTotalDuration();
            const progress = Math.min((completedDuration / totalDuration) * 100, 100);

            const remainingDuration = totalDuration - completedDuration;
            const estimatedTimeRemaining = Math.max(remainingDuration, 0);

            return {
                ...prev,
                progress,
                estimatedTimeRemaining,
            };
        });
    }, [calculateTotalDuration]);

    const startLoading = useCallback(async (loadFunction?: () => Promise<Persona>) => {
        startTimeRef.current = Date.now();

        setLoadingState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            progress: 0,
            stages: prev.stages.map(stage => ({ ...stage, completed: false })),
        }));

        try {
            let stageIndex = 0;

            for (const stage of stages) {
                // Set current stage
                setLoadingState(prev => ({
                    ...prev,
                    currentStage: { ...stage, completed: false },
                }));

                // Simulate stage duration
                await new Promise(resolve => {
                    timeoutRef.current = setTimeout(resolve, stage.estimatedDuration);
                });

                // Mark stage as completed
                setLoadingState(prev => ({
                    ...prev,
                    stages: prev.stages.map((s, index) =>
                        index === stageIndex ? { ...s, completed: true } : s
                    ),
                }));

                onStageComplete?.({ ...stage, completed: true });
                updateProgress();
                stageIndex++;
            }

            // Execute the actual loading function if provided
            let result: Persona | undefined;
            if (loadFunction) {
                result = await loadFunction();
            }

            // Complete loading
            setLoadingState(prev => ({
                ...prev,
                isLoading: false,
                currentStage: null,
                progress: 100,
            }));

            if (result) {
                onLoadingComplete?.(result);
            }

            return result;
        } catch (error) {
            const err = error as Error;
            setLoadingState(prev => ({
                ...prev,
                isLoading: false,
                error: err,
                currentStage: null,
            }));

            onError?.(err);
            throw err;
        }
    }, [stages, onStageComplete, onLoadingComplete, onError, updateProgress]);

    const stopLoading = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setLoadingState(prev => ({
            ...prev,
            isLoading: false,
            currentStage: null,
        }));
    }, []);

    const resetLoading = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setLoadingState({
            isLoading: false,
            currentStage: null,
            progress: 0,
            estimatedTimeRemaining: 0,
            error: null,
            stages: stages.map(stage => ({ ...stage, completed: false })),
        });
    }, [stages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const totalDuration = calculateTotalDuration();

    return {
        ...loadingState,
        startLoading,
        stopLoading,
        resetLoading,
        totalDuration,
    };
};

// Hook for simulating persona data loading
export const usePersonaDataLoading = () => {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);

    const loadingHook = usePersonaLoading({
        onLoadingComplete: (persona) => {
            setCurrentPersona(persona);
            setPersonas(prev => [...prev, persona]);
        },
        onError: (error) => {
            console.error('Failed to load persona:', error);
        },
    });

    const loadPersona = useCallback(async (personaId: string) => {
        return loadingHook.startLoading(async () => {
            // Simulate API call
            const response = await fetch(`/api/personas/${personaId}`);
            if (!response.ok) {
                throw new Error(`Failed to load persona: ${response.statusText}`);
            }
            return response.json();
        });
    }, [loadingHook.startLoading]);

    const loadPersonaFromBrief = useCallback(async (brief: any) => {
        return loadingHook.startLoading(async () => {
            // Simulate persona generation
            const response = await fetch('/api/personas/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(brief),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate persona: ${response.statusText}`);
            }

            return response.json();
        });
    }, [loadingHook.startLoading]);

    return {
        ...loadingHook,
        personas,
        currentPersona,
        loadPersona,
        loadPersonaFromBrief,
        setCurrentPersona,
    };
};

// Hook for batch loading multiple personas
export const useBatchPersonaLoading = () => {
    const [batchState, setBatchState] = useState({
        isLoading: false,
        completed: 0,
        total: 0,
        currentPersona: null as string | null,
        errors: [] as { id: string; error: Error }[],
        results: [] as Persona[],
    });

    const loadPersonas = useCallback(async (personaIds: string[]) => {
        setBatchState({
            isLoading: true,
            completed: 0,
            total: personaIds.length,
            currentPersona: null,
            errors: [],
            results: [],
        });

        const results: Persona[] = [];
        const errors: { id: string; error: Error }[] = [];

        for (let i = 0; i < personaIds.length; i++) {
            const personaId = personaIds[i];

            setBatchState(prev => ({
                ...prev,
                currentPersona: personaId,
                completed: i,
            }));

            try {
                // Simulate loading delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                const response = await fetch(`/api/personas/${personaId}`);
                if (!response.ok) {
                    throw new Error(`Failed to load persona ${personaId}`);
                }

                const persona = await response.json();
                results.push(persona);
            } catch (error) {
                errors.push({ id: personaId, error: error as Error });
            }
        }

        setBatchState({
            isLoading: false,
            completed: personaIds.length,
            total: personaIds.length,
            currentPersona: null,
            errors,
            results,
        });

        return { results, errors };
    }, []);

    const resetBatch = useCallback(() => {
        setBatchState({
            isLoading: false,
            completed: 0,
            total: 0,
            currentPersona: null,
            errors: [],
            results: [],
        });
    }, []);

    return {
        ...batchState,
        loadPersonas,
        resetBatch,
        progress: batchState.total > 0 ? (batchState.completed / batchState.total) * 100 : 0,
    };
};