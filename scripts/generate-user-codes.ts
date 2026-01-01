import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generate user code for existing user (migration)
 */
async function generateUserCodeForExistingUser(
  userId: string,
  role: "TOUR_GUIDE" | "TOUR_OPERATOR" | "TOUR_AGENCY",
  createdAt: Date
): Promise<string> {
  const prefix = role === "TOUR_GUIDE" 
    ? "GUIDE" 
    : role === "TOUR_AGENCY" 
    ? "AGENCY" 
    : "OPERATOR";

  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;
  const baseCode = `${prefix}-${datePrefix}`;

  // Find the highest sequence number for that date and role
  const dateUsers = await prisma.user.findMany({
    where: {
      code: {
        startsWith: baseCode,
      },
      role: role,
      NOT: {
        id: userId,
      },
    },
    orderBy: {
      code: "desc",
    },
    take: 1,
  });

  let sequence = 1;
  if (dateUsers.length > 0) {
    const lastCode = dateUsers[0].code;
    if (lastCode) {
      const lastSequence = parseInt(lastCode.split("-")[2] || "0");
      sequence = lastSequence + 1;
    }
  }

  const code = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  // Check uniqueness
  const existing = await prisma.user.findUnique({
    where: { code },
  });

  if (existing && existing.id !== userId) {
    return generateUserCodeWithSequence(baseCode, sequence + 1);
  }

  return code;
}

/**
 * Generate user code with specific sequence number
 */
async function generateUserCodeWithSequence(
  baseCode: string,
  sequence: number
): Promise<string> {
  const code = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  const existing = await prisma.user.findUnique({
    where: { code },
  });

  if (existing) {
    return generateUserCodeWithSequence(baseCode, sequence + 1);
  }

  return code;
}

async function main() {
  console.log("🔄 Bắt đầu generate mã user cho guides và agencies...\n");

  // Get all users without code (guides and agencies/operators)
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["TOUR_GUIDE", "TOUR_OPERATOR", "TOUR_AGENCY"],
      },
      OR: [
        { code: null },
        { code: "" },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`📊 Tìm thấy ${users.length} users chưa có mã\n`);

  if (users.length === 0) {
    console.log("✅ Tất cả users đã có mã!");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const code = await generateUserCodeForExistingUser(
        user.id,
        user.role as any,
        user.createdAt
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { code },
      });

      console.log(`✅ User "${user.email}" (${user.role}): ${code}`);
      successCount++;
    } catch (error: any) {
      console.error(
        `❌ Lỗi khi generate mã cho user "${user.email}" (${user.id}):`,
        error.message
      );
      errorCount++;
    }
  }

  console.log(`\n📊 Kết quả:`);
  console.log(`   ✅ Thành công: ${successCount}`);
  console.log(`   ❌ Lỗi: ${errorCount}`);
  console.log(`\n✅ Hoàn thành!`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

