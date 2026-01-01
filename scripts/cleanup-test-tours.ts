import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestTours() {
  console.log('🧹 Cleaning up test tours...');

  // Find all tours created by test operators (operator1@lunavia.com to operator8@lunavia.com)
  // and test agencies (agency1@lunavia.com to agency5@lunavia.com)
  const testOperatorEmails = Array.from({ length: 8 }, (_, i) => `operator${i + 1}@lunavia.com`);
  const testAgencyEmails = Array.from({ length: 5 }, (_, i) => `agency${i + 1}@lunavia.com`);
  const testEmails = [...testOperatorEmails, ...testAgencyEmails];

  // Get test user IDs
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        in: testEmails,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const testUserIds = testUsers.map((u) => u.id);

  if (testUserIds.length === 0) {
    console.log('ℹ️  No test users found. Nothing to clean up.');
    await prisma.$disconnect();
    return;
  }

  console.log(`📋 Found ${testUserIds.length} test users`);

  // Find all tours created by test users
  const testTours = await prisma.tour.findMany({
    where: {
      operatorId: {
        in: testUserIds,
      },
    },
    select: {
      id: true,
      title: true,
      operatorId: true,
    },
  });

  console.log(`📋 Found ${testTours.length} tours created by test users`);

  if (testTours.length === 0) {
    console.log('ℹ️  No test tours found. Nothing to clean up.');
    await prisma.$disconnect();
    return;
  }

  const testTourIds = testTours.map((t) => t.id);

  // Delete applications related to test tours
  const deletedApplications = await prisma.application.deleteMany({
    where: {
      tourId: {
        in: testTourIds,
      },
    },
  });

  console.log(`🗑️  Deleted ${deletedApplications.count} applications`);

  // Delete assignments related to test tours
  const deletedAssignments = await prisma.assignment.deleteMany({
    where: {
      tourId: {
        in: testTourIds,
      },
    },
  });

  console.log(`🗑️  Deleted ${deletedAssignments.count} assignments`);

  // Delete tour reports related to test tours
  const deletedReports = await prisma.tourReport.deleteMany({
    where: {
      tourId: {
        in: testTourIds,
      },
    },
  });

  console.log(`🗑️  Deleted ${deletedReports.count} tour reports`);

  // Delete payments related to test tours
  const deletedPayments = await prisma.payment.deleteMany({
    where: {
      tourId: {
        in: testTourIds,
      },
    },
  });

  console.log(`🗑️  Deleted ${deletedPayments.count} payments`);

  // Delete contracts related to test tours
  const deletedContracts = await prisma.contract.deleteMany({
    where: {
      tourId: {
        in: testTourIds,
      },
    },
  });

  console.log(`🗑️  Deleted ${deletedContracts.count} contracts`);

  // Finally, delete the tours
  const deletedTours = await prisma.tour.deleteMany({
    where: {
      id: {
        in: testTourIds,
      },
    },
  });

  console.log(`🗑️  Deleted ${deletedTours.count} tours`);

  console.log('\n✅ Cleanup completed!');
  console.log(`   - Deleted ${deletedTours.count} tours`);
  console.log(`   - Deleted ${deletedApplications.count} applications`);
  console.log(`   - Deleted ${deletedAssignments.count} assignments`);
  console.log(`   - Deleted ${deletedReports.count} tour reports`);
  console.log(`   - Deleted ${deletedPayments.count} payments`);
  console.log(`   - Deleted ${deletedContracts.count} contracts`);
}

cleanupTestTours()
  .catch((e) => {
    console.error('❌ Cleanup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });








