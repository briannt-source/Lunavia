import { prisma } from "@/lib/prisma";
import { MilestoneStatus } from "@prisma/client";
import { EscrowService } from "./escrow.service";
import { WalletService } from "./wallet.service";
import { NotificationService } from "./notification.service";

export interface CreatePaymentMilestonesInput {
  tourId: string;
  guideId: string;
  applicationId?: string;
  assignmentId?: string;
  totalAmount: number;
  autoReleaseEnabled?: boolean;
  autoReleaseHours?: number;
}

export interface RequestMilestonePaymentInput {
  milestoneId: string;
  milestoneNumber: 1 | 2 | 3;
  guideId: string;
}

export interface ApproveMilestonePaymentInput {
  milestoneId: string;
  milestoneNumber: 1 | 2 | 3;
  operatorId: string;
}

export interface RejectMilestonePaymentInput {
  milestoneId: string;
  milestoneNumber: 1 | 2 | 3;
  operatorId: string;
  reason?: string;
}

export class PaymentMilestoneService {
  /**
   * Create payment milestones when application/assignment is accepted
   * Default split: 30% - 40% - 30%
   */
  static async createPaymentMilestones(input: CreatePaymentMilestonesInput) {
    const { totalAmount, autoReleaseEnabled = false, autoReleaseHours = 24 } = input;

    // Calculate milestone amounts (30% - 40% - 30%)
    const milestone1Amount = Math.round(totalAmount * 0.3);
    const milestone2Amount = Math.round(totalAmount * 0.4);
    const milestone3Amount = totalAmount - milestone1Amount - milestone2Amount; // Remaining to ensure total is correct

    // Create payment milestone record
    const milestone = await prisma.paymentMilestone.create({
      data: {
        tourId: input.tourId,
        guideId: input.guideId,
        applicationId: input.applicationId,
        assignmentId: input.assignmentId,
        totalAmount,
        milestone1Amount,
        milestone2Amount,
        milestone3Amount,
        autoReleaseEnabled,
        autoReleaseHours,
        milestone1Status: MilestoneStatus.PENDING,
        milestone2Status: MilestoneStatus.PENDING,
        milestone3Status: MilestoneStatus.PENDING,
      },
    });

    // Create escrow for milestone 1 (accept application)
    if (milestone1Amount > 0) {
      try {
        const tour = await prisma.tour.findUnique({
          where: { id: input.tourId },
          include: { operator: true },
        });

        if (tour) {
          const escrow = await EscrowService.createEscrowAccount({
            operatorId: tour.operatorId,
            guideId: input.guideId,
            tourId: input.tourId,
            amount: milestone1Amount,
          });

          // Link escrow to milestone
          await prisma.escrowAccount.update({
            where: { id: escrow.id },
            data: { paymentMilestoneId: milestone.id },
          });

          // Auto-lock milestone 1 escrow
          await EscrowService.lockEscrow(escrow.id);
        }
      } catch (error) {
        console.error("Failed to create escrow for milestone 1:", error);
        // Don't fail milestone creation if escrow fails
      }
    }

    return milestone;
  }

  /**
   * Get payment milestones for a tour and guide
   */
  static async getPaymentMilestones(tourId: string, guideId: string) {
    return prisma.paymentMilestone.findUnique({
      where: {
        tourId_guideId: {
          tourId,
          guideId,
        },
      },
      include: {
        tour: true,
        guide: {
          include: {
            profile: true,
          },
        },
        escrowAccounts: true,
        milestone1Payment: true,
        milestone2Payment: true,
        milestone3Payment: true,
      },
    });
  }

  /**
   * Request milestone payment (by guide)
   */
  static async requestMilestonePayment(input: RequestMilestonePaymentInput) {
    const milestone = await prisma.paymentMilestone.findUnique({
      where: { id: input.milestoneId },
      include: {
        tour: true,
      },
    });

    if (!milestone) {
      throw new Error("Payment milestone not found");
    }

    if (milestone.guideId !== input.guideId) {
      throw new Error("Unauthorized: You can only request payment for your own milestones");
    }

    // Check which milestone to request
    const milestoneField = `milestone${input.milestoneNumber}Status` as keyof typeof milestone;
    const currentStatus = milestone[milestoneField] as MilestoneStatus;

    if (currentStatus !== MilestoneStatus.PENDING) {
      throw new Error(`Milestone ${input.milestoneNumber} is already ${currentStatus}`);
    }

    // Validate milestone can be requested
    if (input.milestoneNumber === 1) {
      // Milestone 1: Can request immediately after acceptance
      // No validation needed
    } else if (input.milestoneNumber === 2) {
      // Milestone 2: Can only request when tour is IN_PROGRESS
      if (milestone.tour.status !== "IN_PROGRESS") {
        throw new Error("Milestone 2 can only be requested when tour is IN_PROGRESS");
      }
    } else if (input.milestoneNumber === 3) {
      // Milestone 3: Can only request when tour is COMPLETED and report submitted
      if (milestone.tour.status !== "COMPLETED") {
        throw new Error("Milestone 3 can only be requested when tour is COMPLETED");
      }

      // Check if report was submitted within 2 hours
      const tourReport = await prisma.tourReport.findUnique({
        where: {
          tourId_guideId: {
            tourId: milestone.tourId,
            guideId: input.guideId,
          },
        },
      });

      if (!tourReport || !tourReport.submittedAt) {
        throw new Error("Tour report must be submitted before requesting milestone 3 payment");
      }

      const tourEnd = milestone.tour.endDate
        ? new Date(milestone.tour.endDate)
        : new Date(milestone.tour.startDate);
      const reportSubmissionTime = new Date(tourReport.submittedAt);
      const hoursAfterTourEnd =
        (reportSubmissionTime.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);

      if (hoursAfterTourEnd > 2) {
        throw new Error(
          "Tour report was submitted too late. Milestone 3 cannot be requested if report is submitted more than 2 hours after tour ends."
        );
      }
    }

    // Update milestone status to REQUESTED
    const updateData: any = {
      [`milestone${input.milestoneNumber}Status`]: MilestoneStatus.REQUESTED,
      [`milestone${input.milestoneNumber}RequestedAt`]: new Date(),
    };

    const updatedMilestone = await prisma.paymentMilestone.update({
      where: { id: input.milestoneId },
      data: updateData,
    });

    // Notify operator
    await NotificationService.notifyPaymentRequest(
      milestone.tour.operatorId,
      milestone.tourId,
      milestone[`milestone${input.milestoneNumber}Amount` as keyof typeof milestone] as number
    );

    return updatedMilestone;
  }

  /**
   * Approve milestone payment (by operator)
   */
  static async approveMilestonePayment(input: ApproveMilestonePaymentInput) {
    const milestone = await prisma.paymentMilestone.findUnique({
      where: { id: input.milestoneId },
      include: {
        tour: {
          include: {
            operator: true,
          },
        },
        guide: true,
      },
    });

    if (!milestone) {
      throw new Error("Payment milestone not found");
    }

    if (milestone.tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You can only approve milestones for your own tours");
    }

    const milestoneField = `milestone${input.milestoneNumber}Status` as keyof typeof milestone;
    const currentStatus = milestone[milestoneField] as MilestoneStatus;

    if (currentStatus !== MilestoneStatus.REQUESTED) {
      throw new Error(`Milestone ${input.milestoneNumber} is not in REQUESTED status`);
    }

    const milestoneAmount = milestone[
      `milestone${input.milestoneNumber}Amount` as keyof typeof milestone
    ] as number;

    // Find escrow for this milestone
    const escrowAccount = await prisma.escrowAccount.findFirst({
      where: {
        tourId: milestone.tourId,
        guideId: milestone.guideId,
        paymentMilestoneId: milestone.id,
        status: "LOCKED",
      },
    });

    let payment;

    if (escrowAccount) {
      // Release from escrow
      payment = await EscrowService.releaseEscrow(
        escrowAccount.id,
        `Milestone ${input.milestoneNumber} payment approved`
      );
    } else {
      // Direct payment (backward compatibility)
      payment = await WalletService.transfer(
        input.operatorId,
        milestone.guideId,
        milestoneAmount,
        milestone.tourId
      );
    }

    // Update milestone status
    const updateData: any = {
      [`milestone${input.milestoneNumber}Status`]: MilestoneStatus.PAID,
      [`milestone${input.milestoneNumber}PaidAt`]: new Date(),
      [`milestone${input.milestoneNumber}PaymentId`]: payment.id,
    };

    const updatedMilestone = await prisma.paymentMilestone.update({
      where: { id: input.milestoneId },
      data: updateData,
    });

    // Notify guide
    await NotificationService.notifyPaymentSent(milestone.guideId, payment.id);

    return updatedMilestone;
  }

  /**
   * Reject milestone payment (by operator)
   */
  static async rejectMilestonePayment(input: RejectMilestonePaymentInput) {
    const milestone = await prisma.paymentMilestone.findUnique({
      where: { id: input.milestoneId },
      include: {
        tour: true,
      },
    });

    if (!milestone) {
      throw new Error("Payment milestone not found");
    }

    if (milestone.tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You can only reject milestones for your own tours");
    }

    const milestoneField = `milestone${input.milestoneNumber}Status` as keyof typeof milestone;
    const currentStatus = milestone[milestoneField] as MilestoneStatus;

    if (currentStatus !== MilestoneStatus.REQUESTED) {
      throw new Error(`Milestone ${input.milestoneNumber} is not in REQUESTED status`);
    }

    // Update milestone status to REJECTED
    const updateData: any = {
      [`milestone${input.milestoneNumber}Status`]: MilestoneStatus.REJECTED,
    };

    const updatedMilestone = await prisma.paymentMilestone.update({
      where: { id: input.milestoneId },
      data: updateData,
    });

    // Notify guide
    await NotificationService.notifyApplicationStatus(
      milestone.guideId,
      input.milestoneId,
      "REJECTED"
    );

    return updatedMilestone;
  }

  /**
   * Auto-release milestone payment after timeout
   */
  static async autoReleaseMilestone(milestoneId: string, milestoneNumber: 1 | 2 | 3) {
    const milestone = await prisma.paymentMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        tour: {
          include: {
            operator: true,
          },
        },
        guide: true,
      },
    });

    if (!milestone) {
      throw new Error("Payment milestone not found");
    }

    if (!milestone.autoReleaseEnabled) {
      return; // Auto-release is disabled
    }

    const milestoneField = `milestone${milestoneNumber}Status` as keyof typeof milestone;
    const currentStatus = milestone[milestoneField] as MilestoneStatus;

    if (currentStatus !== MilestoneStatus.REQUESTED) {
      return; // Not in REQUESTED status
    }

    const requestedAtField = `milestone${milestoneNumber}RequestedAt` as keyof typeof milestone;
    const requestedAt = milestone[requestedAtField] as Date | null;

    if (!requestedAt) {
      return; // No request time found
    }

    // Check if auto-release time has passed
    const now = new Date();
    const hoursSinceRequest = (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRequest < milestone.autoReleaseHours) {
      return; // Not yet time for auto-release
    }

    // Auto-release the milestone
    const milestoneAmount = milestone[
      `milestone${milestoneNumber}Amount` as keyof typeof milestone
    ] as number;

    // Find escrow for this milestone
    const escrowAccount = await prisma.escrowAccount.findFirst({
      where: {
        tourId: milestone.tourId,
        guideId: milestone.guideId,
        paymentMilestoneId: milestone.id,
        status: "LOCKED",
      },
    });

    let payment;

    if (escrowAccount) {
      // Release from escrow
      payment = await EscrowService.releaseEscrow(
        escrowAccount.id,
        `Milestone ${milestoneNumber} payment auto-released after ${milestone.autoReleaseHours} hours`
      );
    } else {
      // Direct payment (backward compatibility)
      payment = await WalletService.transfer(
        milestone.tour.operatorId,
        milestone.guideId,
        milestoneAmount,
        milestone.tourId
      );
    }

    // Update milestone status
    const updateData: any = {
      [`milestone${milestoneNumber}Status`]: MilestoneStatus.AUTO_RELEASED,
      [`milestone${milestoneNumber}PaidAt`]: new Date(),
      [`milestone${milestoneNumber}PaymentId`]: payment.id,
    };

    const updatedMilestone = await prisma.paymentMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    // Notify guide
    await NotificationService.notifyPaymentSent(milestone.guideId, payment.id);

    return updatedMilestone;
  }

  /**
   * Trigger milestone 1 payment (when application is accepted)
   */
  static async triggerMilestone1(milestoneId: string) {
    const milestone = await prisma.paymentMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new Error("Payment milestone not found");
    }

    if (milestone.milestone1Status !== MilestoneStatus.PENDING) {
      return; // Already processed
    }

    // Auto-request milestone 1 if auto-release is enabled
    if (milestone.autoReleaseEnabled) {
      await this.requestMilestonePayment({
        milestoneId,
        milestoneNumber: 1,
        guideId: milestone.guideId,
      });

      // Auto-approve after timeout
      // This will be handled by cron job
    } else {
      // Just mark as available for request
      // Guide can request manually
    }
  }

  /**
   * Trigger milestone 2 payment (when tour starts)
   */
  static async triggerMilestone2(milestoneId: string) {
    const milestone = await prisma.paymentMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        tour: true,
      },
    });

    if (!milestone) {
      throw new Error("Payment milestone not found");
    }

    if (milestone.milestone2Status !== MilestoneStatus.PENDING) {
      return; // Already processed
    }

    if (milestone.tour.status !== "IN_PROGRESS") {
      return; // Tour is not in progress
    }

    // Create escrow for milestone 2
    try {
      const escrow = await EscrowService.createEscrowAccount({
        operatorId: milestone.tour.operatorId,
        guideId: milestone.guideId,
        tourId: milestone.tourId,
        amount: milestone.milestone2Amount,
      });

      // Link escrow to milestone
      await prisma.escrowAccount.update({
        where: { id: escrow.id },
        data: { paymentMilestoneId: milestone.id },
      });

      // Auto-lock milestone 2 escrow
      await EscrowService.lockEscrow(escrow.id);
    } catch (error) {
      console.error("Failed to create escrow for milestone 2:", error);
    }

    // Auto-request milestone 2 if auto-release is enabled
    if (milestone.autoReleaseEnabled) {
      await this.requestMilestonePayment({
        milestoneId,
        milestoneNumber: 2,
        guideId: milestone.guideId,
      });
    }
  }

  /**
   * Trigger milestone 3 payment (when tour completes and report submitted)
   */
  static async triggerMilestone3(milestoneId: string) {
    const milestone = await prisma.paymentMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        tour: true,
      },
    });

    if (!milestone) {
      throw new Error("Payment milestone not found");
    }

    if (milestone.milestone3Status !== MilestoneStatus.PENDING) {
      return; // Already processed
    }

    if (milestone.tour.status !== "COMPLETED") {
      return; // Tour is not completed
    }

    // Check if report was submitted within 2 hours
    const tourReport = await prisma.tourReport.findUnique({
      where: {
        tourId_guideId: {
          tourId: milestone.tourId,
          guideId: milestone.guideId,
        },
      },
    });

    if (!tourReport || !tourReport.submittedAt) {
      return; // Report not submitted
    }

    const tourEnd = milestone.tour.endDate
      ? new Date(milestone.tour.endDate)
      : new Date(milestone.tour.startDate);
    const reportSubmissionTime = new Date(tourReport.submittedAt);
    const hoursAfterTourEnd =
      (reportSubmissionTime.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);

    if (hoursAfterTourEnd > 2) {
      return; // Report submitted too late
    }

    // Create escrow for milestone 3
    try {
      const escrow = await EscrowService.createEscrowAccount({
        operatorId: milestone.tour.operatorId,
        guideId: milestone.guideId,
        tourId: milestone.tourId,
        amount: milestone.milestone3Amount,
      });

      // Link escrow to milestone
      await prisma.escrowAccount.update({
        where: { id: escrow.id },
        data: { paymentMilestoneId: milestone.id },
      });

      // Auto-lock milestone 3 escrow
      await EscrowService.lockEscrow(escrow.id);
    } catch (error) {
      console.error("Failed to create escrow for milestone 3:", error);
    }

    // Auto-request milestone 3 if auto-release is enabled
    if (milestone.autoReleaseEnabled) {
      await this.requestMilestonePayment({
        milestoneId,
        milestoneNumber: 3,
        guideId: milestone.guideId,
      });
    }
  }
}

