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
import { Plus, Calendar, MapPin, DollarSign, Users } from "lucide-react";
import { CreateStandbyRequestDialog } from "@/components/create-standby-request-dialog";
import Link from "next/link";

export default function StandbyRequestsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: standbyRequests, isLoading } = useQuery({
    queryKey: ["standbyRequests", "operator"],
    queryFn: () => api.standby.list(),
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
          description="Quản lý các yêu cầu standby cho tour guides"
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Standby Request
            </Button>
          }
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
            description="Tạo standby request đầu tiên để tìm guide sẵn sàng trong trường hợp khẩn cấp"
            action={
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo Standby Request
              </Button>
            }
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
                          <div className="flex items-center gap-1">
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
                    <div className="flex items-center gap-4 text-sm">
                      {request.mainGuideId && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Main Guide: {request.mainGuideId}
                        </div>
                      )}
                      {request.subGuideId && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Sub Guide: {request.subGuideId}
                        </div>
                      )}
                    </div>
                    <Link href={`/standby-requests/${request.id}`}>
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateStandbyRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["standbyRequests"] });
          setIsCreateDialogOpen(false);
        }}
      />
    </DashboardLayout>
  );
}

