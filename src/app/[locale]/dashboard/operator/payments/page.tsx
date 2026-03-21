"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Link } from '@/navigation';

export default function OperatorPaymentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "PENDING" | "APPROVED">("all");

  const { data: paymentRequests = [], refetch } = useQuery({
    queryKey: ["paymentRequests", selectedStatus],
    queryFn: () => api.operator.getPaymentRequests({ status: selectedStatus !== "all" ? selectedStatus : undefined }),
  });

  const handleApprove = async (requestId: string) => {
    try {
      await api.operator.approvePaymentRequest(requestId);
      toast.success("Đã chấp nhận yêu cầu thanh toán");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi chấp nhận");
    }
  };

  const handlePay = async (tourId: string, guideId: string, amount: number) => {
    if (!confirm(`Xác nhận thanh toán ${formatVND(amount)} cho hướng dẫn viên?`)) {
      return;
    }

    try {
      await api.tours.pay(tourId, { guideId, amount });
      toast.success("Đã thanh toán thành công");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi thanh toán");
    }
  };

  const pendingRequests = paymentRequests.filter(
    (r: any) => (r.paymentRequestStatus || r.status) === "PENDING"
  );
  const approvedRequests = paymentRequests.filter(
    (r: any) => (r.paymentRequestStatus || r.status) === "APPROVED"
  );

  return (
    <>
      <PageHeader
        title="Thanh toán"
        description="Quản lý các yêu cầu thanh toán từ hướng dẫn viên"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng yêu cầu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã chấp nhận</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yêu cầu thanh toán</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={selectedStatus === "PENDING" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus("PENDING")}
              >
                Đang chờ
              </Button>
              <Button
                variant={selectedStatus === "APPROVED" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus("APPROVED")}
              >
                Đã chấp nhận
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paymentRequests.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Chưa có yêu cầu thanh toán nào"
              description="Các yêu cầu thanh toán từ hướng dẫn viên sẽ xuất hiện ở đây"
            />
          ) : (
            <div className="space-y-4">
              {paymentRequests.map((request: any) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {request.tour?.title || "N/A"}
                          </h3>
                          <StatusBadge status={request.paymentRequestStatus || request.status} />
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          Hướng dẫn viên: {request.guide?.profile?.name || request.guide?.email}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-slate-900">
                              {formatVND(request.paymentRequestAmount || request.amount || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(request.submittedAt || request.createdAt)}</span>
                          </div>
                        </div>
                        {request.tourReport?.paymentDueAt && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-700">
                              ⚠️ Hạn thanh toán: {formatDate(request.tourReport.paymentDueAt)}
                              {new Date() > new Date(request.tourReport.paymentDueAt) && (
                                <span className="text-red-600 font-medium ml-2">
                                  (Đã quá hạn)
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {(request.paymentRequestStatus || request.status) === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await api.operator.rejectPaymentRequest(request.id);
                                  toast.success("Đã từ chối yêu cầu");
                                  refetch();
                                } catch (error: any) {
                                  toast.error(error.message || "Lỗi khi từ chối");
                                }
                              }}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {(request.paymentRequestStatus || request.status) === "APPROVED" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() =>
                              handlePay(
                                request.tourId,
                                request.guideId,
                                request.paymentRequestAmount || request.amount
                              )
                            }
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Thanh toán
                          </Button>
                        )}
                        <Link href={`/tours/${request.tourId || request.tour?.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Xem tour
                          </Button>
                        </Link>
                      </div>
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
