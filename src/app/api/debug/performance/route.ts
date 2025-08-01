import { NextResponse } from 'next/server';
import { QlooClient } from '@/lib/api/qloo/client';
import { PerformanceMonitor } from '@/lib/api/qloo/performance/monitoring/performance-monitor';
import { getPerformanceStats } from '@/lib/api/qloo/performance';

export async function GET() {
    try {
        const client = new QlooClient();
        const monitor = PerformanceMonitor.getInstance();
        
        const cacheStats = client.getCacheStats();
        const metrics = monitor.getMetrics();
        const advancedStats = getPerformanceStats();
        
        return NextResponse.json({
            cacheStats,
            metrics,
            advancedStats,
            comparison: {
                legacy: cacheStats,
                advanced: advancedStats,
                recommendation: generateRecommendations(cacheStats, advancedStats)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des stats de performance:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des statistiques' },
            { status: 500 }
        );
    }
}

function generateRecommendations(legacyStats: any, advancedStats: any) {
    const recommendations = [];
    
    // Analyser le cache hit rate
    const legacyHitRate = parseFloat(legacyStats.hitRate) / 100;
    const advancedHitRate = advancedStats.cache?.hitRate || 0;
    
    if (advancedHitRate > legacyHitRate) {
        recommendations.push({
            type: 'cache',
            message: `Le système avancé offre un meilleur cache hit rate (${Math.round(advancedHitRate * 100)}% vs ${Math.round(legacyHitRate * 100)}%)`,
            priority: 'high'
        });
    }
    
    // Analyser les temps de réponse
    if (advancedStats.optimizer?.averageResponseTime < 2000) {
        recommendations.push({
            type: 'performance',
            message: 'Le système avancé maintient des temps de réponse optimaux',
            priority: 'medium'
        });
    }
    
    return recommendations;
}

export async function POST() {
    try {
        const monitor = PerformanceMonitor.getInstance();
        monitor.reset();
        
        return NextResponse.json({ 
            message: 'Statistiques de performance réinitialisées',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation des stats:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la réinitialisation' },
            { status: 500 }
        );
    }
}