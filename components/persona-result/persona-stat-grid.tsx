import { Persona } from '@/lib/types/persona';
import { ModernStatCard } from '@/components/ui/modern-elements';
import { Heart, Star, MessageCircle, Target, ShoppingBag, Lightbulb } from 'lucide-react';

interface PersonaStatGridProps {
  persona: Persona;
}

export function PersonaStatGrid({ persona }: PersonaStatGridProps) {
  // Calcul des métriques
  const valuesCount = persona.values.length;
  const interestsCount = Object.keys(persona.interests).reduce(
(sum: number, category: string) => {
  const interests = persona.interests[category as keyof typeof persona.interests];
  return sum + (Array.isArray(interests) ? interests.length : 0);
}, 0
  );
  const channelsCount = persona.communication.preferredChannels?.length || 0;
  const painPointsCount = persona.marketing.painPoints.length;
  const motivationsCount = persona.marketing.motivations.length;
  
  // Calcul du score d'achat basé sur le comportement d'achat
  const purchaseBehaviorScore = persona.marketing.buyingBehavior ?
    Object.values(persona.marketing.buyingBehavior as unknown as Record<string, number>).reduce(
      (sum, value) => typeof value === 'number' ? sum + value : sum, 0
    ) / Object.values(persona.marketing.buyingBehavior as unknown as Record<string, number>).length * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ModernStatCard
        title="Valeurs"
        icon={<Heart className="h-5 w-5" />}
        value={valuesCount}
        description="Valeurs fondamentales"
        trend={valuesCount >= 3 ? 'up' : 'stable'}
        color="primary"
        className="persona-animate-in persona-delay-1"
      />
      
      <ModernStatCard
        title="Intérêts"
        icon={<Star className="h-5 w-5" />}
        value={interestsCount}
        description="Centres d'intérêt"
        trend={interestsCount >= 5 ? 'up' : 'stable'}
        color="warning"
        className="persona-animate-in persona-delay-2"
      />
      
      <ModernStatCard
        title="Communication"
        icon={<MessageCircle className="h-5 w-5" />}
        value={channelsCount}
        description="Canaux de communication"
        trend={channelsCount >= 3 ? 'up' : 'stable'}
        color="primary"
        className="persona-animate-in persona-delay-3"
      />
      
      <ModernStatCard
        title="Points de douleur"
        icon={<Target className="h-5 w-5" />}
        value={painPointsCount}
        description="Points de douleur"
        trend={painPointsCount >= 3 ? 'up' : 'stable'}
        color="danger"
        className="persona-animate-in persona-delay-4"
      />
      
      <ModernStatCard
        title="Motivations"
        icon={<Lightbulb className="h-5 w-5" />}
        value={motivationsCount}
        description="Motivations d'achat"
        trend={motivationsCount >= 3 ? 'up' : 'stable'}
        color="success"
        className="persona-animate-in persona-delay-5"
      />
      
      <ModernStatCard
        title="Score d'achat"
        icon={<ShoppingBag className="h-5 w-5" />}
        value={Math.round(purchaseBehaviorScore) + '%'}
        description="Score d'achat"
        trend={purchaseBehaviorScore >= 60 ? 'up' : purchaseBehaviorScore >= 40 ? 'stable' : 'down'}
        color="primary"
        className="persona-animate-in persona-delay-6"
      />
    </div>
  );
}