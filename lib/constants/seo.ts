export const SEO_CONFIG = {
  title: {
    default: 'PersonaCraft - Créez des personas marketing ultra-réalistes avec l\'IA',
    template: '%s | PersonaCraft'
  },
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
    'AI marketing tools',
    'generateur de persona',
    'persona marketing ia',
    'creation persona client',
    'outil marketing personas',
    'analyse comportementale client'
  ],
  author: 'PersonaCraft Team',
  creator: 'PersonaCraft',
  publisher: 'PersonaCraft',
  url: 'https://personacraft.ai',
  image: {
    url: '/og-image.jpg',
    width: 1200,
    height: 630,
    alt: 'PersonaCraft - Générateur de personas marketing IA'
  },
  twitter: {
    handle: '@personacraft',
    site: '@personacraft',
    cardType: 'summary_large_image'
  },
  locale: 'fr_FR',
  type: 'website'
};

export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PersonaCraft',
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.url,
    logo: `${SEO_CONFIG.url}/logo.png`,
    sameAs: [
      'https://twitter.com/personacraft',
      'https://linkedin.com/company/personacraft',
      'https://github.com/personacraft'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-1-23-45-67-89',
      contactType: 'Customer Service',
      areaServed: 'FR',
      availableLanguage: 'French'
    }
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PersonaCraft',
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  },
  software: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PersonaCraft',
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.url,
    applicationCategory: 'Marketing Software',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2847',
      bestRating: '5',
      worstRating: '1'
    },
    featureList: [
      'Génération de personas IA avec Google Gemini',
      'Données culturelles authentiques via Qloo',
      'Export PDF et CSV professionnel',
      'Analytics et métriques avancées',
      'Intégration CRM et API',
      'Support client 24/7'
    ],
    screenshot: `${SEO_CONFIG.url}/screenshot.jpg`,
    softwareVersion: '2.0.0',
    datePublished: '2024-01-15',
    dateModified: new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'PersonaCraft',
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONFIG.url}/logo.png`
      }
    }
  },
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment PersonaCraft génère-t-il des personas ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PersonaCraft utilise Google Gemini et Qloo Taste AI pour analyser votre brief marketing et générer des personas authentiques basés sur de vraies données comportementales et culturelles.'
        }
      },
      {
        '@type': 'Question',
        name: 'Combien de temps faut-il pour générer un persona ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'En moyenne, PersonaCraft génère un persona complet et détaillé en 60 secondes, du brief initial à l\'export final.'
        }
      },
      {
        '@type': 'Question',
        name: 'Quels formats d\'export sont disponibles ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PersonaCraft propose l\'export en PDF haute qualité, CSV pour intégration CRM, et JSON pour les développeurs.'
        }
      },
      {
        '@type': 'Question',
        name: 'PersonaCraft est-il gratuit ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, PersonaCraft offre un plan gratuit avec 3 personas par mois. Des plans payants sont disponibles pour des besoins plus importants.'
        }
      }
    ]
  }
};

export const ROBOTS_CONFIG = {
  index: true,
  follow: true,
  nocache: false,
  googleBot: {
    index: true,
    follow: true,
    noimageindex: false,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1
  }
}; 