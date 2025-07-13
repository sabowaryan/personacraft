'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  X, 
  Sparkles, 
  Users, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  MapPin, 
  Calendar, 
  Heart, 
  Lightbulb,
  Zap,
  Brain,
  Award,
  Clock,
  ShieldCheck,
  TrendingUp,
  Eye,
  Settings,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { briefFormSchema } from '@/lib/utils/validators';
import { BriefFormData } from '@/lib/types/persona';
import { z } from 'zod';

type BriefFormSchemaType = z.infer<typeof briefFormSchema>;

interface BriefFormProps {
  onSubmit: (data: BriefFormData) => void;
  isLoading?: boolean;
  isGenerating?: boolean;
}

export function BriefForm({ onSubmit, isLoading = false, isGenerating = false }: BriefFormProps) {
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [formStep, setFormStep] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const form = useForm<BriefFormSchemaType>({
    resolver: zodResolver(briefFormSchema),
    defaultValues: {
      description: '',
      ageRange: '25-35',
      location: '',
      interests: [],
      values: [],
      generateMultiple: false
    }
  });

  const { handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedInterests = watch('interests');
  const watchedValues = watch('values');
  const watchedDescription = watch('description');
  const watchedLocation = watch('location');
  const watchedAgeRange = watch('ageRange');
  const watchedGenerateMultiple = watch('generateMultiple');

  // Validation en temps réel pour la description
  const descriptionLength = watchedDescription?.length || 0;
  const isDescriptionValid = descriptionLength >= 10 && descriptionLength <= 1000;

  // Calcul du score de complétude
  const completionScore = Math.round((
    (isDescriptionValid ? 25 : 0) +
    (watchedLocation ? 15 : 0) +
    (watchedInterests.length > 0 ? 25 : 0) +
    (watchedValues.length > 0 ? 25 : 0) +
    (watchedAgeRange ? 10 : 0)
  ));

  const addInterest = () => {
    if (currentInterest.trim() && !watchedInterests.includes(currentInterest.trim())) {
      if (watchedInterests.length < 15) {
        setValue('interests', [...watchedInterests, currentInterest.trim()]);
        setCurrentInterest('');
      }
    }
  };

  const removeInterest = (interest: string) => {
    setValue('interests', watchedInterests.filter(i => i !== interest));
  };

  const addValue = () => {
    if (currentValue.trim() && !watchedValues.includes(currentValue.trim())) {
      if (watchedValues.length < 10) {
        setValue('values', [...watchedValues, currentValue.trim()]);
        setCurrentValue('');
      }
    }
  };

  const removeValue = (value: string) => {
    setValue('values', watchedValues.filter(v => v !== value));
  };

  const handleFormSubmit = (data: BriefFormSchemaType) => {
    onSubmit(data as BriefFormData);
  };

  const isDisabled = isLoading || isGenerating;

  const steps = [
    { id: 0, title: 'Description', icon: Users, description: 'Décrivez votre audience' },
    { id: 1, title: 'Profil', icon: Target, description: 'Âge et localisation' },
    { id: 2, title: 'Intérêts', icon: Heart, description: 'Centres d\'intérêt' },
    { id: 3, title: 'Valeurs', icon: Award, description: 'Valeurs importantes' },
    { id: 4, title: 'Options', icon: Settings, description: 'Configuration finale' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête avec titre principal */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-xl shadow-lg">
            <Users className="h-8 w-8 text-primary-700 dark:text-primary-300" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Créer votre brief marketing
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Décrivez votre audience cible et laissez notre IA créer des personas 
          détaillés, cohérents et exploitables pour vos campagnes.
        </p>
      </div>

      {/* En-tête avec progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/50 dark:to-secondary-900/50 rounded-xl shadow-lg">
              <Brain className="h-6 w-6 text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Assistant IA - Brief Marketing
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Créez des personas précis en quelques minutes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Complétude</div>
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {completionScore}%
              </div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset={100 - completionScore}
                  className="text-primary-600 dark:text-primary-400"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Indicateurs de qualité */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all duration-300 hover-lift shadow-sm",
            isDescriptionValid 
              ? "border-green-300 bg-green-50/80 dark:border-green-600 dark:bg-green-900/30 shadow-green-100 dark:shadow-green-900/20" 
              : "border-gray-300 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-800/30 shadow-gray-100 dark:shadow-gray-900/20"
          )}>
            <div className="flex items-center gap-3">
              {isDescriptionValid ? (
                <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-300" />
                </div>
              ) : (
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Description</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {descriptionLength}/1000 caractères
                </p>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all duration-300 hover-lift shadow-sm",
            watchedLocation 
              ? "border-blue-300 bg-blue-50/80 dark:border-blue-600 dark:bg-blue-900/30 shadow-blue-100 dark:shadow-blue-900/20" 
              : "border-gray-300 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-800/30 shadow-gray-100 dark:shadow-gray-900/20"
          )}>
            <div className="flex items-center gap-3">
              {watchedLocation ? (
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
              ) : (
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Localisation</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {watchedLocation ? 'Définie' : 'Optionnelle'}
                </p>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all duration-300 hover-lift shadow-sm",
            watchedInterests.length > 0 
              ? "border-primary-300 bg-primary-50/80 dark:border-primary-600 dark:bg-primary-900/30 shadow-primary-100 dark:shadow-primary-900/20" 
              : "border-gray-300 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-800/30 shadow-gray-100 dark:shadow-gray-900/20"
          )}>
            <div className="flex items-center gap-3">
              {watchedInterests.length > 0 ? (
                <div className="p-1.5 bg-primary-100 dark:bg-primary-800 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-primary-700 dark:text-primary-300" />
                </div>
              ) : (
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Intérêts</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {watchedInterests.length} ajoutés
                </p>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all duration-300 hover-lift shadow-sm",
            watchedValues.length > 0 
              ? "border-secondary-300 bg-secondary-50/80 dark:border-secondary-600 dark:bg-secondary-900/30 shadow-secondary-100 dark:shadow-secondary-900/20" 
              : "border-gray-300 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-800/30 shadow-gray-100 dark:shadow-gray-900/20"
          )}>
            <div className="flex items-center gap-3">
              {watchedValues.length > 0 ? (
                <div className="p-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-secondary-700 dark:text-secondary-300" />
                </div>
              ) : (
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Heart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Valeurs</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {watchedValues.length} définies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire principal */}
      <Card className="border-0 shadow-2xl glass-card">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          
          {/* Description de l'audience */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-lg shadow-sm">
                  <Users className="h-5 w-5 text-primary-700 dark:text-primary-300" />
                </div>
                <div className="flex-1">
                  <label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Description de l'audience cible
                    <span className="text-danger-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Plus votre description est détaillée, plus le persona sera précis
                  </p>
                </div>
              </div>
              
              <Textarea
                value={watchedDescription}
                onChange={(e) => setValue('description', e.target.value)}
                placeholder="Décrivez votre audience cible en détail : qui sont-ils, que font-ils, quels sont leurs besoins, leurs comportements, leurs défis, leur contexte professionnel ou personnel..."
                variant="default"
                size="lg"
                autoResize={true}
                maxLength={1000}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={isDisabled}
              />
              
              {descriptionLength > 0 && descriptionLength < 10 && (
                <Alert className="border-amber-300 bg-amber-50/80 dark:border-amber-600 dark:bg-amber-900/30 shadow-amber-100 dark:shadow-amber-900/20">
                  <div className="p-1 bg-amber-100 dark:bg-amber-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Conseil :</strong> Ajoutez plus de détails pour améliorer la précision (minimum 10 caractères)
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Profil démographique */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary-100 dark:bg-primary-800 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary-700 dark:text-primary-300" />
                  </div>
                  <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Tranche d'âge
                    <span className="text-danger-500">*</span>
                  </label>
                </div>
                <Select 
                  onValueChange={(value) => setValue('ageRange', value)}
                  defaultValue="25-35"
                  disabled={isDisabled}
                >
                  <SelectTrigger 
                    variant="default"
                    size="md"
                    error={!!errors.ageRange}
                    helperText={errors.ageRange?.message}
                  >
                    <SelectValue placeholder="Sélectionner une tranche d'âge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 ans • Jeunes adultes</SelectItem>
                    <SelectItem value="25-35">25-35 ans • Jeunes professionnels</SelectItem>
                    <SelectItem value="35-45">35-45 ans • Professionnels établis</SelectItem>
                    <SelectItem value="45-55">45-55 ans • Experts confirmés</SelectItem>
                    <SelectItem value="55-65">55-65 ans • Seniors actifs</SelectItem>
                    <SelectItem value="65+">65+ ans • Seniors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                  </div>
                  <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Localisation
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(optionnel)</span>
                  </label>
                </div>
                <Input
                  value={watchedLocation}
                  onChange={(e) => setValue('location', e.target.value)}
                  placeholder="ex: Paris, France • Europe • Monde"
                  variant="default"
                  size="md"
                  leftIcon={<MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  disabled={isDisabled}
                />
              </div>
            </div>

          {/* Centres d'intérêt */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-primary-700 dark:text-primary-300" />
                </div>
                <div className="flex-1">
                  <label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Centres d'intérêt
                    <span className="text-danger-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Activités, hobbies, secteurs d'activité qui intéressent votre audience
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {watchedInterests.length}/15
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Input
                  value={currentInterest}
                  onChange={(e) => setCurrentInterest(e.target.value)}
                  placeholder="ex: Technologie, Sport, Cuisine, Art..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  variant="default"
                  size="md"
                  leftIcon={<Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                  disabled={isDisabled || watchedInterests.length >= 15}
                />
                <Button 
                  type="button" 
                  onClick={addInterest}
                  disabled={!currentInterest.trim() || watchedInterests.length >= 15 || isDisabled}
                  className="h-10 px-6 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {watchedInterests.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse" />
                      Intérêts ajoutés ({watchedInterests.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedInterests.map((interest: string, index: number) => (
                      <div
                        key={interest}
                        className="group relative bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/60 dark:to-primary-800/60 border border-primary-200 dark:border-primary-600 rounded-lg px-3 py-2 hover-lift transition-all duration-300 animate-in slide-in-from-top-4 flex items-center gap-2 shadow-sm dark:shadow-primary-900/20"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="p-1 bg-primary-100 dark:bg-primary-800 rounded group-hover:scale-110 transition-transform duration-200">
                          <Target className="h-3 w-3 text-primary-700 dark:text-primary-300" />
                        </div>
                        <span className="text-sm font-medium text-primary-900 dark:text-primary-50">
                          {interest}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="p-1 text-primary-400 hover:text-red-500 hover:bg-red-50 dark:text-primary-300 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded transition-all duration-200 group-hover:scale-110"
                          disabled={isDisabled}
                          title="Supprimer cet intérêt"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-400/10 dark:to-primary-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.interests && (
                <Alert variant="destructive" className="border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/30 shadow-red-100 dark:shadow-red-900/20">
                  <div className="p-1 bg-red-100 dark:bg-red-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                  </div>
                  <AlertDescription className="text-red-800 dark:text-red-200">{errors.interests.message}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Valeurs */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/50 dark:to-secondary-800/50 rounded-lg shadow-sm">
                  <Heart className="h-5 w-5 text-secondary-700 dark:text-secondary-300" />
                </div>
                <div className="flex-1">
                  <label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Valeurs importantes
                    <span className="text-danger-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ce qui motive et guide les décisions de votre audience
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {watchedValues.length}/10
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Input
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="ex: Innovation, Durabilité, Performance, Équité..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                  variant="default"
                  size="md"
                  leftIcon={<Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                  disabled={isDisabled || watchedValues.length >= 10}
                />
                <Button 
                  type="button" 
                  onClick={addValue}
                  disabled={!currentValue.trim() || watchedValues.length >= 10 || isDisabled}
                  className="h-10 px-6 bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-600 dark:hover:bg-secondary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {watchedValues.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary-500 dark:bg-secondary-400 rounded-full animate-pulse" />
                      Valeurs définies ({watchedValues.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.map((value: string, index: number) => (
                      <div
                        key={value}
                        className="group relative bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/60 dark:to-secondary-800/60 border border-secondary-200 dark:border-secondary-600 rounded-lg px-3 py-2 hover-lift transition-all duration-300 animate-in slide-in-from-top-4 flex items-center gap-2 shadow-sm dark:shadow-secondary-900/20"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="p-1 bg-secondary-100 dark:bg-secondary-800 rounded group-hover:scale-110 transition-transform duration-200">
                          <Heart className="h-3 w-3 text-secondary-700 dark:text-secondary-300" />
                        </div>
                        <span className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                          {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeValue(value)}
                          className="p-1 text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:text-secondary-300 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded transition-all duration-200 group-hover:scale-110"
                          disabled={isDisabled}
                          title="Supprimer cette valeur"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/10 to-secondary-600/10 dark:from-secondary-400/10 dark:to-secondary-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.values && (
                <Alert variant="destructive" className="border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/30 shadow-red-100 dark:shadow-red-900/20">
                  <div className="p-1 bg-red-100 dark:bg-red-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                  </div>
                  <AlertDescription className="text-red-800 dark:text-red-200">{errors.values.message}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Options de génération */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <Checkbox
                  id="generateMultiple"
                  checked={watchedGenerateMultiple}
                  onCheckedChange={(checked) => setValue('generateMultiple', checked as boolean)}
                  disabled={isDisabled}
                />
                <label
                  htmlFor="generateMultiple"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-800 dark:text-gray-200"
                >
                  Générer plusieurs variantes de personas
                </label>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span>Score de qualité : {completionScore}%</span>
              </div>
              
              <Button 
                type="submit" 
                disabled={isDisabled || completionScore < 50}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-600 dark:to-secondary-600 dark:hover:from-primary-700 dark:hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer le Persona
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}