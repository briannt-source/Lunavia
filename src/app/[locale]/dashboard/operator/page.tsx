"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  FileText,
  ArrowRight,
  Calendar,
  Plus,
  Eye,
  Shield,
  Briefcase,
  Wallet,
  Map,
  Users,
  MessageCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { format } from "date-fns";

export default function OperatorDashboard() {
  const { data: tours = [], isLoading: toursLoading } = useQuery({
    queryKey: ["tours", "my"],
    queryFn: () => api.tours.my(),
  });

  const { data: opsOverview } = useQuery({
    queryKey: ["ops", "overview"],
    queryFn: () => api.ops.overview(),
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toursToday = tours.filter((tour: any) => {
    const tourDate = new Date(tour.startDate);
    tourDate.setHours(0, 0, 0, 0);
    return tourDate.getTime() === today.getTime();
  });

  const toursNeedingAttention = tours.filter((tour: any) =>
    tour.status === "CONFIRMED" || tour.status === "IN_PROGRESS"
  );

  const sosCount = opsOverview?.sos?.triggeredLast24h || 0;
  const disputesOpen = opsOverview?.disputes?.byStatus?.PENDING || 0;
  const disputesInReview = opsOverview?.disputes?.byStatus?.IN_REVIEW || 0;
  const disputesTotal = disputesOpen + disputesInReview;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng quan hoạt động và các tour cần chú ý
        </p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Tours Hôm Nay" value={toursToday.length} color="indigo" />
        <StatPill label="Cần Chú Ý" value={toursNeedingAttention.length} color="amber" />
        <StatPill label="SOS (24h)" value={sosCount} color="red" />
        <StatPill label="Disputes" value={disputesTotal} color="slate" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tours Today */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Tours Hôm Nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            {toursLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}
              </div>
            ) : toursToday.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Không có tour nào hôm nay ✨
              </p>
            ) : (
              <div className="space-y-2">
                {toursToday.slice(0, 3).map((tour: any) => (
                  <TourRow key={tour.id} tour={tour} />
                ))}
                {toursToday.length > 3 && (
                  <Link href="/dashboard/operator/tours?filter=today"
                    className="block text-center text-xs font-medium text-indigo-600 hover:text-indigo-700 py-2">
                    Xem thêm {toursToday.length - 3} tour →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Cần Chú Ý
            </CardTitle>
          </CardHeader>
          <CardContent>
            {toursNeedingAttention.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Tất cả tours đều ổn ✅
              </p>
            ) : (
              <div className="space-y-2">
                {toursNeedingAttention.slice(0, 3).map((tour: any) => (
                  <Link key={tour.id} href={`/dashboard/operator/tours/${tour.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/60 hover:bg-amber-50 transition group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tour.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                          {tour.status}
                        </span>
                        <span className="text-xs text-gray-500">{tour.city}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-amber-500 transition" />
                  </Link>
                ))}
                {toursNeedingAttention.length > 3 && (
                  <Link href="/dashboard/operator/tours?filter=attention"
                    className="block text-center text-xs font-medium text-amber-600 hover:text-amber-700 py-2">
                    Xem thêm {toursNeedingAttention.length - 3} tour →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SOS */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              SOS (24h qua)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sosCount === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Không có SOS — mọi thứ an toàn 🟢
              </p>
            ) : (
              <div className="text-center py-3">
                <p className="text-3xl font-bold text-red-600">{sosCount}</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">SOS kích hoạt trong 24h</p>
                <Link href="/dashboard/operator/tours?filter=sos">
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 text-xs">
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disputes */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {disputesTotal === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Không có dispute nào 👍
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-600">Đang mở</span>
                  <span className="text-sm font-bold text-blue-600">{disputesOpen}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-600">Đang xem xét</span>
                  <span className="text-sm font-bold text-amber-600">{disputesInReview}</span>
                </div>
                <Link href="/dashboard/operator/disputes">
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction href="/dashboard/operator/tours/new" icon={<Plus className="h-4 w-4" />} label="Tạo Tour Mới" primary />
        <QuickAction href="/dashboard/operator/wallet" icon={<Wallet className="h-4 w-4" />} label="Ví" />
        <QuickAction href="/dashboard/operator/team" icon={<Users className="h-4 w-4" />} label="Quản Lý Team" />
        <QuickAction href="/dashboard/operator/fleet" icon={<Map className="h-4 w-4" />} label="Fleet Tracking" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction href="/dashboard/operator/tours" icon={<Eye className="h-4 w-4" />} label="Tất Cả Tours" />
        <QuickAction href="/dashboard/operator/applications" icon={<Briefcase className="h-4 w-4" />} label="Ứng Tuyển" />
        <QuickAction href="/dashboard/operator/disputes" icon={<FileText className="h-4 w-4" />} label="Disputes" />
        <QuickAction href="/messages" icon={<MessageCircle className="h-4 w-4" />} label="Tin Nhắn" />
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-gray-50 text-gray-700',
  };

  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl ${colorMap[color] || colorMap.slate}`}>
      <span className="text-xs font-medium opacity-80">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

function TourRow({ tour }: { tour: any }) {
  return (
    <Link href={`/dashboard/operator/tours/${tour.id}`}
      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-indigo-50/50 transition group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{tour.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {format(new Date(tour.startDate), "HH:mm")} • {tour.city}
        </p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-500 transition" />
    </Link>
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
