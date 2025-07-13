// Design tokens pour PersonaCraft
// Standardisation de l'espacement, couleurs et tailles

export const spacing = {
  xs: 'gap-2',
  sm: 'gap-3', 
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12'
} as const;

export const padding = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12'
} as const;

export const margin = {
  xs: 'm-2',
  sm: 'm-3',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8',
  '2xl': 'm-12'
} as const;

export const borderRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl'
} as const;

export const shadows = {
  sm: 'shadow-md',
  md: 'shadow-lg',
  lg: 'shadow-xl',
  xl: 'shadow-2xl'
} as const;

export const colors = {
  primary: {
    50: 'primary-50',
    100: 'primary-100',
    500: 'primary-500',
    600: 'primary-600',
    700: 'primary-700',
    900: 'primary-900'
  },
  secondary: {
    50: 'secondary-50',
    100: 'secondary-100',
    500: 'secondary-500',
    600: 'secondary-600',
    700: 'secondary-700',
    900: 'secondary-900'
  },
  success: {
    50: 'green-50',
    100: 'green-100',
    500: 'green-500',
    600: 'green-600',
    700: 'green-700',
    900: 'green-900'
  },
  warning: {
    50: 'yellow-50',
    100: 'yellow-100',
    500: 'yellow-500',
    600: 'yellow-600',
    700: 'yellow-700',
    900: 'yellow-900'
  },
  danger: {
    50: 'red-50',
    100: 'red-100',
    500: 'red-500',
    600: 'red-600',
    700: 'red-700',
    900: 'red-900'
  }
} as const;

export const transitions = {
  fast: 'transition-all duration-200',
  normal: 'transition-all duration-300',
  slow: 'transition-all duration-500'
} as const;

export const animations = {
  fadeIn: 'animate-in fade-in',
  slideInFromBottom: 'animate-in slide-in-from-bottom-4',
  slideInFromTop: 'animate-in slide-in-from-top-4',
  slideInFromLeft: 'animate-in slide-in-from-left-4',
  scaleIn: 'animate-in scale-in'
} as const;

// Utilitaires pour combiner les tokens
export const getSpacing = (size: keyof typeof spacing) => spacing[size];
export const getPadding = (size: keyof typeof padding) => padding[size];
export const getMargin = (size: keyof typeof margin) => margin[size];
export const getBorderRadius = (size: keyof typeof borderRadius) => borderRadius[size];
export const getShadow = (size: keyof typeof shadows) => shadows[size];
export const getTransition = (speed: keyof typeof transitions) => transitions[speed]; 