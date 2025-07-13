import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Scale, Users, Lock, FileText, Mail, AlertTriangle, CheckCircle, Clock, Download, Edit, Trash2, Eye, Ban, Database, Calendar, Building, Target, Globe, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'RGPD - Vos Droits et Nos Obligations - PersonaCraft',
  description: 'Informations complètes sur le RGPD, vos droits et nos obligations en matière de protection des données personnelles.',
  keywords: 'RGPD, protection des données, droits utilisateur, CNIL, conformité, personaCraft',
  openGraph: {
    title: 'RGPD - Vos Droits et Nos Obligations - PersonaCraft',
    description: 'Informations complètes sur le RGPD, vos droits et nos obligations en matière de protection des données personnelles.',
    type: 'website',
  },
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                RGPD
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Vos Droits et Nos Obligations
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <Badge variant="outline" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Conforme RGPD
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              En vigueur depuis 2018
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Protection garantie
            </Badge>
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="space-y-8">
                {/* Introduction */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Notre Engagement RGPD
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Le Règlement Général sur la Protection des Données (RGPD) est entré en vigueur le 25 mai 2018. PersonaCraft SAS s'engage à respecter pleinement ce règlement et à protéger vos données personnelles.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mise à jour : 15 janvier 2025</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Responsable : PersonaCraft SAS</span>
                    </div>
                  </div>
                </div>

                {/* Principes Fondamentaux */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Principes Fondamentaux du RGPD
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-4">
                        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Licéité & Transparence</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Traitement licite, loyal et transparent de vos données
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                                             <div className="flex items-center mb-4">
                         <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finalité Limitée</h3>
                       </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Collecte uniquement pour des finalités déterminées et légitimes
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                                             <div className="flex items-center mb-4">
                         <Shield className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Minimisation</h3>
                       </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Collecte minimale de données strictement nécessaires
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exactitude</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Maintien de données exactes et à jour
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                      <div className="flex items-center mb-4">
                        <Clock className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Limitation</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Conservation limitée au temps nécessaire
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center mb-4">
                        <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sécurité</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Protection contre tout traitement non autorisé
                      </p>
                    </div>
                  </div>
                </section>

                {/* Vos Droits RGPD */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Vos Droits RGPD
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Droit d'accès (Art. 15)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Obtenir une copie de vos données personnelles
                        </p>
                        <Badge variant="outline" className="text-xs">Gratuit - 1 mois</Badge>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <Edit className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Droit de rectification (Art. 16)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Corriger vos données inexactes ou incomplètes
                        </p>
                        <Badge variant="outline" className="text-xs">Via compte ou email</Badge>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Droit à l'effacement (Art. 17)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          "Droit à l'oubli" - Suppression de vos données
                        </p>
                        <Badge variant="outline" className="text-xs">Sous conditions</Badge>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <Ban className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Droit à la limitation (Art. 18)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Limiter le traitement de vos données
                        </p>
                        <Badge variant="outline" className="text-xs">Temporaire</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <Download className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Droit à la portabilité (Art. 20)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Récupérer vos données dans un format structuré
                        </p>
                        <Badge variant="outline" className="text-xs">JSON, CSV, PDF</Badge>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Droit d'opposition (Art. 21)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Vous opposer au traitement de vos données
                        </p>
                        <Badge variant="outline" className="text-xs">Sous conditions</Badge>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Droit d'information (Art. 13-14)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Être informé du traitement de vos données
                        </p>
                        <Badge variant="outline" className="text-xs">Transparence</Badge>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-3">
                          <Database className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Décision automatisée (Art. 22)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Contrôle humain sur les décisions automatisées
                        </p>
                        <Badge variant="outline" className="text-xs">Protection IA</Badge>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Bases Légales */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Bases Légales du Traitement
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Consentement (Art. 6.1.a)</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Newsletter et communications</li>
                        <li>• Cookies non essentiels</li>
                        <li>• Traitements optionnels</li>
                        <li>• Retirable à tout moment</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Exécution d'un contrat (Art. 6.1.b)</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Fourniture du service PersonaCraft</li>
                        <li>• Facturation et paiements</li>
                        <li>• Support client</li>
                        <li>• Fonctionnalités essentielles</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Obligation légale (Art. 6.1.c)</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Conservation facturation (7 ans)</li>
                        <li>• Réponse aux autorités</li>
                        <li>• Respect des réglementations</li>
                        <li>• Obligations fiscales</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Intérêt légitime (Art. 6.1.f)</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Amélioration du service</li>
                        <li>• Sécurité et prévention fraude</li>
                        <li>• Communication importante</li>
                        <li>• Analyse de performance</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Sécurité */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Sécurité et Violations
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mesures de Sécurité</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 text-green-600 dark:text-green-400 mr-3" />
                          <span className="text-sm">Chiffrement HTTPS/TLS</span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mr-3" />
                          <span className="text-sm">Chiffrement AES-256</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-green-600 dark:text-green-400 mr-3" />
                          <span className="text-sm">Authentification MFA</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 text-green-600 dark:text-green-400 mr-3" />
                          <span className="text-sm">Accès limité</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification des Violations</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-3" />
                          <span className="text-sm">Notification CNIL sous 72h</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-red-600 dark:text-red-400 mr-3" />
                          <span className="text-sm">Information aux utilisateurs</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-3" />
                          <span className="text-sm">Mesures correctives</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-red-600 dark:text-red-400 mr-3" />
                          <span className="text-sm">Documentation obligatoire</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact et Exercice des Droits */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Exercer vos Droits</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Délégué à la Protection des Données</h3>
                      <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>privacy@personacraft.com</span>
                        </div>
                        <p className="text-sm">Pour toute question sur vos droits RGPD</p>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                          Réponse sous 1 mois
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Autorité de Contrôle</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Vous pouvez saisir la CNIL si vos droits ne sont pas respectés.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <span>www.cnil.fr</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>3 Place de Fontenoy, 75007 Paris</span>
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
                        Cette page présente les informations RGPD de PersonaCraft. Pour des questions juridiques spécifiques, nous vous recommandons de consulter un avocat spécialisé en droit numérique.
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