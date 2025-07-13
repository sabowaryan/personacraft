'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart,
  ArrowUp,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const productLinks = [
  { name: 'Générateur', href: '/generator', description: 'Créer des personas' },
  { name: 'Templates', href: '/templates', description: 'Modèles prêts à l\'emploi' },
  { name: 'Analytics', href: '/analytics', description: 'Analyses avancées' },
  { name: 'API', href: '/api-docs', description: 'Documentation API' }
];

const supportLinks = [
  { name: 'Centre d\'aide', href: '/help', description: 'Support & FAQ' },
  { name: 'Contact', href: '/contact', description: 'Nous contacter' },
  { name: 'Communauté', href: '/community', description: 'Rejoindre la communauté' },
  { name: 'Status', href: '/status', description: 'État du service' }
];

const legalLinks = [
  { name: 'Confidentialité', href: '/privacy' },
  { name: 'Conditions', href: '/terms' },
  { name: 'Cookies', href: '/cookies' },
  { name: 'RGPD', href: '/gdpr' }
];

const socialLinks = [
  { 
    name: 'GitHub', 
    href: 'https://github.com', 
    icon: Github, 
    color: 'hover:text-gray-900 dark:hover:text-white' 
  },
  { 
    name: 'Twitter', 
    href: 'https://twitter.com', 
    icon: Twitter, 
    color: 'hover:text-blue-400' 
  },
  { 
    name: 'LinkedIn', 
    href: 'https://linkedin.com', 
    icon: Linkedin, 
    color: 'hover:text-blue-600' 
  },
  { 
    name: 'Email', 
    href: 'mailto:contact@personacraft.com', 
    icon: Mail, 
    color: 'hover:text-primary-400' 
  }
];

const companyInfo = [
  { 
    icon: MapPin, 
    text: 'Paris, France', 
    subtext: 'Siège social' 
  },
  { 
    icon: Phone, 
    text: '+33 1 23 45 67 89', 
    subtext: 'Support' 
  },
  { 
    icon: Clock, 
    text: '9h - 18h CET', 
    subtext: 'Lun - Ven' 
  }
];

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {/* Bouton retour en haut - Position responsive */}
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 transition-all duration-300 ${showBackToTop ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <Button
          onClick={scrollToTop}
          size="sm"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 touch-manipulation"
          aria-label="Retourner en haut"
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section principale - Mobile: stack vertical, Desktop: grid */}
        <div className="py-8 sm:py-12 lg:py-16">
          
          {/* Branding & Description - Toujours en premier sur mobile */}
          <div className="mb-8 sm:mb-12 lg:mb-0">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left lg:max-w-md">
              <Link 
                href="/" 
                className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105 mb-4 sm:mb-6"
              >
              <div className="relative">
                  <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400 transition-colors duration-200" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-secondary-500 dark:bg-secondary-400 rounded-full animate-pulse"></div>
              </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                PersonaCraft
              </span>
            </Link>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 max-w-sm sm:max-w-md">
              Créez des personas marketing authentiques et détaillés grâce à l'intelligence artificielle. 
              Transformez vos stratégies marketing avec des insights précis et personnalisés.
            </p>

              {/* Réseaux sociaux - Visibles sur mobile */}
              <div className="flex space-x-3 sm:space-x-4 mb-6 lg:mb-0">
                {socialLinks.map((social) => (
              <a 
                    key={social.name}
                    href={social.href}
                target="_blank" 
                rel="noopener noreferrer"
                    className={`p-2.5 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-200 hover:scale-110 hover:shadow-lg touch-manipulation`}
                    onMouseEnter={() => setHoveredLink(social.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Grille responsive pour les sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
            
            {/* Informations de contact - Cachées sur mobile, visibles à partir de lg */}
            <div className="hidden lg:block xl:col-span-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Nous contacter
              </h3>
              <div className="space-y-3">
                {companyInfo.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <item.icon className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">{item.text}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 hidden xl:inline">{item.subtext}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Produit - Collapsible sur mobile */}
            <div className="lg:col-span-1">
              <button
                onClick={() => toggleSection('product')}
                className="flex items-center justify-between w-full text-left lg:cursor-default"
                aria-expanded={expandedSection === 'product'}
              >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Produit
                </h3>
                <ChevronDown className={`h-4 w-4 lg:hidden transition-transform duration-200 ${expandedSection === 'product' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`mt-4 space-y-3 lg:block ${expandedSection === 'product' ? 'block' : 'hidden lg:block'}`}>
                {productLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group block py-1 lg:py-0 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 touch-manipulation"
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{link.name}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block lg:hidden xl:block">
                          {link.description}
                        </p>
                      </div>
                      <ExternalLink className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${hoveredLink === link.name ? 'text-primary-600 dark:text-primary-400' : ''} hidden sm:block`} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section Support - Collapsible sur mobile */}
            <div className="lg:col-span-1">
              <button
                onClick={() => toggleSection('support')}
                className="flex items-center justify-between w-full text-left lg:cursor-default"
                aria-expanded={expandedSection === 'support'}
              >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Support
                </h3>
                <ChevronDown className={`h-4 w-4 lg:hidden transition-transform duration-200 ${expandedSection === 'support' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`mt-4 space-y-3 lg:block ${expandedSection === 'support' ? 'block' : 'hidden lg:block'}`}>
                {supportLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group block py-1 lg:py-0 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 touch-manipulation"
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{link.name}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block lg:hidden xl:block">
                          {link.description}
                        </p>
                      </div>
                      <ExternalLink className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${hoveredLink === link.name ? 'text-primary-600 dark:text-primary-400' : ''} hidden sm:block`} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter - Prend toute la largeur sur mobile */}
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
              <button
                onClick={() => toggleSection('newsletter')}
                className="flex items-center justify-between w-full text-left lg:cursor-default"
                aria-expanded={expandedSection === 'newsletter'}
              >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Newsletter
                </h3>
                <ChevronDown className={`h-4 w-4 lg:hidden transition-transform duration-200 ${expandedSection === 'newsletter' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`mt-4 lg:block ${expandedSection === 'newsletter' ? 'block' : 'hidden lg:block'}`}>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Restez informé des dernières nouveautés et fonctionnalités.
                </p>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <input
                      type="email"
                      placeholder="Votre email"
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                    />
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 text-white transition-all duration-200 hover:scale-[1.02] touch-manipulation"
                    >
                      S'abonner
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link href="/terms" className="underline hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      conditions d'utilisation
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de contact - Visibles sur mobile */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Nous contacter
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {companyInfo.map((item, index) => (
                <div key={index} className="flex items-center justify-center sm:justify-start space-x-3 text-sm">
                  <item.icon className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <div className="text-center sm:text-left">
                    <div className="text-gray-900 dark:text-white font-medium">{item.text}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">{item.subtext}</div>
                  </div>
                </div>
              ))}
          </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Footer bottom - Stack sur mobile */}
        <div className="py-6 sm:py-8">
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            
            {/* Copyright - Centré sur mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-1 sm:space-y-0 sm:space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <span>© 2025 PersonaCraft. Tous droits réservés.</span>
                <Heart className="h-3 w-3 text-red-500 animate-pulse" />
              </div>
              <span className="hidden sm:inline">Fait avec amour à Paris</span>
            </div>

            {/* Liens légaux - Grid sur mobile */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 justify-center">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 touch-manipulation py-1"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mentions techniques - Centré sur mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end space-y-1 sm:space-y-0 sm:space-x-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Propulsé par</span>
            <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400">
                  Qloo AI
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400">
                  Google Gemini
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}