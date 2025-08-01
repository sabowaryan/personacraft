/**
 * Test détaillé de génération Gemini pour identifier le problème de fallback
 */

const testBrief = {
  brief: "Application mobile de fitness pour professionnels urbains actifs de 25-40 ans",
  location: "Paris, France", 
  ageRange: { min: 25, max: 40 },
  personaCount: 2,
  interests: ["Fitness", "Technologie", "Bien-être"],
  values: ["Santé", "Performance", "Équilibre"]
};

console.log("🧪 Test détaillé de génération Gemini");
console.log("📝 Brief:", testBrief.brief);

// Test avec logs détaillés
fetch('/api/generate-personas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testBrief)
})
.then(response => response.json())
.then(data => {
  console.log("📊 Résultat complet:", data);
  
  console.log("🔍 Analyse détaillée:");
  console.log("- Succès:", data.success);
  console.log("- Nombre de personas:", data.personas?.length);
  console.log("- Méthode de génération:", data.generation?.method);
  console.log("- Source:", data.generation?.source);
  console.log("- Temps de traitement:", data.generation?.processingTime);
  
  // Vérifier les noms des personas
  if (data.personas && data.personas.length > 0) {
    console.log("👥 Noms des personas:");
    data.personas.forEach((p: any, i: number) => {
      console.log(`  ${i + 1}. ${p.name}`);
    });
    
    // Détecter le fallback
    const fallbackNames = ['Marie Dubois', 'Thomas Martin', 'Sophie Dubois', 'Antoine Leclerc'];
    const isFallback = data.personas.some((p: any) => fallbackNames.includes(p.name));
    
    console.log("🔍 Fallback détecté:", isFallback ? "❌ OUI" : "✅ NON");
    
    if (isFallback) {
      console.log("💡 Le fallback est utilisé !");
      console.log("🔍 Causes possibles:");
      console.log("1. Circuit breaker ouvert (mais diagnostic dit non)");
      console.log("2. Erreur de parsing de la réponse Gemini");
      console.log("3. Réponse Gemini vide ou invalide");
      console.log("4. Erreur API Gemini");
    }
  }
  
  // Vérifier les métadonnées
  console.log("📋 Métadonnées:");
  console.log("- Validation score:", data.validation?.score);
  console.log("- Erreurs de validation:", data.validation?.errorCount);
  console.log("- Avertissements:", data.validation?.warningCount);
  console.log("- Template utilisé:", data.validation?.templateId);
  
  // Vérifier les contraintes culturelles
  console.log("🌍 Contraintes culturelles:");
  console.log("- Appliquées:", data.culturalConstraints?.applied);
  console.log("- Nombre:", data.culturalConstraints?.count);
  
})
.catch(error => {
  console.error("❌ Erreur lors du test:", error);
}); 