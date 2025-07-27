'use client';

import FormField, { InputField, SelectField } from '../FormField';
import { OnboardingFormData } from '@/hooks/use-onboarding-form';
import { roleOptions, industryOptions, teamSizeOptions } from '@/data/onboarding-options';

interface BasicInfoStepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string) => void;
}

export default function BasicInfoStep({ formData, updateField }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormField 
        label="Entreprise ou organisation" 
        required
        description="Le nom de votre entreprise ou organisation"
      >
        <InputField
          value={formData.company}
          onChange={(value) => updateField('company', value)}
          placeholder="Ex: TechStart, Freelance, Mon Entreprise..."
          required
        />
      </FormField>

      <FormField 
        label="Votre rôle" 
        required
        description="Votre fonction principale dans l'organisation"
      >
        <SelectField
          value={formData.role}
          onChange={(value) => updateField('role', value)}
          options={roleOptions}
          placeholder="Sélectionnez votre rôle"
          required
        />
      </FormField>

      <FormField 
        label="Secteur d'activité" 
        required
        description="Le domaine principal de votre entreprise"
      >
        <SelectField
          value={formData.industry}
          onChange={(value) => updateField('industry', value)}
          options={industryOptions}
          placeholder="Sélectionnez votre secteur"
          required
        />
      </FormField>

      <FormField 
        label="Taille de l'équipe" 
        required
        description="Nombre de personnes dans votre équipe ou entreprise"
      >
        <SelectField
          value={formData.teamSize}
          onChange={(value) => updateField('teamSize', value)}
          options={teamSizeOptions}
          placeholder="Sélectionnez la taille"
          required
        />
      </FormField>
    </div>
  );
}