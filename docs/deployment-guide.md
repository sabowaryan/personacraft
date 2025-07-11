# PersonaCraft Deployment Guide

## Overview

This guide covers deploying PersonaCraft to various platforms including Vercel, Netlify, and self-hosted environments.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- API keys for Qloo and Gemini (optional for demo mode)

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Required for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Optional - AI APIs (app works in demo mode without these)
GEMINI_API_KEY=your_gemini_api_key
QLOO_API_KEY=your_qloo_api_key
QLOO_API_URL=https://api.qloo.com/v1

# Optional - Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
ENABLE_ANALYTICS=true

# Optional - Features
ENABLE_ERROR_TRACKING=true
ENABLE_CACHING=true
ENABLE_RATE_LIMITING=true

# Optional - Database (for advanced features)
DATABASE_URL=postgresql://...
VERCEL_KV_URL=...
VERCEL_KV_REST_API_URL=...
VERCEL_KV_REST_API_TOKEN=...
```

## Deployment Platforms

### 1. Vercel (Recommended)

Vercel provides the best experience for Next.js applications.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/personacraft)

#### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all required environment variables

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 2. Netlify

#### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/personacraft)

#### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=out
   ```

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

### 3. Self-Hosted (Docker)

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/out ./out
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npx", "serve", "out", "-p", "3000"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  personacraft:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - personacraft
    restart: unless-stopped
```

#### Build and Run

```bash
# Build the image
docker build -t personacraft .

# Run the container
docker run -p 3000:3000 personacraft

# Or use docker-compose
docker-compose up -d
```

### 4. AWS (Amplify)

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: out
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Set Environment Variables**
   - Add all required environment variables in Amplify console

## Database Setup (Optional)

### PostgreSQL with Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Get Connection String**
   - Copy the connection string from project settings

3. **Add to Environment Variables**
   ```bash
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```

### Redis with Upstash

1. **Create Upstash Database**
   - Go to [upstash.com](https://upstash.com)
   - Create a new Redis database

2. **Add to Environment Variables**
   ```bash
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

## Performance Optimization

### 1. Caching Strategy

```typescript
// lib/cache.ts
export const cacheConfig = {
  personas: 24 * 60 * 60, // 24 hours
  qloo: 60 * 60, // 1 hour
  gemini: 30 * 60, // 30 minutes
};
```

### 2. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### 3. Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze
```

## Monitoring and Analytics

### 1. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Performance Monitoring

```typescript
// lib/analytics.ts
export const trackEvent = (event: string, properties?: object) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }
};
```

### 3. Uptime Monitoring

Set up monitoring with services like:
- Pingdom
- UptimeRobot
- StatusCake

## Security Considerations

### 1. API Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

### 2. CORS Configuration

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
  return response;
}
```

### 3. Environment Variables Validation

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  QLOO_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **API Timeouts**
   - Increase function timeout in platform settings
   - Implement request caching
   - Add retry logic

3. **Memory Issues**
   - Optimize bundle size
   - Use dynamic imports
   - Implement proper caching

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Or specific modules
DEBUG=personacraft:* npm run dev
```

## Backup and Recovery

### 1. Database Backups

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### 2. Code Backups

- Use Git for version control
- Set up automated backups
- Implement CI/CD pipelines

## Scaling

### 1. Horizontal Scaling

- Use load balancers
- Implement session storage
- Cache frequently accessed data

### 2. Vertical Scaling

- Increase server resources
- Optimize database queries
- Use CDN for static assets

## Support

For deployment support:
- Documentation: https://docs.personacraft.com
- Community: https://github.com/personacraft/discussions
- Email: support@personacraft.com