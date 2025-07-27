'use client';

import FormField, { SelectField } from '../FormField';
import { OnboardingFormData } from '@/hooks/use-onboarding-form';
import { experienceOptions } from '@/data/onboarding-options';

interface ExperienceStepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string) => void;
}

export default function ExperienceStep({ formData, updateField }: ExperienceStepProps) {
  return (
    <div className="space-y-6">
      <FormField 
        label="Niveau d'expérience avec les personas" 
        required
        description="Cela nous aide à personnaliser votre expérience et nos recommandations"
      >
        <div className="space-y-3">
          {experienceOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                formData.experience === option.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={formData.experience === option.value}
                onChange={(e) => updateField('experience', e.target.value)}
                className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <div className="font-medium text-gray-900">
                  {option.label.split(' - ')[0]}
                </div>
                <div className="text-sm text-gray-600">
                  {option.label.split(' - ')[1]}
                </div>
              </div>
            </label>
          ))}
        </div>
      </FormField>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <h4 className="font-semibold text-gray-900 mb-2">
          🎉 Vous êtes presque prêt !
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Basé sur vos réponses, nous personnaliserons votre tableau de bord et vous proposerons des templates adaptés à votre secteur et vos objectifs.
        </p>
        <div className="flex items-center text-sm text-purple-700">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Configuration personnalisée activée
        </div>
      </div>
    </div>
  );
}