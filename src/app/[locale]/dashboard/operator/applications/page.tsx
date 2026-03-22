"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
import { Link } from '@/navigation';
import toast from "react-hot-toast";

export default function ApplicationsPage() {
  const t = useTranslations("Operator.Applications");
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "all",
    role: "all",
  });

  const { data: tours = [] } = useQuery({
    queryKey: ["tours", "my"],
    queryFn: () => api.tours.my(),
  });

  const openTours = tours.filter((tour: any) => tour.status === "OPEN");
  
  const applicationsResults = useQuery({
    queryKey: ["applications", "all", filters, openTours.map((t: any) => t.id)],
    queryFn: async () => {
      const promises = openTours.map((tour: any) =>
        api.tours.getApplications(tour.id, {
          status: filters.status !== "all" ? filters.status : undefined,
          role: filters.role !== "all" ? filters.role : undefined,
        })
      );
      const results = await Promise.all(promises);
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
      toast.success(t("alerts.approveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch (error: any) {
      toast.error(error.message || t("alerts.approveFailed"));
    }
  };

  const handleReject = async (tourId: string, applicationId: string) => {
    try {
      await api.tours.rejectApplication(tourId, applicationId);
      toast.success(t("alerts.rejectSuccess"));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch (error: any) {
      toast.error(error.message || t("alerts.rejectFailed"));
    }
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
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
            <SelectValue placeholder={t("filters.statusPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
            <SelectItem value="PENDING">{t("filters.pending")}</SelectItem>
            <SelectItem value="ACCEPTED">{t("filters.accepted")}</SelectItem>
            <SelectItem value="REJECTED">{t("filters.rejected")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.role}
          onValueChange={(value) => setFilters({ ...filters, role: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filters.rolePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allRoles")}</SelectItem>
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
              title={t("emptyTitle")}
              description={t("emptyDesc")}
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
                        {t("tour", { name: app.tour?.title })}
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
                          {t("viewProfile")}
                        </Button>
                      </Link>
                      {app.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(app.tourId, app.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t("accept")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(app.tourId, app.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t("reject")}
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
