"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import { Link } from '@/navigation';

export default function NotificationsPage() {
  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.notifications.list(),
  });

  const notifications = data?.notifications || [];

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi đánh dấu đã đọc");
    }
  };

  return (
    <>
      <PageHeader
        title="Thông báo"
        description={`${data?.unreadCount || 0} thông báo chưa đọc`}
      />

      <Card>
        <CardContent className="p-6">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Chưa có thông báo nào"
              description="Các thông báo sẽ xuất hiện ở đây"
            />
          ) : (
            <div className="space-y-4">
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    notif.read
                      ? "bg-white"
                      : "bg-teal-50 border-teal-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-teal-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notif.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Đã đọc
                        </Button>
                      )}
                      {notif.link && (
                        <Link href={notif.link}>
                          <Button size="sm">Xem</Button>
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
    </>
  );
}














