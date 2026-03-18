'use client';

/**
 * VerificationStatusDisplay — Role-based verification status display.
 *
 * TOUR_GUIDE → shows KYC only (hide KYB)
 * TOUR_OPERATOR → shows KYB only (hide KYC)
 * Admin → shows both
 */

interface VerificationDisplayProps {
    role: string;
    kycStatus?: string | null; // Guide verification (identity)
    kybStatus?: string | null; // Operator verification (business)
    isAdmin?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    PENDING: { label: 'Pending Review', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: '⏳' },
    APPROVED: { label: 'Verified', bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: '✓' },
    REJECTED: { label: 'Rejected', bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '✕' },
    NOT_SUBMITTED: { label: 'Not Submitted', bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', icon: '—' },
};

function StatusCard({ type, status }: { type: 'KYC' | 'KYB'; status: string }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_SUBMITTED;
    const label = type === 'KYC' ? 'Identity Verification (KYC)' : 'Business Verification (KYB)';

    return (
        <div className={`rounded-xl border p-4 ${config.bg}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${config.text}`}>
                    {config.icon}
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
                    <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
                </div>
            </div>
        </div>
    );
}

export default function VerificationStatusDisplay({ role, kycStatus, kybStatus, isAdmin }: VerificationDisplayProps) {
    // Admin sees both
    if (isAdmin) {
        return (
            <div className="space-y-3">
                <StatusCard type="KYC" status={kycStatus || 'NOT_SUBMITTED'} />
                <StatusCard type="KYB" status={kybStatus || 'NOT_SUBMITTED'} />
            </div>
        );
    }

    // Guide → KYC only
    if (role === 'TOUR_GUIDE') {
        return <StatusCard type="KYC" status={kycStatus || 'NOT_SUBMITTED'} />;
    }

    // Operator → KYB only
    if (role === 'TOUR_OPERATOR') {
        return <StatusCard type="KYB" status={kybStatus || 'NOT_SUBMITTED'} />;
    }

    // Fallback
    return <StatusCard type="KYC" status={kycStatus || 'NOT_SUBMITTED'} />;
}
