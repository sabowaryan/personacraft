#!/usr/bin/env tsx

/**
 * Script de migration pour intégrer le nouveau système d'optimisation Qloo
 * Ce script remplace les anciens appels API par le nouveau système intégré
 */

import { promises as fs } from 'fs';
import { join } from 'path';

interface MigrationConfig {
  dryRun: boolean;
  verbose: boolean;
  backupFiles: boolean;
}

class QlooSystemMigrator {
  private config: MigrationConfig;
  private migratedFiles: string[] = [];
  private errors: string[] = [];

  constructor(config: MigrationConfig = { dryRun: false, verbose: false, backupFiles: true }) {
    this.config = config;
  }

  async migrate(): Promise<void> {
    console.log('🚀 Démarrage de la migration vers le système optimisé Qloo...\n');

    try {
      // 1. Migrer le QlooSignalExtractor
      await this.migrateSignalExtractor();

      // 2. Migrer les autres services utilisant Qloo
      await this.migrateOtherServices();

      // 3. Mettre à jour les imports
      await this.updateImports();

      // 4. Rapport final
      this.generateReport();

    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }

  private async migrateSignalExtractor(): Promise<void> {
    const filePath = 'src/services/qloo-signal-extractor.ts';
    console.log(`📝 Migration de ${filePath}...`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      if (this.config.backupFiles) {
        await fs.writeFile(`${filePath}.backup`, content);
        console.log(`💾 Sauvegarde créée: ${filePath}.backup`);
      }

      let newContent = content;

      // Ajouter l'import du nouveau système
      const importToAdd = `import { integratedRequestSystem } from '@/lib/api/qloo/integrated-request-system';`;
      
      if (!newContent.includes('integrated-request-system')) {
        const importSection = newContent.match(/^(import.*\n)+/m);
        if (importSection) {
          newContent = newContent.replace(importSection[0], importSection[0] + importToAdd + '\n');
        }
      }

      // Remplacer la méthode fetchEntityData
      const oldFetchEntityData = `    private async fetchEntityData(
        entityType: string,
        context: {
            audienceSignal: string;
            location: string;
            interestCategories: string[];
            valueSignals: Record<string, string>;
            occupation?: string;
        },
        take: number = 3
    ): Promise<string[]> {
        try {
            // Use the existing PersonaEnrichment fetchData method which handles all the complexity
            // This leverages the existing Qloo client infrastructure
            const enrichment = (this.qlooClient as any).enrichment as any;

            if (!enrichment || typeof enrichment.fetchData !== 'function') {
                console.warn(\`Enrichment service not available for \${entityType}, using fallback\`);
                return this.getFallbackDataForEntityType(entityType);
            }

            // Calculate average age from age range for the existing API
            const avgAge = (context.audienceSignal === 'gen-z') ? 22 :
                (context.audienceSignal === 'millennials') ? 30 :`;

      const newFetchEntityData = `    private async fetchEntityData(
        entityType: string,
        context: {
            audienceSignal: string;
            location: string;
            interestCategories: string[];
            valueSignals: Record<string, string>;
            occupation?: string;
        },
        take: number = 3
    ): Promise<string[]> {
        try {
            // Utiliser le nouveau système intégré optimisé
            const avgAge = (context.audienceSignal === 'gen-z') ? 22 :
                (context.audienceSignal === 'millennials') ? 30 :
                (context.audienceSignal === 'gen-x') ? 45 : 35;

            const result = await integratedRequestSystem.makeOptimizedRequest(
                {
                    entityType,
                    age: avgAge,
                    location: context.location,
                    interests: context.interestCategories,
                    occupation: context.occupation
                },
                async () => {
                    // Fallback vers l'ancien système si nécessaire
                    const enrichment = (this.qlooClient as any).enrichment as any;
                    if (!enrichment || typeof enrichment.fetchData !== 'function') {
                        return this.getFallbackDataForEntityType(entityType);
                    }
                    
                    return await enrichment.fetchData({
                        entityType,
                        age: avgAge,
                        location: context.location,
                        interests: context.interestCategories.join(','),
                        take
                    });
                },
                {
                    enableCache: true,
                    enableBatching: true,
                    enablePreloading: true,
                    priority: 'high'
                }
            );

            return Array.isArray(result) ? result : [result];`;

      if (newContent.includes('private async fetchEntityData(')) {
        // Trouver la fin de la méthode
        const methodStart = newContent.indexOf('private async fetchEntityData(');
        const methodEnd = this.findMethodEnd(newContent, methodStart);
        
        if (methodEnd > methodStart) {
          newContent = newContent.substring(0, methodStart) + 
                     newFetchEntityData + 
                     newContent.substring(methodEnd);
        }
      }

      // Ajouter une méthode pour utiliser le batch processing
      const batchMethod = `
    /**
     * Traitement par lot optimisé pour plusieurs entités
     */
    private async fetchMultipleEntitiesOptimized(
        requests: Array<{
            entityType: string;
            context: any;
            take: number;
        }>
    ): Promise<Array<{ entityType: string; data: string[] }>> {
        const batchRequests = requests.map(req => ({
            params: {
                entityType: req.entityType,
                age: this.calculateAverageAge(req.context.audienceSignal),
                location: req.context.location,
                interests: req.context.interestCategories,
                occupation: req.context.occupation
            },
            requestFn: () => this.fetchEntityData(req.entityType, req.context, req.take),
            options: { enableCache: true, enableBatching: true }
        }));

        const results = await integratedRequestSystem.makeBatchRequests(batchRequests);
        
        return results.map((result, index) => ({
            entityType: requests[index].entityType,
            data: Array.isArray(result) ? result : [result]
        }));
    }

    private calculateAverageAge(audienceSignal: string): number {
        switch (audienceSignal) {
            case 'gen-z': return 22;
            case 'millennials': return 30;
            case 'gen-x': return 45;
            case 'baby-boomers': return 65;
            default: return 35;
        }
    }`;

      // Ajouter la méthode avant la dernière accolade
      const lastBraceIndex = newContent.lastIndexOf('}');
      newContent = newContent.substring(0, lastBraceIndex) + batchMethod + '\n' + newContent.substring(lastBraceIndex);

      if (!this.config.dryRun) {
        await fs.writeFile(filePath, newContent);
        console.log(`✅ ${filePath} migré avec succès`);
      } else {
        console.log(`🔍 [DRY RUN] ${filePath} serait migré`);
      }

      this.migratedFiles.push(filePath);

    } catch (error) {
      const errorMsg = `Erreur lors de la migration de ${filePath}: ${error}`;
      this.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  private async migrateOtherServices(): Promise<void> {
    const servicesToMigrate = [
      'src/lib/services/qloo-first-persona-generator.ts',
      'src/hooks/use-persona.ts'
    ];

    for (const servicePath of servicesToMigrate) {
      try {
        const exists = await fs.access(servicePath).then(() => true).catch(() => false);
        if (!exists) {
          console.log(`⚠️  ${servicePath} n'existe pas, ignoré`);
          continue;
        }

        console.log(`📝 Migration de ${servicePath}...`);
        
        const content = await fs.readFile(servicePath, 'utf-8');
        
        if (this.config.backupFiles) {
          await fs.writeFile(`${servicePath}.backup`, content);
        }

        let newContent = content;

        // Ajouter l'import si nécessaire
        if (!newContent.includes('integrated-request-system')) {
          const importToAdd = `import { integratedRequestSystem } from '@/lib/api/qloo/integrated-request-system';\n`;
          const importSection = newContent.match(/^(import.*\n)+/m);
          if (importSection) {
            newContent = newContent.replace(importSection[0], importSection[0] + importToAdd);
          }
        }

        // Remplacer les appels directs par le système optimisé
        newContent = newContent.replace(
          /await\s+this\.qlooClient\./g,
          'await integratedRequestSystem.makeOptimizedRequest(params, async () => this.qlooClient.'
        );

        if (!this.config.dryRun) {
          await fs.writeFile(servicePath, newContent);
          console.log(`✅ ${servicePath} migré avec succès`);
        } else {
          console.log(`🔍 [DRY RUN] ${servicePath} serait migré`);
        }

        this.migratedFiles.push(servicePath);

      } catch (error) {
        const errorMsg = `Erreur lors de la migration de ${servicePath}: ${error}`;
        this.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
  }

  private async updateImports(): Promise<void> {
    console.log('\n📦 Mise à jour des imports...');
    
    // Fichiers à vérifier pour les imports
    const filesToCheck = [
      'src/app/api/personas/route.ts',
      'src/components/personas/PersonaCard.tsx',
      'src/app/debug/performance/page.tsx'
    ];

    for (const filePath of filesToCheck) {
      try {
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!exists) continue;

        const content = await fs.readFile(filePath, 'utf-8');
        
        if (content.includes('qloo') && !content.includes('integrated-request-system')) {
          console.log(`📝 Ajout des imports optimisés dans ${filePath}`);
          
          let newContent = content;
          const importToAdd = `import { integratedRequestSystem } from '@/lib/api/qloo/integrated-request-system';\n`;
          
          const importSection = newContent.match(/^(import.*\n)+/m);
          if (importSection) {
            newContent = newContent.replace(importSection[0], importSection[0] + importToAdd);
          }

          if (!this.config.dryRun) {
            await fs.writeFile(filePath, newContent);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Impossible de mettre à jour ${filePath}: ${error}`);
      }
    }
  }

  private findMethodEnd(content: string, startIndex: number): number {
    let braceCount = 0;
    let inMethod = false;
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inMethod = true;
      } else if (char === '}') {
        braceCount--;
        if (inMethod && braceCount === 0) {
          return i + 1;
        }
      }
    }
    
    return content.length;
  }

  private generateReport(): void {
    console.log('\n📊 RAPPORT DE MIGRATION');
    console.log('========================');
    console.log(`✅ Fichiers migrés: ${this.migratedFiles.length}`);
    
    if (this.migratedFiles.length > 0) {
      console.log('\nFichiers migrés:');
      this.migratedFiles.forEach(file => console.log(`  - ${file}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Erreurs: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('1. Vérifiez les fichiers migrés');
    console.log('2. Testez les nouvelles fonctionnalités');
    console.log('3. Surveillez les performances avec le dashboard');
    console.log('4. Supprimez les fichiers .backup une fois validé');
    
    if (!this.config.dryRun) {
      console.log('\n✨ Migration terminée avec succès !');
    } else {
      console.log('\n🔍 Simulation terminée. Utilisez --execute pour appliquer les changements.');
    }
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  const verbose = args.includes('--verbose');
  const noBackup = args.includes('--no-backup');

  if (args.includes('--help')) {
    console.log(`
Usage: tsx scripts/migrate-to-optimized-system.ts [options]

Options:
  --execute     Applique réellement les changements (par défaut: simulation)
  --verbose     Mode verbeux
  --no-backup   Ne pas créer de fichiers de sauvegarde
  --help        Affiche cette aide

Exemples:
  tsx scripts/migrate-to-optimized-system.ts                    # Simulation
  tsx scripts/migrate-to-optimized-system.ts --execute          # Migration réelle
  tsx scripts/migrate-to-optimized-system.ts --execute --verbose # Migration avec détails
`);
    return;
  }

  const migrator = new QlooSystemMigrator({
    dryRun,
    verbose,
    backupFiles: !noBackup
  });

  try {
    await migrator.migrate();
  } catch (error) {
    console.error('💥 Échec de la migration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { QlooSystemMigrator };