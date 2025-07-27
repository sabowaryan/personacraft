'use client'

import React, { useState, useEffect } from 'react'
import { SessionMigrationService, MigrationOptions, MigrationResult } from '@/lib/session-migration'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
    Upload,
    Download,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Database,
    Cloud,
    ArrowRight
} from 'lucide-react'

export function MigrationWizard() {
    const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'migrating' | 'completed' | 'error'>('idle')
    const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
    const [migrationNeeded, setMigrationNeeded] = useState<any>(null)
    const [migrationOptions, setMigrationOptions] = useState<MigrationOptions>({
        preserveLocalData: false,
        backupBeforeMigration: true,
        migratePersonas: true,
        migrateBriefs: true
    })
    const [progress, setProgress] = useState(0)

    // Vérifier si une migration est nécessaire au chargement
    useEffect(() => {
        checkMigrationStatus()
    }, [])

    const checkMigrationStatus = () => {
        setMigrationStatus('checking')
        const status = SessionMigrationService.checkMigrationNeeded()
        setMigrationNeeded(status)
        setMigrationStatus('idle')
    }

    const handleMigration = async () => {
        setMigrationStatus('migrating')
        setProgress(0)

        try {
            // Simuler le progrès
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90))
            }, 200)

            const result = await SessionMigrationService.migrateToStackAuth(migrationOptions)

            clearInterval(progressInterval)
            setProgress(100)

            setMigrationResult(result)
            setMigrationStatus(result.success ? 'completed' : 'error')

            // Recheck migration status after completion
            setTimeout(() => {
                checkMigrationStatus()
            }, 1000)

        } catch (error) {
            setMigrationStatus('error')
            setMigrationResult({
                success: false,
                migratedData: {},
                errors: [`Erreur inattendue: ${error}`],
                warnings: []
            })
        }
    }

    const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setMigrationStatus('migrating')
        setProgress(0)

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 20, 90))
            }, 100)

            const result = await SessionMigrationService.restoreFromBackup(file)

            clearInterval(progressInterval)
            setProgress(100)

            setMigrationResult(result)
            setMigrationStatus(result.success ? 'completed' : 'error')

            // Reset file input
            event.target.value = ''

            // Recheck migration status
            setTimeout(() => {
                checkMigrationStatus()
            }, 1000)

        } catch (error) {
            setMigrationStatus('error')
            setMigrationResult({
                success: false,
                migratedData: {},
                errors: [`Erreur lors de la restauration: ${error}`],
                warnings: []
            })
        }
    }

    if (migrationStatus === 'checking') {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Vérification des données locales...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!migrationNeeded?.needed) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Migration non nécessaire
                    </CardTitle>
                    <CardDescription>
                        Aucune donnée locale n'a été trouvée. Votre compte utilise déjà Stack Auth.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Button onClick={checkMigrationStatus} variant="outline">
                            Revérifier
                        </Button>

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileRestore}
                                className="hidden"
                                id="restore-file"
                            />
                            <label htmlFor="restore-file">
                                <Button variant="outline" asChild>
                                    <span>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Restaurer depuis une sauvegarde
                                    </span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* État de la migration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Migration vers Stack Auth
                    </CardTitle>
                    <CardDescription>
                        Des données locales ont été détectées. Migrez-les vers votre compte Stack Auth.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {migrationNeeded.localDataCount.personas}
                            </div>
                            <div className="text-sm text-blue-600">Personas locales</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {migrationNeeded.localDataCount.briefs}
                            </div>
                            <div className="text-sm text-green-600">Briefs sauvegardés</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {migrationNeeded.hasLocalSession ? '1' : '0'}
                            </div>
                            <div className="text-sm text-purple-600">Session locale</div>
                        </div>
                    </div>

                    {/* Options de migration */}
                    <div className="space-y-4 mb-6">
                        <h4 className="font-medium">Options de migration</h4>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="backup"
                                    checked={migrationOptions.backupBeforeMigration}
                                    onCheckedChange={(checked) =>
                                        setMigrationOptions(prev => ({ ...prev, backupBeforeMigration: !!checked }))
                                    }
                                />
                                <label htmlFor="backup" className="text-sm">
                                    Créer une sauvegarde avant migration (recommandé)
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="personas"
                                    checked={migrationOptions.migratePersonas}
                                    onCheckedChange={(checked) =>
                                        setMigrationOptions(prev => ({ ...prev, migratePersonas: !!checked }))
                                    }
                                />
                                <label htmlFor="personas" className="text-sm">
                                    Migrer les personas vers le cloud
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="briefs"
                                    checked={migrationOptions.migrateBriefs}
                                    onCheckedChange={(checked) =>
                                        setMigrationOptions(prev => ({ ...prev, migrateBriefs: !!checked }))
                                    }
                                />
                                <label htmlFor="briefs" className="text-sm">
                                    Migrer les briefs sauvegardés
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="preserve"
                                    checked={migrationOptions.preserveLocalData}
                                    onCheckedChange={(checked) =>
                                        setMigrationOptions(prev => ({ ...prev, preserveLocalData: !!checked }))
                                    }
                                />
                                <label htmlFor="preserve" className="text-sm">
                                    Conserver les données locales après migration
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    {migrationStatus === 'migrating' && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Migration en cours...</span>
                                <span className="text-sm text-gray-500">{progress}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleMigration}
                            disabled={migrationStatus === 'migrating'}
                            className="flex items-center gap-2"
                        >
                            <Cloud className="h-4 w-4" />
                            {migrationStatus === 'migrating' ? 'Migration...' : 'Migrer vers Stack Auth'}
                            <ArrowRight className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileRestore}
                                className="hidden"
                                id="restore-file-main"
                                disabled={migrationStatus === 'migrating'}
                            />
                            <label htmlFor="restore-file-main">
                                <Button variant="outline" asChild disabled={migrationStatus === 'migrating'}>
                                    <span>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Restaurer
                                    </span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Résultats de la migration */}
            {migrationResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className={`flex items-center gap-2 ${migrationResult.success ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {migrationResult.success ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <XCircle className="h-5 w-5" />
                            )}
                            {migrationResult.success ? 'Migration réussie' : 'Erreur de migration'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Erreurs */}
                        {migrationResult.errors.length > 0 && (
                            <Alert className="mb-4 border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="font-medium mb-2">Erreurs rencontrées :</div>
                                    <ul className="list-disc list-inside space-y-1">
                                        {migrationResult.errors.map((error, index) => (
                                            <li key={index} className="text-sm">{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Avertissements */}
                        {migrationResult.warnings.length > 0 && (
                            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="font-medium mb-2">Informations :</div>
                                    <ul className="list-disc list-inside space-y-1">
                                        {migrationResult.warnings.map((warning, index) => (
                                            <li key={index} className="text-sm">{warning}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Données migrées */}
                        {migrationResult.success && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {migrationResult.migratedData.personas?.length || 0}
                                    </div>
                                    <div className="text-sm text-green-600">Personas migrées</div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {migrationResult.migratedData.briefs?.length || 0}
                                    </div>
                                    <div className="text-sm text-blue-600">Briefs migrés</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {migrationResult.migratedData.sessionData ? '1' : '0'}
                                    </div>
                                    <div className="text-sm text-purple-600">Session migrée</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default MigrationWizard