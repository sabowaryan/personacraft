#!/usr/bin/env node

import { Command } from 'commander';
import { PrismaClient, Prisma } from '@prisma/client';
import { CulturalDataMigrationService } from '../src/lib/services/cultural-data-migration-service';
import { Persona } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

const prisma = new PrismaClient();
const migrationService = new CulturalDataMigrationService();

interface MigrationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  startTime: Date;
  errors: Array<{ personaId: string; error: string }>;
}

interface PersonaFromDB {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  age: number;
  culturalData: any;
  demographics: any;
  goals: string[];
  location: string;
  marketingInsights: any;
  socialMediaInsights: any;
  occupation: string;
  painPoints: string[];
  psychographics: any;
  qualityScore: number;
  userId: string;
  bio: string | null;
  metadata: any | null;
  quote: string | null;
  email: string | null;
  phone: string | null;
  generationMetadata: any | null;
  validationMetadata: any | null;
  culturalDataSource: string | null;
  templateUsed: string | null;
  processingTime: number | null;
  culturalInsights: any | null;
}

interface MigrationReport {
  summary: {
    totalPersonas: number;
    successfulMigrations: number;
    failedMigrations: number;
    duration: string;
    startTime: string;
    endTime: string;
  };
  details: {
    successful: Array<{ id: string; name: string; migrationTime: number }>;
    failed: Array<{ id: string; name: string; error: string }>;
  };
  integrityReport: {
    averageIntegrityScore: number;
    highQualityMigrations: number;
    mediumQualityMigrations: number;
    lowQualityMigrations: number;
  };
}

class CulturalInsightsMigrationCLI {
  private progress: MigrationProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    startTime: new Date(),
    errors: []
  };

  private spinner = ora();

  /**
   * Migrate all personas in the database
   */
  async migrateAll(options: { dryRun?: boolean; batchSize?: number; outputFile?: string }) {
    const { dryRun = false, batchSize = 10, outputFile } = options;

    console.log(chalk.blue('🚀 Starting Cultural Insights Migration'));
    console.log(chalk.gray(`Dry run: ${dryRun ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`Batch size: ${batchSize}`));

    try {
      // Get total count of personas
      const totalCount = await prisma.persona.count();
      this.progress.total = totalCount;

      if (totalCount === 0) {
        console.log(chalk.yellow('⚠️  No personas found to migrate'));
        return;
      }

      console.log(chalk.green(`📊 Found ${totalCount} personas to migrate`));

      if (dryRun) {
        await this.performDryRun();
        return;
      }

      // Process personas in batches
      const report = await this.processBatches(batchSize);

      // Generate and save report
      if (outputFile) {
        await this.saveReport(report, outputFile);
      }

      this.displayFinalReport(report);

    } catch (error) {
      console.error(chalk.red('❌ Migration failed:'), error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Migrate specific personas by IDs
   */
  async migrateSpecific(personaIds: string[], options: { outputFile?: string }) {
    const { outputFile } = options;

    console.log(chalk.blue('🎯 Starting targeted persona migration'));
    console.log(chalk.gray(`Personas to migrate: ${personaIds.length}`));

    try {
      this.progress.total = personaIds.length;
      const report = await this.migratePersonasByIds(personaIds);

      if (outputFile) {
        await this.saveReport(report, outputFile);
      }

      this.displayFinalReport(report);

    } catch (error) {
      console.error(chalk.red('❌ Targeted migration failed:'), error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Migrate personas for a specific user
   */
  async migrateByUser(userId: string, options: { outputFile?: string }) {
    const { outputFile } = options;

    console.log(chalk.blue(`👤 Starting migration for user: ${userId}`));

    try {
      const personas = await prisma.persona.findMany({
        where: { userId }
      });

      if (personas.length === 0) {
        console.log(chalk.yellow(`⚠️  No personas found for user ${userId}`));
        return;
      }

      this.progress.total = personas.length;
      const personaIds = personas.map(p => p.id);
      const report = await this.migratePersonasByIds(personaIds);

      if (outputFile) {
        await this.saveReport(report, outputFile);
      }

      this.displayFinalReport(report);

    } catch (error) {
      console.error(chalk.red('❌ User migration failed:'), error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Rollback migrations for specific personas
   */
  async rollbackMigrations(personaIds: string[]) {
    console.log(chalk.yellow('🔄 Starting migration rollback'));
    console.log(chalk.gray(`Personas to rollback: ${personaIds.length}`));

    let successCount = 0;
    let failCount = 0;

    for (const personaId of personaIds) {
      try {
        this.spinner.start(`Rolling back persona ${personaId}`);

        const persona = await prisma.persona.findUnique({
          where: { id: personaId }
        });

        if (!persona) {
          console.log(chalk.yellow(`⚠️  Persona ${personaId} not found`));
          continue;
        }

        if (!migrationService.hasRollbackData(personaId)) {
          console.log(chalk.yellow(`⚠️  No rollback data available for persona ${personaId}`));
          continue;
        }

        const rolledBackPersona = await migrationService.rollbackFailedMigration(this.convertToPersona(persona));

        // Update database
        await prisma.persona.update({
          where: { id: personaId },
          data: {
            culturalData: rolledBackPersona.culturalData as any,
            socialMediaInsights: rolledBackPersona.socialMediaInsights as any,
            culturalInsights: Prisma.JsonNull
          }
        });

        successCount++;
        this.spinner.succeed(`Rolled back persona ${personaId}`);

      } catch (error) {
        failCount++;
        this.spinner.fail(`Failed to rollback persona ${personaId}: ${error}`);
      }
    }

    console.log(chalk.green(`✅ Rollback completed: ${successCount} successful, ${failCount} failed`));
  }

  /**
   * Generate migration status report
   */
  async generateStatusReport(outputFile?: string) {
    console.log(chalk.blue('📋 Generating migration status report'));

    try {
      const allPersonas = await prisma.persona.findMany({
        select: {
          id: true,
          name: true,
          culturalData: true,
          culturalInsights: true,
          socialMediaInsights: true,
          updatedAt: true
        }
      });

      const report = {
        generatedAt: new Date().toISOString(),
        totalPersonas: allPersonas.length,
        migrationStatus: {
          migrated: 0,
          notMigrated: 0,
          partiallyMigrated: 0
        },
        details: allPersonas.map(persona => {
          const hasCulturalData = !!persona.culturalData;
          const hasCulturalInsights = !!persona.culturalInsights;
          const hasSocialMedia = !!persona.socialMediaInsights;

          let status: 'migrated' | 'not_migrated' | 'partially_migrated';

          if (hasCulturalInsights) {
            status = 'migrated';
            report.migrationStatus.migrated++;
          } else if (hasCulturalData || hasSocialMedia) {
            status = 'not_migrated';
            report.migrationStatus.notMigrated++;
          } else {
            status = 'partially_migrated';
            report.migrationStatus.partiallyMigrated++;
          }

          return {
            id: persona.id,
            name: persona.name,
            status,
            hasCulturalData,
            hasCulturalInsights,
            hasSocialMedia,
            lastUpdated: persona.updatedAt
          };
        })
      };

      if (outputFile) {
        const reportPath = path.resolve(outputFile);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(chalk.green(`📄 Report saved to: ${reportPath}`));
      } else {
        console.log(JSON.stringify(report, null, 2));
      }

    } catch (error) {
      console.error(chalk.red('❌ Failed to generate status report:'), error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Validate migration integrity for all personas
   */
  async validateIntegrity(options: { fix?: boolean; outputFile?: string }) {
    const { fix = false, outputFile } = options;

    console.log(chalk.blue('🔍 Validating migration integrity'));
    console.log(chalk.gray(`Auto-fix issues: ${fix ? 'Yes' : 'No'}`));

    try {
      const personas = await prisma.persona.findMany();
      const validationResults = [];

      for (const persona of personas) {
        this.spinner.start(`Validating persona ${persona.name}`);

        const validation = migrationService.validatePersonaIntegrity(this.convertToPersona(persona));

        validationResults.push({
          personaId: persona.id,
          personaName: persona.name,
          isValid: validation.isValid,
          score: validation.score,
          errors: validation.errors,
          warnings: validation.warnings
        });

        if (validation.isValid) {
          this.spinner.succeed(`✅ ${persona.name} - Valid (Score: ${validation.score})`);
        } else {
          this.spinner.fail(`❌ ${persona.name} - Invalid (Score: ${validation.score})`);

          if (fix && migrationService.hasRollbackData(persona.id)) {
            try {
              await migrationService.rollbackFailedMigration(this.convertToPersona(persona));
              console.log(chalk.yellow(`🔧 Auto-fixed persona ${persona.name}`));
            } catch (fixError) {
              console.log(chalk.red(`❌ Failed to auto-fix persona ${persona.name}: ${fixError}`));
            }
          }
        }
      }

      const summary = {
        total: validationResults.length,
        valid: validationResults.filter(r => r.isValid).length,
        invalid: validationResults.filter(r => !r.isValid).length,
        averageScore: validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length,
        details: validationResults
      };

      if (outputFile) {
        const reportPath = path.resolve(outputFile);
        fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
        console.log(chalk.green(`📄 Validation report saved to: ${reportPath}`));
      }

      console.log(chalk.blue('\n📊 Validation Summary:'));
      console.log(chalk.green(`✅ Valid: ${summary.valid}`));
      console.log(chalk.red(`❌ Invalid: ${summary.invalid}`));
      console.log(chalk.blue(`📈 Average Score: ${summary.averageScore.toFixed(2)}`));

    } catch (error) {
      console.error(chalk.red('❌ Validation failed:'), error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Perform a dry run to analyze what would be migrated
   */
  private async performDryRun() {
    console.log(chalk.yellow('🔍 Performing dry run analysis...'));

    const personas = await prisma.persona.findMany({
      select: {
        id: true,
        name: true,
        culturalData: true,
        culturalInsights: true,
        socialMediaInsights: true
      }
    });

    const analysis = {
      needsMigration: 0,
      alreadyMigrated: 0,
      hasComplexSocialMedia: 0,
      hasSimpleCultural: 0,
      isEmpty: 0
    };

    for (const persona of personas) {
      if (persona.culturalInsights) {
        analysis.alreadyMigrated++;
      } else if (persona.culturalData || persona.socialMediaInsights) {
        analysis.needsMigration++;

        if (persona.socialMediaInsights) {
          analysis.hasComplexSocialMedia++;
        }
        if (persona.culturalData) {
          analysis.hasSimpleCultural++;
        }
      } else {
        analysis.isEmpty++;
      }
    }

    console.log(chalk.blue('\n📊 Dry Run Analysis:'));
    console.log(chalk.green(`✅ Already migrated: ${analysis.alreadyMigrated}`));
    console.log(chalk.yellow(`🔄 Needs migration: ${analysis.needsMigration}`));
    console.log(chalk.blue(`📱 Has social media insights: ${analysis.hasComplexSocialMedia}`));
    console.log(chalk.blue(`📚 Has cultural data: ${analysis.hasSimpleCultural}`));
    console.log(chalk.gray(`⚪ Empty personas: ${analysis.isEmpty}`));
  }

  /**
   * Process personas in batches
   */
  private async processBatches(batchSize: number): Promise<MigrationReport> {
    const report: MigrationReport = {
      summary: {
        totalPersonas: this.progress.total,
        successfulMigrations: 0,
        failedMigrations: 0,
        duration: '',
        startTime: this.progress.startTime.toISOString(),
        endTime: ''
      },
      details: {
        successful: [],
        failed: []
      },
      integrityReport: {
        averageIntegrityScore: 0,
        highQualityMigrations: 0,
        mediumQualityMigrations: 0,
        lowQualityMigrations: 0
      }
    };

    let offset = 0;
    const integrityScores: number[] = [];

    while (offset < this.progress.total) {
      const batch = await prisma.persona.findMany({
        skip: offset,
        take: batchSize
      });

      console.log(chalk.blue(`\n📦 Processing batch ${Math.floor(offset / batchSize) + 1}/${Math.ceil(this.progress.total / batchSize)}`));

      for (const persona of batch) {
        const startTime = Date.now();
        this.progress.current = persona.name;

        this.spinner.start(`Migrating ${persona.name}`);

        try {
          // Skip if already migrated
          if (persona.culturalInsights) {
            this.spinner.info(`⏭️  ${persona.name} already migrated`);
            continue;
          }

          const migratedPersona = await migrationService.migratePersona(this.convertToPersona(persona));

          // Update database
          await prisma.persona.update({
            where: { id: persona.id },
            data: {
              culturalInsights: migratedPersona.culturalInsights as any
            }
          });

          const migrationTime = Date.now() - startTime;
          this.progress.completed++;

          // Validate integrity
          const validation = migrationService.validatePersonaIntegrity(migratedPersona);
          integrityScores.push(validation.score);

          if (validation.score >= 80) {
            report.integrityReport.highQualityMigrations++;
          } else if (validation.score >= 60) {
            report.integrityReport.mediumQualityMigrations++;
          } else {
            report.integrityReport.lowQualityMigrations++;
          }

          report.details.successful.push({
            id: persona.id,
            name: persona.name,
            migrationTime
          });

          report.summary.successfulMigrations++;
          this.spinner.succeed(`✅ ${persona.name} (${migrationTime}ms, Score: ${validation.score})`);

        } catch (error) {
          this.progress.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          this.progress.errors.push({
            personaId: persona.id,
            error: errorMessage
          });

          report.details.failed.push({
            id: persona.id,
            name: persona.name,
            error: errorMessage
          });

          report.summary.failedMigrations++;
          this.spinner.fail(`❌ ${persona.name}: ${errorMessage}`);
        }

        // Progress update
        const progressPercent = Math.round((this.progress.completed + this.progress.failed) / this.progress.total * 100);
        console.log(chalk.gray(`Progress: ${progressPercent}% (${this.progress.completed + this.progress.failed}/${this.progress.total})`));
      }

      offset += batchSize;
    }

    // Calculate final metrics
    const endTime = new Date();
    const duration = endTime.getTime() - this.progress.startTime.getTime();

    report.summary.endTime = endTime.toISOString();
    report.summary.duration = this.formatDuration(duration);
    report.integrityReport.averageIntegrityScore = integrityScores.length > 0
      ? integrityScores.reduce((sum, score) => sum + score, 0) / integrityScores.length
      : 0;

    return report;
  }

  /**
   * Migrate specific personas by their IDs
   */
  private async migratePersonasByIds(personaIds: string[]): Promise<MigrationReport> {
    const report: MigrationReport = {
      summary: {
        totalPersonas: personaIds.length,
        successfulMigrations: 0,
        failedMigrations: 0,
        duration: '',
        startTime: this.progress.startTime.toISOString(),
        endTime: ''
      },
      details: {
        successful: [],
        failed: []
      },
      integrityReport: {
        averageIntegrityScore: 0,
        highQualityMigrations: 0,
        mediumQualityMigrations: 0,
        lowQualityMigrations: 0
      }
    };

    const integrityScores: number[] = [];

    for (const personaId of personaIds) {
      const startTime = Date.now();

      try {
        const persona = await prisma.persona.findUnique({
          where: { id: personaId }
        });

        if (!persona) {
          throw new Error(`Persona with ID ${personaId} not found`);
        }

        this.spinner.start(`Migrating ${persona.name}`);

        // Skip if already migrated
        if (persona.culturalInsights) {
          this.spinner.info(`⏭️  ${persona.name} already migrated`);
          continue;
        }

        const migratedPersona = await migrationService.migratePersona(this.convertToPersona(persona));

        // Update database
        await prisma.persona.update({
          where: { id: personaId },
          data: {
            culturalInsights: migratedPersona.culturalInsights as any
          }
        });

        const migrationTime = Date.now() - startTime;
        this.progress.completed++;

        // Validate integrity
        const validation = migrationService.validatePersonaIntegrity(migratedPersona);
        integrityScores.push(validation.score);

        if (validation.score >= 80) {
          report.integrityReport.highQualityMigrations++;
        } else if (validation.score >= 60) {
          report.integrityReport.mediumQualityMigrations++;
        } else {
          report.integrityReport.lowQualityMigrations++;
        }

        report.details.successful.push({
          id: persona.id,
          name: persona.name,
          migrationTime
        });

        report.summary.successfulMigrations++;
        this.spinner.succeed(`✅ ${persona.name} (${migrationTime}ms, Score: ${validation.score})`);

      } catch (error) {
        this.progress.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        this.progress.errors.push({
          personaId,
          error: errorMessage
        });

        report.details.failed.push({
          id: personaId,
          name: `Unknown (${personaId})`,
          error: errorMessage
        });

        report.summary.failedMigrations++;
        this.spinner.fail(`❌ ${personaId}: ${errorMessage}`);
      }
    }

    // Calculate final metrics
    const endTime = new Date();
    const duration = endTime.getTime() - this.progress.startTime.getTime();

    report.summary.endTime = endTime.toISOString();
    report.summary.duration = this.formatDuration(duration);
    report.integrityReport.averageIntegrityScore = integrityScores.length > 0
      ? integrityScores.reduce((sum, score) => sum + score, 0) / integrityScores.length
      : 0;

    return report;
  }

  /**
   * Save migration report to file
   */
  private async saveReport(report: MigrationReport, outputFile: string) {
    const reportPath = path.resolve(outputFile);
    const reportDir = path.dirname(reportPath);

    // Ensure directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`📄 Migration report saved to: ${reportPath}`));
  }

  /**
   * Display final migration report
   */
  private displayFinalReport(report: MigrationReport) {
    console.log(chalk.blue('\n🎉 Migration Complete!'));
    console.log(chalk.blue('='.repeat(50)));

    console.log(chalk.green(`✅ Successful: ${report.summary.successfulMigrations}`));
    console.log(chalk.red(`❌ Failed: ${report.summary.failedMigrations}`));
    console.log(chalk.blue(`⏱️  Duration: ${report.summary.duration}`));
    console.log(chalk.blue(`📊 Average Integrity Score: ${report.integrityReport.averageIntegrityScore.toFixed(2)}`));

    console.log(chalk.blue('\n📈 Quality Distribution:'));
    console.log(chalk.green(`🟢 High Quality (80+): ${report.integrityReport.highQualityMigrations}`));
    console.log(chalk.yellow(`🟡 Medium Quality (60-79): ${report.integrityReport.mediumQualityMigrations}`));
    console.log(chalk.red(`🔴 Low Quality (<60): ${report.integrityReport.lowQualityMigrations}`));

    if (report.details.failed.length > 0) {
      console.log(chalk.red('\n❌ Failed Migrations:'));
      report.details.failed.forEach(failure => {
        console.log(chalk.red(`  • ${failure.name}: ${failure.error}`));
      });
    }
  }

  /**
   * Convert database persona to Persona type
   */
  private convertToPersona(dbPersona: PersonaFromDB): Persona {
    return {
      id: dbPersona.id,
      name: dbPersona.name,
      createdAt: dbPersona.createdAt.toISOString(),
      updatedAt: dbPersona.updatedAt.toISOString(),
      age: dbPersona.age,
      culturalData: dbPersona.culturalData || {},
      demographics: dbPersona.demographics || {},
      goals: dbPersona.goals || [],
      location: dbPersona.location || '',
      marketingInsights: dbPersona.marketingInsights || {},
      socialMediaInsights: dbPersona.socialMediaInsights,
      occupation: dbPersona.occupation || '',
      painPoints: dbPersona.painPoints || [],
      psychographics: dbPersona.psychographics || {},
      qualityScore: dbPersona.qualityScore || 0,
      bio: dbPersona.bio || '',
      quote: dbPersona.quote || '',
      email: dbPersona.email ?? undefined,
      phone: dbPersona.phone ?? undefined,
      templateUsed: dbPersona.templateUsed ?? undefined,
      culturalInsights: dbPersona.culturalInsights ?? undefined
    };
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// CLI Setup
const program = new Command();
const cli = new CulturalInsightsMigrationCLI();

program
  .name('cultural-insights-migration')
  .description('CLI tool for migrating personas to the new Cultural Insights system')
  .version('1.0.0');

program
  .command('migrate-all')
  .description('Migrate all personas in the database')
  .option('--dry-run', 'Perform a dry run without making changes')
  .option('--batch-size <size>', 'Number of personas to process in each batch', '10')
  .option('--output <file>', 'Save migration report to file')
  .action(async (options) => {
    await cli.migrateAll({
      dryRun: options.dryRun,
      batchSize: parseInt(options.batchSize),
      outputFile: options.output
    });
  });

program
  .command('migrate-specific')
  .description('Migrate specific personas by ID')
  .argument('<ids...>', 'Persona IDs to migrate')
  .option('--output <file>', 'Save migration report to file')
  .action(async (ids, options) => {
    await cli.migrateSpecific(ids, { outputFile: options.output });
  });

program
  .command('migrate-user')
  .description('Migrate all personas for a specific user')
  .argument('<userId>', 'User ID')
  .option('--output <file>', 'Save migration report to file')
  .action(async (userId, options) => {
    await cli.migrateByUser(userId, { outputFile: options.output });
  });

program
  .command('rollback')
  .description('Rollback migrations for specific personas')
  .argument('<ids...>', 'Persona IDs to rollback')
  .action(async (ids) => {
    await cli.rollbackMigrations(ids);
  });

program
  .command('status')
  .description('Generate migration status report')
  .option('--output <file>', 'Save report to file')
  .action(async (options) => {
    await cli.generateStatusReport(options.output);
  });

program
  .command('validate')
  .description('Validate migration integrity')
  .option('--fix', 'Automatically fix issues where possible')
  .option('--output <file>', 'Save validation report to file')
  .action(async (options) => {
    await cli.validateIntegrity({
      fix: options.fix,
      outputFile: options.output
    });
  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();