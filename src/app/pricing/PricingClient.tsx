'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { pricingService, PricingPlan, PricingFAQ } from '@/services/pricingService';

export default function PricingClient() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [faqs, setFaqs] = useState<PricingFAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const [plansData, faqsData] = await Promise.all([
          pricingService.getPlans(),
          pricingService.getFAQs()
        ]);
        setPlans(plansData);
        setFaqs(faqsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données de pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPricingData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background extension to cover navbar area */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 -z-10">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/15 to-rose-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Tarification transparente
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-purple-900 mb-6 leading-tight">
              Choisissez votre plan
            </h1>
            <p className="text-xl lg:text-2xl text-purple-700 font-light max-w-3xl mx-auto leading-relaxed">
              Des tarifs simples et transparents pour tous vos besoins marketing.
              Commencez gratuitement, évoluez selon vos besoins.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-2 flex items-center">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${!isAnnual
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-700 hover:bg-purple-50'
                  }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isAnnual
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-700 hover:bg-purple-50'
                  }`}
              >
                Annuel
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">-20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto mb-24">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`group relative rounded-3xl p-8 text-center transition-all duration-500 hover:-translate-y-2 ${plan.popular
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white transform scale-105 shadow-2xl shadow-purple-500/30'
                  : 'bg-white/80 backdrop-blur-sm border border-purple-200/60 hover:bg-white hover:shadow-2xl hover:shadow-purple-500/20'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                      Le plus populaire
                    </span>
                  </div>
                )}

                <div className="relative">
                  <h3 className={`text-2xl font-black mb-4 ${plan.popular ? 'text-white' : 'text-purple-900'}`}>
                    {plan.name}
                  </h3>

                  <div className="mb-6">
                    <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-purple-900'}`}>
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className={`ml-2 ${plan.popular ? 'text-white/80' : 'text-purple-700'}`}>
                      {plan.period}
                    </span>
                    {isAnnual && plan.name !== "Gratuit" && (
                      <div className="text-sm mt-2 opacity-75">
                        <span className="line-through">{plan.monthlyPrice}/mois</span>
                        <span className="ml-2 text-green-400 font-medium">Économisez 20%</span>
                      </div>
                    )}
                  </div>

                  <p className={`mb-8 ${plan.popular ? 'text-white/90' : 'text-purple-700'}`}>
                    {plan.description}
                  </p>

                  <ul className="space-y-4 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className={`flex items-center ${plan.popular ? 'text-white/90' : 'text-purple-700'}`}>
                        <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.ctaLink}>
                    <Button
                      className={`w-full font-bold transition-all duration-300 ${plan.popular
                        ? 'bg-white text-purple-700 hover:bg-gray-50'
                        : 'bg-transparent border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400'
                        }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mb-24">
            <h2 className="text-3xl font-black text-purple-900 text-center mb-12">
              Comparaison détaillée des fonctionnalités
            </h2>

            <div className="bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="text-left p-6 font-bold text-purple-900">Fonctionnalités</th>
                      <th className="text-center p-6 font-bold text-purple-900">Gratuit</th>
                      <th className="text-center p-6 font-bold text-purple-900">Pro</th>
                      <th className="text-center p-6 font-bold text-purple-900">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    <tr>
                      <td className="p-6 font-medium text-purple-900">Personas par mois</td>
                      <td className="text-center p-6 text-purple-700">3</td>
                      <td className="text-center p-6 text-purple-700">50</td>
                      <td className="text-center p-6 text-purple-700">Illimité</td>
                    </tr>
                    <tr className="bg-purple-25">
                      <td className="p-6 font-medium text-purple-900">Formats d'export</td>
                      <td className="text-center p-6 text-purple-700">PDF</td>
                      <td className="text-center p-6 text-purple-700">PDF, JSON, CSV</td>
                      <td className="text-center p-6 text-purple-700">Tous formats + API</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-medium text-purple-900">Insights culturels Qloo</td>
                      <td className="text-center p-6">
                        <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                      <td className="text-center p-6">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="text-center p-6">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                    </tr>
                    <tr className="bg-purple-25">
                      <td className="p-6 font-medium text-purple-900">Support</td>
                      <td className="text-center p-6 text-purple-700">Communauté</td>
                      <td className="text-center p-6 text-purple-700">Prioritaire</td>
                      <td className="text-center p-6 text-purple-700">Dédié 24/7</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-medium text-purple-900">API Access</td>
                      <td className="text-center p-6">
                        <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                      <td className="text-center p-6">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="text-center p-6">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-black text-purple-900 text-center mb-12">
              Questions fréquentes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-purple-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-purple-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 max-w-4xl mx-auto text-white">
              <h2 className="text-3xl lg:text-4xl font-black mb-6">
                Prêt à créer vos premiers personas ?
              </h2>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Rejoignez plus de 500 entreprises qui utilisent PersonaCraft pour améliorer leurs campagnes marketing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button className="bg-white text-purple-700 hover:bg-gray-50 font-bold px-8 py-4 text-lg">
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-4 text-lg">
                    Voir une démo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}