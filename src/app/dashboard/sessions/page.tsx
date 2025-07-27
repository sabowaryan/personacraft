'use client'

import React from 'react'
import { SessionManager } from '@/components/sessions/SessionManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Info } from 'lucide-react'

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des sessions</h1>
          <p className="text-muted-foreground">
            Surveillez et gérez vos sessions de connexion pour maintenir la sécurité de votre compte
          </p>
        </div>
      </div>

      {/* Informations de sécurité */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Conseils de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>• Vérifiez régulièrement vos sessions actives</li>
            <li>• Révoquezles sessions suspectes ou non reconnues</li>
            <li>• Déconnectez-vous des appareils publics ou partagés</li>
            <li>• Utilisez des mots de passe forts et uniques</li>
          </ul>
        </CardContent>
      </Card>

      {/* Gestionnaire de sessions */}
      <SessionManager />
    </div>
  )
}