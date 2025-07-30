'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-md border border-blue-200/60 rounded-full text-sm font-semibold text-blue-900 mb-8 shadow-lg shadow-blue-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                <span>Démonstration en direct</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
              Découvrez Personacraft
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                en action
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Regardez comment créer des personas marketing authentiques en moins d'une minute 
              grâce à l'intelligence artificielle de Google Gemini et aux données culturelles de Qloo
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Video Container */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-blue-500/20 overflow-hidden border border-blue-200/30">
              <div className="aspect-video relative">
                {/* YouTube Video Embed */}
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=example&autoplay=0&rel=0&modestbranding=1"
                  title="Démonstration Personacraft - Créer des personas marketing avec l'IA"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
                
                {/* Overlay pour le loading */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <p className="text-lg font-semibold">Cliquez pour lire la vidéo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-12 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">
                Ce que vous allez voir dans cette démonstration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Saisie du brief</h3>
                  <p className="text-slate-600 text-sm">Comment décrire votre projet marketing pour obtenir les meilleurs résultats</p>
                </div>

                <div className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Génération IA</h3>
                  <p className="text-slate-600 text-sm">Le processus de création automatique avec Gemini et l'enrichissement Qloo</p>
                </div>

                <div className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Export et utilisation</h3>
                  <p className="text-slate-600 text-sm">Comment exporter vos personas et les intégrer dans vos campagnes marketing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="relative py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">
              Pourquoi choisir Personacraft ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Rapidité inégalée</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Créez des personas détaillés en moins de 60 secondes, contre plusieurs semaines avec les méthodes traditionnelles
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Données authentiques</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Enrichissement avec les données culturelles réelles de Qloo pour des personas crédibles et exploitables
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-indigo-200/60 rounded-2xl p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Personnalisation avancée</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Ajustez et affinez vos personas selon vos besoins spécifiques avec notre interface intuitive
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-green-200/60 rounded-2xl p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Export multi-format</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Exportez vos personas en JSON, CSV ou PDF pour une intégration facile dans tous vos outils marketing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-6">
            Prêt à créer vos premiers personas ?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Rejoignez des centaines de marketeurs qui utilisent déjà Personacraft 
            pour créer des campagnes plus efficaces
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-white text-blue-900 text-xl px-10 py-6 rounded-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 min-w-[280px]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Commencer maintenant
              </Button>
            </Link>
            
            <Link href="/pricing">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl px-10 py-6 rounded-2xl font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 min-w-[280px]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}