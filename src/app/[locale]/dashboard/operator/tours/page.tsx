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
import { MapPin, Calendar, Search, Filter, Plus, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import Link from "next/link";

const TOUR_STATES: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  OPEN: { label: "Open", color: "bg-blue-50 text-blue-700" },
  PUBLISHED: { label: "Published", color: "bg-blue-50 text-blue-700" },
  ASSIGNED: { label: "Assigned", color: "bg-violet-50 text-violet-700" },
  CONFIRMED: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-600" },
  FAILED: { label: "Failed", color: "bg-red-50 text-red-600" },
};

export default function TourListPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "all");

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
    if (statusFilter === "sos") return false;
    return tour.status === statusFilter;
  });

  // Filter by search
  const searchFilteredTours = filteredTours.filter((tour: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      tour.title?.toLowerCase().includes(s) ||
      tour.city?.toLowerCase().includes(s) ||
      tour.code?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh Sách Tours</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và theo dõi tất cả tours của bạn</p>
        </div>
        <Link href="/dashboard/operator/tours/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm gap-1.5 active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Tạo Tour Mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm tour..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-lg border-gray-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-lg border-gray-200">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="attention">Cần chú ý</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-700">{searchFilteredTours.length}</span> tour
          </p>
        </div>
      </div>

      {/* Tour Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      ) : searchFilteredTours.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">Không tìm thấy tour nào</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {searchFilteredTours.map((tour: any) => {
            const state = TOUR_STATES[tour.status] || TOUR_STATES.DRAFT;
            return (
              <Link key={tour.id} href={`/dashboard/operator/tours/${tour.id}`}>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group"
                     style={{ boxShadow: 'var(--shadow-xs)' }}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {tour.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${state.color}`}>
                          {state.label}
                        </span>
                        {tour.code && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 font-mono shrink-0">
                            {tour.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tour.startDate), "dd/MM/yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tour.city}
                        </span>
                        {tour.pax && (
                          <span>{tour.pax} khách</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
