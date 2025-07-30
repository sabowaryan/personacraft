import { useState, useCallback, useMemo } from 'react'
import { Persona, PersonaFilters, SortOptions } from '@/types'
import { usePersonaContext } from '@/contexts/PersonaContext'

interface UsePersonaReturn {
    personas: Persona[]
    selectedPersona: Persona | null
    isLoading: boolean
    loading: boolean
    error: string | null
    // Actions
    loadPersonas: () => Promise<void>
    refreshPersonas: () => Promise<void>
    addPersona: (persona: Persona) => Promise<void>
    updatePersona: (id: string, updates: Partial<Persona>) => Promise<void>
    deletePersona: (id: string) => Promise<void>
    selectPersona: (persona: Persona | null) => void
    // Filtres et tri
    filteredPersonas: Persona[]
    setFilters: (filters: PersonaFilters) => void
    setSortOptions: (sort: SortOptions) => void
    clearFilters: () => void
    // Recherche
    searchPersonas: (query: string) => Persona[]
    // Stats
    getStats: () => {
        total: number
        averageQuality: number
        byOccupation: Record<string, number>
        byLocation: Record<string, number>
    }
}

export function usePersona(): UsePersonaReturn {
    // Utiliser le contexte pour les données de base
    const { personas, loading, error, refreshPersonas, addPersona: contextAddPersona, updatePersona: contextUpdatePersona, deletePersona: contextDeletePersona } = usePersonaContext()
    
    // État local pour les fonctionnalités de filtrage et sélection
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
    const [filters, setFilters] = useState<PersonaFilters>({})
    const [sortOptions, setSortOptions] = useState<SortOptions>({
        field: 'createdAt',
        direction: 'desc'
    })

    const selectPersona = useCallback((persona: Persona | null) => {
        setSelectedPersona(persona)
    }, [])

    const addPersona = useCallback(async (persona: Persona) => {
        await contextAddPersona(persona)
    }, [contextAddPersona])

    const updatePersona = useCallback(async (id: string, updates: Partial<Persona>) => {
        await contextUpdatePersona(id, updates)
        // Mettre à jour le persona sélectionné si c'est celui-ci
        if (selectedPersona?.id === id) {
            setSelectedPersona(prev => prev ? { ...prev, ...updates } : null)
        }
    }, [contextUpdatePersona, selectedPersona])

    const deletePersona = useCallback(async (id: string) => {
        await contextDeletePersona(id)
        // Désélectionner si c'est le persona sélectionné
        if (selectedPersona?.id === id) {
            setSelectedPersona(null)
        }
    }, [contextDeletePersona, selectedPersona])

    // Filtrage et tri des personas
    const filteredPersonas = useMemo(() => {
        if (!Array.isArray(personas)) {
            return []
        }

        let filtered = [...personas]

        // Appliquer les filtres
        if (filters.ageRange) {
            const [min, max] = filters.ageRange
            filtered = filtered.filter(p => p.age >= min && p.age <= max)
        }

        if (filters.occupation && filters.occupation.length > 0) {
            filtered = filtered.filter(p =>
                filters.occupation!.some(occ =>
                    p.occupation.toLowerCase().includes(occ.toLowerCase())
                )
            )
        }

        if (filters.location && filters.location.length > 0) {
            filtered = filtered.filter(p =>
                filters.location!.some(loc =>
                    p.location.toLowerCase().includes(loc.toLowerCase())
                )
            )
        }

        if (filters.qualityScore) {
            const [min, max] = filters.qualityScore
            filtered = filtered.filter(p => p.qualityScore >= min && p.qualityScore <= max)
        }

        if (filters.dateRange) {
            const [startDate, endDate] = filters.dateRange
            filtered = filtered.filter(p => {
                const personaDate = new Date(p.createdAt)
                return personaDate >= new Date(startDate) && personaDate <= new Date(endDate)
            })
        }

        // Appliquer le tri
        filtered.sort((a, b) => {
            const aValue = a[sortOptions.field as keyof Persona]
            const bValue = b[sortOptions.field as keyof Persona]

            let comparison = 0
            if (aValue && bValue) {
                if (aValue < bValue) comparison = -1
                if (aValue > bValue) comparison = 1
            }

            return sortOptions.direction === 'desc' ? -comparison : comparison
        })

        return filtered
    }, [personas, filters, sortOptions])

    const searchPersonas = useCallback((query: string): Persona[] => {
        if (!query.trim()) return personas

        const searchTerm = query.toLowerCase()
        return personas.filter(persona =>
            persona.name.toLowerCase().includes(searchTerm) ||
            persona.occupation.toLowerCase().includes(searchTerm) ||
            persona.location.toLowerCase().includes(searchTerm) ||
            persona.psychographics.interests.some(interest =>
                interest.toLowerCase().includes(searchTerm)
            ) ||
            persona.painPoints.some(pain =>
                pain.toLowerCase().includes(searchTerm)
            ) ||
            persona.goals.some(goal =>
                goal.toLowerCase().includes(searchTerm)
            )
        )
    }, [personas])

    const clearFilters = useCallback(() => {
        setFilters({})
    }, [])

    const getStats = useCallback(() => {
        const total = personas.length
        const averageQuality = personas.length > 0
            ? personas.reduce((sum, p) => sum + p.qualityScore, 0) / personas.length
            : 0

        const byOccupation = personas.reduce((acc, p) => {
            acc[p.occupation] = (acc[p.occupation] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const byLocation = personas.reduce((acc, p) => {
            acc[p.location] = (acc[p.location] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return {
            total,
            averageQuality: Math.round(averageQuality * 100) / 100,
            byOccupation,
            byLocation
        }
    }, [personas])

    return {
        personas,
        selectedPersona,
        isLoading: loading, // Alias for compatibility
        loading,
        error,
        loadPersonas: refreshPersonas, // Alias for compatibility
        refreshPersonas,
        addPersona,
        updatePersona,
        deletePersona,
        selectPersona,
        filteredPersonas,
        setFilters,
        setSortOptions,
        clearFilters,
        searchPersonas,
        getStats
    }
}

export default usePersona