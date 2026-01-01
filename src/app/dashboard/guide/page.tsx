"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Activity,
  TrendingUp,
  XCircle,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function GuideDashboard() {
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => api.user.info(),
  });

  const { data: analytics } = useQuery({
    queryKey: ["guide", "analytics"],
    queryFn: () => api.guide.getAnalytics(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", "guide"],
    queryFn: () => api.applications.list(),
  });

  const stats = {
    totalApplications: analytics?.stats?.totalApplications || applications.length,
    acceptedApplications: analytics?.stats?.acceptedApplications || applications.filter(
      (a: any) => a.status === "ACCEPTED"
    ).length,
    pendingApplications: analytics?.stats?.pendingApplications || applications.filter(
      (a: any) => a.status === "PENDING"
    ).length,
    rejectedApplications: analytics?.stats?.rejectedApplications || 0,
    completedTours: analytics?.stats?.completedTours || 0,
    totalEarned: analytics?.stats?.totalEarned || 0,
    successRate: analytics?.stats?.successRate || 0,
    recentApplications: analytics?.stats?.recentApplications || 0,
    walletBalance: userInfo?.wallet?.balance || 0,
  };

  const verifiedStatus = userInfo?.verifiedStatus || "NOT_SUBMITTED";
  const needsKYC = verifiedStatus !== "APPROVED";

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard Guide"
        description="Tổng quan hoạt động của bạn"
      />

      {/* KYC/KYB Reminder Banner */}
      {needsKYC && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  {verifiedStatus === "NOT_SUBMITTED"
                    ? "Cần hoàn tất KYC để ứng tuyển tour"
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Tổng Ứng tuyển"
          value={stats.totalApplications}
          icon={Briefcase}
        />
        <StatsCard
          title="Đã Chấp nhận"
          value={stats.acceptedApplications}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Đang Chờ"
          value={stats.pendingApplications}
          icon={Clock}
        />
        <StatsCard
          title="Đã Từ chối"
          value={stats.rejectedApplications}
          icon={XCircle}
        />
        <StatsCard
          title="Tổng Thu nhập"
          value={formatVND(stats.totalEarned)}
          icon={DollarSign}
        />
        <StatsCard
          title="Số dư Ví"
          value={formatVND(stats.walletBalance)}
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
                <span className="text-sm text-slate-600">Tỷ lệ thành công</span>
                <span className="font-semibold text-emerald-600">
                  {stats.successRate}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Tours hoàn thành</span>
                <span className="font-semibold text-blue-600">
                  {stats.completedTours}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Tổng thu nhập</span>
                <span className="font-semibold text-slate-900">
                  {formatVND(stats.totalEarned)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Số dư hiện tại</span>
                <span className="font-semibold text-slate-900">
                  {formatVND(stats.walletBalance)}
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
                <span className="text-sm text-blue-700">Ứng tuyển mới</span>
                <span className="font-semibold text-blue-900">
                  {stats.recentApplications}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm text-emerald-700">Đã chấp nhận</span>
                <span className="font-semibold text-emerald-900">
                  {stats.acceptedApplications}
                </span>
              </div>
              <div className="pt-4 border-t">
                <Link href="/dashboard/guide/applications">
                  <Button variant="outline" className="w-full">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Xem tất cả Ứng tuyển
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/tours/browse">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Tìm Tour Mới
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tours */}
      {analytics?.upcomingTours && analytics.upcomingTours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tour Sắp Tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.upcomingTours.map((tour: any) => (
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
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          {tour.role === "MAIN" ? "HDV Chính" : "HDV Phụ"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {tour.city} • {formatDate(tour.startDate)}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Sắp tới
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
