'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Play, Users, Zap, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-18">
      {/* Background Pattern - Maintenant visible derrière le header */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] opacity-60" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-xl">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
          </div>
          <span className="hidden sm:inline">Utilisé par 2,500+ marketeurs</span>
          <span className="sm:hidden">2,500+ marketeurs</span>
          <Badge variant="secondary" className="bg-primary-500 text-white text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Avancée
          </Badge>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-6 sm:mb-8 leading-none">
          <span className="block gradient-text">Créez des personas</span>
          <span className="block text-gray-900 dark:text-white">ultra-réalistes</span>
          <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-700 dark:text-gray-300 mt-2">
            en 60 secondes
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
          Propulsé par <strong className="text-primary-600">Google Gemini</strong> et <strong className="text-secondary-600">Qloo Taste AI</strong>, 
          PersonaCraft transforme vos briefs marketing en personas détaillés avec 
          <strong className="text-accent-600"> données culturelles authentiques</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
          <Link href="/generator">
            <Button 
              size="lg" 
              className="button-gradient text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              Générer un persona maintenant
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3" />
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white/10 backdrop-blur-md border-white/30 hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
          >
            <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
            Voir la démo (2 min)
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            <span>Génération instantanée</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            <span>Export PDF/CSV inclus</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            <span>Données culturelles réelles</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            <span>Essai gratuit</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600">2,500+</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Marketeurs actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-600">50k+</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Personas générés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-600">60s</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Temps moyen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600">98%</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
} 