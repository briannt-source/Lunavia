/**
 * Script to delete all test users from the database
 * WARNING: This will permanently delete all test users and related data
 * Use with caution!
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("⚠️  WARNING: This will delete ALL test users and related data!");
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");

  // Wait 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("🔄 Starting deletion process...\n");

  try {
    // Define test user email patterns
    const testOperatorEmails = Array.from({ length: 8 }, (_, i) => `operator${i + 1}@lunavia.com`);
    const testAgencyEmails = Array.from({ length: 5 }, (_, i) => `agency${i + 1}@lunavia.com`);
    const testGuideEmails = Array.from({ length: 25 }, (_, i) => `guide${i + 1}@lunavia.com`);
    const testUserEmails = [
      ...testOperatorEmails,
      ...testAgencyEmails,
      ...testGuideEmails,
      "guide@lunavia.test", // From create-test-users.ts
    ];

    // Also include admin test users if needed
    const testAdminEmails = [
      "admin@lunavia.test",
      "mod@lunavia.test",
      "support@lunavia.test",
    ];

    console.log(`📋 Test user patterns:`);
    console.log(`   - Operators: ${testOperatorEmails.length} users`);
    console.log(`   - Agencies: ${testAgencyEmails.length} users`);
    console.log(`   - Guides: ${testGuideEmails.length} users`);
    console.log(`   - Test accounts: 1 user`);
    console.log(`   - Admin accounts: ${testAdminEmails.length} users\n`);

    // Find all test users
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: testUserEmails,
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const testUserIds = testUsers.map((u) => u.id);

    if (testUserIds.length === 0) {
      console.log("ℹ️  No test users found. Nothing to delete.");
    } else {
      console.log(`📋 Found ${testUserIds.length} test users to delete:`);
      testUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      console.log();

      // Find all tours created by test users
      const testTours = await prisma.tour.findMany({
        where: {
          operatorId: {
            in: testUserIds,
          },
        },
        select: {
          id: true,
        },
      });

      const testTourIds = testTours.map((t) => t.id);

      if (testTourIds.length > 0) {
        console.log(`📋 Found ${testTourIds.length} tours created by test users`);

        // Delete in order to respect foreign key constraints

        // 1. Delete messages and conversations
        try {
          console.log("Deleting messages...");
          const deletedMessages = await prisma.message.deleteMany({
            where: {
              senderId: {
                in: testUserIds,
              },
            },
          });
          console.log(`✓ Deleted ${deletedMessages.count} messages`);
        } catch (error: any) {
          if (error.code === "P2021" || error.message?.includes("does not exist")) {
            console.log("⚠️  Messages table not found, skipping");
          } else {
            throw error;
          }
        }

        try {
          console.log("Deleting conversations...");
          const deletedConversations = await prisma.conversation.deleteMany({
            where: {
              OR: [
                { operatorId: { in: testUserIds } },
                { guideId: { in: testUserIds } },
              ],
            },
          });
          console.log(`✓ Deleted ${deletedConversations.count} conversations`);
        } catch (error: any) {
          if (error.code === "P2021" || error.message?.includes("does not exist")) {
            console.log("⚠️  Conversations table not found, skipping");
          } else {
            throw error;
          }
        }

        // 2. Delete tour reports
        console.log("Deleting tour reports...");
        const deletedReports = await prisma.tourReport.deleteMany({
          where: {
            OR: [
              { tourId: { in: testTourIds } },
              { guideId: { in: testUserIds } },
            ],
          },
        });
        console.log(`✓ Deleted ${deletedReports.count} tour reports`);

        // 3. Delete emergency reports
        try {
          console.log("Deleting emergency reports...");
          const deletedEmergencies = await prisma.emergencyReport.deleteMany({
            where: {
              OR: [
                { tourId: { in: testTourIds } },
                { guideId: { in: testUserIds } },
              ],
            },
          });
          console.log(`✓ Deleted ${deletedEmergencies.count} emergency reports`);
        } catch (error: any) {
          if (error.code === "P2021" || error.message?.includes("does not exist")) {
            console.log("⚠️  Emergency reports table not found, skipping");
          } else {
            throw error;
          }
        }

        // 4. Delete applications
        console.log("Deleting applications...");
        const deletedApplications = await prisma.application.deleteMany({
          where: {
            OR: [
              { tourId: { in: testTourIds } },
              { guideId: { in: testUserIds } },
            ],
          },
        });
        console.log(`✓ Deleted ${deletedApplications.count} applications`);

        // 5. Delete assignments
        console.log("Deleting assignments...");
        const deletedAssignments = await prisma.assignment.deleteMany({
          where: {
            OR: [
              { tourId: { in: testTourIds } },
              { guideId: { in: testUserIds } },
            ],
          },
        });
        console.log(`✓ Deleted ${deletedAssignments.count} assignments`);

        // 6. Delete tour edit/delete requests
        try {
          console.log("Deleting tour edit requests...");
          const deletedEditRequests = await prisma.tourEditRequest.deleteMany({
            where: {
              OR: [
                { tourId: { in: testTourIds } },
                { operatorId: { in: testUserIds } },
              ],
            },
          });
          console.log(`✓ Deleted ${deletedEditRequests.count} tour edit requests`);
        } catch (error: any) {
          if (error.code === "P2021" || error.message?.includes("does not exist")) {
            console.log("⚠️  Tour edit requests table not found, skipping");
          } else {
            throw error;
          }
        }

        try {
          console.log("Deleting tour delete requests...");
          const deletedDeleteRequests = await prisma.tourDeleteRequest.deleteMany({
            where: {
              OR: [
                { tourId: { in: testTourIds } },
                { operatorId: { in: testUserIds } },
              ],
            },
          });
          console.log(`✓ Deleted ${deletedDeleteRequests.count} tour delete requests`);
        } catch (error: any) {
          if (error.code === "P2021" || error.message?.includes("does not exist")) {
            console.log("⚠️  Tour delete requests table not found, skipping");
          } else {
            throw error;
          }
        }

        // 7. Delete contracts
        console.log("Deleting contracts...");
        const deletedContracts = await prisma.contract.deleteMany({
          where: {
            tourId: {
              in: testTourIds,
            },
          },
        });
        console.log(`✓ Deleted ${deletedContracts.count} contracts`);

        // 8. Delete tours
        console.log("Deleting tours...");
        const deletedTours = await prisma.tour.deleteMany({
          where: {
            id: {
              in: testTourIds,
            },
          },
        });
        console.log(`✓ Deleted ${deletedTours.count} tours`);
      }

      // 9. Delete company-related data
      console.log("Deleting company members...");
      const deletedMembers = await prisma.companyMember.deleteMany({
        where: {
          guideId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedMembers.count} company members`);

      try {
        console.log("Deleting company invitations...");
        const deletedInvitations = await prisma.companyInvitation.deleteMany({
          where: {
            guideId: {
              in: testUserIds,
            },
          },
        });
        console.log(`✓ Deleted ${deletedInvitations.count} company invitations`);
      } catch (error: any) {
        if (error.code === "P2021" || error.message?.includes("does not exist")) {
          console.log("⚠️  Company invitations table not found, skipping");
        } else {
          throw error;
        }
      }

      try {
        console.log("Deleting join requests...");
        const deletedJoinRequests = await prisma.joinRequest.deleteMany({
          where: {
            guideId: {
              in: testUserIds,
            },
          },
        });
        console.log(`✓ Deleted ${deletedJoinRequests.count} join requests`);
      } catch (error: any) {
        if (error.code === "P2021" || error.message?.includes("does not exist")) {
          console.log("⚠️  Join requests table not found, skipping");
        } else {
          throw error;
        }
      }

      // Delete companies owned by test operators
      console.log("Deleting companies...");
      const deletedCompanies = await prisma.company.deleteMany({
        where: {
          operatorId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedCompanies.count} companies`);

      // 10. Delete reviews
      console.log("Deleting reviews...");
      const deletedReviews = await prisma.review.deleteMany({
        where: {
          OR: [
            { reviewerId: { in: testUserIds } },
            { subjectId: { in: testUserIds } },
          ],
        },
      });
      console.log(`✓ Deleted ${deletedReviews.count} reviews`);

      // 11. Delete contract acceptances
      console.log("Deleting contract acceptances...");
      const deletedContractAcceptances = await prisma.contractAcceptance.deleteMany({
        where: {
          guideId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedContractAcceptances.count} contract acceptances`);

      // 12. Delete verifications
      console.log("Deleting verifications...");
      const deletedVerifications = await prisma.verification.deleteMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedVerifications.count} verifications`);

      // 13. Delete standby requests
      console.log("Deleting standby requests...");
      const deletedStandby = await prisma.standbyRequest.deleteMany({
        where: {
          OR: [
            { mainGuideId: { in: testUserIds } },
            { subGuideId: { in: testUserIds } },
          ],
        },
      });
      console.log(`✓ Deleted ${deletedStandby.count} standby requests`);

      // 14. Delete disputes
      console.log("Deleting disputes...");
      const deletedDisputes = await prisma.dispute.deleteMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedDisputes.count} disputes`);

      // 15. Delete payments (set tourId to null to keep history)
      console.log("Updating payments...");
      const updatedPayments = await prisma.payment.updateMany({
        where: {
          OR: [
            { fromWallet: { userId: { in: testUserIds } } },
            { toWallet: { userId: { in: testUserIds } } },
          ],
        },
        data: {
          tourId: null,
        },
      });
      console.log(`✓ Updated ${updatedPayments.count} payments`);

      // 16. Delete wallets
      console.log("Deleting wallets...");
      const deletedWallets = await prisma.wallet.deleteMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedWallets.count} wallets`);

      // 17. Delete profiles
      console.log("Deleting profiles...");
      const deletedProfiles = await prisma.profile.deleteMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedProfiles.count} profiles`);

      // 18. Delete availabilities
      console.log("Deleting availabilities...");
      const deletedAvailabilities = await prisma.guideAvailability.deleteMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedAvailabilities.count} availabilities`);

      // 19. Delete notifications
      console.log("Deleting notifications...");
      const deletedNotifications = await prisma.notification.deleteMany({
        where: {
          userId: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedNotifications.count} notifications`);

      // 20. Delete user settings
      try {
        console.log("Deleting user settings...");
        const deletedSettings = await prisma.userSettings.deleteMany({
          where: {
            userId: {
              in: testUserIds,
            },
          },
        });
        console.log(`✓ Deleted ${deletedSettings.count} user settings`);
      } catch (error: any) {
        if (error.code === "P2021" || error.message?.includes("does not exist")) {
          console.log("⚠️  User settings table not found, skipping");
        } else {
          throw error;
        }
      }

      // 21. Finally, delete users
      console.log("Deleting users...");
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          id: {
            in: testUserIds,
          },
        },
      });
      console.log(`✓ Deleted ${deletedUsers.count} users`);
    }

    // Delete admin test users
    console.log("\n📋 Deleting admin test users...");
    const deletedAdminUsers = await prisma.adminUser.deleteMany({
      where: {
        email: {
          in: testAdminEmails,
        },
      },
    });
    console.log(`✓ Deleted ${deletedAdminUsers.count} admin users`);

    console.log("\n✅ All test users and related data have been deleted successfully!");
  } catch (error) {
    console.error("\n❌ Error deleting test users:", error);
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

