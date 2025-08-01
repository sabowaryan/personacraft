'use client';

import { EnrichedPersona } from '@/types/enhanced-persona';

interface DemographicsTabProps {
    persona: EnrichedPersona;
}

export function DemographicsTab({ persona }: DemographicsTabProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informations principales */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg border border-neutral-200/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-8">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-2xl font-bold text-gray-900">Profil démographique</h3>
                            <p className="text-gray-600 mt-1">Informations personnelles et socio-économiques</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Localisation */}
                        <div className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <label className="ml-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Localisation</label>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{persona.location}</p>
                        </div>

                        {/* Revenus */}
                        <div className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center mb-3">
                                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <label className="ml-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Revenus annuels</label>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{persona.demographics.income}</p>
                        </div>

                        {/* Éducation */}
                        <div className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <label className="ml-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Éducation</label>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{persona.demographics.education}</p>
                        </div>

                        {/* Situation familiale */}
                        <div className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-pink-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center mb-3">
                                <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <label className="ml-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Situation familiale</label>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{persona.demographics.familyStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Statistiques visuelles */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-indigo-200/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-8">
                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-bold text-gray-900">Aperçu</h3>
                            <p className="text-gray-600 text-sm">Données clés</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Âge */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 hover:bg-white/90 transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="ml-3 font-semibold text-gray-700">Âge</span>
                                </div>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{persona.age}</span>
                            </div>
                            <div className="text-right text-sm text-gray-500">ans</div>
                        </div>

                        {/* Profession */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 hover:bg-white/90 transition-all duration-200">
                            <div className="flex items-center mb-3">
                                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                                    </svg>
                                </div>
                                <span className="ml-3 font-semibold text-gray-700">Profession</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 leading-tight">{persona.occupation}</p>
                        </div>

                        {/* Score de qualité */}
                        <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl p-6 border border-violet-200">
                            <div className="text-center">
                                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="url(#gradient)"
                                            strokeWidth="2"
                                            strokeDasharray={`${persona.qualityScore}, 100`}
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                            {persona.qualityScore}%
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Score de qualité</div>
                                <div className="mt-2 text-xs text-gray-500">Fiabilité des données</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}