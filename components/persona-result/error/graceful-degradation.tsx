'use client';

import React from 'react';
import { AlertCircle, User, MapPin, Calendar, Quote, Star, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Persona } from '@/lib/types/persona';

interface GracefulDegradationProps {
  persona: Partial<Persona>;
  missingFields: string[];
  onRegenerateRequest?: () => void;
}

// Main graceful degradation wrapper
export const PersonaGracefulDegradation: React.FC<GracefulDegradationProps> = ({
  persona,
  missingFields,
  onRegenerateRequest,
}) => {
  const criticalFieldsMissing = missingFields.some(field => 
    ['name', 'age', 'location'].includes(field)
  );

  if (criticalFieldsMissing) {
    return <CriticalDataMissing onRegenerateRequest={onRegenerateRequest} />;
  }

  return (
    <div className="space-y-6">
      {missingFields.length > 0 && (
        <MissingDataAlert 
          missingFields={missingFields} 
          onRegenerateRequest={onRegenerateRequest}
        />
      )}
      <EnhancedPersonaDisplay persona={persona} missingFields={missingFields} />
    </div>
  );
};

// Alert for missing data
const MissingDataAlert: React.FC<{
  missingFields: string[];
  onRegenerateRequest?: () => void;
}> = ({ missingFields, onRegenerateRequest }) => (
  <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
    <AlertCircle className="h-4 w-4 text-amber-600" />
    <AlertDescription className="flex items-center justify-between">
      <div>
        <span className="font-medium">Données incomplètes détectées</span>
        <p className="text-sm mt-1">
          {missingFields.length} champ{missingFields.length > 1 ? 's' : ''} manquant{missingFields.length > 1 ? 's' : ''}: {' '}
          {missingFields.slice(0, 3).join(', ')}
          {missingFields.length > 3 && ` et ${missingFields.length - 3} autre${missingFields.length - 3 > 1 ? 's' : ''}`}
        </p>
      </div>
      {onRegenerateRequest && (
        <Button variant="outline" size="sm" onClick={onRegenerateRequest}>
          Régénérer
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

// Critical data missing fallback
const CriticalDataMissing: React.FC<{
  onRegenerateRequest?: () => void;
}> = ({ onRegenerateRequest }) => (
  <div className="flex items-center justify-center min-h-[400px] p-6">
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
          <User className="h-6 w-6 text-amber-600" />
        </div>
        <CardTitle>Données essentielles manquantes</CardTitle>
        <CardDescription>
          Ce persona ne contient pas les informations de base nécessaires à son affichage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {onRegenerateRequest && (
          <Button onClick={onRegenerateRequest} className="w-full">
            Régénérer le persona
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

// Enhanced display with fallbacks for missing data
const EnhancedPersonaDisplay: React.FC<{
  persona: Partial<Persona>;
  missingFields: string[];
}> = ({ persona, missingFields }) => (
  <div className="space-y-6">
    {/* Hero section with fallbacks */}
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <PersonaAvatarWithFallback persona={persona} />
          <PersonaBasicInfoWithFallback persona={persona} missingFields={missingFields} />
        </div>
      </CardContent>
    </Card>

    {/* Quote section with fallback */}
    <PersonaQuoteWithFallback persona={persona} />

    {/* Values section with fallback */}
    <PersonaValuesWithFallback persona={persona} />
  </div>
);

// Avatar component with fallback
const PersonaAvatarWithFallback: React.FC<{ persona: Partial<Persona> }> = ({ persona }) => (
  <div className="relative">
    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center">
      {persona.avatar ? (
        <img 
          src={persona.avatar} 
          alt={`Avatar de ${persona.name || 'Persona'}`} 
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <span className={`text-4xl font-bold text-primary/40 ${persona.avatar ? 'hidden' : ''}`}>
        {persona.name ? persona.name.charAt(0).toUpperCase() : '?'}
      </span>
    </div>
    <div className="absolute -bottom-2 -right-2">
      <Badge variant="outline" className="bg-background">
        {persona.generatedAt ? 'Généré' : 'Incomplet'}
      </Badge>
    </div>
  </div>
);

// Basic info with fallbacks
const PersonaBasicInfoWithFallback: React.FC<{
  persona: Partial<Persona>;
  missingFields: string[];
}> = ({ persona, missingFields }) => (
  <div className="flex-1 text-center md:text-left">
    <h1 className="text-2xl font-bold tracking-tight mb-2">
      {persona.name || (
        <span className="text-muted-foreground italic">Nom non défini</span>
      )}
    </h1>
    
    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
      {persona.age ? (
        <Badge variant="outline">
          <Calendar className="mr-1 h-3 w-3" />
          {persona.age} ans
        </Badge>
      ) : missingFields.includes('age') && (
        <Badge variant="outline" className="text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          Âge non défini
        </Badge>
      )}
      
      {persona.location ? (
        <Badge variant="outline">
          <MapPin className="mr-1 h-3 w-3" />
          {persona.location}
        </Badge>
      ) : missingFields.includes('location') && (
        <Badge variant="outline" className="text-muted-foreground">
          <MapPin className="mr-1 h-3 w-3" />
          Localisation non définie
        </Badge>
      )}
    </div>

    {persona.bio && (
      <p className="text-muted-foreground text-sm leading-relaxed">
        {persona.bio}
      </p>
    )}
  </div>
);

// Quote with fallback
const PersonaQuoteWithFallback: React.FC<{ persona: Partial<Persona> }> = ({ persona }) => {
  if (!persona.quote) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Quote className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground italic">
            Citation personnelle non disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative">
          <Quote className="h-6 w-6 text-primary/30 absolute -top-2 -left-2" />
          <blockquote className="text-lg italic text-center pl-4">
            "{persona.quote}"
          </blockquote>
        </div>
      </CardContent>
    </Card>
  );
};

// Values with fallback
const PersonaValuesWithFallback: React.FC<{ persona: Partial<Persona> }> = ({ persona }) => {
  if (!persona.values || persona.values.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-5 w-5" />
            Valeurs personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic text-center">
            Valeurs personnelles non définies
          </p>
          <div className="mt-4 flex justify-center">
            <Badge variant="outline" className="text-muted-foreground">
              <Lightbulb className="mr-1 h-3 w-3" />
              Suggestion: Régénérer pour obtenir des valeurs
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Valeurs personnelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {persona.values.map((value, index) => (
            <Badge key={index} variant="secondary">
              {value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Utility function to detect missing fields
export const detectMissingFields = (persona: Partial<Persona>): string[] => {
  const requiredFields = ['name', 'age', 'location', 'bio', 'values', 'quote'];
  const optionalFields = ['interests', 'communication', 'marketing', 'avatar'];
  
  const missing: string[] = [];
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = persona[field as keyof Persona];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      missing.push(field);
    }
  });
  
  // Check optional fields for completeness scoring
  optionalFields.forEach(field => {
    const value = persona[field as keyof Persona];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      missing.push(field);
    }
  });
  
  return missing;
};

// Utility function to validate persona data integrity
export const validatePersonaData = (persona: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Type validation
  if (persona.age && (typeof persona.age !== 'number' || persona.age < 0 || persona.age > 120)) {
    errors.push('Âge invalide');
  }
  
  if (persona.name && typeof persona.name !== 'string') {
    errors.push('Nom invalide');
  }
  
  if (persona.values && !Array.isArray(persona.values)) {
    errors.push('Format des valeurs invalide');
  }
  
  // Data consistency validation
  if (persona.interests) {
    const interestFields = ['music', 'brands', 'movies', 'food', 'books', 'lifestyle'];
    interestFields.forEach(field => {
      if (persona.interests[field] && !Array.isArray(persona.interests[field])) {
        errors.push(`Format des intérêts ${field} invalide`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};