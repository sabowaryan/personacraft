// Script pour déboguer les personas existants
const { PrismaClient } = require('@prisma/client');

async function debugPersonas() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Recherche des personas existants...\n');
    
    const personas = await prisma.persona.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (personas.length === 0) {
      console.log('❌ Aucun persona trouvé dans la base de données');
      console.log('💡 Vous devez d\'abord générer des personas depuis l\'interface');
    } else {
      console.log(`✅ ${personas.length} persona(s) trouvé(s):\n`);
      
      personas.forEach((persona, index) => {
        console.log(`${index + 1}. ${persona.name}`);
        console.log(`   ID: ${persona.id}`);
        console.log(`   User ID: ${persona.userId}`);
        console.log(`   Créé le: ${persona.createdAt.toLocaleString('fr-FR')}`);
        console.log(`   URL: /dashboard/personas/${persona.id}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des personas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPersonas();