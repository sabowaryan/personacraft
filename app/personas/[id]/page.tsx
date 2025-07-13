'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PersonaDetail } from '@/components/personas/persona-detail';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { usePersonaGeneration } from '@/hooks/use-persona-generation';

export default function PersonaPage() {
  const params = useParams();
  const router = useRouter();
  const { personas } = usePersonaGeneration();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const personaId = params.id as string;

  // Fonction pour récupérer les personas depuis localStorage
  const getPersonasFromStorage = () => {
    try {
      if (typeof window === 'undefined') return [];
      
      const storedPersonas = localStorage.getItem('personacraft-personas');
      if (!storedPersonas) return [];
      
      const parsedPersonas = JSON.parse(storedPersonas);
      return parsedPersonas.map((p: any) => ({
        ...p,
        generatedAt: new Date(p.generatedAt)
      }));
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage:', error);
      return [];
    }
  };

  // Fonction pour rechercher le persona
  const findPersona = (personaId: string) => {
    // 1. Chercher dans le state local (personas du hook)
    const foundInState = personas.find(p => p.id === personaId);
    if (foundInState) return foundInState;

    // 2. Chercher dans localStorage
    const storedPersonas = getPersonasFromStorage();
    const foundInStorage = storedPersonas.find((p: any) => p.id === personaId);
    if (foundInStorage) return foundInStorage;

    // 3. Chercher dans sessionStorage (pour les personas récemment générés)
    try {
      const sessionPersonas = sessionStorage.getItem('personacraft-session-personas');
      if (sessionPersonas) {
        const parsedSessionPersonas = JSON.parse(sessionPersonas);
        const foundInSession = parsedSessionPersonas.find((p: any) => p.id === personaId);
        if (foundInSession) return foundInSession;
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du sessionStorage:', error);
    }

    return null;
  };

  useEffect(() => {
    if (!personaId) {
      setError('ID du persona manquant');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Recherche immédiate
    const foundPersona = findPersona(personaId);
    
    if (foundPersona) {
      setPersona(foundPersona);
      setLoading(false);
    } else {
      // Si pas trouvé immédiatement, attendre un peu et réessayer
      const timer = setTimeout(() => {
        const retryPersona = findPersona(personaId);
        if (retryPersona) {
          setPersona(retryPersona);
          setLoading(false);
        } else {
          setError('Persona non trouvé');
          setLoading(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [personaId, personas, retryCount]);

  // Fonction pour forcer le rechargement
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600">Chargement du persona...</p>
                  <p className="text-sm text-gray-500">ID: {personaId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {error || 'Persona non trouvé'}
                  </h2>
                  <p className="text-gray-600">
                    Le persona demandé n'existe pas ou n'est plus disponible.
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    <Button onClick={handleRetry} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                    <Button onClick={handleBack} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-4">
                    <p>ID recherché: {personaId}</p>
                    <p>Personas disponibles: {personas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PersonaDetail persona={persona} onBack={handleBack} />
      </main>
      <Footer />
    </div>
  );
}