import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

const ruleToRoleId: Record<string, number> = {
  '1': 1,  // salesman
  '3': 6,  // warehouse
  '4': 2,  // manager
  '8': 3,  // finance
  '16': 4, // head
};

async function main() {
  console.log('--- Seeding Roles & Permissions ---');

  // 1. Seed Roles (Ensure these exist first)
  const roles = [
    { id: 1, name: 'salesman' },
    { id: 2, name: 'manager' },
    { id: 3, name: 'finance' },
    { id: 4, name: 'head' },
    { id: 5, name: 'customer' },
    { id: 6, name: 'warehouse' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: { name: r.name },
      create: r,
    });
  }

  console.log('--- Reading User.csv and Loading Users ---');

  const csvFilePath = path.resolve(__dirname, 'User.csv');
  const users: any[] = [];

  // 2. Stream and Parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => users.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  // 3. Process each user from the CSV
  for (const row of users) {
    const assignedRoleId = ruleToRoleId[row.rule];

    if (!assignedRoleId) {
      console.warn(`⚠️ Skipping ${row.trigram}: Rule ${row.rule} not mapped.`);
      continue;
    }

    await prisma.user.upsert({
      where: { trigram: row.trigram },
      update: {
        company: row.company,
        location: row.location || 'All',
        pwd: row.pwd,
        roleId: assignedRoleId,
        region: row.region || null,
      },
      create: {
        trigram: row.trigram,
        company: row.company,
        location: row.location || 'All',
        pwd: row.pwd,
        roleId: assignedRoleId,
        region: row.region || null,
      },
    });
  }

  console.log(`✅ Successfully processed ${users.length} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });