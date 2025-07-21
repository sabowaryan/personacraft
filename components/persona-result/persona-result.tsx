'use client';

import { useState } from 'react';
import { Persona } from '@/lib/types/persona';
import { ArrowLeft, Download, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularScore, ModernBadge, ModernStatCard, AnimatedProgress } from '@/components/ui/modern-elements';
import { PersonaScoreCard } from './persona-score-card';
import { PersonaStatGrid } from './persona-stat-grid';
import { PersonaProfileTab } from './tabs/persona-profile-tab';
import { PersonaInterestsTab } from './tabs/persona-interests-tab';
import { PersonaCommunicationTab } from './tabs/persona-communication-tab';
import { PersonaMarketingTab } from './tabs/persona-marketing-tab';

interface PersonaResultProps {
  persona: Persona;
  onBack?: () => void;
}

export function PersonaResult({ persona, onBack }: PersonaResultProps) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Calcul des scores globaux
  const qualityScore = Math.round(
    (persona.values.length / 5 * 0.3 + 
     Object.keys(persona.interests).length / 10 * 0.3 + 
     persona.communication.channels.length / 5 * 0.2 + 
     persona.marketing.painPoints.length / 5 * 0.2) * 100
  );
  
  const completionScore = Math.round(
    (!!persona.bio ? 0.2 : 0) +
    (!!persona.quote ? 0.1 : 0) +
    (persona.values.length > 0 ? 0.2 : 0) +
    (Object.keys(persona.interests).length > 0 ? 0.2 : 0) +
    (persona.communication.channels.length > 0 ? 0.15 : 0) +
    (persona.marketing.painPoints.length > 0 ? 0.15 : 0) * 100
  );

  const handleExport = () => {
    // Logique d'export à implémenter
    console.log('Exporting persona:', persona.id);
  };

  const handleShare = () => {
    // Logique de partage à implémenter
    console.log('Sharing persona:', persona.id);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto persona-animate-in">
      {/* En-tête */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4 persona-animate-in persona-delay-1">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{persona.name}</h1>
            <p className="text-muted-foreground">
              {persona.age} ans • {persona.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
        </div>
      </header>

      {/* Section héroïque */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 persona-animate-in persona-delay-2">
        <Card className="md:col-span-2 persona-result-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center">
                  {persona.avatar ? (
                    <img 
                      src={persona.avatar} 
                      alt={`Avatar de ${persona.name}`} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary/40">
                      {persona.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <ModernBadge variant="success" size="lg" pulse>
                    <Star className="h-3.5 w-3.5 mr-1" />
                    Généré
                  </ModernBadge>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant="outline" className="text-xs font-medium">
                    {persona.age} ans
                  </Badge>
                  <Badge variant="outline" className="text-xs font-medium">
                    {persona.location}
                  </Badge>
                  {persona.values.slice(0, 2).map((value, index) => (
                    <Badge key={index} className="text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
                      {value.name}
                    </Badge>
                  ))}
                </div>
                
                {persona.quote && (
                  <div className="relative mt-4 p-4 text-muted-foreground bg-muted/50 rounded-lg border border-border persona-quote">
                    <p className="relative z-10">{persona.quote}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-4">
          <PersonaScoreCard 
            qualityScore={qualityScore} 
            completionScore={completionScore} 
          />
        </div>
      </section>

      {/* Statistiques rapides */}
      <section className="mb-8 px-4 persona-animate-in persona-delay-3">
        <PersonaStatGrid persona={persona} />
      </section>

      {/* Onglets de contenu */}
      <section className="px-4 persona-animate-in persona-delay-4">
        <Tabs 
          defaultValue="profile" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="interests">Intérêts</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="persona-animate-in">
            <PersonaProfileTab persona={persona} />
          </TabsContent>
          
          <TabsContent value="interests" className="persona-animate-in">
            <PersonaInterestsTab persona={persona} />
          </TabsContent>
          
          <TabsContent value="communication" className="persona-animate-in">
            <PersonaCommunicationTab persona={persona} />
          </TabsContent>
          
          <TabsContent value="marketing" className="persona-animate-in">
            <PersonaMarketingTab persona={persona} />
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Pied de page */}
      <footer className="mt-12 p-4 text-center text-sm text-muted-foreground persona-animate-in persona-delay-5">
        <p>Persona généré le {new Date(persona.generatedAt).toLocaleDateString()}</p>
        {persona.sources && persona.sources.length > 0 && (
          <p className="mt-1">Basé sur {persona.sources.length} source(s)</p>
        )}
      </footer>
    </div>
  );
}