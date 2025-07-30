'use client';

export default function ContextSection() {
    return (
        <section
            id="context"
            className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-24 lg:py-32 overflow-hidden"
            aria-labelledby="context-title"
        >
            {/* Background decoration */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
                    <h2
                        id="context-title"
                        className="text-4xl lg:text-5xl font-black text-slate-900 mb-6"
                    >
                        Pourquoi Personacraft ?
                    </h2>
                    <p className="text-xl lg:text-2xl text-slate-700 font-light max-w-4xl mx-auto leading-relaxed">
                        La première plateforme qui combine l'intelligence artificielle de Google Gemini
                        avec les données culturelles de Qloo pour créer des personas marketing authentiques
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 mb-24">
                    {/* Left Column - Problem & Solution */}
                    <div className="space-y-12">
                        <div className="group">
                            <div className="flex items-start gap-6 mb-8">
                                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                                        Le défi des marketeurs
                                    </h3>
                                    <p className="text-slate-700 text-lg leading-relaxed">
                                        Créer des personas marketing précis et authentiques prend des semaines de recherche,
                                        d'interviews et d'analyse. Les équipes perdent un temps précieux sur des tâches répétitives
                                        au lieu de se concentrer sur la stratégie.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="group">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                                        Notre solution IA
                                    </h3>
                                    <p className="text-slate-700 text-lg leading-relaxed">
                                        Personacraft automatise ce processus en combinant la puissance de Google Gemini
                                        pour la génération de contenu avec les données culturelles réelles de Qloo,
                                        créant des personas en moins d'une minute.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Technology Stack */}
                    <div className="space-y-8">
                        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8 text-center">
                            Notre technologie hybride
                        </h3>

                        {/* Gemini Card */}
                        <div className="group bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-3xl p-8 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Google Gemini</h4>
                                    <p className="text-blue-600 font-semibold">Génération de contenu IA</p>
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                                Le modèle de langage le plus avancé de Google analyse votre brief marketing
                                et génère des personas détaillés avec des profils psychographiques,
                                démographiques et comportementaux cohérents.
                            </p>
                        </div>

                        {/* Qloo Card */}
                        <div className="group bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-3xl p-8 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-2">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Qloo Taste AI™</h4>
                                    <p className="text-purple-600 font-semibold">Données culturelles réelles</p>
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                                La plus grande base de données culturelles au monde enrichit vos personas
                                avec des préférences authentiques en musique, films, marques, restaurants
                                et tendances lifestyle basées sur des millions de points de données réels.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Use Cases */}
                <div className="mb-24">
                    <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 text-center mb-16">
                        Cas d'usage parfaits pour Personacraft
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="group bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-500/20 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Campagnes publicitaires</h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                                Créez des personas précis pour cibler vos audiences Facebook, Google Ads et campagnes display
                            </p>
                        </div>

                        <div className="group bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-500/20 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Stratégie de contenu</h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                                Développez des contenus qui résonnent avec vos audiences cibles sur tous les canaux
                            </p>
                        </div>

                        <div className="group bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-500/20 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Développement produit</h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                                Comprenez vos utilisateurs pour créer des produits qui répondent à leurs besoins réels
                            </p>
                        </div>
                    </div>
                </div>

                {/* Partners Section */}
                <div className="text-center">
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-12">
                        Nos partenaires technologiques
                    </h3>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
                        {/* Google Partner */}
                        <div className="group flex flex-col items-center">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-slate-200">
                                <svg className="w-12 h-12" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h4 className="font-bold text-slate-900 mb-1">Google Cloud</h4>
                                <p className="text-sm text-slate-600">Gemini AI Partner</p>
                            </div>
                        </div>

                        {/* Qloo Partner */}
                        <div className="group flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                <span className="text-2xl font-black text-white">Q</span>
                            </div>
                            <div className="text-center">
                                <h4 className="font-bold text-slate-900 mb-1">Qloo</h4>
                                <p className="text-sm text-slate-600">Taste AI™ Partner</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-600 mt-8 max-w-2xl mx-auto">
                        Personacraft est fier de s'appuyer sur les technologies les plus avancées
                        pour offrir des personas marketing d'une précision inégalée
                    </p>
                </div>
            </div>
        </section>
    );
}