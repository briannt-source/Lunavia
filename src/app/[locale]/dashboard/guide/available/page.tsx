"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import VerificationBanner from '@/components/VerificationBanner';
import Link from 'next/link';
import Skeleton, { TableSkeleton } from '@/components/ui/Skeleton';
import CategoryBadge from '@/components/CategoryBadge';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface ServiceRequest {
  id: string;
  title: string;
  location: string;
  province?: string;
  startTime: string;
  endTime: string;
  status: string;
  assignedGuideId: string | null;
  language?: string;
  rolesNeeded?: { role: string; quantity: number; rate: number }[];
  totalPayout?: number;
  currency?: string;
  category?: string | null;
  groupSize?: number | null;
  durationMinutes?: number | null;
  operatorName?: string;
  operatorTrust?: string;
  operatorAvatar?: string;
  hasApplied?: boolean;
  applicationStatus?: string;
}

interface SOSBroadcast {
  id: string;
  tourSnapshot: any;
  isEmergency: boolean;
  minutesUntilStart: number;
  minutesUntilExpiry: number;
  expiresAt: string;
  alreadyApplied: boolean;
  broadcastCount: number;
  acceptCount: number;
  acceptsRemaining: number;
  distanceKm: number | null;
}

export default function GuideAvailablePage() {
  const { data: session } = useSession();
  const t = useTranslations('Guide.Available');
  const [activeTab, setActiveTab] = useState<'REGULAR' | 'SOS'>('REGULAR');
  
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [sosBroadcasts, setSosBroadcasts] = useState<SOSBroadcast[]>([]);
  const [hiddenSosIds, setHiddenSosIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<any[]>([]);

  // Filters
  const [province, setProvince] = useState('');
  const [startDate, setStartDate] = useState('');
  const [category, setCategory] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [language, setLanguage] = useState('');
  const [sortBy, setSortBy] = useState<'suggested' | 'date_posted' | 'high_payout' | 'urgent' | 'trust'>('suggested');

  // Guide's own profile for region-based suggestions
  const [guideCity, setGuideCity] = useState('');
  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => {
      if (d?.profile?.city) setGuideCity(d.profile.city);
    }).catch(() => {});
  }, []);

  const trustState = (session?.user as any)?.trustState;
  const isUnverified = !trustState || trustState === 'UNVERIFIED' || trustState === 'PENDING';

  useEffect(() => {
    fetch('/api/provinces')
      .then(res => res.json())
      .then(data => setProvinces(data.provinces || []))
      .catch(console.error);
      
    // Load hidden SOS from local storage
    try {
      const hidden = JSON.parse(localStorage.getItem('lunavia_hidden_sos') || '[]');
      setHiddenSosIds(hidden);
    } catch {}
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'REGULAR') {
        const params = newSearchParams({ available: 'true' });
        if (province) params.append('province', province);
        if (startDate) params.append('startDate', startDate);
        if (category) params.append('category', category);
        if (groupSize) params.append('groupSize', groupSize);
        if (language) params.append('language', language);

        const res = await fetch(`/api/requests?${params.toString()}`);
        const response = await res.json();
        if (!response.success) throw new Error(response.error);
        setRequests(response.data?.requests || []);
      } else {
        // Fetch SOS
        const res = await fetch(`/api/guide/sos-broadcasts`);
        const response = await res.json();
        if (!response.success) throw new Error(response.error);
        setSosBroadcasts(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, [province, startDate, category, groupSize, language, activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Helper for search params
  function newSearchParams(obj: Record<string, string>) {
     const p = new URLSearchParams();
     for (const [k, v] of Object.entries(obj)) p.append(k, v);
     return p;
  }

  function hideSos(id: string) {
    const newHidden = [...hiddenSosIds, id];
    setHiddenSosIds(newHidden);
    localStorage.setItem('lunavia_hidden_sos', JSON.stringify(newHidden));
  }

  function formatDuration(minutes: number | null | undefined): string {
    if (!minutes) return '—';
    if (minutes < 60) return t('regular.formatMin', { mins: minutes });
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? t('regular.formatHm', { hours, mins }) : t('regular.formatHours', { hours });
  }

  function formatGroupSize(size: number | null | undefined): string {
    if (!size) return '—';
    return size === 1 ? t('regular.formatPerson') : t('regular.formatPersons', { count: size });
  }

  // Sort requests based on selected sort option
  const sortedRequests = [...requests].sort((a, b) => {
    switch (sortBy) {
      case 'suggested': {
        // Region match first, then trust score, then payout
        const regionA = guideCity && (a.province === guideCity || a.location === guideCity) ? 1 : 0;
        const regionB = guideCity && (b.province === guideCity || b.location === guideCity) ? 1 : 0;
        if (regionA !== regionB) return regionB - regionA;
        const trustA = Number(a.operatorTrust) || 0;
        const trustB = Number(b.operatorTrust) || 0;
        if (trustA !== trustB) return trustB - trustA;
        const pA = a.totalPayout || 0;
        const pB = b.totalPayout || 0;
        return pB - pA;
      }
      case 'trust': {
        const tA = Number(a.operatorTrust) || 0;
        const tB = Number(b.operatorTrust) || 0;
        return tB - tA;
      }
      case 'high_payout': {
        const payoutA = a.rolesNeeded?.reduce((sum, r) => sum + (r.quantity * r.rate), 0) || a.totalPayout || 0;
        const payoutB = b.rolesNeeded?.reduce((sum, r) => sum + (r.quantity * r.rate), 0) || b.totalPayout || 0;
        return payoutB - payoutA;
      }
      case 'urgent':
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      case 'date_posted':
      default:
        return 0;
    }
  });

  const visibleSos = sosBroadcasts.filter(s => !hiddenSosIds.includes(s.id));

  async function handleApply(id: string) {
    setApplying(id);
    const res = await fetch(`/api/requests/${id}/apply`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      toast.success(t('alerts.applySuccess'));
      fetchRequests();
    } else {
      if (data.requiresLocationAcknowledgement) {
         if (confirm(`${data.error}\n\n${t('regular.locationAck')}`)) {
             const confirmRes = await fetch(`/api/requests/${id}/apply`, { 
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ locationAcknowledgement: true })
             });
             const confirmData = await confirmRes.json();
             if (confirmRes.ok) {
                 toast.success(t('alerts.applySuccess'));
                 fetchRequests();
             } else {
                 toast.error(confirmData.error || t('alerts.applyFailed'));
             }
         }
      } else {
         toast.error(data.error || t('alerts.applyFailed'));
      }
    }
    setApplying(null);
  }

  async function acceptSOS(id: string) {
    setApplying(id);
    const res = await fetch(`/api/guide/sos-broadcasts/${id}/accept`, { method: 'POST' });
    if (res.ok) {
      toast.success(t('alerts.acceptSuccess'));
      fetchRequests(); // Refresh to show alreadyApplied
    } else {
      const data = await res.json();
      toast.error(data.error || t('alerts.acceptSosFailed'));
    }
    setApplying(null);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {isUnverified && <VerificationBanner role="TOUR_GUIDE" />}

      {/* TABS */}
      <div className="flex gap-4 mb-6 mt-4">
        <button
          onClick={() => setActiveTab('REGULAR')}
          className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'REGULAR' 
            ? 'bg-gray-900 text-white shadow-md' 
            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {t('tabs.standard')}
        </button>
        <button
          onClick={() => setActiveTab('SOS')}
          className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 relative ${
            activeTab === 'SOS' 
            ? 'bg-red-600 text-white shadow-md' 
            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          }`}
        >
           {t('tabs.urgentSos')} 
           {sosBroadcasts.length > 0 && <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white animate-pulse border-2 border-white">{sosBroadcasts.length}</span>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Only show for REGULAR */}
        {activeTab === 'REGULAR' && (
          <aside className="w-full lg:w-72 shrink-0 space-y-8 animate-fade-in">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {t('filters.title')}
                </h2>
                <button
                  onClick={() => { setProvince(''); setStartDate(''); setCategory(''); setGroupSize(''); setLanguage(''); }}
                  className="text-xs font-medium text-gray-400 hover:text-indigo-600 transition"
                >
                  {t('filters.clear')}
                </button>
              </div>

              <div className="space-y-5">
                {/* Location */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('filters.location')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">📍</span>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    >
                      <option value="">{t('filters.whereTo')}</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('filters.dateRange')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">📅</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('filters.category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">{t('filters.allCategories')}</option>
                    <option value="CITY_TOUR">{t('filters.catCity')}</option>
                    <option value="ADVENTURE">{t('filters.catAdventure')}</option>
                    <option value="CULTURAL">{t('filters.catCultural')}</option>
                    <option value="FOOD_TOUR">{t('filters.catFood')}</option>
                    <option value="NATURE">{t('filters.catNature')}</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">🗣️ Ngôn ngữ</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">Tất cả ngôn ngữ</option>
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">English</option>
                    <option value="Chinese">中文</option>
                    <option value="Japanese">日本語</option>
                    <option value="Korean">한국어</option>
                    <option value="French">Français</option>
                    <option value="Spanish">Español</option>
                    <option value="German">Deutsch</option>
                  </select>
                </div>

                {/* Group Size */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('filters.groupSize')}</label>
                  <select
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">{t('filters.anySize')}</option>
                    <option value="4">{t('filters.size4')}</option>
                    <option value="12">{t('filters.size12')}</option>
                    <option value="50">{t('filters.size50')}</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'REGULAR' ? t('main.titleRegular') : t('main.titleSos')}
              </h1>
              <p className="text-sm font-medium mt-1 text-gray-500">
                {activeTab === 'REGULAR' 
                  ? t('main.subtitleRegular', { count: requests.length })
                  : t('main.subtitleSos')
                }
              </p>
            </div>
            
            {activeTab === 'REGULAR' && (
              <div className="flex items-center gap-3 self-end animate-fade-in">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('main.sortBy')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 p-0 pr-8 cursor-pointer"
                >
                  <option value="suggested">✨ Gợi ý cho bạn</option>
                  <option value="trust">🛡️ Uy tín cao nhất</option>
                  <option value="date_posted">{t('main.sortPosted')}</option>
                  <option value="high_payout">{t('main.sortRate')}</option>
                  <option value="urgent">{t('main.sortUrgent')}</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 animate-fade-in"><TableSkeleton /></div>
          ) : activeTab === 'SOS' ? (
            // ── SOS TAB RENDERING ────────────────────────────────────
            visibleSos.length === 0 ? (
               <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                 <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-300 mb-4 text-2xl">
                   ✅
                 </div>
                 <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('sos.allCaughtUp')}</h2>
                 <p className="text-sm text-gray-500 max-w-xs">{t('sos.noUrgent')}</p>
               </div>
            ) : (
               <div className="grid md:grid-cols-2 gap-6">
                 {visibleSos.map(sos => {
                    const snp = sos.tourSnapshot;
                    return (
                      <div key={sos.id} className="bg-red-50 rounded-2xl overflow-hidden border border-red-200 shadow-md transition-all hover:-translate-y-1">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                               <span className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded inline-block mb-2 shadow-sm animate-pulse">
                                 {t('sos.urgentBadge', { minutes: sos.minutesUntilStart })}
                               </span>
                               <h3 className="font-bold text-red-900 text-lg leading-tight">{snp.title}</h3>
                             </div>
                             <button onClick={() => hideSos(sos.id)} className="text-red-300 hover:text-red-700 p-1 bg-white rounded-full">✕</button>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 mb-4 border border-red-100 space-y-3">
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{t('sos.payment')}</span>
                                <span className="font-bold text-red-700">{(snp.totalPayout || 0).toLocaleString()} {snp.currency || 'VND'}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{t('sos.location')}</span>
                                <span className="font-semibold text-gray-800">{snp.province || snp.location}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{t('sos.operator')}</span>
                                <span className="font-semibold text-gray-800">{snp.operator?.name || 'Unknown'}</span>
                             </div>
                          </div>
                          
                          {sos.alreadyApplied ? (
                             <button disabled className="w-full block text-center bg-gray-200 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed">
                               {t('sos.applicationSent')}
                             </button>
                          ) : (
                             <button
                               onClick={() => acceptSOS(sos.id)}
                               disabled={applying === sos.id || sos.acceptsRemaining <= 0}
                               className="w-full block text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50"
                             >
                               {applying === sos.id ? t('sos.accepting') : t('sos.acceptNow')}
                             </button>
                          )}
                          <p className="text-center text-[10px] text-red-600/70 mt-3 font-semibold">
                             {sos.acceptsRemaining === 1 ? t('sos.slotsRemaining', { count: sos.acceptsRemaining }) : t('sos.slotsRemainingPlural', { count: sos.acceptsRemaining })} • {t('sos.expiresIn', { minutes: sos.minutesUntilExpiry })}
                          </p>
                        </div>
                      </div>
                    );
                 })}
               </div>
            )
          ) : (
            // ── REGULAR TAB RENDERING ────────────────────────────────
            requests.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center animate-fade-in">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('regular.noMatches')}</h2>
                <p className="text-sm text-gray-500 max-w-xs">{t('regular.tryBroadening')}</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {sortedRequests.map(req => (
                  <div key={req.id} className={`bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 ${guideCity && (req.province === guideCity || req.location === guideCity) ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-100'}`}>
                    {/* Region match badge */}
                    {guideCity && (req.province === guideCity || req.location === guideCity) && (
                      <div className="bg-indigo-50 px-5 py-1.5 border-b border-indigo-100 flex items-center gap-1.5">
                        <span className="text-xs">📍</span>
                        <span className="text-[11px] font-semibold text-indigo-600">Cùng khu vực của bạn</span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CategoryBadge label={req.category || 'TOUR'} />
                            <h3 className="text-lg font-bold text-gray-900 truncate">{req.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>📅</span>
                            <span>{new Date(req.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-gray-300">·</span>
                            <span>{new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(req.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-gray-400 uppercase">{t('regular.estRate')}</span>
                          <div className="text-xl font-bold text-gray-900">{(req.totalPayout || 0).toLocaleString()} <span className="text-sm font-medium text-gray-500">{req.currency || 'VND'}</span></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="block text-xs font-medium text-gray-400 uppercase mb-0.5">{t('regular.duration')}</span>
                          <span className="text-sm font-semibold text-gray-800">{formatDuration(req.durationMinutes)}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-gray-400 uppercase mb-0.5">{t('regular.language')}</span>
                          <span className="text-sm font-semibold text-gray-800">{req.language || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-gray-400 uppercase mb-0.5">{t('regular.groupSizeKey')}</span>
                          <span className="text-sm font-semibold text-gray-800">{formatGroupSize(req.groupSize)}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-gray-400 uppercase mb-0.5">{t('regular.location')}</span>
                          <span className="text-sm font-semibold text-gray-800">{req.province || req.location || '—'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          {/* Operator Avatar */}
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                            {req.operatorAvatar ? (
                              <img src={req.operatorAvatar} alt={req.operatorName || ''} className="w-full h-full object-cover" />
                            ) : (
                              req.operatorName?.[0]?.toUpperCase() || 'O'
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                              {req.operatorName}
                              {(req as any).isLicensed ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{t('regular.licensed')}</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">{t('regular.noLicense')}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {req.operatorTrust && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium">
                                  <span className={`inline-block w-2 h-2 rounded-full ${
                                    Number(req.operatorTrust) >= 80 ? 'bg-emerald-500' :
                                    Number(req.operatorTrust) >= 60 ? 'bg-amber-500' : 'bg-red-400'
                                  }`} />
                                  <span className={`${
                                    Number(req.operatorTrust) >= 80 ? 'text-emerald-600' :
                                    Number(req.operatorTrust) >= 60 ? 'text-amber-600' : 'text-red-500'
                                  }`}>Trust {req.operatorTrust}</span>
                                </span>
                              )}
                              {(req as any).unlicensedWarning && (
                                <span className="text-[10px] font-medium text-amber-600">
                                  {t('regular.noLicenseWarning', { trust: (req as any).operatorTrustCeiling || 70 })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/dashboard/guide/tours/${req.id}`}
                            className="px-4 py-2 border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 font-medium text-sm rounded-lg transition"
                          >
                            {t('regular.viewDetails')}
                          </Link>
                          {req.hasApplied ? (
                            <button
                              disabled
                              className="px-6 py-2 bg-gray-100 text-gray-500 font-medium text-sm rounded-lg cursor-not-allowed border border-gray-200"
                            >
                              {req.applicationStatus === 'REJECTED' ? t('regular.rejected') : t('regular.applied')}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApply(req.id)}
                              disabled={applying === req.id || !['OPEN', 'PUBLISHED'].includes(req.status)}
                              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition shadow-sm disabled:opacity-50"
                            >
                              {applying === req.id ? t('regular.processing') : t('regular.applyBtn')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm text-gray-400 py-4">
                  {sortedRequests.length === 1 ? t('regular.showingResults', { count: 1 }) : t('regular.showingResultsPlural', { count: sortedRequests.length })}
                </p>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}
