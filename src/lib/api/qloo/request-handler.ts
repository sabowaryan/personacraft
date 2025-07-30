import { CacheEntry } from './types';

export class RequestHandler {
    private requestQueue: Promise<any>[] = [];
    private lastRequestTime: number = 0;
    private cache: Map<string, CacheEntry> = new Map();
    private cacheStats = {
        hits: 0,
        misses: 0,
        totalRequests: 0
    };

    constructor(
        private maxConcurrentRequests: number,
        private rateLimitDelay: number,
        private cacheTimeout: number
    ) {
        // Nettoyage périodique du cache
        setInterval(() => this.cleanExpiredCache(), 10 * 60 * 1000); // Toutes les 10 minutes
    }

    async makeRequestWithRetry<T>(
        requestFn: () => Promise<T>,
        entityType: string,
        maxRetries: number = 3
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await this.enforceRateLimit();

                while (this.requestQueue.length >= this.maxConcurrentRequests) {
                    await Promise.race(this.requestQueue);
                }

                const requestPromise = requestFn();
                this.requestQueue.push(requestPromise);

                requestPromise.finally(() => {
                    const index = this.requestQueue.indexOf(requestPromise);
                    if (index > -1) {
                        this.requestQueue.splice(index, 1);
                    }
                });

                return await requestPromise;

            } catch (error) {
                lastError = error as Error;

                if (lastError.message.includes('403_FORBIDDEN') ||
                    lastError.message.includes('400_AUDIENCE_NOT_SUPPORTED') ||
                    lastError.message.includes('400_BAD_REQUEST') ||
                    lastError.message.includes('401_UNAUTHORIZED') ||
                    lastError.message.includes('404_NOT_FOUND')) {
                    // Pour ces erreurs, on arrête les tentatives et on retourne une erreur gérée
                    console.warn(`Erreur API non récupérable pour ${entityType}: ${lastError.message}`);
                    break;
                }

                if (lastError.message.includes('429_RATE_LIMIT')) {
                    const waitTimeMatch = lastError.message.match(/429_RATE_LIMIT_(\d+)/);
                    let waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 1000 * Math.pow(2, attempt);
                    waitTime += Math.random() * 1000;

                    if (attempt < maxRetries) {
                        console.log(`Tentative ${attempt + 1}/${maxRetries + 1} pour ${entityType}, attente de ${waitTime}ms`);
                        await this.sleep(waitTime);
                        continue;
                    }
                }

                if (attempt < maxRetries) {
                    const backoffTime = 1000 * Math.pow(2, attempt);
                    await this.sleep(backoffTime);
                }
            }
        }

        throw lastError || new Error(`Max retries exceeded for ${entityType}`);
    }

    getCachedData(cacheKey: string): string[] | null {
        this.cacheStats.totalRequests++;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            this.cacheStats.hits++;
            return cached.data;
        }
        this.cacheStats.misses++;
        return null;
    }

    setCachedData(cacheKey: string, data: string[]): void {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    getCacheStats() {
        const hitRate = this.cacheStats.totalRequests > 0 
            ? (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(1)
            : '0';
        return {
            ...this.cacheStats,
            hitRate: `${hitRate}%`,
            cacheSize: this.cache.size
        };
    }

    private cleanExpiredCache(): void {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp >= this.cacheTimeout) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
        }
    }

    private async enforceRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastRequest;
            await this.sleep(waitTime);
        }

        this.lastRequestTime = Date.now();
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}