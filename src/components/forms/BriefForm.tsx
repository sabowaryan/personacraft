'use client';

import { useState, useEffect } from 'react';
import { Building2, Target, Lightbulb, AlertTriangle, Plus, Sparkles, Users, Globe, MapPin, Calendar, History } from 'lucide-react';
import { useBriefs } from '@/hooks/use-briefs';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { PREDEFINED_INTERESTS, PREDEFINED_VALUES } from '@/data/form-constants';

export interface BriefFormData {
    brief: string;
    ageRange: {
        min: number;
        max: number;
    };
    location: string;
    language: 'fr' | 'en';
    personaCount: number;
    interests: string[];
    values: string[];
}

interface BriefFormProps {
    onSubmit: (data: BriefFormData) => void;
    isLoading?: boolean;
    templateData?: BriefFormData | null;
    goToLastStep?: boolean;
}

// Constants moved to separate file for better bundle optimization



export default function BriefForm({ onSubmit, isLoading = false, templateData = null, goToLastStep = false }: BriefFormProps) {
    const { savedBriefs, saveBrief, deleteBrief } = useBriefs();
    const { preferences } = useUserPreferences();
    
    const [formData, setFormData] = useState<BriefFormData>({
        brief: '',
        ageRange: { min: 25, max: 45 },
        location: '',
        language: preferences.language,
        personaCount: 2,
        interests: [],
        values: []
    });

    const [newInterest, setNewInterest] = useState('');
    const [newValue, setNewValue] = useState('');
    const [activeStep, setActiveStep] = useState(1);
    const [showBriefHistory, setShowBriefHistory] = useState(false);

    // Synchroniser la langue avec les préférences utilisateur
    useEffect(() => {
        setFormData(prev => ({ ...prev, language: preferences.language }));
    }, [preferences.language]);

    // Initialiser avec les données de template si disponibles
    useEffect(() => {
        if (templateData) {
            setFormData(templateData);
        }
        if (goToLastStep) {
            setActiveStep(3);
        }
    }, [templateData, goToLastStep]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Sauvegarder le brief dans l'historique
        if (formData.brief.trim()) {
            saveBrief(formData.brief.trim());
        }
        
        onSubmit(formData);
    };

    const loadBriefFromHistory = (brief: string) => {
        setFormData(prev => ({ ...prev, brief }));
        setShowBriefHistory(false);
    };

    const addInterest = (interest: string) => {
        if (interest && !formData.interests.includes(interest)) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, interest]
            }));
        }
    };

    const removeInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    const addValue = (value: string) => {
        if (value && !formData.values.includes(value)) {
            setFormData(prev => ({
                ...prev,
                values: [...prev.values, value]
            }));
        }
    };

    const removeValue = (value: string) => {
        setFormData(prev => ({
            ...prev,
            values: prev.values.filter(v => v !== value)
        }));
    };

    const addCustomInterest = () => {
        if (newInterest.trim()) {
            addInterest(newInterest.trim());
            setNewInterest('');
        }
    };

    const addCustomValue = () => {
        if (newValue.trim()) {
            addValue(newValue.trim());
            setNewValue('');
        }
    };

    const steps = [
        { id: 1, title: 'Brief Marketing', icon: Building2 },
        { id: 2, title: 'Configuration', icon: Target },
        { id: 3, title: 'Personnalisation', icon: Sparkles }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-in slide-in-from-top-2 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-6 border-b border-white/20">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-persona-violet to-secondary rounded-2xl mb-6 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-persona-violet to-secondary bg-clip-text text-transparent mb-4">
                        Créer vos Personas IA
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Transformez vos données business en personas détaillés et exploitables grâce à l'intelligence artificielle
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-4 border-b border-white/10">
                    <div className="flex items-center justify-center">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${activeStep >= step.id
                                        ? 'bg-gradient-to-br from-persona-violet to-secondary border-persona-violet text-white shadow-lg'
                                        : 'border-slate-300 text-slate-400 bg-white'
                                        }`}>
                                        {activeStep > step.id ? (
                                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-persona-violet" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <IconComponent className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="ml-4 hidden sm:block">
                                        <p className={`text-sm font-semibold ${activeStep >= step.id ? 'text-persona-violet' : 'text-slate-500'
                                            }`}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 sm:w-24 h-0.5 mx-6 transition-colors duration-300 ${activeStep > step.id ? 'bg-gradient-to-r from-persona-violet to-secondary' : 'bg-slate-300'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 pb-8">
                    {/* Étape 1: Brief principal */}
                    {activeStep === 1 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-in slide-in-from-top-2 relative">
                            <div className="bg-gradient-to-r from-persona-violet/5 to-secondary/5 px-8 py-6 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-persona-violet/20 to-purple-200 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-persona-violet" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Brief Marketing</h2>
                                        <p className="text-slate-600">Décrivez votre projet pour créer des personas adaptés</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="max-w-3xl mx-auto">
                                    <label htmlFor="brief" className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-persona-violet" />
                                        Description de votre projet *
                                    </label>
                                    <textarea
                                        id="brief"
                                        value={formData.brief}
                                        onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                                        placeholder="Exemple: Application mobile de fitness pour femmes actives de 25-40 ans, urbaines, soucieuses de leur bien-être et cherchant à équilibrer vie professionnelle et personnelle..."
                                        className="w-full h-48 px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet transition-all duration-200 resize-none text-sm leading-relaxed placeholder:text-slate-400"
                                        required
                                        maxLength={1000}
                                    />
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            {formData.brief.length}/1000 caractères
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {savedBriefs.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowBriefHistory(!showBriefHistory)}
                                                    className="text-xs text-persona-violet hover:text-persona-violet/80 flex items-center gap-1 transition-colors"
                                                >
                                                    <History className="w-3 h-3" />
                                                    Historique ({savedBriefs.length})
                                                </button>
                                            )}
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Lightbulb className="w-3 h-3" />
                                                Plus votre description est détaillée, plus vos personas seront précis
                                            </div>
                                        </div>
                                    </div>

                                    {/* Historique des briefs */}
                                    {showBriefHistory && savedBriefs.length > 0 && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <History className="w-4 h-4" />
                                                Briefs précédents
                                            </h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {savedBriefs.map((brief, index) => (
                                                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100 hover:border-persona-violet/20 transition-colors">
                                                        <button
                                                            type="button"
                                                            onClick={() => loadBriefFromHistory(brief)}
                                                            className="flex-1 text-left text-sm text-slate-600 hover:text-slate-800 transition-colors"
                                                        >
                                                            {brief.length > 100 ? `${brief.substring(0, 100)}...` : brief}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteBrief(brief)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(2)}
                                        disabled={!formData.brief.trim()}
                                        className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Continuer
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Étape 2: Configuration */}
                    {activeStep === 2 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-in slide-in-from-top-2 relative">
                            <div className="bg-gradient-to-r from-secondary/5 to-blue-50/50 px-8 py-6 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-blue-200 rounded-xl flex items-center justify-center">
                                        <Target className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Configuration</h2>
                                        <p className="text-slate-600">Définissez les paramètres de base pour vos personas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Configuration de base */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Nombre de personas */}
                                    <div className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 rounded-xl p-6 border border-purple-200/50">
                                        <label htmlFor="personaCount" className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-persona-violet" />
                                            Nombre de personas
                                        </label>
                                        <select
                                            id="personaCount"
                                            value={formData.personaCount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, personaCount: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet transition-all duration-200"
                                        >
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num} persona{num > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-600 mt-2">
                                            Recommandé: 2-3 personas pour une analyse complète
                                        </p>
                                    </div>

                                    {/* Langue */}
                                    <div className="bg-gradient-to-br from-green-50/50 to-green-100/30 rounded-xl p-6 border border-green-200/50">
                                        <label htmlFor="language" className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-success" />
                                            Langue
                                        </label>
                                        <select
                                            id="language"
                                            value={formData.language}
                                            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'fr' | 'en' }))}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success/20 focus:border-success transition-all duration-200"
                                        >
                                            <option value="fr">🇫🇷 Français</option>
                                            <option value="en">🇺🇸 English</option>
                                        </select>
                                    </div>

                                    {/* Localisation */}
                                    <div className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 rounded-xl p-6 border border-orange-200/50">
                                        <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-accent" />
                                            Localisation
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            placeholder="Ex: Paris, Lyon, Marseille, France, Europe..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 placeholder:text-slate-400"
                                        />
                                        <p className="text-xs text-slate-600 mt-2">
                                            Saisissez la ville, région ou pays de votre marché cible
                                        </p>
                                    </div>
                                </div>

                                {/* Tranche d'âge */}
                                <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 rounded-xl p-6 border border-blue-200/50">
                                    <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-secondary" />
                                        Tranche d'âge cible
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="minAge" className="block text-xs font-medium text-slate-600 mb-2">Âge minimum</label>
                                            <input
                                                type="number"
                                                id="minAge"
                                                min="18"
                                                max="80"
                                                value={formData.ageRange.min}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    ageRange: { ...prev.ageRange, min: parseInt(e.target.value) }
                                                }))}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="maxAge" className="block text-xs font-medium text-slate-600 mb-2">Âge maximum</label>
                                            <input
                                                type="number"
                                                id="maxAge"
                                                min="18"
                                                max="80"
                                                value={formData.ageRange.max}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    ageRange: { ...prev.ageRange, max: parseInt(e.target.value) }
                                                }))}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700">Tranche sélectionnée:</span>
                                            <span className="text-sm font-bold text-secondary">
                                                {formData.ageRange.min} - {formData.ageRange.max} ans
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between p-8 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(1)}
                                    className="btn-outline px-6 py-3 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Retour
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(3)}
                                    className="btn-primary px-8 py-3 flex items-center gap-2"
                                >
                                    Continuer
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Étape 3: Personnalisation */}
                    {activeStep === 3 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-in slide-in-from-top-2 relative">
                            <div className="bg-gradient-to-r from-accent/5 to-yellow-50/50 px-4 sm:px-8 py-6 border-b border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-yellow-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Personnalisation</h2>
                                        <p className="text-sm sm:text-base text-slate-600">Ajoutez des intérêts et valeurs spécifiques (optionnel)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-8">
                                {/* Layout responsive en grille */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    {/* Section Intérêts */}
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl p-4 sm:p-6 border border-blue-200/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                                                    <Lightbulb className="w-4 h-4 text-secondary" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-semibold text-slate-700">Centres d'intérêt</h3>
                                            </div>

                                            {/* Saisie d'intérêt */}
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                                                <input
                                                    type="text"
                                                    value={newInterest}
                                                    onChange={(e) => setNewInterest(e.target.value)}
                                                    placeholder="Ex: Sport, Technologie..."
                                                    className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200 placeholder:text-slate-400 text-sm"
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addCustomInterest}
                                                    disabled={!newInterest.trim()}
                                                    className="w-full sm:w-auto sm:max-w-[120px] px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0"
                                                >
                                                    <Plus className="w-4 h-4 flex-shrink-0" />
                                                    <span className="hidden sm:inline">Ajouter</span>
                                                </button>
                                            </div>

                                            {/* Intérêts sélectionnés */}
                                            {formData.interests.length > 0 && (
                                                <div className="mb-4 p-3 bg-white/60 rounded-lg border border-secondary/10">
                                                    <div className="text-xs text-slate-600 mb-2 font-medium flex items-center gap-1">
                                                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                                        Sélectionnés ({formData.interests.length})
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.interests.map(interest => (
                                                            <span
                                                                key={interest}
                                                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/15 transition-colors"
                                                            >
                                                                {interest}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeInterest(interest)}
                                                                    className="ml-2 text-secondary/70 hover:text-secondary transition-colors hover:bg-secondary/20 rounded-full w-4 h-4 flex items-center justify-center"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Suggestions d'intérêts */}
                                            <div>
                                                <div className="text-xs text-slate-600 mb-3 font-medium flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                                    Suggestions populaires
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {PREDEFINED_INTERESTS.filter(interest => !formData.interests.includes(interest)).slice(0, 12).map(interest => (
                                                        <button
                                                            key={interest}
                                                            type="button"
                                                            onClick={() => addInterest(interest)}
                                                            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-secondary/30 hover:text-secondary transition-all duration-200 text-slate-600 text-left"
                                                        >
                                                            {interest}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Valeurs */}
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-xl p-4 sm:p-6 border border-green-200/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                                                    <AlertTriangle className="w-4 h-4 text-success" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-semibold text-slate-700">Valeurs importantes</h3>
                                            </div>

                                            {/* Saisie de valeur */}
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                                                <input
                                                    type="text"
                                                    value={newValue}
                                                    onChange={(e) => setNewValue(e.target.value)}
                                                    placeholder="Ex: Authenticité, Innovation..."
                                                    className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success/20 focus:border-success transition-all duration-200 placeholder:text-slate-400 text-sm"
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomValue())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addCustomValue}
                                                    disabled={!newValue.trim()}
                                                    className="w-full sm:w-auto sm:max-w-[120px] px-3 sm:px-4 py-2.5 sm:py-3 bg-success text-white rounded-xl hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0"
                                                >
                                                    <Plus className="w-4 h-4 flex-shrink-0" />
                                                    <span className="hidden sm:inline">Ajouter</span>
                                                </button>
                                            </div>

                                            {/* Valeurs sélectionnées */}
                                            {formData.values.length > 0 && (
                                                <div className="mb-4 p-3 bg-white/60 rounded-lg border border-success/10">
                                                    <div className="text-xs text-slate-600 mb-2 font-medium flex items-center gap-1">
                                                        <div className="w-2 h-2 bg-success rounded-full"></div>
                                                        Sélectionnées ({formData.values.length})
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.values.map(value => (
                                                            <span
                                                                key={value}
                                                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-success/10 text-success border border-success/20 hover:bg-success/15 transition-colors"
                                                            >
                                                                {value}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeValue(value)}
                                                                    className="ml-2 text-success/70 hover:text-success transition-colors hover:bg-success/20 rounded-full w-4 h-4 flex items-center justify-center"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Suggestions de valeurs */}
                                            <div>
                                                <div className="text-xs text-slate-600 mb-3 font-medium flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                                    Suggestions populaires
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {PREDEFINED_VALUES.filter(value => !formData.values.includes(value)).slice(0, 12).map(value => (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => addValue(value)}
                                                            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-success/30 hover:text-success transition-all duration-200 text-slate-600 text-left"
                                                        >
                                                            {value}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Note d'aide */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-200/30">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-700 font-medium mb-1">💡 Conseil</p>
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                Ces informations sont optionnelles mais permettront de créer des personas plus précis et adaptés à votre audience cible.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions finales */}
                            <div className="p-4 sm:p-8 border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(2)}
                                        className="btn-outline px-6 py-3 flex items-center justify-center gap-2 order-2 sm:order-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Retour
                                    </button>

                                    <div className="flex-1 sm:max-w-md order-1 sm:order-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !formData.brief.trim()}
                                            className="w-full px-6 sm:px-8 py-4 bg-gradient-to-r from-persona-violet to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-persona-violet/25 focus:outline-none focus:ring-2 focus:ring-persona-violet/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 text-sm sm:text-base"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span className="hidden sm:inline">Génération en cours...</span>
                                                    <span className="sm:hidden">Génération...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    <span className="hidden sm:inline">
                                                        Générer {formData.personaCount} persona{formData.personaCount > 1 ? 's' : ''}
                                                    </span>
                                                    <span className="sm:hidden">
                                                        Générer ({formData.personaCount})
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Résumé des sélections */}
                                {(formData.interests.length > 0 || formData.values.length > 0) && (
                                    <div className="mt-4 p-3 bg-white/60 rounded-lg border border-slate-200/50">
                                        <div className="text-xs text-slate-600 font-medium mb-2">Résumé de votre personnalisation :</div>
                                        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                                            {formData.interests.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Lightbulb className="w-3 h-3 text-secondary" />
                                                    {formData.interests.length} intérêt{formData.interests.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {formData.values.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3 text-success" />
                                                    {formData.values.length} valeur{formData.values.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer Info */}
                <div className="text-center mt-12 mb-8 text-slate-500 text-sm bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="flex items-center justify-center gap-2">
                        <span className="text-green-500">🔒</span>
                        Vos données sont sécurisées et utilisées uniquement pour générer vos personas
                    </p>
                </div>
            </div>
        </div>
    );
}