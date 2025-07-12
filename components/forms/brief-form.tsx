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
import { Plus, X, Sparkles, Users, Target, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { briefFormSchema, type BriefFormData } from '@/lib/utils/validators';

interface BriefFormProps {
  onSubmit: (data: BriefFormData) => void;
  isLoading?: boolean;
  isGenerating?: boolean;
}

export function BriefForm({ onSubmit, isLoading = false, isGenerating = false }: BriefFormProps) {
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  const form = useForm<BriefFormData>({
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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedInterests = watch('interests');
  const watchedValues = watch('values');
  const watchedDescription = watch('description');

  // Validation en temps réel pour la description
  const descriptionLength = watchedDescription?.length || 0;
  const isDescriptionValid = descriptionLength >= 10 && descriptionLength <= 1000;

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

  const handleFormSubmit = (data: BriefFormData) => {
    // Les données sont déjà validées par Zod
    onSubmit(data);
  };

  const isDisabled = isLoading || isGenerating;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <span>Créer un Persona</span>
        </CardTitle>
        <p className="text-gray-600">
          Décrivez votre audience cible pour générer un persona détaillé et réaliste
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          
          {/* Description de l'audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Description de l'audience cible</span>
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('description')}
              placeholder="Décrivez votre audience cible en détail : qui sont-ils, que font-ils, quels sont leurs besoins..."
              className={cn(
                "min-h-[100px] resize-none",
                errors.description && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={isDisabled}
            />
            
            {/* Compteur de caractères avec validation visuelle */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                {isDescriptionValid ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                )}
                <span className={cn(
                  descriptionLength < 10 ? "text-amber-600" :
                  descriptionLength > 1000 ? "text-red-600" :
                  "text-green-600"
                )}>
                  {descriptionLength}/1000 caractères
                </span>
              </div>
              {descriptionLength < 10 && (
                <span className="text-amber-600">
                  {10 - descriptionLength} caractères minimum requis
                </span>
              )}
            </div>
            
            {errors.description && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.description.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tranche d'âge */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Tranche d'âge</span>
              <span className="text-red-500">*</span>
            </label>
            <Select 
              onValueChange={(value) => setValue('ageRange', value)}
              defaultValue="25-35"
              disabled={isDisabled}
            >
              <SelectTrigger className={cn(errors.ageRange && "border-red-500")}>
                <SelectValue placeholder="Sélectionner une tranche d'âge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-25">18-25 ans</SelectItem>
                <SelectItem value="25-35">25-35 ans</SelectItem>
                <SelectItem value="35-45">35-45 ans</SelectItem>
                <SelectItem value="45-55">45-55 ans</SelectItem>
                <SelectItem value="55-65">55-65 ans</SelectItem>
                <SelectItem value="65+">65+ ans</SelectItem>
              </SelectContent>
            </Select>
            {errors.ageRange && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.ageRange.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Localisation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Localisation (optionnel)</label>
            <Input
              {...register('location')}
              placeholder="ex: Paris, France ou Europe"
              className={cn(errors.location && "border-red-500")}
              disabled={isDisabled}
            />
            {errors.location && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.location.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Centres d'intérêt */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span>Centres d'intérêt</span>
                <span className="text-red-500">*</span>
              </span>
              <span className="text-xs text-gray-500">
                {watchedInterests.length}/15
              </span>
            </label>
            
            <div className="flex space-x-2">
              <Input
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                placeholder="Ajouter un centre d'intérêt"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                className="flex-1"
                disabled={isDisabled || watchedInterests.length >= 15}
              />
              <Button 
                type="button" 
                onClick={addInterest}
                disabled={!currentInterest.trim() || watchedInterests.length >= 15 || isDisabled}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {watchedInterests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center space-x-1">
                  <span>{interest}</span>
                                      <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-red-500"
                      disabled={isDisabled}
                    >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {errors.interests && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.interests.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Valeurs */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span>Valeurs importantes</span>
                <span className="text-red-500">*</span>
              </span>
              <span className="text-xs text-gray-500">
                {watchedValues.length}/10
              </span>
            </label>
            
            <div className="flex space-x-2">
              <Input
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Ajouter une valeur"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                className="flex-1"
                disabled={isDisabled || watchedValues.length >= 10}
              />
              <Button 
                type="button" 
                onClick={addValue}
                disabled={!currentValue.trim() || watchedValues.length >= 10 || isDisabled}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {watchedValues.map((value) => (
                <Badge key={value} variant="outline" className="flex items-center space-x-1">
                  <span>{value}</span>
                                      <button
                      type="button"
                      onClick={() => removeValue(value)}
                      className="ml-1 hover:text-red-500"
                      disabled={isDisabled}
                    >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {errors.values && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.values.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Options avancées */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register('generateMultiple')}
                id="generateMultiple"
                disabled={isDisabled}
              />
              <label htmlFor="generateMultiple" className="text-sm font-medium">
                Générer plusieurs personas (3-5 variations)
              </label>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Conseil :</strong> Plus votre description est détaillée, plus le persona généré sera précis et utile pour vos campagnes marketing.
              </AlertDescription>
            </Alert>
          </div>

          {/* Bouton de soumission */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold"
            disabled={isDisabled || Object.keys(errors).length > 0}
          >
            {isDisabled ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Génération en cours...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Créer le Persona</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}