'use client';

import FormField, { SelectField } from '../FormField';
import { OnboardingFormData } from '@/hooks/use-onboarding-form';
import { useCaseOptions, goalOptions } from '@/data/onboarding-options';

interface UseCaseStepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string | string[]) => void;
}

export default function UseCaseStep({ formData, updateField }: UseCaseStepProps) {
  const handleGoalToggle = (goalValue: string) => {
    const currentGoals = formData.goals || [];
    const newGoals = currentGoals.includes(goalValue)
      ? currentGoals.filter(g => g !== goalValue)
      : [...currentGoals, goalValue];
    updateField('goals', newGoals);
  };

  return (
    <div className="space-y-6">
      <FormField 
        label="Principal cas d'usage" 
        required
        description="Comment comptez-vous principalement utiliser PersonaCraft ?"
      >
        <SelectField
          value={formData.useCase}
          onChange={(value) => updateField('useCase', value)}
          options={useCaseOptions}
          placeholder="Sélectionnez votre cas d'usage principal"
          required
        />
      </FormField>

      <FormField 
        label="Objectifs spécifiques"
        description="Sélectionnez tous les objectifs qui vous intéressent (optionnel)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goalOptions.map((goal) => (
            <label
              key={goal.value}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                formData.goals?.includes(goal.value)
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.goals?.includes(goal.value) || false}
                onChange={() => handleGoalToggle(goal.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                formData.goals?.includes(goal.value)
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {formData.goals?.includes(goal.value) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{goal.label}</span>
            </label>
          ))}
        </div>
      </FormField>
    </div>
  );
}