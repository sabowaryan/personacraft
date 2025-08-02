/**
 * Script pour vérifier les personas en base de données
 */

const { PrismaClient } = require('@prisma/client');

const checkPersonasInDB = async () => {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Vérification des personas en base de données...');
    
    // Compter tous les personas
    const totalPersonas = await prisma.persona.count();
    console.log(`📊 Total personas en BDD: ${totalPersonas}`);
    
    // Compter les personas anonymes (créés sans auth)
    const anonymousPersonas = await prisma.persona.count({
      where: { userId: 'anonymous-user' }
    });
    console.log(`👤 Personas anonymes: ${anonymousPersonas}`);
    
    // Récupérer les 5 derniers personas créés
    const recentPersonas = await prisma.persona.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        generationMetadata: true
      }
    });
    
    console.log('\n📋 5 derniers personas créés:');
    recentPersonas.forEach((persona, index) => {
      console.log(`  ${index + 1}. ${persona.name} (ID: ${persona.id})`);
      console.log(`     User: ${persona.userId}`);
      console.log(`     Créé: ${persona.createdAt.toLocaleString()}`);
      if (persona.generationMetadata) {
        console.log(`     Source: ${persona.generationMetadata.source || 'unknown'}`);
      }
      console.log('');
    });
    
    // Vérifier les métadonnées de génération
    const personasWithMetadata = await prisma.persona.count({
      where: {
        generationMetadata: {
          not: null
        }
      }
    });
    console.log(`📈 Personas avec métadonnées: ${personasWithMetadata}/${totalPersonas}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

// Exécuter la vérification si le script est appelé directement
if (require.main === module) {
  checkPersonasInDB();
}

module.exports = { checkPersonasInDB };