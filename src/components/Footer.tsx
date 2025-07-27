import Link from 'next/link';
import LogoWithText from './LogoWithText';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-300 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <LogoWithText 
                text="PersonaCraft" 
                size="md" 
                variant="primary"
              />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm max-w-md">
              Révolutionnez votre marketing avec l'IA ! Générez des personas marketing 
              authentiques en combinant Google Gemini et Qloo Taste AI™.
            </p>
            <div className="mt-4 flex space-x-4 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Google Gemini
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                Qloo Taste AI™
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-950 dark:text-white mb-4 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white text-sm transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white text-sm transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/features" 
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white text-sm transition-colors"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link 
                  href="/docs" 
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white text-sm transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-950 dark:text-white mb-4 uppercase tracking-wider">
              Ressources
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <a 
                  href="https://github.com/sabowaryan/personacraft-nextjs" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-950 dark:hover:text-white transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </li>
              <li>
                <Link 
                  href="/api-docs" 
                  className="hover:text-gray-950 dark:hover:text-white transition-colors"
                >
                  API Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="/changelog" 
                  className="hover:text-gray-950 dark:hover:text-white transition-colors"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <Link 
                  href="/support" 
                  className="hover:text-gray-950 dark:hover:text-white transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center text-sm text-gray-700 dark:text-gray-300">
              <p>© {new Date().getFullYear()} PersonaCraft. Tous droits réservés.</p>
              <span className="hidden sm:inline mx-2">•</span>
              <p className="mt-1 sm:mt-0">
                Propulsé par 
                <span className="text-sky-400 font-medium"> Google Gemini</span> & 
                <span className="text-sky-400 font-medium"> Qloo Taste AI™</span>
              </p>
            </div>
            
            {/* Liens sociaux */}
            <div className="flex space-x-3 mt-4 md:mt-0">
                <a 
                  href="https://github.com/sabowaryan/personacraft-nextjs" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-sky-400 transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com/personacraft" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-sky-400 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}