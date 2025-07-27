import { PrismaClient } from "@prisma/client";
import { pricingService } from "../src/services/pricingService";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');
  
  const plans = await pricingService.getPlans();
  console.log(`📋 Found ${plans.length} plans to seed`);

  for (const plan of plans) {
    console.log(`💾 Seeding plan: ${plan.name}`);
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: {
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        period: plan.period,
        description: plan.description,
        features: plan.features,
        cta: plan.cta,
        ctaLink: plan.ctaLink,
        popular: plan.popular,
        color: plan.color,
        personasLimit: typeof plan.limits.personas === 'number' ? plan.limits.personas : null,
        exports: plan.limits.exports,
        support: plan.limits.support,
        apiAccess: plan.limits.api,
        culturalInsights: plan.limits.culturalInsights,
      },
      create: {
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        period: plan.period,
        description: plan.description,
        features: plan.features,
        cta: plan.cta,
        ctaLink: plan.ctaLink,
        popular: plan.popular,
        color: plan.color,
        personasLimit: typeof plan.limits.personas === 'number' ? plan.limits.personas : null,
        exports: plan.limits.exports,
        support: plan.limits.support,
        apiAccess: plan.limits.api,
        culturalInsights: plan.limits.culturalInsights,
      },
    });
  }

  // Define all permissions
  const permissions = [
    // Persona permissions
    { name: 'create_persona', description: 'Peut créer des personas' },
    { name: 'read_persona', description: 'Peut consulter les personas' },
    { name: 'update_persona', description: 'Peut modifier les personas' },
    { name: 'delete_persona', description: 'Peut supprimer les personas' },
    { name: 'export_persona', description: 'Peut exporter les personas' },

    // User management permissions
    { name: 'create_user', description: 'Peut créer des utilisateurs' },
    { name: 'read_user', description: 'Peut consulter les utilisateurs' },
    { name: 'update_user', description: 'Peut modifier les utilisateurs' },
    { name: 'delete_user', description: 'Peut supprimer les utilisateurs' },

    // Plan management permissions
    { name: 'create_plan', description: 'Peut créer des plans' },
    { name: 'read_plan', description: 'Peut consulter les plans' },
    { name: 'update_plan', description: 'Peut modifier les plans' },
    { name: 'delete_plan', description: 'Peut supprimer les plans' },

    // Role and permission management
    { name: 'create_role', description: 'Peut créer des rôles' },
    { name: 'read_role', description: 'Peut consulter les rôles' },
    { name: 'update_role', description: 'Peut modifier les rôles' },
    { name: 'delete_role', description: 'Peut supprimer les rôles' },
    { name: 'assign_role', description: 'Peut assigner des rôles aux utilisateurs' },

    // Admin panel access
    { name: 'access_admin_panel', description: 'Peut accéder au panneau d\'administration' },
    { name: 'view_analytics', description: 'Peut consulter les analytics' },
    { name: 'manage_settings', description: 'Peut gérer les paramètres système' },

    // API access
    { name: 'api_access', description: 'Peut utiliser l\'API' },
    { name: 'api_admin', description: 'Accès administrateur à l\'API' },

    // Cultural insights
    { name: 'access_cultural_insights', description: 'Peut accéder aux insights culturels' },

    // Support
    { name: 'access_support', description: 'Peut accéder au support' },
    { name: 'manage_support', description: 'Peut gérer les tickets de support' },
  ];

  // Create all permissions
  console.log(`🔐 Creating ${permissions.length} permissions...`);
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: { name: permission.name, description: permission.description },
    });
  }

  // Define roles with their permissions
  const roles = [
    {
      name: 'super_admin',
      description: 'Administrateur avec tous les privilèges',
      permissions: permissions.map(p => p.name), // All permissions
    },
    {
      name: 'admin',
      description: 'Administrateur avec privilèges limités',
      permissions: [
        'create_persona', 'read_persona', 'update_persona', 'delete_persona', 'export_persona',
        'read_user', 'update_user',
        'read_plan',
        'access_admin_panel', 'view_analytics',
        'api_access',
        'access_cultural_insights',
        'access_support', 'manage_support',
      ],
    },
    {
      name: 'premium_user',
      description: 'Utilisateur premium avec accès complet aux fonctionnalités',
      permissions: [
        'create_persona', 'read_persona', 'update_persona', 'delete_persona', 'export_persona',
        'api_access',
        'access_cultural_insights',
        'access_support',
      ],
    },
    {
      name: 'pro_user',
      description: 'Utilisateur pro avec fonctionnalités avancées',
      permissions: [
        'create_persona', 'read_persona', 'update_persona', 'delete_persona', 'export_persona',
        'api_access',
        'access_cultural_insights',
      ],
    },
    {
      name: 'basic_user',
      description: 'Utilisateur basique avec fonctionnalités limitées',
      permissions: [
        'create_persona', 'read_persona', 'update_persona', 'delete_persona', 'export_persona',
      ],
    },
    {
      name: 'free_user',
      description: 'Utilisateur gratuit avec accès limité',
      permissions: [
        'create_persona', 'read_persona', 'update_persona',
      ],
    },
  ];

  // Create all roles
  console.log(`👥 Creating ${roles.length} roles...`);
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
  }

  // Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...');
  for (const roleData of roles) {
    const role = await prisma.role.findUnique({ where: { name: roleData.name } });

    if (role) {
      // First, remove existing permissions for this role to avoid duplicates
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      // Then assign the new permissions
      for (const permissionName of roleData.permissions) {
        const permission = await prisma.permission.findUnique({ where: { name: permissionName } });

        if (permission) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
  }

  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


