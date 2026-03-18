"use client";
import { useState, useEffect } from 'react';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface Submission {
  id: string;
  userId: string;
  userEmail: string;
  type: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  reviewNotes: string | null;
  reviewedByEmail: string | null;
  documents: Document[];
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function AdminVerificationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      const res = await fetch('/api/admin/verification/submissions');
      const data = await res.json();
      if (data.items) {
        setSubmissions(data.items);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(submissionId: string, updatedMeta?: any) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verification/${submissionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: reviewNotes,
          updatedMeta
        }),
      });
      if (res.ok) {
        fetchSubmissions();
        setSelectedSubmission(null);
        setReviewNotes('');
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(submissionId: string) {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verification/${submissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason, notes: reviewNotes }),
      });
      if (res.ok) {
        fetchSubmissions();
        setSelectedSubmission(null);
        setShowRejectModal(false);
        setRejectReason('');
        setReviewNotes('');
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Verification Submissions</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve user verification documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {submissions.filter(s => s.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-semibold text-green-600">
            {submissions.filter(s => s.status === 'APPROVED').length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-semibold text-red-600">
            {submissions.filter(s => s.status === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No verification submissions yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{sub.userEmail}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sub.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sub.documents.length} files</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusConfig[sub.status]?.bg || 'bg-gray-100'} ${statusConfig[sub.status]?.text || 'text-gray-600'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Review Submission</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {selectedSubmission.userEmail[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{selectedSubmission.userEmail}</p>
                    {(selectedSubmission as any).trustScore !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(selectedSubmission as any).trustScore >= 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        Trust: {(selectedSubmission as any).trustScore}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4 mt-1">
                    <span>{(selectedSubmission as any).userName || 'No Name'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{(selectedSubmission as any).userPhone || 'No Phone'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{selectedSubmission.type}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                <div className="space-y-2">
                  {selectedSubmission.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          {doc.mimeType === 'application/pdf' ? (
                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <a
                        href={`/api/admin/verification/document/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata Edit Section (Admin Phase 5) */}
              {selectedSubmission.status === 'PENDING' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Review & Edit Details</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {(selectedSubmission as any).documentMeta?.operatorType ? 'Operator' : 'Guide'} Data
                    </span>
                  </div>

                  {/* Operator Fields */}
                  {(selectedSubmission as any).documentMeta?.operatorType && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Operator Type</label>
                        <select
                          className="w-full rounded border-gray-300 text-sm"
                          defaultValue={(selectedSubmission as any).documentMeta.operatorType}
                          id="edit-operator-type"
                        >
                          <option value="TOUR_OPERATOR">Tour Operator (Full)</option>
                          <option value="TRAVEL_AGENCY">Travel Agency</option>
                          <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reg Number</label>
                        <input
                          type="text"
                          className="w-full rounded border-gray-300 text-sm"
                          defaultValue={(selectedSubmission as any).documentMeta.businessRegistrationNumber}
                          id="edit-reg-num"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">TAT License</label>
                        <input
                          type="text"
                          className="w-full rounded border-gray-300 text-sm"
                          defaultValue={(selectedSubmission as any).documentMeta.tourLicenseNumber}
                          id="edit-license-num"
                        />
                      </div>
                    </div>
                  )}

                  {/* Guide Fields (if guideType present) */}
                  {(selectedSubmission as any).documentMeta?.guideType && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Guide Type</label>
                        <select
                          className="w-full rounded border-gray-300 text-sm"
                          defaultValue={(selectedSubmission as any).documentMeta.guideType}
                          id="edit-guide-type"
                        >
                          <option value="LICENSE_GUIDE">Licensed Guide</option>
                          <option value="INTERN">Intern</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          className="w-full rounded border-gray-300 text-sm"
                          defaultValue={(selectedSubmission as any).documentMeta.guideCardNumber}
                          id="edit-card-num"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Notes */}
              {selectedSubmission.status === 'PENDING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes (optional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Add internal notes for this review..."
                  />
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="flex-1 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      // Capture edited values
                      const updatedMeta: any = {};
                      const opTypeEl = document.getElementById('edit-operator-type') as HTMLSelectElement;
                      if (opTypeEl) {
                        updatedMeta.operatorType = opTypeEl.value;
                        updatedMeta.businessRegistrationNumber = (document.getElementById('edit-reg-num') as HTMLInputElement).value;
                        updatedMeta.tourLicenseNumber = (document.getElementById('edit-license-num') as HTMLInputElement).value;
                      }
                      const guideTypeEl = document.getElementById('edit-guide-type') as HTMLSelectElement;
                      if (guideTypeEl) {
                        updatedMeta.guideType = guideTypeEl.value;
                        updatedMeta.guideCardNumber = (document.getElementById('edit-card-num') as HTMLInputElement).value;
                      }
                      handleApprove(selectedSubmission.id, updatedMeta);
                    }}
                    disabled={actionLoading}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve & Save'}
                  </button>
                </div>
              )}

              {/* Already processed */}
              {selectedSubmission.status !== 'PENDING' && (
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg ${selectedSubmission.status === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-sm font-medium ${selectedSubmission.status === 'APPROVED' ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedSubmission.status === 'APPROVED' ? 'This submission has been approved' : 'This submission was rejected'}
                    </p>
                    {selectedSubmission.rejectReason && (
                      <p className="mt-1 text-sm text-red-600">Reason: {selectedSubmission.rejectReason}</p>
                    )}
                    {selectedSubmission.reviewedAt && (
                      <p className="mt-1 text-xs text-gray-500">Reviewed: {new Date(selectedSubmission.reviewedAt).toLocaleString()}</p>
                    )}
                  </div>
                  {selectedSubmission.reviewNotes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-600 text-xs font-semibold uppercase">📝 Internal Notes</span>
                        {selectedSubmission.reviewedByEmail && (
                          <span className="text-xs text-gray-500">by {selectedSubmission.reviewedByEmail}</span>
                        )}
                      </div>
                      <p className="text-sm text-amber-900 whitespace-pre-wrap">{selectedSubmission.reviewNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Submission</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Explain why this submission is being rejected..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedSubmission.id)}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
