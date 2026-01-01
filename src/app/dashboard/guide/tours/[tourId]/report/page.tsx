"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { formatVND } from "@/lib/utils";

export default function TourReportPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;

  const [loading, setLoading] = useState(false);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [clientSatisfaction, setClientSatisfaction] = useState<number>(5);
  const [highlights, setHighlights] = useState("");
  const [challenges, setChallenges] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [paymentRequestAmount, setPaymentRequestAmount] = useState("");

  const { data: tour } = useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => api.tours.get(tourId),
  });

  const { data: existingReport, refetch } = useQuery({
    queryKey: ["tourReport", tourId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/tours/${tourId}/reports`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Failed to fetch report");
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        overallRating,
        clientSatisfaction,
        highlights: highlights.trim() || undefined,
        challenges: challenges.trim() || undefined,
        recommendations: recommendations.trim() || undefined,
        paymentRequestAmount: paymentRequestAmount
          ? parseFloat(paymentRequestAmount.replace(/,/g, ""))
          : undefined,
      };

      const response = await fetch(`/api/tours/${tourId}/reports`, {
        method: existingReport ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Lỗi khi gửi báo cáo");
      }

      toast.success(
        existingReport
          ? "Đã cập nhật báo cáo tour"
          : "Đã gửi báo cáo tour thành công"
      );
      refetch();
      router.push(`/tours/${tourId}`);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi gửi báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!confirm("Bạn có chắc muốn yêu cầu thanh toán? Operator sẽ được thông báo.")) {
      return;
    }

    setLoading(true);
    try {
      await api.tours.requestPayment(tourId);
      toast.success("Đã gửi yêu cầu thanh toán");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi yêu cầu thanh toán");
    } finally {
      setLoading(false);
    }
  };

  if (!tour) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </DashboardLayout>
    );
  }

  const canRequestPayment =
    existingReport?.approvedAt &&
    existingReport?.paymentLockedAmount &&
    existingReport?.paymentDueAt &&
    new Date() > new Date(existingReport.paymentDueAt) &&
    existingReport.paymentRequestStatus !== "PENDING";

  return (
    <DashboardLayout>
      <PageHeader
        title="Báo cáo Tour"
        description={`Tour: ${tour.title}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/guide" },
          { label: "Tours", href: "/tours" },
          { label: tour.title, href: `/tours/${tourId}` },
          { label: "Báo cáo" },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Report Status */}
        {existingReport && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Báo cáo đã được gửi
                  </p>
                  <p className="text-sm text-slate-600">
                    Gửi lúc: {new Date(existingReport.submittedAt).toLocaleString("vi-VN")}
                  </p>
                  {existingReport.approvedAt && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        ✓ Tour đã được operator xác nhận
                      </p>
                      <p className="text-sm text-green-700">
                        Số tiền đã khóa: {formatVND(existingReport.paymentLockedAmount || 0)}
                      </p>
                      {existingReport.paymentDueAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Hạn thanh toán: {new Date(existingReport.paymentDueAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  )}
                  {canRequestPayment && (
                    <div className="mt-3">
                      <Button
                        onClick={handleRequestPayment}
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Yêu cầu thanh toán
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="overallRating">
                    Đánh giá tổng thể (1-5)
                  </Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setOverallRating(rating)}
                        className={`w-12 h-12 rounded-lg border-2 transition-colors ${
                          overallRating >= rating
                            ? "bg-amber-400 border-amber-500 text-white"
                            : "bg-white border-slate-300 text-slate-600"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="clientSatisfaction">
                    Mức độ hài lòng của khách (1-5)
                  </Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setClientSatisfaction(rating)}
                        className={`w-12 h-12 rounded-lg border-2 transition-colors ${
                          clientSatisfaction >= rating
                            ? "bg-emerald-400 border-emerald-500 text-white"
                            : "bg-white border-slate-300 text-slate-600"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <Label htmlFor="highlights">Điểm nổi bật</Label>
                <Textarea
                  id="highlights"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Mô tả những điểm nổi bật của tour..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Challenges */}
              <div>
                <Label htmlFor="challenges">Thách thức / Khó khăn</Label>
                <Textarea
                  id="challenges"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Mô tả các thách thức hoặc khó khăn gặp phải..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Recommendations */}
              <div>
                <Label htmlFor="recommendations">Đề xuất cải thiện</Label>
                <Textarea
                  id="recommendations"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Đề xuất các cải thiện cho tour..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Payment Request */}
              <div>
                <Label htmlFor="paymentRequestAmount">
                  Yêu cầu thanh toán (VND) - Tùy chọn
                </Label>
                <Input
                  id="paymentRequestAmount"
                  type="text"
                  value={paymentRequestAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setPaymentRequestAmount(value);
                  }}
                  placeholder="Nhập số tiền yêu cầu thanh toán..."
                  className="mt-1"
                />
                {paymentRequestAmount && (
                  <p className="text-sm text-slate-600 mt-1">
                    {formatVND(parseFloat(paymentRequestAmount.replace(/,/g, "")) || 0)}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading
                    ? "Đang gửi..."
                    : existingReport
                    ? "Cập nhật báo cáo"
                    : "Gửi báo cáo"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}






