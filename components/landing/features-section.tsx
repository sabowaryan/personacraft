'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Users, 
  Download, 
  Sparkles, 
  Target, 
  BarChart3,
  Palette,
  Globe,
  Clock,
  Shield,
  Zap,
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Brain,
    title: "IA Générativa Avancée",
    description: "Alimenté par Google Gemini et Qloo Taste AI pour des personas basés sur de vraies données comportementales et culturelles.",
    badge: "IA",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Users,
    title: "Profils Psychographiques",
    description: "Personas détaillés avec motivations, valeurs, influences sociales et patterns comportementaux authentiques.",
    badge: "Psycho",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Globe,
    title: "Données Culturelles Réelles",
    description: "Intégration Qloo pour des préférences musicales, cinématographiques et lifestyle basées sur des tendances actuelles.",
    badge: "Cultural",
    color: "from-green-500 to-teal-500"
  },
  {
    icon: Target,
    title: "Stratégies Marketing",
    description: "Canaux de communication optimisés, points de douleur identifiés et stratégies d'influence personnalisées.",
    badge: "Marketing",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: BarChart3,
    title: "Analytics Intégrés",
    description: "Métriques de performance, scores de qualité et insights d'optimisation pour chaque persona généré.",
    badge: "Analytics",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Download,
    title: "Export Multi-Format",
    description: "Téléchargement PDF haute qualité, CSV pour intégration CRM et JSON pour développeurs.",
    badge: "Export",
    color: "from-pink-500 to-rose-500"
  }
];

const benefits = [
  {
    icon: Clock,
    title: "Gain de temps 10x",
    description: "De 2 semaines à 2 minutes"
  },
  {
    icon: Shield,
    title: "Précision garantie",
    description: "Basé sur des données réelles"
  },
  {
    icon: Zap,
    title: "Performance optimisée",
    description: "Conversion +35% en moyenne"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <Badge variant="secondary" className="mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
            Fonctionnalités avancées
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Bien plus qu'un générateur de personas
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            PersonaCraft combine l'intelligence artificielle de pointe avec des données culturelles 
            authentiques pour créer des personas qui transforment vos campagnes marketing.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
            >
              <CardHeader className="pb-4 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-sm" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Bar */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-primary-600 dark:to-secondary-600 rounded-2xl p-6 sm:p-8 text-white mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <benefit.icon className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-white/80">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Prêt à révolutionner votre approche marketing ?
          </h3>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de marketeurs qui utilisent PersonaCraft pour créer des campagnes plus efficaces.
          </p>
          <Link href="/generator">
            <Button className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-primary-600 dark:to-secondary-600 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base">
              <span>Commencer l'essai gratuit</span>
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 