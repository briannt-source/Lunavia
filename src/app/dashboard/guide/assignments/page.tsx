"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, MapPin, Calendar, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function GuideAssignmentsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments", "guide", filters],
    queryFn: async () => {
      const response = await fetch(
        `/api/assignments${filters.status !== "all" ? `?status=${filters.status}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch assignments");
      return response.json();
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await fetch(`/api/assignments/${assignmentId}/accept`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept assignment");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Đã chấp nhận phân công");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi chấp nhận phân công");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ assignmentId, reason }: { assignmentId: string; reason: string }) => {
      const response = await fetch(`/api/assignments/${assignmentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject assignment");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Đã từ chối phân công");
      setRejectingId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi từ chối phân công");
    },
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a: any) => a.status === "PENDING").length,
    approved: assignments.filter((a: any) => a.status === "APPROVED").length,
    rejected: assignments.filter((a: any) => a.status === "REJECTED").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const handleReject = (assignmentId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    rejectMutation.mutate({ assignmentId, reason: rejectReason });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Phân công của tôi"
        description="Xem và quản lý các phân công tour của bạn"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phân công</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
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
              <SelectItem value="APPROVED">Đã chấp nhận</SelectItem>
              <SelectItem value="REJECTED">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phân công ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Chưa có phân công nào"
              description="Bạn sẽ nhận được phân công khi operator assign bạn vào tour"
            />
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment: any) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Link href={`/tours/${assignment.tour.id}`}>
                            <h3 className="text-lg font-semibold text-slate-900 hover:text-teal-600 transition-colors">
                              {assignment.tour.title}
                            </h3>
                          </Link>
                          <StatusBadge status={assignment.status} />
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {assignment.role === "MAIN" ? "HDV chính" : "HDV phụ"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{assignment.tour.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(assignment.tour.startDate)}
                              {assignment.tour.endDate && ` - ${formatDate(assignment.tour.endDate)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              {assignment.role === "MAIN"
                                ? formatVND(assignment.tour.priceMain || 0)
                                : formatVND(assignment.tour.priceSub || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Phân công: {formatDate(assignment.createdAt)}</span>
                          </div>
                        </div>

                        {assignment.tour.operator?.profile?.name && (
                          <p className="text-sm text-slate-500">
                            Tour Operator: {assignment.tour.operator.profile.name}
                          </p>
                        )}

                        {assignment.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Lý do từ chối:</span> {assignment.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/tours/${assignment.tour.id}`}>
                          <Button variant="outline" size="sm">
                            Xem tour
                          </Button>
                        </Link>
                        {assignment.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => acceptMutation.mutate(assignment.id)}
                              disabled={acceptMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectingId(assignment.id)}
                              disabled={rejectMutation.isPending}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Reject Reason Form */}
                    {rejectingId === assignment.id && (
                      <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg">
                        <Label htmlFor="rejectReason" className="text-red-900 font-medium">
                          Lý do từ chối *
                        </Label>
                        <Textarea
                          id="rejectReason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Vui lòng nêu rõ lý do từ chối phân công này..."
                          rows={3}
                          className="mt-2"
                        />
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(assignment.id)}
                            disabled={rejectMutation.isPending || !rejectReason.trim()}
                          >
                            {rejectMutation.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}







