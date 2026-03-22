'use client';

import { formatCurrency, formatPercent, type PaymentBreakdown } from '@/lib/payment-transparency';

interface Props {
  breakdown: PaymentBreakdown;
  className?: string;
  /** 'operator' shows what operator pays. 'guide' shows what guide receives. */
  perspective: 'operator' | 'guide';
}

/**
 * Payment breakdown card — shows transparent money flow for a tour.
 * Used in tour details, assignment confirmation, and payment summaries.
 */
export default function PaymentBreakdownCard({ breakdown, className = '', perspective }: Props) {
  const fmt = (v: number) => formatCurrency(v, breakdown.currency);

  if (perspective === 'operator') {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`}>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          💰 Payment Summary
        </h4>

        <div className="space-y-3">
          {/* Tour payout */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Guide payout</span>
            <span className="font-medium text-gray-900">{fmt(breakdown.guideGross)}</span>
          </div>

          {/* Commission */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Platform fee ({formatPercent(breakdown.operatorCommissionRate)})
            </span>
            <span className="font-medium text-gray-900">
              {breakdown.operatorCommission > 0 ? `+${fmt(breakdown.operatorCommission)}` : fmt(0)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-900">Total you pay</span>
              <span className="text-[#5BA4CF]">{fmt(breakdown.operatorPays)}</span>
            </div>
          </div>

          {/* Guide receives */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-700">Guide will receive</span>
              <span className="font-semibold text-emerald-700">{fmt(breakdown.guideNet)}</span>
            </div>
          </div>

          {breakdown.operatorCommissionRate === 0 && (
            <p className="text-xs text-emerald-600 mt-1">
              ✓ In-house guide — 0% commission
            </p>
          )}
        </div>
      </div>
    );
  }

  // Guide perspective
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        💰 Your Earnings
      </h4>

      <div className="space-y-3">
        {/* Gross payout */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tour payout</span>
          <span className="font-medium text-gray-900">{fmt(breakdown.guideGross)}</span>
        </div>

        {/* Platform fee */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Platform fee ({formatPercent(breakdown.guidePlatformFeeRate)})
          </span>
          <span className="font-medium text-red-600">
            {breakdown.guidePlatformFee > 0 ? `-${fmt(breakdown.guidePlatformFee)}` : fmt(0)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-900">You receive</span>
            <span className="text-emerald-600">{fmt(breakdown.guideNet)}</span>
          </div>
        </div>

        {breakdown.guidePlatformFeeRate === 0 && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ In-house guide — 0% platform fee
          </p>
        )}
      </div>
    </div>
  );
}
