import { SessionData, SessionManager, PersonaManager, BriefManager } from '@/lib/session'
import { StackAuthSessionService } from '@/lib/stack-auth-sessions'
import { stackClientApp } from '@/stack-client'

// Types pour la migration
export interface MigrationResult {
    success: boolean
    migratedData: {
        sessionData?: SessionData
        personas?: any[]
        briefs?: string[]
    }
    errors: string[]
    warnings: string[]
}

export interface MigrationOptions {
    preserveLocalData: boolean // Garder les données locales après migration
    backupBeforeMigration: boolean // Créer une sauvegarde avant migration
    migratePersonas: boolean // Migrer les personas vers le cloud
    migrateBriefs: boolean // Migrer les briefs sauvegardés
}

/**
 * Service de migration des sessions locales vers Stack Auth
 */
export class SessionMigrationService {

    /**
     * Migre les données de session locales vers Stack Auth
     */
    static async migrateToStackAuth(options: MigrationOptions = {
        preserveLocalData: false,
        backupBeforeMigration: true,
        migratePersonas: true,
        migrateBriefs: true
    }): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: false,
            migratedData: {},
            errors: [],
            warnings: []
        }

        try {
            // Vérifier que l'utilisateur est connecté à Stack Auth
            const user = await stackClientApp.getUser()
            if (!user) {
                result.errors.push('Utilisateur non connecté à Stack Auth')
                return result
            }

            // Créer une sauvegarde si demandé
            if (options.backupBeforeMigration) {
                await this.createBackup()
                result.warnings.push('Sauvegarde créée avant migration')
            }

            // Récupérer les données locales existantes
            const localSession = SessionManager.getSession()
            const localPersonas = PersonaManager.getPersonas()
            const localBriefs = BriefManager.getBriefs()

            // Migrer les données de session
            if (localSession) {
                result.migratedData.sessionData = localSession

                // Ici, vous pourriez sauvegarder les préférences utilisateur dans votre base de données
                // via une API route ou directement avec Prisma
                await this.saveUserPreferences(user.id, localSession.preferences)

                result.warnings.push('Préférences utilisateur migrées vers Stack Auth')
            }

            // Migrer les personas si demandé
            if (options.migratePersonas && localPersonas.length > 0) {
                try {
                    await this.migratePersonasToCloud(user.id, localPersonas)
                    result.migratedData.personas = localPersonas
                    result.warnings.push(`${localPersonas.length} personas migrées vers le cloud`)
                } catch (error) {
                    result.errors.push(`Erreur lors de la migration des personas: ${error}`)
                }
            }

            // Migrer les briefs si demandé
            if (options.migrateBriefs && localBriefs.length > 0) {
                try {
                    await this.migrateBriefsToCloud(user.id, localBriefs)
                    result.migratedData.briefs = localBriefs
                    result.warnings.push(`${localBriefs.length} briefs migrés vers le cloud`)
                } catch (error) {
                    result.errors.push(`Erreur lors de la migration des briefs: ${error}`)
                }
            }

            // Nettoyer les données locales si demandé
            if (!options.preserveLocalData) {
                SessionManager.clearSession()
                PersonaManager.clearPersonas()
                BriefManager.clearBriefs()
                result.warnings.push('Données locales supprimées après migration')
            }

            result.success = result.errors.length === 0

        } catch (error) {
            result.errors.push(`Erreur générale de migration: ${error}`)
        }

        return result
    }

    /**
     * Crée une sauvegarde des données locales
     */
    private static async createBackup(): Promise<void> {
        const backupData = {
            timestamp: new Date().toISOString(),
            session: SessionManager.getSession(),
            personas: PersonaManager.getPersonas(),
            briefs: BriefManager.getBriefs()
        }

        const content = JSON.stringify(backupData, null, 2)
        const blob = new Blob([content], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `personacraft_backup_${Date.now()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    /**
     * Sauvegarde les préférences utilisateur dans la base de données
     */
    private static async saveUserPreferences(userId: string, preferences: any): Promise<void> {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    preferences
                })
            })

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`)
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences:', error)
            throw error
        }
    }

    /**
     * Migre les personas vers le cloud
     */
    private static async migratePersonasToCloud(userId: string, personas: any[]): Promise<void> {
        try {
            const response = await fetch('/api/personas/migrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    personas
                })
            })

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`)
            }
        } catch (error) {
            console.error('Erreur lors de la migration des personas:', error)
            throw error
        }
    }

    /**
     * Migre les briefs vers le cloud
     */
    private static async migrateBriefsToCloud(userId: string, briefs: string[]): Promise<void> {
        try {
            const response = await fetch('/api/briefs/migrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    briefs
                })
            })

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`)
            }
        } catch (error) {
            console.error('Erreur lors de la migration des briefs:', error)
            throw error
        }
    }

    /**
     * Vérifie si une migration est nécessaire
     */
    static checkMigrationNeeded(): {
        needed: boolean
        hasLocalSession: boolean
        hasLocalPersonas: boolean
        hasLocalBriefs: boolean
        localDataCount: {
            personas: number
            briefs: number
        }
    } {
        const localSession = SessionManager.getSession()
        const localPersonas = PersonaManager.getPersonas()
        const localBriefs = BriefManager.getBriefs()

        return {
            needed: !!(localSession || localPersonas.length > 0 || localBriefs.length > 0),
            hasLocalSession: !!localSession,
            hasLocalPersonas: localPersonas.length > 0,
            hasLocalBriefs: localBriefs.length > 0,
            localDataCount: {
                personas: localPersonas.length,
                briefs: localBriefs.length
            }
        }
    }

    /**
     * Restaure des données depuis une sauvegarde
     */
    static async restoreFromBackup(backupFile: File): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: false,
            migratedData: {},
            errors: [],
            warnings: []
        }

        try {
            const content = await backupFile.text()
            const backupData = JSON.parse(content)

            // Valider la structure de la sauvegarde
            if (!backupData.timestamp) {
                result.errors.push('Fichier de sauvegarde invalide')
                return result
            }

            // Restaurer les données
            if (backupData.session) {
                SessionManager.saveSession(backupData.session)
                result.migratedData.sessionData = backupData.session
            }

            if (backupData.personas && Array.isArray(backupData.personas)) {
                PersonaManager.savePersonas(backupData.personas)
                result.migratedData.personas = backupData.personas
            }

            if (backupData.briefs && Array.isArray(backupData.briefs)) {
                // Restaurer les briefs un par un
                backupData.briefs.forEach((brief: string) => {
                    BriefManager.saveBrief(brief)
                })
                result.migratedData.briefs = backupData.briefs
            }

            result.success = true
            result.warnings.push(`Données restaurées depuis la sauvegarde du ${new Date(backupData.timestamp).toLocaleString('fr-FR')}`)

        } catch (error) {
            result.errors.push(`Erreur lors de la restauration: ${error}`)
        }

        return result
    }
}