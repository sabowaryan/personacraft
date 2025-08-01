'use client';


import { EnrichedPersona } from '@/types/enhanced-persona';
import { SocialMediaInsights } from '@/components/insights/SocialMediaInsights';

interface BehaviorsTabProps {
    persona:  EnrichedPersona;
}

export function BehaviorsTab({ persona }: BehaviorsTabProps) {
    return (
        <div className="space-y-8">

            {/* Marketing insights */}
            {persona.marketingInsights && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Canaux marketing
                        </h3>
                        {persona.marketingInsights.preferredChannels && Array.isArray(persona.marketingInsights.preferredChannels) && persona.marketingInsights.preferredChannels.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3">
                                {persona.marketingInsights.preferredChannels.map((channel, index) => (
                                    <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-white/60 rounded-lg">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-neutral-700 font-medium">{channel}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-sm sm:text-base text-neutral-500 italic">Aucun canal marketing défini</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                            Communication
                        </h3>
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3">Comportement d'achat</h4>
                                {persona.marketingInsights.buyingBehavior ? (
                                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed bg-white/60 rounded-lg p-3 sm:p-4">
                                        {persona.marketingInsights.buyingBehavior}
                                    </p>
                                ) : (
                                    <p className="text-sm sm:text-base text-neutral-500 italic bg-white/60 rounded-lg p-3 sm:p-4">
                                        Aucune information sur le comportement d'achat
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3">Ton de communication</h4>
                                {persona.marketingInsights.messagingTone ? (
                                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed bg-white/60 rounded-lg p-3 sm:p-4">
                                        {persona.marketingInsights.messagingTone}
                                    </p>
                                ) : (
                                    <p className="text-sm sm:text-base text-neutral-500 italic bg-white/60 rounded-lg p-3 sm:p-4">
                                        Aucune information sur le ton de communication
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3">Préférences de contenu</h4>
                                {persona.marketingInsights.contentPreferences && Array.isArray(persona.marketingInsights.contentPreferences) && persona.marketingInsights.contentPreferences.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {persona.marketingInsights.contentPreferences.map((preference, index) => (
                                            <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-amber-800 rounded-lg text-xs sm:text-sm font-medium border border-amber-200">
                                                {preference}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm sm:text-base text-neutral-500 italic bg-white/60 rounded-lg p-3 sm:p-4">
                                        Aucune préférence de contenu définie
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Social Media Insights */}
            {persona.socialMediaInsights && (
                <div className="mt-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 card-hover">
                        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                            Insights Réseaux Sociaux
                        </h3>
                        <SocialMediaInsights
                            insights={persona.socialMediaInsights.insights}
                            platforms={persona.socialMediaInsights.platforms}
                        />
                    </div>
                </div>
            )}

            {/* Fallback si aucune donnée marketing */}
            {(!persona.marketingInsights && !persona.socialMediaInsights) && (
                <div className="text-center py-12 sm:py-16">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-neutral-600 mb-2 sm:mb-3">Données marketing et culturelles indisponibles</h3>
                    <p className="text-sm sm:text-base text-neutral-500 max-w-md mx-auto px-4">Ces informations détaillées seront disponibles lors de la prochaine génération de personas avec les données enrichies.</p>
                </div>
            )}
        </div>
    );
}