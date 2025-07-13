'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Clock,
  Target,
  BarChart3,
  Award,
  Zap,
  CheckCircle,
  Star
} from 'lucide-react';

interface StatItem {
  icon: React.ComponentType<any>;
  value: string;
  label: string;
  suffix?: string;
  color: string;
  description: string;
}

const stats: StatItem[] = [
  {
    icon: Users,
    value: "2500",
    suffix: "+",
    label: "Marketeurs actifs",
    color: "text-blue-500",
    description: "Utilisateurs satisfaits dans le monde entier"
  },
  {
    icon: Target,
    value: "50000",
    suffix: "+",
    label: "Personas créés",
    color: "text-green-500",
    description: "Profils générés avec succès"
  },
  {
    icon: Clock,
    value: "60",
    suffix: "s",
    label: "Temps moyen",
    color: "text-orange-500",
    description: "De l'idée au persona complet"
  },
  {
    icon: TrendingUp,
    value: "47",
    suffix: "%",
    label: "Amélioration conversion",
    color: "text-purple-500",
    description: "Résultats moyens de nos clients"
  },
  {
    icon: Globe,
    value: "50",
    suffix: "+",
    label: "Pays",
    color: "text-cyan-500",
    description: "Présence internationale"
  },
  {
    icon: Star,
    value: "4.9",
    suffix: "/5",
    label: "Satisfaction client",
    color: "text-yellow-500",
    description: "Basé sur 2,847 avis"
  }
];

const achievements = [
  {
    icon: Award,
    title: "Product Hunt",
    description: "Product of the Day",
    badge: "#1"
  },
  {
    icon: BarChart3,
    title: "G2 Reviews",
    description: "Leader Spring 2024",
    badge: "4.9/5"
  },
  {
    icon: CheckCircle,
    title: "SOC 2 Type II",
    description: "Certified Compliant",
    badge: "Certified"
  },
  {
    icon: Zap,
    title: "99.9% Uptime",
    description: "Service disponible",
    badge: "SLA"
  }
];

function CounterAnimation({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^\d]/g, ''));

  useEffect(() => {
    let startTime: number;
    const duration = 2000; // 2 seconds

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setCount(Math.floor(easedProgress * numericValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4">
            <BarChart3 className="h-4 w-4 mr-2" />
            Chiffres clés
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Des résultats qui parlent
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            PersonaCraft transforme la façon dont les équipes marketing créent leurs personas. 
            Découvrez l'impact mesurable sur des milliers d'entreprises.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 glass-card"
            >
              <CardContent className="p-6 sm:p-8 text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${
                  stat.color === 'text-blue-500' ? 'from-blue-500 to-blue-600' :
                  stat.color === 'text-green-500' ? 'from-green-500 to-green-600' :
                  stat.color === 'text-orange-500' ? 'from-orange-500 to-orange-600' :
                  stat.color === 'text-purple-500' ? 'from-purple-500 to-purple-600' :
                  stat.color === 'text-cyan-500' ? 'from-cyan-500 to-cyan-600' :
                  'from-yellow-500 to-yellow-600'
                } flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                
                <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                  <CounterAnimation value={stat.value} suffix={stat.suffix} />
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {stat.label}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
              Reconnu par les leaders de l'industrie
            </h3>
            <p className="text-white/90 text-base sm:text-lg">
              PersonaCraft est primé et certifié par les plus grandes plateformes
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-white/20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <achievement.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  {achievement.title}
                </h4>
                <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">
                  {achievement.description}
                </p>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  {achievement.badge}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Rejoignez des milliers d'entreprises satisfaites
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
            De la startup à la multinationale, PersonaCraft s'adapte à tous les besoins
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Configuration en 30 secondes</span>
            </div>
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Support client 24/7</span>
            </div>
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Garantie satisfait ou remboursé</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 