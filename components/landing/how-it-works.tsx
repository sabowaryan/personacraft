'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Brain, 
  Users, 
  Download, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Brief Marketing",
    description: "Décrivez votre projet en quelques phrases",
    details: [
      "Objectifs marketing clairs",
      "Cible démographique",
      "Secteur d'activité",
      "Contraintes spécifiques"
    ],
    color: "from-blue-500 to-cyan-500",
    time: "30 secondes"
  },
  {
    number: "02",
    icon: Brain,
    title: "Analyse IA",
    description: "Notre IA traite vos données avec Gemini & Qloo",
    details: [
      "Analyse comportementale",
      "Données culturelles",
      "Tendances actuelles",
      "Psychographie avancée"
    ],
    color: "from-purple-500 to-pink-500",
    time: "15 secondes"
  },
  {
    number: "03",
    icon: Users,
    title: "Génération Persona",
    description: "Création de profils détaillés et authentiques",
    details: [
      "Profil psychographique",
      "Préférences culturelles",
      "Stratégies marketing",
      "Points de contact"
    ],
    color: "from-green-500 to-teal-500",
    time: "10 secondes"
  },
  {
    number: "04",
    icon: Download,
    title: "Export & Utilisation",
    description: "Téléchargez et intégrez dans vos outils",
    details: [
      "Export PDF/CSV",
      "Templates marketing",
      "Intégration CRM",
      "Partage équipe"
    ],
    color: "from-orange-500 to-red-500",
    time: "5 secondes"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <Badge variant="secondary" className="mb-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <Sparkles className="h-4 w-4 mr-2" />
            Processus simple
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            De l'idée au persona en 60 secondes
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Notre processus révolutionnaire transforme votre brief marketing en personas 
            détaillés grâce à l'IA et aux données culturelles en temps réel.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative mb-12 sm:mb-16 md:mb-20">
          {/* Connection Line - Hidden on mobile and tablet */}
          <div className="hidden xl:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transform -translate-y-1/2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <Card 
                key={index} 
                className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              >
                {/* Step Number */}
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold text-sm sm:text-lg">{step.number}</span>
                  </div>
                </div>

                <CardContent className="pt-12 sm:pt-16 pb-6 sm:pb-8 p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <step.icon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600 dark:text-gray-400 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                      {step.description}
                    </p>
                  </div>

                  {/* Details */}
                  <ul className="space-y-2 mb-4 sm:mb-6">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Time */}
                  <div className="flex items-center justify-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary-500 mr-2" />
                    <span className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400">
                      {step.time}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Results Preview */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Résultats instantanés
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Voici ce que vous obtenez avec chaque persona généré
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mb-3 sm:mb-4" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                Profil Complet
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Démographie, psychographie, comportements, valeurs et motivations détaillées
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-500 mb-3 sm:mb-4" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                Insights Culturels
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Préférences musicales, films, marques basées sur des données Qloo réelles
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent-500 mb-3 sm:mb-4" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                Stratégies Marketing
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Canaux optimisés, messages-clés et tactiques d'influence personnalisées
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/generator">
            <Button 
              size="lg" 
              className="button-gradient text-white px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span>Tester maintenant gratuitement</span>
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
            Aucune carte de crédit requise • Résultats instantanés
          </p>
        </div>
      </div>
    </section>
  );
} 