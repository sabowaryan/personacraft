// Export principal du module Gemini
export { GeminiClient } from './client';
export { getGeminiClient, resetGeminiClient, hasGeminiClient } from './singleton';
export { getFallbackPersonas, generateCustomFallbackPersona } from './fallback';

// Re-export des types et utilitaires liés aux prompts
export type { PromptType } from '@/lib/prompts/gemini-prompts';
export { PROMPTS, PromptManager, DEFAULT_PROMPT_VARIABLES } from '@/lib/prompts/gemini-prompts';