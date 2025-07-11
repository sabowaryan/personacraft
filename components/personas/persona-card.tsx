'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Download, Share2, MapPin, Calendar, Quote, Eye } from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { PersonaExport } from './persona-export';
import Link from 'next/link';

interface PersonaCardProps {
  persona: Persona;
}

export function PersonaCard({ persona }: PersonaCardProps) {

  return (
    <Card className="w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={persona.avatar} alt={persona.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-teal-500 text-white text-lg">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{persona.name}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{persona.age} ans</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{persona.location}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/personas/${persona.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Voir détail
              </Button>
            </Link>
            <PersonaExport persona={persona} />
          </div>
        </div>
      </CardHeader>
              Voir détail
            </Button>
            <PersonaExport persona={persona} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-4 rounded-lg border-l-4 border-indigo-500">
          <div className="flex items-start space-x-2">
            <Quote className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm italic text-gray-700">"{persona.quote}"</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Biographie</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{persona.bio}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Valeurs importantes</h4>
          <div className="flex flex-wrap gap-2">
            {persona.values.map(value => (
              <Badge key={value} variant="secondary" className="bg-indigo-100 text-indigo-800">
                {value}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Centres d'intérêt</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Musique</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {persona.interests.music.map(item => (
                    <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Marques</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {persona.interests.brands.slice(0, 3).map(item => (
                    <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Lifestyle</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {persona.interests.lifestyle.slice(0, 3).map(item => (
                    <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Communication</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Canaux préférés:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {persona.communication.preferredChannels.map(channel => (
                    <Badge key={channel} variant="outline" className="text-xs">{channel}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Ton:</span>
                <span className="ml-2 text-muted-foreground">{persona.communication.tone}</span>
              </div>
              <div>
                <span className="font-medium">Fréquence:</span>
                <span className="ml-2 text-muted-foreground">{persona.communication.frequency}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-2">Profil Marketing</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Points de douleur:</span>
              <ul className="mt-1 space-y-1">
                {persona.marketing.painPoints.slice(0, 2).map(point => (
                  <li key={point} className="text-muted-foreground text-xs">• {point}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Motivations:</span>
              <ul className="mt-1 space-y-1">
                {persona.marketing.motivations.slice(0, 2).map(motivation => (
                  <li key={motivation} className="text-muted-foreground text-xs">• {motivation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Généré le {persona.generatedAt.toLocaleDateString()}</span>
            <span>Sources: {persona.sources.join(', ')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}