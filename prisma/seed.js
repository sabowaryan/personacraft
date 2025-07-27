import { PrismaClient } from "@prisma/client";
import { pricingService } from "../src/services/pricingService.js";

const prisma = new PrismaClient();

async function main() {
  const plans = await pricingService.getPlans();

  for (const plan of plans) {
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

  // Add default roles
  await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: { description: 'Utilisateur avec tous les privilèges' },
    create: { name: 'super_admin', description: 'Utilisateur avec tous les privilèges' },
  });

  await prisma.role.upsert({
    where: { name: 'free_user' },
    update: { description: 'Utilisateur avec le plan gratuit' },
    create: { name: 'free_user', description: 'Utilisateur avec le plan gratuit' },
  });

  // Add default permissions (example)
  await prisma.permission.upsert({
    where: { name: 'manage_personas' },
    update: { description: 'Peut gérer les personas' },
    create: { name: 'manage_personas', description: 'Peut gérer les personas' },
  });

  await prisma.permission.upsert({
    where: { name: 'access_admin_panel' },
    update: { description: 'Peut accéder au panneau d\'administration' },
    create: { name: 'access_admin_panel', description: 'Peut accéder au panneau d\'administration' },
  });

  // Assign all permissions to super_admin role
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  const allPermissions = await prisma.permission.findMany();

  if (superAdminRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


