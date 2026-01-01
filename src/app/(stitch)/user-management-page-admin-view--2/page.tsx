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
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Building2,
  Verified,
  Lock,
  Edit,
  X,
  User,
  Ticket,
  Calendar,
  Phone,
  Mail,
  Globe,
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

export default function UserManagementPageAdminView2() {
  const [selectedCompany, setSelectedCompany] = useState<number | null>(0);

  const companies = [
    {
      id: 0,
      name: "Saigon Tourist Travel",
      taxId: "0300625210",
      location: "TP. Hồ Chí Minh",
      operator: "Phạm Huy Bình",
      operatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-P_nGfsTzY0jcv0cGv_C91ja2_384Hj_Ak2EfRlkiRRjXABSz6Uo6tvzxGHev5QuwpaLPnPNdQhELcTZePws5WBQ0ExiIvZKIYWQcY3q6g2LyS_8iWLfRamI7m8-yZxdE0UZNtVAurVez282oPFp0MNktNWLwh6PFR6PW2J5Z7HVazijSwap9VXzkDjZj8Lx5EcJ_UAc33jU-MrdSQZOytb8xm5L46EsCQf3iUGhqxrqoySlEZFTBM-KzAZI47aWOPZx69gTTDw",
      email: "info@saigontourist.net",
      phone: "028 3822 5887",
      tours: 45,
      guides: 12,
      status: "VERIFIED",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-P_nGfsTzY0jcv0cGv_C91ja2_384Hj_Ak2EfRlkiRRjXABSz6Uo6tvzxGHev5QuwpaLPnPNdQhELcTZePws5WBQ0ExiIvZKIYWQcY3q6g2LyS_8iWLfRamI7m8-yZxdE0UZNtVAurVez282oPFp0MNktNWLwh6PFR6PW2J5Z7HVazijSwap9VXzkDjZj8Lx5EcJ_UAc33jU-MrdSQZOytb8xm5L46EsCQf3iUGhqxrqoySlEZFTBM-KzAZI47aWOPZx69gTTDw",
      license: "79-001/2023/TCDL-GP",
      address: "45 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      website: "www.saigontourist.net",
      operatorPhone: "0912 345 678",
    },
    // ... more companies would go here
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary"
          >
            <Building className="h-5 w-5 fill-primary" />
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
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#f0f1f5] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-[#606e8a] text-sm">
            <Home className="h-5 w-5" />
            <span>/</span>
            <span className="text-[#111318] font-medium">Quản lý Công ty</span>
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
                <h2 className="text-2xl font-bold text-[#111318]">Danh sách Công ty Lữ hành</h2>
                <p className="text-[#606e8a] text-sm mt-1">
                  Quản lý thông tin, trạng thái và hoạt động của các đối tác trên nền tảng.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất danh sách
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Đối tác mới
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-[#606e8a] text-sm font-medium mb-1">Tổng Công ty đăng ký</p>
                    <h3 className="text-2xl font-bold text-[#111318]">142</h3>
                    <p className="text-green-600 text-xs font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> +5 mới tháng này
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-[#606e8a] text-sm font-medium mb-1">Đã xác minh (Verified)</p>
                    <h3 className="text-2xl font-bold text-[#111318]">128</h3>
                    <p className="text-[#606e8a] text-xs font-medium mt-1 flex items-center gap-1">
                      Hoạt động ổn định
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                    <Verified className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-[#606e8a] text-sm font-medium mb-1">Chờ duyệt (Pending)</p>
                    <h3 className="text-2xl font-bold text-[#111318]">8</h3>
                    <p className="text-red-600 text-xs font-medium mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Cần xử lý ngay
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full lg:w-auto flex-1 max-w-xl">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9aa2b1]" />
                    <Input
                      className="pl-10 pr-3 py-2.5 border border-[#e5e7eb] rounded-lg bg-background-light text-[#111318] placeholder-[#9aa2b1] focus:bg-white"
                      placeholder="Tìm kiếm theo tên công ty, mã số thuế..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Tỉnh / Thành" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tỉnh / Thành</SelectItem>
                      <SelectItem value="hanoi">Hà Nội</SelectItem>
                      <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="danang">Đà Nẵng</SelectItem>
                      <SelectItem value="khanhhoa">Khánh Hòa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Trạng thái</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="locked">Locked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#f8f9fc]">
                    <TableRow>
                      <TableHead className="w-1/3">Tên công ty</TableHead>
                      <TableHead>Người đại diện (Operator)</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Quy mô</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow
                        key={company.id}
                        className={`cursor-pointer ${
                          selectedCompany === company.id ? "bg-blue-50/30 border-l-4 border-l-blue-500" : ""
                        }`}
                        onClick={() => setSelectedCompany(company.id)}
                      >
                        <TableCell>
                          <div className="flex items-start">
                            <div className="relative size-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 p-1 bg-white">
                              <Image
                                src={company.logo}
                                alt={company.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-[#111318]">{company.name}</div>
                              <div className="text-xs text-[#606e8a] mt-0.5">MST: {company.taxId}</div>
                              <div className="text-xs text-[#606e8a]">{company.location}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="relative size-6 rounded-full overflow-hidden">
                              <Image
                                src={company.operatorAvatar}
                                alt={company.operator}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm text-[#111318] font-medium ml-2">{company.operator}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-[#111318]">{company.email}</div>
                          <div className="text-xs text-[#606e8a]">{company.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-[#111318]">{company.tours} Tour</div>
                          <div className="text-xs text-[#606e8a]">{company.guides} Hướng dẫn viên</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              company.status === "VERIFIED"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : company.status === "PENDING"
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {company.status === "VERIFIED" && <Verified className="h-3 w-3 mr-1" />}
                            {company.status === "LOCKED" && <Lock className="h-3 w-3 mr-1" />}
                            {company.status}
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
                  <span className="font-medium text-[#111318]">142</span> Công ty
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Trước
                  </Button>
                  <Button size="sm" className="bg-primary">1</Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    ...
                  </Button>
                  <Button variant="outline" size="sm">
                    14
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

      {/* Detail Sidebar - Simplified version, can be expanded */}
      {selectedCompany !== null && (
        <div className="fixed inset-y-0 right-0 w-[520px] bg-white shadow-2xl z-30 border-l border-[#e5e7eb] flex flex-col h-full">
          <div className="relative h-44 bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white"
              onClick={() => setSelectedCompany(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute -bottom-10 left-6 flex items-end">
              <div className="relative size-20 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden p-1">
                <Image
                  src={companies[selectedCompany]?.logo || ""}
                  alt={companies[selectedCompany]?.name || ""}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="absolute bottom-4 left-28 right-6">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-500 text-white">VERIFIED</Badge>
                <span className="text-xs text-gray-300 font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {companies[selectedCompany]?.location}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight truncate">
                {companies[selectedCompany]?.name}
              </h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white pt-12">
            <div className="sticky top-0 bg-white z-10 border-b border-[#f0f1f5] px-6 flex gap-6">
              <Button variant="ghost" className="border-b-2 border-primary text-primary rounded-none">
                Tổng quan
              </Button>
              <Button variant="ghost" className="rounded-none">
                Thành viên <Badge className="ml-1">12</Badge>
              </Button>
              <Button variant="ghost" className="rounded-none">
                Tour <Badge className="ml-1">45</Badge>
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-[#111318] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5" /> Thông tin công ty
                </h4>
                <Card className="bg-background-light border-gray-100">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#606e8a] text-xs">Mã số thuế</p>
                        <p className="font-medium text-[#111318] text-sm">{companies[selectedCompany]?.taxId}</p>
                      </div>
                      <div>
                        <p className="text-[#606e8a] text-xs">Giấy phép LHQT</p>
                        <p className="font-medium text-[#111318] text-sm">
                          {companies[selectedCompany]?.license}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[#606e8a] text-xs">Địa chỉ trụ sở</p>
                      <p className="font-medium text-[#111318] text-sm mt-0.5">
                        {companies[selectedCompany]?.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#606e8a] text-xs">Website</p>
                      <Link href="#" className="font-medium text-primary text-sm mt-0.5 hover:underline flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {companies[selectedCompany]?.website}
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#606e8a] text-xs">Người đại diện</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="relative size-6 rounded-full overflow-hidden">
                            <Image
                              src={companies[selectedCompany]?.operatorAvatar || ""}
                              alt={companies[selectedCompany]?.operator || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="font-medium text-[#111318] text-sm">
                            {companies[selectedCompany]?.operator}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#606e8a] text-xs">Điện thoại</p>
                        <p className="font-medium text-[#111318] text-sm mt-1 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {companies[selectedCompany]?.operatorPhone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="p-4 border-t border-[#f0f1f5] bg-gray-50 flex gap-3">
              <Button variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa hồ sơ
              </Button>
              <Button variant="outline" className="flex-1 border-red-100 bg-red-50 text-red-600 hover:bg-red-100">
                <Lock className="h-4 w-4 mr-2" />
                Khóa tài khoản
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

