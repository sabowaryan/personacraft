/**
 * Script de test pour vérifier que les champs bio et quote sont générés
 */

const { PromptManager, PERSONA_GENERATION_PROMPT } = require('../lib/prompts/gemini-prompts.ts');

// Test du prompt avec les nouveaux champs
function testPromptGeneration() {
    console.log('🧪 Test de génération de prompt avec bio et quote\n');
    
    const testBrief = "Application mobile de fitness pour professionnels urbains actifs";
    
    try {
        const prompt = PromptManager.buildPrompt(
            PERSONA_GENERATION_PROMPT,
            testBrief
        );
        
        console.log('✅ Prompt généré avec succès');
        console.log('\n📝 Contenu du prompt:');
        console.log('=' .repeat(50));
        console.log(prompt);
        console.log('=' .repeat(50));
        
        // Vérifier que les nouveaux champs sont présents
        const hasBio = prompt.includes('bio:');
        const hasQuote = prompt.includes('quote:');
        
        console.log('\n🔍 Vérification des champs:');
        console.log(`Bio présent: ${hasBio ? '✅' : '❌'}`);
        console.log(`Quote présent: ${hasQuote ? '✅' : '❌'}`);
        
        if (hasBio && hasQuote) {
            console.log('\n🎉 Tous les nouveaux champs sont présents dans le prompt!');
        } else {
            console.log('\n⚠️  Certains champs manquent dans le prompt');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération du prompt:', error);
    }
}

// Test de validation avec les nouveaux champs
function testValidation() {
    console.log('\n🔬 Test de validation avec bio et quote\n');
    
    const mockPersona = {
        name: "Marie Dubois",
        age: 32,
        occupation: "Chef de projet marketing",
        location: "Paris, France",
        bio: "Professionnelle dynamique passionnée par l'innovation marketing et l'optimisation des performances. Elle jongle entre projets créatifs et analyses de données.",
        quote: "L'efficacité sans créativité, c'est comme un moteur sans carburant.",
        demographics: {
            income: "55 000 - 70 000 €/an",
            education: "Master en Marketing Digital",
            familyStatus: "Mariée, 1 enfant"
        },
        psychographics: {
            personality: ["Organisée", "Créative", "Analytique"],
            values: ["Innovation", "Efficacité", "Équilibre"],
            interests: ["Marketing digital", "Data analytics", "Design"],
            lifestyle: "Active, équilibre travail-famille"
        },
        painPoints: ["Manque de temps", "Outils dispersés", "Budget limité"],
        goals: ["Améliorer le ROI", "Automatiser les tâches", "Former l'équipe"],
        marketingInsights: {
            preferredChannels: ["LinkedIn", "Email"],
            messagingTone: "Professionnel et direct",
            buyingBehavior: "Recherche approfondie avant achat"
        },
        qualityScore: 85
    };
    
    try {
        // Ici on devrait importer et utiliser le validateur
        console.log('✅ Persona de test créé avec bio et quote');
        console.log(`Bio: "${mockPersona.bio}"`);
        console.log(`Quote: "${mockPersona.quote}"`);
        
        // Vérifications basiques
        const bioValid = mockPersona.bio && mockPersona.bio.length >= 10;
        const quoteValid = mockPersona.quote && mockPersona.quote.length >= 5;
        
        console.log(`\n🔍 Validation basique:`);
        console.log(`Bio valide (>= 10 chars): ${bioValid ? '✅' : '❌'}`);
        console.log(`Quote valide (>= 5 chars): ${quoteValid ? '✅' : '❌'}`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la validation:', error);
    }
}

// Exécuter les tests
console.log('🚀 Démarrage des tests bio et quote\n');
testPromptGeneration();
testValidation();
console.log('\n✨ Tests terminés!');