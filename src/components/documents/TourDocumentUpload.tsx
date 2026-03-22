'use client';

import { useState, useRef } from 'react';

// ── Tour Document Upload ──────────────────────────────────────────────
// Operator-facing upload section for tour documents

interface TourDocumentUploadProps {
    tourId: string;
    onUploaded: () => void;
}

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'];
const MAX_SIZE_MB = 20;

const FILE_ICONS: Record<string, string> = {
    pdf: '📄', docx: '📝', xlsx: '📊', png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
};

export function TourDocumentUpload({ tourId, onUploaded }: TourDocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [description, setDescription] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    async function handleUpload(file: File) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setError(`File type .${ext} not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File too large. Maximum: ${MAX_SIZE_MB}MB`);
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (description.trim()) formData.append('description', description.trim());
            if (isImportant) formData.append('isImportant', 'true');

            const res = await fetch(`/api/tours/${tourId}/documents`, {
                method: 'POST',
                body: formData,
            });

            const json = await res.json();
            if (res.ok && json.success) {
                setDescription('');
                setIsImportant(false);
                if (fileRef.current) fileRef.current.value = '';
                onUploaded();
            } else {
                setError(json.error || 'Upload failed');
            }
        } catch {
            setError('Network error');
        } finally {
            setUploading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    }

    return (
        <div className="space-y-3">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            {/* Drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${dragOver ? 'border-indigo-400 bg-lunavia-light' :
                        uploading ? 'border-gray-200 bg-gray-50 pointer-events-none opacity-60' :
                            'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="text-3xl mb-2">{uploading ? '⏳' : '📎'}</div>
                <p className="font-medium text-gray-700">
                    {uploading ? 'Uploading...' : 'Drop file here or click to browse'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    PDF, DOCX, XLSX, PNG, JPG — Max {MAX_SIZE_MB}MB
                </p>
            </div>

            {/* Options row */}
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={200}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isImportant}
                        onChange={e => setIsImportant(e.target.checked)}
                        className="rounded border-gray-300 text-[#5BA4CF] focus:ring-indigo-500"
                    />
                    📌 Important
                </label>
            </div>
        </div>
    );
}

export { FILE_ICONS, ALLOWED_EXTENSIONS };
