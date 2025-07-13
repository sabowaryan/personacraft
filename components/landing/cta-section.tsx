'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  CheckCircle, 
  Clock, 
  Star,
  Shield,
  Users,
  TrendingUp,
  Gift
} from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] opacity-60" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/10" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Content */}
        <div className="text-center">
          {/* Urgency Badge */}
          <Badge className="mb-4 sm:mb-6 bg-white/20 text-white border-white/30">
            <Gift className="h-4 w-4 mr-2" />
            Offre de lancement - 50% de réduction
          </Badge>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight">
            Transformez votre marketing
            <br />
            <span className="text-white/90">dès aujourd'hui</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
            Rejoignez plus de 2,500 marketeurs qui utilisent PersonaCraft pour créer 
            des personas ultra-précis et booster leurs campagnes.
          </p>

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
            <Link href="/generator">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <Zap className="h-5 w-5 sm:h-7 sm:w-7 mr-2 sm:mr-4" />
                Créer mon premier persona
                <ArrowRight className="h-5 w-5 sm:h-7 sm:w-7 ml-2 sm:ml-4" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold border-white/30 text-white hover:bg-white/10 backdrop-blur-md transition-all duration-300 w-full sm:w-auto"
            >
              <Clock className="h-5 w-5 sm:h-7 sm:w-7 mr-2 sm:mr-4" />
              Voir la démo (2 min)
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Garantie 30 jours</h3>
              <p className="text-white/80 text-xs sm:text-sm text-center">Remboursement complet si non satisfait</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Sécurité SOC2</h3>
              <p className="text-white/80 text-xs sm:text-sm text-center">Vos données sont protégées</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Support expert</h3>
              <p className="text-white/80 text-xs sm:text-sm text-center">Équipe dédiée 24/7</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Résultats prouvés</h3>
              <p className="text-white/80 text-xs sm:text-sm text-center">+47% de conversion moyenne</p>
            </div>
          </div>

          {/* Final Trust Elements */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>
              <span className="ml-2">4.9/5 (2,847 avis)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Aucune carte de crédit requise</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Configuration en 30 secondes</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 sm:mt-16 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Prêt à révolutionner votre approche marketing ?
            </h3>
            <p className="text-white/90 text-base sm:text-lg mb-4 sm:mb-6">
              Plus de 50,000 personas créés • Utilisé dans 50+ pays • Approuvé par les experts
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/generator">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
                >
                  Commencer maintenant - C'est gratuit
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold border-white/30 text-white hover:bg-white/10 backdrop-blur-md w-full sm:w-auto"
              >
                Parler à un expert
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 