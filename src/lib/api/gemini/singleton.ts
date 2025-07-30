import { GeminiClient } from './client';
import { PromptType } from '@/lib/prompts/gemini-prompts';

// Instance singleton pour éviter les multiples initialisations
let geminiClient: GeminiClient | null = null;

/**
 * Obtient l'instance singleton du client Gemini
 */
export function getGeminiClient(promptType?: PromptType): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient(promptType);
  }
  return geminiClient;
}

/**
 * Réinitialise l'instance singleton (utile pour les tests)
 */
export function resetGeminiClient(): void {
  geminiClient = null;
}

/**
 * Vérifie si une instance singleton existe
 */
export function hasGeminiClient(): boolean {
  return geminiClient !== null;
}