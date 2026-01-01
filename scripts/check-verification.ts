import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkVerification() {
  const verificationId = process.argv[2] || "cmjqoxzt500071j7uzraa9osx";
  
  console.log(`\n🔍 Checking verification: ${verificationId}\n`);
  
  try {
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!verification) {
      console.log("❌ Verification not found!");
      return;
    }

    console.log("✅ Verification found!");
    console.log("\n📋 Basic Info:");
    console.log(`  - Status: ${verification.status}`);
    console.log(`  - User ID: ${verification.userId}`);
    console.log(`  - User Role: ${verification.user.role}`);
    console.log(`  - User Email: ${verification.user.email}`);
    console.log(`  - Created At: ${verification.createdAt}`);
    
    console.log("\n📄 Legacy Fields (single URLs):");
    console.log(`  - photoUrl: ${verification.photoUrl || "❌ null"}`);
    console.log(`  - idDocumentUrl: ${verification.idDocumentUrl || "❌ null"}`);
    console.log(`  - licenseUrl: ${verification.licenseUrl || "❌ null"}`);
    console.log(`  - travelLicenseUrl: ${verification.travelLicenseUrl || "❌ null"}`);
    console.log(`  - proofOfAddressUrl: ${verification.proofOfAddressUrl || "❌ null"}`);
    
    console.log("\n📦 Documents Array:");
    if (Array.isArray(verification.documents)) {
      console.log(`  - Length: ${verification.documents.length}`);
      if (verification.documents.length > 0) {
        console.log("  - Files:");
        verification.documents.forEach((doc, index) => {
          console.log(`    ${index + 1}. ${doc}`);
        });
      } else {
        console.log("  ❌ Empty array");
      }
    } else {
      console.log("  ❌ Not an array or null");
    }
    
    console.log("\n📝 Admin Notes:");
    if (verification.adminNotes) {
      console.log(`  - Length: ${verification.adminNotes.length} characters`);
      // Check for FILE_COUNTS
      if (verification.adminNotes.includes("FILE_COUNTS:")) {
        const match = verification.adminNotes.match(/FILE_COUNTS:([^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+)/);
        if (match) {
          const counts = match[1].split("|").map(Number);
          console.log("  ✅ FILE_COUNTS found:");
          console.log(`    - photoUrl: ${counts[0]}`);
          console.log(`    - idDocumentUrl: ${counts[1]}`);
          console.log(`    - licenseUrl: ${counts[2]}`);
          console.log(`    - travelLicenseUrl: ${counts[3]}`);
          console.log(`    - proofOfAddressUrl: ${counts[4]}`);
        }
      } else {
        console.log("  ⚠️  No FILE_COUNTS found");
      }
      // Show first 200 chars of adminNotes
      const preview = verification.adminNotes.length > 200 
        ? verification.adminNotes.substring(0, 200) + "..."
        : verification.adminNotes;
      console.log(`  - Preview: ${preview}`);
    } else {
      console.log("  ❌ null");
    }
    
    console.log("\n🔍 Summary:");
    const hasLegacyFields = !!(
      verification.photoUrl ||
      verification.idDocumentUrl ||
      verification.licenseUrl ||
      verification.travelLicenseUrl ||
      verification.proofOfAddressUrl
    );
    const hasDocumentsArray = Array.isArray(verification.documents) && verification.documents.length > 0;
    
    console.log(`  - Has legacy fields: ${hasLegacyFields ? "✅ Yes" : "❌ No"}`);
    console.log(`  - Has documents array: ${hasDocumentsArray ? "✅ Yes" : "❌ No"}`);
    
    if (!hasLegacyFields && !hasDocumentsArray) {
      console.log("\n⚠️  WARNING: No documents found in this verification!");
    } else {
      console.log("\n✅ Documents are present");
    }
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVerification();






