'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface ContractInfo {
    guideMode: string | null;
    affiliatedOperatorId: string | null;
    contractDocumentUrl: string | null;
    contractType: string | null;
    contractStatus: string | null;
    contractReviewedAt: string | null;
}

export default function GuideContractPage() {
    const t = useTranslations('Guide.Contract');
    const router = useRouter();
    const [contract, setContract] = useState<ContractInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [contractType, setContractType] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetch('/api/guide/contract')
            .then(r => r.json())
            .then(d => setContract(d.contract || null))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contractType || !documentUrl.trim()) return;
        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/guide/contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractType,
                    documentUrl: documentUrl.trim(),
                    operatorId: contract?.affiliatedOperatorId,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMessage({ type: 'success', text: data.message || t('alerts.submitSuccess') });
                setTimeout(() => router.push('/dashboard/guide/profile'), 2000);
            } else {
                setMessage({ type: 'error', text: data.error || t('alerts.submitFail') });
            }
        } catch {
            setMessage({ type: 'error', text: t('alerts.networkError') });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
                    <div className="h-40 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!contract?.affiliatedOperatorId) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6 text-center">
                <div className="text-4xl mb-4">🚫</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">{t('status.noOperatorTitle')}</h1>
                <p className="text-sm text-gray-500 mb-6">{t('status.noOperatorDesc')}</p>
                <a href="/dashboard/guide/profile" className="text-sm font-semibold text-[#5BA4CF] hover:text-[#2E8BC0]">{t('backToProfile')}</a>
            </div>
        );
    }

    if (contract.contractDocumentUrl && contract.contractStatus === 'PENDING') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6 text-center">
                <div className="text-4xl mb-4">⏳</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">{t('status.reviewTitle')}</h1>
                <p className="text-sm text-gray-500 mb-2">{t('status.reviewDesc')}</p>
                <p className="text-xs text-gray-400">{t('type')} {contract.contractType}</p>
                <a href="/dashboard/guide/profile" className="inline-block mt-6 text-sm font-semibold text-[#5BA4CF] hover:text-[#2E8BC0]">{t('backToProfile')}</a>
            </div>
        );
    }

    if (contract.contractStatus === 'APPROVED') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">{t('status.approvedTitle')}</h1>
                <p className="text-sm text-gray-500 mb-2">{t('status.approvedDesc')}</p>
                <a href="/dashboard/guide/profile" className="inline-block mt-6 text-sm font-semibold text-[#5BA4CF] hover:text-[#2E8BC0]">{t('backToProfile')}</a>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-6">
            <button onClick={() => router.push('/dashboard/guide/profile')} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
                {t('backToProfile')}
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('form.title')}</h1>
            <p className="text-sm text-gray-500 mb-8">{t('form.subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.typeLabel')}</label>
                    <select
                        value={contractType}
                        onChange={e => setContractType(e.target.value)}
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-lunavia-primary/20 transition outline-none text-sm"
                    >
                        <option value="">{t('form.typePlaceholder')}</option>
                        <option value="EMPLOYMENT">{t('types.employment')}</option>
                        <option value="COLLABORATION">{t('types.collaboration')}</option>
                        <option value="INTERNSHIP">{t('types.internship')}</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.urlLabel')}</label>
                    <input
                        type="url"
                        value={documentUrl}
                        onChange={e => setDocumentUrl(e.target.value)}
                        placeholder={t('form.urlPlaceholder')}
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-lunavia-primary/20 transition outline-none text-sm"
                    />
                    <p className="mt-1.5 text-xs text-gray-400">{t('form.urlHint')}</p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    <strong>{t('form.important')}</strong> {t('form.importantDesc')}
                </div>

                {message && (
                    <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting || !contractType || !documentUrl.trim()}
                    className="w-full px-6 py-3 bg-lunavia-primary hover:bg-lunavia-primary-hover text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                    {submitting ? t('form.submittingBtn') : t('form.submitBtn')}
                </button>
            </form>
        </div>
    );
}
