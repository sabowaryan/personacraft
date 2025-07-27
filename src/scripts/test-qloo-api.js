/**
 * Script de test pour l'API Qloo via les routes HTTP
 */

async function testQlooAPI() {
    console.log('🚀 Test de l\'API Qloo via les routes HTTP...\n');
    
    const baseUrl = 'http://localhost:3000';
    
    // 1. Test de connexion
    console.log('1. Test de connexion...');
    try {
        const response = await fetch(`${baseUrl}/api/qloo`, {
            method: 'GET'
        });
        
        const result = await response.json();
        
        if (result.success && result.connected.success) {
            console.log('   ✅ Connexion réussie');
            console.log(`   - Clé API présente: ${result.status.hasApiKey ? '✅' : '❌'}`);
            console.log(`   - URL de base: ${result.status.baseUrl}`);
        } else {
            console.error('   ❌ Échec de connexion');
            console.error(`   Erreur: ${result.connected.error || 'Inconnue'}`);
        }
    } catch (error) {
        console.error(`   ❌ Erreur de requête: ${error.message}`);
    }
    
    console.log('\n2. Test d\'enrichissement de personas...');
    
    const testPersonas = [
        {
            name: 'Marie Tech',
            age: 28,
            occupation: 'Développeur web',
            location: 'Paris',
            culturalData: {}
        },
        {
            name: 'Pierre Design',
            age: 35,
            occupation: 'Designer UX',
            location: 'Lyon',
            culturalData: {}
        }
    ];
    
    try {
        const response = await fetch(`${baseUrl}/api/qloo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ personas: testPersonas })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('   ✅ Enrichissement réussi');
            
            result.personas.forEach((persona, index) => {
                console.log(`\n   👤 ${persona.name}:`);
                console.log(`      Âge: ${persona.age} ans`);
                console.log(`      Profession: ${persona.occupation}`);
                console.log(`      Localisation: ${persona.location}`);
                
                if (persona.culturalData) {
                    const cd = persona.culturalData;
                    console.log(`      🎵 Musique: ${cd.music?.slice(0, 2).join(', ') || 'N/A'}`);
                    console.log(`      🎬 Films: ${cd.movies?.slice(0, 2).join(', ') || 'N/A'}`);
                    console.log(`      📺 TV: ${cd.tv?.slice(0, 2).join(', ') || 'N/A'}`);
                    console.log(`      🏷️ Marques: ${cd.brands?.slice(0, 2).join(', ') || 'N/A'}`);
                    console.log(`      🍽️ Restaurants: ${cd.restaurants?.slice(0, 2).join(', ') || 'N/A'}`);
                    console.log(`      📱 Réseaux sociaux: ${cd.socialMedia?.slice(0, 3).join(', ') || 'N/A'}`);
                }
            });
            
        } else {
            console.error('   ❌ Échec de l\'enrichissement');
            console.error(`   Erreur: ${result.error || 'Inconnue'}`);
        }
        
    } catch (error) {
        console.error(`   ❌ Erreur de requête: ${error.message}`);
    }
    
    console.log('\n🎉 Test terminé !');
}

// Exécuter le test
testQlooAPI().catch(console.error);