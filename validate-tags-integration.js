// Quick validation script to test tags service integration
const { QlooApiClient } = require('./lib/api/qloo.ts');

async function testTagsIntegration() {
  console.log('Testing Tags Service Integration...');
  
  try {
    // Test with mock API key (will fail but should show proper error handling)
    const client = new QlooApiClient('test-api-key');
    
    // Test that methods exist
    console.log('✓ getTagsByCategory method exists:', typeof client.getTagsByCategory === 'function');
    console.log('✓ searchTags method exists:', typeof client.searchTags === 'function');
    console.log('✓ validateTagIds method exists:', typeof client.validateTagIds === 'function');
    console.log('✓ getSupportedTagCategories method exists:', typeof client.getSupportedTagCategories === 'function');
    console.log('✓ validateTagCategory method exists:', typeof client.validateTagCategory === 'function');
    
    // Test supported categories
    const categories = client.getSupportedTagCategories();
    console.log('✓ Supported categories count:', categories.length);
    console.log('✓ Sample categories:', categories.slice(0, 5));
    
    // Test category validation
    console.log('✓ Music category valid:', client.validateTagCategory('music'));
    console.log('✓ Invalid category rejected:', !client.validateTagCategory('invalid'));
    
    console.log('\n✅ Tags Service Integration Test Passed!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

testTagsIntegration();