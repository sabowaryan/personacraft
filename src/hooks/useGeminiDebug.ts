import { useState, useCallback } from 'react';
import { PersonaValidator, PersonaValidationError } from '@/lib/validators/persona-validator';
import { Persona } from '@/types';

interface DebugResult {
  success: boolean;
  personas: Partial<Persona>[];
  errors: string[];
  rawResponse?: string;
  processingTime?: number;
}

export function useGeminiDebug() {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugHistory, setDebugHistory] = useState<DebugResult[]>([]);

  const debugParseResponse = useCallback(async (rawResponse: string, brief: string = 'Debug test'): Promise<DebugResult> => {
    setIsDebugging(true);
    const startTime = Date.now();

    try {
      const personas = PersonaValidator.parseGeminiResponse(rawResponse, brief);
      const processingTime = Date.now() - startTime;

      const result: DebugResult = {
        success: true,
        personas,
        errors: [],
        rawResponse,
        processingTime
      };

      setDebugHistory(prev => [result, ...prev.slice(0, 9)]); // Garder les 10 derniers
      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof PersonaValidationError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Erreur inconnue';

      const result: DebugResult = {
        success: false,
        personas: [],
        errors: [errorMessage],
        rawResponse,
        processingTime
      };

      setDebugHistory(prev => [result, ...prev.slice(0, 9)]);
      return result;

    } finally {
      setIsDebugging(false);
    }
  }, []);

  const testWithServer = useCallback(async (rawResponse: string, brief?: string): Promise<DebugResult> => {
    setIsDebugging(true);

    try {
      const response = await fetch('/api/test-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawResponse,
          brief: brief || 'Test via hook'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const result = data.result as DebugResult;
        setDebugHistory(prev => [result, ...prev.slice(0, 9)]);
        return result;
      } else {
        throw new Error(data.error || 'Erreur serveur');
      }

    } catch (error) {
      const result: DebugResult = {
        success: false,
        personas: [],
        errors: [error instanceof Error ? error.message : 'Erreur de connexion'],
        rawResponse
      };

      setDebugHistory(prev => [result, ...prev.slice(0, 9)]);
      return result;

    } finally {
      setIsDebugging(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setDebugHistory([]);
  }, []);

  const generateValidExample = useCallback(() => {
    return `[
      {
        "name": "Emma Rousseau",
        "age": 28,
        "occupation": "Product Manager",
        "location": "Nantes, France",
        "demographics": {
          "income": "45 000 - 55 000€/an",
          "education": "Master Management",
          "familyStatus": "En couple"
        },
        "psychographics": {
          "personality": ["Analytique", "Collaborative", "Innovante"],
          "values": ["Impact utilisateur", "Agilité", "Transparence"],
          "interests": ["Product design", "Data analysis", "Startups"],
          "lifestyle": "Professionnelle tech, équilibre vie privée/pro"
        },
        "painPoints": [
          "Priorisation des fonctionnalités difficile",
          "Communication entre équipes complexe",
          "Pression des deadlines"
        ],
        "goals": [
          "Améliorer la satisfaction utilisateur",
          "Optimiser les processus produit",
          "Développer une vision produit claire"
        ],
        "marketingInsights": {
          "preferredChannels": ["LinkedIn", "Product Hunt"],
          "messagingTone": "Data-driven et pragmatique",
          "buyingBehavior": "Évaluation basée sur les métriques"
        },
        "qualityScore": 90
      }
    ]`;
  }, []);

  return {
    isDebugging,
    debugHistory,
    debugParseResponse,
    testWithServer,
    clearHistory,
    generateValidExample
  };
}

export default useGeminiDebug;