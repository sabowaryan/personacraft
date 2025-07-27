'use client';

import { Users, Target, Download, Sparkles, BarChart3, Globe } from 'lucide-react';

const benefits = [
  {
    icon: Target,
    title: "Personas personnalisés",
    description: "Créez des personas adaptés à votre secteur et vos besoins spécifiques"
  },
  {
    icon: Globe,
    title: "Insights culturels",
    description: "Obtenez des analyses comportementales et culturelles approfondies"
  },
  {
    icon: Download,
    title: "Export multi-format",
    description: "Exportez vos personas en PDF, JSON ou intégrez-les directement"
  },
  {
    icon: BarChart3,
    title: "Analytics avancés",
    description: "Suivez les performances et l'utilisation de vos personas"
  },
  {
    icon: Users,
    title: "Collaboration équipe",
    description: "Partagez et collaborez sur vos personas avec votre équipe"
  },
  {
    icon: Sparkles,
    title: "IA générative",
    description: "Générez du contenu et des insights avec l'intelligence artificielle"
  }
];

export default function OnboardingBenefits() {
  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Pourquoi choisir PersonaCraft ?
        </h3>
        <p className="text-gray-600">
          Découvrez tout ce que vous pourrez accomplir avec notre plateforme
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div 
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h4>
              <p className="text-sm text-gray-600">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}