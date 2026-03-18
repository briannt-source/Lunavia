'use client';

import React from 'react';

interface OpsAlert {
    id: string;
    type: 'AUTO_CLOSE' | 'REOPEN' | 'NO_SHOW' | 'DISPUTE' | 'LATE_RETURN' | 'ESCALATION';
    message: string;
    tourId?: string;
    tourTitle?: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
}

export function OpsAlertFeed({ alerts }: { alerts: OpsAlert[] }) {
    if (alerts.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">No active operational alerts.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`p-4 border rounded-xl flex items-start gap-3 transition-all ${alert.severity === 'critical' ? 'bg-red-50 border-red-100' :
                            alert.severity === 'warning' ? 'bg-orange-50 border-orange-100' :
                                'bg-blue-50 border-blue-100'
                        }`}
                >
                    <div className={`mt-1 p-1.5 rounded-full ${alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                            alert.severity === 'warning' ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                        }`}>
                        {alert.severity === 'critical' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : alert.type === 'AUTO_CLOSE' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                                {alert.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className={`text-sm font-medium mt-0.5 ${alert.severity === 'critical' ? 'text-red-900' :
                                alert.severity === 'warning' ? 'text-orange-900' :
                                    'text-blue-900'
                            }`}>
                            {alert.message}
                        </p>
                        {alert.tourTitle && (
                            <div className="mt-2 flex items-center gap-2">
                                <a
                                    href={`/dashboard/operator/request/${alert.tourId}`}
                                    className="text-[11px] font-semibold underline underline-offset-2 opacity-70 hover:opacity-100"
                                >
                                    View Tour: {alert.tourTitle}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
