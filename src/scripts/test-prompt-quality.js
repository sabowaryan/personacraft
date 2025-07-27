/**
 * Script pour tester la qualité des prompts
 * Usage: node src/scripts/test-prompt-quality.js
 */

const { PromptTester, TEST_BRIEFS } = require('../lib/debug/prompt-tester.ts');

console.log('🔍 Test de qualité des prompts Gemini\n');

// Test avec différents briefs
const briefsToTest = [
  TEST_BRIEFS.FITNESS,
  TEST_BRIEFS.B2B_SAAS,
  TEST_BRIEFS.ECOMMERCE
];

briefsToTest.forEach((brief, index) => {
  console.log(`\n📋 Test ${index + 1}: ${brief}`);
  console.log('='.repeat(60));
  
  // Tester tous les prompts
  const results = PromptTester.testAllPrompts(brief);
  
  results.forEach(result => {
    console.log(`\n🎯 ${result.promptType}:`);
    console.log(`  Longueur: ${result.promptLength} caractères`);
    console.log(`  Tokens estimés: ${result.estimatedTokens}`);
    
    // Validation de la qualité
    const quality = PromptTester.validatePromptQuality(result);
    console.log(`  Score de qualité: ${quality.score}/100`);
    
    if (quality.issues.length > 0) {
      console.log(`  ⚠️ Problèmes: ${quality.issues.join(', ')}`);
    }
    
    if (quality.recommendations.length > 0) {
      console.log(`  💡 Recommandations: ${quality.recommendations.join(', ')}`);
    }
    
    // Vérification des éléments attendus
    const elements = result.containsExpectedElements;
    const checks = [
      { name: 'Brief inclus', value: elements.brief },
      { name: 'Nombre personas', value: elements.personaCount },
      { name: 'Tranche d\'âge', value: elements.ageRange },
      { name: 'Format JSON', value: elements.jsonFormat }
    ];
    
    const passedChecks = checks.filter(c => c.value).length;
    console.log(`  ✅ Vérifications: ${passedChecks}/${checks.length} réussies`);
  });
});

// Comparaison détaillée
console.log('\n\n🔄 Comparaisons détaillées');
console.log('='.repeat(60));

const comparisonBrief = TEST_BRIEFS.FITNESS;
console.log(`\nBrief de comparaison: ${comparisonBrief}`);

// DEFAULT vs SIMPLE
console.log('\n📊 DEFAULT vs SIMPLE:');
const comp1 = PromptTester.comparePrompts('DEFAULT', 'SIMPLE', comparisonBrief);
console.log(`  Différence de longueur: ${comp1.comparison.lengthDifference} caractères`);
console.log(`  Différence de tokens: ${comp1.comparison.tokenDifference} tokens`);
console.log(`  Éléments communs: ${comp1.comparison.commonElements.length} mots`);

// DEFAULT vs B2B
console.log('\n📊 DEFAULT vs B2B:');
const comp2 = PromptTester.comparePrompts('DEFAULT', 'B2B', comparisonBrief);
console.log(`  Différence de longueur: ${comp2.comparison.lengthDifference} caractères`);
console.log(`  Différence de tokens: ${comp2.comparison.tokenDifference} tokens`);
console.log(`  Éléments communs: ${comp2.comparison.commonElements.length} mots`);

// Génération d'un rapport complet
console.log('\n\n📄 Génération du rapport complet...');
const report = PromptTester.generateTestReport(TEST_BRIEFS.FINTECH);
console.log('Rapport généré pour le brief FINTECH');
console.log('Longueur du rapport:', report.length, 'caractères');

// Test avec variables personnalisées
console.log('\n\n⚙️ Test avec variables personnalisées');
console.log('='.repeat(60));

const customVariables = {
  personaCount: 3,
  minAge: 30,
  maxAge: 50,
  personalityTraitCount: 5
};

const customResult = PromptTester.testPrompt('DEFAULT', TEST_BRIEFS.EDUCATION, customVariables);
console.log(`Brief: ${TEST_BRIEFS.EDUCATION}`);
console.log(`Variables: ${JSON.stringify(customVariables)}`);
console.log(`Longueur: ${customResult.promptLength} caractères`);
console.log(`Contient "3 personas": ${customResult.generatedPrompt.includes('3 personas')}`);
console.log(`Contient "30-50 ans": ${customResult.generatedPrompt.includes('30-50 ans')}`);

const customQuality = PromptTester.validatePromptQuality(customResult);
console.log(`Score de qualité: ${customQuality.score}/100`);

console.log('\n🎉 Tests de qualité terminés !');
console.log('\n💡 Conseils:');
console.log('- Les prompts avec un score > 90 sont excellents');
console.log('- Les prompts avec un score > 80 sont bons');
console.log('- Les prompts avec un score < 70 nécessitent des améliorations');