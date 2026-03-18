"use client";
import { useState } from 'react';
import { FEEDBACK_TAGS } from '@/lib/feedback';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourId: string;
    role: 'TOUR_OPERATOR' | 'TOUR_GUIDE';
    onSuccess: () => void;
}

const TAGS_BY_ROLE = FEEDBACK_TAGS;

export default function FeedbackModal({ isOpen, onClose, tourId, role, onSuccess }: FeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const availableTags = TAGS_BY_ROLE[role] || [];

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter(t => t !== tagId));
        } else {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please provide a rating');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId,
                    rating,
                    tags: selectedTags,
                    comment
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
                // Reset state
                setRating(0);
                setSelectedTags([]);
                setComment('');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to submit feedback');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900">
                    How did this tour go?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Your feedback helps us improve the Lunavia operational standard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-3xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'
                                    }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    {/* Tags */}
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">Highlights / Issues</p>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${selectedTags.includes(tag.id)
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                            rows={3}
                            placeholder="Any specific details..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                        />
                        <div className="mt-1 text-right text-xs text-gray-400">
                            {comment.length}/500
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 from-neutral-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
