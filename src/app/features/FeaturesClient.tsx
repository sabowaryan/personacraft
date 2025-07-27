'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { featuresService, ProcessStep, Feature, DetailedFeature } from '@/services/featuresService';

export default function FeaturesClient() {
    const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [detailedFeatures, setDetailedFeatures] = useState<DetailedFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<'core' | 'advanced' | 'enterprise'>('core');

    useEffect(() => {
        const loadFeatures = async () => {
            try {
                const [steps, basicFeatures, detailed] = await Promise.all([
                    featuresService.getProcessSteps(),
                    featuresService.getFeatures(),
                    featuresService.getDetailedFeatures()
                ]);

                setProcessSteps(steps);
                setFeatures(basicFeatures);
                setDetailedFeatures(detailed);
            } catch (error) {
                console.error('Error loading features:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFeatures();
    }, []);

    const getCategoryFeatures = () => {
        switch (selectedCategory) {
            case 'core':
                return detailedFeatures.filter(f =>
                    ['ai-generation', 'multi-export', 'real-time'].includes(f.id)
                );
            case 'advanced':
                return detailedFeatures.filter(f =>
                    ['cultural-insights', 'collaboration'].includes(f.id)
                );
            case 'enterprise':
                return detailedFeatures.filter(f =>
                    ['analytics'].includes(f.id)
                );
            default:
                return detailedFeatures;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Fonctionnalités
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Avancées</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Découvrez toutes les capacités de PersonaCraft pour créer des personas marketing précis et exploitables
                    </p>
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            Commencer Maintenant
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Process Steps */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche</h2>
                        <p className="text-lg text-gray-600">Un processus simple en 3 étapes</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {processSteps.map((step, index) => (
                            <div key={step.id} className="relative">
                                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color.from} ${step.color.to} flex items-center justify-center mb-6 ${step.color.shadow} shadow-lg`}>
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                                        </svg>
                                    </div>
                                    <div className="flex items-center mb-4">
                                        <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">
                                            Étape {step.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>

                                {index < processSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Basic Features Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités Principales</h2>
                        <p className="text-lg text-gray-600">Tout ce dont vous avez besoin pour créer des personas efficaces</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <div key={feature.id} className={`bg-gradient-to-br ${feature.color.from} ${feature.color.to} rounded-2xl p-6 text-white hover:scale-105 transition-transform`}>
                                <div className="mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm opacity-90">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Features with Categories */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités Détaillées</h2>
                        <p className="text-lg text-gray-600">Explorez en profondeur nos capacités</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-gray-100 rounded-lg p-1">
                            {(['core', 'advanced', 'enterprise'] as const).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-2 rounded-md font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {category === 'core' && 'Essentiel'}
                                    {category === 'advanced' && 'Avancé'}
                                    {category === 'enterprise' && 'Entreprise'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {getCategoryFeatures().map((feature) => (
                            <div key={feature.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color.from} ${feature.color.to} flex items-center justify-center mb-6`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 mb-4">{feature.description}</p>
                                <p className="text-sm text-gray-500 mb-6">{feature.longDescription}</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Avantages</h4>
                                        <ul className="space-y-1">
                                            {feature.benefits.map((benefit, index) => (
                                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Cas d'usage</h4>
                                        <ul className="space-y-1">
                                            {feature.useCases.map((useCase, index) => (
                                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                                    <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    {useCase}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à créer vos premiers personas ?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Rejoignez des milliers de marketeurs qui utilisent déjà PersonaCraft
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50">
                                Commencer Gratuitement
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                Voir les Tarifs
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}