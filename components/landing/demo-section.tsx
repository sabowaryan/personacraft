'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  User,
  MapPin,
  Heart,
  Music,
  ShoppingBag,
  MessageCircle,
  BarChart3,
  Download,
  ChevronRight
} from 'lucide-react';

const demoPersona = {
  name: "Emma Dubois",
  age: 28,
  location: "Lyon, France",
  profession: "UX Designer",
  bio: "Passionnée de design et de technologie, Emma aime découvrir de nouveaux outils créatifs et partager ses découvertes avec sa communauté.",
  avatar: "/api/placeholder/120/120",
  interests: {
    music: ["Indie Pop", "Electronic", "French Touch"],
    brands: ["Apple", "Nike", "Sézane", "Notion"],
    lifestyle: ["Yoga", "Café spécialisé", "Photographie"]
  },
  communication: {
    channels: ["Instagram", "LinkedIn", "Newsletter"],
    tone: "Authentique et inspirant",
    frequency: "3-4 fois par semaine"
  },
  marketing: {
    painPoints: ["Manque de temps", "Outils complexes", "Coût élevé"],
    motivations: ["Créativité", "Efficacité", "Reconnaissance"],
    influences: ["Experts design", "Communauté créative", "Tendances tech"]
  }
};

export function DemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      title: "Brief marketing",
      description: "Décrivez votre projet en quelques phrases",
      duration: "30s",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Votre brief :</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              "Je recherche des personas pour une application de design collaborative 
              ciblant les créatifs de 25-35 ans en France."
            </p>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>IA analyse votre demande...</span>
          </div>
        </div>
      )
    },
    {
      title: "Analyse IA",
      description: "Notre IA traite vos données avec Gemini & Qloo",
      duration: "15s",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Analyse comportementale</span>
            <Badge variant="secondary" className="text-xs">✓ Terminé</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Données culturelles Qloo</span>
            <Badge variant="secondary" className="text-xs">✓ Terminé</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Psychographie avancée</span>
            <Badge className="bg-primary-500 text-white text-xs">En cours...</Badge>
          </div>
        </div>
      )
    },
    {
      title: "Persona généré",
      description: "Création du profil détaillé et authentique",
      duration: "10s",
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">{demoPersona.name}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {demoPersona.age} ans • {demoPersona.profession}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{demoPersona.location}</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              <span>{demoPersona.interests.lifestyle[0]}</span>
            </div>
            <div className="flex items-center">
              <Music className="h-4 w-4 mr-2 text-blue-500" />
              <span>{demoPersona.interests.music[0]}</span>
            </div>
            <div className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-green-500" />
              <span>{demoPersona.interests.brands[0]}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Export & utilisation",
      description: "Téléchargez et intégrez dans vos outils",
      duration: "5s",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Export PDF</span>
            <Button size="sm" variant="outline" className="text-xs">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Télécharger
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Export CSV</span>
            <Button size="sm" variant="outline" className="text-xs">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Télécharger
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Intégration CRM</span>
            <Button size="sm" variant="outline" className="text-xs">
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )
    }
  ];

  const handlePlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4">
            <Play className="h-4 w-4 mr-2" />
            Démo interactive
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Voyez PersonaCraft en action
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Découvrez comment nous transformons un simple brief en persona détaillé 
            grâce à l'intelligence artificielle et aux données culturelles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Process Steps */}
          <div className="space-y-4 sm:space-y-6">
            {steps.map((step, index) => (
              <Card 
                key={index} 
                className={`transition-all duration-500 ${
                  index <= currentStep 
                    ? 'ring-2 ring-primary-500 shadow-lg dark:ring-offset-gray-900' 
                    : 'opacity-50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                        index <= currentStep 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <CardTitle className="text-base sm:text-lg">{step.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {step.duration}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 ml-8 sm:ml-11">
                    {step.description}
                  </p>
                </CardHeader>
                {index === currentStep && (
                  <CardContent className="pt-0">
                    <div className="ml-8 sm:ml-11">
                      {step.content}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Demo Controls & Result */}
          <div className="space-y-4 sm:space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button 
                onClick={handlePlay}
                disabled={isPlaying}
                size="lg"
                className="bg-primary-500 hover:bg-primary-600 text-white w-full sm:w-auto"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    En cours...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Lancer la démo
                  </>
                )}
              </Button>
              <Button 
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Recommencer
              </Button>
            </div>

            {/* Result Preview */}
            {currentStep >= 2 && (
              <Card className="glass-card animate-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Persona généré
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-lg">
                        {demoPersona.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{demoPersona.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {demoPersona.age} ans • {demoPersona.profession}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {demoPersona.location}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {demoPersona.bio}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                    <div>
                      <h4 className="font-semibold mb-1 text-xs sm:text-sm">Centres d'intérêt</h4>
                      <div className="flex flex-wrap gap-1">
                        {demoPersona.interests.music.slice(0, 2).map((interest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-xs sm:text-sm">Marques préférées</h4>
                      <div className="flex flex-wrap gap-1">
                        {demoPersona.interests.brands.slice(0, 2).map((brand, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 