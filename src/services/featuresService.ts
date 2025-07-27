export interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
  color: {
    from: string;
    to: string;
    shadow: string;
  };
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: {
    from: string;
    to: string;
    border: string;
    shadow: string;
  };
}

export interface DetailedFeature {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  benefits: string[];
  useCases: string[];
  color: {
    from: string;
    to: string;
    accent: string;
  };
}

class FeaturesService {
  private processSteps: ProcessStep[] = [
    {
      id: 'describe',
      step: 1,
      title: "Décrivez votre projet",
      description: "Saisissez votre brief marketing : produit, cible, objectifs et contexte",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: {
        from: "from-blue-500",
        to: "to-indigo-600",
        shadow: "shadow-blue-500/30"
      }
    },
    {
      id: 'generate',
      step: 2,
      title: "L'IA génère vos personas",
      description: "Gemini et Qloo créent des personas détaillés avec données culturelles réelles",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      color: {
        from: "from-indigo-500",
        to: "to-purple-600",
        shadow: "shadow-purple-500/30"
      }
    },
    {
      id: 'export',
      step: 3,
      title: "Exportez et utilisez",
      description: "Téléchargez vos personas en JSON, CSV ou PDF pour vos campagnes",
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
      color: {
        from: "from-purple-500",
        to: "to-pink-600",
        shadow: "shadow-pink-500/30"
      }
    }
  ];

  private features: Feature[] = [
    {
      id: 'customization',
      title: "Personnalisation",
      description: "Ajustez les personas selon vos besoins spécifiques",
      icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4",
      color: {
        from: "from-blue-500",
        to: "to-blue-600",
        border: "border-blue-200/60",
        shadow: "shadow-blue-500/20"
      }
    },
    {
      id: 'validation',
      title: "Validation IA",
      description: "Chaque persona est validé par nos algorithmes avancés",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: {
        from: "from-indigo-500",
        to: "to-indigo-600",
        border: "border-indigo-200/60",
        shadow: "shadow-indigo-500/20"
      }
    },
    {
      id: 'export',
      title: "Export Multiple",
      description: "JSON, CSV, PDF - choisissez le format qui vous convient",
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
      color: {
        from: "from-purple-500",
        to: "to-purple-600",
        border: "border-purple-200/60",
        shadow: "shadow-purple-500/20"
      }
    },
    {
      id: 'realtime',
      title: "Temps Réel",
      description: "Génération instantanée, résultats en moins d'une minute",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: {
        from: "from-pink-500",
        to: "to-pink-600",
        border: "border-pink-200/60",
        shadow: "shadow-pink-500/20"
      }
    }
  ];

  private detailedFeatures: DetailedFeature[] = [
    {
      id: 'ai-generation',
      title: "Génération IA Avancée",
      description: "Intelligence artificielle de pointe pour des personas authentiques",
      longDescription: "Notre système utilise les dernières avancées en IA, combinant Gemini de Google et les données culturelles de Qloo pour créer des personas d'une précision inégalée.",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      benefits: [
        "Analyse comportementale approfondie",
        "Données culturelles réelles intégrées",
        "Personnalisation selon votre secteur",
        "Mise à jour continue des modèles"
      ],
      useCases: [
        "Campagnes marketing ciblées",
        "Développement produit",
        "Stratégie de contenu",
        "Recherche utilisateur"
      ],
      color: {
        from: "from-blue-500",
        to: "to-indigo-600",
        accent: "text-blue-600"
      }
    },
    {
      id: 'cultural-insights',
      title: "Insights Culturels Qloo",
      description: "Données comportementales et culturelles en temps réel",
      longDescription: "Grâce à notre partenariat avec Qloo, accédez à des insights culturels uniques basés sur des milliards de points de données comportementales.",
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      benefits: [
        "Tendances culturelles actuelles",
        "Préférences de consommation",
        "Comportements d'achat",
        "Influences sociales"
      ],
      useCases: [
        "Ciblage publicitaire précis",
        "Positionnement de marque",
        "Stratégie d'influence",
        "Analyse de marché"
      ],
      color: {
        from: "from-indigo-500",
        to: "to-purple-600",
        accent: "text-indigo-600"
      }
    },
    {
      id: 'multi-export',
      title: "Export Multi-Format",
      description: "Intégration facile dans tous vos outils marketing",
      longDescription: "Exportez vos personas dans le format qui convient à votre workflow : JSON pour les développeurs, CSV pour l'analyse, PDF pour les présentations.",
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
      benefits: [
        "Formats multiples disponibles",
        "Intégration API native",
        "Templates personnalisables",
        "Export en masse"
      ],
      useCases: [
        "Intégration CRM",
        "Outils d'automatisation",
        "Présentations client",
        "Documentation projet"
      ],
      color: {
        from: "from-purple-500",
        to: "to-pink-600",
        accent: "text-purple-600"
      }
    },
    {
      id: 'real-time',
      title: "Génération Temps Réel",
      description: "Résultats instantanés pour une productivité maximale",
      longDescription: "Notre infrastructure cloud optimisée garantit une génération de personas en moins d'une minute, même pour les projets les plus complexes.",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      benefits: [
        "Génération sous 60 secondes",
        "Infrastructure scalable",
        "Disponibilité 99.9%",
        "Optimisation continue"
      ],
      useCases: [
        "Brainstorming créatif",
        "Réunions client",
        "Itération rapide",
        "Tests A/B"
      ],
      color: {
        from: "from-pink-500",
        to: "to-rose-600",
        accent: "text-pink-600"
      }
    },
    {
      id: 'collaboration',
      title: "Collaboration d'Équipe",
      description: "Travaillez ensemble sur vos personas marketing",
      longDescription: "Partagez, commentez et collaborez en temps réel avec votre équipe pour créer des personas qui reflètent la vision collective.",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      benefits: [
        "Partage en temps réel",
        "Commentaires intégrés",
        "Historique des versions",
        "Permissions granulaires"
      ],
      useCases: [
        "Équipes marketing",
        "Agences créatives",
        "Consultants",
        "Projets clients"
      ],
      color: {
        from: "from-green-500",
        to: "to-emerald-600",
        accent: "text-green-600"
      }
    },
    {
      id: 'analytics',
      title: "Analytics & Insights",
      description: "Mesurez l'impact de vos personas sur vos campagnes",
      longDescription: "Suivez les performances de vos personas avec des analytics détaillés et des recommandations d'optimisation basées sur l'IA.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      benefits: [
        "Métriques de performance",
        "Recommandations IA",
        "Rapports automatisés",
        "ROI tracking"
      ],
      useCases: [
        "Optimisation campagnes",
        "Reporting client",
        "Amélioration continue",
        "Validation hypothèses"
      ],
      color: {
        from: "from-orange-500",
        to: "to-red-600",
        accent: "text-orange-600"
      }
    }
  ];

  /**
   * Récupère les étapes du processus
   */
  async getProcessSteps(): Promise<ProcessStep[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.processSteps);
      }, 100);
    });
  }

  /**
   * Récupère les fonctionnalités principales
   */
  async getFeatures(): Promise<Feature[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.features);
      }, 100);
    });
  }

  /**
   * Récupère les fonctionnalités détaillées
   */
  async getDetailedFeatures(): Promise<DetailedFeature[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.detailedFeatures);
      }, 100);
    });
  }

  /**
   * Récupère une fonctionnalité détaillée par ID
   */
  async getDetailedFeatureById(id: string): Promise<DetailedFeature | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const feature = this.detailedFeatures.find(f => f.id === id);
        resolve(feature || null);
      }, 100);
    });
  }

  /**
   * Recherche dans les fonctionnalités
   */
  async searchFeatures(query: string): Promise<{
    processSteps: ProcessStep[];
    features: Feature[];
    detailedFeatures: DetailedFeature[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        
        const filteredProcessSteps = this.processSteps.filter(step =>
          step.title.toLowerCase().includes(lowerQuery) ||
          step.description.toLowerCase().includes(lowerQuery)
        );

        const filteredFeatures = this.features.filter(feature =>
          feature.title.toLowerCase().includes(lowerQuery) ||
          feature.description.toLowerCase().includes(lowerQuery)
        );

        const filteredDetailedFeatures = this.detailedFeatures.filter(feature =>
          feature.title.toLowerCase().includes(lowerQuery) ||
          feature.description.toLowerCase().includes(lowerQuery) ||
          feature.longDescription.toLowerCase().includes(lowerQuery) ||
          feature.benefits.some(benefit => benefit.toLowerCase().includes(lowerQuery)) ||
          feature.useCases.some(useCase => useCase.toLowerCase().includes(lowerQuery))
        );

        resolve({
          processSteps: filteredProcessSteps,
          features: filteredFeatures,
          detailedFeatures: filteredDetailedFeatures
        });
      }, 200);
    });
  }

  /**
   * Récupère les fonctionnalités par catégorie
   */
  async getFeaturesByCategory(category: 'core' | 'advanced' | 'enterprise'): Promise<DetailedFeature[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered: DetailedFeature[] = [];
        
        switch (category) {
          case 'core':
            filtered = this.detailedFeatures.filter(f => 
              ['ai-generation', 'multi-export', 'real-time'].includes(f.id)
            );
            break;
          case 'advanced':
            filtered = this.detailedFeatures.filter(f => 
              ['cultural-insights', 'collaboration'].includes(f.id)
            );
            break;
          case 'enterprise':
            filtered = this.detailedFeatures.filter(f => 
              ['analytics'].includes(f.id)
            );
            break;
        }
        
        resolve(filtered);
      }, 100);
    });
  }
}

export const featuresService = new FeaturesService();