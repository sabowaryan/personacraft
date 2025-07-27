import { useState, useCallback, useEffect } from 'react'
import { Persona, PersonaFilters, SortOptions } from '@/types'
import { validateAndCleanPersona } from '@/lib/persona-utils'

interface UsePersonaReturn {
    personas: Persona[]
    selectedPersona: Persona | null
    isLoading: boolean
    error: string | null
    // Actions
    loadPersonas: () => Promise<void>
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

export function usePersonaDB(): UsePersonaReturn {
    const [personas, setPersonas] = useState<Persona[]>([])
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<PersonaFilters>({})
    const [sortOptions, setSortOptions] = useState<SortOptions>({
        field: 'createdAt',
        direction: 'desc'
    })

    // Charger les personas au montage
    useEffect(() => {
        loadPersonas()
    }, [])

    const loadPersonas = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/personas')
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des personas')
            }
            
            const loadedPersonas = await response.json()
            setPersonas(loadedPersonas)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const addPersona = useCallback(async (persona: Persona) => {
        setIsLoading(true)
        setError(null)

        try {
            const cleanedPersona = validateAndCleanPersona(persona)
            
            const response = await fetch('/api/personas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedPersona)
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la création du persona')
            }

            const newPersona = await response.json()
            setPersonas(prev => [newPersona, ...prev])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout')
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updatePersona = useCallback(async (id: string, updates: Partial<Persona>) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/personas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du persona')
            }

            const updatedPersona = await response.json()
            setPersonas(prev => prev.map(p =>
                p.id === id ? updatedPersona : p
            ))

            // Mettre à jour le persona sélectionné si c'est celui-ci
            if (selectedPersona?.id === id) {
                setSelectedPersona(updatedPersona)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [selectedPersona])

    const deletePersona = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/personas/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du persona')
            }

            setPersonas(prev => prev.filter(p => p.id !== id))

            // Désélectionner si c'est le persona sélectionné
            if (selectedPersona?.id === id) {
                setSelectedPersona(null)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [selectedPersona])

    const selectPersona = useCallback((persona: Persona | null) => {
        setSelectedPersona(persona)
    }, [])

    // Filtrage et tri des personas
    const filteredPersonas = useCallback(() => {
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
    }, [personas, filters, sortOptions])()

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
        isLoading,
        error,
        loadPersonas,
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

export default usePersonaDB