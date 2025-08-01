/**
 * Script pour nettoyer les données existantes des personas
 * Supprime les champs en double et corrige les métadonnées
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanPersonasData() {
  console.log('🧹 Début du nettoyage des données personas...');

  try {
    // Récupérer tous les personas
    const personas = await prisma.persona.findMany();
    console.log(`📊 ${personas.length} personas trouvés`);

    let updatedCount = 0;
    let cleanedCount = 0;

    for (const persona of personas) {
      let needsUpdate = false;
      const updateData: any = {};

      // 1. Nettoyer culturalData - supprimer les champs en double (pluriel)
      if (persona.culturalData && typeof persona.culturalData === 'object') {
        const culturalData = persona.culturalData as any;
        const cleanedCulturalData: any = {};

        // Garder seulement les champs singuliers
        const singularFields = [
          'music', 'brand', 'restaurant', 'movie', 'tv', 'book', 
          'travel', 'fashion', 'beauty', 'food', 'socialMedia'
        ];

        singularFields.forEach(field => {
          if (culturalData[field]) {
            cleanedCulturalData[field] = culturalData[field];
          }
        });

        // Supprimer les champs pluriels
        const pluralFields = ['books', 'brands', 'movies', 'restaurants'];
        pluralFields.forEach(field => {
          if (culturalData[field]) {
            delete culturalData[field];
            cleanedCount++;
          }
        });

        if (JSON.stringify(culturalData) !== JSON.stringify(cleanedCulturalData)) {
          updateData.culturalData = cleanedCulturalData;
          needsUpdate = true;
        }
      }

      // 2. Corriger les métadonnées de génération
      if (!persona.generationMetadata || persona.generationMetadata === null) {
        // Inférer les métadonnées basées sur la date de création et les données existantes
        const isRecent = new Date(persona.createdAt) > new Date('2025-07-30T20:00:00Z');
        const hasCulturalData = persona.culturalData && Object.keys(persona.culturalData as any).length > 0;
        
        updateData.generationMetadata = {
          generationMethod: isRecent && hasCulturalData ? 'qloo-first' : 'legacy',
          culturalDataSource: hasCulturalData ? 'qloo' : 'none',
          templateUsed: 'unknown',
          processingTime: 0,
          qlooConstraintsUsed: [],
          validationScore: persona.qualityScore || 0,
          validationErrors: 0,
          validationWarnings: 0
        };
        needsUpdate = true;
      }

      // 3. Corriger les champs vides
      if (persona.culturalDataSource === 'unknown' || persona.culturalDataSource === null) {
        const hasCulturalData = persona.culturalData && Object.keys(persona.culturalData as any).length > 0;
        updateData.culturalDataSource = hasCulturalData ? 'qloo' : 'none';
        needsUpdate = true;
      }

      if (persona.templateUsed === 'unknown' || persona.templateUsed === null) {
        updateData.templateUsed = 'unknown';
        needsUpdate = true;
      }

      if (persona.processingTime === null) {
        updateData.processingTime = 0;
        needsUpdate = true;
      }

      // 4. Nettoyer les données génériques dans culturalData
      if (persona.culturalData && typeof persona.culturalData === 'object') {
        const culturalData = persona.culturalData as any;
        let hasGenericData = false;

        Object.keys(culturalData).forEach(key => {
          if (Array.isArray(culturalData[key])) {
            culturalData[key] = culturalData[key].filter((item: string) => 
              !item.includes('item_') && 
              !item.includes('food_item_') && 
              !item.includes('restaurant_item_') &&
              item.trim() !== ''
            );
            if (culturalData[key].length === 0) {
              culturalData[key] = [];
            }
          }
        });

        updateData.culturalData = culturalData;
        needsUpdate = true;
      }

      // Appliquer les mises à jour si nécessaire
      if (needsUpdate) {
        await prisma.persona.update({
          where: { id: persona.id },
          data: updateData
        });
        updatedCount++;
        console.log(`✅ Persona ${persona.name} (${persona.id}) nettoyé`);
      }
    }

    console.log(`\n🎉 Nettoyage terminé !`);
    console.log(`📊 Personas mis à jour: ${updatedCount}`);
    console.log(`🧹 Champs nettoyés: ${cleanedCount}`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
cleanPersonasData()
  .then(() => {
    console.log('✅ Script de nettoyage terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur dans le script:', error);
    process.exit(1);
  }); 