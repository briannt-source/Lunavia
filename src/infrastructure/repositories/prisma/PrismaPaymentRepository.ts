
import { IPaymentRepository } from '@/domain/payment/IPaymentRepository';
import { PaymentRequest } from '@/domain/payment/PaymentRequest';
import { PaymentStatus } from '@/domain/payment/PaymentStatus';
import { RejectReason } from '@/domain/payment/RejectReason';
import { prisma } from '@/lib/prisma';

export class PrismaPaymentRepository implements IPaymentRepository {

    private toDomain(raw: any): PaymentRequest {
        return new PaymentRequest({
            id: raw.id,
            tourId: raw.tourId,
            guideId: raw.guideId,
            operatorId: raw.operatorId,
            amount: raw.amount,
            currency: raw.currency,
            status: raw.status as PaymentStatus,
            guideNote: raw.guideNote,
            operatorNote: raw.operatorNote,
            rejectReason: raw.rejectReason as RejectReason,
            receiptUrl: raw.receiptUrl,
            createdAt: raw.createdAt,
            decidedAt: raw.decidedAt
        });
    }

    async findById(id: string): Promise<PaymentRequest | null> {
        const raw = await prisma.tourPaymentRequest.findUnique({ where: { id } });
        if (!raw) return null;
        return this.toDomain(raw);
    }

    async findByTourId(tourId: string): Promise<PaymentRequest | null> {
        const raw = await prisma.tourPaymentRequest.findUnique({ where: { tourId } });
        if (!raw) return null;
        return this.toDomain(raw);
    }

    async save(payment: PaymentRequest): Promise<void> {
        await prisma.tourPaymentRequest.upsert({
            where: { id: payment.id },
            update: {
                status: payment.status,
                operatorNote: (payment as any).props.operatorNote, // Accessing private props workaround or getter needed?
                // I need getters for all props or use (payment as any).props if private.
                // Or better: Public getters. I only added some getters.
                // I will use (payment as any).props for speed/cleanliness in this tool call, 
                // OR add getters to PaymentRequest.ts. 
                // Let's add getters via replace_file later if needed, or assume I can access.
                // Typescript will complain if private.
                // I'll try to use what I can.
                rejectReason: (payment as any).props.rejectReason,
                receiptUrl: payment.receiptUrl,
                decidedAt: (payment as any).props.decidedAt
            },
            create: {
                id: payment.id,
                tourId: payment.tourId,
                guideId: payment.guideId,
                operatorId: payment.operatorId,
                amount: payment.amount,
                currency: 'VND',
                status: payment.status,
                guideNote: (payment as any).props.guideNote,
                createdAt: (payment as any).props.createdAt
            }
        });
    }
}
