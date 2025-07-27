'use client';

import { useUser } from '@stackframe/stack';

export interface OnboardingData {
  company: string;
  role: string;
  industry: string;
  teamSize: string;
  useCase: string;
  onboardedAt?: string;
}

export function useOnboardingData() {
  const user = useUser();
  
  const onboardingData = user?.clientReadOnlyMetadata as OnboardingData | undefined;
  
  const getPersonalizationContext = () => {
    if (!onboardingData) return '';
    
    const contexts = [];
    
    // Contexte basé sur le rôle
    const roleContexts = {
      'marketing-manager': 'en tant que directeur marketing expérimenté',
      'growth-hacker': 'avec une approche growth hacking',
      'product-manager': 'du point de vue d\'un chef de produit',
      'consultant': 'avec l\'expertise d\'un consultant marketing',
      'entrepreneur': 'avec la vision d\'un entrepreneur',
      'freelancer': 'avec l\'agilité d\'un freelance',
      'other': 'avec votre expertise unique'
    };
    
    // Contexte basé sur l'industrie
    const industryContexts = {
      'tech': 'dans le secteur technologique',
      'ecommerce': 'dans l\'e-commerce',
      'saas': 'dans l\'univers SaaS',
      'fashion': 'dans l\'industrie de la mode',
      'health': 'dans le domaine de la santé',
      'finance': 'dans le secteur financier',
      'education': 'dans l\'éducation',
      'consulting': 'dans le conseil',
      'other': 'dans votre secteur d\'activité'
    };
    
    // Contexte basé sur la taille d'équipe
    const teamSizeContexts = {
      'solo': 'en tant qu\'entrepreneur solo',
      'small': 'avec une petite équipe agile',
      'medium': 'avec une équipe de taille moyenne',
      'large': 'avec une grande équipe',
      'enterprise': 'dans un environnement d\'entreprise'
    };
    
    if (onboardingData.role && roleContexts[onboardingData.role as keyof typeof roleContexts]) {
      contexts.push(roleContexts[onboardingData.role as keyof typeof roleContexts]);
    }
    
    if (onboardingData.industry && industryContexts[onboardingData.industry as keyof typeof industryContexts]) {
      contexts.push(industryContexts[onboardingData.industry as keyof typeof industryContexts]);
    }
    
    if (onboardingData.teamSize && teamSizeContexts[onboardingData.teamSize as keyof typeof teamSizeContexts]) {
      contexts.push(teamSizeContexts[onboardingData.teamSize as keyof typeof teamSizeContexts]);
    }
    
    return contexts.join(', ');
  };
  
  const getRecommendedTemplates = () => {
    if (!onboardingData) return [];
    
    const templates = [];
    
    // Recommandations basées sur le cas d'usage
    switch (onboardingData.useCase) {
      case 'campaign-planning':
        templates.push('persona-marketing-campaign', 'persona-b2b');
        break;
      case 'content-strategy':
        templates.push('persona-content-creator', 'persona-social-media');
        break;
      case 'product-development':
        templates.push('persona-user-research', 'persona-b2b');
        break;
      case 'market-research':
        templates.push('persona-market-analysis', 'persona-competitor');
        break;
      case 'client-work':
        templates.push('persona-b2b', 'persona-consulting');
        break;
      default:
        templates.push('persona-simple');
    }
    
    return templates;
  };
  
  return {
    onboardingData,
    isOnboarded: !!onboardingData?.onboardedAt,
    getPersonalizationContext,
    getRecommendedTemplates,
  };
}