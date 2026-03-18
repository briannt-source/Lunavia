"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface InHouseGuide {
    id: string;
    email: string;
    trust: string;
    kycStatus: string;
    metadata: any;
}

export default function OperatorTeamPage() {
    const { data: session } = useSession();
    const t = useTranslations('Operator.Team');
    const [guides, setGuides] = useState<InHouseGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState<InHouseGuide | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(false);

    const [invites, setInvites] = useState<any[]>([]);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteGuideId, setInviteGuideId] = useState('');
    const [inviteMode, setInviteMode] = useState<'email' | 'guideId'>('email');
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        fetchGuides();
    }, []);

    async function fetchGuides() {
        try {
            const res = await fetch('/api/operator/guides');
            if (res.ok) {
                const data = await res.json();
                setGuides(data.guides || []);
                setInvites(data.pendingInvites || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleInvite() {
        if (inviteMode === 'email') {
            if (!inviteEmail || !inviteEmail.includes('@')) {
                toast.error(t('alerts.invalidEmail'));
                return;
            }
        } else {
            if (!inviteGuideId.trim()) {
                toast.error(t('alerts.invalidGuideId'));
                return;
            }
        }

        setInviting(true);
        try {
            const payload = inviteMode === 'email'
                ? { email: inviteEmail }
                : { guideId: inviteGuideId.trim() };

            const res = await fetch('/api/operator/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t('alerts.inviteFailed'));
            }

            toast.success(t('alerts.inviteSuccess'));
            setInviteEmail('');
            setInviteGuideId('');
            setInviteModalOpen(false);
            fetchGuides(); // Refresh list
        } catch (error: any) {
            // Handle 429 specifically if needed, but error message usually covers it
            toast.error(error.message);
        } finally {
            setInviting(false);
        }
    }

    async function fetchCalendar(guideId: string) {
        setCalendarLoading(true);
        try {
            // Fetch next 30 days
            const start = new Date();
            const end = new Date();
            end.setDate(end.getDate() + 30);
            const params = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString()
            });
            const res = await fetch(`/api/guides/${guideId}/calendar?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setCalendarEvents(data.events || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCalendarLoading(false);
        }
    }

    if (loading) return <div className="p-8">{t('loading')}</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                    {session?.user?.id && (
                        <div className="mt-4 flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm text-indigo-900">
                            <span><strong>{t('inviteDirect')}</strong> {t('inviteDirectDesc')}</span>
                            <code className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-indigo-700 font-bold select-all">{session.user.id}</code>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 h-10"
                >
                    {t('sendInviteBtn')}
                </button>
            </div>

            {/* In-House Guides List */}
            <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('activeTeam.title')}</h2>
                {guides.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
                        {t('activeTeam.empty')}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {guides.map(guide => (
                            <div
                                key={guide.id}
                                onClick={() => { setSelectedGuide(guide); fetchCalendar(guide.id); }}
                                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {guide.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{guide.email}</div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${guide.trust === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {guide.trust || t('activeTeam.unverified')}
                                            </span>
                                            {guide.kycStatus === 'APPROVED' ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                    ✓ KYC
                                                </span>
                                            ) : (
                                                <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded">
                                                    {t('activeTeam.pendingKyc')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Pending Invites */}
            {invites.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('invites.title')}</h2>
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">{t('invites.colEmail')}</th>
                                    <th className="px-4 py-3">{t('invites.colSent')}</th>
                                    <th className="px-4 py-3">{t('invites.colExpires')}</th>
                                    <th className="px-4 py-3">{t('invites.colStatus')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invites.map((invite) => (
                                    <tr key={invite.id}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{invite.referredEmail}</td>
                                        <td className="px-4 py-3 text-gray-500">{new Date(invite.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-gray-500">{new Date(invite.expiresAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            {!invite.isExpired ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {t('invites.statusPending')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                    {t('invites.statusExpired')}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Invite Modal */}
            {inviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('modal.title')}</h2>

                        {/* Mode Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setInviteMode('email')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${inviteMode === 'email' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}
                            >
                                {t('modal.tabEmail')}
                            </button>
                            <button
                                onClick={() => setInviteMode('guideId')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${inviteMode === 'guideId' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}
                            >
                                {t('modal.tabGuideId')}
                            </button>
                        </div>

                        {inviteMode === 'email' ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.emailLabel')}</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder={t('modal.emailPlaceholder')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">{t('modal.emailHint')}</p>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.idLabel')}</label>
                                <input
                                    type="text"
                                    value={inviteGuideId}
                                    onChange={(e) => setInviteGuideId(e.target.value)}
                                    placeholder={t('modal.idPlaceholder')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">{t('modal.idHint')}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setInviteModalOpen(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {t('modal.cancelBtn')}
                            </button>
                            <button
                                onClick={handleInvite}
                                disabled={inviting || (inviteMode === 'email' ? !inviteEmail : !inviteGuideId)}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {inviting ? t('modal.sendingBtn') : t('modal.sendBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Guide Schedule Modal */}
            {selectedGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedGuide(null)}>
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-bold text-gray-900">{t('schedule.title', { email: selectedGuide.email })}</h2>
                            <button onClick={() => setSelectedGuide(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {calendarLoading ? (
                                <div className="text-center py-8 text-gray-500">{t('schedule.loading')}</div>
                            ) : calendarEvents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">{t('schedule.empty')}</div>
                            ) : (
                                calendarEvents.map(e => (
                                    <div key={e.id} className={`p-3 rounded-lg border ${e.type === 'BLOCK' ? 'bg-gray-50 border-gray-200' : 'bg-purple-50 border-purple-200'
                                        }`}>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-sm">
                                                {e.type === 'BLOCK' ? t('schedule.blocked') : `🚩 ${e.title}`}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(e.start).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {new Date(e.start).toLocaleTimeString()} - {new Date(e.end).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

