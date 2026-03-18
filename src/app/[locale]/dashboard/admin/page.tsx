import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { formatCurrency, formatDateTime, formatVND } from "@/lib/utils";
import { Shield, AlertTriangle, DollarSign, Users, MapPin, CreditCard, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any)?.role;
  const isAdmin = role && (role.startsWith("ADMIN_") || role === "SUPER_ADMIN" || role === "MODERATOR" || role === "SUPPORT_STAFF");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Get admin user info
  let adminUser = null;
  let adminRole = "SUPPORT_STAFF";
  if (role && role.startsWith("ADMIN_")) {
    adminRole = role.replace("ADMIN_", "");
    adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user?.email || "" },
    });
  } else if (role === "SUPER_ADMIN" || role === "MODERATOR" || role === "SUPPORT_STAFF") {
    adminRole = role;
  }

  // Check permissions
  const isSuperAdmin = adminRole === "SUPER_ADMIN";
  const isModerator = adminRole === "MODERATOR" || isSuperAdmin;
  const canViewUsers = isSuperAdmin;
  const canViewWallets = isSuperAdmin;
  const canViewRequests = isSuperAdmin;

  // Get comprehensive stats
  const [
    pendingDisputes,
    pendingVerifications,
    totalUsers,
    totalTours,
    activeTours,
    pendingTopUps,
    pendingWithdrawals,
    totalOperators,
    totalGuides,
    totalRevenue,
  ] = await Promise.all([
    prisma.dispute.count({ where: { status: "PENDING" } }),
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.tour.count(),
    prisma.tour.count({ where: { status: "OPEN" } }),
    canViewRequests ? prisma.topUpRequest.count({ where: { status: "PENDING" } }) : 0,
    canViewRequests ? prisma.withdrawalRequest.count({ where: { status: "PENDING" } }) : 0,
    prisma.user.count({ where: { role: { in: ["TOUR_OPERATOR", "TOUR_AGENCY"] } } }),
    prisma.user.count({ where: { role: "TOUR_GUIDE" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }).then((r) => r._sum.amount || 0),
  ]);

  // Get recent items
  const [recentDisputes, pendingVerificationsList, recentTopUps, recentWithdrawals] = await Promise.all([
    isModerator ? prisma.dispute.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }) : [],
    isModerator ? prisma.verification.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }) : [],
    canViewRequests ? prisma.topUpRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }) : [],
    canViewRequests ? prisma.withdrawalRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }) : [],
  ]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Admin Dashboard"
        description={
          <span>
            Quản lý hệ thống LUNAVIA
            {adminUser && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({adminUser.role} - {adminUser.permissions.join(", ")})
              </span>
            )}
          </span>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isModerator && (
          <>
            <StatsCard
              title="Disputes đang chờ"
              value={pendingDisputes}
              icon={AlertTriangle}
              trend={pendingDisputes > 0 ? "up" : undefined}
              href="/dashboard/admin/disputes"
            />
            <StatsCard
              title="Xác minh đang chờ"
              value={pendingVerifications}
              icon={Shield}
              trend={pendingVerifications > 0 ? "up" : undefined}
              href="/dashboard/admin/verifications"
            />
          </>
        )}
        {canViewUsers && (
          <>
            <StatsCard
              title="Tổng Users"
              value={totalUsers}
              icon={Users}
              subtitle={`${totalOperators} Operators, ${totalGuides} Guides`}
            />
            <StatsCard
              title="Tổng Tours"
              value={totalTours}
              icon={MapPin}
              subtitle={`${activeTours} đang mở`}
            />
          </>
        )}
        {canViewRequests && (
          <>
            <StatsCard
              title="Top-up chờ duyệt"
              value={pendingTopUps}
              icon={CreditCard}
              trend={pendingTopUps > 0 ? "up" : undefined}
              href="/dashboard/admin/requests"
            />
            <StatsCard
              title="Rút tiền chờ duyệt"
              value={pendingWithdrawals}
              icon={DollarSign}
              trend={pendingWithdrawals > 0 ? "up" : undefined}
              href="/dashboard/admin/requests"
            />
          </>
        )}
        {isSuperAdmin && (
          <StatsCard
            title="Tổng doanh thu"
            value={formatVND(totalRevenue)}
            icon={TrendingUp}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Disputes - Moderator & Super Admin */}
        {isModerator && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Disputes đang chờ xử lý</CardTitle>
              <Link href="/dashboard/admin/disputes">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentDisputes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                  <p>Không có dispute nào đang chờ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDisputes.map((dispute) => (
                    <Link
                      key={dispute.id}
                      href={`/dashboard/admin/disputes/${dispute.id}`}
                      className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {dispute.user.profile?.name || dispute.user.email}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {dispute.type} • {formatDateTime(dispute.createdAt)}
                          </p>
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {dispute.description}
                          </p>
                        </div>
                        <StatusBadge status={dispute.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Verifications - Moderator & Super Admin */}
        {isModerator && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Xác minh đang chờ</CardTitle>
              <Link href="/dashboard/admin/verifications">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingVerificationsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                  <p>Không có yêu cầu xác minh nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingVerificationsList.map((verification) => (
                    <Link
                      key={verification.id}
                      href={`/dashboard/admin/verifications/${verification.id}`}
                      className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {verification.user.profile?.name || verification.user.email}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {verification.user.role} • {formatDateTime(verification.createdAt)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {verification.user.role === "TOUR_GUIDE" ? "Xác minh danh tính (KYC)" : "Xác minh doanh nghiệp (KYB)"}
                          </p>
                        </div>
                        <StatusBadge status={verification.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Top-ups - Super Admin only */}
        {canViewRequests && recentTopUps.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top-up chờ duyệt</CardTitle>
              <Link href="/dashboard/admin/requests">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTopUps.map((request) => (
                  <Link
                    key={request.id}
                    href={`/dashboard/admin/requests?tab=topup&id=${request.id}`}
                    className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {request.user.profile?.name || request.user.email}
                        </h3>
                        <p className="text-lg font-bold text-teal-600">
                          {formatVND(request.amount)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {request.method} • {formatDateTime(request.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Withdrawals - Super Admin only */}
        {canViewRequests && recentWithdrawals.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rút tiền chờ duyệt</CardTitle>
              <Link href="/dashboard/admin/requests">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWithdrawals.map((request) => (
                  <Link
                    key={request.id}
                    href={`/dashboard/admin/requests?tab=withdrawal&id=${request.id}`}
                    className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {request.user.profile?.name || request.user.email}
                        </h3>
                        <p className="text-lg font-bold text-red-600">
                          {formatVND(request.amount)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {request.method} • {formatDateTime(request.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

