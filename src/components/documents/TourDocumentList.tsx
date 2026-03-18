'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Tour Document List ────────────────────────────────────────────────
// Displays documents for both operators (with delete/toggle) and guides (read-only)

interface DocumentData {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    description: string | null;
    isImportant: boolean;
    createdAt: string;
    uploader: { email: string };
}

interface TourDocumentListProps {
    tourId: string;
    canManage: boolean; // true for operator, false for guide
    refreshKey?: number; // increment to trigger refresh
}

const FILE_ICONS: Record<string, string> = {
    PDF: '📄', DOCX: '📝', XLSX: '📊', PNG: '🖼️', JPG: '🖼️', JPEG: '🖼️',
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function isPreviewable(fileType: string): boolean {
    return ['PDF', 'PNG', 'JPG', 'JPEG'].includes(fileType);
}

export function TourDocumentList({ tourId, canManage, refreshKey }: TourDocumentListProps) {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchDocuments = useCallback(async () => {
        try {
            const res = await fetch(`/api/tours/${tourId}/documents`);
            const json = await res.json();
            if (json.success) {
                setDocuments(json.data.documents);
            } else {
                setError(json.error || 'Failed to load');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [tourId]);

    useEffect(() => { fetchDocuments(); }, [fetchDocuments, refreshKey]);

    async function handleDelete(docId: string) {
        if (!confirm('Delete this document?')) return;
        setDeletingId(docId);
        try {
            const res = await fetch(`/api/tours/documents/${docId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                setDocuments(prev => prev.filter(d => d.id !== docId));
            } else {
                alert(json.error || 'Delete failed');
            }
        } catch {
            alert('Network error');
        } finally {
            setDeletingId(null);
        }
    }

    async function handleToggleImportant(docId: string) {
        try {
            const res = await fetch(`/api/tours/documents/${docId}`, { method: 'PATCH' });
            const json = await res.json();
            if (json.success) {
                setDocuments(prev => prev.map(d =>
                    d.id === docId ? { ...d, isImportant: !d.isImportant } : d
                ));
            }
        } catch {
            // silent fail
        }
    }

    if (loading) {
        return (
            <div className="py-8 text-center text-gray-500 animate-pulse">
                Loading documents...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6 text-center">
                <div className="text-red-500 text-sm">{error}</div>
                <button onClick={fetchDocuments} className="text-indigo-600 text-sm mt-2 underline">Retry</button>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">
                <div className="text-3xl mb-2">📂</div>
                <p className="font-medium">No documents yet</p>
                <p className="text-sm">{canManage ? 'Upload documents for your guides.' : 'No documents have been shared for this tour.'}</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                {documents.map(doc => {
                    const icon = FILE_ICONS[doc.fileType] || '📎';
                    const canPreview = isPreviewable(doc.fileType);

                    return (
                        <div
                            key={doc.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition ${doc.isImportant
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {/* Icon */}
                            <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-900 truncate">{doc.fileName}</span>
                                    {doc.isImportant && (
                                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded font-semibold uppercase">Important</span>
                                    )}
                                </div>
                                {doc.description && (
                                    <p className="text-xs text-gray-600 mt-0.5">{doc.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                    <span>{doc.fileType}</span>
                                    <span>•</span>
                                    <span>{formatFileSize(doc.fileSize)}</span>
                                    <span>•</span>
                                    <span>{formatDate(doc.createdAt)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {canPreview && (
                                    <button
                                        onClick={() => setPreviewUrl(doc.fileUrl)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                        title="Preview"
                                    >
                                        👁️
                                    </button>
                                )}
                                <a
                                    href={doc.fileUrl}
                                    download={doc.fileName}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                                    title="Download"
                                >
                                    ⬇️
                                </a>
                                {canManage && (
                                    <>
                                        <button
                                            onClick={() => handleToggleImportant(doc.id)}
                                            className={`p-1.5 rounded-lg transition ${doc.isImportant ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                                                }`}
                                            title={doc.isImportant ? 'Unmark important' : 'Mark as important'}
                                        >
                                            📌
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            disabled={deletingId === doc.id}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Document Preview</h3>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {previewUrl.endsWith('.pdf') || previewUrl.includes('.pdf') ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-[70vh] rounded-lg border border-gray-200"
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Document preview"
                                    className="max-w-full max-h-[70vh] mx-auto rounded-lg border border-gray-200"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
