'use client';

import { useState, useCallback, useEffect } from 'react';

interface Guest {
    id: string;
    guestName: string;
    bookingRef: string | null;
    email: string | null;
    phone: string | null;
    checkInToken: string;
    status: string;
    checkedInAt: string | null;
    checkedInBy: string | null;
    notes: string | null;
}

interface Headcount {
    total: number;
    checkedIn: number;
    pending: number;
    noShow: number;
    earlyLeave: number;
    allAccountedFor: boolean;
}

interface GuestListPanelProps {
    tourId: string;
    tourStatus: string;
    isOperator?: boolean;
    isGuide?: boolean;
}

export function GuestListPanel({ tourId, tourStatus, isOperator = false, isGuide = false }: GuestListPanelProps) {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [headcount, setHeadcount] = useState<Headcount | null>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Add form state
    const [name, setName] = useState('');
    const [bookingRef, setBookingRef] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const fetchGuests = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/guests`);
            const json = await res.json();
            if (json.success) {
                setGuests(json.guests);
                setHeadcount(json.headcount);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [tourId]);

    useEffect(() => { fetchGuests(); }, [fetchGuests]);

    const addGuest = async () => {
        if (!name.trim()) return;
        setActing('add');
        setError('');
        try {
            const res = await fetch(`/api/tours/${tourId}/guests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestName: name.trim(),
                    bookingRef: bookingRef.trim() || undefined,
                    email: email.trim() || undefined,
                    phone: phone.trim() || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed');
            setName(''); setBookingRef(''); setEmail(''); setPhone('');
            setShowAddForm(false);
            await fetchGuests();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const removeGuest = async (guestId: string) => {
        setActing(`del-${guestId}`);
        try {
            const res = await fetch(`/api/tours/${tourId}/guests/${guestId}`, { method: 'DELETE' });
            if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
            await fetchGuests();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const checkInGuest = async (guestId: string) => {
        setActing(`ci-${guestId}`);
        try {
            const res = await fetch(`/api/tours/${tourId}/guests/${guestId}/checkin`, { method: 'POST' });
            if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
            await fetchGuests();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const markNoShow = async (guestId: string) => {
        setActing(`ns-${guestId}`);
        try {
            const res = await fetch(`/api/tours/${tourId}/guests/${guestId}/no-show`, { method: 'POST' });
            if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
            await fetchGuests();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const markEarlyLeave = async (guestId: string) => {
        const notes = window.prompt("Reason for early leave:");
        if (!notes) return; // cancelled or empty

        setActing(`el-${guestId}`);
        try {
            const res = await fetch(`/api/tours/${tourId}/guests/${guestId}/early-leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
            await fetchGuests();
        } catch (e: any) { setError(e.message); }
        finally { setActing(null); }
    };

    const copyLink = (token: string, guestId: string) => {
        const url = `${window.location.origin}/guest-checkin/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(guestId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const canAddGuests = isOperator && !['COMPLETED', 'CLOSED', 'CANCELLED', 'EXPIRED'].includes(tourStatus);
    const canRemoveGuests = isOperator && !['IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(tourStatus);
    const canCheckIn = isGuide && tourStatus === 'IN_PROGRESS';

    const statusBadge = (status: string) => {
        switch (status) {
            case 'CHECKED_IN': return 'bg-emerald-100 text-emerald-700';
            case 'NO_SHOW': return 'bg-red-100 text-red-700';
            case 'EARLY_LEAVE': return 'bg-orange-100 text-orange-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case 'CHECKED_IN': return '✅ Checked In';
            case 'NO_SHOW': return '❌ No Show';
            case 'EARLY_LEAVE': return '🚶 Early Leave';
            default: return '⏳ Pending';
        }
    };

    if (loading) {
        return <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse"><div className="h-20 bg-gray-100 rounded-xl" /></div>;
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>👥</span> Guest List
                    </h3>
                    {headcount && headcount.total > 0 && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            ✅ {headcount.checkedIn}/{headcount.total} Checked In
                            {headcount.pending > 0 && <span className="text-amber-600"> · ⏳ {headcount.pending} Pending</span>}
                            {headcount.noShow > 0 && <span className="text-red-600"> · ❌ {headcount.noShow} No-Show</span>}
                            {headcount.earlyLeave > 0 && <span className="text-orange-600"> · 🚶 {headcount.earlyLeave} Early Leave</span>}
                        </p>
                    )}
                </div>
                {canAddGuests && (
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="text-xs text-blue-600 font-semibold hover:text-blue-700"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Guest'}
                    </button>
                )}
            </div>

            {/* Headcount Progress Bar */}
            {headcount && headcount.total > 0 && (
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(headcount.checkedIn / headcount.total) * 100}%` }}
                    />
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-xs text-red-700 flex items-center justify-between">
                    {error}
                    <button onClick={() => setError('')} className="text-red-400 ml-2">✕</button>
                </div>
            )}

            {/* Add Guest Form */}
            {showAddForm && canAddGuests && (
                <div className="border-2 border-blue-200 rounded-xl p-3 space-y-2 bg-blue-50/50">
                    <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Guest name *"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text" value={bookingRef} onChange={e => setBookingRef(e.target.value)}
                            placeholder="Booking Ref"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-300 outline-none bg-white"
                        />
                        <input
                            type="text" value={phone} onChange={e => setPhone(e.target.value)}
                            placeholder="Phone"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-300 outline-none bg-white"
                        />
                    </div>
                    <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-300 outline-none bg-white"
                    />
                    <button
                        onClick={addGuest}
                        disabled={!name.trim() || acting === 'add'}
                        className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 active:scale-95 transition"
                    >
                        {acting === 'add' ? '⏳ Adding...' : '➕ Add Guest'}
                    </button>
                </div>
            )}

            {/* Guest List */}
            {guests.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                    <div className="text-2xl mb-1">👥</div>
                    <p className="text-xs text-gray-400">No guests added yet</p>
                    {isOperator && <p className="text-[10px] text-gray-400 mt-1">Add guests to generate check-in links</p>}
                </div>
            ) : (
                <div className="space-y-2">
                    {guests.map(guest => (
                        <div key={guest.id} className="border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-gray-900 truncate">{guest.guestName}</span>
                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${statusBadge(guest.status)}`}>
                                            {statusLabel(guest.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        {guest.bookingRef && <span className="text-[10px] text-gray-400">Ref: {guest.bookingRef}</span>}
                                        {guest.phone && <span className="text-[10px] text-gray-400">📱 {guest.phone}</span>}
                                        {guest.checkedInAt && (
                                            <span className="text-[10px] text-emerald-500">
                                                @ {new Date(guest.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {guest.checkedInBy === 'SELF' && ' (self)'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {/* Copy check-in link */}
                                    {isOperator && (
                                        <button
                                            onClick={() => copyLink(guest.checkInToken, guest.id)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                                            title="Copy check-in link"
                                        >
                                            {copiedId === guest.id ? <span className="text-[10px] text-emerald-600">✓</span> : <span className="text-xs">🔗</span>}
                                        </button>
                                    )}
                                    {/* Guide check-in */}
                                    {canCheckIn && guest.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => checkInGuest(guest.id)}
                                                disabled={acting === `ci-${guest.id}`}
                                                className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg hover:bg-emerald-200 disabled:opacity-50 transition"
                                            >
                                                {acting === `ci-${guest.id}` ? '⏳' : '✅ In'}
                                            </button>
                                            <button
                                                onClick={() => markNoShow(guest.id)}
                                                disabled={acting === `ns-${guest.id}`}
                                                className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
                                            >
                                                {acting === `ns-${guest.id}` ? '⏳' : '❌'}
                                            </button>
                                        </>
                                    )}
                                    {/* Early leave */}
                                    {canCheckIn && guest.status === 'CHECKED_IN' && (
                                        <button
                                            onClick={() => markEarlyLeave(guest.id)}
                                            disabled={acting === `el-${guest.id}`}
                                            className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-lg hover:bg-orange-200 disabled:opacity-50 transition"
                                            title="Mark as Early Leave"
                                        >
                                            {acting === `el-${guest.id}` ? '⏳' : '🚶 Leave'}
                                        </button>
                                    )}
                                    {/* Remove guest */}
                                    {canRemoveGuests && (
                                        <button
                                            onClick={() => removeGuest(guest.id)}
                                            disabled={acting === `del-${guest.id}`}
                                            className="p-1.5 text-gray-300 hover:text-red-500 transition"
                                            title="Remove guest"
                                        >
                                            {acting === `del-${guest.id}` ? '⏳' : '🗑'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Refresh button */}
            <button
                onClick={fetchGuests}
                className="w-full py-2 bg-gray-50 text-gray-400 text-xs rounded-xl hover:bg-gray-100 transition"
            >
                🔄 Refresh Guest List
            </button>
        </div>
    );
}
