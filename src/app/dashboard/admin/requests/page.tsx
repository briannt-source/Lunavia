"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatVND } from "@/lib/utils";
import { CreditCard, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";

function AdminRequestsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [canAccess, setCanAccess] = useState(false);
  const activeTab = searchParams.get("tab") || "topup";
  const selectedId = searchParams.get("id");

  useEffect(() => {
    const role = (session?.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    setCanAccess(adminRole === "SUPER_ADMIN");
  }, [session]);

  // Fetch top-up requests
  const { data: topUpRequests = [], refetch: refetchTopUps } = useQuery({
    queryKey: ["admin", "topup-requests"],
    queryFn: async () => {
      const response = await fetch("/api/admin/topup-requests");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  // Fetch withdrawal requests
  const { data: withdrawalRequests = [], refetch: refetchWithdrawals } = useQuery({
    queryKey: ["admin", "withdrawal-requests"],
    queryFn: async () => {
      const response = await fetch("/api/admin/withdrawal-requests");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const handleProcessRequest = async (
    requestId: string,
    type: "topup" | "withdrawal",
    action: "approve" | "reject",
    adminNotes?: string
  ) => {
    setProcessingId(requestId);
    try {
      const endpoint =
        type === "topup"
          ? `/api/wallet/topup-requests/${requestId}/process`
          : `/api/wallet/withdrawal-requests/${requestId}/process`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "approve" ? "APPROVE" : "REJECT",
          adminNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process request");
      }

      toast.success(
        action === "approve"
          ? "Yêu cầu đã được duyệt thành công"
          : "Yêu cầu đã bị từ chối"
      );
      refetchTopUps();
      refetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingTopUps = topUpRequests.filter((r: any) => r.status === "PENDING");
  const pendingWithdrawals = withdrawalRequests.filter(
    (r: any) => r.status === "PENDING"
  );

  if (!canAccess) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Chỉ SUPER_ADMIN mới có quyền truy cập trang này</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Quản lý Yêu cầu Tài chính"
        description="Duyệt các yêu cầu nạp tiền và rút tiền (Chỉ SUPER_ADMIN)"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top-up chờ duyệt</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingTopUps.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng: {formatVND(pendingTopUps.reduce((sum: number, r: any) => sum + r.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rút tiền chờ duyệt</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingWithdrawals.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng: {formatVND(pendingWithdrawals.reduce((sum: number, r: any) => sum + r.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="topup" className="flex-1">
                Top-up ({pendingTopUps.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawal" className="flex-1">
                Rút tiền ({pendingWithdrawals.length})
              </TabsTrigger>
            </TabsList>

            {/* Top-up Requests */}
            <TabsContent value="topup" className="p-6">
              {topUpRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>Không có yêu cầu nạp tiền nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topUpRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className={`p-4 border rounded-lg ${
                        selectedId === request.id ? "border-teal-500 bg-teal-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {request.user?.profile?.name || request.user?.email}
                            </h3>
                            <StatusBadge status={request.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="text-lg font-bold text-teal-600">
                              {formatVND(request.amount)}
                            </span>
                            <span>Phương thức: {request.method}</span>
                            <span>Tạo: {formatDateTime(request.createdAt)}</span>
                          </div>
                          {request.adminNotes && (
                            <p className="text-sm text-slate-500 mt-2">
                              Ghi chú: {request.adminNotes}
                            </p>
                          )}
                        </div>
                        {request.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleProcessRequest(request.id, "topup", "approve")
                              }
                              disabled={processingId === request.id}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleProcessRequest(request.id, "topup", "reject")
                              }
                              disabled={processingId === request.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Withdrawal Requests */}
            <TabsContent value="withdrawal" className="p-6">
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>Không có yêu cầu rút tiền nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className={`p-4 border rounded-lg ${
                        selectedId === request.id ? "border-red-500 bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {request.user?.profile?.name || request.user?.email}
                            </h3>
                            <StatusBadge status={request.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="text-lg font-bold text-red-600">
                              {formatVND(request.amount)}
                            </span>
                            <span>Phương thức: {request.method}</span>
                            <span>Tạo: {formatDateTime(request.createdAt)}</span>
                          </div>
                          {request.accountInfo && (
                            <p className="text-sm text-slate-500 mt-2">
                              Thông tin tài khoản: {request.accountInfo}
                            </p>
                          )}
                          {request.adminNotes && (
                            <p className="text-sm text-slate-500 mt-2">
                              Ghi chú: {request.adminNotes}
                            </p>
                          )}
                        </div>
                        {request.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleProcessRequest(request.id, "withdrawal", "approve")
                              }
                              disabled={processingId === request.id}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleProcessRequest(request.id, "withdrawal", "reject")
                              }
                              disabled={processingId === request.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="text-center py-12">Đang tải...</div>
      </DashboardLayout>
    }>
      <AdminRequestsContent />
    </Suspense>
  );
}


