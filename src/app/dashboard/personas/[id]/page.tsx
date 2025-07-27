'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePersona } from '@/hooks/use-persona';
import { Persona } from '@/types';
import { SocialMediaInsights } from '@/components/insights/SocialMediaInsights';


export default function PersonaDetailPage() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const { personas, loadPersonas } = usePersona();
    const [persona, setPersona] = useState<Persona | null>(null);

    useEffect(() => {
        loadPersonas();
    }, [loadPersonas]);

    useEffect(() => {
        if (personas.length > 0 && params.id) {
            const foundPersona = personas.find(p => p.id === params.id);
            setPersona(foundPersona || null);
        }
    }, [personas, params.id]);

    if (!persona) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center card-hover">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-persona-violet/10 to-persona-violet/20 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-text mb-3">Persona introuvable</h3>
                        <p className="text-neutral-600 mb-8 max-w-md mx-auto">Le persona que vous recherchez n'existe pas ou a été supprimé.</p>
                        <Link
                            href="/dashboard/personas"
                            className="btn-primary inline-flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour aux personas
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        {
            id: 'overview',
            label: 'Vue d\'ensemble',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: 'demographics',
            label: 'Démographie',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            id: 'psychographics',
            label: 'Psychographie',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        {
            id: 'behaviors',
            label: 'Marketing & Culture',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                </svg>
            )
        }
    ];

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getQualityScoreColor = (score: number) => {
        if (score >= 80) return 'score-badge-high';
        if (score >= 60) return 'score-badge-medium';
        return 'score-badge-low';
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto p-6">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-neutral-600 mb-8 animate-in slide-in-from-top-2">
                    <Link href="/dashboard" className="hover:text-persona-violet transition-colors">
                        Dashboard
                    </Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <Link href="/dashboard/personas" className="hover:text-persona-violet transition-colors">
                        Personas
                    </Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-text font-medium">{persona.name}</span>
                </nav>

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-8 card-hover animate-in slide-in-from-top-2">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="flex items-start space-x-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-persona-violet to-persona-violet/80 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {getInitials(persona.name)}
                                </div>
                                <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-lg text-xs font-semibold ${getQualityScoreColor(persona.qualityScore)}`}>
                                    {persona.qualityScore}%
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-text mb-2">{persona.name}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-neutral-600 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a2 2 0 01-2 2h-3v8a2 2 0 01-2 2H10a2 2 0 01-2-2v-8H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                                        </svg>
                                        <span className="font-medium">{persona.age} ans</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                                        </svg>
                                        <span className="font-medium">{persona.occupation}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium">{persona.location}</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-neutral-500">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a2 2 0 01-2 2h-3v8a2 2 0 01-2 2H10a2 2 0 01-2-2v-8H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                                    </svg>
                                    Créé le {new Date(persona.createdAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button className="btn-outline flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Dupliquer</span>
                            </button>
                            <button className="btn-primary flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Modifier</span>
                            </button>
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-persona-violet/5 to-secondary/5 rounded-xl border-l-4 border-persona-violet">
                        <div className="flex items-start space-x-4">
                            <svg className="w-8 h-8 text-persona-violet flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                            </svg>
                            <p className="text-lg text-text italic leading-relaxed">"{persona.quote}"</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden card-hover animate-in slide-in-from-top-2">
                    <div className="border-b border-neutral-200 bg-background/50">
                        <nav className="flex space-x-0 px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${activeTab === tab.id
                                        ? 'border-persona-violet text-persona-violet bg-white'
                                        : 'border-transparent text-neutral-500 hover:text-text hover:border-persona-violet/30'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Biographie */}
                                    <div className="lg:col-span-2">
                                        <div className="bg-gradient-to-br from-persona-violet/5 to-secondary/5 rounded-xl p-6 card-hover">
                                            <h3 className="text-xl font-bold text-text mb-4 flex items-center">
                                                <svg className="w-6 h-6 mr-3 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                Biographie
                                            </h3>
                                            <p className="text-neutral-700 leading-relaxed">{persona.bio}</p>
                                        </div>
                                    </div>

                                    {/* Informations clés */}
                                    <div>
                                        <div className="bg-white rounded-xl border border-neutral-200 p-6 card-hover">
                                            <h3 className="text-xl font-bold text-text mb-4 flex items-center">
                                                <svg className="w-6 h-6 mr-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Informations clés
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                                                    <span className="text-neutral-600 font-medium">Localisation</span>
                                                    <span className="text-text font-semibold">{persona.location}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                                                    <span className="text-neutral-600 font-medium">Revenus</span>
                                                    <span className="text-text font-semibold">{persona.demographics.income}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                                                    <span className="text-neutral-600 font-medium">Éducation</span>
                                                    <span className="text-text font-semibold">{persona.demographics.education}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                                                    <span className="text-neutral-600 font-medium">Famille</span>
                                                    <span className="text-text font-semibold">{persona.demographics.familyStatus}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-neutral-600 font-medium">Score qualité</span>
                                                    <span className={`font-bold px-3 py-1 rounded-lg ${getQualityScoreColor(persona.qualityScore)}`}>
                                                        {persona.qualityScore}/100
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Objectifs */}
                                    <div className="section-goals rounded-xl p-6 card-hover">
                                        <h3 className="text-xl font-bold text-text mb-4 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            Objectifs
                                        </h3>
                                        <div className="space-y-3">
                                            {persona.goals.map((goal, index) => (
                                                <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                                                    <div className="w-2 h-2 bg-success rounded-full flex-shrink-0 mt-2"></div>
                                                    <span className="text-neutral-700 leading-relaxed">{goal}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Points de friction */}
                                    <div className="section-pain-points rounded-xl p-6 card-hover">
                                        <h3 className="text-xl font-bold text-text mb-4 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            Points de friction
                                        </h3>
                                        <div className="space-y-3">
                                            {persona.painPoints.map((painPoint, index) => (
                                                <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                                                    <div className="w-2 h-2 bg-error rounded-full flex-shrink-0 mt-2"></div>
                                                    <span className="text-neutral-700 leading-relaxed">{painPoint}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Demographics Tab */}
                        {activeTab === 'demographics' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="section-demographics rounded-xl p-6 card-hover">
                                        <h3 className="text-xl font-bold text-text mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Données démographiques
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="bg-white/60 rounded-lg p-4">
                                                <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Localisation</label>
                                                <p className="text-lg text-text font-medium mt-1">{persona.location}</p>
                                            </div>
                                            <div className="bg-white/60 rounded-lg p-4">
                                                <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Revenus annuels</label>
                                                <p className="text-lg text-text font-medium mt-1">{persona.demographics.income}</p>
                                            </div>
                                            <div className="bg-white/60 rounded-lg p-4">
                                                <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Éducation</label>
                                                <p className="text-lg text-text font-medium mt-1">{persona.demographics.education}</p>
                                            </div>
                                            <div className="bg-white/60 rounded-lg p-4">
                                                <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Situation familiale</label>
                                                <p className="text-lg text-text font-medium mt-1">{persona.demographics.familyStatus}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistiques visuelles */}
                                    <div className="bg-white rounded-xl border border-neutral-200 p-6 card-hover">
                                        <h3 className="text-xl font-bold text-text mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Profil démographique
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                                                    <span className="font-medium text-neutral-700">Âge</span>
                                                </div>
                                                <span className="text-2xl font-bold text-text">{persona.age} ans</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-success rounded-full"></div>
                                                    <span className="font-medium text-neutral-700">Profession</span>
                                                </div>
                                                <span className="text-lg font-semibold text-text">{persona.occupation}</span>
                                            </div>
                                            <div className="mt-6 p-4 bg-gradient-to-r from-persona-violet/10 to-secondary/10 rounded-lg">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-persona-violet mb-1">{persona.qualityScore}%</div>
                                                    <div className="text-sm text-neutral-600">Score de qualité</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Psychographics Tab */}
                        {activeTab === 'psychographics' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Personnalité */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                                        <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Traits de personnalité
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {persona.psychographics.personality.map((trait, index) => (
                                                <span key={index} className="px-4 py-2 bg-white/70 text-purple-800 rounded-full text-sm font-medium border border-purple-200 hover:bg-white transition-colors">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Valeurs */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4 flex items-center">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            Valeurs importantes
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.psychographics.values.map((value, index) => (
                                                <span key={index} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/70 text-emerald-800 rounded-full text-xs sm:text-sm font-medium border border-emerald-200 hover:bg-white transition-colors">
                                                    {value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Centres d'intérêt */}
                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4 flex items-center">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                            Centres d'intérêt
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {persona.psychographics.interests.map((interest, index) => (
                                                <span key={index} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/70 text-orange-800 rounded-full text-xs sm:text-sm font-medium border border-orange-200 hover:bg-white transition-colors">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Style de vie */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4 flex items-center">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
                                            </svg>
                                            Style de vie
                                        </h3>
                                        <p className="text-sm sm:text-base text-neutral-700 leading-relaxed bg-white/60 rounded-lg p-3 sm:p-4">
                                            {persona.psychographics.lifestyle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Behaviors Tab */}
                        {activeTab === 'behaviors' && (
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
                                                    {persona.culturalData.movies && Array.isArray(persona.culturalData.movies) && persona.culturalData.movies.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                                                                </svg>
                                                                Films
                                                            </h4>
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                                {persona.culturalData.movies.map((item, index) => (
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
                                                    {persona.culturalData.books && Array.isArray(persona.culturalData.books) && persona.culturalData.books.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                </svg>
                                                                Livres
                                                            </h4>
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                                {persona.culturalData.books.map((item, index) => (
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
                                                    {persona.culturalData.brands && Array.isArray(persona.culturalData.brands) && persona.culturalData.brands.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                                </svg>
                                                                Marques préférées
                                                            </h4>
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                                {persona.culturalData.brands.map((item, index) => (
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
                                                    {persona.culturalData.restaurants && Array.isArray(persona.culturalData.restaurants) && persona.culturalData.restaurants.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-2 sm:mb-3 flex items-center">
                                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                Restaurants
                                                            </h4>
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                                {persona.culturalData.restaurants.map((item, index) => (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}