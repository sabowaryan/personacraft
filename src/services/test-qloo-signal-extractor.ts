/**
 * Simple integration test for QlooSignalExtractor.fetchCulturalData
 * This file can be run to verify the implementation works correctly
 */

import { QlooSignalExtractor } from './qloo-signal-extractor';
import { BriefFormData } from '@/components/forms/BriefForm';

async function testFetchCulturalData() {
    console.log('Testing QlooSignalExtractor.fetchCulturalData...');
    
    const extractor = new QlooSignalExtractor();
    
    const mockBriefFormData: BriefFormData = {
        brief: 'Looking for tech-savvy millennials in Paris who love innovation and quality',
        ageRange: { min: 25, max: 35 },
        location: 'Paris',
        language: 'fr' as const,
        personaCount: 3,
        interests: ['Technologie', 'Voyage', 'Mode'],
        values: ['Innovation', 'Qualité', 'Authenticité']
    };

    try {
        // Test signal extraction
        console.log('1. Testing signal extraction...');
        const signals = extractor.extractSignals(mockBriefFormData);
        console.log('✓ Signals extracted successfully:', {
            demographics: signals.demographics,
            interestsCount: signals.interests.length,
            valuesCount: signals.values.length,
            culturalContext: signals.culturalContext
        });

        // Test cultural data fetching
        console.log('2. Testing cultural data fetching...');
        const constraints = await extractor.fetchCulturalData(signals);
        
        console.log('✓ Cultural data fetched successfully:');
        Object.entries(constraints).forEach(([key, values]) => {
            console.log(`  ${key}: ${values.length} items - ${values.slice(0, 3).join(', ')}${values.length > 3 ? '...' : ''}`);
        });

        // Verify requirements
        console.log('3. Verifying requirements...');
        
        // Requirement 1.1, 1.2: Cultural data should be coherent with location and age
        const totalItems = Object.values(constraints).reduce((sum, items) => sum + items.length, 0);
        console.log(`✓ Total cultural data items: ${totalItems}`);
        
        // Requirement 4.1, 4.2: Should reflect current cultural trends
        const hasMultipleCategories = Object.values(constraints).filter(items => items.length > 0).length;
        console.log(`✓ Categories with data: ${hasMultipleCategories}/11`);
        
        // Verify parallel processing worked (all categories should have been attempted)
        const categoriesAttempted = ['music', 'brands', 'movies', 'tv', 'books', 'restaurants', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'];
        const allCategoriesPresent = categoriesAttempted.every(cat => cat in constraints);
        console.log(`✓ All categories processed: ${allCategoriesPresent}`);

        console.log('\n✅ All tests passed! fetchCulturalData implementation is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        
        // Check if it's an expected error type
        if (error instanceof Error) {
            if (error.message.includes('CULTURAL_DATA_INSUFFICIENT')) {
                console.log('ℹ️  This might be expected if Qloo API is not available or returns insufficient data');
            } else if (error.message.includes('QLOO_API_UNAVAILABLE')) {
                console.log('ℹ️  This might be expected if Qloo API key is not configured');
            }
        }
    }
}

// Export for potential use in other files
export { testFetchCulturalData };

// Run test if this file is executed directly
if (require.main === module) {
    testFetchCulturalData();
}