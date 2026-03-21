"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Activity,
  XCircle,
  Calendar,
  ArrowRight,
  Search,
  Wallet,
  Coins,
  MessageCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDate } from "@/lib/utils";
import { Link } from '@/navigation';

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
    acceptedApplications: analytics?.stats?.acceptedApplications || applications.filter((a: any) => a.status === "ACCEPTED").length,
    pendingApplications: analytics?.stats?.pendingApplications || applications.filter((a: any) => a.status === "PENDING").length,
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Guide</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động của bạn</p>
      </div>

      {/* KYC Banner */}
      {needsKYC && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-900 text-sm">
              {verifiedStatus === "NOT_SUBMITTED"
                ? "Cần hoàn tất KYC để ứng tuyển tour"
                : verifiedStatus === "PENDING"
                ? "KYC đang chờ duyệt"
                : "KYC bị từ chối — Vui lòng nộp lại"}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {verifiedStatus === "NOT_SUBMITTED"
                ? "Nộp hình ảnh thật, CMND/CCCD, thẻ HDV, proof of address để ứng tuyển."
                : verifiedStatus === "PENDING"
                ? "Đang được admin xem xét. Vui lòng chờ."
                : "Kiểm tra lại và nộp lại giấy tờ."}
            </p>
            {verifiedStatus !== "PENDING" && (
              <Link href="/dashboard/verification/kyc">
                <Button size="sm" className="mt-2.5 bg-amber-600 hover:bg-amber-700 text-xs h-7">
                  {verifiedStatus === "NOT_SUBMITTED" ? "Nộp KYC ngay" : "Nộp lại KYC"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <StatCard icon={<Briefcase className="h-4 w-4" />} label="Ứng tuyển" value={stats.totalApplications} color="indigo" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Chấp nhận" value={stats.acceptedApplications} color="emerald" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Đang Chờ" value={stats.pendingApplications} color="amber" />
        <StatCard icon={<XCircle className="h-4 w-4" />} label="Từ chối" value={stats.rejectedApplications} color="red" />
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Thu nhập" value={formatVND(stats.totalEarned)} color="slate" small />
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Số dư" value={formatVND(stats.walletBalance)} color="slate" small />
      </div>

      {/* Performance + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Hiệu Suất
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <PerformanceRow label="Tỷ lệ thành công" value={`${stats.successRate}%`} color="text-emerald-600" />
            <PerformanceRow label="Tours hoàn thành" value={stats.completedTours} color="text-blue-600" />
            <PerformanceRow label="Tổng thu nhập" value={formatVND(stats.totalEarned)} color="text-gray-900" />
            <PerformanceRow label="Số dư hiện tại" value={formatVND(stats.walletBalance)} color="text-gray-900" />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Hoạt Động (7 ngày)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60">
              <span className="text-xs font-medium text-blue-700">Ứng tuyển mới</span>
              <span className="text-sm font-bold text-blue-900">{stats.recentApplications}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60">
              <span className="text-xs font-medium text-emerald-700">Đã chấp nhận</span>
              <span className="text-sm font-bold text-emerald-900">{stats.acceptedApplications}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/dashboard/guide/applications">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                  Ứng tuyển
                </Button>
              </Link>
              <Link href="/dashboard/guide/available">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                  Tìm Tour
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tours */}
      {analytics?.upcomingTours && analytics.upcomingTours.length > 0 && (
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-500" />
              Tour Sắp Tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.upcomingTours.map((tour: any) => (
                <Link key={tour.id} href={`/tours/${tour.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-violet-50/50 transition group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{tour.title}</h3>
                      {tour.code && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-mono shrink-0">
                          {tour.code}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-semibold shrink-0">
                        {tour.role === "MAIN" ? "HDV Chính" : "HDV Phụ"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {tour.city} • {formatDate(tour.startDate)}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-500 transition shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <QuickAction href="/dashboard/guide/available" icon={<Search className="h-4 w-4" />} label="Tìm Tour" primary />
        <QuickAction href="/dashboard/guide/wallet" icon={<Wallet className="h-4 w-4" />} label="Ví" />
        <QuickAction href="/dashboard/guide/earnings" icon={<Coins className="h-4 w-4" />} label="Thu Nhập" />
        <QuickAction href="/dashboard/guide/calendar" icon={<Calendar className="h-4 w-4" />} label="Lịch" />
        <QuickAction href="/messages" icon={<MessageCircle className="h-4 w-4" />} label="Tin Nhắn" />
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function StatCard({ icon, label, value, color, small }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; small?: boolean;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.slate}`}>
      <div className="flex items-center gap-1.5 mb-1.5 opacity-70">{icon}<span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span></div>
      <p className={`font-bold ${small ? 'text-xs' : 'text-lg'}`}>{value}</p>
    </div>
  );
}

function PerformanceRow({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

function QuickAction({ href, icon, label, primary }: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
        primary
          ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30'
      }`}>
      {icon}
      {label}
    </Link>
  );
}
