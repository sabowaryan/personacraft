'use client';

import { ReactNode } from 'react';

interface OnboardingStepProps {
  title: string;
  description: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingStep({ 
  title, 
  description, 
  children, 
  currentStep, 
  totalSteps 
}: OnboardingStepProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Étape {currentStep} sur {totalSteps}
          </span>
          <span className="text-sm font-medium text-purple-600">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}