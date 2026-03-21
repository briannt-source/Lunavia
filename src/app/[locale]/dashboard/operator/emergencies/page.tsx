"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Clock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from '@/navigation';

export default function EmergenciesPage() {
  const { data: emergencies = [], isLoading } = useQuery({
    queryKey: ["allEmergencies"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/operator/emergencies");
        if (!response.ok) throw new Error("Failed to fetch emergencies");
        return response.json();
      } catch (error) {
        return [];
      }
    },
  });

  const criticalCount = emergencies.filter(
    (e: any) => e.severity === "CRITICAL" && e.status === "PENDING"
  ).length;
  const pendingCount = emergencies.filter(
    (e: any) => e.status === "PENDING"
  ).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <>
      <PageHeader
        title="Báo cáo SOS / Sự cố"
        description="Quản lý các báo cáo SOS từ hướng dẫn viên"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số báo cáo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emergencies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nghiêm trọng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Emergencies List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Đang tải...</p>
            </div>
          ) : emergencies.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="Chưa có báo cáo SOS nào"
              description="Các báo cáo SOS từ hướng dẫn viên sẽ xuất hiện ở đây"
            />
          ) : (
            <div className="space-y-4">
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
                  <CardContent className="pt-6">
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
                                : "text-blue-600"
                            }`}
                          />
                          <h3 className="font-semibold text-slate-900">
                            {emergency.type}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(
                              emergency.severity
                            )}`}
                          >
                            {emergency.severity}
                          </span>
                          <StatusBadge status={emergency.status} />
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          Tour: {emergency.tour?.title || "N/A"}
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                          Từ: {emergency.guide?.profile?.name || emergency.guide?.email}
                        </p>
                        <p className="text-sm text-slate-700 line-clamp-2">
                          {emergency.description}
                        </p>
                        {emergency.location && (
                          <div className="flex items-center gap-1 text-sm text-slate-600 mt-2">
                            <MapPin className="h-3 w-3" />
                            <span>{emergency.location}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDate(emergency.createdAt)}
                        </p>
                      </div>
                      <Link href={`/dashboard/operator/tours/${emergency.tourId}/emergencies`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}






