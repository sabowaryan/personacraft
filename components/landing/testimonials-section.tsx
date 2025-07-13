'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, TrendingUp, Users, Target, Zap } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Martinez",
    role: "Head of Marketing",
    company: "TechFlow Solutions",
    avatar: "/api/placeholder/64/64",
    initials: "SM",
    rating: 5,
    content: "PersonaCraft a transformé notre approche marketing. En 2 minutes, nous avons des personas plus détaillés que ce que nous produisions en 2 semaines. Les données culturelles Qloo sont particulièrement précieuses.",
    results: {
      metric: "Conversion Rate",
      improvement: "+47%",
      timeframe: "3 mois"
    }
  },
  {
    name: "Marc Dubois",
    role: "Creative Director",
    company: "Brandify Agency",
    avatar: "/api/placeholder/64/64",
    initials: "MD",
    rating: 5,
    content: "Incroyable ! Les personas générés par PersonaCraft sont si précis qu'ils semblent réels. Mes équipes créatives s'appuient maintenant entièrement sur ces profils pour leurs campagnes.",
    results: {
      metric: "Campaign ROI",
      improvement: "+230%",
      timeframe: "6 mois"
    }
  },
  {
    name: "Jennifer Chang",
    role: "Growth Marketing Lead",
    company: "StartupX",
    avatar: "/api/placeholder/64/64",
    initials: "JC",
    rating: 5,
    content: "J'étais sceptique au début, mais les résultats parlent d'eux-mêmes. PersonaCraft nous a fait gagner un temps précieux et a considérablement amélioré nos taux d'engagement.",
    results: {
      metric: "Engagement Rate",
      improvement: "+85%",
      timeframe: "2 mois"
    }
  },
  {
    name: "Antoine Leblanc",
    role: "Marketing Manager",
    company: "E-commerce Pro",
    avatar: "/api/placeholder/64/64",
    initials: "AL",
    rating: 5,
    content: "Le niveau de détail est impressionnant. Les préférences culturelles et les insights comportementaux nous ont permis de créer des campagnes très ciblées avec des résultats exceptionnels.",
    results: {
      metric: "Lead Quality",
      improvement: "+120%",
      timeframe: "4 mois"
    }
  }
];

const stats = [
  {
    icon: TrendingUp,
    value: "2,500+",
    label: "Marketeurs actifs",
    color: "text-primary-500"
  },
  {
    icon: Users,
    value: "50,000+",
    label: "Personas créés",
    color: "text-secondary-500"
  },
  {
    icon: Target,
    value: "4.9/5",
    label: "Satisfaction client",
    color: "text-accent-500"
  },
  {
    icon: Zap,
    value: "60s",
    label: "Temps moyen",
    color: "text-orange-500"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <Badge variant="secondary" className="mb-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            <Star className="h-4 w-4 mr-2" />
            Témoignages clients
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Ils ont révolutionné leur marketing
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment PersonaCraft aide les équipes marketing à créer des campagnes 
            plus performantes grâce à des personas ultra-précis.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 sm:mb-4 ${stat.color}`}>
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
            >
              <CardContent className="p-6 sm:p-8">
                {/* Quote Icon */}
                <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mb-3 sm:mb-4 opacity-60" />
                
                {/* Stars */}
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Results */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.results.metric}
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {testimonial.results.improvement}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        En {testimonial.results.timeframe}
                      </div>
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 ml-auto" />
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mr-3 sm:mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Proof */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-primary-600 dark:to-secondary-600 rounded-2xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Rejoignez des milliers de marketeurs satisfaits
          </h3>
          <p className="text-white/90 text-base sm:text-lg mb-4 sm:mb-6">
            PersonaCraft est utilisé par des équipes marketing dans plus de 50 pays
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-white/80 text-sm sm:text-base">+2,500 utilisateurs actifs</span>
          </div>
        </div>
      </div>
    </section>
  );
} 