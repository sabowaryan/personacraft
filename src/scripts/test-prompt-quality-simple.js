/**
 * Script simple pour tester la qualité des prompts (version JS pure)
 * Usage: node src/scripts/test-prompt-quality-simple.js
 */

// Simulation des prompts pour le test (version simplifiée)
const PROMPTS = {
  DEFAULT: {
    id: 'persona-generation-v2',
    name: 'Génération de Personas Marketing',
    template: `En tant qu'expert en marketing et personas, génère exactement {{personaCount}} personas détaillés basés sur ce brief marketing :

"{{brief}}"

Pour chaque persona, fournis les informations suivantes au format JSON strict :
- name: nom complet français
- age: âge entre {{minAge}}-{{maxAge}} ans
- occupation: métier spécifique et réaliste
- location: ville française

CONTRAINTES IMPORTANTES:
- Réponds UNIQUEMENT avec un tableau JSON valide
- AUCUN texte supplémentaire avant ou après
- AUCUNE balise markdown (\`\`\`json)
- Assure-toi que le JSON est parfaitement formaté

Format exact attendu:
[{"name": "...", "age": 30, "occupation": "...", ...}]`
  },
  SIMPLE: {
    id: 'persona-generation-simple-v1',
    name: 'Génération Simple de Personas',
    template: `Crée {{personaCount}} personas marketing pour: "{{brief}}"

Format JSON requis (sans markdown):
[{"name": "Prénom Nom", "age": nombre, "occupation": "métier"}]

Réponds SEULEMENT avec le JSON, rien d'autre.`
  },
  B2B: {
    id: 'persona-generation-b2b-v1',
    name: 'Génération Personas B2B',
    template: `Génère {{personaCount}} personas B2B professionnels pour ce contexte business :

"{{brief}}"

Focus sur les aspects professionnels et processus de décision d'achat B2B.

Format JSON strict (sans markdown):
[{"name": "Prénom Nom", "age": nombre, "occupation": "Titre professionnel précis"}]`
  }
};

const DEFAULT_VARIABLES = {
  personaCount: 2,
  minAge: 25,
  maxAge: 45
};

function buildPrompt(template, brief, variables = {}) {
  const finalVariables = { ...DEFAULT_VARIABLES, ...variables };
  
  let prompt = template.template;
  
  // Remplacer le brief
  prompt = prompt.replace(/\{\{brief\}\}/g, brief);
  
  // Remplacer toutes les variables
  Object.entries(finalVariables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    prompt = prompt.replace(regex, value.toString());
  });
  
  return prompt.trim();
}

function testPrompt(promptType, brief, variables = {}) {
  const template = PROMPTS[promptType];
  const generatedPrompt = buildPrompt(template, brief, variables);
  const finalVariables = { ...DEFAULT_VARIABLES, ...variables };

  return {
    promptType,
    brief,
    variables: finalVariables,
    generatedPrompt,
    promptLength: generatedPrompt.length,
    containsExpectedElements: {
      brief: generatedPrompt.includes(brief),
      personaCount: generatedPrompt.includes(finalVariables.personaCount.toString()),
      ageRange: generatedPrompt.includes(`${finalVariables.minAge}-${finalVariables.maxAge}`),
      jsonFormat: generatedPrompt.toLowerCase().includes('json')
    },
    estimatedTokens: Math.ceil(generatedPrompt.length / 4)
  };
}

function validatePromptQuality(result) {
  const issues = [];
  const recommendations = [];
  let score = 100;

  // Vérifications de base
  if (!result.containsExpectedElements.brief) {
    issues.push('Le brief n\'est pas présent dans le prompt');
    score -= 20;
  }

  if (!result.containsExpectedElements.jsonFormat) {
    issues.push('Le format JSON n\'est pas mentionné');
    score -= 15;
  }

  if (!result.containsExpectedElements.personaCount) {
    issues.push('Le nombre de personas n\'est pas spécifié');
    score -= 10;
  }

  // Vérifications de longueur
  if (result.promptLength > 2000) {
    issues.push('Le prompt est très long (>2000 caractères)');
    recommendations.push('Considérer une version plus concise');
    score -= 5;
  }

  if (result.promptLength < 200) {
    issues.push('Le prompt est très court (<200 caractères)');
    recommendations.push('Ajouter plus de contexte et d\'instructions');
    score -= 10;
  }

  // Vérifications de contenu
  const prompt = result.generatedPrompt.toLowerCase();
  
  if (prompt.includes('markdown') || prompt.includes('```')) {
    issues.push('Le prompt mentionne le markdown, ce qui peut créer de la confusion');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

// Tests
console.log('🔍 Test de qualité des prompts Gemini\n');

const testBriefs = [
  "Application mobile de fitness pour professionnels urbains actifs",
  "Solution SaaS de gestion de projet pour équipes agiles",
  "Plateforme e-commerce de vêtements éthiques pour millennials"
];

testBriefs.forEach((brief, index) => {
  console.log(`\n📋 Test ${index + 1}: ${brief}`);
  console.log('='.repeat(60));
  
  ['DEFAULT', 'SIMPLE', 'B2B'].forEach(promptType => {
    const result = testPrompt(promptType, brief);
    const quality = validatePromptQuality(result);
    
    console.log(`\n🎯 ${promptType}:`);
    console.log(`  Longueur: ${result.promptLength} caractères`);
    console.log(`  Tokens estimés: ${result.estimatedTokens}`);
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

// Test avec variables personnalisées
console.log('\n\n⚙️ Test avec variables personnalisées');
console.log('='.repeat(60));

const customVariables = {
  personaCount: 3,
  minAge: 30,
  maxAge: 50
};

const customResult = testPrompt('DEFAULT', "Application de gestion budgétaire", customVariables);
const customQuality = validatePromptQuality(customResult);

console.log(`Brief: Application de gestion budgétaire`);
console.log(`Variables: ${JSON.stringify(customVariables)}`);
console.log(`Longueur: ${customResult.promptLength} caractères`);
console.log(`Contient "3 personas": ${customResult.generatedPrompt.includes('3 personas')}`);
console.log(`Contient "30-50 ans": ${customResult.generatedPrompt.includes('30-50 ans')}`);
console.log(`Score de qualité: ${customQuality.score}/100`);

console.log('\n🎉 Tests de qualité terminés !');
console.log('\n💡 Conseils:');
console.log('- Les prompts avec un score > 90 sont excellents');
console.log('- Les prompts avec un score > 80 sont bons');
console.log('- Les prompts avec un score < 70 nécessitent des améliorations');

// Affichage d'un exemple de prompt généré
console.log('\n📄 Exemple de prompt généré (DEFAULT):');
console.log('='.repeat(60));
const exampleResult = testPrompt('DEFAULT', "Service de livraison de repas healthy");
console.log(exampleResult.generatedPrompt.substring(0, 300) + '...');