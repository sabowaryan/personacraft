'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Persona } from '@/lib/types/persona';
import { PersonaResult } from '@/components/persona-result/persona-result';
import { MobilePersonaResult } from '@/components/persona-result/responsive/mobile-persona-result';
import { useBreakpoints } from '@/hooks/use-media-query';
import { ModernLoading, ModernNotification } from '@/components/ui/modern-elements';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function PersonaResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personaCount, setPersonaCount] = useState(0);
  const { isMobileOrTablet } = useBreakpoints();

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer l'ID du persona depuis les paramètres
        const resolvedParams = await params;
        const personaId = resolvedParams.id;

        // Essayer de récupérer le persona depuis le state local (si disponible)
        let foundPersona = null;

        // Essayer de récupérer depuis localStorage
        const storedPersonas = localStorage.getItem('personas');
        if (storedPersonas) {
          const parsedPersonas = JSON.parse(storedPersonas);
          setPersonaCount(parsedPersonas.length);
          foundPersona = parsedPersonas.find((p: Persona) => p.id === personaId);
        }

        // Essayer de récupérer depuis sessionStorage si non trouvé
        if (!foundPersona) {
          const sessionPersonas = sessionStorage.getItem('personas');
          if (sessionPersonas) {
            const parsedSessionPersonas = JSON.parse(sessionPersonas);
            if (!personaCount) setPersonaCount(parsedSessionPersonas.length);
            foundPersona = parsedSessionPersonas.find((p: Persona) => p.id === personaId);
          }
        }

        if (foundPersona) {
          setPersona(foundPersona);
        } else {
          setError(`Persona avec l'ID ${personaId} non trouvé`);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du persona:', err);
        setError('Une erreur est survenue lors de la récupération du persona');
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [params]);

  const handleBack = () => {
    router.back();
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    // Réessayer de charger le persona
    setTimeout(async () => {
      const resolvedParams = await params;
      const personaId = resolvedParams.id;
      const storedPersonas = localStorage.getItem('personas');
      if (storedPersonas) {
        const parsedPersonas = JSON.parse(storedPersonas);
        const foundPersona = parsedPersonas.find((p: Persona) => p.id === personaId);
        if (foundPersona) {
          setPersona(foundPersona);
          setLoading(false);
        } else {
          setError(`Persona avec l'ID ${personaId} non trouvé`);
          setLoading(false);
        }
      } else {
        setError('Aucun persona trouvé dans le stockage local');
        setLoading(false);
      }
    }, 1000);
  };

  const handleGoToList = () => {
    router.push('/personas');
  };

  const handleGoToGenerator = () => {
    router.push('/generator');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <ModernLoading size="lg" text="Chargement du persona..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 max-w-md mx-auto">
        <ModernNotification
          title="Persona non trouvé"
          message={error}
          type="error"
          action={{
            label: "Réessayer",
            onClick: handleRetry
          }}
        />

        <div className="flex flex-col gap-4 mt-8 w-full">
          <Button onClick={handleBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <Button onClick={handleGoToList} variant="outline" className="w-full">
            Voir tous les personas ({personaCount})
          </Button>

          <Button onClick={handleGoToGenerator} className="w-full">
            Créer un nouveau persona
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">Informations de débogage:</p>
          <p>Personas disponibles: {personaCount}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      {persona && (
        <>
          {isMobileOrTablet ? (
            <MobilePersonaResult
              persona={persona}
              onBack={handleBack}
            />
          ) : (
            <div className="py-6">
              <PersonaResult
                persona={persona}
                onBack={handleBack}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}