interface CategoryBadgeProps {
    label: string;
    className?: string;
}

const categoryConfig: Record<string, { bg: string; text: string }> = {
    LUXURY: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
    ADVENTURE: { bg: 'bg-orange-50', text: 'text-orange-600' },
    EDUCATIONAL: { bg: 'bg-blue-50', text: 'text-blue-600' },
    BUDGET: { bg: 'bg-green-50', text: 'text-green-600' },
    CULTURAL: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export default function CategoryBadge({ label, className = '' }: CategoryBadgeProps) {
    const upperLabel = label.toUpperCase();
    const cfg = categoryConfig[upperLabel] || { bg: 'bg-gray-100', text: 'text-gray-600' };

    return (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${cfg.bg} ${cfg.text} ${className}`}>
            {label}
        </span>
    );
}
