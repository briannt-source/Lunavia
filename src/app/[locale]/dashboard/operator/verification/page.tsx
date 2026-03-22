"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DocumentUpload from '@/components/DocumentUpload';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';

interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

const OPERATOR_TYPES = [
  { value: 'TOUR_OPERATOR', label: 'Tour Operator' },
  { value: 'TRAVEL_AGENCY', label: 'Travel Agency' },
  { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietor' },
];

export default function OperatorVerification() {
  const router = useRouter();

  // Split document states
  const [businessDocs, setBusinessDocs] = useState<UploadedFile[]>([]);
  const [licenseDocs, setLicenseDocs] = useState<UploadedFile[]>([]);
  const [idDocs, setIdDocs] = useState<UploadedFile[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Structured fields
  const [operatorType, setOperatorType] = useState('TOUR_OPERATOR');
  // ... previous states
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [tourLicenseNumber, setTourLicenseNumber] = useState('');

  // Logo state
  const { data: session, update } = useSession();
  const [logoUploading, setLogoUploading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/account/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Company logo updated');
        await update(); // Refresh session
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setLogoUploading(false);
    }
  }

  useEffect(() => {
    fetch('/api/verification/upload')
      .then(res => res.json())
      .then(data => {
        if (data.status) setVerificationStatus(data.status);
        // Documents pre-fill currently not supported with split logic easily without metadata
        // Assuming fresh upload for now or just listing them in a summary if revisiting
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const validateForm = () => {
    if (!operatorType) return { valid: false, message: 'Please select operator type' };

    if (operatorType === 'TOUR_OPERATOR') {
      if (!businessRegistrationNumber.trim()) return { valid: false, message: 'Business Registration Number is required' };
      if (!tourLicenseNumber.trim()) return { valid: false, message: 'Tour Operator License Number is required' };
      if (businessDocs.length === 0) return { valid: false, message: 'Please upload Business Registration Certificate' };
      if (licenseDocs.length === 0) return { valid: false, message: 'Please upload Tour Operator License' };
      if (idDocs.length === 0) return { valid: false, message: 'Please upload Director/Owner ID' };
    } else if (operatorType === 'TRAVEL_AGENCY') {
      if (!businessRegistrationNumber.trim()) return { valid: false, message: 'Business Registration Number is required' };
      if (businessDocs.length === 0) return { valid: false, message: 'Please upload Business Registration Certificate' };
      if (idDocs.length === 0) return { valid: false, message: 'Please upload Director/Owner ID' };
    }

    return { valid: true };
  };

  async function handleSubmit() {
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message || 'Invalid form');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Merge documents
    const allDocs = [...businessDocs, ...licenseDocs, ...idDocs];

    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'TOUR_OPERATOR',
          documents: allDocs.map(d => ({ id: d.id, filename: d.filename })),
          operatorType,
          businessRegistrationNumber: operatorType !== 'SOLE_PROPRIETOR' ? businessRegistrationNumber : undefined,
          tourLicenseNumber: operatorType === 'TOUR_OPERATOR' ? tourLicenseNumber : undefined,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/verification/status');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to submit verification');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    // If user has uploaded any docs, confirm before discarding
    const allDocs = [...businessDocs, ...licenseDocs, ...idDocs];
    if (allDocs.length > 0) {
      const confirmed = confirm('You have uploaded documents. Cancelling will remove them. Continue?');
      if (!confirmed) return;

      // Cleanup orphan documents
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

  // ... (loading and status check remains same)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (verificationStatus === 'PENDING' || verificationStatus === 'APPROVED') {
    // Keep existing status UI
    return (
      <BaseDashboardLayout
        header={
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verification Status</h1>
          </div>
        }
      >
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${verificationStatus === 'APPROVED' ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {verificationStatus === 'APPROVED' ? (
                <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{verificationStatus === 'APPROVED' ? 'Already Verified' : 'Verification Pending'}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {verificationStatus === 'APPROVED' ? 'Your account has been verified.' : "Your documents are being reviewed. We'll notify you once complete."}
            </p>
            {verificationStatus === 'APPROVED' && (
              <div className="mt-4 rounded-lg bg-lunavia-light border border-[#5BA4CF]/20 p-4 text-left">
                <p className="text-sm text-indigo-800 font-medium">Next step: Fund your wallet</p>
                <p className="text-xs text-[#5BA4CF] mt-1">To publish tours, ensure your wallet has sufficient balance for escrow. Each tour requires the total guide payout to be held in escrow until completion.</p>
                <a href="/dashboard/operator/wallet" className="text-sm font-medium text-[#2E8BC0] hover:underline mt-2 inline-block">Go to Wallet →</a>
              </div>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </BaseDashboardLayout>
    );
  }

  return (
    <BaseDashboardLayout
      header={
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification</h1>
          <p className="text-sm text-gray-600">Submit documents to verify your operator status.</p>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* KYB Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-lunavia-muted/60 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">🛡️</span>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Why is KYB verification required?</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Know Your Business (KYB) verification confirms your legal status as a tour operator. This protects both you and the guides you work with, enables escrow payments, and is required by Vietnamese tourism regulations.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-lunavia-muted/40 text-lunavia-primary-hover">
                  ✅ Higher trust score
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-lunavia-muted/40 text-lunavia-primary-hover">
                  💰 Escrow access
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-lunavia-muted/40 text-lunavia-primary-hover">
                  📋 Legal compliance
                </span>
              </div>
              <a href="/verification-guide" target="_blank" className="text-sm font-semibold text-lunavia-primary hover:text-blue-800 transition inline-flex items-center gap-1">
                View full verification guide →
              </a>
            </div>
          </div>
        </div>
        {/* 0. Company Logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-6">
          <div className="relative group shrink-0">
            {(session?.user as any)?.avatarUrl ? (
              <img
                src={(session?.user as any).avatarUrl}
                alt="Company Logo"
                className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-lunavia-muted/50 flex items-center justify-center text-3xl font-bold text-[#5BA4CF] border-2 border-white shadow-md">
                {session?.user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <label className={`absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${logoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {logoUploading ? (
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
                disabled={logoUploading}
                onChange={handleLogoUpload}
              />
            </label>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company Logo</h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload your official business logo. This will be displayed on your profile and tour listings.
              <span className="text-xs block mt-1 text-gray-400">Supported: JPG, PNG. Max 5MB.</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Business Information</h3>

          {/* Operator Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator Type <span className="text-red-500">*</span>
            </label>
            <select
              value={operatorType}
              onChange={(e) => setOperatorType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {OPERATOR_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Business Registration */}
          {operatorType !== 'SOLE_PROPRIETOR' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                placeholder="e.g. 0123456789"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Tour Operator License */}
          {operatorType === 'TOUR_OPERATOR' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tour Operator License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tourLicenseNumber}
                onChange={(e) => setTourLicenseNumber(e.target.value)}
                placeholder="e.g. 11/12345"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Uploads - Split by Type */}
        {operatorType !== 'SOLE_PROPRIETOR' && (
          <div className="space-y-4">
            {/* 1. Business Registration */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <DocumentUpload
                label="Business Registration Certificate"
                hint="Upload your company registration document"
                maxFiles={5}
                onDocumentsChange={setBusinessDocs}
              />
            </div>

            {/* 2. Tour License (Only Operator) */}
            {operatorType === 'TOUR_OPERATOR' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <DocumentUpload
                  label="Tour Operator License"
                  hint="Upload your valid Tour Operator License"
                  maxFiles={5}
                  onDocumentsChange={setLicenseDocs}
                />
              </div>
            )}

            {/* 3. Director ID */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <DocumentUpload
                label="Director/Owner ID Document"
                hint="Upload ID card or Passport of the director"
                maxFiles={5}
                onDocumentsChange={setIdDocs}
              />
            </div>
          </div>
        )}

        {/* Sole Proprietor Note */}
        {operatorType === 'SOLE_PROPRIETOR' && (
          <div className="bg-lunavia-light rounded-xl border border-lunavia-muted/40 p-4">
            <p className="text-sm text-blue-800">
              As a Sole Proprietor, you can verify without legal business documents. However, your trust score will start lower than verified companies.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-lg bg-lunavia-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </BaseDashboardLayout>
  );
}

