import { Persona } from '@/lib/types/persona';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedProgress, ModernBadge } from '@/components/ui/modern-elements';
import { Target, Lightbulb, ShoppingBag, TrendingUp, Users, DollarSign, Clock, BarChart } from 'lucide-react';

interface PersonaMarketingTabProps {
  persona: Persona;
}

export function PersonaMarketingTab({ persona }: PersonaMarketingTabProps) {
  const { marketing } = persona;

  // Fonction pour obtenir une couleur en fonction de l'index
  const getColorForIndex = (index: number): 'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue' => {
    const colors: Array<'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue'> = [
      'primary', 'success', 'purple', 'blue', 'warning', 'destructive'
    ];
    return colors[index % colors.length];
  };

  // Fonction pour obtenir une variante de badge en fonction du type d'influence
  const getInfluenceVariant = (type: string): 'success' | 'warning' | 'destructive' | 'default' => {
    const variantMap: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
      'social media': 'success',
      'friends': 'default',
      'family': 'default',
      'experts': 'warning',
      'reviews': 'success',
      'advertisements': 'destructive',
      'influencers': 'warning',
    };
    return variantMap[type.toLowerCase()] || 'default';
  };

  // Fonction pour formater les valeurs du comportement d'achat
  const formatBehaviorValue = (key: string, value: any): string => {
    if (typeof value === 'number') {
      return `${value}%`;
    }
    return value.toString();
  };

  // Fonction pour obtenir un libellé lisible pour les clés du comportement d'achat
  const getBehaviorLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      'researchLevel': 'Niveau de recherche',
      'priceConsciousness': 'Sensibilité au prix',
      'brandLoyalty': 'Fidélité à la marque',
      'decisionSpeed': 'Vitesse de décision',
      'techSavviness': 'Maîtrise technologique',
      'qualityFocus': 'Importance de la qualité',
      'impulseControl': 'Contrôle des achats impulsifs',
      'environmentalConcern': 'Préoccupation environnementale',
    };
    return labelMap[key] || key;
  };

  return (
    <div className="space-y-8">
      {/* Points de douleur */}
      <Card className="persona-result-card persona-animate-in persona-delay-1">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Points de douleur</CardTitle>
          </div>
          <CardDescription>
            Problèmes et frustrations de {persona.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marketing.painPoints && marketing.painPoints.length > 0 ? (
            <div className="space-y-4">
              {marketing.painPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 persona-animate-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                  <div className="mt-0.5">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full bg-${getColorForIndex(index)}/20 text-${getColorForIndex(index)}`}>
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {typeof point === 'string' 
                        ? point 
                        : 'name' in point 
                          ? (point as { name: string }).name
                          : 'Unknown'}
                    </h4>
                    {typeof point === 'object' && point && 'description' in (point as { description?: string }) && (point as { description: string }).description && (
                      <p className="text-sm text-muted-foreground mt-1">{(point as { description: string }).description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucun point de douleur défini</p>
          )}
        </CardContent>
      </Card>

      {/* Motivations */}
      <Card className="persona-result-card persona-animate-in persona-delay-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Motivations</CardTitle>
          </div>
          <CardDescription>
            Ce qui motive {persona.name} à agir et acheter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marketing.motivations && marketing.motivations.length > 0 ? (
            <div className="space-y-4">
              {marketing.motivations.map((motivation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 persona-animate-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                  <div className="mt-0.5">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full bg-${getColorForIndex(index)}/20 text-${getColorForIndex(index)}`}>
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {typeof motivation === 'string' 
                        ? motivation 
                        : 'name' in motivation 
                          ? (motivation as { name: string }).name
                          : 'Unknown'}
                    </h4>
                    {typeof motivation === 'object' && motivation && 'description' in (motivation as { description?: string }) && (motivation as { description: string }).description && (
                      <p className="text-sm text-muted-foreground mt-1">{(motivation as { description: string }).description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucune motivation définie</p>
          )}
        </CardContent>
      </Card>

      {/* Comportement d'achat */}
      <Card className="persona-result-card persona-animate-in persona-delay-3">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <CardTitle>Comportement d'achat</CardTitle>
          </div>
          <CardDescription>
            Comment {persona.name} prend ses décisions d'achat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marketing.buyingBehavior ? (
            <div className="space-y-6">
              {Object.entries(marketing.buyingBehavior || {}).map(([key, value], index) => {
                if (typeof value === 'number') {
                  return (
                    <div key={key} className="space-y-2 persona-animate-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{getBehaviorLabel(key)}</div>
                        <div className="text-sm text-muted-foreground">{value}%</div>
                      </div>
                      <AnimatedProgress 
                        value={value} 
                        color={getColorForIndex(index) === 'destructive' ? 'danger' : getColorForIndex(index) === 'purple' ? 'secondary' : getColorForIndex(index) === 'primary' ? 'primary' : getColorForIndex(index) === 'success' ? 'success' : getColorForIndex(index) === 'warning' ? 'warning' : undefined}
                        size="md" 
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 persona-animate-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                      <div className="font-medium">{getBehaviorLabel(key)}</div>
                      <ModernBadge variant="default">
                        {value.toString()}
                      </ModernBadge>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucun comportement d'achat défini</p>
          )}
        </CardContent>
      </Card>

      {/* Sources d'influence */}
      <Card className="persona-result-card persona-animate-in persona-delay-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Sources d'influence</CardTitle>
          </div>
          <CardDescription>
            Ce qui influence les décisions de {persona.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marketing.influenceSources && marketing.influenceSources.length > 0 ? (
            <div className="space-y-6">
              {marketing.influences?.map((source, index) => (
                <div key={index} className="space-y-2 persona-animate-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ModernBadge variant={getInfluenceVariant(source.type) === 'destructive' ? 'danger' : getInfluenceVariant(source.type) === 'default' ? 'outline' : getInfluenceVariant(source.type)} size="sm">
                        {typeof source === 'string' ? source : source.type}
                      </ModernBadge>
                      <div className="font-medium">{typeof source === 'string' ? source : source.name}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{source.score}%</div>
                  </div>
                  <AnimatedProgress 
                    value={typeof source === 'object' && source && 'score' in source ? (source as { score: number }).score : 0}
                    color={getColorForIndex(index) === 'destructive' ? 'danger' : getColorForIndex(index) === 'purple' ? 'secondary' : getColorForIndex(index) === 'primary' ? 'primary' : getColorForIndex(index) === 'success' ? 'success' : getColorForIndex(index) === 'warning' ? 'warning' : undefined}
                    size="md" 
                  />
                  {typeof source === 'object' && 'description' in source && source.description && (
                    <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucune source d'influence définie</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}