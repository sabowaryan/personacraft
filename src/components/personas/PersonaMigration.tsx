'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { PersonaManager } from '@/lib/session'
import { CheckCircle, AlertCircle, Database, HardDrive } from 'lucide-react'

interface MigrationResult {
  success: boolean
  migratedCount: number
  totalCount: number
  error?: string
}

export function PersonaMigration() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [localPersonasCount, setLocalPersonasCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return PersonaManager.getPersonas().length
    }
    return 0
  })

  const handleMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Récupérer les personas du localStorage
      const localPersonas = PersonaManager.getPersonas()
      
      if (localPersonas.length === 0) {
        setResult({
          success: false,
          migratedCount: 0,
          totalCount: 0,
          error: 'Aucun persona trouvé dans le stockage local'
        })
        return
      }

      // Envoyer les personas à l'API de migration
      const response = await fetch('/api/personas/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personas: localPersonas })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la migration')
      }

      setResult({
        success: true,
        migratedCount: data.migratedCount,
        totalCount: data.totalCount
      })

      // Optionnel : nettoyer le localStorage après migration réussie
      if (data.success && data.migratedCount > 0) {
        // PersonaManager.clearPersonas()
        // Commenté pour laisser le choix à l'utilisateur
      }

    } catch (error) {
      setResult({
        success: false,
        migratedCount: 0,
        totalCount: localPersonasCount,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearLocalStorage = () => {
    PersonaManager.clearPersonas()
    setLocalPersonasCount(0)
  }

  // Ne pas afficher le composant s'il n'y a pas de personas à migrer
  if (localPersonasCount === 0 && !result) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migration des Personas
        </CardTitle>
        <CardDescription>
          Transférez vos personas du stockage local vers la base de données pour une meilleure persistance et synchronisation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut actuel */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>Stockage local</span>
          </div>
          <span className="font-semibold">{localPersonasCount} personas</span>
        </div>

        {/* Résultat de la migration */}
        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {result.success ? (
                  <>
                    Migration réussie ! {result.migratedCount} sur {result.totalCount} personas ont été migrés vers la base de données.
                  </>
                ) : (
                  <>
                    Erreur lors de la migration : {result.error}
                  </>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Barre de progression */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Migration en cours...</span>
              <span>Veuillez patienter</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleMigration}
            disabled={isLoading || localPersonasCount === 0}
            className="flex-1"
          >
            {isLoading ? 'Migration...' : 'Migrer vers la base de données'}
          </Button>
          
          {result?.success && (
            <Button
              variant="outline"
              onClick={clearLocalStorage}
              className="flex-1"
            >
              Nettoyer le stockage local
            </Button>
          )}
        </div>

        {/* Informations */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• La migration préserve tous vos personas existants</p>
          <p>• Les personas en double seront mis à jour automatiquement</p>
          <p>• Vos données locales ne seront pas supprimées automatiquement</p>
        </div>
      </CardContent>
    </Card>
  )
}