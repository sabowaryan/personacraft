import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCurrentMetadata() {
  console.log('🔍 Analyse des métadonnées actuelles dans la base de données...\n');

  try {
    // Récupérer toutes les personas avec leurs métadonnées
    const personas = await prisma.persona.findMany({
      select: {
        id: true,
        name: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total des personas trouvées: ${personas.length}\n`);

    // Analyser chaque persona
    const issues = [];
    const validPersonas = [];

    for (const persona of personas) {
      console.log(`\n--- Persona: ${persona.name} (ID: ${persona.id}) ---`);

      let metadata;

      // Vérifier si les métadonnées sont null ou undefined
      if (!persona.metadata) {
        console.log('❌ Métadonnées null ou undefined');
        issues.push({
          id: persona.id,
          name: persona.name,
          issue: 'NULL_METADATA',
          details: 'Les métadonnées sont complètement absentes'
        });
        continue;
      }

      try {
        metadata = typeof persona.metadata === 'string'
          ? JSON.parse(persona.metadata)
          : persona.metadata;
      } catch (error) {
        console.log('❌ Erreur de parsing JSON des métadonnées');
        issues.push({
          id: persona.id,
          name: persona.name,
          issue: 'JSON_PARSE_ERROR',
          details: error instanceof Error ? error.message : String(error)
        });
        continue;
      }

      // Vérifier la structure des métadonnées
      const metadataIssues = [];

      // Vérifier les champs requis
      const requiredFields = ['demographics', 'psychographics', 'behavioral', 'professional'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          metadataIssues.push(`Champ manquant: ${field}`);
        }
      }

      // Vérifier demographics
      if (metadata.demographics) {
        const demo = metadata.demographics;
        if (!demo.age_range) metadataIssues.push('demographics.age_range manquant');
        if (!demo.location) metadataIssues.push('demographics.location manquant');
        if (!demo.income_level) metadataIssues.push('demographics.income_level manquant');
        if (!demo.education_level) metadataIssues.push('demographics.education_level manquant');
      }

      // Vérifier psychographics
      if (metadata.psychographics) {
        const psycho = metadata.psychographics;
        if (!psycho.values || !Array.isArray(psycho.values)) {
          metadataIssues.push('psychographics.values manquant ou invalide');
        }
        if (!psycho.interests || !Array.isArray(psycho.interests)) {
          metadataIssues.push('psychographics.interests manquant ou invalide');
        }
        if (!psycho.lifestyle) metadataIssues.push('psychographics.lifestyle manquant');
      }

      // Vérifier behavioral
      if (metadata.behavioral) {
        const behav = metadata.behavioral;
        if (!behav.buying_patterns || !Array.isArray(behav.buying_patterns)) {
          metadataIssues.push('behavioral.buying_patterns manquant ou invalide');
        }
        if (!behav.communication_preferences || !Array.isArray(behav.communication_preferences)) {
          metadataIssues.push('behavioral.communication_preferences manquant ou invalide');
        }
        if (!behav.technology_adoption) metadataIssues.push('behavioral.technology_adoption manquant');
      }

      // Vérifier professional
      if (metadata.professional) {
        const prof = metadata.professional;
        if (!prof.industry) metadataIssues.push('professional.industry manquant');
        if (!prof.job_level) metadataIssues.push('professional.job_level manquant');
        if (!prof.company_size) metadataIssues.push('professional.company_size manquant');
      }

      if (metadataIssues.length > 0) {
        console.log('❌ Problèmes détectés:');
        metadataIssues.forEach(issue => console.log(`   - ${issue}`));
        issues.push({
          id: persona.id,
          name: persona.name,
          issue: 'METADATA_STRUCTURE_ISSUES',
          details: metadataIssues
        });
      } else {
        console.log('✅ Métadonnées valides');
        validPersonas.push(persona);
      }

      // Afficher un aperçu des métadonnées
      console.log('📋 Aperçu des métadonnées:');
      if (metadata.demographics) {
        console.log(`   Age: ${metadata.demographics.age_range || 'N/A'}`);
        console.log(`   Localisation: ${metadata.demographics.location || 'N/A'}`);
      }
      if (metadata.professional) {
        console.log(`   Industrie: ${metadata.professional.industry || 'N/A'}`);
        console.log(`   Niveau: ${metadata.professional.job_level || 'N/A'}`);
      }
    }

    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('📈 RÉSUMÉ DE L\'ANALYSE');
    console.log('='.repeat(60));
    console.log(`✅ Personas valides: ${validPersonas.length}`);
    console.log(`❌ Personas avec problèmes: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n🔧 PROBLÈMES DÉTECTÉS:');
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.name} (ID: ${issue.id})`);
        console.log(`   Type: ${issue.issue}`);
        if (Array.isArray(issue.details)) {
          issue.details.forEach(detail => console.log(`   - ${detail}`));
        } else {
          console.log(`   Détails: ${issue.details}`);
        }
      });

      console.log('\n💡 RECOMMANDATIONS:');
      console.log('1. Exécuter le script fix-metadata-issues.ts pour corriger automatiquement');
      console.log('2. Vérifier les templates de validation');
      console.log('3. Mettre à jour les personas manuellement si nécessaire');
    } else {
      console.log('\n🎉 Toutes les personas ont des métadonnées valides !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
debugCurrentMetadata().catch(console.error);