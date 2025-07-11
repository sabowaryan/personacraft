'use client';

import { useState, useCallback } from 'react';
import { Persona, BriefFormData } from '../lib/types/persona';
import { generateMultiplePersonas } from '../lib/utils/persona-generator';

export function usePersonaGeneration() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePersonas = useCallback(async (brief: BriefFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const count = brief.generateMultiple ? 3 : 1;
      const newPersonas = generateMultiplePersonas(brief, count);
      
      setPersonas(newPersonas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearPersonas = useCallback(() => {
    setPersonas([]);
    setError(null);
  }, []);

  return {
    personas,
    isGenerating,
    error,
    generatePersonas,
    clearPersonas
  };
}