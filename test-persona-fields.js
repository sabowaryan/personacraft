const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPersonaFields() {
    try {
        console.log('🔍 Test de vérification des champs personas...');
        
        // Récupérer les derniers personas créés
        const personas = await prisma.persona.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                socialMediaInsights: true,
                metadata: true,
                validationMetadata: true,
                generationMetadata: true,
                createdAt: true
            }
        });

        if (personas.length === 0) {
            console.log('❌ Aucun persona trouvé dans la base de données');
            return;
        }

        console.log(`\n📊 Analyse de ${personas.length} personas récents :\n`);

        personas.forEach((persona, index) => {
            console.log(`--- Persona ${index + 1}: ${persona.name} ---`);
            console.log(`ID: ${persona.id}`);
            console.log(`Créé le: ${persona.createdAt}`);
            
            // Vérifier socialMediaInsights
            if (persona.socialMediaInsights) {
                console.log('✅ socialMediaInsights: PRÉSENT');
                console.log(`   Contenu: ${JSON.stringify(persona.socialMediaInsights).substring(0, 100)}...`);
            } else {
                console.log('❌ socialMediaInsights: MANQUANT');
            }
            
            // Vérifier metadata
            if (persona.metadata) {
                console.log('✅ metadata: PRÉSENT');
                console.log(`   Contenu: ${JSON.stringify(persona.metadata).substring(0, 100)}...`);
            } else {
                console.log('❌ metadata: MANQUANT');
            }
            
            // Vérifier validationMetadata
            if (persona.validationMetadata) {
                console.log('✅ validationMetadata: PRÉSENT');
                console.log(`   Contenu: ${JSON.stringify(persona.validationMetadata).substring(0, 100)}...`);
            } else {
                console.log('❌ validationMetadata: MANQUANT');
            }
            
            // Vérifier generationMetadata
            if (persona.generationMetadata) {
                console.log('✅ generationMetadata: PRÉSENT');
                console.log(`   Contenu: ${JSON.stringify(persona.generationMetadata).substring(0, 100)}...`);
            } else {
                console.log('❌ generationMetadata: MANQUANT');
            }
            
            console.log('');
        });

        // Statistiques globales
        const stats = {
            total: personas.length,
            withSocialMedia: personas.filter(p => p.socialMediaInsights).length,
            withMetadata: personas.filter(p => p.metadata).length,
            withValidationMetadata: personas.filter(p => p.validationMetadata).length,
            withGenerationMetadata: personas.filter(p => p.generationMetadata).length
        };

        console.log('📈 Statistiques globales:');
        console.log(`   Total personas: ${stats.total}`);
        console.log(`   Avec socialMediaInsights: ${stats.withSocialMedia}/${stats.total} (${Math.round(stats.withSocialMedia/stats.total*100)}%)`);
        console.log(`   Avec metadata: ${stats.withMetadata}/${stats.total} (${Math.round(stats.withMetadata/stats.total*100)}%)`);
        console.log(`   Avec validationMetadata: ${stats.withValidationMetadata}/${stats.total} (${Math.round(stats.withValidationMetadata/stats.total*100)}%)`);
        console.log(`   Avec generationMetadata: ${stats.withGenerationMetadata}/${stats.total} (${Math.round(stats.withGenerationMetadata/stats.total*100)}%)`);

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPersonaFields();