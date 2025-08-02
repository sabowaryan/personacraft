'use client';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePersona } from '@/hooks/use-persona';
import { Persona } from '@/types';
import { EnrichedPersona } from '@/types/enhanced-persona';

import { CulturalDataTab } from '@/components/personas/tabs/CulturalDataTab';
import { ValidationTab } from '@/components/personas/tabs/ValidationTab';
import { MetadataTab } from '@/components/personas/tabs/MetadataTab';
import { Breadcrumb } from '@/components/personas/detail/Breadcrumb';
import { HeaderCard } from '@/components/personas/tabs/HeaderCard';
import { TabsNavigation } from '@/components/personas/tabs/TabsNavigation';
import { OverviewTab } from '@/components/personas/tabs/OverviewTab';
import { DemographicsTab } from '@/components/personas/tabs/DemographicsTab';
import { PsychographicsTab } from '@/components/personas/tabs/PsychographicsTab';
import { BehaviorsTab } from '@/components/personas/tabs/BehaviorsTab';

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
        },
        {
            id: 'cultural',
            label: 'Données Culturelles',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'validation',
            label: 'Validation',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'metadata',
            label: 'Métadonnées',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
                <Breadcrumb persona={persona as EnrichedPersona} />

                {/* Header Card */}
                <HeaderCard persona={persona as EnrichedPersona} />

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden card-hover animate-in slide-in-from-top-2">
                    <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <OverviewTab persona={persona as EnrichedPersona} />
                        )}

                        {/* Demographics Tab */}
                        {activeTab === 'demographics' && (
                            <DemographicsTab persona={persona as EnrichedPersona} />
                        )}

                        {/* Psychographics Tab */}
                        {activeTab === 'psychographics' && (
                            <PsychographicsTab persona={persona as EnrichedPersona} />
                        )}

                        {/* Behaviors Tab */}
                        {activeTab === 'behaviors' && (
                            <BehaviorsTab persona={persona as EnrichedPersona} />
                        )}

                        {/* Cultural Data Tab */}
                        {activeTab === 'cultural' && (
                            <CulturalDataTab persona={persona as EnrichedPersona} />
                        )}

                        {/* Validation Tab */}
                        {activeTab === 'validation' && (
                            <ValidationTab persona={persona as EnrichedPersona} />
                        )}

                        {/* Metadata Tab */}
                        {activeTab === 'metadata' && (
                            <MetadataTab persona={persona as EnrichedPersona} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}