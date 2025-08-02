/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    QLOO_API_KEY: process.env.QLOO_API_KEY,
    QLOO_API_URL: process.env.QLOO_API_URL,
  },
  
  // ✅ Optimisations critiques pour Next.js 15
  experimental: {
    webpackMemoryOptimizations: true, // Nouveau dans Next.js 15
    optimizePackageImports: ['@google/generative-ai','@stackframe/stack'], // Optimise Gemini seulement
  },

  webpack: (config, { isServer }) => {
    // Polyfill global pour 'self' côté serveur
    if (isServer) {
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'self': 'globalThis',
          'window': 'globalThis',
        })
      );
    }
    return config;
  },
  
  
  // ✅ Configuration Turbopack (stable dans Next.js 15)
  turbopack: {
    rules: {
      '*.template': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  
  // ✅ Augmenter les timeouts pour éviter les builds qui traînent
  staticPageGenerationTimeout: 300, // 5 minutes au lieu de 60 secondes
  
  // ✅ Désactiver les vérifications coûteuses durant le build
  eslint: {
    ignoreDuringBuilds: true, // Critique pour accélérer le build
  },
  
  // ✅ Configuration TypeScript optimisée
  typescript: {
    ignoreBuildErrors: false, // Gardez false pour la production
  },
  webpack: (config, { dev, isServer }) => {
    // ✅ Optimisation mémoire critique pour Next.js 15
    if (!dev) {
      // Optimisation de cache pour les builds de production
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // ✅ Améliorer la stabilité du HMR
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    
    // ✅ Fix for StackAuth "self is not defined" error
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
      };
    }

    // ✅ Optimisation pour les builds Next.js 15
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // ✅ Séparer Stack Auth dans son propre chunk
            stackauth: {
              test: /[\\/]node_modules[\\/]@stackframe[\\/]/,
              name: 'stackauth',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            prompts: {
              test: /[\\/](prompts|validators)[\\/]/,
              name: 'prompts-validators',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            templates: {
              test: /\.template$/,
              name: 'templates',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            default: {
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Handle template files
    config.module.rules.push({
      test: /\.template$/,
      type: 'asset/source',
    })

    return config
  },
}

module.exports = nextConfig



