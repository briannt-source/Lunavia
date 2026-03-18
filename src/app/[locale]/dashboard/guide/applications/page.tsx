"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, MapPin, Calendar, DollarSign, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDate } from "@/lib/utils";
import Link from "next/link";
import { CancelApplicationDialog } from "@/components/cancel-application-dialog";

export default function GuideApplicationsPage() {
  const [filters, setFilters] = useState({
    status: "all",
    role: "all",
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", "guide", filters],
    queryFn: () => api.applications.list({
      status: filters.status !== "all" ? filters.status : undefined,
      role: filters.role !== "all" ? filters.role : undefined,
    }),
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => a.status === "PENDING").length,
    accepted: applications.filter((a: any) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a: any) => a.status === "REJECTED").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  return (
    <>
      <PageHeader
        title="Ứng tuyển của tôi"
        description="Xem và quản lý các ứng tuyển tour của bạn"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ứng tuyển</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã chấp nhận</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[200px]">
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="MAIN">HDV chính</SelectItem>
                <SelectItem value="SUB">HDV phụ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách ứng tuyển ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : applications.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Chưa có ứng tuyển nào"
              description="Bắt đầu tìm và ứng tuyển các tour phù hợp với bạn"
              action={
                <Link href="/tours/browse">
                  <Button>Tìm tour</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {applications.map((application: any) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Link href={`/tours/${application.tour.id}`}>
                            <h3 className="text-lg font-semibold text-slate-900 hover:text-teal-600 transition-colors">
                              {application.tour.title}
                            </h3>
                          </Link>
                          <StatusBadge status={application.status} />
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {application.role === "MAIN" ? "HDV chính" : "HDV phụ"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{application.tour.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(application.tour.startDate)}
                              {application.tour.endDate && ` - ${formatDate(application.tour.endDate)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              {application.role === "MAIN"
                                ? formatVND(application.tour.priceMain || 0)
                                : formatVND(application.tour.priceSub || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Ứng tuyển: {formatDate(application.appliedAt)}</span>
                          </div>
                        </div>

                        {application.coverLetter && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">Thư xin việc:</span> {application.coverLetter}
                            </p>
                          </div>
                        )}

                        {application.tour.operator?.profile?.name && (
                          <p className="text-sm text-slate-500 mt-2">
                            Tour Operator: {application.tour.operator.profile.name}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/tours/${application.tour.id}`}>
                          <Button variant="outline" size="sm">
                            Xem tour
                          </Button>
                        </Link>
                        {application.status === "PENDING" && new Date(application.tour.startDate) > new Date() && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedApplication(application);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Hủy ứng tuyển
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedApplication && (
        <CancelApplicationDialog
          applicationId={selectedApplication.id}
          tourTitle={selectedApplication.tour.title}
          tourStartDate={new Date(selectedApplication.tour.startDate)}
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

