"use client";

import Link from "next/link";
import Image from "next/image";
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
  Wallet,
  ArrowDown,
  Plus,
  Verified,
  Lock,
  Savings,
  History,
  Calendar,
  Filter,
  CreditCard,
  Tour,
  CreditCardOff,
  LockClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function WalletOverviewPage() {
  const transactions = [
    {
      id: "TRX-20231020-001",
      type: "deposit",
      title: "Nạp tiền vào ví",
      description: "Qua VCB Bank Transfer",
      date: "20/10/2023",
      time: "14:30 PM",
      amount: "+ 50,000,000",
      amountColor: "text-green-600",
      status: "success",
      icon: CreditCard,
      iconBg: "bg-green-50 text-green-600",
    },
    {
      id: "PAY-20231019-882",
      type: "payment",
      title: "Thanh toán Tour #8832",
      description: "Booking cho đoàn khách Anh",
      date: "19/10/2023",
      time: "09:15 AM",
      amount: "- 12,500,000",
      amountColor: "text-[#111318]",
      status: "success",
      icon: Tour,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "WD-20231018-055",
      type: "withdrawal",
      title: "Rút tiền về ngân hàng",
      description: "Tới Techcombank ***8910",
      date: "18/10/2023",
      time: "16:45 PM",
      amount: "- 5,000,000",
      amountColor: "text-red-600",
      status: "processing",
      icon: CreditCardOff,
      iconBg: "bg-gray-100 text-[#606e8a]",
    },
    {
      id: "DEP-20230101-001",
      type: "deposit",
      title: "Đóng băng ký quỹ",
      description: "Theo quy định Luật DL 2025",
      date: "01/01/2023",
      time: "00:00 AM",
      amount: "50,000,000",
      amountColor: "text-[#606e8a]",
      status: "locked",
      icon: LockClock,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      id: "PAY-20231015-112",
      type: "payment",
      title: "Thanh toán Tour #8810",
      description: "Tour Hạ Long 2N1D",
      date: "15/10/2023",
      time: "11:20 AM",
      amount: "- 8,200,000",
      amountColor: "text-[#111318]",
      status: "success",
      icon: Tour,
      iconBg: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="font-display bg-background-light text-[#111318] overflow-hidden h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#f0f1f5] flex flex-col h-full shrink-0 z-20 hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-[#111318] text-lg font-bold leading-tight">Lunavia Admin</h1>
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary"
          >
            <Wallet className="h-5 w-5 fill-primary" />
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
              <p className="text-xs text-[#606e8a] truncate">admin@lunavia.vn</p>
            </div>
            <LogOut className="ml-auto h-5 w-5 text-[#606e8a]" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <header className="h-16 bg-white border-b border-[#f0f1f5] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-[#606e8a] text-sm">
            <Button variant="ghost" size="icon" className="lg:hidden mr-2">
              <Home className="h-5 w-5" />
            </Button>
            <Wallet className="h-5 w-5" />
            <span>/</span>
            <span className="text-[#111318] font-medium">Ví của tôi</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
              <Verified className="h-4 w-4" />
              Tài khoản đã xác thực
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background-light">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111318]">Tổng quan Ví</h2>
                <p className="text-[#606e8a] text-sm mt-1">Quản lý số dư, tiền gửi ký quỹ và lịch sử giao dịch.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <ArrowDown className="h-5 w-5 mr-2" />
                  Rút tiền
                </Button>
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Nạp tiền
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-[#0d59f2] to-[#0541c4] text-white border-0 shadow-lg shadow-blue-100 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="h-[120px] w-[120px]" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-2 mb-4 opacity-90">
                    <Wallet className="h-5 w-5" />
                    <span className="text-sm font-medium uppercase tracking-wide">Số dư khả dụng</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl lg:text-4xl font-bold tracking-tight">125,450,000</span>
                    <span className="text-lg font-medium opacity-80">₫</span>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded text-white">VND</span>
                    <span className="text-xs opacity-80 flex items-center gap-1">
                      <History className="h-3.5 w-3.5" />
                      Vừa cập nhật
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#606e8a]">
                      <Lock className="h-5 w-5" />
                      <span className="text-sm font-medium uppercase tracking-wide">Số dư ký quỹ</span>
                    </div>
                    <div className="bg-amber-50 text-amber-700 p-1.5 rounded-full">
                      <Shield className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 text-[#111318]">
                    <span className="text-3xl lg:text-4xl font-bold tracking-tight">50,000,000</span>
                    <span className="text-lg font-medium text-[#606e8a]">₫</span>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#f0f1f5] flex items-center gap-2">
                    <Shield className="h-4.5 w-4.5 text-amber-500" />
                    <p className="text-xs text-[#606e8a]">Khoản tiền này được giữ để đảm bảo nghĩa vụ du lịch.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#606e8a]">
                      <Savings className="h-5 w-5" />
                      <span className="text-sm font-medium uppercase tracking-wide">Tổng tài sản</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 text-[#111318]">
                    <span className="text-3xl lg:text-4xl font-bold tracking-tight">175,450,000</span>
                    <span className="text-lg font-medium text-[#606e8a]">₫</span>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#f0f1f5] flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="size-6 rounded-full bg-blue-100 border-2 border-white"></div>
                      <div className="size-6 rounded-full bg-amber-100 border-2 border-white"></div>
                    </div>
                    <p className="text-xs text-[#606e8a] pl-1">Bao gồm ví chính & tiền ký quỹ</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card className="flex flex-col flex-1 min-h-0">
              <CardHeader className="px-6 py-5 border-b border-[#f0f1f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-6 w-6 text-primary" />
                  Lịch sử giao dịch
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#606e8a]" />
                    <Input
                      className="pl-10 w-full sm:w-48"
                      placeholder="Tháng này: T10/2023"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#606e8a]" />
                    <Select>
                      <SelectTrigger className="pl-10 w-full sm:w-48">
                        <SelectValue placeholder="Tất cả giao dịch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả giao dịch</SelectItem>
                        <SelectItem value="deposit">Nạp tiền</SelectItem>
                        <SelectItem value="withdrawal">Rút tiền</SelectItem>
                        <SelectItem value="payment">Thanh toán</SelectItem>
                        <SelectItem value="deposit_lock">Ký quỹ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#f8f9fc] text-[#606e8a] border-b border-[#f0f1f5]">
                    <TableRow>
                      <TableHead className="font-semibold whitespace-nowrap">Giao dịch</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Mã tham chiếu</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Thời gian</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap">Số tiền</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-[#f0f1f5]">
                    {transactions.map((tx) => {
                      const IconComponent = tx.icon;
                      return (
                        <TableRow key={tx.id} className="hover:bg-gray-50 group transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`size-10 rounded-full ${tx.iconBg} flex items-center justify-center shrink-0`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-[#111318]">{tx.title}</p>
                                <p className="text-xs text-[#606e8a]">{tx.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-[#606e8a] text-xs">{tx.id}</TableCell>
                          <TableCell className="text-[#111318]">
                            <p>{tx.date}</p>
                            <p className="text-xs text-[#606e8a]">{tx.time}</p>
                          </TableCell>
                          <TableCell className={`text-right ${tx.amountColor} font-bold`}>
                            {tx.amount} ₫
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                tx.status === "success"
                                  ? "default"
                                  : tx.status === "processing"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                tx.status === "success"
                                  ? "bg-green-100 text-green-700"
                                  : tx.status === "processing"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                              }
                            >
                              {tx.status === "success"
                                ? "Thành công"
                                : tx.status === "processing"
                                ? "Đang xử lý"
                                : "Đã khoá"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-4 border-t border-[#f0f1f5] flex items-center justify-between">
                <p className="text-sm text-[#606e8a]">
                  Hiển thị <span className="font-bold text-[#111318]">5</span> trên{" "}
                  <span className="font-bold text-[#111318]">42</span> giao dịch
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" disabled>
                    <ArrowDown className="h-5 w-5 rotate-90" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ArrowDown className="h-5 w-5 -rotate-90" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

