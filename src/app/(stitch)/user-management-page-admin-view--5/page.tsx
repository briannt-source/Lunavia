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
  Wallet,
  Send,
  ArrowDown,
  Download,
  Search,
  Lock,
  UserCircle,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

export default function MoneyTransfersPage() {
  const [senderAccount, setSenderAccount] = useState("");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const transactions = [
    {
      id: "#TRX-99821",
      date: "20/10/2023 14:30",
      sender: { name: "Saigon Tourist", initials: "ST", taxId: "0300625210" },
      receiver: { name: "Nguyễn Văn A", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmSJvEmq23kdVIdhy60CuIJDmfualfc1Uabyi2jZqvXf6wfg5Y6rjg8xJ9NycTGSOA7sjjx-gZBY2qa7MvyxYu9Ws_jS5LKrGxiv6klZWTWasMMy5DQTkRHvKDO146GtyW_XbdlYXAHMTrvZ5m7eA4IYy3m2qJQVvAlN2f6YZMZPpsh6K9UdrImNzaTstMUAipYrQ4Qw3smTS0k8ZU4N5u3oTG6s2Wl0XqysmXcvbFVH3JOyx6Q8O4jcLlILxSd1sRiZM0KYck9Q", role: "HDV Quốc tế" },
      amount: "5,000,000",
      description: "Thanh toán Tour",
      status: "completed",
    },
    {
      id: "#TRX-99820",
      date: "20/10/2023 10:15",
      sender: { name: "Admin System", initials: "AD", role: "Hệ thống" },
      receiver: { name: "Vietravel", initials: "VT", taxId: "0300465937" },
      amount: "150,000,000",
      description: "Hoàn tiền cọc",
      status: "processing",
    },
    {
      id: "#TRX-99819",
      date: "19/10/2023 16:45",
      sender: { name: "Oxalis Adventure", initials: "OA", taxId: "3100657982" },
      receiver: { name: "Trần Thị Mai", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmSJvEmq23kdVIdhy60CuIJDmfualfc1Uabyi2jZqvXf6wfg5Y6rjg8xJ9NycTGSOA7sjjx-gZBY2qa7MvyxYu9Ws_jS5LKrGxiv6klZWTWasMMy5DQTkRHvKDO146GtyW_XbdlYXAHMTrvZ5m7eA4IYy3m2qJQVvAlN2f6YZMZPpsh6K9UdrImNzaTstMUAipYrQ4Qw3smTS0k8ZU4N5u3oTG6s2Wl0XqysmXcvbFVH3JOyx6Q8O4jcLlILxSd1sRiZM0KYck9Q", role: "HDV Nội địa" },
      amount: "2,500,000",
      description: "Công tác phí",
      status: "failed",
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
              <p className="text-xs text-[#606e8a] truncate">admin@vntour.vn</p>
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
            <Home className="h-5 w-5" />
            <span>/</span>
            <span className="text-[#111318] font-medium">Quản lý Chuyển tiền</span>
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
                <h2 className="text-2xl font-bold text-[#111318]">Giao dịch & Chuyển tiền</h2>
                <p className="text-[#606e8a] text-sm mt-1">Quản lý dòng tiền, thực hiện giao dịch và theo dõi lịch sử thanh toán.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất báo cáo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* Left Column - Transfer Form */}
              <div className="xl:col-span-1 flex flex-col gap-6">
                <Card className="overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-[#f0f1f5] bg-gray-50/50 flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Chuyển tiền tài khoản
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">Admin Action</Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form className="flex flex-col gap-5">
                      <div className="space-y-1.5">
                        <Label>Tài khoản gửi (Sender)</Label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                          <Select value={senderAccount} onValueChange={setSenderAccount}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Chọn tài khoản..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">System Admin Wallet (********8899)</SelectItem>
                              <SelectItem value="comp1">Saigon Tourist Travel (********1234)</SelectItem>
                              <SelectItem value="comp2">Vietravel (********5678)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between text-xs text-[#606e8a] px-1">
                          <span>Số dư khả dụng:</span>
                          <span className="font-medium text-[#111318]">-- VND</span>
                        </div>
                      </div>

                      <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-[#f0f1f5] p-1.5 rounded-full border border-white shadow-sm text-[#606e8a]">
                          <ArrowDown className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Tài khoản nhận (Receiver)</Label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                          <Select value={receiverAccount} onValueChange={setReceiverAccount}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Chọn người nhận..." />
                            </SelectTrigger>
                            <SelectContent>
                              <optgroup label="Công ty Lữ hành">
                                <SelectItem value="comp3">Oxalis Adventure</SelectItem>
                                <SelectItem value="comp4">Green Discovery</SelectItem>
                              </optgroup>
                              <optgroup label="Hướng dẫn viên">
                                <SelectItem value="guide1">Nguyễn Văn A</SelectItem>
                                <SelectItem value="guide2">Trần Thị Mai</SelectItem>
                              </optgroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Số tiền (VND)</Label>
                        <div className="relative">
                          <Input
                            className="pr-12 font-semibold"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs">VND</span>
                        </div>
                        <p className="text-xs text-[#606e8a] px-1 italic">Hạn mức tối đa: 500,000,000 VND/lần</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Nội dung chuyển tiền</Label>
                        <Textarea
                          placeholder="Nhập nội dung..."
                          rows={2}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>

                      <div className="pt-2">
                        <Button className="w-full" size="lg">
                          <Send className="h-5 w-5 mr-2" />
                          Thực hiện chuyển tiền
                        </Button>
                        <p className="text-[11px] text-[#606e8a] text-center mt-3 flex items-center justify-center gap-1">
                          <Lock className="h-3.5 w-3.5 text-green-600" />
                          Giao dịch được mã hóa và bảo mật 2 lớp
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-[#606e8a] text-xs font-medium uppercase">Số dư hệ thống</p>
                      <p className="text-lg font-bold text-[#111318] mt-1">2.4 Tỷ</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-[#606e8a] text-xs font-medium uppercase">GD hôm nay</p>
                      <p className="text-lg font-bold text-green-600 mt-1">125 Tr</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Transaction History */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                <Card className="flex flex-col lg:flex-row gap-4 items-center justify-between p-4">
                  <h3 className="text-lg font-bold text-[#111318] whitespace-nowrap hidden lg:block">Lịch sử chuyển tiền</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9aa2b1]" />
                      <Input
                        className="pl-10"
                        placeholder="Tìm người gửi, người nhận..."
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Input type="date" className="w-full sm:w-auto" />
                      <Select>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Tất cả TT" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả TT</SelectItem>
                          <SelectItem value="success">Thành công</SelectItem>
                          <SelectItem value="processing">Đang xử lý</SelectItem>
                          <SelectItem value="failed">Thất bại</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden flex flex-col h-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#f8f9fc]">
                        <TableRow>
                          <TableHead className="uppercase tracking-wider">Giao dịch</TableHead>
                          <TableHead className="uppercase tracking-wider">Người gửi</TableHead>
                          <TableHead className="uppercase tracking-wider">Người nhận</TableHead>
                          <TableHead className="text-right uppercase tracking-wider">Số tiền (VND)</TableHead>
                          <TableHead className="text-center uppercase tracking-wider">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id} className="hover:bg-gray-50">
                            <TableCell className="whitespace-nowrap">
                              <div className="text-sm font-bold text-[#111318]">{tx.id}</div>
                              <div className="text-xs text-[#606e8a] mt-0.5">{tx.date}</div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="size-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3 shrink-0">
                                  {tx.sender.initials}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-[#111318]">{tx.sender.name}</div>
                                  {tx.sender.taxId && (
                                    <div className="text-[10px] text-[#606e8a]">MST: {tx.sender.taxId}</div>
                                  )}
                                  {tx.sender.role && (
                                    <div className="text-[10px] text-[#606e8a]">{tx.sender.role}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center">
                                {tx.receiver.avatar ? (
                                  <div className="relative size-8 rounded-full overflow-hidden mr-3 shrink-0 border border-gray-200">
                                    <Image
                                      src={tx.receiver.avatar}
                                      alt={tx.receiver.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="size-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3 shrink-0">
                                    {tx.receiver.initials}
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-[#111318]">{tx.receiver.name}</div>
                                  {tx.receiver.taxId && (
                                    <div className="text-[10px] text-[#606e8a]">MST: {tx.receiver.taxId}</div>
                                  )}
                                  {tx.receiver.role && (
                                    <div className="text-[10px] text-[#606e8a]">{tx.receiver.role}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right">
                              <div className="text-sm font-bold text-[#111318]">{tx.amount}</div>
                              <div className="text-[10px] text-[#606e8a]">{tx.description}</div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-center">
                              <Badge
                                variant={
                                  tx.status === "completed"
                                    ? "default"
                                    : tx.status === "processing"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={
                                  tx.status === "completed"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : tx.status === "processing"
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                }
                              >
                                {tx.status === "completed"
                                  ? "Hoàn thành"
                                  : tx.status === "processing"
                                  ? "Đang xử lý"
                                  : "Thất bại"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between bg-white mt-auto">
                    <p className="text-sm text-[#606e8a]">
                      Hiển thị <span className="font-medium text-[#111318]">1-5</span> của{" "}
                      <span className="font-medium text-[#111318]">1,280</span> Giao dịch
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Trước
                      </Button>
                      <Button variant="default" size="sm">
                        1
                      </Button>
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
          </div>
        </div>
      </main>
    </div>
  );
}

