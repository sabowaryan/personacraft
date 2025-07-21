'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { HeroSectionProps } from './types';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Heart,
  MapPin,
  MessageCircle,
  Music,
  Quote,
  ShoppingBag,
  Star
} from 'lucide-react';
import { ActionButtons } from './action-buttons';
import { cn } from '@/lib/utils';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

/**
 * Composant HeroSection redesigné avec avatar et informations clés
 * Design moderne avec overlay de statut et cards flottantes
 */
export function HeroSection({ persona, onBack, onExport, onShare }: HeroSectionProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Fonction pour obtenir une classe de délai d'animation
  const getDelayClass = (index: number) => {
    return `persona-delay-${index + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation et actions - Utilisation du composant ActionButtons */}
      <ActionButtons
        personaId={persona.id}
        onBack={onBack}
        onExport={onExport}
        onShare={onShare}
      />

      {/* En-tête du persona avec design moderne et responsive */}
      <Card
        className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 hover:shadow-3xl persona-animate-in"
        aria-labelledby="persona-name"
      >
        <div className="relative">
          {/* Bannière de fond responsive avec gradient amélioré */}
          <div
            role="banner"
            aria-label="Bannière de persona"
            className="h-32 sm:h-40 md:h-48 lg:h-56 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

            {/* Cards flottantes avec informations clés */}
            <div className="hidden md:block">
              {/* Card flottante - Intérêts */}
              <div className={cn(
                "absolute top-6 right-8 w-36 h-16 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg backdrop-blur-sm p-3 persona-floating-card",
                getDelayClass(0)
              )}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Intérêts</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {Object.values(persona.interests).flat().length} passions
                    </p>
                  </div>
                </div>
              </div>

              {/* Card flottante - Valeurs */}
              <div className={cn(
                "absolute top-24 right-12 w-36 h-16 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg backdrop-blur-sm p-3 persona-floating-card",
                getDelayClass(1)
              )}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Valeurs</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {persona.values.length} priorités
                    </p>
                  </div>
                </div>
              </div>

              {/* Card flottante - Communication */}
              <div className={cn(
                "absolute top-6 left-8 w-36 h-16 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg backdrop-blur-sm p-3 persona-floating-card",
                getDelayClass(2)
              )}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-secondary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Communication</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {persona.communication.preferredChannels.length} canaux
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu de l'en-tête responsive */}
          <CardContent className="relative pt-0 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 lg:gap-8 -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28">

              {/* Avatar avec design moderne responsive et overlay de statut */}
              <div className="relative flex-shrink-0 persona-avatar-overlay">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-primary-500/20 dark:ring-primary-400/20 transition-transform duration-300 hover:scale-105">
                  <AvatarImage src={persona.avatar} alt={persona.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-xl sm:text-2xl md:text-3xl font-bold">
                    {getInitials(persona.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center"
                  aria-label="Statut actif"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>

              {/* Informations principales responsive */}
              <div className="flex-1 space-y-4 lg:space-y-6 w-full">
                <div>
                  <h1
                    id="persona-name"
                    className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-2 leading-tight"
                  >
                    {persona.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-gray-600 dark:text-gray-300">
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-700/20 persona-hover-lift"
                      aria-label={`Âge: ${persona.age} ans`}
                    >
                      <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-sm">{persona.age} ans</span>
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-700/20 persona-hover-lift"
                      aria-label={`Localisation: ${persona.location}`}
                    >
                      <MapPin className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                      <span className="font-medium text-sm">{persona.location}</span>
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-700/20 persona-hover-lift"
                      aria-label={`Généré le: ${new Date(persona.generatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}`}
                    >
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-sm">
                        {new Date(persona.generatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cards d'informations clés pour mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:hidden mt-4">
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 persona-hover-lift">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center mb-1">
                        <Heart className="h-4 w-4 text-accent-500" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Intérêts</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {Object.values(persona.interests).flat().length} passions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 persona-hover-lift">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center mb-1">
                        <Star className="h-4 w-4 text-primary-500" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Valeurs</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {persona.values.length} priorités
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 persona-hover-lift">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center mb-1">
                        <MessageCircle className="h-4 w-4 text-secondary-500" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Communication</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {persona.communication.preferredChannels.length} canaux
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 persona-hover-lift">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 rounded-full bg-info-light/20 flex items-center justify-center mb-1">
                        <ShoppingBag className="h-4 w-4 text-info-DEFAULT" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Marketing</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {persona.marketing.painPoints.length} points
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Citation mise en valeur responsive avec design amélioré */}
                <div
                  className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 p-4 sm:p-6 lg:p-8 rounded-xl border border-primary-200/50 dark:border-primary-700/50 transition-all duration-300 hover:shadow-lg persona-glass-card"
                  aria-label="Citation personnelle"
                >
                  <div className="flex items-start gap-3 lg:gap-4">
                    <Quote className="h-6 w-6 lg:h-8 lg:w-8 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className={cn(
                        "text-base sm:text-lg lg:text-xl italic text-gray-800 dark:text-gray-200 font-medium leading-relaxed",
                        "persona-quote"
                      )}>
                        "{persona.quote}"
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
                        — Citation personnelle
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges d'informations supplémentaires */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {persona.values.slice(0, 3).map((value, index) => (
                    <div
                      key={`value-${index}`}
                      className={cn(
                        "px-3 py-1.5 bg-primary-100/80 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-xs font-medium flex items-center gap-1.5 persona-hover-lift",
                        getDelayClass(index)
                      )}
                    >
                      <Star className="h-3 w-3" />
                      {value}
                    </div>
                  ))}

                  {Object.entries(persona.interests).slice(0, 2).map(([category, items], index) => (
                    items.slice(0, 1).map((item: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined) => (
                      <div
                        key={`interest-${category}-${index}`}
                        className={cn(
                          "px-3 py-1.5 bg-accent-100/80 dark:bg-accent-900/30 text-accent-800 dark:text-accent-300 rounded-full text-xs font-medium flex items-center gap-1.5 persona-hover-lift",
                          getDelayClass(index + 3)
                        )}
                      >
                        {category === 'music' ? (
                          <Music className="h-3 w-3" />
                        ) : (
                          <Heart className="h-3 w-3" />
                        )}
                        {item}
                      </div>
                    ))
                  ))}

                  <div
                    className={cn(
                      "px-3 py-1.5 bg-secondary-100/80 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300 rounded-full text-xs font-medium flex items-center gap-1.5 persona-hover-lift",
                      getDelayClass(5)
                    )}
                  >
                    <Briefcase className="h-3 w-3" />
                    {persona.marketing.buyingBehavior.split(' ').slice(0, 3).join(' ')}...
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}