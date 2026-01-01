import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing Contract Templates & E-Signature System...\n");

  try {
    // 1. Setup test users
    console.log("1️⃣ Setting up test users...");

    let operator = await prisma.user.findUnique({
      where: { email: "operator-contract@lunavia.com" },
      include: { wallet: true, profile: true },
    });

    if (!operator) {
      operator = await prisma.user.create({
        data: {
          email: "operator-contract@lunavia.com",
          password: "hashed_password",
          role: "TOUR_OPERATOR",
          profile: {
            create: {
              name: "Test Operator",
            },
          },
          wallet: {
            create: {
              balance: 10000000,
              lockedDeposit: 1000000,
            },
          },
        },
        include: { wallet: true, profile: true },
      });
    }

    let guide = await prisma.user.findUnique({
      where: { email: "guide-contract@lunavia.com" },
      include: { wallet: true, profile: true },
    });

    if (!guide) {
      guide = await prisma.user.create({
        data: {
          email: "guide-contract@lunavia.com",
          password: "hashed_password",
          role: "TOUR_GUIDE",
          profile: {
            create: {
              name: "Test Guide",
              languages: ["Vietnamese", "English"],
              specialties: ["Cultural Tours"],
            },
          },
          wallet: {
            create: {
              balance: 1000000,
            },
          },
        },
        include: { wallet: true, profile: true },
      });
    }

    console.log(`✅ Operator: ${operator.email} (ID: ${operator.id})`);
    console.log(`✅ Guide: ${guide.email} (ID: ${guide.id})\n`);

    // 2. Create test tour
    console.log("2️⃣ Creating test tour...");
    const { generateTourCode } = await import("../src/lib/tour-code-generator");
    const tourCode = await generateTourCode();
    
    const tour = await prisma.tour.create({
      data: {
        operatorId: operator.id,
        title: "Test Tour for Contracts",
        description: "Test tour for contract templates",
        city: "Ho Chi Minh City",
        status: "OPEN",
        priceMain: 3000000,
        priceSub: 2000000,
        currency: "VND",
        pax: 10,
        languages: ["Vietnamese", "English"],
        specialties: ["Cultural Tours"],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        mainGuideSlots: 1,
        subGuideSlots: 0,
        code: tourCode,
      },
    });

    console.log(`✅ Tour created: ${tour.title} (ID: ${tour.id})\n`);

    // 3. Create application and accept it
    console.log("3️⃣ Creating and accepting application...");
    
    // Clear any existing availability conflicts and applications
    await prisma.guideAvailability.deleteMany({
      where: {
        guideId: guide.id,
      },
    });

    // Delete any existing applications for this guide in conflicting dates
    await prisma.application.deleteMany({
      where: {
        guideId: guide.id,
        tour: {
          OR: [
            {
              startDate: {
                lte: tour.endDate || tour.startDate,
                gte: tour.startDate,
              },
            },
            {
              endDate: {
                lte: tour.endDate || tour.startDate,
                gte: tour.startDate,
              },
            },
          ],
        },
      },
    });

    const application = await prisma.application.create({
      data: {
        tourId: tour.id,
        guideId: guide.id,
        role: "MAIN",
        status: "PENDING",
      },
    });

    const { AcceptApplicationUseCase } = await import("../src/application/use-cases/application/accept-application.use-case");
    const acceptUseCase = new AcceptApplicationUseCase();
    await acceptUseCase.execute({
      operatorId: operator.id,
      applicationId: application.id,
    });

    console.log(`✅ Application accepted\n`);

    // 4. Get contract templates
    console.log("4️⃣ Getting contract templates...");
    const { ContractTemplateService } = await import("../src/domain/services/contract-template.service");
    const templates = await ContractTemplateService.getActiveTemplates();

    console.log(`✅ Found ${templates.length} templates:`);
    templates.forEach((t) => {
      console.log(`   - ${t.name} (${t.category})`);
    });
    console.log();

    // 5. Create contract from template
    console.log("5️⃣ Creating contract from template...");
    const template = templates.find((t) => t.category === "TOUR_GUIDE_STANDARD");
    if (!template) {
      throw new Error("Standard tour guide template not found");
    }

    const { ContractService } = await import("../src/domain/services/contract.service");
    const { CreateContractFromTemplateUseCase } = await import("../src/application/use-cases/contract/create-contract-from-template.use-case");
    const createContractUseCase = new CreateContractFromTemplateUseCase();

    // Prepare variables
    const variables = {
      "tour.title": tour.title,
      "tour.code": tour.code || "N/A",
      "tour.startDate": tour.startDate.toLocaleDateString("vi-VN"),
      "tour.endDate": tour.endDate?.toLocaleDateString("vi-VN") || "N/A",
      "tour.city": tour.city,
      "tour.pax": tour.pax,
      "guide.name": guide.profile?.name || guide.email,
      "guide.email": guide.email,
      "operator.name": operator.profile?.name || operator.email,
      "price": tour.priceMain?.toLocaleString("vi-VN") || "0",
      "contract.createdAt": new Date().toLocaleDateString("vi-VN"),
    };

    const contract = await createContractUseCase.execute({
      operatorId: operator.id,
      tourId: tour.id,
      templateId: template.id,
      variables,
      operatorSignatureUrl: "https://example.com/operator-signature.png",
      operatorSignedIp: "192.168.1.1",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    console.log(`✅ Contract created (ID: ${contract.id})`);
    console.log(`   - Title: ${contract.title}`);
    console.log(`   - Template: ${contract.templateId}`);
    console.log(`   - Version: ${contract.version}`);
    console.log(`   - Operator Signed: ${contract.operatorSignedAt ? "Yes" : "No"}\n`);

    // 6. Get contract with history
    console.log("6️⃣ Getting contract with history...");
    const contractWithHistory = await ContractService.getContractWithHistory(contract.id);

    console.log(`✅ Contract history: ${contractWithHistory?.history.length || 0} versions`);
    console.log(`   - Acceptances: ${contractWithHistory?.acceptances.length || 0}\n`);

    // 7. Guide accepts contract with signature
    console.log("7️⃣ Guide accepting contract with signature...");
    const { AcceptContractWithSignatureUseCase } = await import("../src/application/use-cases/contract/accept-contract-with-signature.use-case");
    const acceptContractUseCase = new AcceptContractWithSignatureUseCase();

    const acceptance = await acceptContractUseCase.execute({
      guideId: guide.id,
      contractId: contract.id,
      signatureUrl: "https://example.com/guide-signature.png",
      signedIp: "192.168.1.2",
    });

    console.log(`✅ Contract accepted:`);
    console.log(`   - Status: ${acceptance.status}`);
    console.log(`   - Signed At: ${acceptance.signedAt}`);
    console.log(`   - Signature URL: ${acceptance.signatureUrl}\n`);

    // 8. Update contract (creates new version)
    console.log("8️⃣ Updating contract (creates new version)...");
    const updatedContract = await ContractService.updateContract({
      contractId: contract.id,
      operatorId: operator.id,
      content: contract.content + "\n\nĐiều khoản bổ sung: Thêm điều khoản mới.",
    });

    console.log(`✅ Contract updated:`);
    console.log(`   - New Version: ${updatedContract.version}`);
    console.log(`   - Previous Version: ${contract.version}\n`);

    // 9. Get contracts expiring soon
    console.log("9️⃣ Getting contracts expiring soon...");
    const expiringContracts = await ContractService.getContractsExpiringSoon(30);

    console.log(`✅ Found ${expiringContracts.length} contracts expiring in 30 days\n`);

    // 10. Test template variable replacement
    console.log("🔟 Testing template variable replacement...");
    const testTemplate = "Tour: {{tour.title}}, Guide: {{guide.name}}, Price: {{price}}";
    const testVariables = {
      "tour.title": "Test Tour",
      "guide.name": "Test Guide",
      "price": 3000000,
    };

    const replaced = ContractTemplateService.replaceVariables({
      templateContent: testTemplate,
      variables: testVariables,
    });

    console.log(`✅ Variable replacement:`);
    console.log(`   - Original: ${testTemplate}`);
    console.log(`   - Replaced: ${replaced}\n`);

    console.log("✅ All tests completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Tour: ${tour.id}`);
    console.log(`   - Contract: ${contract.id}`);
    console.log(`   - Template: ${template.id}`);
    console.log(`   - Contract versions: ${updatedContract.version}`);
    console.log(`   - Contract acceptance: ✅`);
    console.log(`   - E-signatures: ✅`);

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

