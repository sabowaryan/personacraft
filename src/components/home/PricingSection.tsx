'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { pricingService, PricingPlan, PricingFAQ } from '@/services/pricingService';

export default function PricingSection() {
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
        setFaqs(faqsData.slice(0, 4)); // Limiter à 4 FAQs pour la section home
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
      <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </section>
    );
  }
  return (
    <section 
      id="pricing" 
      className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-24 lg:py-32 overflow-hidden"
      aria-labelledby="pricing-title"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/15 to-rose-400/15 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 
            id="pricing-title"
            className="text-4xl lg:text-5xl font-black text-purple-900 mb-6"
          >
            Tarifs simples et transparents
          </h2>
          <p className="text-xl lg:text-2xl text-purple-700 font-light max-w-3xl mx-auto">
            Choisissez le plan qui correspond à vos besoins marketing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`group relative rounded-3xl p-8 text-center transition-all duration-500 hover:-translate-y-2 ${
                plan.popular
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white transform scale-105 shadow-2xl shadow-purple-500/30'
                  : 'bg-white/80 backdrop-blur-sm border border-purple-200/60 hover:bg-white hover:shadow-2xl hover:shadow-purple-500/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    Recommandé
                  </span>
                </div>
              )}

              {!plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              )}
              
              <div className="relative">
                <h3 className={`text-2xl font-black mb-4 ${plan.popular ? 'text-white' : 'text-purple-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-purple-900'}`}>
                    {plan.monthlyPrice}
                  </span>
                  <span className={`ml-2 ${plan.popular ? 'text-white/80' : 'text-purple-700'}`}>
                    {plan.period}
                  </span>
                </div>
                
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
                    className={`w-full font-bold transition-all duration-300 ${
                      plan.popular
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

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-3xl font-black text-purple-900 text-center mb-12">
            Questions fréquentes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-purple-900 mb-3">
                  {faq.question}
                </h4>
                <p className="text-purple-700">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}