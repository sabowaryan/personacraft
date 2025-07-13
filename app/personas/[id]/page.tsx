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
    // Vérifier s'il y a des personas en mémoire (dans le hook ou localStorage)
    const currentPersonas = personas.length > 0 ? personas : getPersonasFromStorage();
    
    if (currentPersonas.length > 0) {
      // Définir un flag pour indiquer qu'on vient d'une page de détail
      sessionStorage.setItem('personacraft-from-detail', 'true');
      // S'il y a des personas, rediriger vers Generator pour les afficher
      router.push('/generator');
    } else {
      // Sinon, utiliser router.back() comme fallback
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8 sm:p-12 lg:p-16">
                <div className="text-center space-y-6">
                  {/* Animation de chargement moderne */}
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-primary-200 dark:border-primary-700 border-t-primary-600 dark:border-t-primary-400"></div>
                    </div>
                    <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-primary-500/10 dark:bg-primary-400/10 rounded-full animate-ping" />
                  </div>
                  
                  {/* Titre et description */}
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      Chargement du persona
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                      Récupération des données de votre persona depuis la collection...
                    </p>
                  </div>
                  
                  {/* Barre de progression animée */}
                  <div className="w-full max-w-xs mx-auto">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Informations de débogage avec design amélioré */}
                  <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Informations de recherche</h4>
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between items-center">
                        <span>ID recherché:</span>
                        <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">
                          {personaId}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tentative:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{retryCount + 1}</span>
                      </div>
                    </div>
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

  if (error || !persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8 sm:p-12 lg:p-16">
                <div className="text-center space-y-6">
                  {/* Icône d'erreur avec animation */}
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center animate-pulse">
                      <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-red-500/10 dark:bg-red-400/10 rounded-full animate-ping" />
                  </div>
                  
                  {/* Titre principal */}
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      {error || 'Persona non trouvé'}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                      Le persona demandé n'existe pas ou n'est plus disponible dans votre collection.
                    </p>
                  </div>
                  
                  {/* Boutons d'action avec design moderne */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center pt-4">
                    <Button 
                      onClick={handleRetry} 
                      variant="outline"
                      className="w-full sm:w-auto flex items-center gap-2 hover-lift transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-200 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="font-medium">Réessayer</span>
                    </Button>
                    <Button 
                      onClick={handleBack} 
                      variant="outline"
                      className="w-full sm:w-auto flex items-center gap-2 hover-lift transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-secondary-300 dark:hover:border-secondary-600 text-gray-700 dark:text-gray-200 hover:text-secondary-700 dark:hover:text-secondary-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="font-medium">Retour à la liste</span>
                    </Button>
                  </div>
                  
                  {/* Informations de débogage avec design amélioré */}
                  <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Informations de diagnostic</h4>
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between items-center">
                        <span>ID recherché:</span>
                        <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">
                          {personaId}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Personas disponibles:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{personas.length}</span>
                      </div>
                    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="w-full">
        <PersonaDetail persona={persona} onBack={handleBack} />
      </main>
      <Footer />
    </div>
  );
}