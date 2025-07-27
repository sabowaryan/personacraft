'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface OnboardingFormData {
  company: string;
  role: string;
  industry: string;
  teamSize: string;
  useCase: string;
  goals: string[];
  experience: string;
}

const initialFormData: OnboardingFormData = {
  company: '',
  role: '',
  industry: '',
  teamSize: '',
  useCase: '',
  goals: [],
  experience: '',
};

export function useOnboardingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;

  const updateField = (field: keyof OnboardingFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'onboarding');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipOnboarding = () => {
    router.push('/dashboard');
  };

  return {
    formData,
    currentStep,
    totalSteps,
    isSubmitting,
    error,
    updateField,
    nextStep,
    prevStep,
    submitForm,
    skipOnboarding,
  };
}