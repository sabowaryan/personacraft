import { Persona } from '@/lib/types/persona';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedProgress } from '@/components/ui/modern-elements';
import { Heart, User } from 'lucide-react';

interface PersonaProfileTabProps {
  persona: Persona;
}

export function PersonaProfileTab({ persona }: PersonaProfileTabProps) {
  return (
    <div className="space-y-8">
      {/* Biographie */}
      <Card className="persona-result-card persona-animate-in persona-delay-1">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Biographie</CardTitle>
          </div>
          <CardDescription>
            Présentation et contexte de {persona.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {persona.bio ? (
              <div className="whitespace-pre-line">{persona.bio}</div>
            ) : (
              <p className="text-muted-foreground italic">Aucune biographie disponible</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Valeurs fondamentales */}
      <Card className="persona-result-card persona-animate-in persona-delay-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle>Valeurs fondamentales</CardTitle>
          </div>
          <CardDescription>
            Les principes qui guident les décisions de {persona.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {persona.values && persona.values.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {persona.values.map((value, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 persona-animate-in" 
                  style={{animationDelay: `${0.3 + index * 0.1}s`}}
                >
                  {value}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucune valeur définie</p>
          )}
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <Card className="persona-result-card persona-animate-in persona-delay-3">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Informations personnelles</CardTitle>
          </div>
          <CardDescription>
            Détails démographiques et contextuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Âge</p>
              <p className="text-muted-foreground">{persona.age} ans</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Localisation</p>
              <p className="text-muted-foreground">{persona.location}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium">Citation personnelle</p>
              <p className="text-muted-foreground italic persona-quote">"{persona.quote || 'Aucune citation disponible'}"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Fonction utilitaire pour obtenir une couleur en fonction de l'index
function getColorForIndex(index: number): 'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue' {
  const colors: Array<'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue'> = [
    'primary', 'success', 'purple', 'blue', 'warning', 'destructive'
  ];
  return colors[index % colors.length];
}