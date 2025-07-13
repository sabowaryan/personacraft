import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Search, BookOpen, Lightbulb, MessageCircle, Phone, Mail, Clock, Users, Zap, Target, Download, Settings, AlertTriangle, CheckCircle, ExternalLink, Play, FileText, Video, Globe } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Centre d\'Aide - PersonaCraft',
  description: 'Trouvez rapidement des réponses à vos questions et apprenez à utiliser PersonaCraft efficacement.',
  keywords: 'aide, support, FAQ, guide, tutoriel, personaCraft, assistance',
  openGraph: {
    title: 'Centre d\'Aide - PersonaCraft',
    description: 'Trouvez rapidement des réponses à vos questions et apprenez à utiliser PersonaCraft efficacement.',
    type: 'website',
  },
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Centre d'Aide
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                PersonaCraft
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <Badge variant="outline" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              FAQ Interactive
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Guides Complets
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Support 24/7
            </Badge>
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="space-y-8">
                {/* Introduction */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Bienvenue dans le Centre d'Aide
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Trouvez rapidement des réponses à vos questions et apprenez à utiliser PersonaCraft efficacement. Notre équipe est là pour vous accompagner.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Support 24/7</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Équipe dédiée</span>
                    </div>
                  </div>
                </div>

                {/* Démarrage Rapide */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Démarrage Rapide
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-4">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Créer un compte</h3>
                      </div>
                      <ol className="space-y-2 text-sm">
                        <li>1. Cliquez sur "S'inscrire"</li>
                        <li>2. Remplissez vos informations</li>
                        <li>3. Vérifiez votre email</li>
                      </ol>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-4">
                        <Target className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Générer un persona</h3>
                      </div>
                      <ol className="space-y-2 text-sm">
                        <li>1. Accédez au "Générateur"</li>
                        <li>2. Remplissez le brief marketing</li>
                        <li>3. Cliquez sur "Générer"</li>
                      </ol>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-4">
                        <Download className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exporter les résultats</h3>
                      </div>
                      <ol className="space-y-2 text-sm">
                        <li>1. Téléchargez en PDF ou CSV</li>
                        <li>2. Partagez avec votre équipe</li>
                        <li>3. Intégrez dans vos outils</li>
                      </ol>
                    </div>
                  </div>
                </section>

                {/* FAQ Interactive */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">2</span>
                    FAQ - Questions Fréquentes
                  </h2>
                  
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-6">
                      <TabsTrigger value="general">Général</TabsTrigger>
                      <TabsTrigger value="generation">Génération</TabsTrigger>
                      <TabsTrigger value="export">Export</TabsTrigger>
                      <TabsTrigger value="billing">Facturation</TabsTrigger>
                      <TabsTrigger value="technical">Technique</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="text-left">
                            Qu'est-ce qu'un persona marketing ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Un persona est un profil fictif représentant votre client idéal, basé sur des données réelles. Il inclut des informations démographiques, comportementales et psychographiques pour vous aider à mieux comprendre et cibler votre audience.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="text-left">
                            Combien de personas puis-je générer ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Cela dépend de votre plan :
                            <ul className="mt-2 space-y-1">
                              <li>• <strong>Gratuit :</strong> 3 personas par mois</li>
                              <li>• <strong>Professional :</strong> 50 personas par mois</li>
                              <li>• <strong>Enterprise :</strong> Personas illimités</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="text-left">
                            Les personas sont-ils personnalisables ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, vous pouvez modifier tous les éléments générés et ajouter vos propres informations. PersonaCraft vous donne une base solide que vous pouvez adapter selon vos besoins spécifiques.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                    
                    <TabsContent value="generation">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-4">
                          <AccordionTrigger className="text-left">
                            Combien de temps faut-il pour générer un persona ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Généralement 30 secondes à 2 minutes, selon la complexité du brief. Notre IA analyse votre brief et génère un persona détaillé en temps réel.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-5">
                          <AccordionTrigger className="text-left">
                            Puis-je utiliser mes propres données ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, vous pouvez importer des données clients existantes pour enrichir vos personas. Cela permet d'avoir des profils encore plus précis et adaptés à votre marché.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-6">
                          <AccordionTrigger className="text-left">
                            Les personas sont-ils basés sur des données réelles ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, ils utilisent des données comportementales et culturelles de Qloo Taste AI et des analyses marketing actuelles pour créer des profils réalistes et pertinents.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                    
                    <TabsContent value="export">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-7">
                          <AccordionTrigger className="text-left">
                            Quels formats d'export sont disponibles ?
                          </AccordionTrigger>
                          <AccordionContent>
                            PDF (présentation) et CSV (données brutes). Le PDF est idéal pour les présentations, le CSV pour l'analyse et l'intégration dans vos outils.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-8">
                          <AccordionTrigger className="text-left">
                            Puis-je partager mes personas ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, vous pouvez partager via lien ou export direct. Parfait pour collaborer avec votre équipe ou présenter à vos clients.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-9">
                          <AccordionTrigger className="text-left">
                            Les personas sont-ils sauvegardés automatiquement ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, tous vos personas sont sauvegardés dans votre bibliothèque. Vous pouvez y accéder à tout moment et les modifier si nécessaire.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                    
                    <TabsContent value="billing">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-10">
                          <AccordionTrigger className="text-left">
                            Comment changer de plan ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Allez dans "Paramètres" &gt; "Abonnement" et choisissez votre nouveau plan. Le changement prend effet immédiatement.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-11">
                          <AccordionTrigger className="text-left">
                            Puis-je annuler à tout moment ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, vous pouvez annuler votre abonnement à tout moment. Vous gardez l'accès jusqu'à la fin de votre période de facturation.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-12">
                          <AccordionTrigger className="text-left">
                            Y a-t-il des frais cachés ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Non, le prix affiché est le prix final. Aucun frais caché, aucune surprise. Transparence totale sur nos tarifs.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                    
                    <TabsContent value="technical">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-13">
                          <AccordionTrigger className="text-left">
                            Quels navigateurs sont supportés ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Chrome, Firefox, Safari, Edge (versions récentes). Nous recommandons d'utiliser la dernière version de votre navigateur.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-14">
                          <AccordionTrigger className="text-left">
                            L'application fonctionne-t-elle sur mobile ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, l'interface est responsive et optimisée mobile. Vous pouvez utiliser PersonaCraft sur smartphone et tablette.
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-15">
                          <AccordionTrigger className="text-left">
                            Mes données sont-elles sécurisées ?
                          </AccordionTrigger>
                          <AccordionContent>
                            Oui, nous utilisons un chiffrement SSL et respectons le RGPD. Vos données sont protégées et nous ne les partageons jamais.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                  </Tabs>
                </section>

                {/* Guides d'Utilisation */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Guides d'Utilisation
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-4">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Créer un Brief Marketing</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Apprenez à rédiger un brief efficace pour obtenir des personas pertinents.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Définir votre marché</li>
                        <li>• Décrire votre produit</li>
                        <li>• Identifier les objectifs</li>
                      </ul>
                      <Badge variant="outline" className="mt-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Guide complet
                      </Badge>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-4">
                        <Target className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyser vos Personas</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Découvrez comment utiliser vos personas pour optimiser vos campagnes.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Données démographiques</li>
                        <li>• Comportements d'achat</li>
                        <li>• Motivations clés</li>
                      </ul>
                      <Badge variant="outline" className="mt-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Tutoriel vidéo
                      </Badge>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-4">
                        <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimiser vos Campagnes</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Techniques avancées pour maximiser l'impact de vos personas.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Personnalisation messages</li>
                        <li>• Choix des canaux</li>
                        <li>• Timing optimal</li>
                      </ul>
                      <Badge variant="outline" className="mt-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        Webinaire
                      </Badge>
                    </div>
                  </div>
                </section>

                {/* Résolution de Problèmes */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Résolution de Problèmes
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Génération échouée</h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li>• Vérifiez votre connexion internet</li>
                          <li>• Assurez-vous que votre brief est complet</li>
                          <li>• Réessayez dans quelques minutes</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <Settings className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Limite atteinte</h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li>• Vérifiez votre plan d'abonnement</li>
                          <li>• Attendez le renouvellement mensuel</li>
                          <li>• Contactez le support</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Export ne fonctionne pas</h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li>• Vérifiez que le persona est généré</li>
                          <li>• Essayez un autre navigateur</li>
                          <li>• Videz le cache</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Optimisation</h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li>• Simplifiez votre brief</li>
                          <li>• Utilisez un navigateur récent</li>
                          <li>• Désactivez les extensions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Ressources */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">5</span>
                    Ressources Supplémentaires
                  </h2>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
                      <Video className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tutoriels Vidéo</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Guides visuels étape par étape</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
                      <FileText className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Documentation API</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pour les développeurs</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
                      <Play className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Webinaires</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Formations en direct</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
                      <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Communauté</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Forum utilisateurs</p>
                    </div>
                  </div>
                </section>

                {/* Contact Support */}
                <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8 border border-purple-200 dark:border-purple-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Support</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support Email</h3>
                      <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>support@personacraft.com</span>
                        </div>
                        <p className="text-sm">Réponse sous 24h</p>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                          Recommandé
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chat en Ligne</h3>
                      <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          <span>Disponible 24/7</span>
                        </div>
                        <p className="text-sm">Réponse immédiate</p>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                          Temps réel
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Téléphone</h3>
                      <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>+33 1 XX XX XX XX</span>
                        </div>
                        <p className="text-sm">Lun-Ven 9h-18h</p>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                          Urgent uniquement
                        </Badge>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Note Finale */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex items-start">
                    <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Besoin d'aide supplémentaire ?</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Notre équipe d'experts est là pour vous accompagner. N'hésitez pas à nous contacter pour toute question spécifique ou demande personnalisée.
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