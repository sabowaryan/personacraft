import { NextRequest, NextResponse } from 'next/server';
import { hybridCache } from '@/lib/cache/hybrid-cache';
import { redisCache } from '@/lib/cache/redis-cache-adapter';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const key = searchParams.get('key');

    try {
        switch (action) {
            case 'stats':
                const memoryStats = hybridCache.getStats();
                return NextResponse.json({
                    success: true,
                    stats: {
                        ...memoryStats,
                        redisConnected: await redisCache.exists('test') !== null
                    }
                });

            case 'get':
                if (!key) {
                    return NextResponse.json({ error: 'Key required' }, { status: 400 });
                }
                const value = await hybridCache.get(key);
                return NextResponse.json({ success: true, value });

            case 'keys':
                const pattern = searchParams.get('pattern') || '*';
                const keys = await redisCache.keys(pattern);
                return NextResponse.json({ success: true, keys });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Cache API error:', error);
        return NextResponse.json({ 
            error: 'Cache operation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { key, value, ttlMs } = await request.json();

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and value required' }, { status: 400 });
        }

        await hybridCache.set(key, value, ttlMs || 3600000); // Default 1 hour
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cache SET error:', error);
        return NextResponse.json({ 
            error: 'Cache set failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const pattern = searchParams.get('pattern');

    try {
        if (pattern) {
            await hybridCache.clear(pattern);
            return NextResponse.json({ success: true, message: `Cleared pattern: ${pattern}` });
        } else if (key) {
            await hybridCache.delete(key);
            return NextResponse.json({ success: true, message: `Deleted key: ${key}` });
        } else {
            await hybridCache.clear();
            return NextResponse.json({ success: true, message: 'Cleared all cache' });
        }
    } catch (error) {
        console.error('Cache DELETE error:', error);
        return NextResponse.json({ 
            error: 'Cache delete failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}