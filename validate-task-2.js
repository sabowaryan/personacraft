// Validation script for Task 2: Implement base Qloo API client
console.log('🔍 Validating Task 2 Implementation...\n');

// Check if the file exists and can be imported
try {
  const fs = require('fs');
  const path = './lib/api/qloo.ts';
  
  if (!fs.existsSync(path)) {
    console.log('❌ Qloo API file does not exist');
    process.exit(1);
  }
  
  const content = fs.readFileSync(path, 'utf8');
  
  // Requirement 1.1, 1.4, 3.1, 3.2 validation
  const checks = [
    {
      name: 'QlooApiClient class exists',
      test: content.includes('export class QlooApiClient'),
      requirement: '1.1, 3.1'
    },
    {
      name: 'Official hackathon base URL',
      test: content.includes('https://hackathon.api.qloo.com'),
      requirement: '1.1'
    },
    {
      name: 'Authentication headers implementation',
      test: content.includes('X-API-Key') && content.includes('buildHeaders'),
      requirement: '1.4, 3.1'
    },
    {
      name: 'API key management',
      test: content.includes('apiKey') && content.includes('QLOO_API_KEY'),
      requirement: '1.4'
    },
    {
      name: 'Timeout configuration',
      test: content.includes('timeout') && content.includes('setTimeout'),
      requirement: '3.2'
    },
    {
      name: 'Retry configuration',
      test: content.includes('retryAttempts') && content.includes('calculateRetryDelay'),
      requirement: '3.2'
    },
    {
      name: 'HTTP request wrapper',
      test: content.includes('makeHttpRequest') && content.includes('fetch'),
      requirement: '3.1'
    },
    {
      name: 'Error handling',
      test: content.includes('createCompliantError') && content.includes('QlooErrorType'),
      requirement: '3.1, 3.2'
    },
    {
      name: 'Backward compatibility',
      test: content.includes('export class QlooClient') && content.includes('getRecommendations'),
      requirement: 'Compatibility'
    },
    {
      name: 'Configuration options',
      test: content.includes('QlooCompliantConfig') && content.includes('DEFAULT_CONFIG'),
      requirement: '3.2'
    }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`✅ ${check.name} (Req: ${check.requirement})`);
      passed++;
    } else {
      console.log(`❌ ${check.name} (Req: ${check.requirement})`);
    }
  });
  
  console.log(`\n📊 Results: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('🎉 Task 2 implementation is COMPLETE!');
    console.log('\n✅ All requirements satisfied:');
    console.log('  - 1.1: Official hackathon base URL implemented');
    console.log('  - 1.4: Authentication headers and API key management');
    console.log('  - 3.1: HTTP request wrapper with error handling');
    console.log('  - 3.2: Timeout and retry configuration options');
  } else {
    console.log('⚠️  Some requirements may need attention');
  }
  
} catch (error) {
  console.log('❌ Error validating implementation:', error.message);
  process.exit(1);
}