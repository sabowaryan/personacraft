/**
 * Test pour voir la réponse brute de Gemini
 */

const testBrief = {
  brief: "Application mobile de fitness pour professionnels urbains actifs de 25-40 ans",
  location: "Paris, France", 
  ageRange: { min: 25, max: 40 },
  personaCount: 2,
  interests: ["Fitness", "Technologie", "Bien-être"],
  values: ["Santé", "Performance", "Équilibre"]
};

console.log("🧪 Test réponse brute Gemini");
console.log("📝 Brief:", testBrief.brief);

// Test direct avec Gemini
fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: `Tu es un expert en marketing et en génération de personas. Tu dois créer EXACTEMENT 2 personas marketing détaillés et réalistes basés sur le brief suivant et les contraintes culturelles spécifiques fournies.

IMPORTANT: Vous DEVEZ générer EXACTEMENT 2 personas, pas plus, pas moins.

BRIEF MARKETING: "Application mobile de fitness pour professionnels urbains actifs de 25-40 ans"

CONTRAINTES IMPORTANTES:
- Âge: entre 25 et 40 ans
- Localisation géographique: Paris, France
- Langue de réponse: fr
- Nombre de personas: EXACTEMENT 2
- Les personas DOIVENT être cohérents avec les données culturelles fournies ci-dessous

CONTRAINTES CULTURELLES:
- Musique: ["Daft Punk", "Stromae", "Angèle"]
- Marques: ["Nike", "Apple", "Lululemon"]
- Restaurants: ["Le Comptoir du Relais", "Septime", "L'Arpège"]
- Films: ["Amélie", "La La Land", "The Social Network"]
- Livres: ["Le Petit Prince", "Sapiens", "Atomic Habits"]
- TV: ["Stranger Things", "Breaking Bad", "Friends"]
- Voyage: ["Japon", "Italie", "Thaïlande"]
- Mode: ["Zara", "H&M", "Uniqlo"]
- Beauté: ["L'Oréal", "Nivea", "La Roche-Posay"]
- Alimentation: ["Bio", "Végétarien", "Keto"]
- Réseaux sociaux: ["Instagram", "LinkedIn", "TikTok"]

INSTRUCTIONS SPÉCIFIQUES:
1. Vous DEVEZ générer EXACTEMENT 2 personas uniques et distincts
2. Les préférences culturelles (musique, marques, restaurants, etc.) DOIVENT correspondre exactement aux données fournies
3. Les traits de personnalité doivent être cohérents avec l'âge, la localisation et les préférences culturelles
4. Les pain points et objectifs doivent être réalistes et spécifiques au contexte du brief
5. Le score de qualité doit refléter la cohérence et la pertinence du persona (75-95)
6. Chaque persona doit avoir un nom, âge, et métier uniques

FORMAT EXACT ATTENDU (JSON uniquement, pas de texte avant ou après):
[
  {
    "id": "persona-1",
    "name": "Prénom Nom réaliste",
    "age": 30,
    "occupation": "Métier réaliste",
    "location": "Paris, France",
    "bio": "Description détaillée du persona",
    "quote": "Citation représentative",
    "demographics": {
      "age": 30,
      "gender": "Femme",
      "location": "Paris, France",
      "income": "50k-80k",
      "education": "Bac+5",
      "maritalStatus": "Célibataire"
    },
    "psychographics": {
      "personality": ["Extravertie", "Organisée", "Ambitieuse"],
      "lifestyle": ["Active", "Connectée", "Équilibrée"],
      "values": ["Santé", "Performance", "Équilibre"],
      "interests": ["Fitness", "Technologie", "Bien-être"]
    },
    "painPoints": ["Manque de temps", "Difficulté à maintenir une routine"],
    "goals": ["Rester en forme", "Optimiser son temps"],
    "marketingInsights": {
      "preferredChannels": ["Instagram", "LinkedIn"],
      "messagingTone": "Motivant et professionnel",
      "contentPreferences": ["Conseils pratiques", "Témoignages"]
    },
    "qualityScore": 85,
    "culturalData": {
      "music": ["Daft Punk", "Stromae"],
      "brand": ["Nike", "Apple"],
      "restaurant": ["Le Comptoir du Relais"],
      "movie": ["Amélie"],
      "book": ["Le Petit Prince"],
      "tv": ["Stranger Things"],
      "travel": ["Japon"],
      "fashion": ["Zara"],
      "beauty": ["L'Oréal"],
      "food": ["Bio"],
      "socialMedia": ["Instagram", "LinkedIn"]
    }
  }
]

VALIDATION FINALE:
- Vérifiez que vous avez généré EXACTEMENT 2 personas
- Vérifiez que chaque persona a un nom, âge, et métier uniques
- Confirmez que les données culturelles correspondent exactement aux contraintes fournies (utilisez les vraies données, pas des placeholders)
- Assurez-vous que les pain points sont liés au brief marketing
- Validez que le JSON est correctement formaté

IMPORTANT: 
- Dans culturalData, utilisez UNIQUEMENT les vraies données fournies dans les contraintes culturelles. Ne créez pas de données fictives.
- Vous DEVEZ générer EXACTEMENT 2 personas dans le tableau JSON.

Réponds UNIQUEMENT avec le JSON valide, sans aucun texte explicatif avant ou après.`
  })
})
.then(r => r.json())
.then(data => {
  console.log("📊 Réponse Gemini brute:");
  console.log(data.response);
  
  // Essayer de parser
  try {
    const parsed = JSON.parse(data.response);
    console.log("✅ JSON valide:", parsed);
    console.log("👥 Nombre de personas:", parsed.length);
    if (parsed.length > 0) {
      console.log("📋 Premier persona:", parsed[0]);
    }
  } catch (error) {
    console.error("❌ Erreur parsing JSON:", error);
    console.log("📄 Réponse brute:", data.response);
  }
})
.catch(error => {
  console.error("❌ Erreur API:", error);
}); 