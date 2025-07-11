'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PersonaDetail } from '@/components/personas/persona-detail';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { usePersonaGeneration } from '@/hooks/use-persona-generation';

export default function PersonaPage() {
  const params = useParams();
  const router = useRouter();
  const { personas } = usePersonaGeneration();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const personaId = params.id as string;

  useEffect(() => {
    if (!personaId) {
      setError('ID du persona manquant');
      setLoading(false);
      return;
    }

    // Recherche du persona dans le state local
    const foundPersona = personas.find(p => p.id === personaId);
    
    if (foundPersona) {
      setPersona(foundPersona);
      setLoading(false);
    } else {
      // En production, faire un appel API pour récupérer le persona
      // Pour la démo, simuler un chargement puis une erreur
      setTimeout(() => {
        setError('Persona non trouvé');
        setLoading(false);
      }, 1000);
    }
  }, [personaId, personas]);

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
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
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