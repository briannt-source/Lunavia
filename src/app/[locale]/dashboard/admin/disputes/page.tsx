import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatVND } from "@/lib/utils";
import { AlertTriangle, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { Link } from '@/navigation';

export default async function AdminDisputesPage({
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

  // MODERATOR, SUPER_ADMIN, and SUPPORT_STAFF can access
  const canAccess =
    adminRole === "MODERATOR" ||
    adminRole === "SUPER_ADMIN" ||
    adminRole === "SUPPORT_STAFF";
  if (!canAccess) {
    redirect("/dashboard/admin");
  }

  const params = await searchParams;
  const where: any = {};
  if (params.status && params.status !== "all") {
    where.status = params.status;
  }
  if (params.type && params.type !== "all") {
    where.type = params.type;
  }

  const [disputes, stats] = await Promise.all([
    prisma.dispute.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        adminUser: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.dispute.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusStats = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader
        title="Manage Disputes"
        description="Handle disputes and complaints"
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
            <CardTitle className="text-sm font-medium">Đang xem xét</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statusStats["IN_REVIEW"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusStats["RESOLVED"] || 0}
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
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form method="get" className="flex gap-4">
            <Select name="status" defaultValue={params.status || "all"}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">Đang chờ</SelectItem>
                <SelectItem value="IN_REVIEW">Đang xem xét</SelectItem>
                <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                <SelectItem value="REJECTED">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select name="type" defaultValue={params.type || "all"}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="PAYMENT">Thanh toán</SelectItem>
                <SelectItem value="ASSIGNMENT">Phân công</SelectItem>
                <SelectItem value="NO_SHOW">Không xuất hiện</SelectItem>
                <SelectItem value="QUALITY">Chất lượng</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Lọc</Button>
          </form>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Disputes ({disputes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>Không có dispute nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <Link
                  key={dispute.id}
                  href={`/dashboard/admin/disputes/${dispute.id}`}
                  className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {dispute.user.profile?.name || dispute.user.email}
                        </h3>
                        <StatusBadge status={dispute.status} />
                        <span className="px-2 py-0.5 bg-lunavia-primary-light text-lunavia-primary rounded text-xs font-medium">
                          {dispute.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {dispute.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Tạo: {formatDateTime(dispute.createdAt)}</span>
                        {dispute.resolvedAt && (
                          <span>Giải quyết: {formatDateTime(dispute.resolvedAt)}</span>
                        )}
                        {dispute.assignedTo && dispute.adminUser && (
                          <span>
                            Được giao cho: {dispute.adminUser.email}
                          </span>
                        )}
                        {dispute.resolutionAmount && (
                          <span className="text-green-600 font-medium">
                            Hoàn tiền: {formatVND(dispute.resolutionAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {dispute.status === "PENDING" || dispute.status === "IN_REVIEW"
                        ? "Process"
                        : "View Details"}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}


