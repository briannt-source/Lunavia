import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find test users
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "test", mode: "insensitive" } },
        { email: { contains: "example", mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true },
  });

  console.log(`Found ${testUsers.length} test users`);

  // Delete disputes from test users
  const deleted = await prisma.dispute.deleteMany({
    where: {
      userId: {
        in: testUsers.map((u) => u.id),
      },
    },
  });

  console.log(`Deleted ${deleted.count} disputes from test users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






