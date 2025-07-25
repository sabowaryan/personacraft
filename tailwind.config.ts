import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        primary: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          DEFAULT: '#14b8a6',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        success: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        error: {
          DEFAULT: '#ef4444',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        warning: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        info: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // PersonaCraft specific colors for redesign
        'persona-primary': {
          DEFAULT: 'oklch(0.65 0.15 260)',
          50: 'oklch(0.95 0.05 260)',
          100: 'oklch(0.90 0.08 260)',
          200: 'oklch(0.85 0.10 260)',
          300: 'oklch(0.80 0.12 260)',
          400: 'oklch(0.75 0.13 260)',
          500: 'oklch(0.65 0.15 260)',
          600: 'oklch(0.55 0.16 260)',
          700: 'oklch(0.45 0.17 260)',
          800: 'oklch(0.35 0.18 260)',
          900: 'oklch(0.25 0.19 260)',
        },
        'persona-secondary': {
          DEFAULT: 'oklch(0.55 0.12 180)',
          50: 'oklch(0.95 0.04 180)',
          100: 'oklch(0.90 0.06 180)',
          200: 'oklch(0.85 0.08 180)',
          300: 'oklch(0.80 0.09 180)',
          400: 'oklch(0.75 0.10 180)',
          500: 'oklch(0.55 0.12 180)',
          600: 'oklch(0.45 0.13 180)',
          700: 'oklch(0.35 0.14 180)',
          800: 'oklch(0.25 0.15 180)',
          900: 'oklch(0.15 0.16 180)',
        },
        'persona-accent': {
          DEFAULT: 'oklch(0.75 0.18 45)',
          50: 'oklch(0.95 0.06 45)',
          100: 'oklch(0.90 0.09 45)',
          200: 'oklch(0.85 0.12 45)',
          300: 'oklch(0.80 0.15 45)',
          400: 'oklch(0.75 0.18 45)',
          500: 'oklch(0.70 0.20 45)',
          600: 'oklch(0.60 0.22 45)',
          700: 'oklch(0.50 0.24 45)',
          800: 'oklch(0.40 0.26 45)',
          900: 'oklch(0.30 0.28 45)',
        },
        // Quality metrics colors
        'quality-excellent': 'oklch(0.65 0.15 140)',
        'quality-good': 'oklch(0.75 0.15 60)',
        'quality-average': 'oklch(0.65 0.18 15)',
        'quality-poor': 'oklch(0.55 0.20 0)',
      },
      spacing: {
        'persona-xs': '0.25rem',
        'persona-sm': '0.5rem',
        'persona-md': '1rem',
        'persona-lg': '1.5rem',
        'persona-xl': '2rem',
        'persona-2xl': '3rem',
        'persona-3xl': '4rem',
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'persona-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'persona-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'persona-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'persona-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        'persona-glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'persona': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        // PersonaCraft specific animations
        'persona-fade-in': 'personaFadeIn var(--animation-duration-normal, 300ms) ease-out',
        'persona-scale-in': 'personaScaleIn var(--animation-duration-normal, 300ms) ease-out',
        'persona-slide-up': 'personaSlideUp var(--animation-duration-normal, 300ms) ease-out',
        'persona-bounce-in': 'personaBounceIn var(--animation-duration-slow, 500ms) cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'persona-float': 'personaFloat 3s ease-in-out infinite',
        'persona-glow': 'personaGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // PersonaCraft specific keyframes
        personaFadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        personaScaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        personaSlideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        personaBounceIn: {
          'from': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        personaFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        personaGlow: {
          'from': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          'to': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)' },
        },
      },
      transitionDuration: {
        'persona-fast': '150ms',
        'persona-normal': '300ms',
        'persona-slow': '500ms',
      },
      transitionTimingFunction: {
        'persona-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;
