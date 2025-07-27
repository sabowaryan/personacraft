/**
 * Script de test pour le système de prompts Gemini
 * Usage: node src/scripts/test-prompt-system.js
 */

const { PromptManager, PROMPTS, DEFAULT_PROMPT_VARIABLES } = require('../lib/prompts/gemini-prompts.ts');

console.log('🧪 Test du système de prompts Gemini\n');

// Test 1: Lister tous les prompts disponibles
console.log('📋 Prompts disponibles:');
const allPrompts = PromptManager.getAllPrompts();
allPrompts.forEach(prompt => {
  console.log(`  - ${prompt.id} (${prompt.name}) - v${prompt.version}`);
});
console.log('');

// Test 2: Construire un prompt avec le template par défaut
console.log('🔨 Construction d\'un prompt par défaut:');
const testBrief = "Lancement d'une application mobile de fitness pour les professionnels urbains actifs qui manquent de temps pour aller en salle de sport.";

const defaultPrompt = PromptManager.buildPrompt(PROMPTS.DEFAULT, testBrief);
console.log('Brief:', testBrief);
console.log('Longueur du prompt généré:', defaultPrompt.length, 'caractères');
console.log('Extrait du prompt:');
console.log(defaultPrompt.substring(0, 200) + '...\n');

// Test 3: Construire un prompt avec des variables personnalisées
console.log('⚙️ Construction avec variables personnalisées:');
const customVariables = {
  personaCount: 3,
  minAge: 30,
  maxAge: 50,
  personalityTraitCount: 5
};

const customPrompt = PromptManager.buildPrompt(PROMPTS.DEFAULT, testBrief, customVariables);
console.log('Variables personnalisées:', JSON.stringify(customVariables, null, 2));
console.log('Le prompt contient "3 personas":', customPrompt.includes('3 personas'));
console.log('Le prompt contient "30-50 ans":', customPrompt.includes('30-50 ans'));
console.log('');

// Test 4: Test du prompt B2B
console.log('🏢 Test du prompt B2B:');
const b2bBrief = "Solution SaaS de gestion de projet pour équipes de développement agiles";
const b2bPrompt = PromptManager.buildPrompt(PROMPTS.B2B, b2bBrief);
console.log('Brief B2B:', b2bBrief);
console.log('Le prompt B2B contient "B2B":', b2bPrompt.includes('B2B'));
console.log('Le prompt B2B contient "business":', b2bPrompt.includes('business'));
console.log('');

// Test 5: Validation des prompts
console.log('✅ Validation des prompts:');
allPrompts.forEach(prompt => {
  const validation = PromptManager.validatePrompt(prompt);
  console.log(`  ${prompt.id}: ${validation.valid ? '✅ Valide' : '❌ Invalide'}`);
  if (!validation.valid) {
    console.log(`    Variables manquantes: ${validation.missingVariables.join(', ')}`);
  }
});
console.log('');

// Test 6: Génération d'un prompt de test
console.log('🎯 Génération d\'un prompt de test:');
try {
  const testPrompt = PromptManager.generateTestPrompt();
  console.log('✅ Prompt de test généré avec succès');
  console.log('Longueur:', testPrompt.length, 'caractères');
} catch (error) {
  console.log('❌ Erreur lors de la génération du prompt de test:', error.message);
}

console.log('\n🎉 Tests terminés !');