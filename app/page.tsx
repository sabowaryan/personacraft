import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { CTASection } from '@/components/landing/cta-section';

export const metadata: Metadata = {
  title: 'PersonaCraft - Créez des personas marketing ultra-réalistes avec l\'IA',
  description: 'Générez des personas marketing authentiques en 60 secondes avec Google Gemini et Qloo Taste AI. Données culturelles réelles, export PDF/CSV, +47% de conversion.',
  keywords: [
    'persona marketing',
    'générateur persona',
    'intelligence artificielle marketing',
    'Gemini AI',
    'Qloo Taste AI',
    'personas clients',
    'marketing automation',
    'données culturelles',
    'psychographie',
    'segmentation client',
    'marketing data',
    'conversion optimization',
    'customer insights',
    'marketing personas',
    'AI marketing tools'
  ],
  authors: [{ name: 'PersonaCraft Team' }],
  creator: 'PersonaCraft',
  publisher: 'PersonaCraft',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://personacraft.ai'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://personacraft.ai',
    siteName: 'PersonaCraft',
    title: 'PersonaCraft - Créez des personas marketing ultra-réalistes avec l\'IA',
    description: 'Générez des personas marketing authentiques en 60 secondes avec Google Gemini et Qloo Taste AI. Données culturelles réelles, export PDF/CSV.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PersonaCraft - Générateur de personas marketing IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PersonaCraft - Créez des personas marketing ultra-réalistes avec l\'IA',
    description: 'Générez des personas marketing authentiques en 60 secondes avec Google Gemini et Qloo Taste AI.',
    creator: '@personacraft',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PersonaCraft',
  description: 'Générateur de personas marketing alimenté par l\'IA avec données culturelles authentiques',
  url: 'https://personacraft.ai',
  applicationCategory: 'Marketing Software',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '2847',
    bestRating: '5',
    worstRating: '1',
  },
  provider: {
    '@type': 'Organization',
    name: 'PersonaCraft',
    url: 'https://personacraft.ai',
  },
  featureList: [
    'Génération de personas IA',
    'Données culturelles Qloo',
    'Export PDF/CSV',
    'Analytics avancés',
    'Intégration CRM',
    'Support 24/7',
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section - Above the fold */}
          <HeroSection />
          
          {/* Features Section - Core value proposition */}
          <FeaturesSection />
          
          {/* How It Works - Process explanation */}
          <HowItWorksSection />
          
          {/* Testimonials - Social proof */}
          <TestimonialsSection />
          
          {/* Pricing - Conversion focused */}
          <PricingSection />
          
          {/* Final CTA - Last chance conversion */}
          <CTASection />
        </main>
        
        <Footer />
      </div>
    </>
  );
}