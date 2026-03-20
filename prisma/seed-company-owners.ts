/**
 * Data Migration: Multi-Operator Company Architecture
 * 
 * Run this AFTER `npx prisma migrate dev --name add_company_roles`:
 *   npx ts-node prisma/seed-company-owners.ts
 * 
 * What this does:
 * 1. For each existing Company → creates a CompanyMember(userId: operatorId, role: OWNER)
 * 2. For each tour where operator has a company → backfills Tour.companyId
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting Multi-Operator data migration...\n');

  // 1. Create OWNER CompanyMember for each company operator
  const companies = await prisma.company.findMany({
    select: { id: true, operatorId: true, name: true },
  });

  let ownersCreated = 0;
  for (const company of companies) {
    // Check if OWNER membership already exists
    const existing = await prisma.companyMember.findUnique({
      where: { userId: company.operatorId },
    });

    if (!existing) {
      await prisma.companyMember.create({
        data: {
          companyId: company.id,
          userId: company.operatorId,
          role: 'OWNER',
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });
      ownersCreated++;
      console.log(`  ✅ Created OWNER membership for "${company.name}" (operator: ${company.operatorId})`);
    } else {
      // If membership exists but not as OWNER, update it
      if (existing.role !== 'OWNER') {
        await prisma.companyMember.update({
          where: { id: existing.id },
          data: { role: 'OWNER', status: 'APPROVED' },
        });
        console.log(`  🔄 Updated existing membership to OWNER for "${company.name}"`);
        ownersCreated++;
      } else {
        console.log(`  ⏭ OWNER membership already exists for "${company.name}"`);
      }
    }
  }

  console.log(`\n📊 Created/updated ${ownersCreated} OWNER memberships (${companies.length} companies total)`);

  // 2. Backfill Tour.companyId
  let toursUpdated = 0;
  for (const company of companies) {
    const result = await prisma.tour.updateMany({
      where: {
        operatorId: company.operatorId,
        companyId: null, // Only update tours without companyId
      },
      data: {
        companyId: company.id,
      },
    });

    if (result.count > 0) {
      toursUpdated += result.count;
      console.log(`  ✅ Assigned ${result.count} tours to company "${company.name}"`);
    }
  }

  console.log(`\n📊 Backfilled ${toursUpdated} tours with companyId`);

  // 3. Migrate existing CompanyMember records that used old guideId field
  // (The schema rename handles this at the DB level, but we verify data integrity)
  const membersWithoutRole = await prisma.companyMember.findMany({
    where: { role: 'GUIDE' }, // Default role
    select: { id: true, userId: true },
  });

  console.log(`\n📊 ${membersWithoutRole.length} existing members with GUIDE role (expected for pre-migration guide members)`);
  console.log('\n✅ Data migration complete!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
