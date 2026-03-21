"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { MapPin, Search, Calendar, Users, DollarSign, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { Link } from '@/navigation';
import { TourModerationDialog } from "@/components/tour-moderation-dialog";
import { AdminDeleteTourDialog } from "@/components/admin-delete-tour-dialog";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export default function AdminToursClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [moderationDialog, setModerationDialog] = useState<{
    open: boolean;
    tour: any;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    tour: any;
  } | null>(null);

  const status = searchParams.get("status") || "all";
  const city = searchParams.get("city") || "all";
  const search = searchParams.get("search") || "";

  const { data: toursData, refetch } = useQuery({
    queryKey: ["admin-tours", status, city, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (city !== "all") params.append("city", city);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/tours?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tours");
      return response.json();
    },
  });

  const tours = toursData?.tours || [];
  const stats = toursData?.stats || {};

  const handleFilter = (newStatus: string, newCity: string, newSearch: string) => {
    const params = new URLSearchParams();
    if (newStatus !== "all") params.append("status", newStatus);
    if (newCity !== "all") params.append("city", newCity);
    if (newSearch) params.append("search", newSearch);
    router.push(`/dashboard/admin/tours?${params.toString()}`);
  };

  return (
    <>
      <PageHeader
        title="Quản lý Tours"
        description="Xem và quản lý tất cả tours trong hệ thống. Có thể đóng/mở tour nếu vi phạm quy định."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Tours</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tours.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats["DRAFT"] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang mở</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats["OPEN"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang diễn ra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats["IN_PROGRESS"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              {stats["COMPLETED"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bị đóng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tours.filter((t: any) => t.isBlocked).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm tour..."
                  defaultValue={search}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFilter(status, city, e.currentTarget.value);
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={status}
              onValueChange={(value) => handleFilter(value, city, search)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="OPEN">Đang mở</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang diễn ra</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const searchInput = document.querySelector("input[placeholder='Tìm tour...']") as HTMLInputElement;
                handleFilter(status, city, searchInput?.value || "");
              }}
            >
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tours List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Tours ({tours.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>Không tìm thấy tour nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map((tour: any) => (
                <div
                  key={tour.id}
                  className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/tours/${tour.id}`}>
                          <h3 className="font-semibold text-slate-900 hover:text-blue-600">
                            {tour.title}
                          </h3>
                        </Link>
                        {tour.code && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300 font-mono">
                            {tour.code}
                          </span>
                        )}
                        <StatusBadge status={tour.status} />
                        {tour.isBlocked && (
                          <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Đã đóng
                          </span>
                        )}
                        {tour.visibility === "PUBLIC" && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            Public
                          </span>
                        )}
                        {tour.visibility === "PRIVATE" && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-300">
                            Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tour.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(tour.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tour.pax} khách
                        </span>
                        {tour.priceMain && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(tour.priceMain, tour.currency)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>
                          Operator: {tour.operator?.profile?.name || tour.operator?.email}
                        </span>
                        <span>{tour._count?.applications || 0} ứng tuyển</span>
                        <span>Tạo: {formatDateTime(tour.createdAt)}</span>
                        {tour.isBlocked && tour.blockReason && (
                          <span className="text-red-600">
                            Lý do: {tour.blockReason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/tours/${tour.id}`}>
                        <Button variant="outline" size="sm">
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Button
                        variant={tour.isBlocked ? "default" : "destructive"}
                        size="sm"
                        onClick={() =>
                          setModerationDialog({
                            open: true,
                            tour,
                          })
                        }
                      >
                        {tour.isBlocked ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mở lại
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Đóng
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            tour,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {moderationDialog && (
        <TourModerationDialog
          open={moderationDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setModerationDialog(null);
            }
          }}
          tour={moderationDialog.tour}
          onSuccess={() => {
            refetch();
            setModerationDialog(null);
          }}
        />
      )}

      {deleteDialog && (
        <AdminDeleteTourDialog
          open={deleteDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteDialog(null);
            }
          }}
          tour={deleteDialog.tour}
          onSuccess={() => {
            refetch();
            setDeleteDialog(null);
          }}
        />
      )}
    </>
  );
}

