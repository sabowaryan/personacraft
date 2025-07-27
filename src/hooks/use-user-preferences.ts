import { useState, useCallback, useEffect } from 'react'
import { useUser } from '@stackframe/stack'
import { handleApiResponse, isAuthTimeoutError, getErrorMessage } from '@/lib/client-error-utils'

export interface UserPreferences {
  language: 'fr' | 'en'
  theme: 'light' | 'dark'
  autoSave: boolean
}

interface UseUserPreferencesReturn {
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
  updatePreferences: (updates: Partial<UserPreferences>) => void
  setLanguage: (language: 'fr' | 'en') => void
  toggleTheme: () => void
  toggleAutoSave: () => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'fr',
  theme: 'light',
  autoSave: true
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const user = useUser()
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger les préférences depuis l'API (base de données)
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/preferences')
      const data = await handleApiResponse<{ preferences: UserPreferences }>(response)
      
      setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences })
    } catch (err) {
      console.error('Erreur lors du chargement des préférences:', err)
      
      if (isAuthTimeoutError(err)) {
        setError('La connexion a pris trop de temps. Veuillez réessayer.')
      } else {
        setError(getErrorMessage(err))
      }
      
      setPreferences(DEFAULT_PREFERENCES)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Sauvegarder les préférences via l'API (base de données)
  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    if (!user) return

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: prefs }),
      })

      await handleApiResponse(response)
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des préférences:', err)
      
      if (isAuthTimeoutError(err)) {
        setError('La connexion a pris trop de temps. Veuillez réessayer.')
      } else {
        setError(getErrorMessage(err))
      }
    }
  }, [user])

  // Charger les préférences au montage et quand l'utilisateur change
  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  // Appliquer le thème au DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', preferences.theme === 'dark')
    }
  }, [preferences.theme])

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      setError(null)

      const newPrefs = { ...preferences, ...updates }
      setPreferences(newPrefs)
      
      // Sauvegarder en base de données
      await savePreferences(newPrefs)
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences:', err)
      setError('Erreur lors de la mise à jour des préférences')
      // Revenir aux anciennes préférences en cas d'erreur
      setPreferences(preferences)
    }
  }, [preferences, savePreferences])

  const setLanguage = useCallback((language: 'fr' | 'en') => {
    updatePreferences({ language })
  }, [updatePreferences])

  const toggleTheme = useCallback(() => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light'
    updatePreferences({ theme: newTheme })
  }, [preferences.theme, updatePreferences])

  const toggleAutoSave = useCallback(() => {
    updatePreferences({ autoSave: !preferences.autoSave })
  }, [preferences.autoSave, updatePreferences])

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    setLanguage,
    toggleTheme,
    toggleAutoSave
  }
}

export default useUserPreferences