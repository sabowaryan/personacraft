import {
    CulturalInsights,
    CulturalInsight,
    CulturalInsightItem,
    InsightMetadata,
    InsightAnalytics,
    PreferenceAnalysis,
    BehavioralInfluence,
    DemographicAlignment,
    TrendAnalysis,
    MigrationStatus,
    InsightError
} from '@/types/cultural-insights';
import { Persona, CulturalData, SocialMediaInsights } from '@/types';
import { CulturalInsightEngine } from '@/lib/engines/cultural-insight-engine';

/**
 * Cultural Data Migration Service
 * 
 * Handles migration of existing persona data from the old structure
 * (simple culturalData + complex socialMediaInsights) to the new
 * unified CulturalInsights structure.
 */
export class CulturalDataMigrationService {
    private insightEngine: CulturalInsightEngine;
    private migrationLog: MigrationStatus[] = [];
    private integrityValidator: MigrationIntegrityValidator;

    constructor() {
        this.insightEngine = new CulturalInsightEngine({
            enableQlooEnrichment: false, // Disable for migration to preserve original data
            fallbackToSimpleData: true,
            minimumConfidenceThreshold: 0.1, // Lower threshold for migration
            maxItemsPerCategory: 15,
            enableTrendAnalysis: true,
            enableBehavioralAnalysis: true
        });
        this.integrityValidator = new MigrationIntegrityValidator();
    }

    /**
     * Migrate a complete persona from old structure to new cultural insights structure
     * 
     * @param persona - The persona to migrate
     * @returns Promise<Persona> - Migrated persona with cultural insights
     */
    async migratePersona(persona: Persona): Promise<Persona> {
        const migrationId = `migration_${persona.id}_${Date.now()}`;

        try {
            // Initialize migration status
            const migrationStatus: MigrationStatus = {
                personaId: persona.id,
                status: 'in_progress',
                startedAt: new Date().toISOString(),
                preservedDataIntegrity: false,
                logs: []
            };
            this.migrationLog.push(migrationStatus);

            // Create rollback data before migration
            const rollbackData = this.integrityValidator.createRollbackData(persona);

            this.integrityValidator.logMigrationActivity(
                persona.id,
                'migration_started',
                { migrationId, hasRollback: true },
                'info'
            );

            // Create backup of original data for integrity validation
            const originalData = {
                culturalData: persona.culturalData,
                socialMediaInsights: persona.socialMediaInsights
            };

            // Migrate cultural data to insights structure
            this.integrityValidator.logMigrationActivity(
                persona.id,
                'cultural_data_migration_started',
                { categories: Object.keys(persona.culturalData || {}) },
                'info'
            );

            const culturalInsights = await this.migrateCulturalData(persona.culturalData, persona);

            // Integrate existing social media insights if they exist
            if (persona.socialMediaInsights) {
                this.integrityValidator.logMigrationActivity(
                    persona.id,
                    'social_media_migration_started',
                    { hasInsights: true },
                    'info'
                );

                culturalInsights.socialMedia = await this.migrateSocialMediaInsights(
                    persona.socialMediaInsights.insights,
                    persona
                );
            }

            // Create migrated persona
            const migratedPersona: Persona = {
                ...persona,
                culturalInsights,
                // Keep original data for backward compatibility during transition
                culturalData: persona.culturalData,
                socialMediaInsights: persona.socialMediaInsights
            };

            // Enhanced data integrity validation
            const detailedValidation = this.validateDataIntegrityDetailed(originalData, migratedPersona);

            this.integrityValidator.logMigrationActivity(
                persona.id,
                'integrity_validation_completed',
                {
                    isValid: detailedValidation.isValid,
                    score: detailedValidation.score,
                    errorCount: detailedValidation.errors.length,
                    warningCount: detailedValidation.warnings.length
                },
                detailedValidation.isValid ? 'info' : 'warn'
            );

            // Update migration status
            migrationStatus.status = 'completed';
            migrationStatus.completedAt = new Date().toISOString();
            migrationStatus.preservedDataIntegrity = detailedValidation.isValid;
            migrationStatus.logs = this.integrityValidator.getMigrationLogs(persona.id);

            if (!detailedValidation.isValid) {
                migrationStatus.errors = detailedValidation.errors.map(error => ({
                    category: 'general',
                    errorType: 'migration' as const,
                    message: error,
                    recoveryAction: 'Review migrated data and consider rollback if necessary'
                }));

                // Log validation failures
                this.integrityValidator.logMigrationActivity(
                    persona.id,
                    'migration_validation_failed',
                    {
                        errors: detailedValidation.errors,
                        warnings: detailedValidation.warnings,
                        rollbackAvailable: this.integrityValidator.hasRollbackData(persona.id)
                    },
                    'error'
                );
            } else {
                this.integrityValidator.logMigrationActivity(
                    persona.id,
                    'migration_completed_successfully',
                    {
                        validationScore: detailedValidation.score,
                        categoriesMigrated: Object.keys(culturalInsights).length
                    },
                    'info'
                );
            }

            return migratedPersona;

        } catch (error) {
            // Update migration status with error
            const migrationStatus = this.migrationLog.find(m => m.personaId === persona.id);
            if (migrationStatus) {
                migrationStatus.status = 'failed';
                migrationStatus.completedAt = new Date().toISOString();
                migrationStatus.errors = [{
                    category: 'general',
                    errorType: 'migration',
                    message: error instanceof Error ? error.message : 'Unknown migration error',
                    recoveryAction: 'Retry migration or use rollback if available'
                }];
                migrationStatus.logs = this.integrityValidator.getMigrationLogs(persona.id);
            }

            this.integrityValidator.logMigrationActivity(
                persona.id,
                'migration_failed',
                {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    rollbackAvailable: this.integrityValidator.hasRollbackData(persona.id)
                },
                'error'
            );

            console.error(`Migration failed for persona ${persona.id}:`, error);
            throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Migrate simple cultural data to insights structure
     * 
     * @param culturalData - The simple cultural data to migrate
     * @param persona - The persona context for migration
     * @returns Promise<CulturalInsights> - Migrated cultural insights
     */
    async migrateCulturalData(culturalData: CulturalData, persona: Persona): Promise<CulturalInsights> {
        try {
            // Handle null or undefined cultural data
            if (!culturalData) {
                throw new Error('Cultural data is null or undefined');
            }

            const categories = [
                'music', 'brand', 'movie', 'tv', 'book',
                'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'
            ];

            const insights: Partial<CulturalInsights> = {};

            // Migrate each category
            for (const category of categories) {
                const categoryData = culturalData[category as keyof CulturalData] || [];
                insights[category as keyof CulturalInsights] = await this.migrateCategoryData(
                    category,
                    categoryData,
                    persona
                );
            }

            return insights as CulturalInsights;

        } catch (error) {
            console.error('Error migrating cultural data:', error);
            throw new Error(`Cultural data migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Migrate existing social media insights to unified structure
     * 
     * @param socialMediaInsights - The existing social media insights
     * @param persona - The persona context for migration
     * @returns Promise<CulturalInsight> - Migrated social media insight
     */
    async migrateSocialMediaInsights(
        socialMediaInsights: SocialMediaInsights,
        persona: Persona
    ): Promise<CulturalInsight> {
        try {
            // Extract platform names from audience matches and brand influence
            const platforms = new Set<string>();

            // Add platforms from audience matches
            socialMediaInsights.audienceMatches.forEach(match => {
                // Extract platform from name if it contains platform indicators
                const platformIndicators = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin'];
                platformIndicators.forEach(platform => {
                    if (match.name.toLowerCase().includes(platform)) {
                        platforms.add(platform);
                    }
                });
            });

            // Add platforms from brand influence
            socialMediaInsights.brandInfluence.forEach(brand => {
                brand.platforms.forEach(platform => platforms.add(platform.toLowerCase()));
            });

            // Add platforms from demographic alignment
            socialMediaInsights.demographicAlignment.forEach(demo => {
                demo.primaryPlatforms.forEach(platform => platforms.add(platform.toLowerCase()));
            });

            // Convert to insight items
            const items: CulturalInsightItem[] = Array.from(platforms).map(platform => ({
                name: platform,
                relevanceScore: this.calculateSocialMediaRelevanceScore(platform, socialMediaInsights),
                confidence: this.calculateSocialMediaConfidence(platform, socialMediaInsights),
                source: 'user' as const,
                attributes: {
                    category: 'social_media',
                    engagementLevel: this.inferEngagementLevel(platform, socialMediaInsights),
                    audienceSize: this.inferAudienceSize(platform, socialMediaInsights),
                    contentTypes: this.inferContentTypes(platform, socialMediaInsights)
                },
                relationships: this.findSocialMediaRelationships(platform, Array.from(platforms))
            }));

            // Generate metadata
            const metadata: InsightMetadata = {
                generatedAt: new Date().toISOString(),
                source: 'user',
                dataQuality: 'high', // Original insights were complex, so quality is high
                enrichmentLevel: 85 // High enrichment from existing complex data
            };

            // Generate analytics based on existing insights
            const analytics: InsightAnalytics = {
                preferences: this.analyzeSocialMediaPreferences(socialMediaInsights),
                behavioralInfluence: this.analyzeSocialMediaBehavioralInfluence(socialMediaInsights),
                demographicAlignment: this.analyzeSocialMediaDemographicAlignment(socialMediaInsights, persona),
                trends: this.analyzeSocialMediaTrends(socialMediaInsights)
            };

            return {
                category: 'socialMedia',
                items,
                metadata,
                analytics
            };

        } catch (error) {
            console.error('Error migrating social media insights:', error);

            // Return fallback insight if migration fails
            return this.createFallbackSocialMediaInsight(persona);
        }
    }

    /**
     * Validate that data integrity is preserved during migration
     * 
     * @param originalData - The original data before migration
     * @param migratedPersona - The persona after migration
     * @returns boolean - True if data integrity is preserved
     */
    preserveDataIntegrity(
        originalData: { culturalData: CulturalData; socialMediaInsights?: any },
        migratedPersona: Persona
    ): boolean {
        try {
            // Check that all original cultural data categories are preserved
            const originalCategories = Object.keys(originalData.culturalData);
            const migratedCategories = migratedPersona.culturalInsights ?
                Object.keys(migratedPersona.culturalInsights) : [];

            // Verify all categories are present
            for (const category of originalCategories) {
                if (!migratedCategories.includes(category)) {
                    console.warn(`Category ${category} missing in migrated data`);
                    return false;
                }

                // Check that items are preserved
                const originalItems = originalData.culturalData[category as keyof CulturalData] || [];
                const migratedItems = migratedPersona.culturalInsights?.[category as keyof CulturalInsights]?.items || [];

                // Verify all original items are present in migrated data
                for (const originalItem of originalItems) {
                    const found = migratedItems.some(item => item.name === originalItem);
                    if (!found) {
                        console.warn(`Item ${originalItem} missing in migrated ${category} data`);
                        return false;
                    }
                }
            }

            // Check social media insights preservation if they existed
            if (originalData.socialMediaInsights && migratedPersona.culturalInsights?.socialMedia) {
                const originalPlatforms = this.extractPlatformsFromSocialInsights(originalData.socialMediaInsights.insights);
                const migratedPlatforms = migratedPersona.culturalInsights.socialMedia.items.map(item => item.name);

                // Verify platform preservation (allowing for some transformation)
                if (originalPlatforms.length > 0 && migratedPlatforms.length === 0) {
                    console.warn('Social media platforms not preserved in migration');
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error('Error validating data integrity:', error);
            return false;
        }
    }

    /**
     * Get migration status for a persona
     * 
     * @param personaId - The persona ID to check
     * @returns MigrationStatus | undefined - Migration status if found
     */
    getMigrationStatus(personaId: string): MigrationStatus | undefined {
        return this.migrationLog.find(status => status.personaId === personaId);
    }

    /**
     * Get all migration logs
     * 
     * @returns MigrationStatus[] - All migration logs
     */
    getAllMigrationLogs(): MigrationStatus[] {
        return [...this.migrationLog];
    }

    /**
     * Clear migration logs
     */
    clearMigrationLogs(): void {
        this.migrationLog = [];
        this.integrityValidator.clearMigrationLogs();
    }

    /**
     * Rollback a failed migration using stored rollback data
     * 
     * @param migratedPersona - The persona after failed migration
     * @returns Promise<Persona> - The restored persona
     */
    async rollbackFailedMigration(migratedPersona: Persona): Promise<Persona> {
        try {
            const restoredPersona = await this.integrityValidator.rollbackMigration(migratedPersona);

            // Update migration status
            const migrationStatus = this.migrationLog.find(m => m.personaId === migratedPersona.id);
            if (migrationStatus) {
                migrationStatus.status = 'failed';
                migrationStatus.completedAt = new Date().toISOString();
                migrationStatus.errors = [{
                    category: 'general',
                    errorType: 'migration',
                    message: 'Migration rolled back due to validation failure',
                    recoveryAction: 'Migration was successfully rolled back to original state'
                }];
                migrationStatus.logs = this.integrityValidator.getMigrationLogs(migratedPersona.id);
            }

            return restoredPersona;
        } catch (error) {
            this.integrityValidator.logMigrationActivity(
                migratedPersona.id,
                'rollback_failed',
                { error: error instanceof Error ? error.message : 'Unknown error' },
                'error'
            );
            throw error;
        }
    }

    /**
     * Check if rollback is available for a persona
     * 
     * @param personaId - The persona ID
     * @returns boolean - True if rollback data exists
     */
    hasRollbackData(personaId: string): boolean {
        return this.integrityValidator.hasRollbackData(personaId);
    }

    /**
     * Get detailed migration logs for a persona
     * 
     * @param personaId - The persona ID
     * @returns Array of migration log entries
     */
    getDetailedMigrationLogs(personaId: string) {
        return this.integrityValidator.getMigrationLogs(personaId);
    }

    /**
     * Export all migration logs for analysis
     * 
     * @param format - Export format ('json' or 'csv')
     * @returns string - Formatted logs
     */
    exportMigrationLogs(format: 'json' | 'csv' = 'json'): string {
        return this.integrityValidator.exportMigrationLogs(format);
    }

    /**
     * Clean up old rollback data and logs
     * 
     * @param olderThanHours - Remove data older than specified hours (default: 24)
     */
    cleanupOldData(olderThanHours: number = 24): void {
        this.integrityValidator.cleanupRollbackData(olderThanHours);

        // Clean up old migration logs
        const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000)).toISOString();
        this.integrityValidator.clearMigrationLogs(cutoffTime);
    }

    /**
     * Validate data integrity without performing migration
     * 
     * @param persona - The persona to validate
     * @returns IntegrityValidationResult - Validation result
     */
    validatePersonaIntegrity(persona: Persona): IntegrityValidationResult {
        const originalData = {
            culturalData: persona.culturalData,
            socialMediaInsights: persona.socialMediaInsights
        };

        return this.validateDataIntegrityDetailed(originalData, persona);
    }

    /**
     * Enhanced data integrity validation with detailed reporting
     * 
     * @param originalData - The original data before migration
     * @param migratedPersona - The persona after migration
     * @returns IntegrityValidationResult - Detailed validation result
     */
    validateDataIntegrityDetailed(
        originalData: { culturalData: CulturalData; socialMediaInsights?: any },
        migratedPersona: Persona
    ): IntegrityValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        let score = 100;

        try {
            // Validate cultural data preservation
            const culturalValidation = this.validateCulturalDataIntegrity(
                originalData.culturalData,
                migratedPersona.culturalInsights
            );

            errors.push(...culturalValidation.errors);
            warnings.push(...culturalValidation.warnings);
            score -= culturalValidation.penaltyPoints;

            // Validate social media insights preservation if they existed
            if (originalData.socialMediaInsights && migratedPersona.culturalInsights?.socialMedia) {
                const socialValidation = this.validateSocialMediaIntegrity(
                    originalData.socialMediaInsights.insights,
                    migratedPersona.culturalInsights.socialMedia
                );

                errors.push(...socialValidation.errors);
                warnings.push(...socialValidation.warnings);
                score -= socialValidation.penaltyPoints;
            }

            // Validate metadata consistency
            const metadataValidation = this.validateMetadataConsistency(migratedPersona.culturalInsights);
            errors.push(...metadataValidation.errors);
            warnings.push(...metadataValidation.warnings);
            score -= metadataValidation.penaltyPoints;

            // Validate analytics completeness
            const analyticsValidation = this.validateAnalyticsCompleteness(migratedPersona.culturalInsights);
            errors.push(...analyticsValidation.errors);
            warnings.push(...analyticsValidation.warnings);
            score -= analyticsValidation.penaltyPoints;

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                score: Math.max(0, score),
                details: {
                    culturalDataPreserved: culturalValidation.errors.length === 0,
                    socialMediaPreserved: originalData.socialMediaInsights ?
                        this.validateSocialMediaIntegrity(originalData.socialMediaInsights.insights, migratedPersona.culturalInsights?.socialMedia).errors.length === 0 :
                        true,
                    metadataConsistent: metadataValidation.errors.length === 0,
                    analyticsComplete: analyticsValidation.errors.length === 0
                }
            };

        } catch (error) {
            return {
                isValid: false,
                errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
                warnings: [],
                score: 0,
                details: {
                    culturalDataPreserved: false,
                    socialMediaPreserved: false,
                    metadataConsistent: false,
                    analyticsComplete: false
                }
            };
        }
    }

    /**
     * Create rollback data for migration recovery
     * 
     * @param persona - The persona before migration
     * @returns RollbackData - Data needed for rollback
     */
    createRollbackData(persona: Persona): RollbackData {
        return {
            personaId: persona.id,
            timestamp: new Date().toISOString(),
            originalCulturalData: JSON.parse(JSON.stringify(persona.culturalData)),
            originalSocialMediaInsights: persona.socialMediaInsights ?
                JSON.parse(JSON.stringify(persona.socialMediaInsights)) : undefined,
            checksum: this.calculateDataChecksum(persona),
            backupMetadata: {
                version: '1.0',
                createdBy: 'migration-service',
                dataSize: this.calculateDataSize(persona),
                categories: Object.keys(persona.culturalData || {}),
                hasSocialMedia: !!persona.socialMediaInsights
            }
        };
    }

    /**
     * Rollback a failed migration
     * 
     * @param migratedPersona - The persona after failed migration
     * @param rollbackData - The rollback data
     * @returns Persona - The restored persona
     */
    rollbackMigration(migratedPersona: Persona, rollbackData: RollbackData): Persona {
        try {
            // Verify rollback data integrity
            if (rollbackData.personaId !== migratedPersona.id) {
                throw new Error('Rollback data persona ID mismatch');
            }

            // Restore original data
            const restoredPersona: Persona = {
                ...migratedPersona,
                culturalData: rollbackData.originalCulturalData,
                socialMediaInsights: rollbackData.originalSocialMediaInsights,
                culturalInsights: undefined // Remove migrated insights
            };

            // Verify checksum if possible
            const restoredChecksum = this.calculateDataChecksum(restoredPersona);
            if (restoredChecksum !== rollbackData.checksum) {
                console.warn('Rollback checksum mismatch - data may have been modified');
            }

            // Log rollback
            console.log(`Rollback completed for persona ${rollbackData.personaId}`);

            return restoredPersona;

        } catch (error) {
            console.error('Rollback failed:', error);
            throw new Error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Comprehensive logging for migration tracking
     * 
     * @param personaId - The persona ID
     * @param operation - The operation being performed
     * @param details - Additional details
     * @param level - Log level
     */
    logMigrationActivity(
        personaId: string,
        operation: string,
        details: any,
        level: 'info' | 'warn' | 'error' = 'info'
    ): void {
        const logEntry: MigrationLogEntry = {
            id: `${personaId}_${operation}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            personaId,
            operation,
            details,
            level,
            sessionId: this.generateSessionId(),
            stackTrace: level === 'error' ? new Error().stack : undefined
        };

        // In a real application, this would write to a proper logging system
        console[level](`Migration ${operation} for ${personaId}:`, logEntry);

        // Store in migration log for tracking
        const migrationStatus = this.migrationLog.find(m => m.personaId === personaId);
        if (migrationStatus) {
            if (!migrationStatus.logs) {
                migrationStatus.logs = [];
            }
            migrationStatus.logs.push(logEntry);
        }
    }

    // Private helper methods

    /**
     * Generate a unique session ID for tracking
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Migrate a single category of cultural data
     */
    private async migrateCategoryData(
        category: string,
        categoryData: string[],
        persona: Persona
    ): Promise<CulturalInsight> {
        try {
            // Create insight items from simple string data
            const items: CulturalInsightItem[] = categoryData.map(item => ({
                name: item,
                relevanceScore: this.calculateMigrationRelevanceScore(item, persona, category),
                confidence: 0.7, // Moderate confidence for migrated data
                source: 'user' as const,
                attributes: this.generateMigrationAttributes(item, category),
                relationships: this.findMigrationRelationships(item, categoryData)
            }));

            // Generate metadata
            const metadata: InsightMetadata = {
                generatedAt: new Date().toISOString(),
                source: 'user',
                dataQuality: categoryData.length > 0 ? 'medium' : 'low',
                enrichmentLevel: Math.min(70, categoryData.length * 10) // Based on data richness
            };

            // Generate analytics
            const analytics: InsightAnalytics = {
                preferences: this.generateMigrationPreferences(items),
                behavioralInfluence: this.generateMigrationBehavioralInfluence(items, category),
                demographicAlignment: this.generateMigrationDemographicAlignment(items, persona),
                trends: this.generateMigrationTrends(items, category)
            };

            return {
                category,
                items,
                metadata,
                analytics
            };

        } catch (error) {
            console.error(`Error migrating category ${category}:`, error);

            // Return empty insight structure if migration fails
            return this.createEmptyInsight(category);
        }
    }
    /**
       * Calculate relevance score for migrated items
       */
    private calculateMigrationRelevanceScore(item: string, persona: Persona, category: string): number {
        let score = 60; // Base score for existing data

        // Adjust based on persona characteristics
        if (persona.age) {
            score += this.getAgeRelevanceBoost(item, persona.age, category);
        }

        if (persona.occupation) {
            score += this.getOccupationRelevanceBoost(item, persona.occupation, category);
        }

        if (persona.psychographics?.interests) {
            score += this.getInterestRelevanceBoost(item, persona.psychographics.interests);
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate attributes for migrated items
     */
    private generateMigrationAttributes(item: string, category: string): Record<string, any> {
        const attributes: Record<string, any> = {
            migrated: true,
            originalCategory: category
        };

        // Add category-specific attributes
        switch (category) {
            case 'music':
                attributes.type = 'artist_or_genre';
                break;
            case 'brand':
                attributes.type = 'brand';
                break;
            case 'movie':
            case 'tv':
                attributes.type = 'entertainment';
                break;
            case 'restaurant':
                attributes.type = 'dining';
                break;
            case 'travel':
                attributes.type = 'destination';
                break;
            default:
                attributes.type = 'general';
        }

        return attributes;
    }

    /**
     * Find relationships for migrated items
     */
    private findMigrationRelationships(item: string, allItems: string[]): string[] {
        const relationships: string[] = [];
        const itemLower = item.toLowerCase();

        for (const otherItem of allItems) {
            if (otherItem === item) continue;

            const otherLower = otherItem.toLowerCase();

            // Simple relationship detection
            if (itemLower.includes(otherLower) || otherLower.includes(itemLower)) {
                relationships.push(otherItem);
            }
        }

        return relationships.slice(0, 2); // Limit relationships
    }

    /**
     * Generate preferences for migrated data
     */
    private generateMigrationPreferences(items: CulturalInsightItem[]): PreferenceAnalysis {
        const sortedItems = items.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return {
            primaryPreferences: sortedItems.slice(0, 3).map(item => item.name),
            secondaryPreferences: sortedItems.slice(3, 6).map(item => item.name),
            emergingInterests: [], // No emerging interests for migrated data
            preferenceStrength: Math.round(
                sortedItems.reduce((sum, item) => sum + item.relevanceScore, 0) / sortedItems.length
            )
        };
    }

    /**
     * Generate behavioral influence for migrated data
     */
    private generateMigrationBehavioralInfluence(items: CulturalInsightItem[], category: string): BehavioralInfluence {
        const baseInfluence = this.getCategoryBehavioralInfluence(category);
        const itemCount = items.length;
        const avgRelevance = items.reduce((sum, item) => sum + item.relevanceScore, 0) / itemCount;

        return {
            purchaseInfluence: Math.round(baseInfluence.purchase * (avgRelevance / 100)),
            socialInfluence: Math.round(baseInfluence.social * (avgRelevance / 100)),
            lifestyleAlignment: Math.round(baseInfluence.lifestyle * (avgRelevance / 100)),
            emotionalConnection: Math.round(baseInfluence.emotional * (avgRelevance / 100))
        };
    }

    /**
     * Generate demographic alignment for migrated data
     */
    private generateMigrationDemographicAlignment(items: CulturalInsightItem[], persona: Persona): DemographicAlignment {
        const baseAlignment = 60; // Moderate alignment for existing data

        return {
            ageGroupAlignment: baseAlignment + (persona.age ? this.getAgeAlignmentBoost(persona.age) : 0),
            locationAlignment: baseAlignment + (persona.location ? 10 : 0),
            occupationAlignment: baseAlignment + (persona.occupation ? 10 : 0),
            overallFit: baseAlignment
        };
    }

    /**
     * Generate trends for migrated data
     */
    private generateMigrationTrends(items: CulturalInsightItem[], category: string): TrendAnalysis {
        // Conservative trend analysis for migrated data
        return {
            currentTrends: items.slice(0, 2).map(item => item.name),
            emergingTrends: [],
            trendAlignment: 50, // Neutral alignment
            innovatorScore: 30 // Conservative score
        };
    }

    // Social Media Migration Helper Methods

    /**
     * Calculate relevance score for social media platforms
     */
    private calculateSocialMediaRelevanceScore(platform: string, insights: SocialMediaInsights): number {
        let score = 50;

        // Check audience matches
        const audienceMatches = insights.audienceMatches.filter(match =>
            match.name.toLowerCase().includes(platform)
        );
        score += audienceMatches.length * 15;

        // Check brand influence
        const brandMatches = insights.brandInfluence.filter(brand =>
            brand.platforms.some(p => p.toLowerCase().includes(platform))
        );
        score += brandMatches.reduce((sum, brand) => sum + brand.relevanceScore, 0) / 10;

        // Check demographic alignment
        const demoMatches = insights.demographicAlignment.filter(demo =>
            demo.primaryPlatforms.some(p => p.toLowerCase().includes(platform))
        );
        score += demoMatches.length * 10;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate confidence for social media platforms
     */
    private calculateSocialMediaConfidence(platform: string, insights: SocialMediaInsights): number {
        let confidence = 0.5;

        // Higher confidence if platform appears in multiple insight types
        let appearances = 0;

        if (insights.audienceMatches.some(match => match.name.toLowerCase().includes(platform))) {
            appearances++;
        }

        if (insights.brandInfluence.some(brand =>
            brand.platforms.some(p => p.toLowerCase().includes(platform))
        )) {
            appearances++;
        }

        if (insights.demographicAlignment.some(demo =>
            demo.primaryPlatforms.some(p => p.toLowerCase().includes(platform))
        )) {
            appearances++;
        }

        confidence += appearances * 0.2;
        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Analyze social media preferences from existing insights
     */
    private analyzeSocialMediaPreferences(insights: SocialMediaInsights): PreferenceAnalysis {
        const platforms = this.extractPlatformsFromSocialInsights(insights);

        return {
            primaryPreferences: platforms.slice(0, 3),
            secondaryPreferences: platforms.slice(3, 6),
            emergingInterests: insights.contentPreferences.slice(0, 3),
            preferenceStrength: Math.min(80, platforms.length * 15)
        };
    }

    /**
     * Analyze behavioral influence from social media insights
     */
    private analyzeSocialMediaBehavioralInfluence(insights: SocialMediaInsights): BehavioralInfluence {
        const avgBrandRelevance = insights.brandInfluence.reduce((sum, brand) => sum + brand.relevanceScore, 0) /
            Math.max(1, insights.brandInfluence.length);

        return {
            purchaseInfluence: Math.round(avgBrandRelevance * 0.8),
            socialInfluence: 85, // High for social media
            lifestyleAlignment: Math.round(avgBrandRelevance * 0.7),
            emotionalConnection: Math.round(insights.audienceMatches.reduce((sum, match) =>
                sum + match.estimatedFollowingOverlap, 0) / Math.max(1, insights.audienceMatches.length))
        };
    }

    /**
     * Analyze demographic alignment from social media insights
     */
    private analyzeSocialMediaDemographicAlignment(insights: SocialMediaInsights, persona: Persona): DemographicAlignment {
        const demoAlignment = insights.demographicAlignment.find(demo => {
            if (persona.age < 25) return demo.ageGroup.toLowerCase().includes('gen z') || demo.ageGroup.includes('18-24');
            if (persona.age < 35) return demo.ageGroup.toLowerCase().includes('millennial') || demo.ageGroup.includes('25-34');
            if (persona.age < 50) return demo.ageGroup.toLowerCase().includes('gen x') || demo.ageGroup.includes('35-49');
            return demo.ageGroup.toLowerCase().includes('boomer') || demo.ageGroup.includes('50+');
        });

        return {
            ageGroupAlignment: demoAlignment ? 85 : 60,
            locationAlignment: 70, // Moderate default
            occupationAlignment: 65, // Moderate default
            overallFit: demoAlignment ? 75 : 60
        };
    }

    /**
     * Analyze trends from social media insights
     */
    private analyzeSocialMediaTrends(insights: SocialMediaInsights): TrendAnalysis {
        return {
            currentTrends: insights.contentPreferences.slice(0, 3),
            emergingTrends: insights.brandInfluence
                .filter(brand => brand.relevanceScore > 70)
                .slice(0, 2)
                .map(brand => brand.brand),
            trendAlignment: 75, // High for social media
            innovatorScore: Math.min(90, insights.audienceMatches.length * 20)
        };
    }

    /**
     * Extract platforms from social media insights
     */
    private extractPlatformsFromSocialInsights(insights: SocialMediaInsights): string[] {
        const platforms = new Set<string>();

        // From brand influence
        insights.brandInfluence.forEach(brand => {
            brand.platforms.forEach(platform => platforms.add(platform.toLowerCase()));
        });

        // From demographic alignment
        insights.demographicAlignment.forEach(demo => {
            demo.primaryPlatforms.forEach(platform => platforms.add(platform.toLowerCase()));
        });

        return Array.from(platforms);
    }

    /**
     * Create fallback social media insight
     */
    private createFallbackSocialMediaInsight(persona: Persona): CulturalInsight {
        const fallbackPlatforms = ['instagram', 'facebook', 'twitter'];

        const items: CulturalInsightItem[] = fallbackPlatforms.map(platform => ({
            name: platform,
            relevanceScore: 40,
            confidence: 0.3,
            source: 'fallback' as const,
            attributes: { category: 'social_media', migrated: true },
            relationships: []
        }));

        return {
            category: 'socialMedia',
            items,
            metadata: {
                generatedAt: new Date().toISOString(),
                source: 'fallback',
                dataQuality: 'low',
                enrichmentLevel: 20
            },
            analytics: {
                preferences: {
                    primaryPreferences: fallbackPlatforms,
                    secondaryPreferences: [],
                    emergingInterests: [],
                    preferenceStrength: 40
                },
                behavioralInfluence: {
                    purchaseInfluence: 30,
                    socialInfluence: 60,
                    lifestyleAlignment: 35,
                    emotionalConnection: 25
                },
                demographicAlignment: {
                    ageGroupAlignment: 50,
                    locationAlignment: 50,
                    occupationAlignment: 50,
                    overallFit: 50
                },
                trends: {
                    currentTrends: [],
                    emergingTrends: [],
                    trendAlignment: 30,
                    innovatorScore: 20
                }
            }
        };
    }

    /**
     * Create empty insight structure
     */
    private createEmptyInsight(category: string): CulturalInsight {
        return {
            category,
            items: [],
            metadata: {
                generatedAt: new Date().toISOString(),
                source: 'fallback',
                dataQuality: 'low',
                enrichmentLevel: 0
            },
            analytics: {
                preferences: {
                    primaryPreferences: [],
                    secondaryPreferences: [],
                    emergingInterests: [],
                    preferenceStrength: 0
                },
                behavioralInfluence: {
                    purchaseInfluence: 0,
                    socialInfluence: 0,
                    lifestyleAlignment: 0,
                    emotionalConnection: 0
                },
                demographicAlignment: {
                    ageGroupAlignment: 0,
                    locationAlignment: 0,
                    occupationAlignment: 0,
                    overallFit: 0
                },
                trends: {
                    currentTrends: [],
                    emergingTrends: [],
                    trendAlignment: 0,
                    innovatorScore: 0
                }
            }
        };
    }

    // Utility helper methods

    private getAgeRelevanceBoost(item: string, age: number, category: string): number {
        // Simple age-based relevance boost
        if (age < 25) return 10;
        if (age < 35) return 5;
        if (age > 55) return -5;
        return 0;
    }

    private getOccupationRelevanceBoost(item: string, occupation: string, category: string): number {
        // Simple occupation-based relevance boost
        const itemLower = item.toLowerCase();
        const occupationLower = occupation.toLowerCase();

        if (itemLower.includes(occupationLower) || occupationLower.includes(itemLower)) {
            return 15;
        }
        return 0;
    }

    private getInterestRelevanceBoost(item: string, interests: string[]): number {
        const itemLower = item.toLowerCase();
        const matchingInterests = interests.filter(interest =>
            itemLower.includes(interest.toLowerCase()) || interest.toLowerCase().includes(itemLower)
        );
        return matchingInterests.length * 5;
    }

    private getCategoryBehavioralInfluence(category: string): {
        purchase: number;
        social: number;
        lifestyle: number;
        emotional: number;
    } {
        const influenceMap: Record<string, any> = {
            brand: { purchase: 85, social: 60, lifestyle: 70, emotional: 50 },
            fashion: { purchase: 80, social: 75, lifestyle: 85, emotional: 60 },
            beauty: { purchase: 75, social: 70, lifestyle: 80, emotional: 65 },
            music: { purchase: 40, social: 70, lifestyle: 75, emotional: 85 },
            movie: { purchase: 35, social: 50, lifestyle: 60, emotional: 80 },
            tv: { purchase: 30, social: 45, lifestyle: 55, emotional: 75 },
            book: { purchase: 45, social: 35, lifestyle: 65, emotional: 80 },
            restaurant: { purchase: 65, social: 60, lifestyle: 70, emotional: 60 },
            travel: { purchase: 70, social: 80, lifestyle: 85, emotional: 75 },
            food: { purchase: 70, social: 65, lifestyle: 75, emotional: 60 },
            socialMedia: { purchase: 25, social: 90, lifestyle: 50, emotional: 40 }
        };

        return influenceMap[category] || { purchase: 50, social: 50, lifestyle: 50, emotional: 50 };
    }

    private getAgeAlignmentBoost(age: number): number {
        // Age-based alignment boost
        if (age >= 18 && age <= 65) return 10;
        return 0;
    }

    private inferEngagementLevel(platform: string, insights: SocialMediaInsights): string {
        const brandMatches = insights.brandInfluence.filter(brand =>
            brand.platforms.some(p => p.toLowerCase().includes(platform))
        );

        if (brandMatches.length > 3) return 'high';
        if (brandMatches.length > 1) return 'medium';
        return 'low';
    }

    private inferAudienceSize(platform: string, insights: SocialMediaInsights): string {
        const audienceMatches = insights.audienceMatches.filter(match =>
            match.name.toLowerCase().includes(platform)
        );

        const avgOverlap = audienceMatches.reduce((sum, match) => sum + match.estimatedFollowingOverlap, 0) /
            Math.max(1, audienceMatches.length);

        if (avgOverlap > 70) return 'large';
        if (avgOverlap > 40) return 'medium';
        return 'small';
    }

    private inferContentTypes(platform: string, insights: SocialMediaInsights): string[] {
        return insights.contentPreferences.slice(0, 3);
    }

    private findSocialMediaRelationships(platform: string, allPlatforms: string[]): string[] {
        // Simple platform relationship mapping
        const relationships: Record<string, string[]> = {
            instagram: ['facebook', 'tiktok'],
            facebook: ['instagram', 'twitter'],
            tiktok: ['instagram', 'youtube'],
            twitter: ['facebook', 'linkedin'],
            youtube: ['tiktok', 'instagram'],
            linkedin: ['twitter', 'facebook']
        };

        return (relationships[platform] || []).filter(rel => allPlatforms.includes(rel));
    }

    // Enhanced validation helper methods

    /**
     * Validate cultural data integrity
     */
    private validateCulturalDataIntegrity(
        originalData: CulturalData,
        migratedInsights?: CulturalInsights
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        let penaltyPoints = 0;

        if (!migratedInsights) {
            errors.push('Migrated cultural insights are missing');
            return { errors, warnings, penaltyPoints: 100 };
        }

        const categories = Object.keys(originalData) as (keyof CulturalData)[];

        for (const category of categories) {
            const originalItems = originalData[category] || [];
            const migratedCategory = migratedInsights[category as keyof CulturalInsights];

            if (!migratedCategory) {
                errors.push(`Category ${category} missing in migrated data`);
                penaltyPoints += 10;
                continue;
            }

            const migratedItems = migratedCategory.items || [];

            // Check if all original items are preserved
            for (const originalItem of originalItems) {
                const found = migratedItems.some(item => item.name === originalItem);
                if (!found) {
                    errors.push(`Item ${originalItem} missing in migrated ${category} data`);
                    penaltyPoints += 5;
                }
            }

            // Check for data quality
            if (originalItems.length > 0 && migratedItems.length === 0) {
                errors.push(`Category ${category} had data but migration resulted in empty items`);
                penaltyPoints += 15;
            }

            // Warn about significant data loss
            if (migratedItems.length < originalItems.length * 0.8) {
                warnings.push(`Category ${category} lost more than 20% of original items`);
                penaltyPoints += 3;
            }
        }

        return { errors, warnings, penaltyPoints };
    }

    /**
     * Validate social media integrity
     */
    private validateSocialMediaIntegrity(
        originalInsights: SocialMediaInsights,
        migratedInsight?: CulturalInsight
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        let penaltyPoints = 0;

        if (!migratedInsight) {
            errors.push('Social media insights missing in migrated data');
            return { errors, warnings, penaltyPoints: 50 };
        }

        // Extract platforms from original insights
        const originalPlatforms = this.extractPlatformsFromSocialInsights(originalInsights);
        const migratedPlatforms = migratedInsight.items.map(item => item.name);

        // Check platform preservation
        if (originalPlatforms.length > 0 && migratedPlatforms.length === 0) {
            errors.push('Social media platforms not preserved in migration');
            penaltyPoints += 25;
        }

        // Check for significant platform loss
        const preservedPlatforms = originalPlatforms.filter(platform =>
            migratedPlatforms.some(migrated => migrated.includes(platform.toLowerCase()))
        );

        if (preservedPlatforms.length < originalPlatforms.length * 0.7) {
            warnings.push('More than 30% of social media platforms were lost in migration');
            penaltyPoints += 10;
        }

        // Validate analytics preservation
        if (!migratedInsight.analytics) {
            errors.push('Social media analytics missing in migrated data');
            penaltyPoints += 15;
        }

        return { errors, warnings, penaltyPoints };
    }

    /**
     * Validate metadata consistency
     */
    private validateMetadataConsistency(insights?: CulturalInsights): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        let penaltyPoints = 0;

        if (!insights) {
            errors.push('Cultural insights missing for metadata validation');
            return { errors, warnings, penaltyPoints: 100 };
        }

        const categories = Object.keys(insights) as (keyof CulturalInsights)[];

        for (const category of categories) {
            const insight = insights[category];

            if (!insight.metadata) {
                errors.push(`Metadata missing for category ${category}`);
                penaltyPoints += 5;
                continue;
            }

            // Validate required metadata fields
            if (!insight.metadata.generatedAt) {
                errors.push(`Generated timestamp missing for category ${category}`);
                penaltyPoints += 2;
            }

            if (!insight.metadata.source) {
                errors.push(`Source information missing for category ${category}`);
                penaltyPoints += 2;
            }

            if (!insight.metadata.dataQuality) {
                errors.push(`Data quality assessment missing for category ${category}`);
                penaltyPoints += 2;
            }

            if (typeof insight.metadata.enrichmentLevel !== 'number') {
                errors.push(`Enrichment level invalid for category ${category}`);
                penaltyPoints += 2;
            }

            // Validate enrichment level range
            if (insight.metadata.enrichmentLevel < 0 || insight.metadata.enrichmentLevel > 100) {
                warnings.push(`Enrichment level out of range for category ${category}`);
                penaltyPoints += 1;
            }
        }

        return { errors, warnings, penaltyPoints };
    }

    /**
     * Validate analytics completeness
     */
    private validateAnalyticsCompleteness(insights?: CulturalInsights): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        let penaltyPoints = 0;

        if (!insights) {
            errors.push('Cultural insights missing for analytics validation');
            return { errors, warnings, penaltyPoints: 100 };
        }

        const categories = Object.keys(insights) as (keyof CulturalInsights)[];

        for (const category of categories) {
            const insight = insights[category];

            if (!insight.analytics) {
                errors.push(`Analytics missing for category ${category}`);
                penaltyPoints += 10;
                continue;
            }

            // Validate analytics structure
            const requiredAnalytics = ['preferences', 'behavioralInfluence', 'demographicAlignment', 'trends'];

            for (const analyticsType of requiredAnalytics) {
                if (!insight.analytics[analyticsType as keyof InsightAnalytics]) {
                    errors.push(`${analyticsType} analytics missing for category ${category}`);
                    penaltyPoints += 3;
                }
            }

            // Validate behavioral influence ranges
            if (insight.analytics.behavioralInfluence) {
                const behavioralFields = ['purchaseInfluence', 'socialInfluence', 'lifestyleAlignment', 'emotionalConnection'];

                for (const field of behavioralFields) {
                    const value = insight.analytics.behavioralInfluence[field as keyof BehavioralInfluence];
                    if (typeof value !== 'number' || value < 0 || value > 100) {
                        warnings.push(`${field} value out of range for category ${category}`);
                        penaltyPoints += 1;
                    }
                }
            }

            // Validate demographic alignment ranges
            if (insight.analytics.demographicAlignment) {
                const demoFields = ['ageGroupAlignment', 'locationAlignment', 'occupationAlignment', 'overallFit'];

                for (const field of demoFields) {
                    const value = insight.analytics.demographicAlignment[field as keyof DemographicAlignment];
                    if (typeof value !== 'number' || value < 0 || value > 100) {
                        warnings.push(`${field} value out of range for category ${category}`);
                        penaltyPoints += 1;
                    }
                }
            }
        }

        return { errors, warnings, penaltyPoints };
    }

    /**
     * Calculate data checksum for integrity verification
     */
    private calculateDataChecksum(persona: Persona): string {
        const dataToHash = {
            culturalData: persona.culturalData,
            socialMediaInsights: persona.socialMediaInsights
        };

        // Simple checksum calculation (in production, use a proper hash function)
        const dataString = JSON.stringify(dataToHash);
        let hash = 0;

        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return hash.toString(16);
    }

    /**
     * Calculate data size for backup metadata
     */
    private calculateDataSize(persona: Persona): number {
        const dataString = JSON.stringify({
            culturalData: persona.culturalData,
            socialMediaInsights: persona.socialMediaInsights
        });
        return dataString.length;
    }
}

// Additional interfaces for enhanced validation

interface ValidationResult {
    errors: string[];
    warnings: string[];
    penaltyPoints: number;
}

interface IntegrityValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number; // 0-100
    details: {
        culturalDataPreserved: boolean;
        socialMediaPreserved: boolean;
        metadataConsistent: boolean;
        analyticsComplete: boolean;
    };
}

interface RollbackData {
    personaId: string;
    timestamp: string;
    originalCulturalData: CulturalData;
    originalSocialMediaInsights?: any;
    checksum: string;
}

// Enhanced migration service with comprehensive data integrity validation
export class MigrationIntegrityValidator {
    private rollbackStorage: Map<string, RollbackData> = new Map();
    private migrationLogs: Array<MigrationLogEntry> = [];

    /**
     * Create comprehensive rollback data before migration
     * 
     * @param persona - The persona before migration
     * @returns RollbackData - Complete rollback information
     */
    createRollbackData(persona: Persona): RollbackData {
        const rollbackData: RollbackData = {
            personaId: persona.id,
            timestamp: new Date().toISOString(),
            originalCulturalData: JSON.parse(JSON.stringify(persona.culturalData)),
            originalSocialMediaInsights: persona.socialMediaInsights ?
                JSON.parse(JSON.stringify(persona.socialMediaInsights)) : undefined,
            checksum: this.calculateDataChecksum(persona),
            backupMetadata: {
                version: '1.0',
                createdBy: 'migration-service',
                dataSize: this.calculateDataSize(persona),
                categories: Object.keys(persona.culturalData || {}),
                hasSocialMedia: !!persona.socialMediaInsights
            }
        };

        // Store rollback data
        this.rollbackStorage.set(persona.id, rollbackData);

        this.logMigrationActivity(
            persona.id,
            'rollback_created',
            { checksum: rollbackData.checksum, dataSize: rollbackData.backupMetadata.dataSize },
            'info'
        );

        return rollbackData;
    }

    /**
     * Execute rollback for failed migration
     * 
     * @param migratedPersona - The persona after failed migration
     * @param rollbackData - The rollback data (optional, will retrieve if not provided)
     * @returns Persona - The restored persona
     */
    async rollbackMigration(migratedPersona: Persona, rollbackData?: RollbackData): Promise<Persona> {
        try {
            // Get rollback data if not provided
            const rollback = rollbackData || this.rollbackStorage.get(migratedPersona.id);

            if (!rollback) {
                throw new Error(`No rollback data found for persona ${migratedPersona.id}`);
            }

            // Verify rollback data integrity
            if (rollback.personaId !== migratedPersona.id) {
                throw new Error('Rollback data persona ID mismatch');
            }

            this.logMigrationActivity(
                migratedPersona.id,
                'rollback_started',
                { rollbackTimestamp: rollback.timestamp },
                'info'
            );

            // Restore original data
            const restoredPersona: Persona = {
                ...migratedPersona,
                culturalData: rollback.originalCulturalData,
                socialMediaInsights: rollback.originalSocialMediaInsights,
                culturalInsights: undefined // Remove migrated insights
            };

            // Verify restoration integrity
            const restoredChecksum = this.calculateDataChecksum(restoredPersona);
            if (restoredChecksum !== rollback.checksum) {
                this.logMigrationActivity(
                    migratedPersona.id,
                    'rollback_checksum_mismatch',
                    {
                        expected: rollback.checksum,
                        actual: restoredChecksum,
                        warning: 'Data may have been modified during migration'
                    },
                    'warn'
                );
            }

            // Validate rollback success
            const rollbackValidation = this.validateRollbackIntegrity(rollback, restoredPersona);
            if (!rollbackValidation.isValid) {
                this.logMigrationActivity(
                    migratedPersona.id,
                    'rollback_validation_failed',
                    { errors: rollbackValidation.errors },
                    'error'
                );
                throw new Error(`Rollback validation failed: ${rollbackValidation.errors.join(', ')}`);
            }

            this.logMigrationActivity(
                migratedPersona.id,
                'rollback_completed',
                {
                    restoredChecksum,
                    validationScore: rollbackValidation.score,
                    categoriesRestored: Object.keys(restoredPersona.culturalData || {}).length
                },
                'info'
            );

            // Clean up rollback data
            this.rollbackStorage.delete(migratedPersona.id);

            return restoredPersona;

        } catch (error) {
            this.logMigrationActivity(
                migratedPersona.id,
                'rollback_failed',
                { error: error instanceof Error ? error.message : 'Unknown error' },
                'error'
            );
            throw new Error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate rollback integrity
     * 
     * @param rollbackData - The original rollback data
     * @param restoredPersona - The persona after rollback
     * @returns IntegrityValidationResult - Validation result
     */
    private validateRollbackIntegrity(
        rollbackData: RollbackData,
        restoredPersona: Persona
    ): IntegrityValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        let score = 100;

        try {
            // Validate cultural data restoration
            const originalCategories = Object.keys(rollbackData.originalCulturalData);
            const restoredCategories = Object.keys(restoredPersona.culturalData || {});

            if (originalCategories.length !== restoredCategories.length) {
                errors.push('Category count mismatch after rollback');
                score -= 20;
            }

            for (const category of originalCategories) {
                if (!restoredCategories.includes(category)) {
                    errors.push(`Category ${category} missing after rollback`);
                    score -= 10;
                    continue;
                }

                const originalItems = rollbackData.originalCulturalData[category as keyof CulturalData] || [];
                const restoredItems = restoredPersona.culturalData?.[category as keyof CulturalData] || [];

                if (originalItems.length !== restoredItems.length) {
                    errors.push(`Item count mismatch in category ${category} after rollback`);
                    score -= 5;
                }

                // Check item preservation
                for (const originalItem of originalItems) {
                    if (!restoredItems.includes(originalItem)) {
                        errors.push(`Item ${originalItem} missing in category ${category} after rollback`);
                        score -= 3;
                    }
                }
            }

            // Validate social media insights restoration
            if (rollbackData.originalSocialMediaInsights) {
                if (!restoredPersona.socialMediaInsights) {
                    errors.push('Social media insights missing after rollback');
                    score -= 15;
                } else {
                    // Deep comparison of social media insights
                    const originalStr = JSON.stringify(rollbackData.originalSocialMediaInsights);
                    const restoredStr = JSON.stringify(restoredPersona.socialMediaInsights);

                    if (originalStr !== restoredStr) {
                        warnings.push('Social media insights may have minor differences after rollback');
                        score -= 5;
                    }
                }
            }

            // Validate that migrated insights are removed
            if (restoredPersona.culturalInsights) {
                warnings.push('Cultural insights still present after rollback - may indicate incomplete rollback');
                score -= 10;
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                score: Math.max(0, score),
                details: {
                    culturalDataPreserved: originalCategories.every(cat => restoredCategories.includes(cat)),
                    socialMediaPreserved: rollbackData.originalSocialMediaInsights ?
                        !!restoredPersona.socialMediaInsights : true,
                    metadataConsistent: true, // Metadata consistency not applicable for rollback
                    analyticsComplete: true // Analytics completeness not applicable for rollback
                }
            };

        } catch (error) {
            return {
                isValid: false,
                errors: [`Rollback validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
                warnings: [],
                score: 0,
                details: {
                    culturalDataPreserved: false,
                    socialMediaPreserved: false,
                    metadataConsistent: false,
                    analyticsComplete: false
                }
            };
        }
    }

    /**
     * Comprehensive logging for migration tracking
     * 
     * @param personaId - The persona ID
     * @param operation - The operation being performed
     * @param details - Additional details
     * @param level - Log level
     */
    logMigrationActivity(
        personaId: string,
        operation: string,
        details: any,
        level: 'info' | 'warn' | 'error' = 'info'
    ): void {
        const logEntry: MigrationLogEntry = {
            id: `${personaId}_${operation}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            personaId,
            operation,
            details,
            level,
            sessionId: this.generateSessionId(),
            stackTrace: level === 'error' ? new Error().stack : undefined
        };

        // Store log entry
        this.migrationLogs.push(logEntry);

        // Console logging with structured format
        const logMessage = `[Migration ${level.toUpperCase()}] ${operation} for persona ${personaId}`;

        switch (level) {
            case 'error':
                console.error(logMessage, logEntry);
                break;
            case 'warn':
                console.warn(logMessage, logEntry);
                break;
            default:
                console.log(logMessage, logEntry);
        }

        // Maintain log size (keep last 1000 entries)
        if (this.migrationLogs.length > 1000) {
            this.migrationLogs = this.migrationLogs.slice(-1000);
        }
    }

    /**
     * Get migration logs for a specific persona
     * 
     * @param personaId - The persona ID
     * @returns MigrationLogEntry[] - Filtered logs
     */
    getMigrationLogs(personaId: string): MigrationLogEntry[] {
        return this.migrationLogs.filter(log => log.personaId === personaId);
    }

    /**
     * Get all migration logs with optional filtering
     * 
     * @param options - Filtering options
     * @returns MigrationLogEntry[] - Filtered logs
     */
    getAllMigrationLogs(options?: {
        level?: 'info' | 'warn' | 'error';
        operation?: string;
        since?: string; // ISO timestamp
        limit?: number;
    }): MigrationLogEntry[] {
        let logs = [...this.migrationLogs];

        if (options?.level) {
            logs = logs.filter(log => log.level === options.level);
        }

        if (options?.operation) {
            logs = logs.filter(log => log.operation === options.operation);
        }

        if (options?.since) {
            logs = logs.filter(log => log.timestamp >= options.since!);
        }

        if (options?.limit) {
            logs = logs.slice(-options.limit);
        }

        return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }

    /**
     * Export migration logs for analysis
     * 
     * @param format - Export format
     * @returns string - Formatted logs
     */
    exportMigrationLogs(format: 'json' | 'csv' = 'json'): string {
        if (format === 'csv') {
            const headers = ['timestamp', 'personaId', 'operation', 'level', 'details'];
            const csvRows = [
                headers.join(','),
                ...this.migrationLogs.map(log => [
                    log.timestamp,
                    log.personaId,
                    log.operation,
                    log.level,
                    JSON.stringify(log.details).replace(/"/g, '""')
                ].join(','))
            ];
            return csvRows.join('\n');
        }

        return JSON.stringify(this.migrationLogs, null, 2);
    }

    /**
     * Clear migration logs
     * 
     * @param olderThan - Optional timestamp to clear logs older than
     */
    clearMigrationLogs(olderThan?: string): void {
        if (olderThan) {
            this.migrationLogs = this.migrationLogs.filter(log => log.timestamp >= olderThan);
        } else {
            this.migrationLogs = [];
        }
    }

    /**
     * Get rollback data for a persona
     * 
     * @param personaId - The persona ID
     * @returns RollbackData | undefined - Rollback data if exists
     */
    getRollbackData(personaId: string): RollbackData | undefined {
        return this.rollbackStorage.get(personaId);
    }

    /**
     * Check if rollback is available for a persona
     * 
     * @param personaId - The persona ID
     * @returns boolean - True if rollback data exists
     */
    hasRollbackData(personaId: string): boolean {
        return this.rollbackStorage.has(personaId);
    }

    /**
     * Clean up old rollback data
     * 
     * @param olderThanHours - Remove rollback data older than specified hours
     */
    cleanupRollbackData(olderThanHours: number = 24): void {
        const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000)).toISOString();

        for (const [personaId, rollbackData] of this.rollbackStorage.entries()) {
            if (rollbackData.timestamp < cutoffTime) {
                this.rollbackStorage.delete(personaId);
                this.logMigrationActivity(
                    personaId,
                    'rollback_data_cleaned',
                    { cleanupTime: cutoffTime, rollbackAge: rollbackData.timestamp },
                    'info'
                );
            }
        }
    }

    // Private helper methods

    private calculateDataChecksum(persona: Persona): string {
        const dataToHash = {
            culturalData: persona.culturalData,
            socialMediaInsights: persona.socialMediaInsights
        };

        // Enhanced checksum calculation with better collision resistance
        const dataString = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
        let hash = 0;

        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Add timestamp-based salt for uniqueness
        const salt = Date.now().toString(36);
        return `${hash.toString(16)}_${salt}`;
    }

    private calculateDataSize(persona: Persona): number {
        const dataString = JSON.stringify({
            culturalData: persona.culturalData,
            socialMediaInsights: persona.socialMediaInsights
        });
        return dataString.length;
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Enhanced interfaces for comprehensive validation and logging

interface RollbackData {
    personaId: string;
    timestamp: string;
    originalCulturalData: CulturalData;
    originalSocialMediaInsights?: any;
    checksum: string;
    backupMetadata: {
        version: string;
        createdBy: string;
        dataSize: number;
        categories: string[];
        hasSocialMedia: boolean;
    };
}

interface MigrationLogEntry {
    id: string;
    timestamp: string;
    personaId: string;
    operation: string;
    details: any;
    level: 'info' | 'warn' | 'error';
    sessionId: string;
    stackTrace?: string;
}

interface IntegrityValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number; // 0-100
    details: {
        culturalDataPreserved: boolean;
        socialMediaPreserved: boolean;
        metadataConsistent: boolean;
        analyticsComplete: boolean;
    };
}

// Extend MigrationStatus to include logs
declare module '@/types/cultural-insights' {
    interface MigrationStatus {
        logs?: MigrationLogEntry[];
    }
}