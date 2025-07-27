import { useState, useCallback } from 'react'
import { Persona, ExportOptions } from '@/types'
import { PersonaManager } from '@/lib/session'

interface UseExportReturn {
  isExporting: boolean
  exportProgress: number
  error: string | null
  // Export functions
  exportPersona: (persona: Persona, format: 'json' | 'csv' | 'pdf') => Promise<void>
  exportPersonas: (personas: Persona[], options: ExportOptions) => Promise<void>
  exportAll: (options: ExportOptions) => Promise<void>
  // Bulk operations
  exportSelected: (personaIds: string[], options: ExportOptions) => Promise<void>
  exportFiltered: (personas: Persona[], options: ExportOptions) => Promise<void>
  // Template generation
  generateTemplate: (personas: Persona[]) => string
  generateReport: (personas: Persona[]) => Promise<string>
  // Utilities
  validateExportData: (personas: Persona[]) => boolean
  getExportPreview: (personas: Persona[], format: string) => string
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const exportPersona = useCallback(async (persona: Persona, format: 'json' | 'csv' | 'pdf') => {
    setIsExporting(true)
    setError(null)
    setExportProgress(0)

    try {
      setExportProgress(50)
      PersonaManager.exportPersona(persona, format)
      setExportProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export')
      throw err
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportProgress(0), 1000)
    }
  }, [])

  const exportPersonas = useCallback(async (personas: Persona[], options: ExportOptions) => {
    setIsExporting(true)
    setError(null)
    setExportProgress(0)

    try {
      if (personas.length === 0) {
        throw new Error('Aucun persona à exporter')
      }

      setExportProgress(25)

      let content: string
      let mimeType: string
      let filename: string

      switch (options.format) {
        case 'json':
          content = JSON.stringify(personas, null, 2)
          mimeType = 'application/json'
          filename = `personas_${new Date().toISOString().split('T')[0]}.json`
          break

        case 'csv':
          content = await generateCSVContent(personas, options)
          mimeType = 'text/csv'
          filename = `personas_${new Date().toISOString().split('T')[0]}.csv`
          break

        case 'pdf':
          content = await generatePDFContent(personas, options)
          mimeType = 'application/pdf'
          filename = `personas_${new Date().toISOString().split('T')[0]}.pdf`
          break

        default:
          throw new Error('Format d\'export non supporté')
      }

      setExportProgress(75)

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export')
      throw err
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportProgress(0), 1000)
    }
  }, [])

  const exportAll = useCallback(async (options: ExportOptions) => {
    const allPersonas = PersonaManager.getPersonas()
    await exportPersonas(allPersonas, options)
  }, [exportPersonas])

  const exportSelected = useCallback(async (personaIds: string[], options: ExportOptions) => {
    const allPersonas = PersonaManager.getPersonas()
    const selectedPersonas = allPersonas.filter(p => personaIds.includes(p.id))
    await exportPersonas(selectedPersonas, options)
  }, [exportPersonas])

  const exportFiltered = useCallback(async (personas: Persona[], options: ExportOptions) => {
    await exportPersonas(personas, options)
  }, [exportPersonas])

  const generateTemplate = useCallback((personas: Persona[]): string => {
    if (personas.length === 0) return ''

    const template = `
# Rapport de Personas - ${new Date().toLocaleDateString('fr-FR')}

## Résumé
- Nombre total de personas: ${personas.length}
- Score qualité moyen: ${(personas.reduce((sum, p) => sum + p.qualityScore, 0) / personas.length).toFixed(1)}

## Personas

${personas.map(persona => `
### ${persona.name}
- **Âge**: ${persona.age} ans
- **Profession**: ${persona.occupation}
- **Localisation**: ${persona.location}
- **Score qualité**: ${persona.qualityScore}/100

**Démographie**:
- Revenus: ${persona.demographics.income}
- Éducation: ${persona.demographics.education}
- Situation familiale: ${persona.demographics.familyStatus}

**Points de douleur**:
${persona.painPoints.map(point => `- ${point}`).join('\n')}

**Objectifs**:
${persona.goals.map(goal => `- ${goal}`).join('\n')}

**Insights marketing**:
- Canaux préférés: ${persona.marketingInsights.preferredChannels.join(', ')}
- Ton de message: ${persona.marketingInsights.messagingTone}
- Comportement d'achat: ${persona.marketingInsights.buyingBehavior}

---
`).join('')}
    `.trim()

    return template
  }, [])

  const generateReport = useCallback(async (personas: Persona[]): Promise<string> => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      setExportProgress(25)

      const stats = {
        total: personas.length,
        averageAge: personas.reduce((sum, p) => sum + p.age, 0) / personas.length,
        averageQuality: personas.reduce((sum, p) => sum + p.qualityScore, 0) / personas.length,
        topOccupations: getTopItems(personas.map(p => p.occupation)),
        topLocations: getTopItems(personas.map(p => p.location)),
        commonPainPoints: getTopItems(personas.flatMap(p => p.painPoints)),
        commonGoals: getTopItems(personas.flatMap(p => p.goals))
      }

      setExportProgress(50)

      const report = `
# Rapport d'Analyse des Personas
*Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}*

## Vue d'ensemble
- **Nombre total de personas**: ${stats.total}
- **Âge moyen**: ${stats.averageAge.toFixed(1)} ans
- **Score qualité moyen**: ${stats.averageQuality.toFixed(1)}/100

## Analyse démographique

### Professions les plus représentées
${stats.topOccupations.map(([occ, count]) => `- ${occ}: ${count} persona(s)`).join('\n')}

### Localisations principales
${stats.topLocations.map(([loc, count]) => `- ${loc}: ${count} persona(s)`).join('\n')}

## Analyse comportementale

### Points de douleur récurrents
${stats.commonPainPoints.slice(0, 5).map(([pain, count]) => `- ${pain}: ${count} mention(s)`).join('\n')}

### Objectifs communs
${stats.commonGoals.slice(0, 5).map(([goal, count]) => `- ${goal}: ${count} mention(s)`).join('\n')}

## Détail des personas

${personas.map(persona => `
### ${persona.name}
- **Âge**: ${persona.age} ans | **Profession**: ${persona.occupation} | **Localisation**: ${persona.location}
- **Score qualité**: ${persona.qualityScore}/100
- **Créé le**: ${new Date(persona.createdAt).toLocaleDateString('fr-FR')}

**Profil psychographique**:
- Personnalité: ${persona.psychographics.personality.join(', ')}
- Valeurs: ${persona.psychographics.values.join(', ')}
- Intérêts: ${persona.psychographics.interests.join(', ')}

**Marketing**:
- Canaux: ${persona.marketingInsights.preferredChannels.join(', ')}
- Ton: ${persona.marketingInsights.messagingTone}

---
`).join('')}

*Rapport généré par PersonaCraft*
      `.trim()

      setExportProgress(100)
      return report

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du rapport')
      throw err
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportProgress(0), 1000)
    }
  }, [])

  const validateExportData = useCallback((personas: Persona[]): boolean => {
    if (personas.length === 0) return false
    
    return personas.every(persona => 
      persona.name && 
      persona.age && 
      persona.occupation && 
      persona.location &&
      persona.qualityScore !== undefined
    )
  }, [])

  const getExportPreview = useCallback((personas: Persona[], format: string): string => {
    if (personas.length === 0) return 'Aucun persona à prévisualiser'

    const sample = personas.slice(0, 2) // Prendre les 2 premiers pour l'aperçu

    switch (format) {
      case 'json':
        return JSON.stringify(sample, null, 2)
      
      case 'csv':
        const headers = ['Nom', 'Âge', 'Profession', 'Localisation', 'Score']
        const rows = sample.map(p => [p.name, p.age, p.occupation, p.location, p.qualityScore])
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      
      case 'pdf':
        return generateTemplate(sample)
      
      default:
        return 'Format non supporté'
    }
  }, [generateTemplate])

  return {
    isExporting,
    exportProgress,
    error,
    exportPersona,
    exportPersonas,
    exportAll,
    exportSelected,
    exportFiltered,
    generateTemplate,
    generateReport,
    validateExportData,
    getExportPreview
  }
}

// Fonctions utilitaires
async function generateCSVContent(personas: Persona[], options: ExportOptions): Promise<string> {
  const headers = [
    'Nom', 'Âge', 'Profession', 'Localisation', 'Revenus', 'Éducation',
    'Situation familiale', 'Personnalité', 'Valeurs', 'Intérêts',
    'Style de vie', 'Points de douleur', 'Objectifs', 'Canaux préférés',
    'Ton de message', 'Comportement d\'achat', 'Score qualité'
  ]

  if (options.includeMetadata) {
    headers.push('Date de création', 'ID')
  }

  const rows = personas.map(persona => {
    const row = [
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
      persona.painPoints.join('; '),
      persona.goals.join('; '),
      persona.marketingInsights.preferredChannels.join('; '),
      persona.marketingInsights.messagingTone,
      persona.marketingInsights.buyingBehavior,
      persona.qualityScore.toString()
    ]

    if (options.includeMetadata) {
      row.push(
        new Date(persona.createdAt).toLocaleDateString('fr-FR'),
        persona.id
      )
    }

    return row.map(cell => `"${cell}"`).join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

async function generatePDFContent(personas: Persona[], options: ExportOptions): Promise<string> {
  // Pour l'instant, on retourne du texte formaté
  // Dans une vraie implémentation, on utiliserait une lib comme jsPDF
  let content = `RAPPORT DE PERSONAS\n`
  content += `Généré le ${new Date().toLocaleDateString('fr-FR')}\n\n`
  content += `Nombre total: ${personas.length}\n`
  content += `Score moyen: ${(personas.reduce((sum, p) => sum + p.qualityScore, 0) / personas.length).toFixed(1)}\n\n`

  personas.forEach((persona, index) => {
    content += `${index + 1}. ${persona.name}\n`
    content += `   Âge: ${persona.age} ans\n`
    content += `   Profession: ${persona.occupation}\n`
    content += `   Localisation: ${persona.location}\n`
    content += `   Score: ${persona.qualityScore}/100\n\n`
  })

  return content
}

function getTopItems(items: string[]): [string, number][] {
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
}

export default useExport