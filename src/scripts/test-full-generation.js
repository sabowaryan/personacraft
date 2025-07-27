/**
 * Test complet de génération de personas avec bio et quote
 */

const { PersonaValidator } = require('../lib/validators/persona-validator.ts');

// Simulation d'une réponse Gemini avec les nouveaux champs
const mockGeminiResponse = `[
  {
    "name": "Sophie Martin",
    "age": 34,
    "occupation": "Directrice Marketing Digital",
    "location": "Lyon, France",
    "bio": "Professionnelle passionnée par l'innovation digitale, Sophie transforme les défis marketing en opportunités créatives. Elle équilibre stratégie data-driven et approche humaine.",
    "quote": "Le fitness, c'est comme le marketing : la régularité bat l'intensité ponctuelle.",
    "demographics": {
      "income": "65 000 - 80 000 €/an",
      "education": "Master Marketing Digital",
      "familyStatus": "Mariée, 2 enfants"
    },
    "psychographics": {
      "personality": ["Organisée", "Innovante", "Empathique"],
      "values": ["Efficacité", "Bien-être", "Équilibre"],
      "interests": ["Fitness", "Technologie", "Développement personnel"],
      "lifestyle": "Active, cherche l'équilibre vie pro/perso"
    },
    "painPoints": ["Manque de temps pour le sport", "Stress professionnel", "Difficulté à maintenir une routine"],
    "goals": ["Améliorer sa forme physique", "Optimiser son temps", "Réduire le stress"],
    "marketingInsights": {
      "preferredChannels": ["LinkedIn", "Instagram"],
      "messagingTone": "Motivant et professionnel",
      "buyingBehavior": "Recherche de solutions pratiques et efficaces"
    },
    "qualityScore": 88
  },
  {
    "name": "Thomas Dubois",
    "age": 29,
    "occupation": "Consultant en stratégie",
    "location": "Paris, France", 
    "bio": "Jeune consultant ambitieux qui jongle entre missions clients et développement personnel. Il voit le sport comme un investissement dans sa performance professionnelle.",
    "quote": "Un esprit sain dans un corps sain, c'est la clé de la réussite professionnelle.",
    "demographics": {
      "income": "55 000 - 70 000 €/an",
      "education": "École de commerce",
      "familyStatus": "Célibataire"
    },
    "psychographics": {
      "personality": ["Ambitieux", "Discipliné", "Analytique"],
      "values": ["Performance", "Excellence", "Développement"],
      "interests": ["Business", "Sport", "Technologie"],
      "lifestyle": "Dynamique, orienté performance"
    },
    "painPoints": ["Horaires irréguliers", "Voyages fréquents", "Manque de motivation seul"],
    "goals": ["Maintenir sa forme malgré les voyages", "Améliorer ses performances", "Créer une routine stable"],
    "marketingInsights": {
      "preferredChannels": ["LinkedIn", "Email"],
      "messagingTone": "Direct et orienté résultats",
      "buyingBehavior": "Décision rapide si ROI démontré"
    },
    "qualityScore": 92
  }
]`;

async function testFullGeneration() {
    console.log('🧪 Test complet de génération avec bio et quote\n');
    
    try {
        // Test du parsing et validation
        console.log('1️⃣ Test du parsing JSON...');
        const personas = PersonaValidator.parseGeminiResponse(
            mockGeminiResponse, 
            "Application mobile de fitness pour professionnels urbains"
        );
        
        console.log(`✅ ${personas.length} personas parsés avec succès\n`);
        
        // Vérification des nouveaux champs
        console.log('2️⃣ Vérification des champs bio et quote...');
        personas.forEach((persona, index) => {
            console.log(`\n👤 Persona ${index + 1}: ${persona.name}`);
            console.log(`📝 Bio: ${persona.bio ? '✅' : '❌'} "${persona.bio}"`);
            console.log(`💬 Quote: ${persona.quote ? '✅' : '❌'} "${persona.quote}"`);
            
            // Vérifications de longueur
            const bioValid = persona.bio && persona.bio.length >= 10;
            const quoteValid = persona.quote && persona.quote.length >= 5;
            
            console.log(`   Bio valide: ${bioValid ? '✅' : '❌'}`);
            console.log(`   Quote valide: ${quoteValid ? '✅' : '❌'}`);
        });
        
        console.log('\n3️⃣ Test de la structure complète...');
        personas.forEach((persona, index) => {
            const requiredFields = [
                'name', 'age', 'occupation', 'location', 'bio', 'quote',
                'demographics', 'psychographics', 'painPoints', 'goals',
                'marketingInsights', 'qualityScore'
            ];
            
            const missingFields = requiredFields.filter(field => !persona[field]);
            
            console.log(`\n👤 Persona ${index + 1} - Champs manquants: ${missingFields.length === 0 ? '✅ Aucun' : '❌ ' + missingFields.join(', ')}`);
        });
        
        console.log('\n🎉 Test complet réussi ! Les personas incluent maintenant bio et quote.');
        
        // Affichage d'exemple
        console.log('\n📋 Exemple de persona généré:');
        console.log('=' .repeat(60));
        const example = personas[0];
        console.log(`Nom: ${example.name}`);
        console.log(`Âge: ${example.age} ans`);
        console.log(`Métier: ${example.occupation}`);
        console.log(`Lieu: ${example.location}`);
        console.log(`\nBio: ${example.bio}`);
        console.log(`\nCitation: "${example.quote}"`);
        console.log(`\nScore qualité: ${example.qualityScore}%`);
        console.log('=' .repeat(60));
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        console.error('Stack:', error.stack);
    }
}

// Exécuter le test
console.log('🚀 Démarrage du test complet de génération\n');
testFullGeneration().then(() => {
    console.log('\n✨ Test terminé!');
}).catch(error => {
    console.error('💥 Erreur fatale:', error);
});