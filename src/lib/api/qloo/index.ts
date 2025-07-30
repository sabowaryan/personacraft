import { QlooClient } from './client';

// Instance singleton
let qlooClient: QlooClient | null = null;

export function getQlooClient(): QlooClient {
    if (!qlooClient) {
        qlooClient = new QlooClient();
    }
    return qlooClient;
}

// Export types and utilities
export * from './types';
export * from './client';
export * from './api';
export * from './enrichment';
export * from './mappers';
export * from './fallback';
export * from './social-media';
export * from './config';
export * from './validation';
export * from './request-handler';