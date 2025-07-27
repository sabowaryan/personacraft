'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section 
      id="hero" 
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen flex items-center -mt-16 pt-16"
      aria-labelledby="hero-title"
    >
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="text-center max-w-6xl mx-auto">
          <div className="mb-12 sm:mb-16">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold text-white/90 mb-8 sm:mb-10 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent font-bold">
                  Alimenté par Google Gemini & Qloo AI
                </span>
              </div>
            </div>

            <h1 
              id="hero-title"
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-8 sm:mb-10 leading-[0.9] tracking-tight"
            >
              Créez des{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  personas marketing
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-indigo-400/30 to-purple-400/30 blur-lg -z-10 animate-pulse"></div>
              </span>{' '}
              avec l'IA
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              Générez des personas détaillés et authentiques en{' '}
              <span className="font-semibold text-white">moins de 60 secondes</span>{' '}
              grâce à l'intelligence artificielle avancée
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 sm:mb-20">
            <Link href="/dashboard" className="group relative overflow-hidden">
              <Button 
                size="lg" 
                className="bg-white text-slate-900 text-xl px-10 py-6 rounded-2xl font-bold transition-all duration-500 hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 min-w-[280px] h-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <svg className="relative w-6 h-6 transition-transform group-hover:scale-125 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="relative">Générer mes personas</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              className="group bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl px-10 py-6 rounded-2xl font-bold transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 min-w-[280px] h-auto"
            >
              <svg className="w-6 h-6 transition-transform group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Voir la démo</span>
            </Button>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 lg:p-10 text-center transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-blue-500/30">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="relative text-2xl lg:text-3xl font-black text-white mb-6">
                Précision IA
              </h3>
              <p className="relative text-white/80 leading-relaxed text-lg">
                Alimenté par Google Gemini pour des personas détaillés et cohérents
              </p>
            </div>

            <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 lg:p-10 text-center transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-400 via-purple-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-purple-500/30">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="relative text-2xl lg:text-3xl font-black text-white mb-6">
                Insights Culturels
              </h3>
              <p className="relative text-white/80 leading-relaxed text-lg">
                Enrichi par Qloo Taste AI™ pour des données culturelles authentiques
              </p>
            </div>

            <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 lg:p-10 text-center transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-pink-500/30">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="relative text-2xl lg:text-3xl font-black text-white mb-6">
                Génération Rapide
              </h3>
              <p className="relative text-white/80 leading-relaxed text-lg">
                De votre brief marketing à vos personas en moins d'une minute
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}