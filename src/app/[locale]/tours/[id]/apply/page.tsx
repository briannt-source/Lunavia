"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Link from "next/link";

export default function ApplyToTourPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"MAIN" | "SUB">("MAIN");
  const [coverLetter, setCoverLetter] = useState("");

  // Check user info and verification status
  const { data: userInfo } = useQuery({
    queryKey: ["user", "info"],
    queryFn: () => api.user.info(),
    enabled: !!session,
  });

  const verifiedStatus = userInfo?.verifiedStatus || "NOT_SUBMITTED";
  const needsKYC = verifiedStatus !== "APPROVED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/tours/${params.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          coverLetter,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Failed to apply");
      }

      toast.success("Ứng tuyển thành công!");
      router.push(`/tours/${params.id}`);
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Ứng tuyển Tour"
        description="Gửi đơn ứng tuyển cho tour này"
      />

      {needsKYC && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  {verifiedStatus === "NOT_SUBMITTED"
                    ? "Cần hoàn tất KYC để ứng tuyển"
                    : verifiedStatus === "PENDING"
                    ? "KYC đang chờ duyệt"
                    : "KYC bị từ chối - Vui lòng nộp lại"}
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  {verifiedStatus === "NOT_SUBMITTED"
                    ? "Bạn cần nộp đầy đủ các giấy tờ bắt buộc (hình ảnh thật, CMND/CCCD, thẻ HDV, proof of address) để có thể ứng tuyển vào các tour."
                    : verifiedStatus === "PENDING"
                    ? "KYC của bạn đang được admin xem xét. Vui lòng kiên nhẫn chờ đợi."
                    : "KYC của bạn đã bị từ chối. Vui lòng kiểm tra lại và nộp lại các giấy tờ."}
                </p>
                {verifiedStatus !== "PENDING" && (
                  <Link href="/dashboard/verification/kyc">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      {verifiedStatus === "NOT_SUBMITTED" ? "Nộp KYC ngay" : "Nộp lại KYC"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="container mx-auto px-4 py-8 max-w-2xl">

      <Card>
        <CardHeader>
          <CardTitle>Thông tin ứng tuyển</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò *</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as "MAIN" | "SUB")}
                required
              >
                <option value="MAIN">Main Guide</option>
                <option value="SUB">Sub Guide</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Thư xin việc</Label>
              <textarea
                id="coverLetter"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Giới thiệu về bản thân và kinh nghiệm của bạn..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi ứng tuyển"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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

