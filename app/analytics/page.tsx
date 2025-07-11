'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PersonaInsights } from '@/components/charts/persona-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { usePersonaGeneration } from '@/hooks/use-persona-generation';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { personas } = usePersonaGeneration();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                <span>Analytics des Personas</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Analysez les tendances et insights de vos personas générés
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter rapport
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>

          {personas.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-4">Aucune donnée à analyser</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Commencez par générer des personas pour voir apparaître des insights 
                  détaillés et des analyses comportementales.
                </p>
                <Link href="/generator">
                  <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Générer des personas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <PersonaInsights personas={personas} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}