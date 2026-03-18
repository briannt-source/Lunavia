"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, CheckCircle2, XCircle, Eye } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "all",
    role: "all",
  });

  const { data: tours = [] } = useQuery({
    queryKey: ["tours", "my"],
    queryFn: () => api.tours.my(),
  });

  // Fetch all applications for all tours in parallel using useQueries
  const openTours = tours.filter((tour: any) => tour.status === "OPEN");
  
  // Use useQueries to fetch applications for all open tours
  const applicationsResults = useQuery({
    queryKey: ["applications", "all", filters, openTours.map((t: any) => t.id)],
    queryFn: async () => {
      // Fetch applications for all open tours in parallel
      const promises = openTours.map((tour: any) =>
        api.tours.getApplications(tour.id, {
          status: filters.status !== "all" ? filters.status : undefined,
          role: filters.role !== "all" ? filters.role : undefined,
        })
      );
      const results = await Promise.all(promises);
      // Flatten and add tourId to each application
      return results.flatMap((apps: any[], index: number) =>
        (apps || []).map((app: any) => ({
          ...app,
          tourId: openTours[index].id,
        }))
      );
    },
    enabled: openTours.length > 0,
  });

  const allApplications = applicationsResults.data || [];

  const handleAccept = async (tourId: string, applicationId: string) => {
    try {
      await api.tours.acceptApplication(tourId, applicationId);
      toast.success("Đã chấp nhận ứng tuyển");
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi chấp nhận");
    }
  };

  const handleReject = async (tourId: string, applicationId: string) => {
    try {
      await api.tours.rejectApplication(tourId, applicationId);
      toast.success("Đã từ chối ứng tuyển");
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi từ chối");
    }
  };

  return (
    <>
      <PageHeader
        title="Quản lý Ứng tuyển"
        description="Xem và quản lý các ứng tuyển cho tours của bạn"
      />

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Đang chờ</SelectItem>
            <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
            <SelectItem value="REJECTED">Đã từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.role}
          onValueChange={(value) => setFilters({ ...filters, role: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="MAIN">Main Guide</SelectItem>
            <SelectItem value="SUB">Sub Guide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <Card>
        <CardContent className="p-6">
          {allApplications.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Chưa có ứng tuyển nào"
              description="Các ứng tuyển sẽ xuất hiện ở đây khi guides apply vào tours của bạn"
            />
          ) : (
            <div className="space-y-4">
              {allApplications.map((app: any) => (
                <div
                  key={app.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {app.guide?.profile?.name || app.guide?.email}
                        </h3>
                        <StatusBadge status={app.status} />
                        <StatusBadge
                          status={app.role}
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        />
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Tour: {app.tour?.title}
                      </p>
                      {app.coverLetter && (
                        <p className="text-sm text-slate-500 mb-2">
                          {app.coverLetter}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {formatDateTime(app.appliedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/guides/${app.guideId}/profile`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Xem Profile
                        </Button>
                      </Link>
                      {app.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleAccept(app.tourId, app.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(app.tourId, app.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

