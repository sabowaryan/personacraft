import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPersonas() {
  try {
    console.log('🔍 Vérification des personas dans la base de données...\n');
    
    // Compter le nombre total de personas
    const totalCount = await prisma.persona.count();
    console.log(`📊 Nombre total de personas: ${totalCount}`);
    
    // Récupérer tous les personas avec leurs utilisateurs
    const personas = await prisma.persona.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📋 Détails des personas:`);
    personas.forEach((persona, index) => {
      console.log(`\n${index + 1}. ${persona.name}`);
      console.log(`   ID: ${persona.id}`);
      console.log(`   Utilisateur: ${persona.user.email} (${persona.user.name || 'Sans nom'})`);
      console.log(`   User ID: ${persona.userId}`);
      console.log(`   Âge: ${persona.age}`);
      console.log(`   Occupation: ${persona.occupation}`);
      console.log(`   Localisation: ${persona.location}`);
      console.log(`   Score qualité: ${persona.qualityScore}`);
      console.log(`   Créé le: ${persona.createdAt.toLocaleString('fr-FR')}`);
    });
    
    // Vérifier les utilisateurs
    console.log(`\n👥 Utilisateurs dans la base:`);
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            personas: true
          }
        }
      }
    });
    
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'Sans nom'})`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Personas: ${user._count.personas}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPersonas();