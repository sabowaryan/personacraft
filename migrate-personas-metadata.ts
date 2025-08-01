/**
 * Script de migration pour mettre à jour les métadonnées des personas existants
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePersonasMetadata() {
  console.log('🔄 Début de la migration des métadonnées des personas...\n');

  try {
    // Récupérer tous les personas
    const personas = await prisma.persona.findMany({
      select: {
        id: true,
        name: true,
        generationMetadata: true,
        culturalDataSource: true,
        templateUsed: true,
        processingTime: true,
        createdAt: true
      }
    });

    console.log(`📊 ${personas.length} personas trouvés`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const persona of personas) {
      // Vérifier si le persona a déjà des métadonnées de génération
      const hasGenerationMetadata = persona.generationMetadata && 
        typeof persona.generationMetadata === 'object' && 
        'generationMethod' in persona.generationMetadata;

      if (hasGenerationMetadata) {
        console.log(`⏭️  Persona "${persona.name}" a déjà des métadonnées, ignoré`);
        skippedCount++;
        continue;
      }

      // Déterminer la méthode de génération basée sur les données existantes
      let generationMethod = 'unknown';
      let culturalDataSource = persona.culturalDataSource || 'unknown';
      let templateUsed = persona.templateUsed || 'unknown';

      // Si le persona a des données culturelles, il a probablement été généré avec Qloo
      if (persona.culturalDataSource && persona.culturalDataSource !== 'unknown') {
        generationMethod = 'qloo-first';
      } else {
        // Vérifier la date de création pour estimer la méthode
        const createdAt = new Date(persona.createdAt);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        // Si créé récemment (moins de 7 jours), probablement qloo-first
        if (daysSinceCreation < 7) {
          generationMethod = 'qloo-first';
          culturalDataSource = 'qloo';
        } else {
          generationMethod = 'legacy-fallback';
          culturalDataSource = 'fallback';
        }
      }

      // Mettre à jour les métadonnées
      const updatedGenerationMetadata = {
        source: generationMethod,
        method: generationMethod,
        culturalConstraintsUsed: [],
        processingTime: persona.processingTime || 0,
        qlooDataUsed: culturalDataSource === 'qloo',
        templateUsed: templateUsed,
        generatedAt: persona.createdAt.toISOString(),
        qlooApiCallsCount: culturalDataSource === 'qloo' ? 1 : 0,
        retryCount: 0
      };

      await prisma.persona.update({
        where: { id: persona.id },
        data: {
          generationMetadata: updatedGenerationMetadata,
          culturalDataSource: culturalDataSource,
          templateUsed: templateUsed
        }
      });

      console.log(`✅ Persona "${persona.name}" mis à jour avec ${generationMethod}`);
      updatedCount++;
    }

    console.log(`\n📈 Migration terminée:`);
    console.log(`   ✅ ${updatedCount} personas mis à jour`);
    console.log(`   ⏭️  ${skippedCount} personas ignorés (déjà à jour)`);
    console.log(`   📊 Total: ${personas.length} personas traités`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migratePersonasMetadata().catch(console.error); 