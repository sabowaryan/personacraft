import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Shield, BarChart3, Settings, Target, Lock, Eye, AlertTriangle, CheckCircle, Clock, Download, Edit, Trash2, Ban, Database, Calendar, Building, Globe, Mail, ExternalLink, Info } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Politique de Cookies - PersonaCraft',
  description: 'Politique de gestion des cookies et technologies similaires sur PersonaCraft, plateforme de génération de personas marketing.',
  keywords: 'cookies, politique cookies, gestion cookies, RGPD, ePrivacy, personaCraft',
  openGraph: {
    title: 'Politique de Cookies - PersonaCraft',
    description: 'Politique de gestion des cookies et technologies similaires sur PersonaCraft, plateforme de génération de personas marketing.',
    type: 'website',
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mr-4">
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Politique de Cookies
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                PersonaCraft
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <Badge variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Mise à jour : 15 janvier 2025
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Conforme RGPD
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              ePrivacy
            </Badge>
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="space-y-8">
                {/* Introduction */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Notre Engagement Transparent
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Cette Politique de Cookies explique comment PersonaCraft SAS utilise les cookies et technologies similaires sur notre plateforme. Elle vous informe de vos choix concernant ces technologies.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Responsable : PersonaCraft SAS</span>
                    </div>
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conforme RGPD et ePrivacy</span>
                    </div>
                  </div>
                </div>

                {/* Qu'est-ce qu'un Cookie */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Qu'est-ce qu'un Cookie ?
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-4">
                        <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Définition</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez un site web.
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Il permet au site de mémoriser vos actions et préférences.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-4">
                        <Settings className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fonctionnement</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Stockage local dans votre navigateur</li>
                        <li>• Transmission automatique à chaque visite</li>
                        <li>• Durée de vie variable selon le type</li>
                        <li>• Taille limitée (moins de 4 Ko)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Types de Cookies */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Types de Cookies Utilisés
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                        <div className="flex items-center mb-4">
                          <Shield className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Essentiels</h3>
                          <Badge variant="outline" className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            Obligatoires
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Fonctionnement technique du site
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>• Authentification et sécurité</li>
                          <li>• Préférences de langue</li>
                          <li>• Protection CSRF</li>
                        </ul>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-3">
                          Impossible de désactiver
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center mb-4">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytiques</h3>
                          <Badge variant="outline" className="ml-auto bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Consentement
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Mesurer l'audience et améliorer le service
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>• Nombre de visiteurs</li>
                          <li>• Pages les plus visitées</li>
                          <li>• Temps passé sur le site</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <div className="flex items-center mb-4">
                          <Settings className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Préférences</h3>
                          <Badge variant="outline" className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            Consentement
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Personnaliser votre expérience
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>• Thème (clair/sombre)</li>
                          <li>• Préférences d'affichage</li>
                          <li>• Historique des personas</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center mb-4">
                          <Target className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketing</h3>
                          <Badge variant="outline" className="ml-auto bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            Consentement
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Publicité personnalisée et remarketing
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>• Publicités ciblées</li>
                          <li>• Remarketing</li>
                          <li>• A/B testing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Cookies Tiers */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Cookies Tiers
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-4">
                        <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Analytics</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Analyse d'audience et statistiques
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-2" />
                          <span>Pages visitées, temps de session</span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-2" />
                          <span>IP anonymisée</span>
                        </div>
                      </div>
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-3 hover:underline">
                        Politique de confidentialité
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-4">
                        <Target className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Ads</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Publicité et remarketing
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center">
                          <Target className="h-3 w-3 mr-2" />
                          <span>Publicités ciblées</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-3 w-3 mr-2" />
                          <span>Mesure de conversion</span>
                        </div>
                      </div>
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-3 hover:underline">
                        Politique de confidentialité
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-4">
                        <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Facebook Pixel</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Publicité et analytics
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center">
                          <Target className="h-3 w-3 mr-2" />
                          <span>Audiences personnalisées</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-3 w-3 mr-2" />
                          <span>Données de conversion</span>
                        </div>
                      </div>
                      <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-3 hover:underline">
                        Politique de confidentialité
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-4">
                        <Lock className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stripe</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Paiements sécurisés
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-2" />
                          <span>Sécurité des paiements</span>
                        </div>
                        <div className="flex items-center">
                          <Database className="h-3 w-3 mr-2" />
                          <span>Données de transaction</span>
                        </div>
                      </div>
                      <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-3 hover:underline">
                        Politique de confidentialité
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </section>

                {/* Gestion des Cookies */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Gestion des Cookies
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consentement</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Libre et éclairé</li>
                        <li>• Bannière interactive</li>
                        <li>• Preuve conservée 5 ans</li>
                        <li>• Retirable à tout moment</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-4">
                        <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestionnaire</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Activation/désactivation</li>
                        <li>• Détails par cookie</li>
                        <li>• Modification préférences</li>
                        <li>• Suppression cookies</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-4">
                        <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Navigateur</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Chrome, Firefox, Safari</li>
                        <li>• Paramètres de confidentialité</li>
                        <li>• Désactivation globale</li>
                        <li>• Suppression manuelle</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Impact de la Désactivation */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">5</span>
                    Impact de la Désactivation
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Cookies Essentiels</h4>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Service non fonctionnel - Ne pas désactiver
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Cookies Analytiques</h4>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Pas de statistiques d'usage
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Cookies de Préférence</h4>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Perte des personnalisations
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Cookies Marketing</h4>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Publicités non personnalisées
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vos Droits */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">6</span>
                    Vos Droits
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-3">
                        <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Droit de Retrait</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Modifier vos préférences à tout moment
                      </p>
                      <Badge variant="outline" className="text-xs">Via gestionnaire</Badge>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-3">
                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Droit d'Accès</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Obtenir la liste de vos cookies
                      </p>
                      <Badge variant="outline" className="text-xs">1 mois max</Badge>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-3">
                        <Ban className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Droit d'Opposition</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Vous opposer au traitement
                      </p>
                      <Badge variant="outline" className="text-xs">Via navigateur</Badge>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-8 border border-orange-200 dark:border-orange-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Questions sur les Cookies</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Direct</h3>
                      <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>privacy@personacraft.com</span>
                        </div>
                        <p className="text-sm">Pour toute question sur les cookies</p>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                          Réponse sous 48h
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Autorité de Contrôle</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Vous pouvez saisir la CNIL en cas de non-respect.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <span>www.cnil.fr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Note Légale */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                  <div className="flex items-start">
                    <span className="text-yellow-600 dark:text-yellow-400 text-2xl mr-3">⚠️</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Note Légale</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Cette politique de cookies respecte le RGPD et la directive ePrivacy. Les cookies essentiels ne peuvent pas être désactivés car ils sont nécessaires au fonctionnement du service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 