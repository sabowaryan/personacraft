'use client';

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import LogoWithText from "@/components/LogoWithText";
import OnboardingStep from "@/components/onboarding/OnboardingStep";
import OnboardingBenefits from "@/components/onboarding/OnboardingBenefits";
import BasicInfoStep from "@/components/onboarding/steps/BasicInfoStep";
import UseCaseStep from "@/components/onboarding/steps/UseCaseStep";
import ExperienceStep from "@/components/onboarding/steps/ExperienceStep";
import { useOnboardingForm } from "@/hooks/use-onboarding-form";

export default function OnboardingPage() {
  const user = useUser();
  const router = useRouter();
  const {
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
  } = useOnboardingForm();

  // Redirect to signin if user is not authenticated
  if (user === null) {
    router.push('/auth/signin');
    return null;
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep
            title="Parlez-nous de vous"
            description="Ces informations nous aident à personnaliser votre expérience PersonaCraft"
            currentStep={currentStep}
            totalSteps={totalSteps}
          >
            <BasicInfoStep formData={formData} updateField={updateField} />
          </OnboardingStep>
        );
      case 2:
        return (
          <OnboardingStep
            title="Vos objectifs"
            description="Comment comptez-vous utiliser PersonaCraft pour atteindre vos objectifs ?"
            currentStep={currentStep}
            totalSteps={totalSteps}
          >
            <UseCaseStep formData={formData} updateField={updateField} />
          </OnboardingStep>
        );
      case 3:
        return (
          <OnboardingStep
            title="Votre expérience"
            description="Dernière étape ! Dites-nous votre niveau d'expérience avec les personas"
            currentStep={currentStep}
            totalSteps={totalSteps}
          >
            <ExperienceStep formData={formData} updateField={updateField} />
          </OnboardingStep>
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.company && formData.role && formData.industry && formData.teamSize;
      case 2:
        return formData.useCase;
      case 3:
        return formData.experience;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === totalSteps) {
      submitForm();
    } else {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <LogoWithText 
              size="xl" 
              variant="primary" 
              text="PersonaCraft" 
              className="mb-4 justify-center" 
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur PersonaCraft !
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Personnalisez votre expérience pour créer des personas plus précis et adaptés à vos besoins
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {getStepContent()}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={skipOnboarding}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Passer cette étape
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      'Configuration...'
                    ) : currentStep === totalSteps ? (
                      'Commencer avec PersonaCraft'
                    ) : (
                      <>
                        Suivant
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Benefits */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ce qui vous attend
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Templates personnalisés</h4>
                        <p className="text-sm text-gray-600">Basés sur votre secteur d'activité</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Recommandations IA</h4>
                        <p className="text-sm text-gray-600">Adaptées à vos objectifs</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Dashboard optimisé</h4>
                        <p className="text-sm text-gray-600">Interface adaptée à votre usage</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <OnboardingBenefits />
      </div>
    </div>
  );
}

