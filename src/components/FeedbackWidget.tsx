"use client";
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const CATEGORIES = [
    { value: 'CONFUSING', label: '😕 Confusing' },
    { value: 'BUG', label: '🐛 Bug' },
    { value: 'MISSING_FEATURE', label: '✨ Missing feature' },
    { value: 'UX_UNCLEAR', label: '❓ UX unclear' },
    { value: 'OTHER', label: '💬 Other' },
];

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!category) return;

        setLoading(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    message: message || null,
                    route: pathname,
                }),
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSubmitted(false);
                    setCategory('');
                    setMessage('');
                }, 2000);
            }
        } catch (error) {
            console.error('Feedback error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"
                title="Send feedback"
            >
                💬
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">✅</div>
                                <p className="text-lg font-medium text-green-600">Thank you!</p>
                                <p className="text-sm text-gray-500">Your feedback helps us improve.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">Send Feedback</h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            What kind of feedback? *
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setCategory(cat.value)}
                                                    className={`rounded border p-2 text-sm transition ${category === cat.value
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Details (optional)
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us more..."
                                            rows={3}
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!category || loading}
                                            className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Sending...' : 'Send'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
