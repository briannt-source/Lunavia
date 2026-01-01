"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api-client";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Calendar, MapPin, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function GuideStandbyRequestsPage() {
  const queryClient = useQueryClient();

  const { data: standbyRequests, isLoading } = useQuery({
    queryKey: ["standbyRequests", "guide"],
    queryFn: () => api.standby.list(),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.standby.accept(id),
    onSuccess: () => {
      toast.success("Đã chấp nhận standby request!");
      queryClient.invalidateQueries({ queryKey: ["standbyRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể chấp nhận standby request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.standby.reject(id, reason),
    onSuccess: () => {
      toast.success("Đã từ chối standby request!");
      queryClient.invalidateQueries({ queryKey: ["standbyRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể từ chối standby request");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "yellow";
      case "ACCEPTED":
        return "green";
      case "REJECTED":
        return "red";
      case "COMPLETED":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ phản hồi";
      case "ACCEPTED":
        return "Đã chấp nhận";
      case "REJECTED":
        return "Đã từ chối";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Standby Requests"
          description="Các yêu cầu standby được gửi đến bạn"
        />

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-slate-500">Đang tải...</div>
            </CardContent>
          </Card>
        ) : !standbyRequests || standbyRequests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Chưa có standby request nào"
            description="Bạn sẽ nhận được thông báo khi có operator gửi standby request cho bạn"
          />
        ) : (
          <div className="grid gap-4">
            {standbyRequests.map((request: any) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {request.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(request.requiredDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Budget: {formatCurrency(request.budget)}
                        </div>
                        {request.standbyFee && (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <DollarSign className="h-4 w-4" />
                            Standby Fee: {formatCurrency(request.standbyFee)}
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusBadge
                      status={request.status}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {request.description && (
                    <p className="text-sm text-slate-600 mb-4">{request.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      Từ: {request.operator?.profile?.name || request.operator?.email}
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === "PENDING" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectMutation.mutate({ id: request.id })}
                            disabled={rejectMutation.isPending || acceptMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => acceptMutation.mutate(request.id)}
                            disabled={acceptMutation.isPending || rejectMutation.isPending}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Chấp nhận
                          </Button>
                        </>
                      )}
                      <Link href={`/standby-requests/${request.id}`}>
                        <Button variant="outline" size="sm">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

