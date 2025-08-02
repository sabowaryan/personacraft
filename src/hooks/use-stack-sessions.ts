import { useState, useEffect, useCallback } from 'react'
import { useSafeUser } from './use-safe-user'
import { StackAuthSessionService, StackSession } from '@/lib/stack-auth-sessions'
import { shouldBypassAuth } from '@/lib/feature-flags'

interface UseStackSessionsReturn {
  // État
  sessions: StackSession[]
  currentSession: StackSession | null
  isLoading: boolean
  error: string | null

  // Actions
  refreshSessions: () => Promise<void>
  revokeSession: (sessionId: string) => Promise<boolean>
  revokeAllOtherSessions: () => Promise<boolean>
  incrementGenerations: () => Promise<void>

  // Statistiques
  stats: {
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    oldestSession?: Date
    newestSession?: Date
  }

  // Utilitaires
  formatSessionInfo: (session: StackSession) => {
    id: string
    isActive: boolean
    createdAt: string
    lastActive: string
    location?: string
    device?: string
    browser?: string
  }
}

export function useStackSessions(): UseStackSessionsReturn {
  // Check if auth is bypassed
  const authBypass = shouldBypassAuth();
  
  // Use safe user hook
  const user = useSafeUser();
  
  const [sessions, setSessions] = useState<StackSession[]>([])
  const [currentSession, setCurrentSession] = useState<StackSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalSessions: authBypass ? 1 : 0,
    activeSessions: authBypass ? 1 : 0,
    expiredSessions: 0
  })

  const refreshSessions = useCallback(async () => {
    // If auth is bypassed, return mock data
    if (authBypass) {
      setIsLoading(false)
      setError(null)
      setSessions([])
      setCurrentSession(null)
      setStats({
        totalSessions: 1,
        activeSessions: 1,
        expiredSessions: 0
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Charger toutes les sessions
      const sessionData = await StackAuthSessionService.listSessions(user)
      setSessions(sessionData.sessions)

      // Charger la session actuelle
      const current = await StackAuthSessionService.getCurrentSession(user)
      setCurrentSession(current)

      // Charger les statistiques
      const sessionStats = await StackAuthSessionService.getSessionStats(user)
      setStats(sessionStats)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading sessions'
      setError(errorMessage)
      console.error('Error in useStackSessions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, authBypass])

  // Charger les sessions au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      refreshSessions()
    }
  }, [user, refreshSessions])

  const revokeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await StackAuthSessionService.revokeSession(sessionId, user)

      if (success) {
        // Rafraîchir la liste des sessions après révocation
        await refreshSessions()
      } else {
        setError('Failed to revoke session')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error revoking session'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [refreshSessions, user])

  const revokeAllOtherSessions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await StackAuthSessionService.revokeAllOtherSessions()

      if (success) {
        // Rafraîchir la liste des sessions après révocation
        await refreshSessions()
      } else {
        setError('Failed to revoke other sessions')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error revoking sessions'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [refreshSessions])

  const incrementGenerations = useCallback(async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'increment_generations'
        }),
      })

      if (!response.ok) {
        throw new Error('Error incrementing generations')
      }
    } catch (err) {
      console.error('Error incrementing generations:', err)
    }
  }, [])

  const formatSessionInfo = useCallback((session: StackSession) => {
    return StackAuthSessionService.formatSessionInfo(session)
  }, [])

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    refreshSessions,
    revokeSession,
    revokeAllOtherSessions,
    incrementGenerations,
    stats,
    formatSessionInfo
  }
}

export default useStackSessions