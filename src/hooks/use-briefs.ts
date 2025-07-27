import { useState, useCallback, useEffect } from 'react'
import { useUser } from '@stackframe/stack'

interface UseBriefsReturn {
  savedBriefs: string[]
  isLoading: boolean
  error: string | null
  saveBrief: (brief: string) => void
  deleteBrief: (brief: string) => void
  clearBriefs: () => void
}

const BRIEFS_STORAGE_KEY = 'personacraft_briefs'

export function useBriefs(): UseBriefsReturn {
  const user = useUser()
  const [savedBriefs, setSavedBriefs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Générer une clé de stockage unique par utilisateur
  const getStorageKey = useCallback(() => {
    if (user?.id) {
      return `${BRIEFS_STORAGE_KEY}_${user.id}`
    }
    return BRIEFS_STORAGE_KEY // Fallback pour les utilisateurs non connectés
  }, [user?.id])

  // Charger les briefs depuis le localStorage
  const loadBriefs = useCallback(() => {
    try {
      setIsLoading(true)
      setError(null)
      
      const storageKey = getStorageKey()
      const stored = localStorage.getItem(storageKey)
      
      if (stored) {
        const briefs = JSON.parse(stored)
        if (Array.isArray(briefs)) {
          setSavedBriefs(briefs)
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des briefs:', err)
      setError('Erreur lors du chargement des briefs')
    } finally {
      setIsLoading(false)
    }
  }, [getStorageKey])

  // Sauvegarder les briefs dans le localStorage
  const saveBriefsToStorage = useCallback((briefs: string[]) => {
    try {
      const storageKey = getStorageKey()
      localStorage.setItem(storageKey, JSON.stringify(briefs))
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des briefs:', err)
      setError('Erreur lors de la sauvegarde des briefs')
    }
  }, [getStorageKey])

  // Charger les briefs au montage et quand l'utilisateur change
  useEffect(() => {
    loadBriefs()
  }, [loadBriefs])

  const saveBrief = useCallback((brief: string) => {
    if (!brief.trim()) return

    try {
      setError(null)
      const trimmedBrief = brief.trim()
      
      setSavedBriefs(prevBriefs => {
        // Éviter les doublons
        if (prevBriefs.includes(trimmedBrief)) {
          return prevBriefs
        }
        
        // Limiter à 10 briefs maximum (garder les plus récents)
        const newBriefs = [trimmedBrief, ...prevBriefs].slice(0, 10)
        saveBriefsToStorage(newBriefs)
        return newBriefs
      })
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du brief:', err)
      setError('Erreur lors de la sauvegarde du brief')
    }
  }, [saveBriefsToStorage])

  const deleteBrief = useCallback((brief: string) => {
    try {
      setError(null)
      
      setSavedBriefs(prevBriefs => {
        const newBriefs = prevBriefs.filter(b => b !== brief)
        saveBriefsToStorage(newBriefs)
        return newBriefs
      })
    } catch (err) {
      console.error('Erreur lors de la suppression du brief:', err)
      setError('Erreur lors de la suppression du brief')
    }
  }, [saveBriefsToStorage])

  const clearBriefs = useCallback(() => {
    try {
      setError(null)
      setSavedBriefs([])
      saveBriefsToStorage([])
    } catch (err) {
      console.error('Erreur lors de la suppression des briefs:', err)
      setError('Erreur lors de la suppression des briefs')
    }
  }, [saveBriefsToStorage])

  return {
    savedBriefs,
    isLoading,
    error,
    saveBrief,
    deleteBrief,
    clearBriefs
  }
}

export default useBriefs