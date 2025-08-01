import { createClient, RedisClientType } from 'redis';

export class RedisCacheAdapter {
    private client: RedisClientType | null = null;
    private isConnected = false;

    async connect(): Promise<void> {
        if (this.isConnected) return;

        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    connectTimeout: 5000
                }
            });

            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            await this.client.connect();
            this.isConnected = true;
            console.log('✅ Redis connected successfully');
        } catch (error) {
            console.error('❌ Redis connection failed:', error);
            this.isConnected = false;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected || !this.client) return null;

        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
        if (!this.isConnected || !this.client) return false;

        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, serialized);
            } else {
                await this.client.set(key, serialized);
            }
            return true;
        } catch (error) {
            console.error('Redis SET error:', error);
            return false;
        }
    }

    async del(key: string): Promise<boolean> {
        if (!this.isConnected || !this.client) return false;

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Redis DEL error:', error);
            return false;
        }
    }

    async exists(key: string): Promise<boolean> {
        if (!this.isConnected || !this.client) return false;

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    }

    async keys(pattern: string): Promise<string[]> {
        if (!this.isConnected || !this.client) return [];

        try {
            return await this.client.keys(pattern);
        } catch (error) {
            console.error('Redis KEYS error:', error);
            return [];
        }
    }

    async disconnect(): Promise<void> {
        if (this.client && this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
}

// Singleton instance
export const redisCache = new RedisCacheAdapter();