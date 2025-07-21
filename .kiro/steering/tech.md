# Technology Stack & Development Guidelines

## Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 4 with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React hooks + localStorage utilities
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF for exports
- **Analytics**: Vercel Analytics & Speed Insights

## AI & API Integration
- **Primary LLM**: Google Gemini API (`@google/generative-ai`)
- **Cultural Intelligence**: Qloo Taste AI™ API
- **Environment**: API keys stored in `.env.local`

## Build System & Commands
```bash
# Development
npm run dev          # Start development server (localhost:3000)

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # ESLint checking
```

## Development Conventions
- **File Structure**: App Router pattern (`app/` directory)
- **Component Organization**: Separate folders by feature/domain
- **Import Aliases**: Use `@/` for root-level imports
- **Styling**: Utility-first with Tailwind, custom CSS variables for theming
- **TypeScript**: Strict mode, proper typing for all components and APIs

## Key Libraries & Utilities
- **Class Management**: `clsx` + `tailwind-merge` via `cn()` utility
- **Date Handling**: `date-fns`
- **Icons**: `lucide-react`
- **Theming**: `next-themes` for dark/light mode
- **Notifications**: `sonner` for toast messages
- **Carousel**: `embla-carousel-react`

## Performance Optimizations
- **Images**: Unoptimized setting for static exports
- **Package Imports**: Optimized imports for `lucide-react`
- **Font Caching**: Custom headers for Google Fonts
- **ESLint**: Disabled during builds for faster deployment

## Code Style Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow shadcn/ui component patterns
- Use custom hooks for complex state logic
- Implement proper error handling and loading states
- Maintain responsive design principles