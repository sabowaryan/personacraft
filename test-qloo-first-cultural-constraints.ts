// Script pour tester spécifiquement le flow Qloo First avec contraintes culturelles
async function testQlooFirstCulturalConstraints() {
  try {
    console.log('🧪 Test du flow Qloo First avec contraintes culturelles...');
    
    // Données de test pour un brief français
    const testBriefData = {
      brief: "Créer des personas pour une marque de mode française ciblant les jeunes urbains parisiens passionnés de streetwear et de culture hip-hop",
      ageRange: { min: 18, max: 30 },
      location: "Paris, France",
      language: "fr",
      personaCount: 2,
      interests: ["streetwear", "hip-hop", "mode urbaine", "sneakers"],
      values: ["authenticité", "créativité", "individualité"]
    };
    
    console.log('📝 Brief de test:', {
      brief: testBriefData.brief.substring(0, 100) + '...',
      location: testBriefData.location,
      ageRange: testBriefData.ageRange,
      personaCount: testBriefData.personaCount,
      interests: testBriefData.interests,
      values: testBriefData.values
    });
    
    const response = await fetch('http://localhost:3000/api/generate-personas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBriefData)
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('✅ Response received successfully');
      console.log('🎯 Generation metadata:', {
        source: data.generation?.source,
        method: data.generation?.method,
        processingTime: data.generation?.processingTime,
        personaCount: data.generation?.personaCount
      });
      
      console.log('🌍 Cultural data sources:', {
        qloo: data.sources?.qloo,
        culturalData: data.sources?.culturalData
      });
      
      console.log('🎨 Cultural constraints:', {
        applied: data.culturalConstraints?.applied,
        count: data.culturalConstraints?.count
      });
      
      console.log('🚩 Feature flags:', data.featureFlags);
      
      if (data.validation) {
        console.log('✅ Validation results:', {
          enabled: data.validation.enabled,
          isValid: data.validation.isValid,
          score: data.validation.score,
          errorCount: data.validation.errorCount,
          templateId: data.validation.templateId
        });
      }
      
      // Analyser les personas générés
      if (data.personas && data.personas.length > 0) {
        console.log(`\n👥 ${data.personas.length} personas générés:`);
        
        data.personas.forEach((persona: any, index: number) => {
          console.log(`\n--- Persona ${index + 1}: ${persona.name} ---`);
          console.log(`Age: ${persona.age}, Métier: ${persona.occupation}`);
          console.log(`Bio: ${persona.bio}`);
          
          if (persona.culturalData) {
            console.log('🎨 Données culturelles:');
            Object.entries(persona.culturalData).forEach(([category, items]: [string, any]) => {
              if (Array.isArray(items) && items.length > 0) {
                console.log(`  ${category}: ${items.slice(0, 3).join(', ')}${items.length > 3 ? '...' : ''}`);
              }
            });
          }
          
          if (persona.psychographics) {
            console.log('🧠 Psychographics:');
            console.log(`  Personnalité: ${persona.psychographics.personality?.join(', ') || 'N/A'}`);
            console.log(`  Valeurs: ${persona.psychographics.values?.join(', ') || 'N/A'}`);
            console.log(`  Intérêts: ${persona.psychographics.interests?.join(', ') || 'N/A'}`);
          }
          
          if (persona.metadata) {
            console.log('📊 Metadata:');
            console.log(`  Méthode: ${persona.metadata.generationMethod}`);
            console.log(`  Source culturelle: ${persona.metadata.culturalDataSource}`);
            console.log(`  Contraintes Qloo: ${persona.metadata.qlooConstraintsUsed?.join(', ') || 'Aucune'}`);
          }
        });
        
        // Vérifications spécifiques pour les contraintes culturelles
        console.log('\n🔍 Vérification des contraintes culturelles:');
        
        const hasQlooData = data.sources?.qloo === true;
        const usesQlooFirst = data.generation?.method === 'qloo-first';
        const hasCulturalConstraints = data.culturalConstraints?.applied && data.culturalConstraints.applied.length > 0;
        
        console.log(`✅ Utilise Qloo First: ${usesQlooFirst ? '✓' : '✗'}`);
        console.log(`✅ Données Qloo utilisées: ${hasQlooData ? '✓' : '✗'}`);
        console.log(`✅ Contraintes culturelles appliquées: ${hasCulturalConstraints ? '✓' : '✗'}`);
        
        // Vérifier si les personas contiennent des données culturelles cohérentes
        const personasWithCulturalData = data.personas.filter((p: any) => 
          p.culturalData && Object.values(p.culturalData).some((items: any) => 
            Array.isArray(items) && items.length > 0
          )
        );
        
        console.log(`✅ Personas avec données culturelles: ${personasWithCulturalData.length}/${data.personas.length}`);
        
        // Vérifier la cohérence avec le brief (Paris, streetwear, hip-hop)
        const parisianPersonas = data.personas.filter((p: any) => 
          p.location?.toLowerCase().includes('paris') || 
          p.bio?.toLowerCase().includes('paris')
        );
        
        const streetwearPersonas = data.personas.filter((p: any) => 
          JSON.stringify(p).toLowerCase().includes('streetwear') ||
          JSON.stringify(p).toLowerCase().includes('urbain') ||
          JSON.stringify(p).toLowerCase().includes('hip-hop')
        );
        
        console.log(`✅ Personas parisiens: ${parisianPersonas.length}/${data.personas.length}`);
        console.log(`✅ Personas avec culture streetwear/hip-hop: ${streetwearPersonas.length}/${data.personas.length}`);
        
      } else {
        console.log('❌ Aucun persona généré');
      }
      
    } else {
      const errorData = await response.json();
      console.log('❌ Error response:', JSON.stringify(errorData, null, 2));
      
      if (errorData.featureFlags) {
        console.log('🚩 Feature flags dans l\'erreur:', errorData.featureFlags);
      }
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Fonction pour tester avec différents contextes
async function testMultipleContexts() {
  console.log('\n🧪 Test avec différents contextes...\n');
  
  const testCases = [
    {
      name: "Contexte B2B Tech",
      data: {
        brief: "Créer des personas B2B pour une solution SaaS de gestion d'équipe ciblant les directeurs marketing dans les startups tech françaises",
        ageRange: { min: 30, max: 45 },
        location: "Lyon, France",
        language: "fr",
        personaCount: 1,
        interests: ["technologie", "management", "innovation"],
        values: ["efficacité", "collaboration", "croissance"]
      }
    },
    {
      name: "Contexte Simple",
      data: {
        brief: "Personas pour une boulangerie locale",
        ageRange: { min: 25, max: 55 },
        location: "Bordeaux, France",
        language: "fr",
        personaCount: 1,
        interests: [],
        values: []
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Test: ${testCase.name} ---`);
    
    try {
      const response = await fetch('http://localhost:3000/api/generate-personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${testCase.name}: ${data.generation?.method} - ${data.personas?.length || 0} personas`);
        console.log(`   Qloo utilisé: ${data.sources?.qloo ? '✓' : '✗'}`);
        console.log(`   Template: ${data.validation?.templateId || 'N/A'}`);
      } else {
        console.log(`❌ ${testCase.name}: Erreur ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error}`);
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Exécuter les tests
async function runAllTests() {
  await testQlooFirstCulturalConstraints();
  await testMultipleContexts();
}

runAllTests();