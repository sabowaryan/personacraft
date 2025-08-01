'use client';

import { Persona } from '@/types';
import { EnrichedPersona } from '@/types/enhanced-persona';
import { SocialMediaInsights } from '@/components/insights/SocialMediaInsights';

interface BehaviorsTabProps {
    persona: Persona | EnrichedPersona;
}

export function BehaviorsTab({ persona }: BehaviorsTabProps) {
    return (
        <div className="space-y-8">
            {/* Données culturelles */}
            {persona.culturalData && (
                <div className="space-y-8">
                    {/* Divertissement & Culture */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                Divertissement
                            </h3>
                            <div className="space-y-4 sm:space-y-6">
                                {persona.culturalData.music && Array.isArray(persona.culturalData.music) && persona.culturalData.music.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                            Musique
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.music.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-pink-800 rounded-lg text-xs sm:text-sm font-medium border border-pink-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.movie && Array.isArray(persona.culturalData.movie) && persona.culturalData.movie.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                                            </svg>
                                            Films
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.movie.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-pink-800 rounded-lg text-xs sm:text-sm font-medium border border-pink-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.tv && Array.isArray(persona.culturalData.tv) && persona.culturalData.tv.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Séries TV
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.tv.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-pink-800 rounded-lg text-xs sm:text-sm font-medium border border-pink-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.book && Array.isArray(persona.culturalData.book) && persona.culturalData.book.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            Livres
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.book.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-pink-800 rounded-lg text-xs sm:text-sm font-medium border border-pink-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.podcasts && Array.isArray(persona.culturalData.podcasts) && persona.culturalData.podcasts.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                            Podcasts
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.podcasts.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-pink-800 rounded-lg text-xs sm:text-sm font-medium border border-pink-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.videoGames && Array.isArray(persona.culturalData.videoGames) && persona.culturalData.videoGames.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                            </svg>
                                            Jeux vidéo
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.videoGames.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-pink-800 rounded-lg text-xs sm:text-sm font-medium border border-pink-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Marques & Social
                            </h3>
                            <div className="space-y-4 sm:space-y-6">
                                {persona.culturalData.brand && Array.isArray(persona.culturalData.brand) && persona.culturalData.brand.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Marques préférées
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.brand.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-cyan-800 rounded-lg text-xs sm:text-sm font-medium border border-cyan-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.socialMedia && Array.isArray(persona.culturalData.socialMedia) && persona.culturalData.socialMedia.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                            </svg>
                                            Réseaux sociaux
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.socialMedia.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-cyan-800 rounded-lg text-xs sm:text-sm font-medium border border-cyan-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.influencers && Array.isArray(persona.culturalData.influencers) && persona.culturalData.influencers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Influenceurs
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.influencers.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-cyan-800 rounded-lg text-xs sm:text-sm font-medium border border-cyan-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Style de vie & Consommation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Voyages & Lieux
                            </h3>
                            <div className="space-y-4 sm:space-y-6">
                                {persona.culturalData.travel && Array.isArray(persona.culturalData.travel) && persona.culturalData.travel.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Voyages
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.travel.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-emerald-800 rounded-lg text-xs sm:text-sm font-medium border border-emerald-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.restaurant && Array.isArray(persona.culturalData.restaurant) && persona.culturalData.restaurant.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            Restaurants
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.restaurant.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-emerald-800 rounded-lg text-xs sm:text-sm font-medium border border-emerald-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.food && Array.isArray(persona.culturalData.food) && persona.culturalData.food.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                            </svg>
                                            Alimentation
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.food.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-emerald-800 rounded-lg text-xs sm:text-sm font-medium border border-emerald-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                                </svg>
                                Mode & Beauté
                            </h3>
                            <div className="space-y-4 sm:space-y-6">
                                {persona.culturalData.fashion && Array.isArray(persona.culturalData.fashion) && persona.culturalData.fashion.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                                            </svg>
                                            Mode
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.fashion.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-purple-800 rounded-lg text-xs sm:text-sm font-medium border border-purple-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {persona.culturalData.beauty && Array.isArray(persona.culturalData.beauty) && persona.culturalData.beauty.length > 0 && (
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            Beauté
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.culturalData.beauty.map((item, index) => (
                                                <span key={index} className="px-2.5 py-1 sm:px-3 sm:py-1 bg-white/70 text-purple-800 rounded-lg text-xs sm:text-sm font-medium border border-purple-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Fallback si aucune donnée marketing/culturelle */}
            {(!persona.culturalData && !persona.marketingInsights && !persona.socialMediaInsights) && (
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