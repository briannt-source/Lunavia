'use client';

interface Evidence {
    id: string;
    uploadedBy: string;
    type: string;
    fileUrl: string | null;
    message: string | null;
    createdAt: string;
}

interface Props {
    evidence: Evidence[];
    className?: string;
}

const TYPE_ICONS: Record<string, { icon: string; label: string; color: string }> = {
    PHOTO: { icon: '📷', label: 'Photo', color: 'bg-lunavia-light text-lunavia-primary-hover border-lunavia-muted/60' },
    DOCUMENT: { icon: '📄', label: 'Document', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    CHAT: { icon: '💬', label: 'Chat Log', color: 'bg-green-50 text-green-700 border-green-200' },
    NOTE: { icon: '📝', label: 'Note', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function DisputeEvidenceViewer({ evidence, className = '' }: Props) {
    if (evidence.length === 0) {
        return (
            <div className={`bg-gray-50 rounded-xl border border-gray-100 p-8 text-center ${className}`}>
                <div className="text-2xl mb-2">📁</div>
                <p className="text-sm text-gray-500">No evidence submitted yet.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Evidence Timeline</h4>
            <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                {evidence.map((e, i) => {
                    const typeInfo = TYPE_ICONS[e.type] || { icon: '📎', label: e.type, color: 'bg-gray-50 text-gray-700 border-gray-200' };
                    return (
                        <div key={e.id} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute -left-[1.6rem] top-1 w-3 h-3 rounded-full bg-white border-2 border-indigo-400" />

                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${typeInfo.color}`}>
                                        {typeInfo.icon} {typeInfo.label}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(e.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {e.message && (
                                    <p className="text-sm text-gray-700">{e.message}</p>
                                )}
                                {e.fileUrl && (
                                    <a
                                        href={e.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-xs text-[#5BA4CF] font-medium hover:text-[#2E8BC0] transition"
                                    >
                                        📎 View Attachment
                                    </a>
                                )}
                                <div className="text-xs text-gray-400 mt-2">
                                    By: {e.uploadedBy.slice(0, 8)}…
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
