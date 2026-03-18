import { ReactNode } from 'react';

interface BaseDashboardLayoutProps {
    children: ReactNode;
    header?: ReactNode;
    alertZone?: ReactNode;
    className?: string;
}

/**
 * Base layout wrapper for all dashboard pages.
 * Provides consistent structure with alert zone at top.
 */
export function BaseDashboardLayout({
    children,
    header,
    alertZone,
    className = ''
}: BaseDashboardLayoutProps) {
    return (
        <div className={`space-y-6 ${className}`}>
            {/* Alert Zone - for ActionAlertBanner components */}
            {alertZone && (
                <div className="space-y-3">
                    {alertZone}
                </div>
            )}

            {/* Header */}
            {header}

            {/* Main Content */}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
