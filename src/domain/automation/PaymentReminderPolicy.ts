export class PaymentReminderPolicy {
    static shouldRemind(paymentCreatedAt: Date, status: string): boolean {
        if (status !== 'PENDING') return false;

        const reminderThreshold = new Date(paymentCreatedAt.getTime() + 48 * 60 * 60 * 1000); // 48h
        // Simple logic: if > 48h and still pending
        return Date.now() > reminderThreshold.getTime();
    }
}
