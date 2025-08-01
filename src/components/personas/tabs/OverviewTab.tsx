'use client';

import { Persona } from '@/types';

interface OverviewTabProps {
    persona: Persona;
}

export function OverviewTab({ persona }: OverviewTabProps) {
    const getQualityScoreColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const getQualityScoreIcon = (score: number) => {
        if (score >= 80) return (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        );
        if (score >= 60) return (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        );
        return (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        );
    };

    return (
        <div className="space-y-8">
            {/* Hero Section with Bio */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl border border-neutral-200/50 p-8 shadow-lg shadow-indigo-100/50">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
                        <div className="flex items-center space-x-5">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200/50">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{persona.name}</h2>
                                <div className="flex items-center mt-2 text-gray-600">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-medium">{persona.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className={`flex items-center space-x-3 px-5 py-3 rounded-2xl border-2 shadow-sm ${getQualityScoreColor(persona.qualityScore)}`}>
                            {getQualityScoreIcon(persona.qualityScore)}
                            <div className="text-right">
                                <div className="font-bold text-lg">{persona.qualityScore}/100</div>
                                <div className="text-xs opacity-75">Score qualité</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 rounded-2xl p-7 border border-gray-100/80 shadow-inner">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            Biographie
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-base font-medium">{persona.bio}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Demographics Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-lg shadow-blue-100/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-blue-50/80 px-7 py-5 border-b border-neutral-200/50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                Informations démographiques
                            </h3>
                        </div>
                        <div className="p-7">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-5">
                                    <div className="group hover:shadow-md transition-all duration-200 p-5 bg-gradient-to-br from-blue-50/50 to-blue-50/30 rounded-2xl border border-blue-100/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700 font-semibold">Revenus</span>
                                            </div>
                                            <span className="text-gray-900 font-bold text-lg">{persona.demographics.income}</span>
                                        </div>
                                    </div>
                                    <div className="group hover:shadow-md transition-all duration-200 p-5 bg-gradient-to-br from-green-50/50 to-green-50/30 rounded-2xl border border-green-100/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700 font-semibold">Éducation</span>
                                            </div>
                                            <span className="text-gray-900 font-bold text-lg">{persona.demographics.education}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="group hover:shadow-md transition-all duration-200 p-5 bg-gradient-to-br from-purple-50/50 to-purple-50/30 rounded-2xl border border-purple-100/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700 font-semibold">Famille</span>
                                            </div>
                                            <span className="text-gray-900 font-bold text-lg">{persona.demographics.familyStatus}</span>
                                        </div>
                                    </div>
                                    <div className="group hover:shadow-md transition-all duration-200 p-5 bg-gradient-to-br from-orange-50/50 to-orange-50/30 rounded-2xl border border-orange-100/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700 font-semibold">Localisation</span>
                                            </div>
                                            <span className="text-gray-900 font-bold text-lg">{persona.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-lg shadow-green-100/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50/80 via-emerald-50/60 to-green-50/80 px-7 py-5 border-b border-neutral-200/50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                Contact
                            </h3>
                        </div>
                        <div className="p-7 space-y-5">
                            {persona.email ? (
                                <div className="group hover:shadow-md transition-all duration-200 p-4 bg-gradient-to-br from-green-50/50 to-green-50/30 rounded-2xl border border-green-100/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-700 font-semibold">Email</span>
                                        </div>
                                        <a
                                            href={`mailto:${persona.email}`}
                                            className="text-green-600 font-bold hover:text-green-700 transition-colors text-sm bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100"
                                        >
                                            {persona.email}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-gradient-to-br from-gray-50/50 to-gray-50/30 rounded-2xl border border-gray-100/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-700 font-semibold">Email</span>
                                        </div>
                                        <span className="text-gray-400 italic text-sm bg-gray-100 px-3 py-1 rounded-lg">Non renseigné</span>
                                    </div>
                                </div>
                            )}

                            {persona.phone ? (
                                <div className="group hover:shadow-md transition-all duration-200 p-4 bg-gradient-to-br from-blue-50/50 to-blue-50/30 rounded-2xl border border-blue-100/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-700 font-semibold">Téléphone</span>
                                        </div>
                                        <a
                                            href={`tel:${persona.phone}`}
                                            className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100"
                                        >
                                            {persona.phone}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-gradient-to-br from-gray-50/50 to-gray-50/30 rounded-2xl border border-gray-100/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-700 font-semibold">Téléphone</span>
                                        </div>
                                        <span className="text-gray-400 italic text-sm bg-gray-100 px-3 py-1 rounded-lg">Non renseigné</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals and Pain Points */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Goals */}
                <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-lg shadow-emerald-100/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50/80 via-green-50/60 to-emerald-50/80 px-7 py-5 border-b border-neutral-200/50">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            Objectifs
                        </h3>
                    </div>
                    <div className="p-7">
                        <div className="space-y-4">
                            {persona.goals.map((goal, index) => (
                                <div key={index} className="group hover:shadow-md transition-all duration-200 flex items-start space-x-4 p-5 bg-gradient-to-br from-emerald-50/60 to-green-50/40 rounded-2xl border border-emerald-100/60">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-200 transition-colors shadow-sm">
                                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700 leading-relaxed font-medium">{goal}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pain Points */}
                <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-lg shadow-red-100/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-50/80 via-rose-50/60 to-red-50/80 px-7 py-5 border-b border-neutral-200/50">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            Points de friction
                        </h3>
                    </div>
                    <div className="p-7">
                        <div className="space-y-4">
                            {persona.painPoints.map((painPoint, index) => (
                                <div key={index} className="group hover:shadow-md transition-all duration-200 flex items-start space-x-4 p-5 bg-gradient-to-br from-red-50/60 to-rose-50/40 rounded-2xl border border-red-100/60">
                                    <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-200 transition-colors shadow-sm">
                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700 leading-relaxed font-medium">{painPoint}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}