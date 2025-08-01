'use client';

import React from 'react';
import { EnrichedPersona } from '@/types/enhanced-persona';
import { CulturalData } from '@/types';

interface CulturalDataTabProps {
  persona: EnrichedPersona;
}

interface CulturalCategoryCardProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    tag: string;
  };
  source?: string;
  confidence?: number;
}

const CulturalCategoryCard: React.FC<CulturalCategoryCardProps> = ({
  title,
  items,
  icon,
  colorScheme,
  source,
  confidence
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`${colorScheme.bg} rounded-xl p-6 card-hover`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-lg font-bold ${colorScheme.text} flex items-center`}>
          {icon}
          <span className="ml-3">{title}</span>
        </h4>
        <div className="flex items-center space-x-2">
          {source && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              source === 'qloo' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {source === 'qloo' ? 'Qloo' : 'Fallback'}
            </span>
          )}
          {confidence && (
            <span className="text-xs text-neutral-600 font-medium">
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span 
            key={index} 
            className={`px-3 py-1.5 ${colorScheme.tag} rounded-lg text-sm font-medium ${colorScheme.border} hover:bg-white/80 transition-colors cursor-pointer`}
          >
            {item}
          </span>
        ))}
      </div>
      
      {items.length > 8 && (
        <div className="mt-3 text-xs text-neutral-500">
          {items.length} éléments au total
        </div>
      )}
    </div>
  );
};

const SourceIndicator: React.FC<{ source: string; confidence?: number }> = ({ source, confidence }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-3 h-3 rounded-full ${
      source === 'qloo' ? 'bg-green-500' : 'bg-amber-500'
    }`} />
    <span className="text-sm font-medium text-neutral-700">
      {source === 'qloo' ? 'Données Qloo' : 'Données de fallback'}
    </span>
    {confidence && (
      <span className="text-sm text-neutral-500">
        ({Math.round(confidence * 100)}% confiance)
      </span>
    )}
  </div>
);

const CulturalRichnessIndicator: React.FC<{ culturalData: CulturalData }> = ({ culturalData }) => {
  const calculateRichness = () => {
    const totalItems = Object.values(culturalData).flat().length;
    if (totalItems > 50) return { level: 'high', label: 'Très riche', color: 'text-green-600', bg: 'bg-green-100' };
    if (totalItems > 20) return { level: 'medium', label: 'Modéré', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { level: 'low', label: 'Basique', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const richness = calculateRichness();
  const totalItems = Object.values(culturalData).flat().length;

  return (
    <div className={`${richness.bg} rounded-lg p-4 border-l-4 ${richness.color.replace('text-', 'border-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-neutral-900">Richesse des données culturelles</h4>
          <p className={`text-sm ${richness.color} font-medium`}>{richness.label}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-neutral-900">{totalItems}</div>
          <div className="text-xs text-neutral-600">éléments</div>
        </div>
      </div>
    </div>
  );
};

export const CulturalDataTab: React.FC<CulturalDataTabProps> = ({ persona }) => {
  const { culturalData, generationMetadata } = persona;

  if (!culturalData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune donnée culturelle</h3>
        <p className="text-neutral-600">Ce persona ne contient pas de données culturelles enrichies.</p>
      </div>
    );
  }

  const categories = [
    {
      key: 'music',
      title: 'Musique',
      items: culturalData.music || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
        text: 'text-pink-900',
        border: 'border border-pink-200',
        tag: 'bg-white/70 text-pink-800'
      }
    },
    {
      key: 'movies',
      title: 'Films',
      items: culturalData.movie || culturalData.movie || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
        text: 'text-purple-900',
        border: 'border border-purple-200',
        tag: 'bg-white/70 text-purple-800'
      }
    },
    {
      key: 'tv',
      title: 'Séries TV',
      items: culturalData.tv || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        text: 'text-blue-900',
        border: 'border border-blue-200',
        tag: 'bg-white/70 text-blue-800'
      }
    },
    {
      key: 'books',
      title: 'Livres',
      items: culturalData.book || culturalData.book || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        text: 'text-emerald-900',
        border: 'border border-emerald-200',
        tag: 'bg-white/70 text-emerald-800'
      }
    },
    {
      key: 'brands',
      title: 'Marques',
      items: culturalData.brand || culturalData.brand || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
        text: 'text-amber-900',
        border: 'border border-amber-200',
        tag: 'bg-white/70 text-amber-800'
      }
    },
    {
      key: 'restaurants',
      title: 'Restaurants',
      items: culturalData.restaurant || culturalData.restaurant || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-red-50 to-pink-50',
        text: 'text-red-900',
        border: 'border border-red-200',
        tag: 'bg-white/70 text-red-800'
      }
    },
    {
      key: 'travel',
      title: 'Voyage',
      items: culturalData.travel || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        text: 'text-green-900',
        border: 'border border-green-200',
        tag: 'bg-white/70 text-green-800'
      }
    },
    {
      key: 'socialMedia',
      title: 'Réseaux sociaux',
      items: culturalData.socialMedia || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
        text: 'text-indigo-900',
        border: 'border border-indigo-200',
        tag: 'bg-white/70 text-indigo-800'
      }
    },
    {
      key: 'food',
      title: 'Alimentation',
      items: culturalData.food || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-orange-50 to-red-50',
        text: 'text-orange-900',
        border: 'border border-orange-200',
        tag: 'bg-white/70 text-orange-800'
      }
    },
    {
      key: 'fashion',
      title: 'Mode',
      items: culturalData.fashion || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
        text: 'text-purple-900',
        border: 'border border-purple-200',
        tag: 'bg-white/70 text-purple-800'
      }
    },
    {
      key: 'beauty',
      title: 'Beauté',
      items: culturalData.beauty || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
        text: 'text-pink-900',
        border: 'border border-pink-200',
        tag: 'bg-white/70 text-pink-800'
      }
    },
    {
      key: 'influencers',
      title: 'Influenceurs',
      items: culturalData.influencers || [],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-cyan-50 to-blue-50',
        text: 'text-cyan-900',
        border: 'border border-cyan-200',
        tag: 'bg-white/70 text-cyan-800'
      }
    }
  ];

  // Add optional categories if they exist
  if (culturalData.podcasts?.length) {
    categories.push({
      key: 'podcasts',
      title: 'Podcasts',
      items: culturalData.podcasts,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
        text: 'text-slate-900',
        border: 'border border-slate-200',
        tag: 'bg-white/70 text-slate-800'
      }
    });
  }

  if (culturalData.videoGames?.length) {
    categories.push({
      key: 'videoGames',
      title: 'Jeux vidéo',
      items: culturalData.videoGames,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      colorScheme: {
        bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
        text: 'text-violet-900',
        border: 'border border-violet-200',
        tag: 'bg-white/70 text-violet-800'
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Header with metadata */}
      <div className="bg-gradient-to-r from-persona-violet/5 to-secondary/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text flex items-center">
            <svg className="w-7 h-7 mr-3 text-persona-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
            </svg>
            Données culturelles enrichies
          </h2>
          {generationMetadata && (
            <SourceIndicator 
              source={generationMetadata.qlooDataUsed ? 'qloo' : 'fallback'} 
            />
          )}
        </div>
        
        <CulturalRichnessIndicator culturalData={culturalData} />
      </div>

      {/* Cultural categories grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <CulturalCategoryCard
            key={category.key}
            title={category.title}
            items={category.items}
            icon={category.icon}
            colorScheme={category.colorScheme}
            source={generationMetadata?.qlooDataUsed ? 'qloo' : 'fallback'}
          />
        ))}
      </div>

      {/* Interactive exploration section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-xl font-bold text-text mb-4 flex items-center">
          <svg className="w-6 h-6 mr-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Exploration des relations culturelles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Cohérence thématique</h4>
            <p className="text-sm text-blue-700">
              Les préférences culturelles montrent une cohérence dans les goûts et les valeurs exprimées.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Diversité culturelle</h4>
            <p className="text-sm text-green-700">
              Le profil présente une diversité équilibrée entre différents domaines culturels.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Tendances émergentes</h4>
            <p className="text-sm text-purple-700">
              Certaines préférences reflètent des tendances culturelles actuelles et émergentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};