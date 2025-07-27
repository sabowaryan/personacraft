/**
 * Script de diagnostic et correction des erreurs JSON dans localStorage
 */

function diagnoseAndFixLocalStorage() {
    console.log('🔍 Diagnostic du localStorage...');
    
    const keys = ['personacraft_session', 'personacraft_personas', 'personacraft_briefs'];
    let hasErrors = false;
    
    keys.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            console.log(`\n📋 Clé: ${key}`);
            
            if (!data) {
                console.log('  ✅ Aucune donnée');
                return;
            }
            
            console.log(`  📊 Taille: ${data.length} caractères`);
            console.log(`  🔤 Début: ${data.substring(0, 50)}...`);
            
            // Vérifier le format de base
            if (data.trim() === '') {
                console.log('  ⚠️  Données vides, suppression...');
                localStorage.removeItem(key);
                hasErrors = true;
                return;
            }
            
            // Vérifier si c'est du JSON valide
            try {
                const parsed = JSON.parse(data);
                console.log('  ✅ JSON valide');
                console.log(`  📝 Type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
                
                if (Array.isArray(parsed)) {
                    console.log(`  📊 Éléments: ${parsed.length}`);
                } else if (typeof parsed === 'object' && parsed !== null) {
                    console.log(`  🔑 Propriétés: ${Object.keys(parsed).join(', ')}`);
                }
                
            } catch (parseError) {
                console.log('  ❌ JSON invalide:', parseError.message);
                console.log('  🧹 Suppression des données corrompues...');
                localStorage.removeItem(key);
                hasErrors = true;
            }
            
        } catch (error) {
            console.log(`  💥 Erreur lors de l'accès: ${error.message}`);
            hasErrors = true;
        }
    });
    
    if (hasErrors) {
        console.log('\n🔧 Erreurs détectées et corrigées');
        console.log('🔄 Rechargez la page pour appliquer les corrections');
    } else {
        console.log('\n✅ Aucune erreur détectée dans le localStorage');
    }
    
    // Créer une session propre si nécessaire
    if (!localStorage.getItem('personacraft_session')) {
        console.log('\n🆕 Création d\'une nouvelle session...');
        const newSession = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            totalPersonas: 0,
            totalGenerations: 0,
            preferences: {
                theme: 'light',
                language: 'fr',
                autoSave: true
            }
        };
        localStorage.setItem('personacraft_session', JSON.stringify(newSession));
        console.log('✅ Nouvelle session créée');
    }
    
    // Initialiser les personas si nécessaire
    if (!localStorage.getItem('personacraft_personas')) {
        console.log('🆕 Initialisation des personas...');
        localStorage.setItem('personacraft_personas', JSON.stringify([]));
        console.log('✅ Personas initialisés');
    }
    
    // Initialiser les briefs si nécessaire
    if (!localStorage.getItem('personacraft_briefs')) {
        console.log('🆕 Initialisation des briefs...');
        localStorage.setItem('personacraft_briefs', JSON.stringify([]));
        console.log('✅ Briefs initialisés');
    }
    
    console.log('\n🎉 Diagnostic terminé !');
}

// Exécuter le diagnostic
if (typeof window !== 'undefined') {
    diagnoseAndFixLocalStorage();
} else {
    console.log('Ce script doit être exécuté dans le navigateur');
}