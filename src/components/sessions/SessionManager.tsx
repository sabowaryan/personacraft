'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Monitor,
    Smartphone,
    Tablet,
    MapPin,
    Clock,
    Shield,
    AlertTriangle,
    X,
    RefreshCw
} from 'lucide-react'
// Fonction utilitaire pour formater le temps relatif
const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
        return 'il y a quelques secondes'
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `il y a ${days} jour${days > 1 ? 's' : ''}`
    }
}

interface Session {
    id: string
    deviceType: 'desktop' | 'mobile' | 'tablet'
    deviceName: string
    browser: string
    location: string
    ipAddress: string
    lastActivity: Date
    isCurrentSession: boolean
    isSuspicious: boolean
}

const mockSessions: Session[] = [
    {
        id: '1',
        deviceType: 'desktop',
        deviceName: 'Windows PC',
        browser: 'Chrome 120.0',
        location: 'Paris, France',
        ipAddress: '192.168.1.100',
        lastActivity: new Date(),
        isCurrentSession: true,
        isSuspicious: false
    },
    {
        id: '2',
        deviceType: 'mobile',
        deviceName: 'iPhone 15',
        browser: 'Safari 17.0',
        location: 'Lyon, France',
        ipAddress: '192.168.1.101',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures
        isCurrentSession: false,
        isSuspicious: false
    },
    {
        id: '3',
        deviceType: 'tablet',
        deviceName: 'iPad Pro',
        browser: 'Safari 17.0',
        location: 'Marseille, France',
        ipAddress: '192.168.1.102',
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 jour
        isCurrentSession: false,
        isSuspicious: true
    }
]

// Fonction utilitaire pour obtenir l'icône d'appareil
const getDeviceIcon = (deviceType: Session['deviceType']) => {
    switch (deviceType) {
        case 'desktop':
            return <Monitor className="h-5 w-5" />
        case 'mobile':
            return <Smartphone className="h-5 w-5" />
        case 'tablet':
            return <Tablet className="h-5 w-5" />
        default:
            return <Monitor className="h-5 w-5" />
    }
}

export function SessionManager() {
    const [sessions, setSessions] = useState<Session[]>(mockSessions)
    const [isLoading, setIsLoading] = useState(false)

    const handleRevokeSession = async (sessionId: string) => {
        setIsLoading(true)

        // Simulation d'une requête API
        await new Promise(resolve => setTimeout(resolve, 1000))

        setSessions(prev => prev.filter(session => session.id !== sessionId))
        setIsLoading(false)
    }

    const handleRefreshSessions = async () => {
        setIsLoading(true)

        // Simulation d'une requête API pour rafraîchir les sessions
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mise à jour des dernières activités
        setSessions(prev => prev.map(session => ({
            ...session,
            lastActivity: session.isCurrentSession ? new Date() : session.lastActivity
        })))

        setIsLoading(false)
    }

    const suspiciousSessions = sessions.filter(session => session.isSuspicious)
    const activeSessions = sessions.filter(session => !session.isSuspicious)

    return (
        <div className="space-y-6">
            {/* Actions principales */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium">
                        {sessions.length} session{sessions.length > 1 ? 's' : ''} active{sessions.length > 1 ? 's' : ''}
                    </span>
                </div>
                <Button
                    variant="outline"
                    onClick={handleRefreshSessions}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                </Button>
            </div>

            {/* Sessions suspectes */}
            {suspiciousSessions.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-5 w-5" />
                            Sessions suspectes détectées
                        </CardTitle>
                        <CardDescription className="text-red-700">
                            Ces sessions présentent des activités inhabituelles. Vérifiez-les attentivement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {suspiciousSessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onRevoke={handleRevokeSession}
                                isLoading={isLoading}
                                variant="suspicious"
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Sessions actives */}
            <Card>
                <CardHeader>
                    <CardTitle>Sessions actives</CardTitle>
                    <CardDescription>
                        Toutes vos sessions de connexion actuelles
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onRevoke={handleRevokeSession}
                            isLoading={isLoading}
                            variant="normal"
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

interface SessionCardProps {
    session: Session
    onRevoke: (sessionId: string) => void
    isLoading: boolean
    variant: 'normal' | 'suspicious'
}

function SessionCard({ session, onRevoke, isLoading, variant }: SessionCardProps) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-lg border ${variant === 'suspicious'
                ? 'border-red-200 bg-red-50'
                : session.isCurrentSession
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white'
            }`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${variant === 'suspicious'
                        ? 'bg-red-100 text-red-600'
                        : session.isCurrentSession
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                    {getDeviceIcon(session.deviceType)}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{session.deviceName}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{session.browser}</span>
                        {session.isCurrentSession && (
                            <Badge variant="secondary" className="text-xs">
                                Session actuelle
                            </Badge>
                        )}
                        {variant === 'suspicious' && (
                            <Badge variant="destructive" className="text-xs">
                                Suspecte
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                                {formatTimeAgo(session.lastActivity)}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        IP: {session.ipAddress}
                    </div>
                </div>
            </div>

            {!session.isCurrentSession && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRevoke(session.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="h-4 w-4" />
                    Révoquer
                </Button>
            )}
        </div>
    )
}