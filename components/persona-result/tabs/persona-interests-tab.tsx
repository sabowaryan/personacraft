import { Persona } from '@/lib/types/persona';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Music, Film, Book, Gamepad, ShoppingBag, Utensils, Plane, Heart, Activity } from 'lucide-react';
import { FeatureCard } from '@/components/ui/modern-elements';
import { InterestsCloud } from '@/components/persona-result/visualizations/interests-cloud';
import { CulturalDataGrid } from '@/components/persona-result/visualizations/cultural-data-grid';
import { CulturalInterest, CulturalDataPoint, DEFAULT_INTEREST_CATEGORIES } from '@/lib/types/cultural-interests';

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

  // Transform persona interests to CulturalInterest format
  const transformToInterests = (): CulturalInterest[] => {
    const interests: CulturalInterest[] = [];
    
    Object.entries(persona.interests).forEach(([categoryKey, categoryInterests]) => {
      const category = DEFAULT_INTEREST_CATEGORIES.find(c => c.id === categoryKey) || {
        id: categoryKey,
        name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
        icon: 'Star',
        color: getCategoryColor(categoryKey)
      };

      categoryInterests.forEach((interest: any, index: number) => {
        interests.push({
          id: `${categoryKey}-${index}`,
          name: interest.name,
          category,
          score: interest.score || 50,
          description: interest.description,
          tags: interest.tags || [],
          source: 'gemini',
          confidence: 0.8
        });
      });
    });

    return interests;
  };

  // Transform persona data to CulturalDataPoint format
  const transformToCulturalData = (): CulturalDataPoint[] => {
    const culturalData: CulturalDataPoint[] = [];
    
    Object.entries(persona.interests).forEach(([categoryKey, categoryInterests]) => {
      categoryInterests.forEach((interest: any, index: number) => {
        // Map category to cultural data type
        const typeMapping: Record<string, CulturalDataPoint['type']> = {
          music: 'music',
          movies: 'movies',
          books: 'books',
          shopping: 'brands',
          food: 'food',
          travel: 'lifestyle',
          hobbies: 'lifestyle',
          sports: 'lifestyle',
          games: 'lifestyle'
        };

        culturalData.push({
          id: `cultural-${categoryKey}-${index}`,
          type: typeMapping[categoryKey] || 'lifestyle',
          name: interest.name,
          category: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
          score: interest.score || 50,
          metadata: {
            description: interest.description,
            tags: interest.tags,
            source: 'persona-generation'
          }
        });
      });
    });

    return culturalData;
  };

  const interests = transformToInterests();
  const culturalData = transformToCulturalData();

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

  const handleInterestClick = (interest: CulturalInterest) => {
    console.log('Interest clicked:', interest);
  };

  const handleCulturalDataClick = (item: CulturalDataPoint) => {
    console.log('Cultural data clicked:', item);
  };

  return (
    <div className="space-y-8">
      {/* Interactive Interests Cloud */}
      <InterestsCloud
        interests={interests}
        categories={DEFAULT_INTEREST_CATEGORIES}
        config={{
          maxItems: 50,
          minScore: 0,
          showCategories: true,
          interactive: true,
          colorScheme: 'category'
        }}
        onInterestClick={handleInterestClick}
        onCategoryFilter={(categoryId) => console.log('Category filter:', categoryId)}
        className="persona-animate-in persona-delay-1"
      />

      {/* Cultural Data Grid */}
      <CulturalDataGrid
        data={culturalData}
        config={{
          groupBy: 'type',
          sortBy: 'score',
          showMetadata: true,
          compactView: false
        }}
        onItemClick={handleCulturalDataClick}
        className="persona-animate-in persona-delay-2"
      />

      {/* Traditional View - Fallback */}
      <Card className="persona-result-card persona-animate-in persona-delay-3">
        <CardHeader>
          <CardTitle>Vue Traditionnelle</CardTitle>
          <CardDescription>
            Organisation classique des centres d'intérêt de {persona.name}
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
                      {interests.map((interest: any, index: number) => (
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
      <Card className="persona-result-card persona-animate-in persona-delay-4">
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
                const topInterest = interests.sort((a: any, b: any) => b.score - a.score)[0];
                return (
                  <FeatureCard
                    key={category}
                    title={`${topInterest.name}`}
                    description={topInterest.description || `Contenu lié à ${topInterest.name}`}
                    icon={categoryIcons[category] || <Star className="h-5 w-5" />}
                    badge={category.charAt(0).toUpperCase() + category.slice(1)}
                  />
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}