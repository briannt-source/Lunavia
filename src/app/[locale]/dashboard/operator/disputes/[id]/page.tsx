"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import { Link } from '@/navigation';

const DISPUTE_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-lunavia-muted/50 text-lunavia-primary-hover border-lunavia-primary/40",
  IN_REVIEW: "bg-amber-100 text-amber-700 border-amber-300",
  RESOLVED: "bg-green-100 text-green-700 border-green-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
};

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  PAYMENT: "Payment",
  ASSIGNMENT: "Assignment",
  NO_SHOW: "No Show",
  QUALITY: "Quality",
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.id as string;

  // Fetch dispute details
  const { data: dispute, isLoading } = useQuery({
    queryKey: ["dispute", disputeId],
    queryFn: () => api.disputes.get(disputeId),
  });

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    );
  }

  if (!dispute) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Dispute not found</p>
        </div>
      </>
    );
  }

  const statusColor =
    DISPUTE_STATUS_COLORS[dispute.status] ||
    "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/operator/disputes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Dispute Details</h1>
              <p className="text-gray-500 mt-1">ID: {dispute.id}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${statusColor} border`}>
            {dispute.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Info */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Dispute Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <Badge variant="outline" className="border-indigo-600 text-[#2E8BC0]">
                      {DISPUTE_TYPE_LABELS[dispute.type] || dispute.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <Badge variant="outline" className={`${statusColor} border`}>
                      {dispute.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Created Date</p>
                    <p className="font-medium text-gray-900">
                      {format(
                        new Date(dispute.createdAt || new Date()),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </p>
                  </div>
                  {dispute.resolvedAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Resolution Date</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(dispute.resolvedAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Reason / Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {dispute.description || dispute.reason || "No description"}
                  </p>
                </div>
                {dispute.evidence && dispute.evidence.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Evidence</p>
                    <div className="space-y-2">
                      {dispute.evidence.map((url: string, index: number) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-[#5BA4CF] hover:text-[#2E8BC0] underline"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            {dispute.timeline && dispute.timeline.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dispute.timeline.map((entry: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-lunavia-primary mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {entry.action || entry.status}
                          </p>
                          {entry.details && (
                            <p className="text-sm text-gray-500 mt-1">{entry.details}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(entry.createdAt || new Date()), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tour Info */}
            {dispute.tourId && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Related Tour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/dashboard/operator/tours/${dispute.tourId}`}
                    className="block p-3 rounded-lg bg-gray-50 hover:bg-lunavia-light transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm">
                      {dispute.tour?.title || `Tour ${dispute.tourId}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      View Details tour →
                    </p>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Status Info */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {dispute.status === "PENDING" && (
                      <AlertCircle className="h-4 w-4 text-lunavia-primary" />
                    )}
                    {dispute.status === "IN_REVIEW" && (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    {dispute.status === "RESOLVED" && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {dispute.status === "REJECTED" && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-900">{dispute.status}</span>
                  </div>
                  {dispute.resolution && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Resolution</p>
                      <p className="text-sm text-gray-900">{dispute.resolution}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

