'use client';

import { Persona } from '@/types';

interface HeaderCardProps {
    persona: Persona;
}

export function HeaderCard({ persona }: HeaderCardProps) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getQualityScoreColor = (score: number) => {
        if (score >= 80) return 'score-badge-high';
        if (score >= 60) return 'score-badge-medium';
        return 'score-badge-low';
    };

    return (
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
    );
}