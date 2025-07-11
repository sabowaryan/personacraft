'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Wand2 } from 'lucide-react';
import { BriefFormData } from '@/lib/types/persona';

interface BriefFormProps {
  onSubmit: (data: BriefFormData) => void;
  isGenerating: boolean;
}

const suggestedInterests = [
  'Technologie', 'Voyages', 'Cuisine', 'Sport', 'Musique', 'Cinéma', 
  'Lecture', 'Art', 'Mode', 'Écologie', 'Entrepreneuriat', 'Bien-être'
];

const suggestedValues = [
  'Authenticité', 'Innovation', 'Durabilité', 'Qualité', 'Communauté', 
  'Créativité', 'Éthique', 'Excellence', 'Simplicité', 'Diversité'
];

export function BriefForm({ onSubmit, isGenerating }: BriefFormProps) {
  const [formData, setFormData] = useState<BriefFormData>({
    description: '',
    ageRange: '25-35',
    location: '',
    interests: [],
    values: [],
    generateMultiple: false
  });

  const [customInterest, setCustomInterest] = useState('');
  const [customValue, setCustomValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addValue = (value: string) => {
    if (value && !formData.values.includes(value)) {
      setFormData(prev => ({
        ...prev,
        values: [...prev.values, value]
      }));
    }
  };

  const removeValue = (value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter(v => v !== value)
    }));
  };

  const addCustomInterest = () => {
    if (customInterest.trim()) {
      addInterest(customInterest.trim());
      setCustomInterest('');
    }
  };

  const addCustomValue = () => {
    if (customValue.trim()) {
      addValue(customValue.trim());
      setCustomValue('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5 text-indigo-600" />
          <span>Créer un brief persona</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description du projet</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre projet, produit ou service..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageRange">Tranche d'âge</Label>
              <select
                id="ageRange"
                value={formData.ageRange}
                onChange={(e) => setFormData(prev => ({ ...prev, ageRange: e.target.value }))}
                className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="18-25">18-25 ans</option>
                <option value="25-35">25-35 ans</option>
                <option value="35-45">35-45 ans</option>
                <option value="45-55">45-55 ans</option>
                <option value="55-65">55-65 ans</option>
                <option value="65+">65+ ans</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                placeholder="Ex: Paris, France"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Centres d'intérêt</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedInterests.map(interest => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-indigo-100"
                  onClick={() => formData.interests.includes(interest) ? removeInterest(interest) : addInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Ajouter un intérêt personnalisé"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
              />
              <Button type="button" variant="outline" onClick={addCustomInterest}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.interests.map(interest => (
                  <Badge key={interest} variant="default" className="flex items-center space-x-1">
                    <span>{interest}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Valeurs importantes</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedValues.map(value => (
                <Badge
                  key={value}
                  variant={formData.values.includes(value) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-indigo-100"
                  onClick={() => formData.values.includes(value) ? removeValue(value) : addValue(value)}
                >
                  {value}
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Ajouter une valeur personnalisée"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomValue())}
              />
              <Button type="button" variant="outline" onClick={addCustomValue}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.values.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.values.map(value => (
                  <Badge key={value} variant="default" className="flex items-center space-x-1">
                    <span>{value}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeValue(value)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="generateMultiple"
              checked={formData.generateMultiple}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, generateMultiple: checked as boolean }))}
            />
            <Label htmlFor="generateMultiple">
              Générer plusieurs personas (3 variations)
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
            disabled={isGenerating || !formData.description || formData.interests.length === 0}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Générer les personas
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}