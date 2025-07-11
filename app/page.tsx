'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Zap, Download, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Propulsé par l'IA</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
            Créez des personas
            <br />
            <span className="text-gray-900">authentiques et détaillés</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Générez des personas marketing ultra-réalistes en quelques minutes grâce à l'intelligence artificielle 
            et aux données culturelles de Qloo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generator">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white px-8 py-3">
                <Zap className="h-5 w-5 mr-2" />
                Commencer maintenant
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              <Users className="h-5 w-5 mr-2" />
              Voir la démo
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle>IA Avancée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Utilisez la puissance de Google Gemini et Qloo Taste AI pour créer des personas 
                basés sur de vraies données culturelles et comportementales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Profils Complets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Obtenez des personas détaillés avec profils psychographiques, préférences culturelles, 
                et stratégies de communication personnalisées.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Export Facile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Exportez vos personas en PDF ou CSV pour les intégrer facilement dans vos 
                présentations et stratégies marketing.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How it Works */}
        <section className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Comment ça fonctionne</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Décrivez votre projet</h3>
              <p className="text-sm text-gray-600">
                Remplissez un brief simple avec vos objectifs et votre cible
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">IA génère les données</h3>
              <p className="text-sm text-gray-600">
                Nos algorithmes analysent les tendances culturelles et comportementales
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Personas créés</h3>
              <p className="text-sm text-gray-600">
                Recevez des personas détaillés et authentiques en quelques secondes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Utilisez et partagez</h3>
              <p className="text-sm text-gray-600">
                Exportez et intégrez vos personas dans vos projets marketing
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Prêt à créer vos premiers personas ?
          </h2>
          <p className="text-xl text-gray-600">
            Rejoignez des centaines de marketeurs qui utilisent déjà PersonaCraft
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generator">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white px-8 py-3">
                Commencer gratuitement
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Pas de carte de crédit</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Génération instantanée</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Export illimité</span>
            </span>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}