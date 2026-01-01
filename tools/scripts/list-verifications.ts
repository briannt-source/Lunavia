import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listVerifications() {
  console.log("\n🔍 Listing all verifications with document status...\n");
  
  try {
    const verifications = await prisma.verification.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (verifications.length === 0) {
      console.log("❌ No verifications found!");
      return;
    }

    console.log(`Found ${verifications.length} verifications:\n`);

    verifications.forEach((v, index) => {
      const hasLegacyFields = !!(
        v.photoUrl ||
        v.idDocumentUrl ||
        v.licenseUrl ||
        v.travelLicenseUrl ||
        v.proofOfAddressUrl
      );
      const hasDocumentsArray = Array.isArray(v.documents) && v.documents.length > 0;
      const hasFiles = hasLegacyFields || hasDocumentsArray;
      
      console.log(`${index + 1}. ${v.id}`);
      console.log(`   Status: ${v.status}`);
      console.log(`   User: ${v.user.email} (${v.user.role})`);
      console.log(`   Has files: ${hasFiles ? "✅ Yes" : "❌ No"}`);
      if (hasDocumentsArray) {
        console.log(`   Documents array: ${v.documents.length} files`);
      }
      if (hasLegacyFields) {
        const count = [
          v.photoUrl,
          v.idDocumentUrl,
          v.licenseUrl,
          v.travelLicenseUrl,
          v.proofOfAddressUrl,
        ].filter(Boolean).length;
        console.log(`   Legacy fields: ${count} fields filled`);
      }
      console.log("");
    });
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listVerifications();






