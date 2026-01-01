"use client";

import React from "react";
import { Bell, Search, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface TopNavProps {
  onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?read=false");
        if (!response.ok) {
          // If unauthorized or error, don't show error, just set count to 0
          if (response.status === 401) {
            setUnreadCount(0);
            return;
          }
          // For other errors, log but don't throw
          console.warn("Failed to fetch notifications:", response.status);
          return;
        }
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        // Silently handle network errors - don't spam console
        // Only log if it's not a network error
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          // Network error - likely offline or server down, ignore
          return;
        }
        console.error("Error fetching notifications:", error);
      }
    };

    if (session) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16">
        {/* Mobile menu button */}
        {onMenuClick && (
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

