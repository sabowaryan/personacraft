import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Shield, Scale } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Conditions d\'Utilisation - PersonaCraft',
  description: 'Conditions d\'utilisation de PersonaCraft, plateforme de génération de personas marketing alimentée par IA.',
  keywords: 'conditions d\'utilisation, terms, legal, personaCraft, IA marketing',
  openGraph: {
    title: 'Conditions d\'Utilisation - PersonaCraft',
    description: 'Conditions d\'utilisation de PersonaCraft, plateforme de génération de personas marketing alimentée par IA.',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mr-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Conditions d'Utilisation
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
              Version 1.0
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Scale className="h-4 w-4 mr-2" />
              Conforme RGPD
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
                    Acceptation des Conditions
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    En accédant et en utilisant PersonaCraft ("le Service"), vous acceptez d'être lié par ces Conditions d'Utilisation ("Conditions"). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Service.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                    PersonaCraft est un service de génération de personas marketing alimenté par l'intelligence artificielle, développé et exploité par PersonaCraft SAS.
                  </p>
                </div>

                {/* Definitions */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Définitions
                  </h2>
                  <div className="grid gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <strong className="text-primary-600 dark:text-primary-400">"Service"</strong> - La plateforme PersonaCraft, incluant tous les outils, fonctionnalités et contenus associés
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <strong className="text-primary-600 dark:text-primary-400">"Utilisateur"</strong> - Toute personne qui accède ou utilise le Service
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <strong className="text-primary-600 dark:text-primary-400">"Compte"</strong> - L'enregistrement créé par un Utilisateur pour accéder au Service
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <strong className="text-primary-600 dark:text-primary-400">"Contenu"</strong> - Tout texte, image, donnée ou information généré ou fourni via le Service
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <strong className="text-primary-600 dark:text-primary-400">"Persona"</strong> - Un profil marketing généré par le Service
                    </div>
                  </div>
                </section>

                {/* Service Description */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Description du Service
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    PersonaCraft est une plateforme SaaS qui utilise l'intelligence artificielle (Google Gemini et Qloo Taste AI) pour générer des personas marketing détaillés basés sur :
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">Des briefs marketing fournis par l'utilisateur</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">Des données comportementales et culturelles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">Des analyses psychographiques</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">Des tendances marketing actuelles</span>
                    </li>
                  </ul>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fonctionnalités Principales</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Génération de personas en temps réel</li>
                        <li>• Export en formats PDF et CSV</li>
                        <li>• Intégration avec des outils CRM</li>
                        <li>• Analytics et métriques de performance</li>
                        <li>• Support multilingue (français/anglais)</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Limites d'Utilisation</h3>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Plan Gratuit :</strong> 3 personas par mois</li>
                        <li><strong>Plan Professional :</strong> 50 personas par mois</li>
                        <li><strong>Plan Enterprise :</strong> Personas illimités</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Pricing */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Facturation et Paiements
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Starter</h3>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">Gratuit</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Plan limité pour découvrir PersonaCraft</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-primary-500">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional</h3>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">29€/mois</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pour les marketeurs et agences</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-secondary-500">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">99€/mois</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pour les grandes équipes</p>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-8 border border-primary-200 dark:border-primary-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PersonaCraft SAS</h3>
                      <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <p>Email : legal@personacraft.com</p>
                        <p>Adresse : [Adresse légale]</p>
                        <p>SIRET : [Numéro SIRET]</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Pour toute question concernant ces Conditions d'Utilisation, n'hésitez pas à nous contacter.
                      </p>
                      <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                        Réponse sous 24h
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
                        Ces conditions d'utilisation sont un document légal. Nous vous recommandons de les lire attentivement et de consulter un avocat si nécessaire.
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