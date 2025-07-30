import { NextResponse } from 'next/server';
import { QlooClient } from '@/lib/api/qloo/client';
import { PerformanceMonitor } from '@/lib/api/qloo/performance-monitor';

export async function GET() {
    try {
        const client = new QlooClient();
        const monitor = PerformanceMonitor.getInstance();
        
        const cacheStats = client.getCacheStats();
        const metrics = monitor.getMetrics();
        
        return NextResponse.json({
            cacheStats,
            metrics,
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