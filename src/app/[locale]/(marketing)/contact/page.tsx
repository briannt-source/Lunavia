'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type InquiryType = 'enterprise' | 'demo' | 'partnership' | 'other';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        type: 'enterprise' as InquiryType,
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const t = useTranslations('MarketingContact');

    const inquiryTypes: { val: InquiryType; label: string; desc: string }[] = [
        { val: 'enterprise', label: t('form.types.enterprise.label'), desc: t('form.types.enterprise.desc') },
        { val: 'demo', label: t('form.types.demo.label'), desc: t('form.types.demo.desc') },
        { val: 'partnership', label: t('form.types.partnership.label'), desc: t('form.types.partnership.desc') },
        { val: 'other', label: t('form.types.other.label'), desc: t('form.types.other.desc') },
    ];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                setSent(true);
            } else {
                setError(data.error || t('form.failed'));
            }
        } catch {
            setError(t('form.error'));
        } finally {
            setLoading(false);
        }
    }

    function updateField(field: string, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (sent) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6">
                <div className="text-center max-w-md space-y-6 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('success.title')}</h1>
                    <p className="text-slate-500">{t('success.desc')}</p>
                    <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-lunavia-primary text-white font-semibold hover:bg-lunavia-primary-hover transition shadow-lg shadow-[#2E8BC0]/20">
                        {t('success.back')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            {/* Header */}
            <section className="relative pt-28 pb-16 text-center px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-blue-50/50 to-slate-50" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-200/30 rounded-full blur-[120px]" />
                </div>

                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F4FD] border border-[#5BA4CF]/30 text-xs font-semibold text-[#2E8BC0] mb-6">
                    <span className="w-2 h-2 rounded-full bg-[#E8F4FD]0 animate-pulse" />
                    {t('hero.badge')}
                </span>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    {t('hero.title')}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    {t('hero.subtitle')}
                </p>
            </section>

            {/* Form + Info */}
            <section className="pb-24 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Form */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                            {/* Inquiry type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">{t('form.helpTitle')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {inquiryTypes.map((t) => (
                                        <button
                                            key={t.val}
                                            type="button"
                                            onClick={() => updateField('type', t.val)}
                                            className={`text-left p-3 rounded-xl border-2 transition-all ${formData.type === t.val
                                                ? 'border-blue-500 bg-lunavia-light'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                                            <div className="text-xs text-slate-500">{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.name')}</label>
                                    <input type="text" required value={formData.name} onChange={(e) => updateField('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.email')}</label>
                                    <input type="email" required value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.company')}</label>
                                    <input type="text" value={formData.company} onChange={(e) => updateField('company', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.phone')}</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.message')}</label>
                                <textarea
                                    required rows={4} value={formData.message} onChange={(e) => updateField('message', e.target.value)}
                                    placeholder={t('form.messagePlaceholder')}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                />
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-lunavia-primary text-white font-semibold hover:bg-lunavia-primary-hover disabled:opacity-50 transition shadow-lg shadow-[#2E8BC0]/20 flex items-center justify-center gap-2"
                            >
                                {loading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                                {loading ? t('form.sending') : t('form.sendBtn')}
                            </button>
                        </form>
                    </div>

                    {/* Info panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <h3 className="font-bold text-slate-900 mb-4">{t('info.responseTimeTitle')}</h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-lunavia-light flex items-center justify-center text-lunavia-primary">⚡</span>
                                    <span>{t('info.enterpriseResponse')}<strong>{t('info.enterpriseTime')}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">📧</span>
                                    <span>{t('info.generalResponse')}<strong>{t('info.generalTime')}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <h3 className="font-bold text-slate-900 mb-4">{t('info.getStartedTitle')}</h3>
                            <div className="space-y-4 text-sm text-slate-600">
                                <p>{t('info.getStartedDesc')}</p>
                                <Link href="/pricing" className="inline-flex items-center gap-2 text-lunavia-primary font-semibold hover:text-lunavia-primary-hover transition">
                                    {t('info.seePricing')}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-8 text-white">
                            <h3 className="font-bold mb-3">{t('info.partnerTitle')}</h3>
                            <p className="text-sm text-slate-300 mb-4">{t('info.partnerDesc')}</p>
                            <div className="text-xs text-slate-400">{t('info.partnerNote')}</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
