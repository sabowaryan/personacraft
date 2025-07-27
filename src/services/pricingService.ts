export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular: boolean;
  color: 'purple' | 'gradient';
  limits: {
    personas: number | 'unlimited';
    exports: string[];
    support: string;
    api: boolean;
    culturalInsights: boolean;
  };
}

export interface PricingFAQ {
  question: string;
  answer: string;
}

class PricingService {
  private plans: PricingPlan[] = [
    {
      id: 'free',
      name: "Gratuit",
      monthlyPrice: "0€",
      annualPrice: "0€",
      period: "/mois",
      description: "Parfait pour découvrir PersonaCraft",
      features: [
        "3 personas par mois",
        "Export PDF basique",
        "Support communautaire"
      ],
      cta: "Commencer gratuitement",
      ctaLink: "/dashboard",
      popular: false,
      color: "purple",
      limits: {
        personas: 3,
        exports: ['PDF'],
        support: 'Communauté',
        api: false,
        culturalInsights: false
      }
    },
    {
      id: 'pro',
      name: "Pro",
      monthlyPrice: "29€",
      annualPrice: "23€",
      period: "/mois",
      description: "Pour les marketeurs professionnels",
      features: [
        "50 personas par mois",
        "Export JSON, CSV, PDF",
        "Insights culturels avancés",
        "Support prioritaire"
      ],
      cta: "Essayer Pro",
      ctaLink: "/dashboard?plan=pro",
      popular: true,
      color: "gradient",
      limits: {
        personas: 50,
        exports: ['PDF', 'JSON', 'CSV'],
        support: 'Prioritaire',
        api: true,
        culturalInsights: true
      }
    },
    {
      id: 'enterprise',
      name: "Enterprise",
      monthlyPrice: "99€",
      annualPrice: "79€",
      period: "/mois",
      description: "Pour les grandes équipes et agences",
      features: [
        "Personas illimités",
        "API personnalisée",
        "Intégrations avancées",
        "Support dédié 24/7"
      ],
      cta: "Nous contacter",
      ctaLink: "/contact",
      popular: false,
      color: "purple",
      limits: {
        personas: 'unlimited',
        exports: ['PDF', 'JSON', 'CSV', 'API'],
        support: 'Dédié 24/7',
        api: true,
        culturalInsights: true
      }
    }
  ];

  private faqs: PricingFAQ[] = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et nous calculons le prorata pour la facturation."
    },
    {
      question: "Y a-t-il une période d'essai ?",
      answer: "Le plan gratuit vous permet de tester PersonaCraft sans engagement. Le plan Pro offre 14 jours d'essai gratuit, sans carte de crédit requise."
    },
    {
      question: "Les données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons un chiffrement AES-256, respectons le RGPD et stockons vos données sur des serveurs européens certifiés ISO 27001."
    },
    {
      question: "Support technique inclus ?",
      answer: "Tous les plans incluent un support. Le plan gratuit a accès à la communauté, Pro bénéficie d'un support prioritaire, et Enterprise d'un support dédié 24/7."
    },
    {
      question: "Puis-je annuler à tout moment ?",
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment. Aucun frais d'annulation, et vous gardez l'accès jusqu'à la fin de votre période de facturation."
    },
    {
      question: "Offrez-vous des réductions pour les étudiants ?",
      answer: "Oui, nous offrons 50% de réduction sur le plan Pro pour les étudiants et enseignants avec une adresse email académique valide."
    },
    {
      question: "Qu'est-ce qui est inclus dans l'API ?",
      answer: "L'API permet d'intégrer PersonaCraft dans vos outils existants, d'automatiser la génération de personas et d'exporter les données dans vos systèmes CRM ou marketing."
    },
    {
      question: "Comment fonctionne la facturation ?",
      answer: "La facturation est mensuelle ou annuelle (avec 2 mois gratuits). Nous acceptons toutes les cartes de crédit principales et les virements SEPA pour les entreprises."
    }
  ];

  /**
   * Récupère tous les plans de pricing
   */
  async getPlans(): Promise<PricingPlan[]> {
    // Simulation d'un appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.plans);
      }, 100);
    });
  }

  /**
   * Récupère un plan spécifique par son ID
   */
  async getPlanById(id: string): Promise<PricingPlan | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plan = this.plans.find(p => p.id === id);
        resolve(plan || null);
      }, 100);
    });
  }

  /**
   * Récupère les FAQs
   */
  async getFAQs(): Promise<PricingFAQ[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.faqs);
      }, 100);
    });
  }

  /**
   * Calcule le prix avec remise annuelle
   */
  calculateAnnualDiscount(monthlyPrice: string): { discount: number; savings: string } {
    const monthly = parseFloat(monthlyPrice.replace('€', ''));
    if (monthly === 0) return { discount: 0, savings: '0€' };
    
    const discount = 0.2; // 20% de remise
    const savings = (monthly * 12 * discount).toFixed(0);
    
    return {
      discount,
      savings: `${savings}€`
    };
  }

  /**
   * Vérifie si un plan a une fonctionnalité spécifique
   */
  planHasFeature(planId: string, feature: keyof PricingPlan['limits']): boolean {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return false;
    
    const featureValue = plan.limits[feature];
    return featureValue === true || (Array.isArray(featureValue) && featureValue.length > 0);
  }

  /**
   * Compare deux plans
   */
  comparePlans(planId1: string, planId2: string): {
    plan1: PricingPlan | null;
    plan2: PricingPlan | null;
    differences: string[];
  } {
    const plan1 = this.plans.find(p => p.id === planId1) || null;
    const plan2 = this.plans.find(p => p.id === planId2) || null;
    
    const differences: string[] = [];
    
    if (plan1 && plan2) {
      // Comparer les limites de personas
      if (plan1.limits.personas !== plan2.limits.personas) {
        differences.push(`Personas: ${plan1.limits.personas} vs ${plan2.limits.personas}`);
      }
      
      // Comparer les exports
      const exports1 = plan1.limits.exports.join(', ');
      const exports2 = plan2.limits.exports.join(', ');
      if (exports1 !== exports2) {
        differences.push(`Exports: ${exports1} vs ${exports2}`);
      }
      
      // Comparer le support
      if (plan1.limits.support !== plan2.limits.support) {
        differences.push(`Support: ${plan1.limits.support} vs ${plan2.limits.support}`);
      }
    }
    
    return { plan1, plan2, differences };
  }
}

export const pricingService = new PricingService();