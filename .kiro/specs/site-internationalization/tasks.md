# Implementation Plan

- [ ] 1. Install and configure internationalization dependencies
  - Install next-intl package and required dependencies (@formatjs/intl-localematcher, negotiator)
  - Configure TypeScript types for internationalization
  - _Requirements: 5.1, 5.2_

- [ ] 2. Create core i18n configuration and infrastructure
  - [ ] 2.1 Create locale configuration file
    - Create `src/lib/i18n/config.ts` with supported locales (en, fr) and locale metadata
    - Define default locale and locale-specific formatting preferences
    - _Requirements: 1.4, 4.1, 4.2_
  
  - [ ] 2.2 Set up translation message structure
    - Create `src/lib/i18n/messages/` directory structure with en/ and fr/ subdirectories
    - Create initial translation files: common.json, auth.json, dashboard.json, personas.json, errors.json, validation.json
    - Implement basic translations for navigation, buttons, and common UI elements
    - _Requirements: 1.2, 3.2, 3.3_

- [ ] 3. Implement middleware for locale detection and routing
  - [ ] 3.1 Update middleware for i18n routing
    - Modify `src/middleware.ts` to detect browser language preferences
    - Implement automatic locale detection using Accept-Language header
    - Add locale-based URL redirection logic
    - Preserve existing authentication and authorization logic
    - _Requirements: 1.1, 1.4, 6.3, 6.4_
  
  - [ ] 3.2 Implement locale persistence
    - Add cookie-based locale preference storage
    - Implement locale preference retrieval and validation
    - _Requirements: 1.3, 2.3_

- [ ] 4. Restructure app directory for locale-based routing
  - [ ] 4.1 Create locale-based routing structure
    - Create `src/app/[locale]/` directory structure
    - Move existing pages to locale-based structure: layout.tsx, page.tsx, dashboard/, auth/, etc.
    - Update imports and references to work with new structure
    - _Requirements: 6.1, 6.2_
  
  - [ ] 4.2 Create localized layout components
    - Create `src/app/[locale]/layout.tsx` with i18n context provider
    - Implement locale validation and loading of appropriate translations
    - Update root layout to work with locale routing
    - _Requirements: 1.2, 5.3_

- [ ] 5. Create i18n hooks and utilities
  - [ ] 5.1 Implement translation hooks
    - Create `src/hooks/useTranslation.ts` for accessing translations
    - Create `src/hooks/useLocale.ts` for locale management and navigation
    - Create `src/hooks/useLocalizedFormat.ts` for date, time, and number formatting
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 5.2 Create translation error handling
    - Create `src/lib/i18n/error-handler.ts` with TranslationError class
    - Implement fallback mechanisms for missing translations
    - Add development-mode logging for missing translations
    - _Requirements: 3.4, 5.4_

- [ ] 6. Create language selector component
  - [ ] 6.1 Implement LanguageSelector component
    - Create `src/components/i18n/LanguageSelector.tsx` with dropdown, toggle, and flag variants
    - Implement language switching with route preservation
    - Add smooth transitions and loading states
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 6.2 Integrate language selector into navigation
    - Update `src/components/Navbar.tsx` to include language selector
    - Ensure language selector adapts to different navbar themes
    - Add mobile-responsive language selection
    - _Requirements: 2.1, 2.2_

- [ ] 7. Internationalize existing components
  - [ ] 7.1 Internationalize navigation and common UI
    - Update Navbar component to use translations for menu items
    - Translate common buttons, labels, and UI text throughout the application
    - Update footer and other shared components
    - _Requirements: 1.2, 3.2_
  
  - [ ] 7.2 Internationalize authentication pages
    - Update signin, signup, and verify-email pages with translations
    - Translate form labels, validation messages, and error states
    - Implement localized authentication flow
    - _Requirements: 1.2, 3.2, 3.3_
  
  - [ ] 7.3 Internationalize dashboard and persona management
    - Update dashboard pages with French translations
    - Translate persona-related UI, forms, and metadata
    - Implement localized persona descriptions and insights
    - _Requirements: 1.2, 3.1, 3.2_

- [ ] 8. Implement localized formatting
  - [ ] 8.1 Add date and time formatting
    - Implement locale-aware date formatting throughout the application
    - Add time format preferences (12h/24h) based on locale
    - Update all date displays in personas, dashboard, and other components
    - _Requirements: 4.1, 4.2_
  
  - [ ] 8.2 Add number and currency formatting
    - Implement locale-specific number formatting with appropriate decimal separators
    - Add currency formatting for pricing and financial displays
    - Update numeric displays throughout the application
    - _Requirements: 4.3, 4.4_

- [ ] 9. Create localized error pages
  - [ ] 9.1 Implement localized error handling
    - Create `src/app/[locale]/not-found.tsx` with translated 404 messages
    - Create `src/app/[locale]/error.tsx` with localized error messages
    - Update error boundaries to use appropriate locale
    - _Requirements: 3.2, 3.3_

- [ ] 10. Extend user preferences for internationalization
  - [ ] 10.1 Update user model for locale preferences
    - Extend Prisma schema to include user locale preferences
    - Create migration for UserPreferences table with locale, timezone, and dateFormat fields
    - _Requirements: 1.3, 4.1, 4.2_
  
  - [ ] 10.2 Implement user preference management
    - Create API endpoints for saving and retrieving user locale preferences
    - Update user settings UI to include language and formatting preferences
    - Implement preference synchronization across devices
    - _Requirements: 1.3, 2.3_

- [ ] 11. Add comprehensive testing for i18n
  - [ ] 11.1 Create translation integrity tests
    - Create `src/lib/i18n/__tests__/translations.test.ts` to validate translation completeness
    - Test that all locales have matching keys and proper interpolation variables
    - Add automated checks for missing translations
    - _Requirements: 5.1, 5.4_
  
  - [ ] 11.2 Test i18n components and functionality
    - Create tests for LanguageSelector component behavior
    - Test locale detection, routing, and persistence
    - Add integration tests for end-to-end i18n functionality
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2_

- [ ] 12. Optimize performance and bundle size
  - [ ] 12.1 Implement translation lazy loading
    - Configure webpack to split translation bundles by locale
    - Implement dynamic loading of translation namespaces
    - Add translation caching mechanisms
    - _Requirements: 5.2_
  
  - [ ] 12.2 Add build-time optimizations
    - Configure Next.js build process for optimal i18n bundle splitting
    - Implement tree shaking for unused translations
    - Add compression for translation files
    - _Requirements: 5.2_