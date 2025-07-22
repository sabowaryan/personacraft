'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PersonaResult } from '@/components/persona-result';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { usePersonaGeneration } from '@/hooks/use-persona-generation';

export default function EnhancedPersonaPage() {
  const params = useParams();
  const router = useRouter();
  const { personas } = usePersonaGeneration();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const personaId = params.id as string;

  // Function to get personas from storage
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
      console.error('Error reading from localStorage:', error);
      return [];
    }
  };

  // Function to find persona
  const findPersona = (personaId: string) => {
    // 1. Search in local state (personas from hook)
    const foundInState = personas.find(p => p.id === personaId);
    if (foundInState) return foundInState;

    // 2. Search in localStorage
    const storedPersonas = getPersonasFromStorage();
    const foundInStorage = storedPersonas.find((p: any) => p.id === personaId);
    if (foundInStorage) return foundInStorage;

    // 3. Search in sessionStorage (for recently generated personas)
    try {
      const sessionPersonas = sessionStorage.getItem('personacraft-session-personas');
      if (sessionPersonas) {
        const parsedSessionPersonas = JSON.parse(sessionPersonas);
        const foundInSession = parsedSessionPersonas.find((p: any) => p.id === personaId);
        if (foundInSession) return foundInSession;
      }
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
    }

    return null;
  };

  useEffect(() => {
    if (!personaId) {
      setError('Missing persona ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Immediate search
    const foundPersona = findPersona(personaId);
    
    if (foundPersona) {
      setPersona(foundPersona);
      setLoading(false);
    } else {
      // If not found immediately, wait a bit and retry
      const timer = setTimeout(() => {
        const retryPersona = findPersona(personaId);
        if (retryPersona) {
          setPersona(retryPersona);
          setLoading(false);
        } else {
          setError('Persona not found');
          setLoading(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [personaId, personas, retryCount]);

  // Function to force reload
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
  };

  const handleBack = () => {
    // Check if there are personas in memory (in hook or localStorage)
    const currentPersonas = personas.length > 0 ? personas : getPersonasFromStorage();
    
    if (currentPersonas.length > 0) {
      // Set a flag to indicate we're coming from a detail page
      sessionStorage.setItem('personacraft-from-detail', 'true');
      // If there are personas, redirect to Generator to display them
      router.push('/generator');
    } else {
      // Otherwise, use router.back() as fallback
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
                  {/* Modern loading animation */}
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-primary-200 dark:border-primary-700 border-t-primary-600 dark:border-t-primary-400"></div>
                    </div>
                    <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-primary-500/10 dark:bg-primary-400/10 rounded-full animate-ping" />
                  </div>
                  
                  {/* Title and description */}
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      Loading Enhanced Persona
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                      Retrieving your persona data from the collection...
                    </p>
                  </div>
                  
                  {/* Animated progress bar */}
                  <div className="w-full max-w-xs mx-auto">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
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
                  {/* Error icon with animation */}
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center animate-pulse">
                      <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-red-500/10 dark:bg-red-400/10 rounded-full animate-ping" />
                  </div>
                  
                  {/* Main title */}
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      {error || 'Persona not found'}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                      The requested persona does not exist or is no longer available in your collection.
                    </p>
                  </div>
                  
                  {/* Action buttons with modern design */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center pt-4">
                    <Button 
                      onClick={handleRetry} 
                      variant="outline"
                      className="w-full sm:w-auto flex items-center gap-2 hover-lift transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="font-medium">Retry</span>
                    </Button>
                    <Button 
                      onClick={handleBack} 
                      variant="outline"
                      className="w-full sm:w-auto flex items-center gap-2 hover-lift transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="font-medium">Back to List</span>
                    </Button>
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
      <main className="w-full pt-20 sm:pt-24 lg:pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PersonaResult 
            persona={persona} 
            onBack={handleBack}
            isLoading={false}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}