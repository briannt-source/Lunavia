"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatVND } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function DisputeDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const disputeId = params.id as string;
  const queryClient = useQueryClient();

  const [resolution, setResolution] = useState("");
  const [amountRefunded, setAmountRefunded] = useState("");
  const [action, setAction] = useState<"resolve" | "reject" | "assign">("resolve");
  const [processing, setProcessing] = useState(false);

  // Fetch dispute details
  const { data: dispute, isLoading } = useQuery({
    queryKey: ["admin", "dispute", disputeId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/disputes/${disputeId}`);
      if (!response.ok) throw new Error("Failed to fetch dispute");
      return response.json();
    },
  });

  // Process dispute mutation
  const processMutation = useMutation({
    mutationFn: async (data: {
      action: string;
      resolution?: string;
      amountRefunded?: number;
    }) => {
      const response = await fetch(`/api/admin/disputes/${disputeId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process dispute");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Xử lý dispute thành công");
      queryClient.invalidateQueries({ queryKey: ["admin", "dispute", disputeId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      router.push("/dashboard/admin/disputes");
    },
    onError: (error: any) => {
      toast.error(error.message || "Đã có lỗi xảy ra");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await processMutation.mutateAsync({
        action,
        resolution: resolution || undefined,
        amountRefunded: amountRefunded ? parseFloat(amountRefunded) : undefined,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!dispute) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Không tìm thấy dispute</p>
          <Link href="/dashboard/admin/disputes">
            <Button variant="outline" className="mt-4">
              Quay lại
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Chi tiết Dispute"
        description={`ID: ${dispute.id}`}
        action={
          <Link href="/dashboard/admin/disputes">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Thông tin Dispute</CardTitle>
                <StatusBadge status={dispute.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-500">Loại</Label>
                <p className="mt-1 font-semibold">{dispute.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Mô tả</Label>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap">{dispute.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Người tạo</Label>
                <p className="mt-1">
                  {dispute.user?.profile?.name || dispute.user?.email}
                </p>
                <p className="text-sm text-slate-500">
                  {dispute.user?.role.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Thời gian</Label>
                <p className="mt-1">{formatDateTime(dispute.createdAt)}</p>
              </div>
              {dispute.resolvedAt && (
                <div>
                  <Label className="text-sm font-medium text-slate-500">Giải quyết lúc</Label>
                  <p className="mt-1">{formatDateTime(dispute.resolvedAt)}</p>
                </div>
              )}
              {dispute.resolutionAmount && (
                <div>
                  <Label className="text-sm font-medium text-slate-500">Số tiền hoàn</Label>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {formatVND(dispute.resolutionAmount || 0)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence */}
          {dispute.evidence && dispute.evidence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bằng chứng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {dispute.evidence.map((url: string, index: number) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video border rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resolution Form */}
          {(dispute.status === "PENDING" || dispute.status === "IN_REVIEW") && (
            <Card>
              <CardHeader>
                <CardTitle>Xử lý Dispute</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Hành động</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="action"
                          value="resolve"
                          checked={action === "resolve"}
                          onChange={(e) => setAction(e.target.value as any)}
                        />
                        <span>Giải quyết</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="action"
                          value="reject"
                          checked={action === "reject"}
                          onChange={(e) => setAction(e.target.value as any)}
                        />
                        <span>Từ chối</span>
                      </label>
                    </div>
                  </div>

                  {action === "resolve" && (
                    <>
                      <div>
                        <Label htmlFor="amountRefunded">Số tiền hoàn (VND)</Label>
                        <Input
                          id="amountRefunded"
                          type="number"
                          value={amountRefunded}
                          onChange={(e) => setAmountRefunded(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="resolution">
                      {action === "resolve" ? "Giải pháp" : "Lý do từ chối"}
                    </Label>
                    <Textarea
                      id="resolution"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder={
                        action === "resolve"
                          ? "Mô tả giải pháp..."
                          : "Lý do từ chối..."
                      }
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? "Đang xử lý..." : action === "resolve" ? "Giải quyết" : "Từ chối"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Resolution Display */}
          {dispute.status === "RESOLVED" && dispute.resolution && (
            <Card>
              <CardHeader>
                <CardTitle>Giải pháp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{dispute.resolution}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={dispute.status} />
              {dispute.assignedTo && (
                <p className="text-sm text-slate-500 mt-2">
                  Được giao cho: {dispute.adminUser?.email || "N/A"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}






