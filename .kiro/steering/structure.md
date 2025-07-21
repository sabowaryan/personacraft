# Project Structure & Organization

## Root Directory Structure
```
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable UI components organized by domain
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, API clients, types, and business logic
├── public/                 # Static assets (images, icons)
├── styles/                 # Additional CSS files
├── docs/                   # Technical documentation
└── .kiro/                  # Kiro AI assistant configuration
```

## App Directory (`app/`)
- **Root Pages**: `layout.tsx`, `page.tsx` (landing page)
- **Feature Routes**: 
  - `analytics/` - Analytics and metrics
  - `api/` - API route handlers
  - `cookies/` - Cookie policy
  - `gdpr/` - GDPR compliance
  - `generator/` - Main persona generation interface
  - `help/` - Help and support
  - `personas/` - Persona management
  - `privacy/` - Privacy policy
  - `terms/` - Terms of service

## Components Directory (`components/`)
- **charts/** - Data visualization components
- **forms/** - Form components and validation
- **landing/** - Landing page sections
- **layout/** - Header, footer, navigation
- **personas/** - Persona-specific UI components
- **providers/** - React context providers
- **seo/** - SEO and metadata components
- **ui/** - Base UI components (shadcn/ui)

## Library Directory (`lib/`)
- **api/** - API integration and client code
- **constants/** - Application constants
- **types/** - TypeScript type definitions
- **utils/** - Utility functions and helpers
- **utils.ts** - Core utility functions (cn, etc.)

## Hooks Directory (`hooks/`)
- **use-export.ts** - Export functionality
- **use-local-storage.ts** - localStorage management with TypeScript
- **use-persona-generation.ts** - Persona generation logic
- **use-toast.ts** - Toast notification management

## Configuration Files
- **components.json** - shadcn/ui configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration
- **next.config.js** - Next.js configuration
- **package.json** - Dependencies and scripts

## Naming Conventions
- **Files**: kebab-case for all files (`use-local-storage.ts`)
- **Components**: PascalCase for React components
- **Directories**: lowercase with hyphens for multi-word names
- **API Routes**: RESTful naming in `app/api/`

## Import Organization
- External libraries first
- Internal imports using `@/` alias
- Relative imports last
- Group by: libraries, components, hooks, utils, types

## Asset Organization
- **public/icons/** - SVG icons and favicons
- **public/images/** - Marketing images and graphics
- **app/globals.css** - Global styles and Tailwind configuration

## Documentation Structure (`docs/`)
- API documentation and configuration guides
- Deployment and migration guides
- Legal and compliance documentation
- Help and user guides

## Development Patterns
- Feature-based component organization
- Co-located types and utilities where appropriate
- Consistent file naming across all directories
- Clear separation between UI, business logic, and data layers