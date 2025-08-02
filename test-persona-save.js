/**
 * Script de test pour vérifier que les personas sont bien sauvegardés en BDD
 * même quand l'auth est désactivée
 */

const testPersonaGeneration = async () => {
  console.log('🧪 Test de génération et sauvegarde de personas...');
  
  const testData = {
    brief: "Une application mobile de fitness pour les jeunes professionnels urbains",
    ageRange: { min: 25, max: 35 },
    location: "Paris, France",
    language: "fr",
    personaCount: 2,
    interests: ["fitness", "technologie", "productivité"],
    values: ["santé", "efficacité", "innovation"]
  };

  try {
    const response = await fetch('http://localhost:3000/api/personas/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Génération réussie !');
    console.log(`📊 Personas générés: ${result.personas.length}`);
    console.log(`💾 Sauvegardé en BDD: ${result.generation.savedToDatabase}`);
    console.log(`🔧 Source: ${result.generation.source}`);
    console.log(`⏱️ Temps de traitement: ${result.generation.processingTime}ms`);
    
    // Vérifier que les personas ont bien un ID (preuve qu'ils sont sauvegardés)
    const personasWithId = result.personas.filter(p => p.id);
    console.log(`🆔 Personas avec ID (sauvegardés): ${personasWithId.length}/${result.personas.length}`);
    
    if (personasWithId.length === result.personas.length) {
      console.log('🎉 Tous les personas ont été sauvegardés en BDD !');
    } else {
      console.log('⚠️ Certains personas n\'ont pas été sauvegardés');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testPersonaGeneration();
}

module.exports = { testPersonaGeneration };