// Configuration globale de l'application PersonaCraft

export const APP_CONFIG = {
  // Informations de l'application
  APP_NAME: 'PersonaCraft',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Générateur de personas marketing alimenté par l\'IA',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Métadonnées
  AUTHOR: 'PersonaCraft Team',
  KEYWORDS: ['persona', 'marketing', 'AI', 'Qloo', 'Gemini', 'customer insights'],
  
  // Limites de l'application
  LIMITS: {
    MAX_PERSONAS_PER_SESSION: 10,
    MAX_INTERESTS_PER_PERSONA: 15,
    MAX_VALUES_PER_PERSONA: 10,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_EXPORT_BATCH_SIZE: 50,
    MAX_FILE_SIZE_MB: 10
  },
  
  // Paramètres par défaut
  DEFAULTS: {
    AGE_RANGE: '25-35',
    LOCATION: 'France',
    GENERATION_COUNT: 1,
    EXPORT_FORMAT: 'pdf' as const,
    LANGUAGE: 'fr' as const
  }
};

// Configuration des APIs externes
export const API_CONFIG = {
  // Qloo API
  QLOO: {
    BASE_URL: process.env.QLOO_API_URL || 'https://api.qloo.com/v1',
    API_KEY: process.env.QLOO_API_KEY || '',
    TIMEOUT: 30000,
    RETRIES: 3,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 60,
      REQUESTS_PER_HOUR: 1000,
      REQUESTS_PER_DAY: 10000
    },
    DEFAULT_PARAMS: {
      maxResults: 20,
      minConfidence: 0.6,
      includeAttributes: true,
      language: 'fr'
    }
  },
  
  // Gemini API
  GEMINI: {
    BASE_URL: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1',
    API_KEY: process.env.GEMINI_API_KEY || '',
    MODEL: 'gemini-pro',
    TIMEOUT: 60000,
    RETRIES: 2,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 60,
      REQUESTS_PER_HOUR: 1000,
      TOKENS_PER_MINUTE: 32000
    },
    DEFAULT_PARAMS: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.8,
      topK: 40,
      format: 'json' as const
    }
  }
};

// Configuration de la base de données (si utilisée)
export const DATABASE_CONFIG = {
  // Vercel KV (Redis)
  KV: {
    URL: process.env.VERCEL_KV_URL || '',
    REST_API_URL: process.env.VERCEL_KV_REST_API_URL || '',
    REST_API_TOKEN: process.env.VERCEL_KV_REST_API_TOKEN || '',
    TTL: {
      PERSONA: 7 * 24 * 60 * 60, // 7 jours
      SESSION: 24 * 60 * 60, // 24 heures
      CACHE: 60 * 60 // 1 heure
    }
  },
  
  // PostgreSQL (si utilisé)
  POSTGRES: {
    URL: process.env.DATABASE_URL || '',
    MAX_CONNECTIONS: 10,
    IDLE_TIMEOUT: 30000,
    CONNECTION_TIMEOUT: 60000
  }
};

// Configuration de l'export
export const EXPORT_CONFIG = {
  PDF: {
    FORMAT: 'a4' as const,
    ORIENTATION: 'portrait' as const,
    MARGIN: 20,
    FONT_SIZE: {
      TITLE: 24,
      SECTION: 14,
      BODY: 10,
      SMALL: 9
    },
    COLORS: {
      PRIMARY: '#6366F1',
      SECONDARY: '#14B8A6',
      TEXT: '#000000',
      GRAY: '#808080'
    }
  },
  
  CSV: {
    DELIMITER: ',',
    ENCODING: 'utf-8',
    INCLUDE_HEADERS: true,
    INCLUDE_METADATA: true,
    FLATTEN_ARRAYS: true,
    DATE_FORMAT: 'locale' as const
  }
};

// Configuration du cache
export const CACHE_CONFIG = {
  ENABLED: process.env.NODE_ENV === 'production',
  TTL: {
    QLOO_RESPONSE: 60 * 60, // 1 heure
    GEMINI_RESPONSE: 30 * 60, // 30 minutes
    PERSONA_DATA: 24 * 60 * 60, // 24 heures
    STATIC_DATA: 7 * 24 * 60 * 60 // 7 jours
  },
  KEYS: {
    QLOO_PREFIX: 'qloo:',
    GEMINI_PREFIX: 'gemini:',
    PERSONA_PREFIX: 'persona:',
    SESSION_PREFIX: 'session:'
  }
};

// Configuration de la sécurité
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    SKIP_SUCCESSFUL_REQUESTS: false,
    SKIP_FAILED_REQUESTS: false
  },
  
  // CORS
  CORS: {
    ORIGIN: process.env.NODE_ENV === 'production' 
      ? [APP_CONFIG.APP_URL] 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
    CREDENTIALS: true
  },
  
  // Validation
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_ARRAY_LENGTH: 50,
    ALLOWED_FILE_TYPES: ['application/pdf', 'text/csv', 'application/json'],
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024 // 10MB
  }
};

// Configuration des fonctionnalités
export const FEATURES_CONFIG = {
  // Fonctionnalités activées/désactivées
  ENABLED: {
    MULTIPLE_PERSONAS: true,
    PDF_EXPORT: true,
    CSV_EXPORT: true,
    SOCIAL_SHARING: true,
    ANALYTICS: true,
    CACHING: process.env.NODE_ENV === 'production',
    ERROR_TRACKING: process.env.NODE_ENV === 'production',
    PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production'
  },
  
  // Fonctionnalités expérimentales
  EXPERIMENTAL: {
    BATCH_GENERATION: false,
    REAL_TIME_COLLABORATION: false,
    ADVANCED_ANALYTICS: false,
    CUSTOM_TEMPLATES: false
  }
};

// Configuration de l'interface utilisateur
export const UI_CONFIG = {
  // Thème
  THEME: {
    PRIMARY_COLOR: '#6366F1',
    SECONDARY_COLOR: '#14B8A6',
    ACCENT_COLOR: '#F59E0B',
    SUCCESS_COLOR: '#10B981',
    WARNING_COLOR: '#F59E0B',
    ERROR_COLOR: '#EF4444',
    GRAY_COLOR: '#6B7280'
  },
  
  // Animations
  ANIMATIONS: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Breakpoints
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  },
  
  // Paramètres d'affichage
  DISPLAY: {
    PERSONAS_PER_PAGE: 6,
    MAX_VISIBLE_INTERESTS: 5,
    MAX_VISIBLE_VALUES: 4,
    TRUNCATE_LENGTH: 150
  }
};

// Configuration des analytics
export const ANALYTICS_CONFIG = {
  // Google Analytics
  GA: {
    MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    ENABLED: process.env.NODE_ENV === 'production'
  },
  
  // Vercel Analytics
  VERCEL: {
    ENABLED: process.env.NODE_ENV === 'production'
  },
  
  // Événements trackés
  EVENTS: {
    PERSONA_GENERATED: 'persona_generated',
    PERSONA_EXPORTED: 'persona_exported',
    PERSONA_SHARED: 'persona_shared',
    ERROR_OCCURRED: 'error_occurred',
    PAGE_VIEW: 'page_view'
  }
};

// Configuration de l'environnement
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // URLs
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // Flags de fonctionnalités
  FEATURE_FLAGS: {
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
    ENABLE_ERROR_TRACKING: process.env.ENABLE_ERROR_TRACKING === 'true',
    ENABLE_CACHING: process.env.ENABLE_CACHING === 'true',
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING === 'true'
  }
};

// Configuration des logs
export const LOGGING_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLED: {
    CONSOLE: true,
    FILE: process.env.NODE_ENV === 'production',
    EXTERNAL: process.env.NODE_ENV === 'production'
  },
  
  // Formats
  FORMAT: {
    TIMESTAMP: true,
    LEVEL: true,
    MESSAGE: true,
    METADATA: true
  }
};

// Export de la configuration complète
export const CONFIG = {
  APP: APP_CONFIG,
  API: API_CONFIG,
  DATABASE: DATABASE_CONFIG,
  EXPORT: EXPORT_CONFIG,
  CACHE: CACHE_CONFIG,
  SECURITY: SECURITY_CONFIG,
  FEATURES: FEATURES_CONFIG,
  UI: UI_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  ENV: ENV_CONFIG,
  LOGGING: LOGGING_CONFIG
} as const;

// Type pour la configuration
export type AppConfig = typeof CONFIG;