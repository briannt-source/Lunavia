import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generate tour code for existing tour (migration)
 */
async function generateTourCodeForExistingTour(
  tourId: string,
  createdAt: Date
): Promise<string> {
  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;
  const baseCode = `TOUR-${datePrefix}`;

  // Find the highest sequence number for that date
  const dateTours = await prisma.tour.findMany({
    where: {
      code: {
        startsWith: baseCode,
      },
      NOT: {
        id: tourId,
      },
    },
    orderBy: {
      code: "desc",
    },
    take: 1,
  });

  let sequence = 1;
  if (dateTours.length > 0) {
    const lastCode = dateTours[0].code;
    const lastSequence = parseInt(lastCode?.split("-")[2] || "0");
    sequence = lastSequence + 1;
  }

  const code = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  // Check uniqueness
  const existing = await prisma.tour.findUnique({
    where: { code },
  });

  if (existing && existing.id !== tourId) {
    return generateTourCodeWithSequence(baseCode, sequence + 1);
  }

  return code;
}

/**
 * Generate tour code with specific sequence number
 */
async function generateTourCodeWithSequence(
  baseCode: string,
  sequence: number
): Promise<string> {
  const code = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  const existing = await prisma.tour.findUnique({
    where: { code },
  });

  if (existing) {
    return generateTourCodeWithSequence(baseCode, sequence + 1);
  }

  return code;
}

async function main() {
  console.log("🔄 Bắt đầu generate mã tour cho các tour hiện có...\n");

  // Get all tours without code
  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        { code: null },
        { code: "" },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`📊 Tìm thấy ${tours.length} tour chưa có mã\n`);

  if (tours.length === 0) {
    console.log("✅ Tất cả tour đã có mã!");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const tour of tours) {
    try {
      const code = await generateTourCodeForExistingTour(
        tour.id,
        tour.createdAt
      );

      await prisma.tour.update({
        where: { id: tour.id },
        data: { code },
      });

      console.log(`✅ Tour "${tour.title}" (${tour.id}): ${code}`);
      successCount++;
    } catch (error: any) {
      console.error(
        `❌ Lỗi khi generate mã cho tour "${tour.title}" (${tour.id}):`,
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

