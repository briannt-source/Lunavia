/**
 * Script to delete all tours from the database
 * WARNING: This will permanently delete all tours and related data
 * Use with caution!
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("⚠️  WARNING: This will delete ALL tours and related data!");
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");

  // Wait 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("🔄 Starting deletion process...\n");

  try {
    // Delete in order to respect foreign key constraints
    
    // 1. Delete messages and conversations
    console.log("Deleting messages...");
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`✓ Deleted ${deletedMessages.count} messages`);

    console.log("Deleting conversations...");
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`✓ Deleted ${deletedConversations.count} conversations`);

    // 2. Delete tour reports
    console.log("Deleting tour reports...");
    const deletedReports = await prisma.tourReport.deleteMany({});
    console.log(`✓ Deleted ${deletedReports.count} tour reports`);

    // 3. Delete payments related to tours
    console.log("Deleting payments...");
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✓ Deleted ${deletedPayments.count} payments`);

    // 4. Delete assignments
    console.log("Deleting assignments...");
    const deletedAssignments = await prisma.assignment.deleteMany({});
    console.log(`✓ Deleted ${deletedAssignments.count} assignments`);

    // 5. Delete applications
    console.log("Deleting applications...");
    const deletedApplications = await prisma.application.deleteMany({});
    console.log(`✓ Deleted ${deletedApplications.count} applications`);

    // 6. Delete contracts
    console.log("Deleting contracts...");
    const deletedContracts = await prisma.contract.deleteMany({});
    console.log(`✓ Deleted ${deletedContracts.count} contracts`);

    // 7. Delete tour edit/delete requests
    console.log("Deleting tour edit requests...");
    const deletedEditRequests = await prisma.tourEditRequest.deleteMany({});
    console.log(`✓ Deleted ${deletedEditRequests.count} tour edit requests`);

    console.log("Deleting tour delete requests...");
    const deletedDeleteRequests = await prisma.tourDeleteRequest.deleteMany({});
    console.log(`✓ Deleted ${deletedDeleteRequests.count} tour delete requests`);

    // 8. Finally, delete tours
    console.log("Deleting tours...");
    const deletedTours = await prisma.tour.deleteMany({});
    console.log(`✓ Deleted ${deletedTours.count} tours`);

    console.log("\n✅ All tours and related data have been deleted successfully!");
  } catch (error) {
    console.error("\n❌ Error deleting tours:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



