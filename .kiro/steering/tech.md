# Technology Stack & Development Guide

## Core Technologies

### Frontend Stack
- **Next.js 15**: App Router, Server Components, Edge Runtime
- **React 19**: Concurrent features, Suspense, automatic batching
- **TypeScript 5.0**: Strict type checking, path aliases via `@/*`
- **TailwindCSS 4.0**: Utility-first CSS with JIT compilation
- **Radix UI**: Accessible component primitives

### Backend & APIs
- **Google Gemini Pro**: Primary AI generation engine
- **Qloo Taste AI™**: Cultural data enrichment (Qloo-first approach)
- **PostgreSQL**: Primary database with Neon serverless
- **Prisma ORM**: Type-safe database operations
- **Redis**: Caching and session storage
- **Stack Auth**: Authentication and user management

### Development Tools
- **Vitest**: Testing framework with globals enabled
- **ESLint**: Code linting with Next.js config
- **Prisma Studio**: Database exploration
- **Bundle Analyzer**: Performance optimization

## Common Commands

### Development
```bash
npm run dev                    # Start development server
npm run dev:fast              # Development with optimizations
npm run build                 # Production build
npm run build:fast            # Fast build (skip validations)
npm run build:optimized       # Cross-platform optimized build
npm run start                 # Production server
```

### Testing
```bash
npm run test                  # Unit tests (watch mode)
npm run test:run             # Run tests once
npm run test:ui              # Interactive test UI
npm run test:performance     # Performance benchmarks
npm run lint                 # Code linting
```

### Database
```bash
npx prisma generate          # Generate Prisma client
npx prisma db push          # Apply schema changes
npx prisma migrate dev      # Create and apply migrations
npx prisma studio           # Database GUI
npm run seed                # Populate test data
```

### Utilities
```bash
npm run analyze-bundle       # Bundle size analysis
npm run vercel-build        # Vercel deployment build
```

## Build Configuration

### Memory Optimization
- Node.js memory limit: `--max-old-space-size=4096`
- Webpack memory optimizations enabled
- Turbopack support for faster builds
- Filesystem caching for production builds

### Environment Variables
Required variables in `.env.local`:
- `GEMINI_API_KEY`: Google Gemini API access
- `QLOO_API_KEY`: Qloo Taste AI access
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis cache connection
- `STACK_PROJECT_ID`: Stack Auth project
- Feature flags: `ENABLE_QLOO_FIRST`, `ENABLE_DEBUG_MODE`

## Performance Considerations

### Caching Strategy
- Redis for API responses and cultural data
- Next.js static generation where possible
- Hybrid cache system with fallbacks

### Bundle Optimization
- Code splitting by AI providers and features
- Template files loaded as assets
- Optimized chunk sizes (20KB-244KB range)

### API Rate Limiting
- Qloo API: Batch processing with performance monitoring
- Gemini API: Retry logic with exponential backoff
- Redis-based rate limiting for user requests