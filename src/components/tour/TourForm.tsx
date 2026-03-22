"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isUserVerified } from '@/lib/verification';
import Link from 'next/link';

interface Province {
    id: string;
    code: string;
    name: string;
    nameLocal?: string;
    region?: string;
}

interface RoleRequirement {
    role: string;
    quantity: number;
    rate: number;
}

interface ItineraryStop {
    title: string;
    type: string;
    locationName: string;
    plannedStartTime: string;
    plannedEndTime: string;
}

const GUIDE_ROLES = [
    { value: 'MAIN_GUIDE', label: 'Main Guide', description: 'Primary tour leader' },
    { value: 'SUB_GUIDE', label: 'Sub Guide', description: 'Supporting guide' },
    { value: 'INTERN', label: 'Intern', description: 'Training position' },
];

const SEGMENT_TYPES = [
    { value: 'SIGHTSEEING', label: '👁️ Sightseeing' },
    { value: 'ACTIVITY', label: '🎯 Activity' },
    { value: 'ATTRACTION', label: '🏛️ Attraction' },
    { value: 'MEAL', label: '🍽️ Meal' },
    { value: 'TRANSFER', label: '🚌 Transfer' },
    { value: 'HOTEL', label: '🏨 Hotel' },
    { value: 'OTHER', label: '📌 Other' },
];

const LANGUAGES = [
    { value: 'EN', label: 'English' },
    { value: 'VI', label: 'Vietnamese' },
    { value: 'TH', label: 'Thai' },
    { value: 'ZH', label: 'Chinese' },
    { value: 'JA', label: 'Japanese' },
    { value: 'KO', label: 'Korean' },
    { value: 'FR', label: 'French' },
    { value: 'DE', label: 'German' },
    { value: 'ES', label: 'Spanish' },
    { value: 'RU', label: 'Russian' },
    { value: 'IT', label: 'Italian' },
    { value: 'PT', label: 'Portuguese' },
    { value: 'AR', label: 'Arabic' },
    { value: 'HI', label: 'Hindi' },
    { value: 'OTHER', label: 'Other' },
];

const CATEGORIES = [
    { value: 'CITY_TOUR', label: 'City Tour' },
    { value: 'ADVENTURE', label: 'Adventure' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'FOOD_TOUR', label: 'Food Tour' },
    { value: 'NATURE', label: 'Nature' },
    { value: 'HISTORICAL', label: 'Historical' },
    { value: 'PHOTOGRAPHY', label: 'Photography' },
    { value: 'WELLNESS', label: 'Wellness & Spa' },
    { value: 'NIGHTLIFE', label: 'Nightlife' },
    { value: 'CRUISE', label: 'Cruise / Boat' },
    { value: 'TREKKING', label: 'Trekking / Hiking' },
    { value: 'DIVING', label: 'Diving / Snorkeling' },
    { value: 'WORKSHOP', label: 'Workshop / Class' },
    { value: 'TEAMBUILDING', label: 'Team Building' },
    { value: 'INBOUND', label: 'Inbound (International → VN)' },
    { value: 'OUTBOUND', label: 'Outbound (VN → International)' },
    { value: 'OTHER', label: 'Other' },
];

interface TourFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const STEPS = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Tour Details' },
    { id: 3, label: 'Roles Needed' },
    { id: 4, label: 'Itinerary' },
];

export default function TourForm({ initialData, isEdit = false }: TourFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const isVerified = isUserVerified(session?.user as any);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [groupedProvinces, setGroupedProvinces] = useState<Record<string, Province[]>>({});

    const formTopRef = useRef<HTMLDivElement>(null);

    // Track saved draft ID to prevent duplicate creation
    const [savedDraftId, setSavedDraftId] = useState<string | null>(initialData?.id || null);

    // Step management
    const [currentStep, setCurrentStep] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);

    // Wallet state for preflight check
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [walletLoading, setWalletLoading] = useState(true);

    // Step 1 — Basic Information
    const [title, setTitle] = useState(initialData?.title || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [province, setProvince] = useState(initialData?.province || '');
    const [marketType, setMarketType] = useState<'INBOUND' | 'OUTBOUND'>(initialData?.marketType || 'INBOUND');
    const [country, setCountry] = useState(initialData?.country || 'VN');
    const [outboundCountries, setOutboundCountries] = useState<any[]>([]);
    const formatDateTime = (isoString: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : '';
    const [startTime, setStartTime] = useState(initialData?.startDate ? formatDateTime(initialData.startDate) : '');
    const [endTime, setEndTime] = useState(initialData?.endDate ? formatDateTime(initialData.endDate) : '');
    const [language, setLanguage] = useState(initialData?.language || 'EN');
    const [visibility, setVisibility] = useState(initialData?.visibility || 'PUBLIC');

    // Step 2 — Tour Details
    const [description, setDescription] = useState(initialData?.description || '');
    const [itinerary, setItinerary] = useState(initialData?.itinerary || '');
    const [inclusion, setInclusion] = useState(initialData?.inclusion || '');
    const [exclusion, setExclusion] = useState(initialData?.exclusion || '');
    const [groupSize, setGroupSize] = useState<number | ''>(initialData?.groupSize || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [customCategory, setCustomCategory] = useState(initialData?.customCategory || '');
    const [customLanguage, setCustomLanguage] = useState(initialData?.customLanguage || '');

    // Step 2 — Documents
    const MAX_DOCUMENTS = 10;
    const ALLOWED_DOC_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'];
    const [documents, setDocuments] = useState<any[]>([]);
    const [docUploading, setDocUploading] = useState(false);
    const [docError, setDocError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 3 — Roles Needed
    const parseRoles = (roles: any): RoleRequirement[] => {
        if (!roles) return [{ role: 'MAIN_GUIDE', quantity: 1, rate: 0 }];
        if (typeof roles === 'string') {
            try {
                const parsed = JSON.parse(roles);
                return parsed.map((r: any) => ({ ...r, rate: r.rate || 0 }));
            } catch { return [{ role: 'MAIN_GUIDE', quantity: 1, rate: 0 }]; }
        }
        return roles.map((r: any) => ({ ...r, rate: r.rate || 0 }));
    };
    const [rolesNeeded, setRolesNeeded] = useState<RoleRequirement[]>(parseRoles(initialData?.rolesNeeded));
    const [notes, setNotes] = useState(initialData?.rolesInfo || initialData?.eligibilityNotes || '');
    const [currency, setCurrency] = useState(initialData?.currency || 'VND');
    const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || 'CASH');

    // Step 4 — Itinerary
    const [itineraryStops, setItineraryStops] = useState<ItineraryStop[]>([]);
    const [existingSegments, setExistingSegments] = useState<any[]>([]);

    // Auto-calculated Total Payout
    const totalPayout = rolesNeeded.reduce((sum, role) => sum + (role.quantity * role.rate), 0);

    // Fetch outbound countries on mount
    useEffect(() => {
        fetch('/api/locations/countries?market=outbound')
            .then(res => res.json())
            .then(data => setOutboundCountries(data.countries || []))
            .catch(console.error);
    }, []);

    // Fetch provinces/cities whenever country changes
    useEffect(() => {
        const activeCountry = marketType === 'OUTBOUND' ? country : 'VN';
        // If Outbound but no country selected yet, clear the list
        if (marketType === 'OUTBOUND' && !activeCountry) {
            setProvinces([]);
            setGroupedProvinces({});
            return;
        }
        fetch(`/api/locations?country=${activeCountry}`)
            .then(res => res.json())
            .then(data => {
                setProvinces(data.cities || []);
                setGroupedProvinces(data.grouped || {});
            })
            .catch(console.error);
    }, [country, marketType]);

    // Fetch existing segments when editing
    useEffect(() => {
        if (savedDraftId) {
            fetch(`/api/tours/${savedDraftId}/segments`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setExistingSegments(data.data);
                        if (data.data.length > 0 && itineraryStops.length === 0) {
                            setItineraryStops(data.data.map((s: any) => ({
                                title: s.title || '',
                                type: s.type || 'OTHER',
                                locationName: s.locationName || '',
                                plannedStartTime: s.plannedStartTime ? new Date(s.plannedStartTime).toISOString().slice(0, 16) : '',
                                plannedEndTime: s.plannedEndTime ? new Date(s.plannedEndTime).toISOString().slice(0, 16) : '',
                            })));
                        }
                    }
                })
                .catch(() => {});
        }
    }, [savedDraftId]);

    // Fetch wallet balance for preflight
    useEffect(() => {
        fetch('/api/operator/wallet')
            .then(res => res.json())
            .then(data => {
                if (data.wallet) setWalletBalance(data.wallet.availableBalance);
            })
            .catch(() => { /* wallet unavailable */ })
            .finally(() => setWalletLoading(false));
    }, []);

    // Fetch existing documents when editing
    const fetchDocuments = async (tourId: string) => {
        try {
            const res = await fetch(`/api/tours/${tourId}/documents`);
            const data = await res.json();
            if (data.success && data.data?.documents) {
                setDocuments(data.data.documents);
            }
        } catch { /* ignore */ }
    };

    useEffect(() => {
        if (savedDraftId) fetchDocuments(savedDraftId);
    }, [savedDraftId]);

    // Upload a document
    const handleDocUpload = async (file: File) => {
        if (documents.length >= MAX_DOCUMENTS) {
            setDocError(`Maximum ${MAX_DOCUMENTS} documents allowed`);
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
            setDocError(`File type .${ext} not allowed. Use: ${ALLOWED_DOC_EXTENSIONS.join(', ')}`);
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setDocError('File too large. Maximum: 20MB');
            return;
        }

        // If no draft saved yet, auto-save first
        let tourId = savedDraftId;
        if (!tourId) {
            setDocUploading(true);
            setDocError(null);
            try {
                const payload = {
                    title: title.trim() || 'Untitled Tour',
                    description: description.trim() || null,
                    location: location.trim(),
                    province: province || null,
                    marketType,
                    country: marketType === 'OUTBOUND' ? country : 'VN',
                    startDate: startTime || null,
                    endDate: endTime || null,
                    language, visibility,
                    itinerary: itinerary.trim() || null,
                    inclusion: inclusion.trim() || null,
                    exclusion: exclusion.trim() || null,
                    groupSize: groupSize || null,
                    category: category || null,
                    rolesNeeded,
                    eligibilityNotes: notes.trim() || null,
                    rolesInfo: notes.trim() || null,
                    totalPayout: totalPayout || null,
                    currency, paymentMethod,
                };
                const res = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) { setDocError(data.error || 'Failed to save draft'); setDocUploading(false); return; }
                tourId = data.data?.request?.id || data.request?.id;
                if (tourId) setSavedDraftId(tourId);
            } catch {
                setDocError('Failed to save draft before uploading');
                setDocUploading(false);
                return;
            }
        }

        if (!tourId) { setDocError('Could not determine tour ID'); return; }

        // Upload file
        setDocUploading(true);
        setDocError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`/api/tours/${tourId}/documents`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) { setDocError(data.error || 'Upload failed'); setDocUploading(false); return; }
            // Refresh document list
            await fetchDocuments(tourId);
        } catch {
            setDocError('Failed to upload document');
        } finally {
            setDocUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Delete a document
    const handleDocDelete = async (docId: string) => {
        try {
            const res = await fetch(`/api/tours/documents/${docId}`, { method: 'DELETE' });
            if (res.ok && savedDraftId) {
                await fetchDocuments(savedDraftId);
            }
        } catch {
            setDocError('Failed to delete document');
        }
    };

    const addRole = () => {
        const availableRoles = GUIDE_ROLES.filter(
            r => !rolesNeeded.some(rn => rn.role === r.value)
        );
        if (availableRoles.length > 0) {
            setRolesNeeded([...rolesNeeded, { role: availableRoles[0].value, quantity: 1, rate: 0 }]);
        }
    };

    const removeRole = (index: number) => {
        if (rolesNeeded.length > 1) {
            setRolesNeeded(rolesNeeded.filter((_, i) => i !== index));
        }
    };

    const updateRole = (index: number, field: keyof RoleRequirement, value: string | number) => {
        const updated = [...rolesNeeded];
        updated[index] = { ...updated[index], [field]: value };
        setRolesNeeded(updated);
    };

    // Currency symbol map
    const currencySymbol: Record<string, string> = { VND: '₫', THB: '฿', USD: '$' };

    // Format rate with thousand separators for display
    const formatRate = (value: number) => {
        if (!value) return '';
        return value.toLocaleString();
    };

    const parseRate = (value: string): number => {
        return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    };

    // Validation per step
    function validateStep(step: number): string | null {
        if (step === 1) {
            if (!title.trim()) return 'Title is required';
        }
        return null;
    }

    function validateForPublish(): string | null {
        if (!title.trim()) return 'Title is required';
        if (!location.trim()) return 'Location is required';
        if (!province) return 'Province is required for marketplace filtering';
        if (!startTime || !endTime) return 'Start and end times are required';
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (start <= new Date()) return 'Start time must be in the future';
        if (end <= start) return 'End time must be after start time';
        if (rolesNeeded.length === 0) return 'At least one guide role is required';
        if (totalPayout <= 0) return 'At least one role must have a rate greater than 0';
        return null;
    }

    function nextStep() {
        const err = validateStep(currentStep);
        if (err) { setError(err); return; }
        setError(null);
        setCurrentStep(Math.min(currentStep + 1, 4));
    }

    function prevStep() {
        setError(null);
        setCurrentStep(Math.max(currentStep - 1, 1));
    }

    // Itinerary helpers
    const addStop = () => {
        setItineraryStops([...itineraryStops, { title: '', type: 'SIGHTSEEING', locationName: '', plannedStartTime: '', plannedEndTime: '' }]);
    };

    const removeStop = (index: number) => {
        setItineraryStops(itineraryStops.filter((_, i) => i !== index));
    };

    const updateStop = (index: number, field: keyof ItineraryStop, value: string) => {
        const updated = [...itineraryStops];
        updated[index] = { ...updated[index], [field]: value };
        setItineraryStops(updated);
    };

    const moveStop = (index: number, direction: 'up' | 'down') => {
        const newIdx = direction === 'up' ? index - 1 : index + 1;
        if (newIdx < 0 || newIdx >= itineraryStops.length) return;
        const updated = [...itineraryStops];
        [updated[index], updated[newIdx]] = [updated[newIdx], updated[index]];
        setItineraryStops(updated);
    };

    async function saveSegments(tourId: string) {
        const validStops = itineraryStops.filter(s => s.title.trim());
        if (validStops.length === 0) return;

        const segments = validStops.map((s, i) => ({
            title: s.title.trim(),
            type: s.type,
            locationName: s.locationName.trim() || null,
            plannedStartTime: s.plannedStartTime || null,
            plannedEndTime: s.plannedEndTime || null,
            orderIndex: i,
        }));

        try {
            // Delete existing segments first if any
            if (existingSegments.length > 0) {
                await fetch(`/api/tours/${tourId}/segments`, { method: 'DELETE' });
            }
            await fetch(`/api/tours/${tourId}/segments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ segments }),
            });
        } catch (err) {
            console.error('Failed to save segments:', err);
        }
    }

    async function handleSubmit(action: 'draft' | 'publish') {
        setLoading(true);
        setError(null);

        // Client-side verification check for publish
        if (action === 'publish' && !isVerified) {
            setError('Account verification is required to publish tours. You can save as Draft.');
            setLoading(false);
            return;
        }

        // Validation
        if (!title.trim()) { setError('Title is required'); setLoading(false); return; }
        if (action === 'publish') {
            const publishErr = validateForPublish();
            if (publishErr) { setError(publishErr); setLoading(false); return; }
        }

        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                location: location.trim(),
                province: province || null,
                marketType,
                country: marketType === 'OUTBOUND' ? country : 'VN',
                startDate: startTime || null,
                endDate: endTime || null,
                language,
                visibility,
                itinerary: itinerary.trim() || null,
                inclusion: inclusion.trim() || null,
                exclusion: exclusion.trim() || null,
                eligibilityNotes: notes.trim() || null,
                rolesNeeded,
                rolesInfo: notes.trim() || null,
                totalPayout: totalPayout || null,
                currency,
                paymentMethod,
                groupSize: groupSize || null,
                category: category || null,
            };

            // Create or Update the tour
            // Use savedDraftId to prevent duplicate creation on retry
            const existingId = isEdit ? initialData.id : savedDraftId;
            const url = existingId ? `/api/requests/${existingId}` : '/api/requests';
            const method = existingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to save tour');
                formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                setLoading(false);
                return;
            }

            // Track the created ID for retry safety
            const tourId = existingId || data.data?.request?.id || data.request?.id;
            if (tourId && !savedDraftId) {
                setSavedDraftId(tourId);
            }

            // Save segments if any
            if (tourId) {
                await saveSegments(tourId);
            }

            // If "Save as Draft" → done, redirect
            if (action === 'draft') {
                router.push('/dashboard/operator/tours');
                return;
            }

            // If "Publish" → call the publish endpoint
            if (!tourId) {
                setError('Could not publish. Please try again or save as draft.');
                setLoading(false);
                return;
            }

            const publishRes = await fetch(`/api/requests/${tourId}/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const publishData = await publishRes.json();

            if (!publishRes.ok) {
                const msg = publishData.message || publishData.error || 'Publishing failed.';
                setError(msg);
                formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                setLoading(false);
                return;
            }

            // Published successfully → redirect
            router.push('/dashboard/operator/tours');
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div ref={formTopRef} className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Tour' : 'Create New Tour'}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEdit
                            ? `Editing Draft — ${initialData?.status === 'DRAFT' ? 'Save or Publish when ready' : 'Update tour details'}`
                            : 'Fill in the details for your tour request'}
                    </p>
                </div>
                <Link
                    href="/dashboard/operator/tours"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    ← Back to Tours
                </Link>
            </div>

            {/* Verification Banner */}
            {!isVerified && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 flex items-start gap-3">
                    <span className="text-xl">⚠</span>
                    <div>
                        <p className="font-semibold">Verification Required to Publish</p>
                        <p>You can save drafts. Verification is required to publish tours.</p>
                        <Link href="/dashboard/operator/verification" className="text-[#5BA4CF] hover:underline mt-1 inline-block">Complete Verification →</Link>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">⚠</span>
                        <div>
                            <p className="font-semibold">Action Required</p>
                            <p className="mt-0.5">{error}</p>
                            {error.includes('wallet') && (
                                <Link href="/dashboard/operator/wallet" className="text-[#5BA4CF] hover:underline mt-1.5 inline-block font-medium">Top up wallet →</Link>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 shrink-0 text-lg">✕</button>
                </div>
            )}

            {/* Step Indicator */}
            <div className="flex items-center">
                {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center">
                        <button
                            type="button"
                            onClick={() => { setError(null); setCurrentStep(step.id); }}
                            className="flex items-center gap-2 group"
                        >
                            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors
                                ${currentStep === step.id
                                    ? 'bg-lunavia-primary text-white'
                                    : currentStep > step.id
                                        ? 'bg-lunavia-muted/50 text-[#2E8BC0]'
                                        : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                {currentStep > step.id ? '✓' : step.id}
                            </span>
                            <span className={`text-sm font-medium hidden sm:inline transition-colors
                                ${currentStep === step.id
                                    ? 'text-[#2E8BC0]'
                                    : currentStep > step.id
                                        ? 'text-[#5BA4CF]'
                                        : 'text-gray-400'
                                }`}
                            >
                                {step.label}
                            </span>
                        </button>
                        {i < STEPS.length - 1 && <div className="w-12 h-px bg-gray-200 mx-3" />}
                    </div>
                ))}
            </div>

            {/* ===== STEP 1: Basic Information ===== */}
            {currentStep === 1 && (
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

                    {/* ── Market Type Selector ── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Market Type <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => { setMarketType('INBOUND'); setCountry('VN'); setProvince(''); }}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                    marketType === 'INBOUND'
                                        ? 'border-indigo-500 bg-lunavia-light ring-2 ring-indigo-500/20'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <span className="text-2xl">🌍→🇻🇳</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${marketType === 'INBOUND' ? 'text-[#2E8BC0]' : 'text-gray-700'}`}>Inbound</p>
                                    <p className="text-xs text-gray-500">Tours within Vietnam</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMarketType('OUTBOUND'); setCountry(''); setProvince(''); }}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                    marketType === 'OUTBOUND'
                                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <span className="text-2xl">🇻🇳→🌍</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${marketType === 'OUTBOUND' ? 'text-emerald-700' : 'text-gray-700'}`}>Outbound</p>
                                    <p className="text-xs text-gray-500">Tours abroad</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* ── Country Selector (only for OUTBOUND) ── */}
                    {marketType === 'OUTBOUND' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country <span className="text-red-500">*</span></label>
                            <select
                                value={country}
                                onChange={(e) => { setCountry(e.target.value); setProvince(''); }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                            >
                                <option value="">Select country...</option>
                                {outboundCountries.map((c: any) => (
                                    <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.nameLocal})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={marketType === 'OUTBOUND' ? 'e.g., 5-Day Tokyo Highlights Tour' : 'e.g., Full-day Temple Tour in Ho Chi Minh'}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {marketType === 'OUTBOUND' ? 'City/Region' : 'Province'} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            >
                                <option value="">{marketType === 'OUTBOUND' ? 'Select city/region...' : 'Select province...'}</option>
                                {Object.entries(groupedProvinces).map(([region, pList]) => (
                                    <optgroup key={region} label={region}>
                                        {(pList as any[]).map((p: any) => (
                                            <option key={p.code || p.id} value={p.code}>
                                                {p.nameLocal || p.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Used for marketplace filtering</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={marketType === 'OUTBOUND' ? 'e.g., Shibuya Crossing, Tokyo' : 'e.g., Grand Palace, Ho Chi Minh'}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            >
                                {LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            >
                                <option value="PUBLIC">Public</option>
                                <option value="PRIVATE">Private</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Private tours are only visible to your in-house team</p>
                        </div>
                    </div>
                    {/* Custom language input if OTHER */}
                    {language === 'OTHER' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specify Language</label>
                            <input
                                type="text"
                                value={customLanguage}
                                onChange={(e) => setCustomLanguage(e.target.value)}
                                placeholder="e.g., Malay, Khmer, Tagalog..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                    )}
                </section>
            )}

            {/* ===== STEP 2: Tour Details ===== */}
            {currentStep === 2 && (
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900">Tour Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Brief overview of the tour..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <textarea
                            value={itinerary}
                            onChange={(e) => setItinerary(e.target.value)}
                            rows={4}
                            placeholder="Outline the schedule and stops..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <textarea value={inclusion} onChange={(e) => setInclusion(e.target.value)} rows={3} placeholder="What's included..." className="w-full rounded-lg border border-gray-300 px-4 py-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exclusions <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <textarea value={exclusion} onChange={(e) => setExclusion(e.target.value)} rows={3} placeholder="What's not included..." className="w-full rounded-lg border border-gray-300 px-4 py-2.5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Size</label>
                            <input
                                type="number"
                                min="1"
                                value={groupSize}
                                onChange={(e) => setGroupSize(e.target.value ? parseInt(e.target.value) : '')}
                                placeholder="e.g., 15"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                            >
                                <option value="">Select category...</option>
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            {category === 'OTHER' && (
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Specify category..."
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Document Upload Section ── */}
                    <div className="border-t border-gray-200 pt-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Tour Documents</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Upload itinerary, maps, waivers, etc. Assigned guides can view and download these. Max {MAX_DOCUMENTS} files.
                                </p>
                            </div>
                            <span className="text-xs font-medium text-gray-400">{documents.length}/{MAX_DOCUMENTS}</span>
                        </div>

                        {docError && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-3 flex items-center justify-between">
                                <span>{docError}</span>
                                <button onClick={() => setDocError(null)} className="text-red-400 hover:text-red-600">✕</button>
                            </div>
                        )}

                        {/* Uploaded Documents */}
                        {documents.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-lg">
                                                {doc.fileName?.endsWith('.pdf') ? '📄' :
                                                    doc.fileName?.match(/\.(png|jpg|jpeg)$/i) ? '🖼️' :
                                                        doc.fileName?.endsWith('.xlsx') ? '📊' : '📎'}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ''}
                                                    {doc.createdAt ? ` · ${new Date(doc.createdAt).toLocaleDateString()}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {doc.fileUrl && (
                                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                                                   className="text-xs text-[#5BA4CF] hover:text-[#2E8BC0] font-medium">View</a>
                                            )}
                                            <button onClick={() => handleDocDelete(doc.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Input */}
                        {documents.length < MAX_DOCUMENTS && (
                            <div className="relative">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleDocUpload(file);
                                    }}
                                    disabled={docUploading}
                                    className="hidden"
                                    id="doc-upload-input"
                                />
                                <label htmlFor="doc-upload-input"
                                       className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                                           docUploading
                                               ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                               : 'border-gray-300 hover:border-indigo-400 hover:bg-lunavia-light/50 text-gray-600'
                                       }`}>
                                    {docUploading ? (
                                        <><span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                    ) : (
                                        <><span className="text-lg">📎</span> <span className="text-sm font-medium">Click to upload document</span>
                                            <span className="text-xs text-gray-400">(PDF, DOCX, XLSX, PNG, JPG · max 20MB)</span></>
                                    )}
                                </label>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ===== STEP 3: Roles Needed ===== */}
            {currentStep === 3 && (
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                    {/* Running Total — top of section */}
                    <div className="bg-lunavia-light border border-[#5BA4CF]/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-900">Total Payout</p>
                                <p className="text-xs text-[#5BA4CF] mt-0.5">Sum of all roles below · auto-calculated</p>
                            </div>
                            <p className="text-xl font-bold text-[#2E8BC0]">
                                {currencySymbol[currency] || ''}{totalPayout.toLocaleString()} <span className="text-sm font-medium">{currency}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Roles & Compensation <span className="text-red-500">*</span></h2>
                            <p className="text-xs text-gray-500 mt-0.5">Each role is a contractual commitment. Guides will see these rates.</p>
                        </div>
                        <button
                            type="button"
                            onClick={addRole}
                            disabled={rolesNeeded.length >= GUIDE_ROLES.length}
                            className="text-sm text-[#5BA4CF] hover:text-[#2E8BC0] font-medium disabled:opacity-50"
                        >
                            + Add Role
                        </button>
                    </div>

                    <div className="space-y-3">
                        {rolesNeeded.map((role, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 border-l-4 border-l-indigo-400">
                                <select
                                    value={role.role}
                                    onChange={(e) => updateRole(index, 'role', e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                >
                                    {GUIDE_ROLES.map(gr => (
                                        <option key={gr.value} value={gr.value} disabled={rolesNeeded.some((rn, i) => i !== index && rn.role === gr.value)}>
                                            {gr.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-500">Qty:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={role.quantity}
                                        onChange={(e) => updateRole(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-sm text-center"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-500">Rate:</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">{currencySymbol[currency] || ''}</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={role.rate ? formatRate(role.rate) : ''}
                                            onChange={(e) => updateRole(index, 'rate', parseRate(e.target.value))}
                                            placeholder="1,500,000"
                                            className="w-36 rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm text-right"
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">{currency}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeRole(index)}
                                    disabled={rolesNeeded.length <= 1}
                                    className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                                >
                                    <span className="text-xl">×</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Notes — merged from rolesInfo + eligibilityNotes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Role requirements, duties, eligibility criteria, or preferences..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                        />
                        <p className="text-xs text-gray-400 mt-1">Covers role descriptions and eligibility requirements</p>
                    </div>

                    {/* Currency & Payment */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5">
                                <option value="VND">VND (₫)</option>
                                <option value="THB">THB (฿)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5">
                                <option value="CASH">Cash</option>
                                <option value="ONLINE_BANKING">Online Banking</option>
                            </select>
                        </div>
                    </div>

                    {/* Wallet Balance Check */}
                    {isVerified && (
                        <div className={`rounded-lg p-4 border ${walletLoading
                            ? 'bg-gray-50 border-gray-200'
                            : walletBalance !== null && walletBalance >= totalPayout
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                            {walletLoading ? (
                                <p className="text-sm text-gray-500">Checking wallet balance...</p>
                            ) : walletBalance !== null ? (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Wallet Balance</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Available for escrow</p>
                                        </div>
                                        <p className={`text-lg font-bold ${walletBalance >= totalPayout ? 'text-green-700' : 'text-red-700'}`}>
                                            {walletBalance.toLocaleString()} <span className="text-sm font-normal">{currency}</span>
                                        </p>
                                    </div>
                                    {totalPayout > 0 && walletBalance < totalPayout && (
                                        <div className="mt-3 pt-3 border-t border-red-200">
                                            <p className="text-sm text-red-700 font-medium">
                                                Insufficient balance. You need {(totalPayout - walletBalance).toLocaleString()} {currency} more to publish.
                                            </p>
                                            <Link
                                                href="/dashboard/operator/wallet"
                                                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-[#5BA4CF] hover:text-[#2E8BC0]"
                                            >
                                                Top up wallet →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Wallet unavailable</p>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* ===== STEP 4: Itinerary ===== */}
            {currentStep === 4 && (
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Add tour stops for guides to check-in at each location. <span className="text-gray-400">(Optional — guides can log activities freely if skipped)</span></p>
                        </div>
                        <button type="button" onClick={addStop} className="text-sm text-[#5BA4CF] hover:text-[#2E8BC0] font-medium">+ Add Stop</button>
                    </div>

                    {itineraryStops.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                            <div className="text-4xl mb-2">🗺️</div>
                            <p className="font-medium text-gray-700">No itinerary stops yet</p>
                            <p className="text-sm text-gray-500 mt-1">Add stops to create a structured check-in flow for your guide.</p>
                            <p className="text-xs text-gray-400 mt-2">If you skip this, guides can still log activities freely during the tour.</p>
                            <button type="button" onClick={addStop} className="mt-4 px-5 py-2.5 bg-lunavia-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">Add First Stop</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {itineraryStops.map((stop, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-gray-50 border border-gray-200 border-l-4 border-l-indigo-400 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400">Stop {idx + 1}</span>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => moveStop(idx, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm">↑</button>
                                            <button type="button" onClick={() => moveStop(idx, 'down')} disabled={idx === itineraryStops.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm">↓</button>
                                            <button type="button" onClick={() => removeStop(idx)} className="p-1 text-gray-400 hover:text-red-500 text-lg">×</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                value={stop.title}
                                                onChange={e => updateStop(idx, 'title', e.target.value)}
                                                placeholder="Stop title (e.g., Grand Palace Visit)"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={stop.type}
                                                onChange={e => updateStop(idx, 'type', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                            >
                                                {SEGMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <input
                                                type="text"
                                                value={stop.locationName}
                                                onChange={e => updateStop(idx, 'locationName', e.target.value)}
                                                placeholder="Location name"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="datetime-local"
                                                value={stop.plannedStartTime}
                                                onChange={e => updateStop(idx, 'plannedStartTime', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                title="Planned start time"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="datetime-local"
                                                value={stop.plannedEndTime}
                                                onChange={e => updateStop(idx, 'plannedEndTime', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                title="Planned end time"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addStop} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-[#5BA4CF] transition">+ Add Another Stop</button>
                        </div>
                    )}
                </section>
            )}

            {/* ===== Navigation & Actions ===== */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            ← Previous
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/operator/tours')}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    {currentStep < 4 && (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="rounded-lg bg-lunavia-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm"
                        >
                            Next →
                        </button>
                    )}
                    {currentStep === 4 && (
                        <>
                            <button
                                type="button"
                                onClick={() => handleSubmit('draft')}
                                disabled={loading}
                                className="rounded-lg border border-[#5BA4CF]/30 bg-lunavia-light px-5 py-2.5 text-sm font-medium text-[#2E8BC0] hover:bg-lunavia-muted/50 disabled:opacity-50 transition"
                            >
                                {loading ? 'Saving...' : 'Save as Draft'}
                            </button>
                            {isVerified ? (
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPublishConfirm(true)}
                                        disabled={loading || (walletBalance !== null && totalPayout > 0 && walletBalance < totalPayout)}
                                        className="rounded-lg bg-lunavia-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                                    >
                                        {loading ? 'Publishing...' : 'Publish Now'}
                                    </button>
                                    {walletBalance !== null && totalPayout > 0 && walletBalance < totalPayout && (
                                        <span className="text-xs text-red-600 font-medium">Insufficient funds to publish</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        type="button"
                                        disabled
                                        className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                                    >
                                        Complete Verification to Publish
                                    </button>
                                    <Link href="/dashboard/operator/verification" className="text-xs text-[#5BA4CF] hover:underline">
                                        Go to Verification →
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Publish Confirmation Modal */}
            {
                showPublishConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Publish</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                This will hold <strong>{totalPayout.toLocaleString()} {currency}</strong> from your wallet as escrow.
                            </p>
                            <p className="text-xs text-gray-400 mb-6">The escrow amount is based on the roles and rates you&apos;ve configured. It will be released to the guide upon tour completion.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowPublishConfirm(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { setShowPublishConfirm(false); handleSubmit('publish'); }}
                                    disabled={loading}
                                    className="rounded-lg bg-lunavia-primary px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Publishing...' : 'Confirm & Publish'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
