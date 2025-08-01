import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMetadataIssues() {
  console.log('🔧 Correction des problèmes de métadonnées...');

  try {
    // Récupérer tous les personas
    const personas = await prisma.persona.findMany();
    console.log(`📊 ${personas.length} personas trouvés`);

    let updatedCount = 0;

    for (const persona of personas) {
      let needsUpdate = false;
      const updateData: any = {};

      // 1. Corriger templateUsed = "unknown" 
      if (persona.templateUsed === 'unknown' || !persona.templateUsed) {
        // Déterminer le template basé sur les métadonnées existantes
        let templateUsed = 'legacy';
        
        if (persona.generationMetadata) {
          const genMeta = persona.generationMetadata as any;
          if (genMeta.source === 'qloo-first') {
            // Déterminer le type de template basé sur les données
            if (persona.occupation && persona.occupation.toLowerCase().includes('manager') || 
                persona.occupation && persona.occupation.toLowerCase().includes('director') ||
                persona.occupation && persona.occupation.toLowerCase().includes('chef')) {
              templateUsed = 'qloo-first-b2b-persona';
            } else {
              templateUsed = 'qloo-first-persona';
            }
          }
        }
        
        updateData.templateUsed = templateUsed;
        needsUpdate = true;
        console.log(`📝 Persona ${persona.name}: templateUsed "${persona.templateUsed}" → "${templateUsed}"`);
      }

      // 2. Créer validationMetadata si manquant
      if (!persona.validationMetadata) {
        const validationMetadata = {
          templateName: updateData.templateUsed || persona.templateUsed || 'legacy',
          validationScore: persona.qualityScore || 0,
          validationDetails: [],
          failedRules: [],
          passedRules: [],
          validationTime: 0,
          validatedAt: persona.createdAt.toISOString(),
          overallStatus: (persona.qualityScore || 0) >= 70 ? 'passed' : 'warning',
          categoryScores: {
            format: persona.qualityScore || 0,
            content: persona.qualityScore || 0,
            cultural: persona.qualityScore || 0,
            demographic: persona.qualityScore || 0
          }
        };
        
        updateData.validationMetadata = validationMetadata;
        needsUpdate = true;
        console.log(`✅ Persona ${persona.name}: validationMetadata créé`);
      }

      // 3. Mettre à jour generationMetadata.templateUsed si nécessaire
      if (persona.generationMetadata) {
        const genMeta = persona.generationMetadata as any;
        if (genMeta.templateUsed === 'unknown' || !genMeta.templateUsed) {
          const updatedGenMeta = {
            ...genMeta,
            templateUsed: updateData.templateUsed || persona.templateUsed || 'legacy'
          };
          updateData.generationMetadata = updatedGenMeta;
          needsUpdate = true;
          console.log(`🔄 Persona ${persona.name}: generationMetadata.templateUsed mis à jour`);
        }
      }

      // 4. Mettre à jour metadata.templateUsed si nécessaire
      if (persona.metadata) {
        const meta = persona.metadata as any;
        if (meta.templateUsed === 'unknown' || !meta.templateUsed) {
          const updatedMeta = {
            ...meta,
            templateUsed: updateData.templateUsed || persona.templateUsed || 'legacy'
          };
          updateData.metadata = updatedMeta;
          needsUpdate = true;
          console.log(`📋 Persona ${persona.name}: metadata.templateUsed mis à jour`);
        }
      }

      // Appliquer les mises à jour
      if (needsUpdate) {
        await prisma.persona.update({
          where: { id: persona.id },
          data: updateData
        });
        updatedCount++;
      }
    }

    console.log(`✅ ${updatedCount} personas mis à jour avec succès`);
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const updatedPersonas = await prisma.persona.findMany({
      select: {
        id: true,
        name: true,
        templateUsed: true,
        validationMetadata: true,
        generationMetadata: true,
        metadata: true
      }
    });

    let unknownTemplateCount = 0;
    let nullValidationCount = 0;

    for (const persona of updatedPersonas) {
      if (persona.templateUsed === 'unknown' || !persona.templateUsed) {
        unknownTemplateCount++;
      }
      if (!persona.validationMetadata) {
        nullValidationCount++;
      }
    }

    console.log(`📊 Résultats finaux:`);
    console.log(`   - Personas avec templateUsed = "unknown": ${unknownTemplateCount}`);
    console.log(`   - Personas avec validationMetadata = null: ${nullValidationCount}`);

    if (unknownTemplateCount === 0 && nullValidationCount === 0) {
      console.log('🎉 Tous les problèmes ont été corrigés !');
    } else {
      console.log('⚠️  Il reste des problèmes à corriger');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
fixMetadataIssues();