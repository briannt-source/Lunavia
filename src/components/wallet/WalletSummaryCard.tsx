'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WalletData {
    availableBalance: number;
    pendingBalance: number;
    currency: string;
    activeHolds: number;
}

interface WalletSummaryCardProps {
    /** If true, renders a compact inline version (for TourForm) */
    compact?: boolean;
}

export function WalletSummaryCard({ compact = false }: WalletSummaryCardProps) {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/operator/wallet')
            .then(res => res.json())
            .then(data => {
                if (data.wallet) {
                    setWallet(data.wallet);
                } else {
                    setError('Unable to load wallet');
                }
            })
            .catch(() => setError('Unable to load wallet'))
            .finally(() => setLoading(false));
    }, []);

    const fmt = (n: number) => n.toLocaleString('vi-VN');

    if (loading) {
        return (
            <div className={`rounded-xl border border-gray-200 bg-white ${compact ? 'p-4' : 'p-5'} animate-pulse`}>
                <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
                <div className="h-6 bg-gray-100 rounded w-40" />
            </div>
        );
    }

    if (error || !wallet) {
        return (
            <div className={`rounded-xl border border-gray-200 bg-white ${compact ? 'p-4' : 'p-5'}`}>
                <p className="text-sm text-gray-400">Wallet unavailable</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-xs font-medium text-gray-500 block">Available</span>
                            <span className="text-base font-bold text-gray-900">{fmt(wallet.availableBalance)} <span className="text-xs font-normal text-gray-400">{wallet.currency}</span></span>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div>
                            <span className="text-xs font-medium text-gray-500 block">In Escrow</span>
                            <span className="text-base font-semibold text-amber-600">{fmt(wallet.pendingBalance)} <span className="text-xs font-normal text-gray-400">{wallet.currency}</span></span>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/operator/wallet"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        Top up →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    💳 Wallet
                </h3>
                <Link
                    href="/dashboard/operator/wallet"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                    Manage →
                </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-xs font-medium text-gray-500 block mb-0.5">Available Balance</span>
                    <span className="text-xl font-bold text-gray-900">{fmt(wallet.availableBalance)}</span>
                    <span className="text-xs text-gray-400 ml-1">{wallet.currency}</span>
                </div>
                <div>
                    <span className="text-xs font-medium text-gray-500 block mb-0.5">Escrow Held</span>
                    <span className="text-xl font-bold text-amber-600">{fmt(wallet.pendingBalance)}</span>
                    <span className="text-xs text-gray-400 ml-1">{wallet.currency}</span>
                </div>
            </div>
            {wallet.activeHolds > 0 && (
                <p className="text-xs text-gray-400 mt-3">{wallet.activeHolds} active tour{wallet.activeHolds > 1 ? 's' : ''} with escrow held</p>
            )}
        </div>
    );
}
