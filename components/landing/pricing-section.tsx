'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown, 
  Building, 
  Users,
  Download,
  BarChart3,
  Shield,
  Headphones
} from 'lucide-react';

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "Gratuit",
    description: "Parfait pour découvrir PersonaCraft",
    icon: Users,
    popular: false,
    features: [
      { text: "3 personas par mois", included: true },
      { text: "Export PDF basique", included: true },
      { text: "Profils psychographiques", included: true },
      { text: "Données culturelles Qloo", included: true },
      { text: "Support communautaire", included: true },
      { text: "Export CSV", included: false },
      { text: "Analytics avancés", included: false },
      { text: "Support prioritaire", included: false }
    ],
    cta: "Commencer gratuitement",
    color: "border-gray-200 dark:border-gray-700"
  },
  {
    name: "Professional",
    price: "29",
    period: "par mois",
    description: "Pour les marketeurs et agences",
    icon: Zap,
    popular: true,
    features: [
      { text: "50 personas par mois", included: true },
      { text: "Export PDF premium", included: true },
      { text: "Export CSV illimité", included: true },
      { text: "Analytics et métriques", included: true },
      { text: "Templates personnalisés", included: true },
      { text: "Intégration API", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Historique illimité", included: true }
    ],
    cta: "Essayer 14 jours gratuit",
    color: "border-primary-500 dark:border-primary-400"
  },
  {
    name: "Enterprise",
    price: "99",
    period: "par mois",
    description: "Pour les grandes équipes",
    icon: Crown,
    popular: false,
    features: [
      { text: "Personas illimités", included: true },
      { text: "White-label disponible", included: true },
      { text: "Intégration CRM avancée", included: true },
      { text: "Analytics personnalisés", included: true },
      { text: "Support dédié", included: true },
      { text: "Formation équipe", included: true },
      { text: "SLA garanti", included: true },
      { text: "Sécurité entreprise", included: true }
    ],
    cta: "Contacter l'équipe",
    color: "border-secondary-500 dark:border-secondary-400"
  }
];

const addons = [
  {
    icon: Building,
    name: "White-label",
    price: "199/mois",
    description: "Personnalisez l'interface avec votre marque"
  },
  {
    icon: BarChart3,
    name: "Analytics Pro",
    price: "49/mois",
    description: "Métriques avancées et insights détaillés"
  },
  {
    icon: Shield,
    name: "Sécurité+",
    price: "99/mois",
    description: "Conformité SOC2 et audit de sécurité"
  },
  {
    icon: Headphones,
    name: "Support Premium",
    price: "299/mois",
    description: "Support dédié et formation personnalisée"
  }
];

export function PricingSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-4 w-4 mr-2" />
            Tarifs transparents
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Choisissez votre plan
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Commencez gratuitement et évoluez selon vos besoins. Tous les plans incluent 
            l'accès aux données culturelles Qloo et à l'IA Gemini.
          </p>
        </div>

        {/* Main Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`group relative border-2 ${plan.color} shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary-500 text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Plus populaire
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <plan.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {plan.period}
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                  {plan.description}
                </p>
                
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price === "0" ? "Gratuit" : `€${plan.price}`}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs sm:text-sm lg:text-base">
                        /mois
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 dark:text-gray-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs sm:text-sm ${
                        feature.included 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="pt-4 sm:pt-6">
                  <Button 
                    className={`w-full text-xs sm:text-sm lg:text-base py-2 sm:py-3 ${
                      plan.popular 
                        ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add-ons */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              Modules complémentaires
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm lg:text-base">
              Enrichissez votre expérience avec nos modules spécialisés
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {addons.map((addon, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <addon.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary-500" />
                  <Badge variant="outline" className="text-xs">
                    {addon.price}
                  </Badge>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                  {addon.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {addon.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 sm:mt-12 lg:mt-16 text-center">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8">
            Questions fréquentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                Puis-je changer de plan à tout moment ?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                Y a-t-il des frais de configuration ?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Aucun frais de configuration. Commencez à utiliser PersonaCraft 
                immédiatement après votre inscription.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                Comment fonctionne l'essai gratuit ?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                14 jours d'essai gratuit sur tous les plans payants. 
                Aucune carte de crédit requise pour commencer.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                Puis-je annuler à tout moment ?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Oui, pas d'engagement. Vous pouvez annuler votre abonnement 
                à tout moment depuis votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 