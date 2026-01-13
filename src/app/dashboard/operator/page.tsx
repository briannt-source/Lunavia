"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  AlertCircle,
  Clock,
  FileText,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { format } from "date-fns";

export default function OperatorDashboard() {
  // Fetch tours
  const { data: tours = [], isLoading: toursLoading } = useQuery({
    queryKey: ["tours", "my"],
    queryFn: () => api.tours.my(),
  });

  // Fetch ops overview for SOS and disputes
  const { data: opsOverview } = useQuery({
    queryKey: ["ops", "overview"],
    queryFn: () => api.ops.overview(),
  });

  // Calculate today's tours
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const toursToday = tours.filter((tour: any) => {
    const tourDate = new Date(tour.startDate);
    tourDate.setHours(0, 0, 0, 0);
    return tourDate.getTime() === today.getTime();
  });

  // Calculate upcoming tours (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingTours = tours.filter((tour: any) => {
    const tourDate = new Date(tour.startDate);
    return tourDate > today && tourDate <= nextWeek;
  });

  // Tours needing attention: CONFIRMED without guide or IN_PROGRESS
  const toursNeedingAttention = tours.filter((tour: any) => {
    if (tour.status === "CONFIRMED") {
      // Check if tour has assigned guide (simplified - would need to check applications/assignments)
      return true; // For MVP, show all CONFIRMED tours
    }
    if (tour.status === "IN_PROGRESS") {
      return true;
    }
    return false;
  });

  // Get SOS count from ops overview
  const sosCount = opsOverview?.sos?.triggeredLast24h || 0;

  // Get disputes count from ops overview
  const disputesOpen = opsOverview?.disputes?.byStatus?.PENDING || 0;
  const disputesInReview = opsOverview?.disputes?.byStatus?.IN_REVIEW || 0;
  const disputesTotal = disputesOpen + disputesInReview;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#1E293B] mb-2">
            Dashboard
          </h1>
          <p className="text-[#64748B]">
            Tổng quan hoạt động và các tour cần chú ý
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tours Today */}
          <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1E293B] flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0077B6]" />
                  Tours Hôm Nay
                </CardTitle>
                <Badge variant="secondary" className="bg-[#E6F2F8] text-[#003049]">
                  {toursToday.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {toursLoading ? (
                <p className="text-sm text-[#64748B]">Đang tải...</p>
              ) : toursToday.length === 0 ? (
                <p className="text-sm text-[#64748B]">Không có tour nào hôm nay</p>
              ) : (
                <div className="space-y-2">
                  {toursToday.slice(0, 3).map((tour: any) => (
                    <Link
                      key={tour.id}
                      href={`/dashboard/operator/tours/${tour.id}`}
                      className="block p-3 rounded-[6px] bg-[#F8FAFC] hover:bg-[#E6F2F8] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[#1E293B] text-sm">
                            {tour.title}
                          </p>
                          <p className="text-xs text-[#64748B] mt-1">
                            {format(new Date(tour.startDate), "HH:mm")} • {tour.city}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#0077B6]" />
                      </div>
                    </Link>
                  ))}
                  {toursToday.length > 3 && (
                    <Link href="/dashboard/operator/tours?filter=today">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-[#0077B6] hover:text-[#003049]"
                      >
                        Xem thêm {toursToday.length - 3} tour
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tours Needing Attention */}
          <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1E293B] flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Cần Chú Ý
                </CardTitle>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                  {toursNeedingAttention.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {toursNeedingAttention.length === 0 ? (
                <p className="text-sm text-[#64748B]">
                  Tất cả tours đều ổn định
                </p>
              ) : (
                <div className="space-y-2">
                  {toursNeedingAttention.slice(0, 3).map((tour: any) => (
                    <Link
                      key={tour.id}
                      href={`/dashboard/operator/tours/${tour.id}`}
                      className="block p-3 rounded-[6px] bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[#1E293B] text-sm">
                            {tour.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-300 text-amber-700"
                            >
                              {tour.status}
                            </Badge>
                            <span className="text-xs text-[#64748B]">
                              {tour.city}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-600" />
                      </div>
                    </Link>
                  ))}
                  {toursNeedingAttention.length > 3 && (
                    <Link href="/dashboard/operator/tours?filter=attention">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-amber-700 hover:text-amber-800"
                      >
                        Xem thêm {toursNeedingAttention.length - 3} tour
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SOS Triggered */}
          <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1E293B] flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  SOS (24h)
                </CardTitle>
                <Badge variant="secondary" className="bg-red-50 text-red-700">
                  {sosCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {sosCount === 0 ? (
                <p className="text-sm text-[#64748B]">
                  Không có SOS nào trong 24h qua
                </p>
              ) : (
                <div>
                  <p className="text-sm text-[#64748B] mb-3">
                    Có {sosCount} SOS đã được kích hoạt trong 24 giờ qua
                  </p>
                  <Link href="/dashboard/operator/tours?filter=sos">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disputes */}
          <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1E293B] flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#003049]" />
                  Disputes
                </CardTitle>
                <Badge variant="secondary" className="bg-[#E6F2F8] text-[#003049]">
                  {disputesTotal}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {disputesTotal === 0 ? (
                <p className="text-sm text-[#64748B]">
                  Không có dispute nào
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#F8FAFC]">
                    <span className="text-sm text-[#64748B]">Đang mở</span>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {disputesOpen}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#F8FAFC]">
                    <span className="text-sm text-[#64748B]">Đang xem xét</span>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {disputesInReview}
                    </Badge>
                  </div>
                  <Link href="/dashboard/operator/disputes">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-[#003049] text-[#003049] hover:bg-[#E6F2F8]"
                    >
                      Xem tất cả disputes
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#1E293B]">
              Thao Tác Nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/tours/create">
                <Button className="w-full bg-[#0077B6] hover:bg-[#003049] text-white rounded-[12px]">
                  Tạo Tour Mới
                </Button>
              </Link>
              <Link href="/dashboard/operator/tours">
                <Button
                  variant="outline"
                  className="w-full border-[#003049] text-[#003049] hover:bg-[#E6F2F8] rounded-[12px]"
                >
                  Xem Tất Cả Tours
                </Button>
              </Link>
              <Link href="/dashboard/operator/disputes">
                <Button
                  variant="outline"
                  className="w-full border-[#003049] text-[#003049] hover:bg-[#E6F2F8] rounded-[12px]"
                >
                  Quản Lý Disputes
                </Button>
              </Link>
              <Link href="/dashboard/operator/applications">
                <Button
                  variant="outline"
                  className="w-full border-[#003049] text-[#003049] hover:bg-[#E6F2F8] rounded-[12px]"
                >
                  Ứng Tuyển
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
