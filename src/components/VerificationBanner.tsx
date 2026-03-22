"use client";

interface VerificationBannerProps {
    role: 'TOUR_OPERATOR' | 'TOUR_GUIDE';
}

export default function VerificationBanner({ role }: VerificationBannerProps) {
    const verificationPath = role === 'TOUR_OPERATOR'
        ? '/dashboard/operator/verification'
        : '/dashboard/guide/verification';

    return (
        <div className="mb-6 rounded-xl border border-[#5BA4CF]/20 bg-gradient-to-r from-indigo-50/80 via-violet-50/50 to-purple-50/80 p-5">
            <div className="flex items-start gap-4">
                {/* Friendly shield icon */}
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#5BA4CF]/20">
                    <svg className="h-5 w-5 text-[#5BA4CF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                        Complete your profile verification
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        {role === 'TOUR_OPERATOR'
                            ? 'Verified operators build trust faster and unlock priority features on the platform.'
                            : 'Verified guides receive priority for assignments and stand out to operators.'}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Takes about 5 minutes
                    </p>
                </div>

                <a
                    href={verificationPath}
                    className="shrink-0 rounded-lg bg-lunavia-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm"
                >
                    Get Verified
                </a>
            </div>
        </div>
    );
}

