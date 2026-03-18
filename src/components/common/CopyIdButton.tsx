"use client";

interface CopyIdButtonProps {
    id: string;
}

export function CopyIdButton({ id }: CopyIdButtonProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(id);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">{id}</span>
            <button
                onClick={handleCopy}
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                title="Use this ID when contacting Lunavia support or partners."
            >
                Copy
            </button>
        </div>
    );
}
