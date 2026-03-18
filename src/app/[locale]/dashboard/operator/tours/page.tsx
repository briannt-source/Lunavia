"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Calendar, Search, Filter } from "lucide-react";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import Link from "next/link";

const TOUR_STATES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  PUBLISHED: { label: "Published", color: "bg-blue-100 text-blue-700" },
  ASSIGNED: { label: "Assigned", color: "bg-purple-100 text-purple-700" },
  CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
};

export default function TourListPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "all");

  // Fetch tours
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["tours", "my", statusFilter, search],
    queryFn: () => api.tours.my(),
  });

  // Filter tours based on status
  const filteredTours = tours.filter((tour: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tourDate = new Date(tour.startDate);
      tourDate.setHours(0, 0, 0, 0);
      return tourDate.getTime() === today.getTime();
    }
    if (statusFilter === "attention") {
      return tour.status === "CONFIRMED" || tour.status === "IN_PROGRESS";
    }
    if (statusFilter === "sos") {
      // Would need to check SOS status from audit logs or tour data
      return false; // Simplified
    }
    return tour.status === statusFilter;
  });

  // Filter by search
  const searchFilteredTours = filteredTours.filter((tour: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      tour.title?.toLowerCase().includes(searchLower) ||
      tour.city?.toLowerCase().includes(searchLower) ||
      tour.code?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1E293B] mb-2">Danh Sách Tours</h1>
            <p className="text-[#64748B]">Quản lý và theo dõi tất cả tours của bạn</p>
          </div>
          <Link href="/tours/create">
            <Button className="bg-[#0077B6] hover:bg-[#003049] text-white rounded-[12px]">
              Tạo Tour Mới
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Tìm kiếm tour..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-[6px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-[6px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="attention">Cần chú ý</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-[#64748B] flex items-center">
                Tìm thấy {searchFilteredTours.length} tour
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tours List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-[#64748B]">Đang tải...</p>
          </div>
        ) : searchFilteredTours.length === 0 ? (
          <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-[#64748B]">Không tìm thấy tour nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searchFilteredTours.map((tour: any) => {
              const stateInfo =
                TOUR_STATES[tour.status as keyof typeof TOUR_STATES] || TOUR_STATES.DRAFT;
              return (
                <Link key={tour.id} href={`/dashboard/operator/tours/${tour.id}`}>
                  <Card className="rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,29,61,0.1)] transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#1E293B]">
                              {tour.title}
                            </h3>
                            <Badge className={`${stateInfo.color} border-0`}>
                              {stateInfo.label}
                            </Badge>
                            {tour.code && (
                              <span className="text-xs px-2 py-1 bg-[#F8FAFC] text-[#64748B] rounded-[6px] border border-[#E2E8F0] font-mono">
                                {tour.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#64748B]">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(tour.startDate), "dd/MM/yyyy")}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {tour.city}
                            </div>
                            {tour.pax && (
                              <div className="flex items-center gap-1">
                                <span>{tour.pax} khách</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#0077B6] hover:text-[#003049]"
                        >
                          Xem chi tiết →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
