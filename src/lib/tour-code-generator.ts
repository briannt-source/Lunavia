import { prisma } from "@/lib/prisma";

/**
 * Generate unique tour code
 * Format: TOUR-YYYYMMDD-XXXX
 * Example: TOUR-20250115-0001
 */
export async function generateTourCode(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;
  const baseCode = `TOUR-${datePrefix}`;

  // Find the highest sequence number for today
  const todayTours = await prisma.tour.findMany({
    where: {
      code: {
        startsWith: baseCode,
      },
    },
    orderBy: {
      code: "desc",
    },
    take: 1,
  });

  let sequence = 1;
  if (todayTours.length > 0) {
    const lastCode = todayTours[0].code;
    if (lastCode) {
      const lastSequence = parseInt(lastCode.split("-")[2] || "0");
      sequence = lastSequence + 1;
    }
  }

  const code = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  // Double check uniqueness (in case of race condition)
  const existing = await prisma.tour.findUnique({
    where: { code },
  });

  if (existing) {
    // If code exists, try next sequence
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

/**
 * Generate tour code for existing tours (migration)
 */
export async function generateTourCodeForExistingTour(
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
    if (lastCode) {
      const lastSequence = parseInt(lastCode.split("-")[2] || "0");
      sequence = lastSequence + 1;
    }
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

