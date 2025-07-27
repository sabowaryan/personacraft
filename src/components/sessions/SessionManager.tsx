'use client'

import React from 'react'
import { useStackSessions } from '@/hooks/use-stack-sessions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { RefreshCw, Shield, Smartphone, Monitor, Globe, Clock, Trash2 } from 'lucide-react'

export function SessionManager() {
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    refreshSessions,
    revokeSession,
    revokeAllOtherSessions,
    stats,
    formatSessionInfo
  } = useStackSessions()

  const handleRevokeSession = async (sessionId: string) => {
    const success = await revokeSession(sessionId)
    if (success) {
      // Optionnel: afficher une notification de succès
      console.log('Session révoquée avec succès')
    }
  }

  const handleRevokeAllOthers = async () => {
    const success = await revokeAllOtherSessions()
    if (success) {
      // Optionnel: afficher une notification de succès
      console.log('Toutes les autres sessions ont été révoquées')
    }
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Erreur de chargement des sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshSessions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestion des sessions
              </CardTitle>
              <CardDescription>
                Gérez vos sessions actives et l'historique de connexion
              </CardDescription>
            </div>
            <Button 
              onClick={refreshSessions} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-sm text-blue-600">Sessions totales</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
              <div className="text-sm text-green-600">Sessions actives</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.expiredSessions}</div>
              <div className="text-sm text-gray-600">Sessions expirées</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions globales */}
      {stats.activeSessions > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions de sécurité</CardTitle>
            <CardDescription>
              Gérez la sécurité de votre compte en révoquant les sessions suspectes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Révoquer toutes les autres sessions
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Révoquer toutes les autres sessions ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va déconnecter tous vos autres appareils. Vous devrez vous reconnecter 
                    sur ces appareils. Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRevokeAllOthers}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Révoquer toutes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Liste des sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions actives et récentes</CardTitle>
          <CardDescription>
            Voici la liste de toutes vos sessions de connexion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Chargement des sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune session trouvée
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const sessionInfo = formatSessionInfo(session)
                const isCurrentSession = currentSession?.id === session.id

                return (
                  <div
                    key={session.id}
                    className={`p-4 border rounded-lg ${
                      isCurrentSession 
                        ? 'border-blue-200 bg-blue-50' 
                        : sessionInfo.isActive 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {sessionInfo.device === 'Mobile' ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Monitor className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {sessionInfo.browser || 'Navigateur inconnu'} sur {sessionInfo.device || 'Appareil inconnu'}
                          </span>
                          {isCurrentSession && (
                            <Badge variant="default" className="bg-blue-600">
                              Session actuelle
                            </Badge>
                          )}
                          <Badge 
                            variant={sessionInfo.isActive ? "default" : "secondary"}
                            className={sessionInfo.isActive ? "bg-green-600" : ""}
                          >
                            {sessionInfo.isActive ? 'Active' : 'Expirée'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Créée: {sessionInfo.createdAt}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Dernière activité: {sessionInfo.lastActive}
                          </div>
                          {sessionInfo.location && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {sessionInfo.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isCurrentSession && sessionInfo.isActive && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Révoquer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Révoquer cette session ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action va déconnecter cet appareil. L'utilisateur devra se reconnecter.
                                Cette action ne peut pas être annulée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRevokeSession(session.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Révoquer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionManager