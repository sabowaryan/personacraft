// Script de test pour valider le parsing Gemini
// Utilisation: node src/scripts/test-gemini-parsing.js

const testCases = [
  {
    name: "Réponse valide standard",
    response: `[
      {
        "name": "Sophie Laurent",
        "age": 29,
        "occupation": "UX Designer",
        "location": "Bordeaux, France",
        "demographics": {
          "income": "35 000 - 45 000€/an",
          "education": "Master Design",
          "familyStatus": "En couple"
        },
        "psychographics": {
          "personality": ["Créative", "Empathique", "Perfectionniste"],
          "values": ["Accessibilité", "Innovation", "Simplicité"],
          "interests": ["Design thinking", "Art", "Voyage"],
          "lifestyle": "Créative urbaine, soucieuse de l'environnement"
        },
        "painPoints": [
          "Manque de temps pour la recherche utilisateur",
          "Difficulté à convaincre les parties prenantes",
          "Pression pour livrer rapidement"
        ],
        "goals": [
          "Améliorer l'expérience utilisateur",
          "Développer ses compétences en recherche",
          "Travailler sur des projets impactants"
        ],
        "marketingInsights": {
          "preferredChannels": ["Instagram", "Behance"],
          "messagingTone": "Inspirant et visuel",
          "buyingBehavior": "Influence par le design et les avis"
        },
        "qualityScore": 87
      }
    ]`
  },
  {
    name: "Réponse avec markdown",
    response: `\`\`\`json
    [
      {
        "name": "Pierre Durand",
        "age": 35,
        "occupation": "Chef d'entreprise",
        "location": "Nice, France",
        "demographics": {
          "income": "60 000 - 80 000€/an",
          "education": "École de commerce",
          "familyStatus": "Marié, 2 enfants"
        },
        "psychographics": {
          "personality": ["Ambitieux", "Pragmatique", "Leader"],
          "values": ["Réussite", "Famille", "Innovation"],
          "interests": ["Business", "Sport", "Technologie"],
          "lifestyle": "Entrepreneur actif, équilibre famille-travail"
        },
        "painPoints": [
          "Manque de temps pour tout gérer",
          "Difficulté à déléguer",
          "Stress de la responsabilité"
        ],
        "goals": [
          "Développer son entreprise",
          "Améliorer l'efficacité opérationnelle",
          "Maintenir l'équilibre vie privée/pro"
        ],
        "marketingInsights": {
          "preferredChannels": ["LinkedIn", "Podcasts business"],
          "messagingTone": "Professionnel et efficace",
          "buyingBehavior": "Décision rapide basée sur le ROI"
        },
        "qualityScore": 91
      }
    ]
    \`\`\``
  },
  {
    name: "Réponse avec erreurs de format",
    response: `[
      {
        "name": "Julie Martin",
        "age": 31,
        "occupation": "Consultante RH",
        "location": "Toulouse, France",
        "demographics": {
          "income": "40 000 - 50 000€/an",
          "education": "Master RH",
          "familyStatus": "Célibataire"
        },
        "psychographics": {
          "personality": ["Bienveillante", "Organisée", "Communicante"],
          "values": ["Développement humain", "Équité", "Collaboration"],
          "interests": ["Psychologie", "Formation", "Bien-être"],
          "lifestyle": "Professionnelle engagée, vie sociale active"
        },
        "painPoints": [
          "Résistance au changement des équipes",
          "Manque de budget formation",
          "Pression des objectifs RH"
        ],
        "goals": [
          "Améliorer l'engagement des collaborateurs",
          "Développer les compétences managériales",
          "Moderniser les processus RH"
        ],
        "marketingInsights": {
          "preferredChannels": ["LinkedIn", "Webinaires RH"],
          "messagingTone": "Humain et professionnel",
          "buyingBehavior": "Recherche de preuves et témoignages"
        },
        "qualityScore": 89,
      }
    ]` // Virgule en trop à la fin
  }
];

async function testParsing() {
  console.log('🧪 Test du système de validation Gemini\n');

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('=' .repeat(50));

    try {
      const response = await fetch('http://localhost:3000/api/test-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawResponse: testCase.response,
          brief: 'Test brief pour validation'
        })
      });

      const result = await response.json();
      
      if (result.success && result.result.success) {
        console.log('✅ Parsing réussi');
        console.log(`👥 Personas générés: ${result.result.personas.length}`);
        result.result.personas.forEach((persona, index) => {
          console.log(`   ${index + 1}. ${persona.name} (${persona.age} ans)`);
        });
      } else {
        console.log('❌ Parsing échoué');
        if (result.result.errors) {
          result.result.errors.forEach(error => {
            console.log(`   🚨 ${error}`);
          });
        }
      }
    } catch (error) {
      console.log('💥 Erreur de test:', error.message);
    }
  }

  console.log('\n🏁 Tests terminés');
}

// Exécuter les tests si le serveur est démarré
testParsing().catch(console.error);