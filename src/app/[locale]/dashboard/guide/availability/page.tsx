"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AvailabilityPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  // Get current month start and end dates
  const getMonthRange = (month: string) => {
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const { startDate, endDate } = getMonthRange(selectedMonth);

  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ["availability", startDate, endDate],
    queryFn: () => api.availability.get(startDate, endDate),
  });

  const statusMutation = useMutation({
    mutationFn: (status: "AVAILABLE" | "BUSY" | "ON_TOUR") =>
      api.availability.update({ status }),
    onSuccess: () => {
      toast.success("Availability status updated!");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to update availability");
    },
  });

  const dateMutation = useMutation({
    mutationFn: (data: { date: string; slots: any[] }) =>
      api.availability.update(data),
    onSuccess: () => {
      toast.success("Availability updated for this date!");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to update availability");
    },
  });

  const currentStatus = availabilityData?.currentStatus || "AVAILABLE";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "BUSY":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "ON_TOUR":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Available";
      case "BUSY":
        return "Busy";
      case "ON_TOUR":
        return "On Tour";
      default:
        return status;
    }
  };

  // Generate calendar days for the month
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      days.push(date);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const availabilityMap = new Map(
    (availabilityData?.availabilities || []).map((av: any) => {
      // Format date string in local timezone
      const d = new Date(av.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      return [dateStr, av];
    })
  );

  const handleDateClick = (date: Date) => {
    // Format date string in local timezone to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    setSelectedDate(dateStr);
  };

  const handleSetDateAvailability = (status: "available" | "busy" | "on_tour") => {
    const slots = [{ status: status.toUpperCase() }];
    dateMutation.mutate({
      date: selectedDate,
      slots,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Manage Availability"
          description="Update your availability status"
        />

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(currentStatus)}
                <span className="font-medium">{getStatusLabel(currentStatus)}</span>
              </div>
              <Select
                value={currentStatus}
                onValueChange={(value) =>
                  statusMutation.mutate(value as "AVAILABLE" | "BUSY" | "ON_TOUR")
                }
                disabled={statusMutation.isPending}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                  <SelectItem value="BUSY">Bận</SelectItem>
                  <SelectItem value="ON_TOUR">Đang tour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Status này sẽ áp dụng cho tất cả các ngày chưa được set cụ thể
            </p>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="month">Tháng:</Label>
                <input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1 border rounded-md"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : (
              <>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                    <div
                      key={day}
                      className="text-center font-medium text-slate-600 py-2"
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-12" />;
                    }

                    // Format date string in local timezone to avoid timezone issues
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    const dateStr = `${year}-${month}-${day}`;
                    
                    const availability = availabilityMap.get(dateStr);
                    const isSelected = selectedDate === dateStr;
                    
                    // Check if today in local timezone
                    const today = new Date();
                    const todayYear = today.getFullYear();
                    const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
                    const todayDay = String(today.getDate()).padStart(2, "0");
                    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
                    const isToday = dateStr === todayStr;

                    let dayStatus = currentStatus;
                    const avail = availability as any;
                    if (avail?.slots && Array.isArray(avail.slots) && avail.slots[0]?.status) {
                      dayStatus = avail.slots[0].status;
                    }

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateClick(date)}
                        className={`
                          h-12 border rounded-md text-sm transition-colors
                          ${isSelected ? "ring-2 ring-blue-500" : ""}
                          ${isToday ? "bg-blue-50 font-bold" : ""}
                          ${
                            dayStatus === "AVAILABLE"
                              ? "bg-green-50 hover:bg-green-100"
                              : dayStatus === "BUSY"
                              ? "bg-red-50 hover:bg-red-100"
                              : dayStatus === "ON_TOUR"
                              ? "bg-blue-50 hover:bg-blue-100"
                              : "bg-slate-50 hover:bg-slate-100"
                          }
                        `}
                      >
                        <div className="flex flex-col items-center">
                          <span>{date.getDate()}</span>
                          {getStatusIcon(dayStatus)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Date Actions */}
                {selectedDate && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Calendar className="h-5 w-5 text-slate-600" />
                      <span className="font-medium">
                        {formatDate(new Date(selectedDate + "T00:00:00"))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDateAvailability("available")}
                        disabled={dateMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Sẵn sàng
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDateAvailability("busy")}
                        disabled={dateMutation.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Bận
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDateAvailability("on_tour")}
                        disabled={dateMutation.isPending}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Đang tour
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Click vào ngày trên calendar để chọn, sau đó set trạng thái cụ thể
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

