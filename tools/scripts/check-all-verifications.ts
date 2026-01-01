import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Check all verifications and their document status
 */
async function checkAllVerifications() {
  console.log("\n🔍 Checking all verifications for documents...\n");

  try {
    const verifications = await prisma.verification.findMany({
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

    let withFiles = 0;
    let withoutFiles = 0;

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
      
      if (hasFiles) {
        withFiles++;
      } else {
        withoutFiles++;
      }

      const statusIcon = hasFiles ? "✅" : "❌";
      console.log(`${index + 1}. ${statusIcon} ${v.id}`);
      console.log(`   Status: ${v.status}`);
      console.log(`   User: ${v.user.email} (${v.user.role})`);
      console.log(`   Created: ${v.createdAt.toISOString()}`);
      
      if (hasFiles) {
        if (hasDocumentsArray) {
          console.log(`   📦 Documents array: ${v.documents.length} files`);
        }
        if (hasLegacyFields) {
          const count = [
            v.photoUrl,
            v.idDocumentUrl,
            v.licenseUrl,
            v.travelLicenseUrl,
            v.proofOfAddressUrl,
          ].filter(Boolean).length;
          console.log(`   📄 Legacy fields: ${count} fields filled`);
        }
        if (v.adminNotes && v.adminNotes.includes("FILE_COUNTS:")) {
          console.log(`   📊 FILE_COUNTS: ✅`);
        }
      } else {
        console.log(`   ⚠️  No documents found`);
      }
      console.log("");
    });

    console.log("\n📊 Summary:");
    console.log(`   ✅ With files: ${withFiles}`);
    console.log(`   ❌ Without files: ${withoutFiles}`);
    console.log(`   📈 Total: ${verifications.length}`);

    if (withoutFiles > 0) {
      console.log(`\n⚠️  ${withoutFiles} verification(s) without files. These may need to be resubmitted.`);
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllVerifications();






