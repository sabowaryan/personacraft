/**
 * Test script pour vérifier la génération B2B
 */

const testBrief = {
  brief: "Plateforme SaaS de gestion de projet pour équipes de développement agiles de 10-50 personnes. Les utilisateurs sont des chefs de projet, développeurs et product managers cherchant à améliorer leur collaboration et leur efficacité.",
  location: "International, télétravail",
  ageRange: { min: 28, max: 50 },
  personaCount: 3,
  interests: [
    "Productivité",
    "Technologie", 
    "Gestion de projet",
    "Collaboration",
    "Innovation"
  ],
  values: [
    "Efficacité",
    "Innovation",
    "Collaboration", 
    "Qualité",
    "Simplicité"
  ]
};

console.log("🧪 Test de génération B2B");
console.log("Brief:", testBrief.brief.substring(0, 100) + "...");
console.log("Âge:", testBrief.ageRange);
console.log("Personas:", testBrief.personaCount);

// Simuler l'appel API
fetch('/api/generate-personas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testBrief)
})
.then(response => response.json())
.then(data => {
  console.log("✅ Résultat:", {
    success: data.success,
    personaCount: data.personas?.length,
    generationMethod: data.generation?.method,
    validationScore: data.validation?.score,
    processingTime: data.generation?.processingTime
  });
})
.catch(error => {
  console.error("❌ Erreur:", error);
}); 