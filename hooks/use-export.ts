'use client';

import { useState, useCallback } from 'react';
import { Persona } from '@/lib/types/persona';
import { exportToPDF, exportToCSV } from '@/lib/utils/export';
import { useUsageStats } from './use-local-storage';

export type ExportFormat = 'pdf' | 'csv';
export type ExportStatus = 'idle' | 'preparing' | 'generating' | 'downloading' | 'success' | 'error';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
  includeCharts?: boolean;
}

export interface ExportState {
  status: ExportStatus;
  progress: number;
  error: string | null;
  downloadUrl: string | null;
}

export interface UseExportReturn {
  exportState: ExportState;
  exportPersona: (persona: Persona, options?: Partial<ExportOptions>) => Promise<void>;
  exportPersonas: (personas: Persona[], options?: Partial<ExportOptions>) => Promise<void>;
  resetExportState: () => void;
  isExporting: boolean;
}

/**
 * Hook pour gérer l'export des personas
 * Supporte PDF et CSV avec suivi du progrès
 */
export function useExport(): UseExportReturn {
  const [exportState, setExportState] = useState<ExportState>({
    status: 'idle',
    progress: 0,
    error: null,
    downloadUrl: null
  });

  const { incrementExportsCreated } = useUsageStats();

  const updateProgress = useCallback((progress: number, status?: ExportStatus) => {
    setExportState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      ...(status && { status })
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setExportState(prev => ({
      ...prev,
      status: 'error',
      error,
      progress: 0
    }));
  }, []);

  const setSuccess = useCallback((downloadUrl?: string) => {
    setExportState(prev => ({
      ...prev,
      status: 'success',
      progress: 100,
      error: null,
      downloadUrl: downloadUrl || null
    }));
    incrementExportsCreated();
  }, [incrementExportsCreated]);

  const resetExportState = useCallback(() => {
    setExportState({
      status: 'idle',
      progress: 0,
      error: null,
      downloadUrl: null
    });
  }, []);

  const exportPersona = useCallback(async (
    persona: Persona, 
    options: Partial<ExportOptions> = {}
  ) => {
    const defaultOptions: ExportOptions = {
      format: 'pdf',
      filename: `${persona.name.replace(/\s+/g, '_')}_persona`,
      includeMetadata: true,
      includeCharts: false
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      setExportState({
        status: 'preparing',
        progress: 0,
        error: null,
        downloadUrl: null
      });

      updateProgress(10, 'preparing');

      // Simulation du temps de préparation
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(30, 'generating');

      if (finalOptions.format === 'pdf') {
        await exportToPDF(persona);
      } else {
        await exportToCSV([persona]);
      }

      updateProgress(90, 'downloading');

      // Simulation du téléchargement
      await new Promise(resolve => setTimeout(resolve, 300));

      setSuccess();

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue lors de l\'export');
    }
  }, [updateProgress, setError, setSuccess]);

  const exportPersonas = useCallback(async (
    personas: Persona[], 
    options: Partial<ExportOptions> = {}
  ) => {
    if (personas.length === 0) {
      setError('Aucun persona à exporter');
      return;
    }

    const defaultOptions: ExportOptions = {
      format: 'csv',
      filename: `personas_export_${new Date().toISOString().split('T')[0]}`,
      includeMetadata: true,
      includeCharts: false
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      setExportState({
        status: 'preparing',
        progress: 0,
        error: null,
        downloadUrl: null
      });

      updateProgress(10, 'preparing');

      // Simulation du temps de préparation
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(30, 'generating');

      // Export par batch pour les gros volumes
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < personas.length; i += batchSize) {
        batches.push(personas.slice(i, i + batchSize));
      }

      let processedCount = 0;

      for (const batch of batches) {
        if (finalOptions.format === 'pdf') {
          // Pour PDF, exporter chaque persona individuellement
          for (const persona of batch) {
            await exportToPDF(persona);
            processedCount++;
            updateProgress(30 + (processedCount / personas.length) * 50);
          }
        } else {
          // Pour CSV, exporter tout en une fois
          await exportToCSV(personas);
          processedCount = personas.length;
          updateProgress(80);
        }
      }

      updateProgress(90, 'downloading');

      // Simulation du téléchargement
      await new Promise(resolve => setTimeout(resolve, 300));

      setSuccess();

    } catch (error) {
      console.error('Erreur lors de l\'export multiple:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue lors de l\'export');
    }
  }, [updateProgress, setError, setSuccess]);

  return {
    exportState,
    exportPersona,
    exportPersonas,
    resetExportState,
    isExporting: ['preparing', 'generating', 'downloading'].includes(exportState.status)
  };
}

/**
 * Hook spécialisé pour l'export PDF
 */
export function usePDFExport() {
  const { exportPersona, exportPersonas, ...rest } = useExport();

  const exportPersonaToPDF = useCallback((persona: Persona, filename?: string) => {
    return exportPersona(persona, { 
      format: 'pdf', 
      filename,
      includeCharts: true 
    });
  }, [exportPersona]);

  const exportPersonasToPDF = useCallback((personas: Persona[], filename?: string) => {
    return exportPersonas(personas, { 
      format: 'pdf', 
      filename 
    });
  }, [exportPersonas]);

  return {
    ...rest,
    exportPersonaToPDF,
    exportPersonasToPDF
  };
}

/**
 * Hook spécialisé pour l'export CSV
 */
export function useCSVExport() {
  const { exportPersona, exportPersonas, ...rest } = useExport();

  const exportPersonaToCSV = useCallback((persona: Persona, filename?: string) => {
    return exportPersona(persona, { 
      format: 'csv', 
      filename,
      includeMetadata: true 
    });
  }, [exportPersona]);

  const exportPersonasToCSV = useCallback((personas: Persona[], filename?: string) => {
    return exportPersonas(personas, { 
      format: 'csv', 
      filename,
      includeMetadata: true 
    });
  }, [exportPersonas]);

  return {
    ...rest,
    exportPersonaToCSV,
    exportPersonasToCSV
  };
}

/**
 * Hook pour l'export par lot avec gestion des erreurs avancée
 */
export function useBatchExport() {
  const [batchState, setBatchState] = useState({
    totalItems: 0,
    processedItems: 0,
    failedItems: 0,
    errors: [] as string[]
  });

  const exportBatch = useCallback(async (
    personas: Persona[],
    format: ExportFormat = 'csv',
    options: {
      batchSize?: number;
      onProgress?: (progress: number) => void;
      onError?: (error: string, persona: Persona) => void;
    } = {}
  ) => {
    const { batchSize = 5, onProgress, onError } = options;

    setBatchState({
      totalItems: personas.length,
      processedItems: 0,
      failedItems: 0,
      errors: []
    });

    const results = [];
    const errors = [];

    for (let i = 0; i < personas.length; i += batchSize) {
      const batch = personas.slice(i, i + batchSize);
      
      for (const persona of batch) {
        try {
          if (format === 'pdf') {
            await exportToPDF(persona);
          } else {
            await exportToCSV([persona]);
          }
          
          results.push(persona);
          
          setBatchState(prev => ({
            ...prev,
            processedItems: prev.processedItems + 1
          }));

          onProgress?.(((i + batch.indexOf(persona) + 1) / personas.length) * 100);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          errors.push(errorMessage);
          
          setBatchState(prev => ({
            ...prev,
            failedItems: prev.failedItems + 1,
            errors: [...prev.errors, errorMessage]
          }));

          onError?.(errorMessage, persona);
        }
      }

      // Pause entre les batches pour éviter la surcharge
      if (i + batchSize < personas.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return {
      successful: results,
      failed: errors,
      summary: {
        total: personas.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }, []);

  return {
    batchState,
    exportBatch
  };
}