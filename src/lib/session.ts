import { useState } from 'react'
import { Persona } from '@/types'
import { validateAndCleanPersonas, validateAndCleanPersona } from './persona-utils'

// Utilitaires pour la gestion des sessions et persistance locale

export interface SessionData {
  id: string
  createdAt: string
  lastUpdated?: string
  totalPersonas: number
  totalGenerations: number
  preferences: {
    theme: 'light' | 'dark'
    language: 'fr' | 'en'
    autoSave: boolean
  }
}

const SESSION_KEY = 'personacraft_session'
const PERSONAS_KEY = 'personacraft_personas'
const BRIEFS_KEY = 'personacraft_briefs'

// Gestion des sessions
export class SessionManager {
  static createSession(): SessionData {
    const session: SessionData = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalPersonas: 0,
      totalGenerations: 0,
      preferences: {
        theme: 'light',
        language: 'fr',
        autoSave: true
      }
    }
    
    this.saveSession(session)
    return session
  }

  static getSession(): SessionData | null {
    if (typeof window === 'undefined') return null
    
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (!sessionData || sessionData.trim() === '') return null
      
      // Vérifier que c'est un JSON valide avant de parser
      const trimmed = sessionData.trim()
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        console.warn('Session data format invalide, suppression')
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      
      // Tentative de parsing avec gestion d'erreur robuste
      let parsed
      try {
        parsed = JSON.parse(trimmed)
      } catch (parseError) {
        console.error('Erreur de parsing JSON pour la session:', parseError)
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      
      // Valider la structure de base
      if (!parsed || typeof parsed !== 'object' || !parsed.id) {
        console.warn('Session data invalide, création d\'une nouvelle session')
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      
      return parsed
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error)
      // Nettoyer le localStorage corrompu
      localStorage.removeItem(SESSION_KEY)
      return null
    }
  }

  static saveSession(session: SessionData): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error)
    }
  }

  static updateSession(updates: Partial<SessionData>): SessionData | null {
    const currentSession = this.getSession()
    if (!currentSession) return null

    const updatedSession = {
      ...currentSession,
      ...updates,
      lastUpdated: new Date().toISOString()
    }

    this.saveSession(updatedSession)
    return updatedSession
  }

  static clearSession(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_KEY)
  }
}

// Gestion des personas
export class PersonaManager {
  static getPersonas(): Persona[] {
    if (typeof window === 'undefined') return []
    
    try {
      const personasData = localStorage.getItem(PERSONAS_KEY)
      if (!personasData || personasData.trim() === '') return []
      
      // Vérifier que c'est un JSON valide avant de parser
      const trimmed = personasData.trim()
      if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        console.warn('Personas data format invalide, suppression')
        localStorage.removeItem(PERSONAS_KEY)
        return []
      }
      
      // Tentative de parsing avec gestion d'erreur robuste
      let rawPersonas
      try {
        rawPersonas = JSON.parse(trimmed)
      } catch (parseError) {
        console.error('Erreur de parsing JSON pour les personas:', parseError)
        localStorage.removeItem(PERSONAS_KEY)
        return []
      }
      
      if (!Array.isArray(rawPersonas)) {
        console.warn('Données personas invalides, réinitialisation')
        localStorage.removeItem(PERSONAS_KEY)
        return []
      }
      
      // Valider et nettoyer les personas lors du chargement
      return validateAndCleanPersonas(rawPersonas)
    } catch (error) {
      console.error('Erreur lors de la récupération des personas:', error)
      // Nettoyer le localStorage corrompu
      localStorage.removeItem(PERSONAS_KEY)
      return []
    }
  }

  static savePersonas(personas: Persona[]): void {
    if (typeof window === 'undefined') return
    
    try {
      // Valider et nettoyer les personas avant la sauvegarde
      const cleanedPersonas = validateAndCleanPersonas(personas)
      localStorage.setItem(PERSONAS_KEY, JSON.stringify(cleanedPersonas))
      
      // Mettre à jour les stats de session
      SessionManager.updateSession({
        totalPersonas: cleanedPersonas.length
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des personas:', error)
    }
  }

  static addPersona(persona: Persona): void {
    const personas = this.getPersonas()
    const cleanedPersona = validateAndCleanPersona(persona)
    personas.push(cleanedPersona)
    this.savePersonas(personas)
  }

  static updatePersona(personaId: string, updates: Partial<Persona>): void {
    const personas = this.getPersonas()
    const index = personas.findIndex(p => p.id === personaId)
    
    if (index !== -1) {
      const updatedPersona = { ...personas[index], ...updates }
      personas[index] = validateAndCleanPersona(updatedPersona)
      this.savePersonas(personas)
    }
  }

  static deletePersona(personaId: string): void {
    const personas = this.getPersonas()
    const filteredPersonas = personas.filter(p => p.id !== personaId)
    this.savePersonas(filteredPersonas)
  }

  static clearPersonas(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(PERSONAS_KEY)
    SessionManager.updateSession({ totalPersonas: 0 })
  }

  static exportPersona(persona: Persona, format: 'json' | 'csv' | 'pdf'): void {
    let content: string
    let mimeType: string
    let filename: string

    switch (format) {
      case 'json':
        content = JSON.stringify(persona, null, 2)
        mimeType = 'application/json'
        filename = `persona_${persona.name.replace(/\s+/g, '_')}.json`
        break
      
      case 'csv':
        content = this.personaToCSV(persona)
        mimeType = 'text/csv'
        filename = `persona_${persona.name.replace(/\s+/g, '_')}.csv`
        break
      
      case 'pdf':
        // Pour le PDF, on utilise une représentation JSON pour l'instant
        content = JSON.stringify(persona, null, 2)
        mimeType = 'application/json'
        filename = `persona_${persona.name.replace(/\s+/g, '_')}.txt`
        break
      
      default:
        return
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  private static personaToCSV(persona: Persona): string {
    const headers = [
      'Nom', 'Âge', 'Profession', 'Localisation', 'Revenus', 'Éducation',
      'Situation familiale', 'Personnalité', 'Valeurs', 'Intérêts',
      'Style de vie', 'Musique', 'Films', 'Marques', 'Réseaux sociaux',
      'Points de douleur', 'Objectifs', 'Canaux préférés', 'Ton de message',
      'Comportement d\'achat', 'Score qualité', 'Date de création'
    ]

    const values = [
      persona.name,
      persona.age.toString(),
      persona.occupation,
      persona.location,
      persona.demographics.income,
      persona.demographics.education,
      persona.demographics.familyStatus,
      persona.psychographics.personality.join('; '),
      persona.psychographics.values.join('; '),
      persona.psychographics.interests.join('; '),
      persona.psychographics.lifestyle,
      persona.culturalData.music.join('; '),
      persona.culturalData.movies.join('; '),
      persona.culturalData.brands.join('; '),
      persona.culturalData.socialMedia.join('; '),
      persona.painPoints.join('; '),
      persona.goals.join('; '),
      persona.marketingInsights.preferredChannels.join('; '),
      persona.marketingInsights.messagingTone,
      persona.marketingInsights.buyingBehavior,
      persona.qualityScore.toString(),
      new Date(persona.createdAt).toLocaleDateString('fr-FR')
    ]

    return [headers.join(','), values.map(v => `"${v}"`).join(',')].join('\n')
  }
}

// Gestion des briefs sauvegardés
export class BriefManager {
  static getBriefs(): string[] {
    if (typeof window === 'undefined') return []
    
    try {
      const briefsData = localStorage.getItem(BRIEFS_KEY)
      if (!briefsData || briefsData.trim() === '') return []
      
      // Vérifier que c'est un JSON valide avant de parser
      const trimmed = briefsData.trim()
      if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        console.warn('Briefs data format invalide, suppression')
        localStorage.removeItem(BRIEFS_KEY)
        return []
      }
      
      // Tentative de parsing avec gestion d'erreur robuste
      let parsed
      try {
        parsed = JSON.parse(trimmed)
      } catch (parseError) {
        console.error('Erreur de parsing JSON pour les briefs:', parseError)
        localStorage.removeItem(BRIEFS_KEY)
        return []
      }
      
      if (!Array.isArray(parsed)) {
        console.warn('Données briefs invalides, réinitialisation')
        localStorage.removeItem(BRIEFS_KEY)
        return []
      }
      
      return parsed.filter(brief => typeof brief === 'string')
    } catch (error) {
      console.error('Erreur lors de la récupération des briefs:', error)
      // Nettoyer le localStorage corrompu
      localStorage.removeItem(BRIEFS_KEY)
      return []
    }
  }

  static saveBrief(brief: string): void {
    if (typeof window === 'undefined' || !brief.trim()) return
    
    const briefs = this.getBriefs()
    if (!briefs.includes(brief)) {
      briefs.unshift(brief) // Ajouter au début
      // Garder seulement les 10 derniers briefs
      if (briefs.length > 10) {
        briefs.splice(10)
      }
      
      try {
        localStorage.setItem(BRIEFS_KEY, JSON.stringify(briefs))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du brief:', error)
      }
    }
  }

  static deleteBrief(brief: string): void {
    if (typeof window === 'undefined') return
    
    const briefs = this.getBriefs()
    const filteredBriefs = briefs.filter(b => b !== brief)
    
    try {
      localStorage.setItem(BRIEFS_KEY, JSON.stringify(filteredBriefs))
    } catch (error) {
      console.error('Erreur lors de la suppression du brief:', error)
    }
  }

  static clearBriefs(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(BRIEFS_KEY)
  }
}

// Hook personnalisé pour la gestion d'état
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      if (!item || item.trim() === '') return initialValue
      
      // Vérification basique du format JSON
      if (!item.startsWith('{') && !item.startsWith('[') && !item.startsWith('"')) {
        console.warn(`Format invalide pour ${key}, utilisation de la valeur par défaut`)
        window.localStorage.removeItem(key)
        return initialValue
      }
      
      const parsed = JSON.parse(item)
      return parsed
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error)
      // Nettoyer la clé corrompue
      window.localStorage.removeItem(key)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error)
    }
  }

  return [storedValue, setValue] as const
}

// Fonctions d'export simples pour compatibilité
export const getSession = () => SessionManager.getSession()
export const updateSession = (updates: Partial<SessionData>) => SessionManager.updateSession(updates)
export const createSession = () => SessionManager.createSession()
export const savePersonas = (personas: Persona[]) => PersonaManager.savePersonas(personas)
export const getPersonas = () => PersonaManager.getPersonas()
export const loadPersonas = () => PersonaManager.getPersonas()
export const exportToJSON = (personas: Persona[]) => {
  if (personas.length === 1) {
    PersonaManager.exportPersona(personas[0], 'json')
  } else {
    const content = JSON.stringify(personas, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'personas.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
export const exportToCSV = (personas: Persona[]) => {
  if (personas.length === 1) {
    PersonaManager.exportPersona(personas[0], 'csv')
  } else {
    // Export multiple personas to CSV
    const headers = [
      'Nom', 'Âge', 'Profession', 'Localisation', 'Score qualité', 'Date de création'
    ]
    const rows = personas.map(p => [
      p.name, p.age.toString(), p.occupation, p.location, 
      p.qualityScore.toString(), new Date(p.createdAt).toLocaleDateString('fr-FR')
    ])
    const csvContent = [headers.join(','), ...rows.map(row => row.map(v => `"${v}"`).join(','))].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'personas.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
export const getSessionStats = () => {
  const session = SessionManager.getSession()
  if (session) {
    return {
      count: session.totalPersonas,
      startTime: new Date(session.createdAt)
    }
  }
  return {
    count: 0,
    startTime: new Date()
  }
}
export const saveSessionStats = (stats: { count: number; startTime: Date }) => {
  SessionManager.updateSession({
    totalPersonas: stats.count
  })
}

