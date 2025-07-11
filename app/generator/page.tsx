'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BriefForm } from '@/components/forms/brief-form';
import { PersonaList } from '@/components/personas/persona-list';
import { usePersonaGeneration } from '@/hooks/use-persona-generation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function GeneratorPage() {
  const { personas, isGenerating, error, generatePersonas, clearPersonas } = usePersonaGeneration();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Générateur de Personas</h1>
            <p className="text-gray-600">
              Créez des personas marketing détaillés et authentiques en quelques minutes
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {personas.length === 0 ? (
            <BriefForm onSubmit={generatePersonas} isGenerating={isGenerating} />
          ) : (
            <PersonaList personas={personas} onClear={clearPersonas} />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}