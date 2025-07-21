import { Persona } from '@/lib/types/persona';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Music, Film, Book, Gamepad, ShoppingBag, Utensils, Plane, Heart, Activity } from 'lucide-react';
import { FeatureCard } from '@/components/ui/modern-elements';

interface PersonaInterestsTabProps {
  persona: Persona;
}

export function PersonaInterestsTab({ persona }: PersonaInterestsTabProps) {
  // Mapping des catégories d'intérêts aux icônes
  const categoryIcons: Record<string, React.ReactNode> = {
    music: <Music className="h-5 w-5" />,
    movies: <Film className="h-5 w-5" />,
    books: <Book className="h-5 w-5" />,
    games: <Gamepad className="h-5 w-5" />,
    shopping: <ShoppingBag className="h-5 w-5" />,
    food: <Utensils className="h-5 w-5" />,
    travel: <Plane className="h-5 w-5" />,
    hobbies: <Heart className="h-5 w-5" />,
    sports: <Activity className="h-5 w-5" />,
  };

  // Fonction pour obtenir une couleur en fonction de la catégorie
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      music: 'purple',
      movies: 'blue',
      books: 'amber',
      games: 'green',
      shopping: 'pink',
      food: 'orange',
      travel: 'sky',
      hobbies: 'red',
      sports: 'indigo',
    };
    return colorMap[category] || 'gray';
  };

  // Fonction pour générer les étoiles d'évaluation
  const renderStars = (score: number) => {
    const maxStars = 5;
    const filledStars = Math.round(score / 20); // Convertir le score (0-100) en étoiles (0-5)
    
    return (
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, index) => (
          <Star 
            key={index}
            className={`h-4 w-4 ${index < filledStars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{score}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Vue d'ensemble des intérêts */}
      <Card className="persona-result-card persona-animate-in persona-delay-1">
        <CardHeader>
          <CardTitle>Centres d'intérêt</CardTitle>
          <CardDescription>
            Les sujets et activités qui passionnent {persona.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(persona.interests).map(([category, interests], categoryIndex) => (
              <Card key={category} className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 persona-animate-in" style={{animationDelay: `${0.3 + categoryIndex * 0.1}s`}}>
                <CardHeader className={`pb-2 border-b bg-${getCategoryColor(category)}-50 dark:bg-${getCategoryColor(category)}-950/20`}>
                  <div className="flex items-center gap-2">
                    {categoryIcons[category] || <Star className="h-5 w-5" />}
                    <CardTitle className="text-lg capitalize">{category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {interests.length > 0 ? (
                    <div className="space-y-3">
                      {interests.map((interest, index) => (
                        <div key={index} className="space-y-1 persona-animate-in" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{interest.name}</span>
                          </div>
                          {renderStars(interest.score)}
                          {interest.description && (
                            <p className="text-sm text-muted-foreground mt-1">{interest.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Aucun intérêt défini pour cette catégorie</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations basées sur les intérêts */}
      <Card className="persona-result-card persona-animate-in persona-delay-2">
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>
            Suggestions basées sur les intérêts de {persona.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(persona.interests)
              .filter(([_, interests]) => interests.length > 0)
              .slice(0, 3)
              .map(([category, interests]) => {
                const topInterest = interests.sort((a, b) => b.score - a.score)[0];
                return (
                  <FeatureCard
                    key={category}
                    title={`${topInterest.name}`}
                    description={topInterest.description || `Contenu lié à ${topInterest.name}`}
                    icon={categoryIcons[category] || <Star className="h-5 w-5" />}
                    badge={{
                      text: category.charAt(0).toUpperCase() + category.slice(1),
                      variant: getCategoryColor(category) as any
                    }}
                  />
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}