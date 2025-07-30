# Implementation Plan

- [x] 1. Create core interfaces and types for the new flow








  - Define QlooSignals, CulturalConstraints, and EnrichedPromptContext interfaces
  - Create QlooFirstError enum and error handling types
  - Add GenerationResult interface with metadata tracking
  - _Requirements: 2.1, 2.2, 5.1_

- [x] 2. Implement QlooSignalExtractor service






- [x] 2.1 Create signal extraction logic from BriefFormData


  - Write extractSignals method to parse BriefFormData into QlooSignals
  - Implement mapping functions for interests and values to Qloo categories
  - Add validation for extracted signals
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.2 Implement cultural data fetching with Qloo API







  - Write fetchCulturalData method using existing Qloo client
  - Implement parallel API calls for different entity types (music, brands, etc.)
  - Add error handling and fallback mechanisms for Qloo API failures
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [x] 2.3 Add interest and value mapping utilities



















  - Create mapInterestsToQlooCategories function for PREDEFINED_INTERESTS and custom interests
  - Implement mapValuesToQlooSignals for PREDEFINED_VALUES and custom values
  - Write unit tests for mapping functions
  - _Requirements: 4.4, 4.5, 6.3_

- [x] 3. Create EnrichedPromptBuilder service







- [x] 3.1 Implement prompt enrichment with cultural constraints


  - Write buildPrompt method that injects cultural data into Gemini prompts
  - Create injectCulturalConstraints function to format Qloo data for prompts
  - Add prompt validation and length checking
  - _Requirements: 2.3, 2.4_



- [x] 3.2 Create cultural constraint formatting for Gemini










  - Implement formatConstraintsForGemini to structure Qloo data for AI consumption
  - Add language-specific formatting (fr/en) based on BriefFormData.language
  - Write tests for prompt formatting with various constraint combinations
  - _Requirements: 6.2, 2.4_


- [-] 4. Implement QlooFirstPersonaGenerator orchestration service



- [x] 4.1 Create main generation flow orchestration


  - Write generatePersonas method that coordinates the entire new flow
  - Implement extractAndFetchCulturalData pipeline
  - Add generateWithConstraints method using enriched prompts
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 4.2 Implement fallback to legacy flow

  - Create fallbackToLegacyFlow method that calls existing generation logic
  - Add error detection and automatic fallback triggers
  - Implement metadata tracking for generation source (qloo-first vs fallback)
  - _Requirements: 5.3, 5.5_

- [x] 4.3 Add performance optimization and caching

























  - Implement batch processing for multiple Qloo API calls
  - Add intelligent caching based on extracted signals
  - Optimize for personaCount parameter to avoid redundant calls
  - _Requirements: 6.1, 6.4, 6.5_

- [x] 5. Create feature flag integration





- [x] 5.1 Implement FeatureFlagService







  - Create feature flag service with environment variable support
  - Add methods for checking qloo-first enablement status
  - Implement debug mode and fallback configuration flags
  - _Requirements: 5.4_

- [x] 5.2 Add feature flag configuration


  - Create environment variables for QLOO_FIRST_GENERATION_ENABLED
  - Add runtime configuration interface QlooFirstConfig
  - Implement configuration validation and defaults
  - _Requirements: 5.4_

- [x] 6. Update generate-personas API route







- [x] 6.1 Integrate new flow into existing API endpoint


  - Modify /api/generate-personas route to use QlooFirstPersonaGenerator
  - Add feature flag checking to determine which flow to use
  - Maintain backward compatibility with existing BriefFormData interface
  - _Requirements: 5.1, 5.2_

- [x] 6.2 Add response metadata and source tracking


  - Update API response to include generation metadata
  - Add source indicators (qloo-first vs legacy) in response
  - Implement error handling that preserves existing error format
  - _Requirements: 5.5, 2.5_


- [-] 7. Create comprehensive unit tests





- [x] 7.1 Test QlooSignalExtractor functionality







  - Write tests for extractSignals with various BriefFormData combinations
  - Test interest and value mapping functions with predefined and custom values
  - Add tests for cultural data fetching with mocked Qloo responses
  - _Requirements: 3.3, 4.4, 4.5_

- [x] 7.2 Test EnrichedPromptBuilder





  - Create tests for prompt building with different cultural constraints
  - Test language-specific formatting (fr/en)
  - Add tests for prompt validation and error handling
  - _Requirements: 6.2, 2.4_

- [x] 7.3 Test QlooFirstPersonaGenerator integration




















  - Write tests for complete generation flow with mocked dependencies
  - Test fallback mechanisms when Qloo API fails
  - Add tests for performance optimizations and caching
  - _Requirements: 2.1, 5.3, 6.4_

- [x] 8. Add integration tests for API flow









- [x] 8.1 Test complete BriefForm to Persona generation









  - Create integration tests that submit BriefFormData and verify persona coherence
  - Test that generated personas match location, age range, and interests from form
  - Verify cultural data consistency between Qloo constraints and final personas
  - _Requirements: 1.3, 1.4, 4.1, 4.2_

- [x] 8.2 Test feature flag behavior












  - Write tests for feature flag enabled/disabled scenarios
  - Test fallback behavior when new flow encounters errors
  - Verify metadata tracking works correctly in both flows


  - _Requirements: 5.4, 5.3, 5.5_

- [-] 9. Add error handling and monitoring





- [x] 9.1 Implement comprehensive error handling







  - Add specific error types for each failure point in the new flow
  - Implement retry logic for transient Qloo API failures
  - Create graceful degradation when cultural data is insufficient
  - _Requirements: 1.5, 4.6_

- [x] 9.2 Add performance monitoring and metrics













  - Implement PerformanceMetrics tracking for each step of the flow
  - Add logging for debugging cultural constraint application
  - Create monitoring for cache hit rates and API call optimization
  - _Requirements: 6.4, 6.5_

- [x] 10. Update documentation and configuration





- [x] 10.1 Add environment variable documentation


  - Document all new environment variables for feature flags
  - Create configuration examples for different deployment scenarios
  - Add troubleshooting guide for common issues
  - _Requirements: 5.4_

- [x] 10.2 Update API documentation


  - Document the new metadata fields in API responses
  - Add examples showing qloo-first vs legacy response differences
  - Create migration guide for any breaking changes
  - _Requirements: 5.1, 5.2_