'use client';

import { Persona } from '@/types';

interface PsychographicsTabProps {
    persona: Persona;
}

// Composant pour le graphique radar des traits de personnalité
function PersonalityRadarChart({ traits }: { traits: string[] }) {
    const maxTraits = 6;
    const displayTraits = traits.slice(0, maxTraits);
    const angleStep = 360 / maxTraits;

    return (
        <div className="relative w-48 h-48 mx-auto mb-4">
            <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Grille de fond */}
                {[1, 2, 3, 4, 5].map((level) => (
                    <polygon
                        key={level}
                        points={Array.from({ length: maxTraits }, (_, i) => {
                            const angle = (i * angleStep - 90) * (Math.PI / 180);
                            const radius = (level * 15) + 25;
                            const x = 100 + radius * Math.cos(angle);
                            const y = 100 + radius * Math.sin(angle);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                    />
                ))}

                {/* Lignes radiales */}
                {Array.from({ length: maxTraits }, (_, i) => {
                    const angle = (i * angleStep - 90) * (Math.PI / 180);
                    const x = 100 + 100 * Math.cos(angle);
                    const y = 100 + 100 * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1="100"
                            y1="100"
                            x2={x}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Données de la personnalité */}
                <polygon
                    points={displayTraits.map((_, i) => {
                        const angle = (i * angleStep - 90) * (Math.PI / 180);
                        const radius = 70; // Valeur fixe pour la démo
                        const x = 100 + radius * Math.cos(angle);
                        const y = 100 + radius * Math.sin(angle);
                        return `${x},${y}`;
                    }).join(' ')}
                    fill="rgba(147, 51, 234, 0.2)"
                    stroke="#9333ea"
                    strokeWidth="2"
                />

                {/* Points de données */}
                {displayTraits.map((_, i) => {
                    const angle = (i * angleStep - 90) * (Math.PI / 180);
                    const radius = 70;
                    const x = 100 + radius * Math.cos(angle);
                    const y = 100 + radius * Math.sin(angle);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#9333ea"
                        />
                    );
                })}

                {/* Labels */}
                {displayTraits.map((trait, i) => {
                    const angle = (i * angleStep - 90) * (Math.PI / 180);
                    const radius = 90;
                    const x = 100 + radius * Math.cos(angle);
                    const y = 100 + radius * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-medium fill-purple-700"
                        >
                            {trait.length > 8 ? trait.substring(0, 8) + '...' : trait}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

// Composant pour le graphique en barres des valeurs
function ValuesBarChart({ values }: { values: string[] }) {
    return (
        <div className="space-y-3">
            {values.map((value, index) => {
                const percentage = Math.max(60, 100 - (index * 10)); // Simulation de données
                return (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-emerald-800">{value}</span>
                            <span className="text-xs text-emerald-600">{percentage}%</span>
                        </div>
                        <div className="w-full bg-emerald-100 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Composant pour les intérêts avec indicateurs de niveau
function InterestsLevelChart({ interests }: { interests: string[] }) {
    return (
        <div className="grid grid-cols-1 gap-3">
            {interests.map((interest, index) => {
                const level = Math.max(3, 5 - (index % 3)); // Simulation de niveaux
                return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                        <span className="text-sm font-medium text-orange-800">{interest}</span>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((dot) => (
                                <div
                                    key={dot}
                                    className={`w-2 h-2 rounded-full ${dot <= level
                                            ? 'bg-orange-500'
                                            : 'bg-orange-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function PsychographicsTab({ persona }: PsychographicsTabProps) {
    return (
        <div className="space-y-8">
            {/* Vue d'ensemble avec métriques */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <svg className="w-7 h-7 mr-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Profil Psychographique
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{persona.psychographics.personality.length}</div>
                        <div className="text-sm text-neutral-600">Traits</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{persona.psychographics.values.length}</div>
                        <div className="text-sm text-neutral-600">Valeurs</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{persona.psychographics.interests.length}</div>
                        <div className="text-sm text-neutral-600">Intérêts</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{persona.psychographics.lifestyle.split(' ').length}</div>
                        <div className="text-sm text-neutral-600">Mots-clés</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personnalité avec graphique radar */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Traits de personnalité
                    </h3>

                    <PersonalityRadarChart traits={persona.psychographics.personality} />

                    <div className="flex flex-wrap gap-2 mt-4">
                        {persona.psychographics.personality.map((trait, index) => (
                            <span key={index} className="px-3 py-1.5 bg-white/70 text-purple-800 rounded-full text-sm font-medium border border-purple-200 hover:bg-white transition-colors">
                                {trait}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Valeurs avec graphique en barres */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Valeurs importantes
                    </h3>

                    <ValuesBarChart values={persona.psychographics.values} />
                </div>

                {/* Centres d'intérêt avec niveaux */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Centres d'intérêt
                    </h3>

                    <InterestsLevelChart interests={persona.psychographics.interests} />
                </div>

                {/* Style de vie enrichi */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
                        </svg>
                        Style de vie
                    </h3>

                    <div className="bg-white/60 rounded-lg p-4 mb-4">
                        <p className="text-neutral-700 leading-relaxed">
                            {persona.psychographics.lifestyle}
                        </p>
                    </div>

                    {/* Mots-clés du style de vie */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-indigo-800">Mots-clés identifiés</h4>
                        <div className="flex flex-wrap gap-2">
                            {persona.psychographics.lifestyle
                                .split(/[,.\s]+/)
                                .filter(word => word.length > 3)
                                .slice(0, 8)
                                .map((keyword, index) => (
                                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                        {keyword}
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}