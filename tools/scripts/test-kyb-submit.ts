import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Test script to simulate KYB submission with files
 * This helps debug the submission process
 */
async function testKybSubmit() {
  console.log("\n🧪 Testing KYB Submission\n");

  try {
    // Find a TOUR_OPERATOR user
    const operator = await prisma.user.findFirst({
      where: {
        role: { in: ["TOUR_OPERATOR", "TOUR_AGENCY"] },
      },
    });

    if (!operator) {
      console.log("❌ No operator found. Please create a TOUR_OPERATOR user first.");
      return;
    }

    console.log(`✅ Found operator: ${operator.email} (${operator.id})`);

    // Create test file URLs (simulating uploaded files)
    // In real scenario, these would be actual file URLs from /api/upload
    const testFiles = {
      photoUrl: [
        "/uploads/test-photo-1.jpg",
        "/uploads/test-photo-2.jpg",
      ],
      idDocumentUrl: [
        "/uploads/test-id-1.pdf",
        "/uploads/test-id-2.pdf",
      ],
      licenseUrl: [
        "/uploads/test-license-1.pdf",
      ],
      travelLicenseUrl: operator.role === "TOUR_OPERATOR" ? [
        "/uploads/test-travel-license-1.pdf",
      ] : [],
      proofOfAddressUrl: [
        "/uploads/test-address-1.pdf",
        "/uploads/test-address-2.pdf",
      ],
    };

    console.log("\n📁 Test files to submit:");
    console.log(`  - photoUrl: ${testFiles.photoUrl.length} files`);
    console.log(`  - idDocumentUrl: ${testFiles.idDocumentUrl.length} files`);
    console.log(`  - licenseUrl: ${testFiles.licenseUrl.length} files`);
    if (operator.role === "TOUR_OPERATOR") {
      console.log(`  - travelLicenseUrl: ${testFiles.travelLicenseUrl.length} files`);
    }
    console.log(`  - proofOfAddressUrl: ${testFiles.proofOfAddressUrl.length} files`);

    // Simulate the use case
    const { SubmitKybUseCase } = await import("../src/application/use-cases/verification/submit-kyb.use-case");
    const useCase = new SubmitKybUseCase();

    console.log("\n🔄 Executing SubmitKybUseCase...");
    const verification = await useCase.execute({
      operatorId: operator.id,
      photoUrl: testFiles.photoUrl,
      idDocumentUrl: testFiles.idDocumentUrl,
      licenseUrl: testFiles.licenseUrl,
      travelLicenseUrl: testFiles.travelLicenseUrl,
      proofOfAddressUrl: testFiles.proofOfAddressUrl,
    });

    console.log(`\n✅ Verification created/updated: ${verification.id}`);

    // Verify what was saved
    const saved = await prisma.verification.findUnique({
      where: { id: verification.id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!saved) {
      console.log("❌ Verification not found after save!");
      return;
    }

    console.log("\n📊 Verification Details:");
    console.log(`  - Status: ${saved.status}`);
    console.log(`  - User: ${saved.user.email} (${saved.user.role})`);
    console.log(`  - Documents array length: ${Array.isArray(saved.documents) ? saved.documents.length : 0}`);
    console.log(`  - photoUrl: ${saved.photoUrl || "❌ null"}`);
    console.log(`  - idDocumentUrl: ${saved.idDocumentUrl || "❌ null"}`);
    console.log(`  - licenseUrl: ${saved.licenseUrl || "❌ null"}`);
    console.log(`  - travelLicenseUrl: ${saved.travelLicenseUrl || "❌ null"}`);
    console.log(`  - proofOfAddressUrl: ${saved.proofOfAddressUrl || "❌ null"}`);
    console.log(`  - adminNotes: ${saved.adminNotes ? saved.adminNotes.substring(0, 100) + "..." : "❌ null"}`);

    if (Array.isArray(saved.documents) && saved.documents.length > 0) {
      console.log("\n📦 Documents array contents:");
      saved.documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc}`);
      });
    } else {
      console.log("\n⚠️  WARNING: Documents array is empty!");
    }

    // Check if FILE_COUNTS is in adminNotes
    if (saved.adminNotes && saved.adminNotes.includes("FILE_COUNTS:")) {
      const match = saved.adminNotes.match(/FILE_COUNTS:([^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+)/);
      if (match) {
        const counts = match[1].split("|").map(Number);
        console.log("\n📈 FILE_COUNTS parsed:");
        console.log(`  - photoUrl: ${counts[0]}`);
        console.log(`  - idDocumentUrl: ${counts[1]}`);
        console.log(`  - licenseUrl: ${counts[2]}`);
        console.log(`  - travelLicenseUrl: ${counts[3]}`);
        console.log(`  - proofOfAddressUrl: ${counts[4]}`);
      }
    }

    console.log("\n✅ Test completed successfully!");
    console.log(`\n🔗 You can check this verification at: /dashboard/admin/verifications/${verification.id}`);

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testKybSubmit();






