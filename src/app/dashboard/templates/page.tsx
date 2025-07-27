'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateService, TemplateData } from '@/services/templateService';
import { Sparkles, Search, Filter, Eye, Zap, Crown, Star, Users, Globe, MapPin, Calendar, Target, Lightbulb, X, ShoppingCart, Briefcase, Smartphone, Heart, GraduationCap, DollarSign, FileText } from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadedTemplates = TemplateService.getAllTemplates();
    const loadedCategories = TemplateService.getCategories();
    setTemplates(loadedTemplates);
    setCategories(loadedCategories);
  }, []);

  // Filtrer les templates en fonction de la catégorie et de la recherche
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'Tous' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || TemplateService.searchTemplates(searchQuery).some(t => t.id === template.id);
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: TemplateData) => {
    // Convertir le template en données de formulaire et rediriger vers la page personas
    const briefFormData = TemplateService.templateToBriefFormData(template);

    // Stocker les données dans le sessionStorage pour les récupérer sur la page personas
    sessionStorage.setItem('templateData', JSON.stringify(briefFormData));

    // Indiquer qu'il faut ouvrir le modal automatiquement et aller à la dernière étape
    sessionStorage.setItem('autoOpenModal', 'true');
    sessionStorage.setItem('goToLastStep', 'true');

    // Rediriger vers la page personas où le briefForm sera auto-rempli et ouvert
    router.push('/dashboard/personas');
  };

  const handlePreviewTemplate = (template: TemplateData) => {
    setSelectedTemplate(template);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'E-commerce': ShoppingCart,
      'SaaS': Briefcase,
      'Mobile': Smartphone,
      'Healthcare': Heart,
      'Education': GraduationCap,
      'Finance': DollarSign,
      'Tous': FileText
    };
    const IconComponent = icons[category] || FileText;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filters avec design amélioré */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un template par nom, description ou tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet transition-all duration-200 text-sm placeholder:text-slate-400"
              />
            </div>

            {/* Category Filters avec icônes */}
            <div className="flex items-center gap-3 mb-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Catégories :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedCategory === category
                    ? 'bg-gradient-to-r from-persona-violet to-secondary text-white shadow-lg shadow-persona-violet/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-persona-violet/30 hover:bg-persona-violet/5'
                    }`}
                >
                  <span className="text-base">{getCategoryIcon(category)}</span>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid avec design amélioré */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden card-hover animate-in slide-in-from-top-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header avec gradient et badges */}
              <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 border-b border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-persona-violet/20 to-secondary/20 rounded-xl flex items-center justify-center text-xl">
                      {getCategoryIcon(template.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-persona-violet transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">{template.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {template.isPopular && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg">
                        <Star className="w-3 h-3" />
                        Populaire
                      </span>
                    )}
                    {template.isPremium && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-persona-violet to-secondary text-white shadow-lg">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Configuration rapide */}
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{template.personaCount} personas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{template.ageRange.min}-{template.ageRange.max} ans</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{template.language === 'fr' ? 'FR' : 'EN'}</span>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                {/* Description */}
                <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">
                  {template.description}
                </p>

                {/* Preview avec style amélioré */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-4 mb-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-3 h-3 text-accent" />
                    <span className="text-xs font-semibold text-slate-700">Aperçu du persona :</span>
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed">"{template.preview}"</p>
                </div>

                {/* Tags avec couleurs thématiques */}
                <div className="flex flex-wrap gap-1 mb-6">
                  {template.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${tagIndex === 0 ? 'bg-persona-violet/10 text-persona-violet border border-persona-violet/20' :
                        tagIndex === 1 ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                          'bg-accent/10 text-accent border border-accent/20'
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Actions avec design amélioré */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    Aperçu
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-persona-violet to-secondary hover:from-persona-violet/90 hover:to-secondary/90 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-persona-violet/25"
                  >
                    <Zap className="w-4 h-4" />
                    Utiliser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State avec design amélioré */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Aucun template trouvé</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Aucun template ne correspond à vos critères de recherche actuels.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Essayez de :</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                    Modifier votre recherche
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                    Changer de catégorie
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tous');
                    }}
                    className="inline-flex items-center px-3 py-1 bg-persona-violet/10 text-persona-violet hover:bg-persona-violet/20 rounded-lg text-xs font-medium transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Preview Modal avec design élégant */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] flex flex-col animate-in slide-in-from-top-2">
              {/* Header avec gradient */}
              <div className="bg-gradient-to-br from-persona-violet/5 to-secondary/5 px-8 py-6 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-persona-violet/20 to-secondary/20 rounded-2xl flex items-center justify-center text-2xl">
                      {getCategoryIcon(selectedTemplate.category)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-persona-violet to-secondary bg-clip-text text-transparent">
                        {selectedTemplate.name}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-slate-600 font-medium">{selectedTemplate.category}</span>
                        {selectedTemplate.isPopular && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-accent to-accent/80 text-white">
                            <Star className="w-3 h-3" />
                            Populaire
                          </span>
                        )}
                        {selectedTemplate.isPremium && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-persona-violet to-secondary text-white">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-3 hover:bg-slate-100 rounded-xl transition-colors group"
                  >
                    <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                  </button>
                </div>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8 space-y-8">
                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-persona-violet" />
                      <h3 className="text-lg font-bold text-slate-800">Description</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedTemplate.description}</p>
                  </div>

                  {/* Brief complet */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-bold text-slate-800">Brief complet</h3>
                    </div>
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-100">
                      <p className="text-slate-700 leading-relaxed">{selectedTemplate.brief}</p>
                    </div>
                  </div>

                  {/* Configuration et Tags */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Configuration */}
                    <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl p-6 border border-secondary/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-secondary" />
                        <h4 className="text-lg font-bold text-slate-800">Configuration</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-secondary/10">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600 font-medium">Tranche d'âge</span>
                          </div>
                          <span className="font-bold text-secondary">{selectedTemplate.ageRange.min}-{selectedTemplate.ageRange.max} ans</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-secondary/10">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600 font-medium">Localisation</span>
                          </div>
                          <span className="font-bold text-secondary text-right">{selectedTemplate.location || 'Non spécifiée'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-secondary/10">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600 font-medium">Langue</span>
                          </div>
                          <span className="font-bold text-secondary">{selectedTemplate.language === 'fr' ? 'Français' : 'English'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600 font-medium">Nb. personas</span>
                          </div>
                          <span className="font-bold text-secondary">{selectedTemplate.personaCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-gradient-to-br from-persona-violet/5 to-persona-violet/10 rounded-xl p-6 border border-persona-violet/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-persona-violet" />
                        <h4 className="text-lg font-bold text-slate-800">Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag, index) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${index % 3 === 0 ? 'bg-persona-violet/20 text-persona-violet border border-persona-violet/30' :
                              index % 3 === 1 ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                                'bg-accent/20 text-accent border border-accent/30'
                              }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Intérêts et Valeurs */}
                  {(selectedTemplate.interests.length > 0 || selectedTemplate.values.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {selectedTemplate.interests.length > 0 && (
                        <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-6 border border-success/20">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-success" />
                            <h4 className="text-lg font-bold text-slate-800">Centres d'intérêt</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedTemplate.interests.map((interest) => (
                              <span
                                key={interest}
                                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-success/20 text-success border border-success/30"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTemplate.values.length > 0 && (
                        <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-6 border border-accent/20">
                          <div className="flex items-center gap-2 mb-4">
                            <Star className="w-5 h-5 text-accent" />
                            <h4 className="text-lg font-bold text-slate-800">Valeurs</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedTemplate.values.map((value) => (
                              <span
                                key={value}
                                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-accent/20 text-accent border border-accent/30"
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer avec actions */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-8 py-6 border-t border-slate-100 flex-shrink-0">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <X className="w-4 h-4" />
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      handleUseTemplate(selectedTemplate);
                      setSelectedTemplate(null);
                    }}
                    className="flex-2 inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-persona-violet to-secondary hover:from-persona-violet/90 hover:to-secondary/90 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-persona-violet/25"
                  >
                    <Zap className="w-4 h-4" />
                    Utiliser ce template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}