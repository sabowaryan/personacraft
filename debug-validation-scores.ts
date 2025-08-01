/**
 * Debug script to show individual persona validation scores
 */

import { QlooFirstPersonaGenerator } from './src/lib/services/qloo-first-persona-generator';
import { BriefFormData } from './src/components/forms/BriefForm';

async function testValidationScores() {
    console.log('🧪 Testing validation scores for individual personas...\n');

    // Create test brief data
    const briefFormData: BriefFormData = {
        brief: 'Application e-commerce pour femmes actives de 25-40 ans, urbaines, soucieuses de la mode et cherchant des produits de qualité avec livraison rapide.',
        location: 'France, zones urbaines',
        ageRange: { min: 25, max: 40 },
        personaCount: 2,
        interests: ['Mode', 'Shopping', 'Qualité', 'Marques éthiques', 'Livraison rapide'],
        values: ['Qualité', 'Éthique', 'Efficacité', 'Style']
    };

    try {
        // Create generator with debug mode enabled
        const generator = new QlooFirstPersonaGenerator({
            debugMode: true,
            enableValidation: true,
            maxRetries: 1
        });

        console.log('🚀 Starting persona generation with detailed validation...\n');

        // Generate personas
        const result = await generator.generatePersonas(briefFormData);

        console.log('\n📊 GENERATION RESULTS:');
        console.log('========================');
        console.log(`✅ Generated ${result.personas.length} personas`);
        console.log(`📈 Source: ${result.metadata.source}`);
        console.log(`⏱️ Processing time: ${result.metadata.processingTime}ms`);
        console.log(`🌍 Qloo API calls: ${result.metadata.qlooApiCallsCount}`);
        console.log(`💾 Cache hit rate: ${(result.metadata.cacheHitRate * 100).toFixed(1)}%`);

        // Display individual persona details
        console.log('\n🎭 INDIVIDUAL PERSONA DETAILS:');
        console.log('==============================');

        result.personas.forEach((persona, index) => {
            console.log(`\n👤 Persona ${index + 1}:`);
            console.log(`   📝 Name: ${persona.name || 'N/A'}`);
            console.log(`   🎯 Age: ${persona.age || 'N/A'}`);
            console.log(`   🏢 Occupation: ${persona.occupation || 'N/A'}`);
            console.log(`   📍 Location: ${persona.location || 'N/A'}`);
            
            // Display cultural data summary
            if (persona.culturalData) {
                const culturalSummary = Object.entries(persona.culturalData)
                    .filter(([_, value]) => value && Array.isArray(value) && value.length > 0)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.length : 1} items`)
                    .join(', ');
                
                console.log(`   🎨 Cultural data: ${culturalSummary || 'None'}`);
            }

            // Display metadata
            if (persona.metadata) {
                console.log(`   🔧 Generation method: ${persona.metadata.generationMethod}`);
                console.log(`   🌍 Cultural source: ${persona.metadata.culturalDataSource}`);
                if (persona.metadata.qlooConstraintsUsed) {
                    console.log(`   📊 Qloo constraints: ${persona.metadata.qlooConstraintsUsed.join(', ')}`);
                }
            }

            // Display validation score if available
            if (persona.metadata && (persona.metadata as any).validationScore) {
                console.log(`   ✅ Validation score: ${(persona.metadata as any).validationScore}/100`);
            }
        });

        // Display performance metrics
        const metrics = generator.getPerformanceMetrics();
        console.log('\n📈 PERFORMANCE METRICS:');
        console.log('=======================');
        console.log(`⏱️ Total processing time: ${metrics.totalProcessingTime}ms`);
        console.log(`🌍 Qloo extraction time: ${metrics.qlooExtractionTime}ms`);
        console.log(`📝 Prompt building time: ${metrics.promptBuildingTime}ms`);
        console.log(`🤖 Gemini generation time: ${metrics.geminiGenerationTime}ms`);
        console.log(`🌍 Qloo API calls: ${metrics.qlooApiCallsCount}`);
        console.log(`💾 Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testValidationScores().catch(console.error); 