'use client';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice Marketing",
      company: "TechStart",
      avatar: "MD",
      content: "PersonaCraft a révolutionné notre approche marketing. Nous créons maintenant des personas en quelques minutes au lieu de plusieurs jours.",
      rating: 5
    },
    {
      name: "Thomas Martin",
      role: "Growth Hacker",
      company: "ScaleUp",
      avatar: "TM",
      content: "L'intégration de Qloo AI nous donne des insights culturels que nous n'aurions jamais pu obtenir autrement. Un game-changer !",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      role: "Chef de Produit",
      company: "InnovateCorp",
      avatar: "SL",
      content: "La précision des personas générés par Gemini est impressionnante. Nos campagnes ont un taux de conversion 40% plus élevé.",
      rating: 5
    },
    {
      name: "Alexandre Petit",
      role: "Consultant Marketing",
      company: "Freelance",
      avatar: "AP",
      content: "Parfait pour mes clients. Je peux maintenant proposer des personas détaillés rapidement et à un prix compétitif.",
      rating: 5
    },
    {
      name: "Camille Rousseau",
      role: "Brand Manager",
      company: "FashionBrand",
      avatar: "CR",
      content: "Les insights culturels de Qloo nous aident à comprendre les tendances avant même qu'elles n'émergent. Incroyable !",
      rating: 5
    },
    {
      name: "Julien Moreau",
      role: "Digital Marketing Manager",
      company: "E-commerce Plus",
      avatar: "JM",
      content: "ROI immédiat. Nos personas sont maintenant basés sur des données réelles et non plus sur des suppositions.",
      rating: 5
    }
  ];

  return (
    <section 
      id="testimonials" 
      className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-24 lg:py-32 overflow-hidden"
      aria-labelledby="testimonials-title"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 
            id="testimonials-title"
            className="text-4xl lg:text-5xl font-black text-green-900 mb-6"
          >
            Ils nous font confiance
          </h2>
          <p className="text-xl lg:text-2xl text-green-700 font-light max-w-3xl mx-auto">
            Découvrez comment PersonaCraft transforme le marketing de nos clients
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-black text-green-900 mb-2">10K+</div>
            <div className="text-green-700 font-medium">Personas créés</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-black text-green-900 mb-2">500+</div>
            <div className="text-green-700 font-medium">Entreprises clientes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-black text-green-900 mb-2">98%</div>
            <div className="text-green-700 font-medium">Satisfaction client</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-black text-green-900 mb-2">40%</div>
            <div className="text-green-700 font-medium">Amélioration ROI</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="group bg-white/80 backdrop-blur-sm border border-green-200/60 rounded-3xl p-8 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-green-800 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-green-900">{testimonial.name}</div>
                    <div className="text-green-700 text-sm">{testimonial.role}</div>
                    <div className="text-green-600 text-sm font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Case Study CTA */}
        <div className="mt-20 text-center">
          <div className="bg-white/80 backdrop-blur-sm border border-green-200/60 rounded-3xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-black text-green-900 mb-6">
              Étude de cas : +127% de conversion
            </h3>
            <p className="text-xl text-green-700 mb-8 leading-relaxed">
              Découvrez comment TechStart a triplé ses conversions en utilisant des personas générés par PersonaCraft pour personnaliser ses campagnes publicitaires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-1">
                Lire l'étude de cas
              </button>
              <button className="border-2 border-green-300 text-green-700 px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:bg-green-50 hover:border-green-400">
                Voir plus de témoignages
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}