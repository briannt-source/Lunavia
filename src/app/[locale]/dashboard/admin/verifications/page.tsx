import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";
import { Shield, CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import Link from "next/link";

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : role;

  // Only MODERATOR and SUPER_ADMIN can access
  const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";
  if (!isModerator) {
    redirect("/dashboard/admin");
  }

  const params = await searchParams;
  const where: any = {};
  if (params.status && params.status !== "all") {
    where.status = params.status;
  }
  
  // Filter by user role instead of type field
  if (params.type && params.type !== "all") {
    if (params.type === "KYC") {
      where.user = { role: "TOUR_GUIDE" };
    } else if (params.type === "KYB") {
      where.user = { role: { in: ["TOUR_OPERATOR", "TOUR_AGENCY"] } };
    }
  }

  const [verifications, stats] = await Promise.all([
    prisma.verification.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.verification.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusStats = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <PageHeader
        title="Quản lý Xác minh"
        description="Duyệt các yêu cầu xác minh KYC/KYB"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {statusStats["PENDING"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {statusStats["APPROVED"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusStats["REJECTED"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifications.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form method="get" className="flex gap-4">
            <Select name="status" defaultValue={params.status || "all"}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Đang chờ</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select name="type" defaultValue={params.type || "all"}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="KYC">KYC (Guide)</SelectItem>
                <SelectItem value="KYB">KYB (Operator)</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Lọc</Button>
          </form>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách Xác minh ({verifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>Không có yêu cầu xác minh nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification) => (
                <Link
                  key={verification.id}
                  href={`/dashboard/admin/verifications/${verification.id}`}
                  className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {verification.user.profile?.name || verification.user.email}
                        </h3>
                        <StatusBadge status={verification.status} />
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          {verification.user.role === "TOUR_GUIDE" ? "KYC" : "KYB"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                          {verification.user.role.replace(/_/g, " ")}
                        </span>
                        <span>Nộp: {formatDateTime(verification.createdAt)}</span>
                        {verification.status !== "PENDING" && verification.updatedAt && (
                          <span>
                            {verification.status === "APPROVED" ? "Duyệt" : "Từ chối"}: {formatDateTime(verification.updatedAt)}
                          </span>
                        )}
                      </div>
                      {verification.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2">
                          Lý do từ chối: {verification.rejectionReason}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      {verification.status === "PENDING" ? "Xem và duyệt" : "Xem chi tiết"}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}


