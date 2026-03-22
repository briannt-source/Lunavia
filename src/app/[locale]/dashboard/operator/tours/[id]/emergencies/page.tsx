"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Link } from '@/navigation';

export default function TourEmergenciesPage() {
  const params = useParams();
  const tourId = params.id as string;

  const { data: tour } = useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => api.tours.get(tourId),
  });

  const { data: emergencies = [] } = useQuery({
    queryKey: ["emergencies", tourId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/tours/${tourId}/emergencies`);
        if (!response.ok) throw new Error("Failed to fetch emergencies");
        return response.json();
      } catch (error) {
        return [];
      }
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "LOW":
        return "bg-lunavia-muted/50 text-blue-800 border-lunavia-primary/40";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <>
      <PageHeader
        title="SOS / Incident Reports"
        description={`Tour: ${tour?.title || ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operator" },
          { label: "Tours", href: "/tours" },
          { label: tour?.title || "Tour", href: `/tours/${tourId}` },
          { label: "SOS Reports" },
        ]}
      />

      <div className="space-y-6">
        {emergencies.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={AlertTriangle}
                title="No SOS reports yet"
                description="SOS reports from guides will appear here"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {emergencies.map((emergency: any) => (
              <Card
                key={emergency.id}
                className={`border-l-4 ${
                  emergency.severity === "CRITICAL"
                    ? "border-l-red-500"
                    : emergency.severity === "HIGH"
                    ? "border-l-orange-500"
                    : emergency.severity === "MEDIUM"
                    ? "border-l-amber-500"
                    : "border-l-blue-500"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            emergency.severity === "CRITICAL"
                              ? "text-red-600"
                              : emergency.severity === "HIGH"
                              ? "text-orange-600"
                              : emergency.severity === "MEDIUM"
                              ? "text-amber-600"
                              : "text-lunavia-primary"
                          }`}
                        />
                        <CardTitle>{emergency.type}</CardTitle>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(
                            emergency.severity
                          )}`}
                        >
                          {emergency.severity}
                        </span>
                        <StatusBadge status={emergency.status} />
                      </div>
                      <p className="text-sm text-slate-600">
                        From: {emergency.guide?.profile?.name || emergency.guide?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(emergency.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Description
                    </p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {emergency.description}
                    </p>
                  </div>

                  {emergency.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          Location
                        </p>
                        <p className="text-sm text-slate-600">{emergency.location}</p>
                      </div>
                    </div>
                  )}

                  {emergency.operatorResponse && (
                    <div className="p-3 bg-lunavia-light border border-lunavia-muted/60 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Your Response
                      </p>
                      <p className="text-sm text-lunavia-primary-hover whitespace-pre-wrap">
                        {emergency.operatorResponse}
                      </p>
                    </div>
                  )}

                  {emergency.status === "PENDING" && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Are you sure you want to mark this report as resolved?"
                            )
                          ) {
                            return;
                          }
                          try {
                            const response = await fetch(
                              `/api/tours/${tourId}/emergencies/${emergency.id}/acknowledge`,
                              { method: "POST" }
                            );
                            if (!response.ok) throw new Error("Failed to acknowledge");
                            window.location.reload();
                          } catch (error: any) {
                            alert(error.message || "Error processing");
                          }
                        }}
                      >
                        Mark as Processed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}






