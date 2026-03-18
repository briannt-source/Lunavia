'use client';

interface Props {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * components/ai/SuggestionHint.tsx
 * 
 * Non-intrusive operational hints for operators and guides.
 * AI-assisted automation suggestions.
 */
export default function SuggestionHint({ title, description, actionLabel, onAction }: Props) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-lg shadow-inner">
                    ✨
                </span>
                <div>
                    <h4 className="text-sm font-bold text-blue-900">{title}</h4>
                    <p className="mt-0.5 text-xs text-blue-700 leading-relaxed">{description}</p>
                </div>
            </div>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm border border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
