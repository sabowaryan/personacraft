'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Quote, 
  Heart,
  MessageCircle,
  Target,
  Download,
  Eye,
  Clock
} from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { formatDate, formatAge, formatList, truncateText } from '@/lib/utils/formatting';

interface PersonaCardProps {
  persona: Persona;
  onView?: () => void;
  onExport?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  showMetadata?: boolean;
}

export function PersonaCard({ 
  persona, 
  onView, 
  onExport, 
  variant = 'default',
  showMetadata = true 
}: PersonaCardProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
      <CardHeader className={isCompact ? "pb-3" : "pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className={isCompact ? "h-10 w-10" : "h-12 w-12"}>
              <AvatarImage src={persona.avatar} alt={persona.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-teal-500 text-white font-semibold">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className={isCompact ? "text-lg" : "text-xl"}>{persona.name}</CardTitle>
              <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatAge(persona.age)}</span>
                </div>
                {persona.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{persona.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {showMetadata && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatDate(persona.generatedAt, 'relative')}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <div>
          <p className="text-gray-700 leading-relaxed">
            {isCompact ? truncateText(persona.bio, 120) : persona.bio}
          </p>
        </div>

        {/* Citation */}
        {!isCompact && persona.quote && (
          <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-3 rounded-lg border-l-3 border-indigo-400">
            <Quote className="h-4 w-4 text-indigo-600 mb-2" />
            <p className="text-sm italic text-gray-700">"{persona.quote}"</p>
          </div>
        )}

        {/* Valeurs */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Valeurs</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.values.slice(0, isCompact ? 3 : undefined).map((value) => (
              <Badge key={value} variant="secondary" className="text-xs">
                {value}
              </Badge>
            ))}
            {isCompact && persona.values.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{persona.values.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Centres d'intérêt */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Intérêts principaux</span>
          </div>
          <div className="space-y-1">
            {isDetailed ? (
              // Vue détaillée avec toutes les catégories
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-600">Musique:</span>
                  <p className="text-gray-700">{formatList(persona.interests.music, 2)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Marques:</span>
                  <p className="text-gray-700">{formatList(persona.interests.brands, 2)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Films:</span>
                  <p className="text-gray-700">{formatList(persona.interests.movies, 2)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Cuisine:</span>
                  <p className="text-gray-700">{formatList(persona.interests.food, 2)}</p>
                </div>
              </div>
            ) : (
              // Vue simplifiée avec badges
              <div className="flex flex-wrap gap-1">
                {[
                  ...persona.interests.music.slice(0, 2),
                  ...persona.interests.brands.slice(0, 1),
                  ...persona.interests.lifestyle.slice(0, 1)
                ].slice(0, isCompact ? 3 : 4).map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {!isCompact && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{Object.values(persona.interests).flat().length - 4} autres
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Communication */}
        {!isCompact && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Communication</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-600">Canaux:</span>
                <p className="text-gray-700">{formatList(persona.communication.preferredChannels, 2)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Ton:</span>
                <p className="text-gray-700">{persona.communication.tone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>
          
          {showMetadata && (
            <div className="text-xs text-gray-500">
              Sources: {formatList(persona.sources, 2, "+")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
