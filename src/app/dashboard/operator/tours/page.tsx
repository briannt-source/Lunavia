"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api-client";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import {
  MapPin,
  Search,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MyToursPage() {
  const pathname = usePathname();
  
  // Debug: Log pathname to ensure routing works
  useEffect(() => {
    console.log("My Tours Page - Pathname:", pathname);
  }, [pathname]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["tours", "my", filters],
    queryFn: () => api.tours.my(),
  });

  // Filter tours client-side
  const filteredTours = tours.filter((tour: any) => {
    if (filters.status !== "all" && tour.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        tour.title?.toLowerCase().includes(searchLower) ||
        tour.description?.toLowerCase().includes(searchLower) ||
        tour.city?.toLowerCase().includes(searchLower) ||
        tour.code?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Group tours by status
  const toursByStatus = {
    DRAFT: filteredTours.filter((t: any) => t.status === "DRAFT"),
    OPEN: filteredTours.filter((t: any) => t.status === "OPEN"),
    CLOSED: filteredTours.filter((t: any) => t.status === "CLOSED"),
    IN_PROGRESS: filteredTours.filter((t: any) => t.status === "IN_PROGRESS"),
    COMPLETED: filteredTours.filter((t: any) => t.status === "COMPLETED"),
    CANCELLED: filteredTours.filter((t: any) => t.status === "CANCELLED"),
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Tours"
        description="Quản lý tất cả tours của bạn"
        action={
          <Link href="/tours/create">
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Tạo Tour Mới
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tours.length}</div>
            <p className="text-xs text-muted-foreground">Tổng Tours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {toursByStatus.DRAFT.length}
            </div>
            <p className="text-xs text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">
              {toursByStatus.OPEN.length}
            </div>
            <p className="text-xs text-muted-foreground">Đang mở</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {toursByStatus.CLOSED.length}
            </div>
            <p className="text-xs text-muted-foreground">Đã đóng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {toursByStatus.IN_PROGRESS.length}
            </div>
            <p className="text-xs text-muted-foreground">Đang diễn ra</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              {toursByStatus.COMPLETED.length}
            </div>
            <p className="text-xs text-muted-foreground">Hoàn thành</p>
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
                  placeholder="Tìm tour theo tên, mô tả, thành phố, hoặc mã tour..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="OPEN">Đang mở</SelectItem>
                <SelectItem value="CLOSED">Đã đóng</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang diễn ra</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tours List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách Tours ({filteredTours.length}/{tours.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Đang tải...</p>
            </div>
          ) : filteredTours.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Không tìm thấy tour nào"
              description={
                filters.status !== "all" || filters.search
                  ? "Thử thay đổi bộ lọc để tìm tour"
                  : "Bắt đầu tạo tour đầu tiên của bạn"
              }
              action={
                !filters.search && filters.status === "all" ? (
                  <Link href="/tours/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo Tour
                    </Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredTours.map((tour: any) => (
                <div
                  key={tour.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/tours/${tour.id}`}>
                          <h3 className="font-semibold text-slate-900 hover:text-teal-600">
                            {tour.title}
                          </h3>
                        </Link>
                        {tour.code && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300 font-mono">
                            {tour.code}
                          </span>
                        )}
                        <StatusBadge status={tour.status} />
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
                          {tour._count?.applications || 0} ứng tuyển
                        </span>
                        <span>Tạo: {formatDateTime(tour.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/tours/${tour.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </Link>
                      {["DRAFT", "OPEN", "CLOSED"].includes(tour.status) && (
                        <Link href={`/tours/${tour.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

