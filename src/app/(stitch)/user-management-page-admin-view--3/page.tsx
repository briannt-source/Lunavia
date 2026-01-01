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
  TrendingUp,
  Search,
  Filter,
  FileText,
  Plus,
  Eye,
  Ticket,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  User,
  Phone,
  MessageSquare,
  Edit,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserManagementPageAdminView3() {
  const [selectedTour, setSelectedTour] = useState<number | null>(0);

  const tours = [
    {
      id: 0,
      title: "City Tour: Văn hóa Sài Gòn & Ẩm thực đường phố",
      code: "#TOUR-2405-089",
      operator: "Saigon Tourist",
      operatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-P_nGfsTzY0jcv0cGv_C91ja2_384Hj_Ak2EfRlkiRRjXABSz6Uo6tvzxGHev5QuwpaLPnPNdQhELcTZePws5WBQ0ExiIvZKIYWQcY3q6g2LyS_8iWLfRamI7m8-yZxdE0UZNtVAurVez282oPFp0MNktNWLwh6PFR6PW2J5Z7HVazijSwap9VXzkDjZj8Lx5EcJ_UAc33jU-MrdSQZOytb8xm5L46EsCQf3iUGhqxrqoySlEZFTBM-KzAZI47aWOPZx69gTTDw",
      location: "TP. HCM",
      startDate: "Hôm nay",
      duration: "Trong ngày",
      status: "IN_PROGRESS",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrZOBXjLp2nO3CYTkKgTLE3pGQ_OKP6Pc8CinetEGEvhC6gwl9VOa99HxghLcUN_vwogJvXTlL28cnEFUdl9kVBvnNCMaoLhTTMVoX_-NAPsEu08Hr9ip9p4xX7EgojZRyjV5dD1obPevP9WE-UjCzrBXso37umJaJUABVgmnDJUJXn77YBklMmGm7vMw32lJK-nlmS07kzXA6ssrNIrZnOpyZvhJUi_OLbF2vtSFBQTScUxvDPkyaq9VrI1lhGSsepIVV8nHsqg",
      budget: "1,200,000 ₫",
      type: "Văn hóa, Ẩm thực",
      meetingPoint: "Bưu điện Trung tâm Sài Gòn, Quận 1",
      guide: {
        name: "Nguyễn Văn A",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmSJvEmq23kdVIdhy60CuIJDmfualfc1Uabyi2jZqvXf6wfg5Y6rjg8xJ9NycTGSOA7sjjx-gZBY2qa7MvyxYu9Ws_jS5LKrGxiv6klZWTWasMMy5DQTkRHvKDO146GtyW_XbdlYXAHMTrvZ5m7eA4IYy3m2qJQVvAlN2f6YZMZPpsh6K9UdrImNzaTstMUAipYrQ4Qw3smTS0k8ZU4N5u3oTG6s2Wl0XqysmXcvbFVH3JOyx6Q8O4jcLlILxSd1sRiZM0KYck9Q",
        rating: 4.8,
        card: "Thẻ Quốc tế",
      },
    },
  ];

  return (
    <div className="font-display bg-background-light text-[#111318] overflow-hidden h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#f0f1f5] flex flex-col h-full shrink-0 z-20">
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Users className="h-5 w-5 group-hover:text-primary" />
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary"
          >
            <MapPin className="h-5 w-5 fill-primary" />
            <span className="text-sm font-medium">Danh sách Tour</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Shield className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Xác minh hồ sơ</span>
            <Badge className="ml-auto bg-red-100 text-red-600 hover:bg-red-100">12</Badge>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Building className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Ví & Thanh toán</span>
          </Link>
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-bold text-[#9aa2b1] uppercase tracking-wider">Cấu hình</p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Settings className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Cài đặt chung</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Shield className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Phân quyền</span>
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-[#f0f1f5] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-[#606e8a] text-sm">
            <Home className="h-5 w-5" />
            <span>/</span>
            <span className="text-[#111318] font-medium">Quản lý Tour</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111318]">Danh sách Tour hệ thống</h2>
                <p className="text-[#606e8a] text-sm mt-1">
                  Giám sát và quản lý tất cả các tour từ Operator trên nền tảng Lunavia.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Báo cáo tháng
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Tour thay mặt
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-[#606e8a] text-sm font-medium mb-1">Tổng Tour tháng này</p>
                    <h3 className="text-2xl font-bold text-[#111318]">452</h3>
                    <p className="text-green-600 text-xs font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> +18% so với tháng trước
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Ticket className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-[#606e8a] text-sm font-medium mb-1">Đang mở đăng ký (OPEN)</p>
                    <h3 className="text-2xl font-bold text-[#111318]">128</h3>
                    <p className="text-green-600 text-xs font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Cơ hội cho Guide
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-[#606e8a] text-sm font-medium mb-1">Đang diễn ra (In Progress)</p>
                    <h3 className="text-2xl font-bold text-[#111318]">42</h3>
                    <p className="text-blue-600 text-xs font-medium mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Cần giám sát
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full lg:w-auto flex-1 max-w-xl">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9aa2b1]" />
                    <Input
                      className="pl-10 pr-3 py-2.5 border border-[#e5e7eb] rounded-lg bg-background-light text-[#111318] placeholder-[#9aa2b1] focus:bg-white"
                      placeholder="Tìm kiếm theo tên tour, mã tour..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Operator</SelectItem>
                      <SelectItem value="saigontourist">Saigontourist</SelectItem>
                      <SelectItem value="vietravel">Vietravel</SelectItem>
                      <SelectItem value="hanoitourist">Hanoitourist</SelectItem>
                      <SelectItem value="oxalis">Oxalis Adventure</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Địa điểm</SelectItem>
                      <SelectItem value="hanoi">Hà Nội</SelectItem>
                      <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="danang">Đà Nẵng</SelectItem>
                      <SelectItem value="quangbinh">Quảng Bình</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Trạng thái</SelectItem>
                      <SelectItem value="DRAFT">DRAFT</SelectItem>
                      <SelectItem value="OPEN">OPEN</SelectItem>
                      <SelectItem value="CLOSED">CLOSED</SelectItem>
                      <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#f8f9fc]">
                    <TableRow>
                      <TableHead className="w-1/3">Thông tin Tour</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Địa điểm</TableHead>
                      <TableHead>Ngày đi - Về</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tour) => (
                      <TableRow
                        key={tour.id}
                        className={`cursor-pointer ${
                          selectedTour === tour.id ? "bg-blue-50/30 border-l-4 border-l-blue-500" : ""
                        }`}
                        onClick={() => setSelectedTour(tour.id)}
                      >
                        <TableCell>
                          <div className="flex items-start">
                            <div className="relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100">
                              <Image src={tour.thumbnail} alt={tour.title} fill className="object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-[#111318]">{tour.title}</div>
                              <div className="text-xs text-[#606e8a] mt-0.5">{tour.code}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="relative size-6 rounded-full overflow-hidden">
                              <Image src={tour.operatorAvatar} alt={tour.operator} fill className="object-cover" />
                            </div>
                            <span className="text-sm text-[#111318] font-medium ml-2">{tour.operator}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#606e8a]">{tour.location}</TableCell>
                        <TableCell>
                          <div className="text-sm text-[#111318]">{tour.startDate}</div>
                          <div className="text-xs text-[#606e8a]">{tour.duration}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tour.status === "OPEN"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : tour.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : tour.status === "DRAFT"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : tour.status === "CANCELLED"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {tour.status === "OPEN" && (
                              <span className="size-1.5 rounded-full bg-green-600 animate-pulse mr-1.5 inline-block" />
                            )}
                            {tour.status === "IN_PROGRESS" && (
                              <span className="size-1.5 rounded-full bg-blue-600 mr-1.5 inline-block" />
                            )}
                            {tour.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between bg-white">
                <p className="text-sm text-[#606e8a]">
                  Hiển thị <span className="font-medium text-[#111318]">1-5</span> của{" "}
                  <span className="font-medium text-[#111318]">452</span> Tour
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Trước
                  </Button>
                  <Button size="sm" className="bg-primary">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">...</Button>
                  <Button variant="outline" size="sm">
                    45
                  </Button>
                  <Button variant="outline" size="sm">
                    Sau
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Detail Sidebar */}
      {selectedTour !== null && tours[selectedTour] && (
        <div className="fixed inset-y-0 right-0 w-[520px] bg-white shadow-2xl z-30 border-l border-[#e5e7eb] flex flex-col h-full">
          <div className="relative h-40 bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white"
              onClick={() => setSelectedTour(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/90 text-white">IN_PROGRESS</Badge>
                <span className="text-xs text-gray-300 font-medium">{tours[selectedTour].code}</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">{tours[selectedTour].title}</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="sticky top-0 bg-white z-10 border-b border-[#f0f1f5] px-6 flex gap-6">
              <Button variant="ghost" className="border-b-2 border-primary text-primary rounded-none">
                Tổng quan
              </Button>
              <Button variant="ghost" className="rounded-none">
                Ứng viên <Badge className="ml-1">5</Badge>
              </Button>
              <Button variant="ghost" className="rounded-none">
                Báo cáo
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#e5e7eb] bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 rounded-full overflow-hidden border border-white shadow-sm">
                    <Image
                      src={tours[selectedTour].operatorAvatar}
                      alt={tours[selectedTour].operator}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[#606e8a] font-medium uppercase">Operator</p>
                    <p className="text-sm font-bold text-[#111318]">{tours[selectedTour].operator}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Xem hồ sơ
                </Button>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111318] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Thông tin chi tiết
                </h4>
                <Card className="bg-background-light border-gray-100">
                  <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#606e8a] text-xs">Ngày khởi hành</p>
                      <p className="font-medium text-[#111318] mt-0.5 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-[#606e8a]" /> {tours[selectedTour].startDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#606e8a] text-xs">Thời lượng</p>
                      <p className="font-medium text-[#111318] mt-0.5 flex items-center gap-1">
                        <Clock className="h-4 w-4 text-[#606e8a]" /> 8 Tiếng
                      </p>
                    </div>
                    <div>
                      <p className="text-[#606e8a] text-xs">Ngân sách Guide</p>
                      <p className="font-medium text-[#111318] mt-0.5 text-primary">{tours[selectedTour].budget}</p>
                    </div>
                    <div>
                      <p className="text-[#606e8a] text-xs">Loại hình</p>
                      <p className="font-medium text-[#111318] mt-0.5">{tours[selectedTour].type}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#606e8a] text-xs">Địa điểm tập trung</p>
                      <p className="font-medium text-[#111318] mt-0.5">{tours[selectedTour].meetingPoint}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="border-t border-[#f0f1f5] pt-6">
                <h4 className="text-sm font-bold text-[#111318] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" /> Hướng dẫn viên đã nhận (1/1)
                </h4>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="relative size-10 rounded-full overflow-hidden">
                        <Image src={tours[selectedTour].guide.avatar} alt={tours[selectedTour].guide.name} fill className="object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border border-white">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111318]">{tours[selectedTour].guide.name}</p>
                      <p className="text-xs text-[#606e8a]">
                        {tours[selectedTour].guide.card} • {tours[selectedTour].guide.rating}{" "}
                        <span className="text-yellow-500">★</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Trạng thái hệ thống
                  </h4>
                  <p className="text-sm text-blue-900 mb-3">
                    Tour đang diễn ra bình thường. Check-in vị trí lần cuối lúc 09:30 AM tại Dinh Độc Lập. Không có
                    báo cáo sự cố nào từ Guide hoặc Khách.
                  </p>
                  <Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                    Xem log hệ thống
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="p-4 border-t border-[#f0f1f5] bg-gray-50 flex gap-3">
              <Button variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="outline" className="flex-1 border-red-100 bg-red-50 text-red-600 hover:bg-red-100">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Dừng khẩn cấp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

