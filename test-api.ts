// Script pour tester l'API personas directement
async function testPersonasAPI() {
  try {
    console.log('🧪 Test de l\'API /api/personas...');
    
    const response = await fetch('http://localhost:3000/api/personas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

testPersonasAPI();