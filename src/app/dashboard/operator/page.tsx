"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Activity,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api-client";
import { formatVND } from "@/lib/utils";
import Link from "next/link";

export default function OperatorDashboard() {
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => api.user.info(),
  });

  const { data: tours = [] } = useQuery({
    queryKey: ["tours", "my"],
    queryFn: () => api.tours.my(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", "operator"],
    queryFn: () => api.applications.list({ status: "PENDING" }),
  });

  const { data: analytics } = useQuery({
    queryKey: ["operator", "analytics"],
    queryFn: () => api.operator.getAnalytics(),
  });

  const stats = {
    totalTours: analytics?.stats?.totalTours || tours.length,
    openTours: analytics?.stats?.openTours || tours.filter((t: any) => t.status === "OPEN").length,
    pendingApplications: analytics?.stats?.pendingApplications || applications.length,
    totalSpent: analytics?.stats?.totalSpent || 0,
    completedTours: analytics?.stats?.completedTours || 0,
    acceptedApplications: analytics?.stats?.acceptedApplications || 0,
    recentTours: analytics?.stats?.recentTours || 0,
    recentApplications: analytics?.stats?.recentApplications || 0,
  };

  const verifiedStatus = userInfo?.verifiedStatus || "NOT_SUBMITTED";
  const needsKYB = verifiedStatus !== "APPROVED";

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard Operator"
        description="Tổng quan hoạt động và analytics của bạn"
      />

      {/* KYC/KYB Reminder Banner */}
      {needsKYB && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  {verifiedStatus === "NOT_SUBMITTED"
                    ? "Cần hoàn tất KYB để tạo tour"
                    : verifiedStatus === "PENDING"
                    ? "KYB đang chờ duyệt"
                    : "KYB bị từ chối - Vui lòng nộp lại"}
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  {verifiedStatus === "NOT_SUBMITTED"
                    ? "Bạn cần nộp đầy đủ các giấy tờ bắt buộc (hình ảnh thật, CMND/CCCD, giấy phép kinh doanh, giấy phép lữ hành, proof of address) để có thể tạo tour."
                    : verifiedStatus === "PENDING"
                    ? "KYB của bạn đang được admin xem xét. Vui lòng kiên nhẫn chờ đợi."
                    : "KYB của bạn đã bị từ chối. Vui lòng kiểm tra lại và nộp lại các giấy tờ."}
                </p>
                {verifiedStatus !== "PENDING" && (
                  <Link href="/dashboard/verification/kyb">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      {verifiedStatus === "NOT_SUBMITTED" ? "Nộp KYB ngay" : "Nộp lại KYB"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Tổng Tours"
          value={stats.totalTours}
          icon={MapPin}
        />
        <StatsCard
          title="Tours Đang Mở"
          value={stats.openTours}
          icon={Package}
        />
        <StatsCard
          title="Đang Diễn Ra"
          value={analytics?.stats?.inProgressTours || 0}
          icon={TrendingUp}
        />
        <StatsCard
          title="Hoàn Thành"
          value={stats.completedTours}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Ứng tuyển Chờ Duyệt"
          value={stats.pendingApplications}
          icon={Briefcase}
        />
        <StatsCard
          title="Tổng Chi"
          value={formatVND(stats.totalSpent)}
          icon={DollarSign}
        />
      </div>

      {/* Analytics & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tổng quan Hiệu suất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Tổng ứng tuyển đã nhận</span>
                <span className="font-semibold text-slate-900">
                  {analytics?.stats?.totalApplications || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Đã chấp nhận</span>
                <span className="font-semibold text-emerald-600">
                  {stats.acceptedApplications}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Tours hoàn thành</span>
                <span className="font-semibold text-blue-600">
                  {stats.completedTours}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Tổng chi phí</span>
                <span className="font-semibold text-slate-900">
                  {formatVND(stats.totalSpent)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hoạt động Gần Đây (7 ngày)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">Tours mới tạo</span>
                <span className="font-semibold text-blue-900">
                  {stats.recentTours}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm text-emerald-700">Ứng tuyển mới</span>
                <span className="font-semibold text-emerald-900">
                  {stats.recentApplications}
                </span>
              </div>
              <div className="pt-4 border-t">
                <Link href="/dashboard/operator/tours">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Xem tất cả Tours
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/dashboard/operator/applications">
                  <Button variant="outline" className="w-full">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Xem tất cả Ứng tuyển
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Tours */}
      {analytics?.topTours && analytics.topTours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tour Nổi Bật (Nhiều ứng tuyển nhất)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topTours.map((tour: any) => (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.id}`}
                  className="block p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {tour.title}
                        </h3>
                        {tour.code && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300 font-mono">
                            {tour.code}
                          </span>
                        )}
                        <StatusBadge status={tour.status} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {tour.city} • {tour.applicationsCount} ứng tuyển
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {tour.applicationsCount} ứng viên
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
