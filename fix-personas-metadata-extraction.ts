/**
 * Script pour corriger l'extraction des métadonnées dans l'API /api/personas
 * 
 * Problèmes corrigés :
 * 1. templateUsed (string) - extraction correcte depuis les métadonnées
 * 2. validationMetadata (JSON) - construction correcte de l'objet
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function fixPersonasMetadataExtraction() {
  console.log('🔧 Correction de l\'extraction des métadonnées dans l\'API personas...');
  
  const routePath = join(process.cwd(), 'src/app/api/personas/route.ts');
  
  try {
    // Lire le fichier actuel
    const content = await readFile(routePath, 'utf-8');
    
    // Identifier la section à corriger
    const oldExtraction = `    // Extract generation method from metadata if available
    const generationMethod = metadata?.generationMethod || generationMetadata?.generationMethod || 'unknown';
    const culturalDataSourceFinal = culturalDataSource || metadata?.culturalDataSource || 'unknown';
    
    // Fix: Properly extract templateUsed from validation metadata or generation metadata
    const templateUsedFinal = templateUsed || 
                             metadata?.validation?.templateId || 
                             metadata?.templateUsed || 
                             validationMetadata?.templateId ||
                             'standard';
    
    const processingTimeFinal = processingTime || metadata?.processingTime || 0;

    // Fix: Create proper validationMetadata from generation response
    const validationMetadataFinal = validationMetadata || {
      isValid: metadata?.validation?.isValid || true,
      validationScore: metadata?.validation?.score || 0,
      validatedAt: new Date().toISOString(),
      validationVersion: '1.0',
      templateId: templateUsedFinal,
      validationTime: metadata?.validation?.validationTime || 0,
      errorCount: metadata?.validation?.errorCount || 0,
      warningCount: metadata?.validation?.warningCount || 0,
      retryCount: metadata?.validation?.retryCount || 0,
      issues: metadata?.validation?.errors || []
    };`;

    const newExtraction = `    // Extract generation method from metadata if available
    const generationMethod = metadata?.generationMethod || generationMetadata?.generationMethod || 'unknown';
    const culturalDataSourceFinal = culturalDataSource || metadata?.culturalDataSource || 'unknown';
    
    // Fix: Properly extract templateUsed as string from multiple sources
    const templateUsedFinal = templateUsed || 
                             metadata?.templateUsed || 
                             metadata?.validation?.templateId || 
                             validationMetadata?.templateId ||
                             generationMetadata?.templateUsed ||
                             'standard';
    
    const processingTimeFinal = processingTime || metadata?.processingTime || 0;

    // Fix: Create proper validationMetadata JSON object from generation response
    const validationMetadataFinal = validationMetadata || {
      isValid: metadata?.validation?.isValid ?? true,
      validationScore: metadata?.validation?.score ?? metadata?.validationScore ?? 0,
      validatedAt: new Date().toISOString(),
      validationVersion: '1.0',
      templateId: templateUsedFinal,
      validationTime: metadata?.validation?.validationTime ?? 0,
      errorCount: metadata?.validation?.errorCount ?? metadata?.validationErrors ?? 0,
      warningCount: metadata?.validation?.warningCount ?? metadata?.validationWarnings ?? 0,
      retryCount: metadata?.validation?.retryCount ?? 0,
      issues: metadata?.validation?.errors ?? metadata?.validationIssues ?? []
    };`;

    // Remplacer l'ancienne extraction
    let updatedContent = content.replace(oldExtraction, newExtraction);
    
    // Corriger aussi la sauvegarde des métadonnées
    const oldSave = `        validationMetadata,`;
    const newSave = `        validationMetadata: validationMetadataFinal,`;
    
    updatedContent = updatedContent.replace(oldSave, newSave);
    
    // Vérifier si les changements ont été appliqués
    if (updatedContent === content) {
      console.log('⚠️  Aucun changement détecté - le code pourrait déjà être à jour');
      return;
    }
    
    // Sauvegarder le fichier modifié
    await writeFile(routePath, updatedContent, 'utf-8');
    
    console.log('✅ Correction appliquée avec succès !');
    console.log('\n📋 Changements effectués :');
    console.log('   • templateUsed : extraction améliorée depuis plusieurs sources');
    console.log('   • validationMetadata : construction correcte de l\'objet JSON');
    console.log('   • Utilisation de ?? au lieu de || pour les valeurs booléennes');
    console.log('   • Sauvegarde correcte de validationMetadataFinal');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction :', error);
    throw error;
  }
}

// Exécuter le script
if (require.main === module) {
  fixPersonasMetadataExtraction()
    .then(() => {
      console.log('\n🎉 Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Échec du script :', error);
      process.exit(1);
    });
}

export { fixPersonasMetadataExtraction };