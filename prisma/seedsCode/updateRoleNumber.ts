import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Role ID Update (6 -> 3) ---');

  await prisma.$transaction([
    // 1. Disable Foreign Key Checks temporarily to allow the change
    prisma.$executeRawUnsafe(`SET foreign_key_checks = 0;`),

    // 6. Update the Role table ID
    prisma.$executeRawUnsafe(`UPDATE Role SET id = 3 WHERE id = 6;`),

    // 6. Update the User table references
    prisma.$executeRawUnsafe(`UPDATE User SET roleId = 3 WHERE roleId = 6;`),

    // 6. Update the RolePermission junction table references
    prisma.$executeRawUnsafe(`UPDATE RolePermission SET roleId = 3 WHERE roleId = 6;`),

    // 5. Re-enable Foreign Key Checks
    prisma.$executeRawUnsafe(`SET foreign_key_checks = 1;`),
  ]);

  console.log('✅ Role ID changed from 6 to 3. All relations maintained.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());