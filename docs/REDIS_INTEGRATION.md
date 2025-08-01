# 🚀 Redis Integration Guide

## Installation

```bash
npm install redis
```

## Configuration

1. Copy `.env.example` to `.env.local`
2. Set your Redis URL:
```env
REDIS_URL=redis://localhost:6379
```

## Usage

### Basic Integration
```typescript
import { hybridCacheIntegration } from '@/lib/api/qloo/performance/cache/hybrid-cache-integration';

// Replace your existing cache calls
const data = await hybridCacheIntegration.get('music_data');
await hybridCacheIntegration.set('music_data', musicData, 3600000);
```

### API Endpoints
- `GET /api/cache?action=stats` - Cache statistics
- `GET /api/cache?action=get&key=mykey` - Get cache value
- `POST /api/cache` - Set cache value
- `DELETE /api/cache?key=mykey` - Delete cache entry

## Benefits

✅ **Persistent cache** - Survives server restarts
✅ **Shared cache** - Multiple instances can share data  
✅ **Better memory management** - Redis handles eviction
✅ **Fallback support** - Falls back to memory if Redis fails
✅ **Performance boost** - Your 83% hit rate will be even better!

## Testing

```bash
npx tsx test-redis-integration.ts
```