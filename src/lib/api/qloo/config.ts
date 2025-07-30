import { QlooConfig } from './types';

export const DEFAULT_CONFIG: Omit<QlooConfig, 'apiKey' | 'baseUrl'> = {
    maxConcurrentRequests: 3, // Augmenté légèrement
    rateLimitDelay: 150, // Réduit pour plus de vitesse
    cacheTimeout: 60 * 60 * 1000, // 1 heure au lieu de 5 minutes
};

export function createConfig(): QlooConfig {
    return {
        apiKey: process.env.QLOO_API_KEY || '',
        baseUrl: (process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com').replace(/\/+$/, ''),
        ...DEFAULT_CONFIG,
    };
}