// Quick test to check if the personas API is working after the database fix
const fetch = require('node-fetch');

async function testPersonasAPI() {
  try {
    console.log('🧪 Testing /api/personas after database fix...');
    
    const response = await fetch('http://localhost:3000/api/personas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is working! Response:', {
        personasCount: data.personas?.length || 0,
        hasMetadata: !!data.metadata,
        hasFilters: !!data.filters
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

testPersonasAPI();