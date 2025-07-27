'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SocialMediaInsightsProps {
    insights: {
        audienceMatches: Array<{
            name: string;
            relevanceFactors: string[];
            estimatedFollowingOverlap: number;
        }>;
        brandInfluence: Array<{
            brand: string;
            category: string;
            platforms: string[];
            relevanceScore: number;
        }>;
        contentPreferences: string[];
        demographicAlignment: Array<{
            ageGroup: string;
            primaryPlatforms: string[];
            engagementStyle: string;
        }>;
    };
    platforms: string[];
}

export function SocialMediaInsights({ insights, platforms }: SocialMediaInsightsProps) {
    const getRelevanceColor = (score: number) => {
        if (score >= 80) return 'score-badge-high';
        if (score >= 60) return 'score-badge-medium';
        return 'score-badge-low';
    };

    const getPlatformIcon = (platform: string) => {
        const icons: { [key: string]: JSX.Element } = {
            'Instagram': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            ),
            'TikTok': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
            ),
            'YouTube': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            ),
            'Twitter': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
            'LinkedIn': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
            ),
            'Facebook': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            'Snapchat': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001.017 0z"/>
                </svg>
            ),
            'Pinterest': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001.017 0z"/>
                </svg>
            ),
            'Discord': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
            ),
            'GitHub': (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            )
        };
        return icons[platform] || (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
        );
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: JSX.Element } = {
            'Technology': (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            ),
            'Fashion & Lifestyle': (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
            ),
            'Beauty & Cosmetics': (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            ),
            'Entertainment': (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                </svg>
            ),
            'Food & Beverage': (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
                </svg>
            ),
            'General': (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            )
        };
        return icons[category] || icons['General'];
    };

    return (
        <div className="space-y-6">
            {/* Recommended Platforms */}
            <Card className="card-hover border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                        <div className="p-2 bg-gradient-to-br from-persona-violet/10 to-secondary/10 rounded-lg">
                            <svg className="w-5 h-5 text-persona-violet" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 2H7C5.9 2 5 2.9 5 4v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 4h10v16H7V4zm2 2v2h6V6H9zm0 4v2h6v-2H9zm0 4v2h4v-2H9z"/>
                            </svg>
                        </div>
                        Plateformes Recommandées
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {platforms.map((platform) => (
                            <div 
                                key={platform} 
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-persona-violet/20 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="text-persona-violet">
                                    {getPlatformIcon(platform)}
                                </div>
                                <span className="font-medium text-gray-700 text-sm">{platform}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Brand Influence */}
            {insights.brandInfluence.length > 0 && (
                <Card className="card-hover border-0 shadow-sm bg-gradient-to-br from-white to-orange-50/30">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <div className="p-2 bg-gradient-to-br from-accent/10 to-yellow-500/10 rounded-lg">
                                <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            Influence des Marques
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {insights.brandInfluence
                                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                                .map((brand, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-accent/20 hover:shadow-sm transition-all duration-200">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="text-accent">
                                                {getCategoryIcon(brand.category)}
                                            </div>
                                            <div className="font-semibold text-gray-900">{brand.brand}</div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-3">{brand.category}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {brand.platforms.map(platform => (
                                                <div key={platform} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded-md border">
                                                    <div className="text-gray-500">
                                                        {getPlatformIcon(platform)}
                                                    </div>
                                                    {platform}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Badge className={`${getRelevanceColor(brand.relevanceScore)} font-semibold px-3 py-1`}>
                                        {brand.relevanceScore}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Demographic Alignment */}
            {insights.demographicAlignment.length > 0 && (
                <Card className="card-hover border-0 shadow-sm section-demographics">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-lg">
                                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7.5h-5A1.5 1.5 0 0 0 12.04 8.37L9.5 16H12v6h8zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9.5C9 8.67 8.33 8 7.5 8S6 8.67 6 9.5V15H7.5v7h2z"/>
                                </svg>
                            </div>
                            Alignement Démographique
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {insights.demographicAlignment.map((demo, index) => (
                            <div key={index} className="space-y-4 p-4 bg-white rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700">Groupe d'âge:</span>
                                    <Badge variant="outline" className="border-secondary text-secondary font-medium">
                                        {demo.ageGroup}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700 block mb-2">Plateformes primaires:</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {demo.primaryPlatforms.map(platform => (
                                            <div key={platform} className="flex items-center gap-2 text-sm bg-secondary/10 text-secondary px-3 py-2 rounded-lg border border-secondary/20">
                                                <div className="text-secondary">
                                                    {getPlatformIcon(platform)}
                                                </div>
                                                {platform}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700 block mb-2">Style d'engagement:</span>
                                    <p className="text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                        {demo.engagementStyle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Content Preferences */}
            {insights.contentPreferences.length > 0 && (
                <Card className="card-hover border-0 shadow-sm section-insights">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            Préférences de Contenu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {insights.contentPreferences.map((preference, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                                    <div className="w-2 h-2 bg-gradient-to-r from-accent to-yellow-500 rounded-full flex-shrink-0"></div>
                                    <span className="text-sm text-gray-700 font-medium">{preference}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Audience Matches */}
            {insights.audienceMatches.length > 0 && insights.audienceMatches.some(match => match.relevanceFactors.length > 0) && (
                <Card className="card-hover border-0 shadow-sm section-goals">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <div className="p-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                                <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7.5h-5A1.5 1.5 0 0 0 12.04 8.37L9.5 16H12v6h8z"/>
                                </svg>
                            </div>
                            Correspondances d'Audience
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {insights.audienceMatches
                                .filter(match => match.relevanceFactors.length > 0)
                                .map((match, index) => (
                                <div key={index} className="p-4 bg-white rounded-xl border border-green-100 hover:border-green-200 hover:shadow-sm transition-all duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-gray-900">{match.name}</span>
                                        <Badge variant="outline" className="border-success text-success font-medium">
                                            {match.estimatedFollowingOverlap}% overlap
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {match.relevanceFactors.map((factor, factorIndex) => (
                                            <span key={factorIndex} className="text-xs bg-success/10 text-success px-3 py-1 rounded-full border border-success/20 font-medium">
                                                {factor}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}