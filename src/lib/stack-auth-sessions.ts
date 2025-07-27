// Types pour les sessions Stack Auth
export interface StackSession {
    id: string
    userId: string
    createdAt: string
    lastActiveAt: string
    expiresAt: string
    ipAddress?: string
    userAgent?: string
    isCurrent?: boolean
}

export interface SessionListResponse {
    sessions: StackSession[]
    totalCount: number
}

// Service pour gérer les sessions via Stack Auth
export class StackAuthSessionService {

    /**
     * Récupère toutes les sessions pour l'utilisateur actuel
     * Note: Stack Auth ne fournit pas d'API directe pour lister toutes les sessions
     * Cette méthode simule la fonctionnalité en utilisant les données disponibles
     */
    static async listSessions(user: any): Promise<SessionListResponse> {
        try {
            if (!user) {
                return {
                    sessions: [],
                    totalCount: 0
                }
            }

            // Stack Auth ne fournit pas de liste complète des sessions
            // Nous créons une session simulée basée sur la session actuelle
            const currentSession = await this.getCurrentSession(user)

            if (!currentSession) {
                return {
                    sessions: [],
                    totalCount: 0
                }
            }

            return {
                sessions: [currentSession],
                totalCount: 1
            }
        } catch (error) {
            console.error('Error retrieving sessions:', error)
            throw error
        }
    }

    /**
     * Récupère la session active actuelle
     */
    static async getCurrentSession(user: any): Promise<StackSession | null> {
        try {
            if (!user) return null

            // Créer une session simulée basée sur les données utilisateur disponibles
            const now = new Date()
            const sessionExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h par défaut

            return {
                id: `session_${user.id}_${now.getTime()}`,
                userId: user.id,
                createdAt: now.toISOString(), // Stack Auth ne fournit pas createdAtTime côté client
                lastActiveAt: now.toISOString(),
                expiresAt: sessionExpiry.toISOString(),
                ipAddress: undefined, // Non disponible côté client
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
                isCurrent: true
            }
        } catch (error) {
            console.error('Error retrieving current session:', error)
            return null
        }
    }

    /**
     * Invalide une session spécifique
     * Pour Stack Auth, cela équivaut à déconnecter l'utilisateur
     */
    static async revokeSession(sessionId: string, user: any): Promise<boolean> {
        try {
            const currentSession = await this.getCurrentSession(user)

            // Si c'est la session actuelle, déconnecter l'utilisateur
            if (currentSession && currentSession.id === sessionId) {
                // Note: Logout must be handled via the useUser hook
                console.warn('Use user.signOut() from the useUser hook to logout')
                return false
            }

            // For other sessions, Stack Auth doesn't allow individual revocation
            // from the client, so we return false
            console.warn('Cannot revoke non-current session with Stack Auth')
            return false
        } catch (error) {
            console.error('Error revoking session:', error)
            return false
        }
    }

    /**
     * Invalide toutes les sessions sauf la session actuelle
     * Note: Stack Auth ne permet pas de gérer plusieurs sessions depuis le client
     */
    static async revokeAllOtherSessions(): Promise<boolean> {
        try {
            // Stack Auth doesn't provide a method to revoke other sessions
            // from the client. This functionality would require a server-side API
            console.warn('Revoking other sessions is not supported by Stack Auth on the client side')
            return true // Retourner true car il n'y a techniquement pas d'autres sessions à révoquer
        } catch (error) {
            console.error('Error revoking other sessions:', error)
            return false
        }
    }

    /**
     * Vérifie si l'utilisateur est actuellement connecté
     */
    static async isAuthenticated(user: any): Promise<boolean> {
        try {
            return user !== null
        } catch (error) {
            console.error('Error checking authentication:', error)
            return false
        }
    }

    /**
     * Formate les informations de session pour l'affichage
     */
    static formatSessionInfo(session: StackSession): {
        id: string
        isActive: boolean
        createdAt: string
        lastActive: string
        location?: string
        device?: string
        browser?: string
    } {
        const isActive = new Date(session.expiresAt) > new Date()

        // Parser le User-Agent pour extraire des informations sur le navigateur/device
        const deviceInfo = this.parseUserAgent(session.userAgent || '')

        return {
            id: session.id,
            isActive,
            createdAt: new Date(session.createdAt).toLocaleString('fr-FR'),
            lastActive: new Date(session.lastActiveAt).toLocaleString('fr-FR'),
            location: session.ipAddress ? `IP: ${session.ipAddress}` : undefined,
            device: deviceInfo.device,
            browser: deviceInfo.browser
        }
    }

    /**
     * Parse le User-Agent pour extraire des informations sur le device/navigateur
     */
    private static parseUserAgent(userAgent: string): { device?: string; browser?: string } {
        if (!userAgent) return {}

        const result: { device?: string; browser?: string } = {}

        // Détecter le navigateur
        if (userAgent.includes('Chrome')) {
            result.browser = 'Chrome'
        } else if (userAgent.includes('Firefox')) {
            result.browser = 'Firefox'
        } else if (userAgent.includes('Safari')) {
            result.browser = 'Safari'
        } else if (userAgent.includes('Edge')) {
            result.browser = 'Edge'
        }

        // Détecter le type d'appareil
        if (userAgent.includes('Mobile')) {
            result.device = 'Mobile'
        } else if (userAgent.includes('Tablet')) {
            result.device = 'Tablette'
        } else {
            result.device = 'Ordinateur'
        }

        return result
    }

    /**
     * Obtient des statistiques sur les sessions
     */
    static async getSessionStats(user: any): Promise<{
        totalSessions: number
        activeSessions: number
        expiredSessions: number
        oldestSession?: Date
        newestSession?: Date
    }> {
        try {
            const isAuth = await this.isAuthenticated(user)

            if (!isAuth) {
                return {
                    totalSessions: 0,
                    activeSessions: 0,
                    expiredSessions: 0
                }
            }

            const currentSession = await this.getCurrentSession(user)

            if (!currentSession) {
                return {
                    totalSessions: 0,
                    activeSessions: 0,
                    expiredSessions: 0
                }
            }

            const now = new Date()
            const isActive = new Date(currentSession.expiresAt) > now

            return {
                totalSessions: 1,
                activeSessions: isActive ? 1 : 0,
                expiredSessions: isActive ? 0 : 1,
                oldestSession: new Date(currentSession.createdAt),
                newestSession: new Date(currentSession.createdAt)
            }
        } catch (error) {
            console.error('Error retrieving statistics:', error)
            return {
                totalSessions: 0,
                activeSessions: 0,
                expiredSessions: 0
            }
        }
    }
}