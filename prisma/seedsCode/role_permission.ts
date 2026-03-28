import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLE_PERMISSIONS = {
  salesman: ["view_own_customers", "view_product_prices"],
  manager: [
    "view_all_customers",
    "view_product_prices",
    "manage_product_prices",
    "view_warehouse"
  ],
  finance: [
    "view_all_customers",
    "view_payments",
    "manage_payments",
    "view_warehouse"
  ],
  head: [
    "view_all_customers",
    "view_payments",
    "manage_payments",
    "view_product_prices",
    "manage_product_prices",
    "view_warehouse"
  ],
  customer: ["view_own_customers"],
  warehouse: ["view_warehouse", "manage_warehouse"]
};

async function main() {

  const permissions = [
    ...new Set(Object.values(ROLE_PERMISSIONS).flat())
  ];

  await prisma.permission.createMany({
    data: permissions.map(action => ({ action })),
    skipDuplicates: true
  });


  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName }
    });
  }

  for (const [roleName, permissionActions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName }
    });

    if (!role) continue;

    const permissionRecords = await prisma.permission.findMany({
      where: {
        action: { in: permissionActions }
      }
    });

    await prisma.rolePermission.createMany({
      data: permissionRecords.map(permission => ({
        roleId: role.id,
        permissionId: permission.id
      })),
      skipDuplicates: true
    });
  }

  console.log("✅ Roles, permissions, and mappings seeded successfully");
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
