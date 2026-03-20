"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  MapPin,
  Plus,
  Briefcase,
  Users,
  Shield,
  Wallet,
  Bell,
  Menu,
  X,
  Building2,
  FileText,
  CheckCircle2,
  CreditCard,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Settings,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ onClose, isMobile }: SidebarProps = {}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const role = (session.user as any)?.role;
  const userEmail = session.user?.email;

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const getMenuItems = () => {
    if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
      return [
        {
          href: "/dashboard/operator",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        { href: "/dashboard/operator/tours", label: "Browse", icon: MapPin },
        { href: "/dashboard/operator/tours", label: "My Tours", icon: MapPin },
        { href: "/dashboard/operator/tours/new", label: "Tạo Tour", icon: Plus },
        {
          href: "/dashboard/operator/applications",
          label: "Ứng tuyển",
          icon: Briefcase,
        },
        {
          href: "/dashboard/operator/payments",
          label: "Thanh toán",
          icon: DollarSign,
        },
        {
          href: "/dashboard/operator/emergencies",
          label: "SOS Reports",
          icon: AlertTriangle,
        },
        { href: "/dashboard/operator/company", label: "Công ty", icon: Building2 },
        { href: "/dashboard/operator/standby-requests", label: "Standby Requests", icon: AlertTriangle },
        { href: "/dashboard/operator/profile", label: "Profile", icon: Users },
        { href: "/dashboard/operator/wallet", label: "Ví", icon: Wallet },
        { href: "/dashboard/operator/settings", label: "Settings", icon: Settings },
      ];
    } else if (role === "TOUR_GUIDE") {
      return [
        {
          href: "/dashboard/guide",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        { href: "/dashboard/guide/tours", label: "Tìm Tour", icon: MapPin },
        { href: "/dashboard/guide/tours", label: "Tours", icon: MapPin },
        {
          href: "/dashboard/guide/applications",
          label: "Ứng tuyển",
          icon: Briefcase,
        },
        { href: "/dashboard/guide/assignments", label: "Phân công", icon: FileText },
        { href: "/dashboard/guide/tours", label: "Tours của tôi", icon: MapPin },
        { href: "/dashboard/guide/standby-requests", label: "Standby Requests", icon: AlertTriangle },
        { href: "/dashboard/guide/availability", label: "Availability", icon: Calendar },
        { href: "/dashboard/guide/profile", label: "Profile", icon: Users },
        { href: "/dashboard/guide/wallet", label: "Ví", icon: Wallet },
        { href: "/dashboard/guide/settings", label: "Settings", icon: Settings },
      ];
    } else {
      // Admin - role-based menu
      const adminRole = role?.startsWith("ADMIN_") 
        ? role.replace("ADMIN_", "") 
        : role;
      
      const isSuperAdmin = adminRole === "SUPER_ADMIN";
      const isModerator = adminRole === "MODERATOR" || isSuperAdmin;
      const isSupportStaff = adminRole === "SUPPORT_STAFF" || isModerator;

      const menuItems: Array<{
        href: string;
        label: string;
        icon: any;
      }> = [
        {
          href: "/dashboard/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ];

      // Disputes - Moderator, Super Admin, Support Staff
      if (isSupportStaff) {
        menuItems.push({
          href: "/dashboard/admin/disputes",
          label: "Disputes",
          icon: Shield,
        });
      }

      // Verifications - Moderator, Super Admin
      if (isModerator) {
        menuItems.push({
          href: "/dashboard/admin/verifications",
          label: "Xác minh",
          icon: CheckCircle2,
        });
      }

      // Top-up/Withdrawal Requests - Super Admin only
      if (isSuperAdmin) {
        menuItems.push({
          href: "/dashboard/admin/requests",
          label: "Yêu cầu tài chính",
          icon: CreditCard,
        });
        menuItems.push({
          href: "/dashboard/admin/transfers",
          label: "Internal Transfer",
          icon: Wallet,
        });
      }

      // Users - Super Admin only
      if (isSuperAdmin) {
        menuItems.push({
          href: "/dashboard/admin/users",
          label: "Users",
          icon: Users,
        });
        menuItems.push({
          href: "/dashboard/admin/payment-settings",
          label: "Cài đặt thanh toán",
          icon: CreditCard,
        });
      }

      // Tours - Moderator, Super Admin
      if (isModerator) {
        menuItems.push({
          href: "/dashboard/admin/tours",
          label: "Tours",
          icon: MapPin,
        });
      }

      // Companies - Super Admin only
      if (isSuperAdmin) {
        menuItems.push({
          href: "/dashboard/admin/companies",
          label: "Companies",
          icon: Building2,
        });
      }

      return menuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div onClick={handleLinkClick}>
          <Logo size="sm" variant="dark" showText={true} />
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0096C7] to-[#0077B6] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {userEmail?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {userEmail}
            </p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-gradient-to-r from-[#0096C7] to-[#0077B6] text-white shadow-sm"
                      : "text-slate-700 hover:bg-lunavia-light hover:text-[#0077B6]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={handleLinkClick}
        >
          <X className="h-5 w-5" />
          Đăng xuất
        </Link>
      </div>
    </div>
  );
}

