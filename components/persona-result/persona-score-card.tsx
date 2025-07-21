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

  const qualityColor = getScoreColor(qualityScore);
  const completionColor = getScoreColor(completionScore);

  return (
    <Card className="h-full persona-result-card persona-animate-in">
      <CardContent className="p-6 flex flex-col justify-center h-full">
        <div className="text-center mb-2">
          <h3 className="text-lg font-semibold mb-1">Score du Persona</h3>
          <p className="text-sm text-muted-foreground">Qualité et complétude</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col items-center">
            <CircularScore
              value={qualityScore}
              size="lg"
              color={qualityColor as any}
              label="Qualité"
            />
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Info className="h-3 w-3 mr-1" />
              <span>Richesse des données</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <CircularScore
              value={completionScore}
              size="lg"
              color={completionColor as any}
              label="Complétude"
            />
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Info className="h-3 w-3 mr-1" />
              <span>Sections complétées</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}