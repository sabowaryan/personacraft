import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Users, Calendar, FileText, Mail, Building } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - PersonaCraft',
  description: 'Politique de confidentialité de PersonaCraft, plateforme de génération de personas marketing alimentée par IA.',
  keywords: 'politique de confidentialité, privacy, RGPD, protection des données, personaCraft, IA marketing',
  openGraph: {
    title: 'Politique de Confidentialité - PersonaCraft',
    description: 'Politique de confidentialité de PersonaCraft, plateforme de génération de personas marketing alimentée par IA.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Politique de Confidentialité
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                PersonaCraft
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <Badge variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Dernière mise à jour : 15 janvier 2025
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Conforme RGPD
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Sécurisé
            </Badge>
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="space-y-8">
                {/* Introduction */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Notre Engagement
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    PersonaCraft SAS s'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                    <strong>Date d'effet :</strong> 15 janvier 2025
                  </p>
                </div>

                {/* Data Collection */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Informations que nous collectons
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-4">
                        <Users className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vous fournissez</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Informations de compte</li>
                        <li>• Profil entreprise</li>
                        <li>• Briefs marketing</li>
                        <li>• Contenu généré</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-4">
                        <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collecte automatique</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Données d'utilisation</li>
                        <li>• Informations techniques</li>
                        <li>• Cookies</li>
                        <li>• Métriques de performance</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center mb-4">
                        <Building className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partenaires tiers</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Google Gemini</li>
                        <li>• Qloo Taste AI</li>
                        <li>• Services de paiement</li>
                        <li>• Hébergement</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Usage */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Comment nous utilisons vos informations
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Fourniture du service</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Génération de personas, amélioration de la qualité, support technique</p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Amélioration du service</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Analyse des tendances, développement de fonctionnalités</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Communication</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Notifications, mises à jour, support client</p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Conformité légale</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Obligations légales, protection contre la fraude</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Sharing */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Partage des informations
                  </h2>
                  
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800 mb-6">
                    <div className="flex items-center mb-4">
                      <Shield className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nous ne vendons jamais vos données</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      PersonaCraft ne vend, ne loue et ne monétise jamais vos données personnelles. Vos informations restent confidentielles.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Partenaires de service</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Google Gemini (génération IA)</li>
                        <li>• Qloo Taste AI (analyse comportementale)</li>
                        <li>• Prestataires de paiement</li>
                        <li>• Services d'hébergement</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Obligations légales</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Nous pouvons partager vos informations si requis par la loi ou pour protéger nos droits.
                      </p>
                      <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                        Exceptionnel uniquement
                      </Badge>
                    </div>
                  </div>
                </section>

                {/* Security */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Sécurité des données
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-4">
                        <Lock className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chiffrement</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• HTTPS/TLS en transit</li>
                        <li>• AES-256 au repos</li>
                        <li>• Authentification MFA</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-4">
                        <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Surveillance</h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Accès limité</li>
                        <li>• Audit régulier</li>
                        <li>• Formation obligatoire</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-4">
                        <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Incidents</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Notification dans les 72h en cas de violation de données (RGPD)
                      </p>
                    </div>
                  </div>
                </section>

                {/* User Rights */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">5</span>
                    Vos droits
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Droit d'accès</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Copie de vos données personnelles</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Droit de rectification</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Corriger vos informations</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Droit à l'effacement</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Suppression ("droit à l'oubli")</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Droit à la portabilité</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Export de vos données</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Droit d'opposition</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">S'opposer au traitement</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Droit de limitation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Limiter le traitement</p>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Délégué à la protection des données</h3>
                      <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>privacy@personacraft.com</span>
                        </div>
                        <p>Pour toute question sur cette politique</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Autorité de contrôle</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Vous pouvez également contacter la CNIL (Commission Nationale de l'Informatique et des Libertés).
                      </p>
                      <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                        Protection RGPD
                      </Badge>
                    </div>
                  </div>
                </section>

                {/* Legal Notice */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                  <div className="flex items-start">
                    <span className="text-yellow-600 dark:text-yellow-400 text-2xl mr-3">⚠️</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Note Légale</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Cette politique de confidentialité respecte le RGPD et les lois françaises sur la protection des données. Nous vous recommandons de la lire attentivement.
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