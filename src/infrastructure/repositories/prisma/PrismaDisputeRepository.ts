
import { IDisputeRepository } from '@/domain/payment/IDisputeRepository';
import { PaymentDispute } from '@/domain/payment/PaymentDispute';
import { DisputeStatus } from '@/domain/payment/DisputeStatus';
import { prisma } from '@/lib/prisma';

export class PrismaDisputeRepository implements IDisputeRepository {

    private toDomain(raw: any): PaymentDispute {
        return new PaymentDispute({
            id: raw.id,
            paymentRequestId: raw.tourPaymentRequestId,
            guideId: raw.guideId,
            reason: raw.reason,
            description: raw.description,
            status: raw.status as DisputeStatus,
            resolution: raw.resolution,
            internalNotes: raw.internalNotes,
            resolvedBy: raw.resolvedBy,
            createdAt: raw.createdAt,
            resolvedAt: raw.resolvedAt
        });
    }

    async findById(id: string): Promise<PaymentDispute | null> {
        const raw = await prisma.paymentDispute.findUnique({ where: { id } });
        if (!raw) return null;
        return this.toDomain(raw);
    }

    async findOpenByPaymentId(paymentRequestId: string): Promise<PaymentDispute | null> {
        const raw = await prisma.paymentDispute.findFirst({
            where: {
                tourPaymentRequestId: paymentRequestId,
                status: { in: ['OPEN', 'INVESTIGATING'] }
            }
        });
        if (!raw) return null;
        return this.toDomain(raw);
    }

    async save(dispute: PaymentDispute): Promise<void> {
        await prisma.paymentDispute.upsert({
            where: { id: dispute.id },
            update: {
                status: dispute.status,
                resolution: (dispute as any).props.resolution,
                internalNotes: (dispute as any).props.internalNotes,
                resolvedBy: (dispute as any).props.resolvedBy,
                resolvedAt: (dispute as any).props.resolvedAt
            },
            create: {
                id: dispute.id,
                tourPaymentRequestId: dispute.paymentRequestId,
                guideId: dispute.guideId,
                reason: (dispute as any).props.reason,
                description: (dispute as any).props.description,
                status: dispute.status,
                createdAt: (dispute as any).props.createdAt
            }
        });
    }
}
