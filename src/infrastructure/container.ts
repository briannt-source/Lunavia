
import { PrismaTourRepository } from './repositories/prisma/PrismaTourRepository';
import { CreateTourUseCase } from '@/application/tour/use-cases/CreateTourUseCase';
import { PrismaGuideApplicationRepository } from './repositories/prisma/PrismaGuideApplicationRepository';
import { ApplyToTourUseCase } from '@/application/guide-application/use-cases/ApplyToTourUseCase';
import { AssignGuideUseCase } from '@/application/guide-application/use-cases/AssignGuideUseCase';


class Container {
    private _tourRepo: PrismaTourRepository | null = null;
    private _createTourUseCase: CreateTourUseCase | null = null;

    private _guideAppRepo: PrismaGuideApplicationRepository | null = null;
    private _applyToTourUseCase: ApplyToTourUseCase | null = null;

    get tourRepository() {
        if (!this._tourRepo) {
            this._tourRepo = new PrismaTourRepository();
        }
        return this._tourRepo;
    }

    get createTourUseCase() {
        if (!this._createTourUseCase) {
            this._createTourUseCase = new CreateTourUseCase(this.tourRepository);
        }
        return this._createTourUseCase;
    }

    get guideApplicationRepository() {
        if (!this._guideAppRepo) {
            this._guideAppRepo = new PrismaGuideApplicationRepository();
        }
        return this._guideAppRepo;
    }

    get applyToTourUseCase() {
        if (!this._applyToTourUseCase) {
            this._applyToTourUseCase = new ApplyToTourUseCase(
                this.guideApplicationRepository,
                this.tourRepository
            );
        }
        return this._applyToTourUseCase;
    }
    async getAssignGuideUseCase() {
        const { AssignGuideUseCase } = await import('@/application/guide-application/use-cases/AssignGuideUseCase');
        return new AssignGuideUseCase(this.tourRepository, this.guideApplicationRepository);
    }

    async getWithdrawApplicationUseCase() {
        const { WithdrawApplicationUseCase } = await import('@/application/guide-application/use-cases/WithdrawApplicationUseCase');
        return new WithdrawApplicationUseCase(this.guideApplicationRepository);
    }

    // Payment & Dispute Use Cases
    private _paymentRepo: any = null;
    private _disputeRepo: any = null;

    private get paymentRepository() {
        if (!this._paymentRepo) {
            const { PrismaPaymentRepository } = require('./repositories/prisma/PrismaPaymentRepository');
            this._paymentRepo = new PrismaPaymentRepository();
        }
        return this._paymentRepo;
    }

    private get disputeRepository() {
        if (!this._disputeRepo) {
            const { PrismaDisputeRepository } = require('./repositories/prisma/PrismaDisputeRepository');
            this._disputeRepo = new PrismaDisputeRepository();
        }
        return this._disputeRepo;
    }

    async getRequestPaymentUseCase() {
        const { RequestPaymentUseCase } = await import('@/application/payment/use-cases/RequestPaymentUseCase');
        return new RequestPaymentUseCase(this.paymentRepository, this.tourRepository);
    }

    async getAcceptPaymentUseCase() {
        const { AcceptPaymentUseCase } = await import('@/application/payment/use-cases/AcceptPaymentUseCase');
        return new AcceptPaymentUseCase(this.paymentRepository, this.tourRepository);
    }

    async getRejectPaymentUseCase() {
        const { RejectPaymentUseCase } = await import('@/application/payment/use-cases/RejectPaymentUseCase');
        return new RejectPaymentUseCase(this.paymentRepository);
    }

    async getRaiseDisputeUseCase() {
        const { RaiseDisputeUseCase } = await import('@/application/payment/use-cases/RaiseDisputeUseCase');
        return new RaiseDisputeUseCase(this.disputeRepository, this.paymentRepository, this.tourRepository);
    }

    async getResolveDisputeUseCase() {
        const { ResolveDisputeUseCase } = await import('@/application/payment/use-cases/ResolveDisputeUseCase');
        // Constructor: (disputeRepo, tourRepo, paymentRepo)
        return new ResolveDisputeUseCase(this.disputeRepository, this.tourRepository, this.paymentRepository);
    }

    // Phase 4: User & Governance
    private _userRepo: any = null;
    private _verificationRepo: any = null;

    private get userRepository() {
        if (!this._userRepo) {
            const { PrismaUserRepository } = require('./repositories/prisma/PrismaUserRepository');
            this._userRepo = new PrismaUserRepository();
        }
        return this._userRepo;
    }

    private get verificationRepository() {
        if (!this._verificationRepo) {
            const { PrismaVerificationRepository } = require('./repositories/prisma/PrismaVerificationRepository');
            this._verificationRepo = new PrismaVerificationRepository();
        }
        return this._verificationRepo;
    }

    async getSuspendUserUseCase() {
        const { SuspendUserUseCase } = await import('@/application/user/use-cases/SuspendUserUseCase');
        return new SuspendUserUseCase(this.userRepository);
    }

    async getReactivateUserUseCase() {
        const { ReactivateUserUseCase } = await import('@/application/user/use-cases/ReactivateUserUseCase');
        return new ReactivateUserUseCase(this.userRepository);
    }

    async getReviewVerificationUseCase() {
        const { ReviewVerificationUseCase } = await import('@/application/governance/use-cases/ReviewVerificationUseCase');
        return new ReviewVerificationUseCase(this.verificationRepository, this.userRepository);
    }

    // Phase 5: Automation
    async getAutomationRunner() {
        const { AutomationRunner } = await import('@/infrastructure/AutomationRunner');
        const { AutoCloseTourUseCase } = await import('@/application/automation/use-cases/AutoCloseTourUseCase');
        const { DetectNoShowUseCase } = await import('@/application/automation/use-cases/DetectNoShowUseCase');

        // Instantiate UseCases directly to avoid circular dependency mess or just simple instantiation
        const autoClose = new AutoCloseTourUseCase(this.tourRepository);
        const noShow = new DetectNoShowUseCase(this.tourRepository);

        return new AutomationRunner(autoClose, noShow);
    }
}

export const container = new Container();
// Note: I will use a method or getter. Pattern was getter.
// Let's switch to async import inside getter if not already imported?
// Previous code used imports at top.
// Let's stick to simple props with top-level imports for now to match style, OR update imports.

