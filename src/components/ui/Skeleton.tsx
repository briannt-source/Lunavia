interface SkeletonProps {
    className?: string;
    animate?: boolean;
}

export default function Skeleton({ className, animate = true }: SkeletonProps) {
    // Governance rule: Lunavia uses light mode only
    const animationClass = animate ? 'animate-shimmer' : 'bg-gray-200';
    return (
        <div
            className={`rounded ${animationClass} ${className}`}
            aria-hidden="true"
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-3 w-[40%]" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}

