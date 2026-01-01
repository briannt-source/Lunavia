import { prisma } from "@/lib/prisma";

/**
 * Generate unique user code for guides and agencies
 * Format: 
 * - GUIDE-YYYYMMDD-XXXX (for TOUR_GUIDE)
 * - AGENCY-YYYYMMDD-XXXX (for TOUR_AGENCY)
 * - OPERATOR-YYYYMMDD-XXXX (for TOUR_OPERATOR)
 */
export async function generateUserCode(
  role: "TOUR_GUIDE" | "TOUR_OPERATOR" | "TOUR_AGENCY",
  createdAt?: Date
): Promise<string> {
  const prefix = role === "TOUR_GUIDE" 
    ? "GUIDE" 
    : role === "TOUR_AGENCY" 
    ? "AGENCY" 
    : "OPERATOR";

  const date = createdAt || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;
  const baseCode = `${prefix}-${datePrefix}`;

  // Find the highest sequence number for today
  const todayUsers = await prisma.user.findMany({
    where: {
      code: {
        startsWith: baseCode,
      },
      role: role,
    },
    orderBy: {
      code: "desc",
    },
    take: 1,
  });

  let sequence = 1;
  if (todayUsers.length > 0) {
    const lastCode = todayUsers[0].code;
    if (lastCode) {
      const lastSequence = parseInt(lastCode.split("-")[2] || "0");
      sequence = lastSequence + 1;
    }
  }

  const code = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  // Double check uniqueness
  const existing = await prisma.user.findUnique({
    where: { code },
  });

  if (existing) {
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

/**
 * Generate user code for existing users (migration)
 */
export async function generateUserCodeForExistingUser(
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

