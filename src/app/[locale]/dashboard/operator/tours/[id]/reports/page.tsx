"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ConfirmTourDialog } from "@/components/confirm-tour-dialog";
import toast from "react-hot-toast";

export default function TourReportsPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data: tour } = useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => api.tours.get(tourId),
  });

  const { data: reports = [], refetch } = useQuery({
    queryKey: ["tourReports", tourId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/tours/${tourId}/reports`);
        if (!response.ok) throw new Error("Failed to fetch reports");
        return response.json();
      } catch (error) {
        return [];
      }
    },
  });

  const handleConfirmTour = async (guideId: string, paymentAmount: number, notes?: string) => {
    try {
      await api.tours.confirmTourAndLockPayment(tourId, guideId, {
        paymentAmount,
        notes,
      });
      toast.success("Đã xác nhận tour và khóa số tiền thanh toán");
      setConfirmDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xác nhận tour");
    }
  };

  return (
    <>
      <PageHeader
        title="Báo cáo Tour"
        description={`Tour: ${tour?.title || ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operator" },
          { label: "Tours", href: "/tours" },
          { label: tour?.title || "Tour", href: `/tours/${tourId}` },
          { label: "Báo cáo" },
        ]}
      />

      <div className="space-y-6">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={FileText}
                title="Chưa có báo cáo nào"
                description="Các báo cáo từ hướng dẫn viên sẽ xuất hiện ở đây"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reports.map((report: any) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Báo cáo từ {report.guide?.profile?.name || report.guide?.email}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        Gửi lúc: {formatDate(report.submittedAt)}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        report.approvedAt
                          ? "APPROVED"
                          : report.paymentRequestStatus || "PENDING"
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ratings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Đánh giá tổng thể</p>
                      <p className="text-2xl font-bold">
                        {report.overallRating || "N/A"}
                        {report.overallRating && "/5"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Hài lòng khách hàng</p>
                      <p className="text-2xl font-bold">
                        {report.clientSatisfaction || "N/A"}
                        {report.clientSatisfaction && "/5"}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  {report.highlights && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Điểm nổi bật
                      </p>
                      <p className="text-sm text-slate-600">{report.highlights}</p>
                    </div>
                  )}

                  {report.challenges && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Thách thức
                      </p>
                      <p className="text-sm text-slate-600">{report.challenges}</p>
                    </div>
                  )}

                  {report.recommendations && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Đề xuất
                      </p>
                      <p className="text-sm text-slate-600">{report.recommendations}</p>
                    </div>
                  )}

                  {/* Payment Info */}
                  {report.paymentRequestAmount && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Yêu cầu thanh toán
                          </p>
                          <p className="text-xl font-bold text-blue-700">
                            {formatVND(report.paymentRequestAmount)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  )}

                  {report.paymentLockedAmount && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-1">
                        ✓ Số tiền đã khóa
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {formatVND(report.paymentLockedAmount)}
                      </p>
                      {report.paymentDueAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Hạn thanh toán: {formatDate(report.paymentDueAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {!report.approvedAt && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => {
                          setSelectedReport(report);
                          setConfirmDialogOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Xác nhận tour & Khóa thanh toán
                      </Button>
                    </div>
                  )}

                  {report.approvedAt && report.paymentRequestStatus === "PENDING" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">
                        ⚠️ Hướng dẫn viên đã yêu cầu thanh toán. Vui lòng xử lý trong vòng 24h.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <ConfirmTourDialog
          tourId={tourId}
          guideId={selectedReport.guideId}
          guideName={selectedReport.guide?.profile?.name || selectedReport.guide?.email}
          tourTitle={tour?.title || ""}
          requestedAmount={selectedReport.paymentRequestAmount}
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          onConfirm={handleConfirmTour}
        />
      )}
    </>
  );
}

