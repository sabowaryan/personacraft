'use client';

export default function FeaturesSection() {
  return (
    <section 
      id="features" 
      className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 lg:py-32 overflow-hidden"
      aria-labelledby="features-title"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 
            id="features-title"
            className="text-4xl lg:text-5xl font-black text-blue-900 mb-6"
          >
            Comment ça fonctionne
          </h2>
          <p className="text-xl lg:text-2xl text-blue-700 font-light max-w-3xl mx-auto">
            Trois étapes simples pour des personas professionnels et authentiques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div className="group text-center">
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-blue-500/30">
              <span className="text-3xl font-black text-white">1</span>
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-blue-900 mb-6">
              Décrivez votre projet
            </h3>
            <p className="text-blue-700 text-lg leading-relaxed">
              Saisissez votre brief marketing : produit, cible, objectifs et contexte
            </p>
          </div>

          <div className="group text-center">
            <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-purple-500/30">
              <span className="text-3xl font-black text-white">2</span>
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-blue-900 mb-6">
              L'IA génère vos personas
            </h3>
            <p className="text-blue-700 text-lg leading-relaxed">
              Gemini et Qloo créent des personas détaillés avec données culturelles réelles
            </p>
          </div>

          <div className="group text-center">
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-pink-500/30">
              <span className="text-3xl font-black text-white">3</span>
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-blue-900 mb-6">
              Exportez et utilisez
            </h3>
            <p className="text-blue-700 text-lg leading-relaxed">
              Téléchargez vos personas en JSON, CSV ou PDF pour vos campagnes
            </p>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-blue-900 mb-2">Personnalisation</h4>
            <p className="text-blue-700 text-sm">Ajustez les personas selon vos besoins spécifiques</p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm border border-indigo-200/60 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-blue-900 mb-2">Validation IA</h4>
            <p className="text-blue-700 text-sm">Chaque persona est validé par nos algorithmes avancés</p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-blue-900 mb-2">Export Multiple</h4>
            <p className="text-blue-700 text-sm">JSON, CSV, PDF - choisissez le format qui vous convient</p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm border border-pink-200/60 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-pink-500/20 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-blue-900 mb-2">Temps Réel</h4>
            <p className="text-blue-700 text-sm">Génération instantanée, résultats en moins d'une minute</p>
          </div>
        </div>
      </div>
    </section>
  );
}