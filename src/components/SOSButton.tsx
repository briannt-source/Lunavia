"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

const SOS_CATEGORIES = [
  { id: 'GUIDE_NO_SHOW', labelKey: 'guideNoShow', icon: '🚨', descKey: 'guideNoShowDesc' },
  { id: 'SAFETY_CONCERN', labelKey: 'safetyConcern', icon: '⚠️', descKey: 'safetyConcernDesc' },
  { id: 'URGENT_OPERATIONAL', labelKey: 'urgentOps', icon: '🔴', descKey: 'urgentOpsDesc' },
  { id: 'OTHER', labelKey: 'other', icon: '📞', descKey: 'otherDesc' },
];

interface SOSModalProps {
  tourId?: string;
  tourTitle?: string;
  onClose: () => void;
}

export function SOSModal({ tourId, tourTitle, onClose }: SOSModalProps) {
  const t = useTranslations("Components.SOSButton");
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedCategory) {
      toast.error('Please select an issue type');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          category: selectedCategory,
          description: description.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit SOS');
      }

      setSubmitted(true);
      toast.success('SOS request sent. Our team will contact you soon.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">SOS Request Received</h2>
          <p className="text-gray-600 mb-6">
            The Lunavia team has been notified and will contact you as soon as possible.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-lunavia-primary px-4 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-red-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🆘</span>
              <div>
                <h2 className="text-lg font-bold text-white">{t("title")}</h2>
                <p className="text-red-100 text-sm">{t("desc")}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {tourTitle && (
            <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Related Tour</p>
              <p className="font-medium text-gray-900">{tourTitle}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select issue type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {SOS_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${selectedCategory === cat.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{cat.id.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the situation so the support team can help faster..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedCategory || submitting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? t("sending") : t("sendSOS")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SOSButton({ tourId, tourTitle }: { tourId?: string; tourTitle?: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 z-40"
      >
        🆘 SOS
      </button>
      {showModal && (
        <SOSModal tourId={tourId} tourTitle={tourTitle} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
