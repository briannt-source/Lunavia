"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building,
  MapPin,
  Shield,
  Settings,
  Bell,
  Home,
  LogOut,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  X,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Lock,
  Mail,
  Phone,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      role: "TOUR_OPERATOR",
      status: "APPROVED",
      walletBalance: "15,000,000",
      joinDate: "12/10/2023",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmSJvEmq23kdVIdhy60CuIJDmfualfc1Uabyi2jZqvXf6wfg5Y6rjg8xJ9NycTGSOA7sjjx-gZBY2qa7MvyxYu9Ws_jS5LKrGxiv6klZWTWasMMy5DQTkRHvKDO146GtyW_XbdlYXAHMTrvZ5m7eA4IYy3m2qJQVvAlN2f6YZMZPpsh6K9UdrImNzaTstMUAipYrQ4Qw3smTS0k8ZU4N5u3oTG6s2Wl0XqysmXcvbFVH3JOyx6Q8O4jcLlILxSd1sRiZM0KYck9Q",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@travel.vn",
      role: "TOUR_GUIDE",
      status: "PENDING",
      walletBalance: "0",
      joinDate: "01/05/2024",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-P_nGfsTzY0jcv0cGv_C91ja2_384Hj_Ak2EfRlkiRRjXABSz6Uo6tvzxGHev5QuwpaLPnPNdQhELcTZePws5WBQ0ExiIvZKIYWQcY3q6g2LyS_8iWLfRamI7m8-yZxdE0UZNtVAurVez282oPFp0MNktNWLwh6PFR6PW2J5Z7HVazijSwap9VXzkDjZj8Lx5EcJ_UAc33jU-MrdSQZOytb8xm5L46EsCQf3iUGhqxrqoySlEZFTBM-KzAZI47aWOPZx69gTTDw",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@admin.vn",
      role: "ADMIN",
      status: "APPROVED",
      walletBalance: "-",
      joinDate: "15/08/2023",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDy0Zzjc1gebEg22HUuSGYIXNxVBeaT1b9LAoAWAeOdFiizdOn9_QAjNRlHVMiFKH5F1_5mRq0Vl6vv786qeyPr66k5ER_v3W9m5WcJkFx4yO97WKsizXGEIsxz7tNO3gT3EnTxJQBYM-K1obELA33As1T3pi6FZXE6IycaAA6MB2jg00kvVaI1I3lwcVs3fNqO8cdNHrJ0z3GqBmnWmkDaRQpnu65lYJvWAI3jDNfzL79AYWB1UUJIIwqINYWIozsWJHNBtYlLoA",
    },
  ];

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; className: string }> = {
      TOUR_OPERATOR: { label: "Tour Operator", className: "bg-blue-100 text-blue-800" },
      TOUR_AGENCY: { label: "Tour Agency", className: "bg-purple-100 text-purple-800" },
      TOUR_GUIDE: { label: "Tour Guide", className: "bg-teal-100 text-teal-800" },
      ADMIN: { label: "Admin", className: "bg-gray-100 text-gray-800" },
    };
    const roleInfo = roleMap[role] || { label: role, className: "bg-gray-100 text-gray-800" };
    return <Badge className={roleInfo.className}>{roleInfo.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") {
      return (
        <Badge className="bg-green-100 text-green-800 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          APPROVED
        </Badge>
      );
    } else if (status === "PENDING") {
      return (
        <Badge className="bg-orange-100 text-orange-800 gap-1">
          <span className="size-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          PENDING
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 gap-1">
          <XCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
  };

  return (
    <div className="font-display bg-background-light text-[#111318] overflow-hidden h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#f0f1f5] flex flex-col h-full shrink-0 z-20 hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-[#111318] text-lg font-bold leading-tight">VNTour Admin</h1>
            <p className="text-[#606e8a] text-xs font-normal">Portal Quản trị</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <LayoutDashboard className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Tổng quan</span>
          </Link>
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-bold text-[#9aa2b1] uppercase tracking-wider">Quản lý hệ thống</p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary"
          >
            <Users className="h-5 w-5 fill-primary" />
            <span className="text-sm font-medium">Người dùng</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Building className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Công ty Lữ hành</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <MapPin className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Danh sách Tour</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Shield className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Xác minh hồ sơ</span>
            <Badge className="ml-auto bg-red-100 text-red-600 hover:bg-red-100">4</Badge>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Wallet className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Ví & Thanh toán</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-[#f0f1f5]">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-light cursor-pointer">
            <div className="relative size-9 rounded-full overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGxxGxo6jlUHrL5wJxbfrs0j1Xt-D-wSQIPWdE2UGPw_n_ujQ8cgr1gZ0BeCd9Y-dNEcVzMhvRM3iqmt8xzYdWexb9d_uxv-ZDbFn_ICV327Tf3lfNde-KFv9Ap-avrjvlR2azJm9Dt_OWvrWuhntZzwFpIMaW9xbBpjjem7DNjGxl6F9VC-TxVjuvYfD-6_ChnAEKvNl2dbpbhMy1WQm4PvBVvdWReiOamDHo4q3mM9IOBUJ6nxupHndgIGDczE_C7GFNw9bXZw"
                alt="Admin avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <p className="text-sm font-medium text-[#111318] truncate">Minh Admin</p>
              <p className="text-xs text-[#606e8a] truncate">admin@vntour.vn</p>
            </div>
            <LogOut className="ml-auto h-5 w-5 text-[#606e8a]" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#f0f1f5] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-[#606e8a] text-sm">
            <button className="lg:hidden mr-2 text-[#606e8a]">
              <Menu className="h-5 w-5" />
            </button>
            <Home className="h-5 w-5" />
            <span>/</span>
            <span className="text-[#111318] font-medium">Quản lý Người dùng</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111318]">Danh sách Người dùng</h2>
                <p className="text-[#606e8a] text-sm mt-1">
                  Quản lý tất cả người dùng trong hệ thống. Có thể block/unblock hoặc xóa user nếu vi phạm quy định.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9aa2b1]" />
                    <Input
                      placeholder="Tìm theo tên, email hoặc ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Tất cả vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="TOUR_OPERATOR">Tour Operator</SelectItem>
                      <SelectItem value="TOUR_AGENCY">Tour Agency</SelectItem>
                      <SelectItem value="TOUR_GUIDE">Tour Guide</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="APPROVED">Đã xác thực</SelectItem>
                      <SelectItem value="PENDING">Chờ xác thực</SelectItem>
                      <SelectItem value="REJECTED">Từ chối</SelectItem>
                      <SelectItem value="LOCKED">Đã khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f8f9fc]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#606e8a] uppercase tracking-wider">User Info</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#606e8a] uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#606e8a] uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#606e8a] uppercase tracking-wider">Số dư ví</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#606e8a] uppercase tracking-wider">Ngày tham gia</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-[#606e8a] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#f0f1f5]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative size-10 rounded-full overflow-hidden mr-3 shrink-0 border border-gray-200">
                              <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#111318]">{user.name}</div>
                              <div className="text-sm text-[#606e8a]">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#111318] font-medium">
                          {user.walletBalance} ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#606e8a]">
                          {user.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

