import { Card, CardContent } from '@/components/ui/card';
import { CircularScore } from '@/components/ui/modern-elements';
import { Info } from 'lucide-react';

interface PersonaScoreCardProps {
  qualityScore: number;
  completionScore: number;
}

export function PersonaScoreCard({ qualityScore, completionScore }: PersonaScoreCardProps) {
  // Déterminer la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'destructive';
  };

  // Déterminer le niveau de qualité pour l'accessibilité
  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  const qualityColor = getScoreColor(qualityScore);
  const completionColor = getScoreColor(completionScore);
  const qualityLevel = getScoreLevel(qualityScore);
  const completionLevel = getScoreLevel(completionScore);

  return (
    <Card 
      className="h-full persona-result-card persona-animate-in"
      role="region"
      aria-labelledby="persona-scores-title"
    >
      <CardContent className="p-6 flex flex-col justify-center h-full">
        <header className="text-center mb-2">
          <h3 id="persona-scores-title" className="text-lg font-semibold mb-1">
            Score du Persona
          </h3>
          <p className="text-sm text-muted-foreground">Qualité et complétude</p>
        </header>

        <div 
          className="grid grid-cols-2 gap-4 mt-4"
          role="group"
          aria-label="Persona quality metrics"
        >
          <div className="flex flex-col items-center">
            <div
              role="img"
              aria-label={`Score de qualité: ${qualityScore}% - Niveau ${qualityLevel}`}
            >
              <CircularScore
                score={qualityScore}
                size="lg"
                color={qualityColor as any}
                label="Qualité"
              />
            </div>
            <div 
              className="mt-2 flex items-center text-xs text-muted-foreground"
              role="note"
              aria-label="Quality score explanation"
            >
              <Info className="h-3 w-3 mr-1" aria-hidden="true" />
              <span>Richesse des données</span>
            </div>
            <div className="sr-only">
              Score de qualité: {qualityScore} sur 100. 
              Niveau: {qualityLevel}. 
              Basé sur la richesse des données du persona.
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div
              role="img"
              aria-label={`Score de complétude: ${completionScore}% - Niveau ${completionLevel}`}
            >
              <CircularScore
                score={completionScore}
                size="lg"
                color={completionColor as any}
                label="Complétude"
              />
            </div>
            <div 
              className="mt-2 flex items-center text-xs text-muted-foreground"
              role="note"
              aria-label="Completion score explanation"
            >
              <Info className="h-3 w-3 mr-1" aria-hidden="true" />
              <span>Sections complétées</span>
            </div>
            <div className="sr-only">
              Score de complétude: {completionScore} sur 100. 
              Niveau: {completionLevel}. 
              Basé sur le nombre de sections complétées du persona.
            </div>
          </div>
        </div>

        {/* Additional context for screen readers */}
        <div className="sr-only">
          Les scores sont calculés automatiquement en fonction de la qualité et de la complétude des données du persona. 
          Un score de 80% ou plus est considéré comme excellent, 
          60-79% comme bon, 40-59% comme moyen, et moins de 40% comme faible.
        </div>
      </CardContent>
    </Card>
  );
}