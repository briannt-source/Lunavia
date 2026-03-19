"use client";
import React, { useState } from 'react';
import OperatorCard from '@/components/users/OperatorCard';
import GuideCard from '@/components/users/GuideCard';
import { CancelTourModal } from '@/components/tour/CancelTourModal';

interface ServiceViewProps {
    data: {
        request: any;
        operator: any;
        assignedGuide: any;
    };
    viewerRole: string;
}

export default function ServiceView({ data, viewerRole }: ServiceViewProps) {
    const { request, operator, assignedGuide } = data;
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);

    const canCancel = (
        (viewerRole === 'TOUR_OPERATOR' && request.operatorId === data.operator?.id) || // Verify logic elsewhere too but UI check
        (viewerRole === 'TOUR_GUIDE' && request.assignedGuideId === data.assignedGuide?.id)
    ) && ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'OFFERED'].includes(request.status);

    return (
        <div className="space-y-6">
            <CancelTourModal
                tourId={request.id}
                tourTitle={request.title}
                isOpen={isCancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                role={viewerRole as any}
            />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                request.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'}`}>
                            {request.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-gray-500 mt-2">{request.location} • {new Date(request.startDate).toLocaleDateString()}</p>
                </div>
                {canCancel && (
                    <button
                        onClick={() => setCancelModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                    >
                        {viewerRole === 'TOUR_GUIDE' ? 'Withdraw / Cancel' : 'Cancel Tour'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Tour Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Date & Time */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Start Time</p>
                                <p className="font-medium">{new Date(request.startDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">End Time</p>
                                <p className="font-medium">{new Date(request.endDate).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About this Tour</h3>
                        <div className="prose max-w-none text-gray-600">
                            <p>{request.description || "No description provided."}</p>
                        </div>

                        {request.itinerary && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Itinerary</h4>
                                <div className="prose max-w-none text-gray-600">
                                    {request.itinerary}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Requirements */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium">Language:</span> {request.language || 'Any'}</p>
                            <p><span className="font-medium">Province:</span> {request.province || 'Any'}</p>
                            {request.rolesNeeded && request.rolesNeeded.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-medium">Roles Needed:</p>
                                    <ul className="list-disc pl-5">
                                        {request.rolesNeeded.map((r: any, i: number) => (
                                            <li key={i}>
                                                {r.role.replace('_', ' ')} (x{r.quantity})
                                                {r.rate ? <span className="text-gray-500"> - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: request.currency || 'VND' }).format(r.rate)} / pax</span> : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Partner Info */}
                <div className="space-y-6">
                    {/* If Viewer is Guide -> Show Operator Card */}
                    {(viewerRole === 'TOUR_GUIDE' || viewerRole === 'ADMIN') && operator && (
                        <OperatorCard operator={operator} />
                    )}

                    {/* If Viewer is Operator -> Show Guide Card (if assigned) */}
                    {(viewerRole === 'TOUR_OPERATOR' || viewerRole === 'ADMIN') && assignedGuide && (
                        <GuideCard guide={assignedGuide} />
                    )}

                    {/* Map Placeholder or Instructions */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                        <p className="text-sm text-blue-700">
                            {viewerRole === 'TOUR_GUIDE' ?
                                "Review the Operator's trust score before applying. Ensure you meet all requirements." :
                                "Check the Guide's verification status before assigning."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
