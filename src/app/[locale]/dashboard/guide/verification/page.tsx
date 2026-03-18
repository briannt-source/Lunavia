"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DocumentUpload from '@/components/DocumentUpload';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export default function GuideVerification() {
  const t = useTranslations('Guide.Verification');
  const router = useRouter();

  // File states
  const [licenseFiles, setLicenseFiles] = useState<UploadedFile[]>([]);
  const [idFiles, setIdFiles] = useState<UploadedFile[]>([]);
  const [addressFiles, setAddressFiles] = useState<UploadedFile[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Structured fields
  const [guideType, setGuideType] = useState('LICENSE_GUIDE');
  const [guideCardNumber, setGuideCardNumber] = useState('');

  // Avatar state
  const { data: session, update } = useSession();
  const [avatarUploading, setAvatarUploading] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/account/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('alerts.uploadSuccess'));
        await update(); // Refresh session to show new avatar
      } else {
        toast.error(data.error || t('alerts.uploadFail'));
      }
    } catch (err) {
      toast.error(t('alerts.uploadFail'));
    } finally {
      setAvatarUploading(false);
    }
  }

  // Simplified Guide Types
  const GUIDE_TYPES = [
    { value: 'LICENSE_GUIDE', label: t('types.licensed') },
    { value: 'INTERN', label: t('types.intern') },
  ];

  useEffect(() => {
    // Load existing verification status
    fetch('/api/verification/upload')
      .then(res => res.json())
      .then(data => {
        // We don't restore files into separate categories easily because backend returns flat list
        // So we just restore status for now. 
        if (data.status) {
          setVerificationStatus(data.status);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isIntern = guideType === 'INTERN';

  const validateForm = () => {
    if (!guideType) return { valid: false, message: t('alerts.selectType') };

    if (!isIntern) {
      if (!guideCardNumber.trim()) return { valid: false, message: t('alerts.requireNumber') };
      if (licenseFiles.length === 0) return { valid: false, message: t('alerts.requireLicense') };
    }

    if (idFiles.length === 0) return { valid: false, message: t('alerts.requireId') };
    if (addressFiles.length === 0) return { valid: false, message: t('alerts.requireAddress') };

    return { valid: true };
  };

  async function handleSubmit() {
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message || t('alerts.invalidForm'));
      return;
    }

    setSubmitting(true);
    setError(null);

    // Merge documents for submission
    const allDocuments = [...licenseFiles, ...idFiles, ...addressFiles];

    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'TOUR_GUIDE',
          documents: allDocuments.map(d => ({ id: d.id, filename: d.filename })),
          // Structured metadata
          guideType,
          guideCardNumber: !isIntern ? guideCardNumber : undefined,
          // Store category mapping in meta to help admin
          fileCategories: {
            license: licenseFiles.map(f => f.id),
            identity: idFiles.map(f => f.id),
            address: addressFiles.map(f => f.id)
          }
        }),
      });

      if (res.ok) {
        router.push('/dashboard/verification/status');
      } else {
        const data = await res.json();
        setError(data.message || t('alerts.submitFail'));
      }
    } catch (e: any) {
      setError(e.message || t('alerts.networkError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    const allDocs = [...licenseFiles, ...idFiles, ...addressFiles];
    if (allDocs.length > 0) {
      const confirmed = confirm(t('alerts.cancelConfirm'));
      if (!confirmed) return;

      for (const doc of allDocs) {
        try {
          await fetch('/api/verification/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: doc.id }),
          });
        } catch { /* best-effort cleanup */ }
      }
    }
    router.back();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (verificationStatus === 'PENDING' || verificationStatus === 'APPROVED') {
    // Reuse existing status UI
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${verificationStatus === 'APPROVED' ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {verificationStatus === 'APPROVED' ? (
                <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{verificationStatus === 'APPROVED' ? t('status.approvedTitle') : t('status.pendingTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {verificationStatus === 'APPROVED' ? t('status.approvedDesc') : t('status.pendingDesc')}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              {t('status.backBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* KYC Info Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">🪪</span>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{t('kyc.title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {t('kyc.desc')}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-emerald-100 text-emerald-700">
                  {t('kyc.perk1')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-emerald-100 text-emerald-700">
                  {t('kyc.perk2')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-emerald-100 text-emerald-700">
                  {t('kyc.perk3')}
                </span>
              </div>
              <a href="/verification-guide" target="_blank" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition inline-flex items-center gap-1">
                {t('kyc.link')}
              </a>
            </div>
          </div>
        </div>

        {/* 0. Profile Photo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-6">
          <div className="relative group shrink-0">
            {(session?.user as any)?.avatarUrl ? (
              <img
                src={(session?.user as any).avatarUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 border-2 border-white shadow-md">
                {session?.user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <label className={`absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${avatarUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {avatarUploading ? (
                <div className="h-4 w-4 animate-spin border-2 border-indigo-600 border-t-transparent rounded-full" />
              ) : (
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={avatarUploading}
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t('form.profilePhoto')}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('form.profilePhotoDesc')}
              <span className="text-xs block mt-1 text-gray-400">{t('form.supportedFormats')}</span>
            </p>
          </div>
        </div>

        {/* Guide Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{t('form.licenseInfo')}</h3>

          {/* Guide Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.guideType')} <span className="text-red-500">*</span>
            </label>
            <select
              value={guideType}
              onChange={(e) => setGuideType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {GUIDE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {isIntern
                ? t('form.internNote')
                : t('form.licensedNote')}
            </p>
          </div>

          {/* Guide Card Number - Only for LICENSE_GUIDE */}
          {!isIntern && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.licenseNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={guideCardNumber}
                onChange={(e) => setGuideCardNumber(e.target.value)}
                placeholder={t('form.licensePlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Required Documents Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('form.requiredDocs')}</h3>

          {/* 1. Identity (Required All) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <DocumentUpload
              label={t('form.identityLabel')}
              hint={t('form.identityHint')}
              maxFiles={5}
              onDocumentsChange={setIdFiles}
            />
          </div>

          {/* 2. Proof of Address (Required All) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <DocumentUpload
              label={t('form.addressLabel')}
              hint={t('form.addressHint')}
              maxFiles={5}
              onDocumentsChange={setAddressFiles}
            />
          </div>

          {/* 3. License Card (Required for LICENSE_GUIDE) */}
          {!isIntern && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <DocumentUpload
                label={t('form.licenseLabel')}
                hint={t('form.licenseHint')}
                maxFiles={5}
                onDocumentsChange={setLicenseFiles}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('form.cancelBtn')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? t('form.submittingBtn') : t('form.submitBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

