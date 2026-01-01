"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Wallet,
  Receipt,
  User,
  Menu,
  Bell,
  Home,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  Info,
  Lock,
  CreditCard,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function UserManagementPageAdminView1() {
  return (
    <div className="font-display bg-background-light text-[#111318] overflow-hidden h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#f0f1f5] flex flex-col h-full shrink-0 z-20 hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-[#111318] text-lg font-bold leading-tight">Lunavia Partner</h1>
            <p className="text-[#606e8a] text-xs font-normal">Cổng Đối tác</p>
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
            <p className="text-xs font-bold text-[#9aa2b1] uppercase tracking-wider">Công việc</p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Calendar className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Lịch dẫn tour</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <FileText className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Yêu cầu nhận Tour</span>
          </Link>
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-bold text-[#9aa2b1] uppercase tracking-wider">Tài chính</p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary"
          >
            <Wallet className="h-5 w-5 fill-primary" />
            <span className="text-sm font-medium">Ví của tôi</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Receipt className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Lịch sử giao dịch</span>
          </Link>
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-bold text-[#9aa2b1] uppercase tracking-wider">Cá nhân</p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <User className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Hồ sơ cá nhân</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-[#f0f1f5]">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-light cursor-pointer">
            <div className="relative size-9 rounded-full overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGxxGxo6jlUHrL5wJxbfrs0j1Xt-D-wSQIPWdE2UGPw_n_ujQ8cgr1gZ0BeCd9Y-dNEcVzMhvRM3iqmt8xzYdWexb9d_uxv-ZDbFn_ICV327Tf3lfNde-KFv9Ap-avrjvlR2azJm9Dt_OWvrWuhntZzwFpIMaW9xbBpjjem7DNjGxl6F9VC-TxVjuvYfD-6_ChnAEKvNl2dbpbhMy1WQm4PvBVvdWReiOamDHo4q3mM9IOBUJ6nxupHndgIGDczE_C7GFNw9bXZw"
                alt="User avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <p className="text-sm font-medium text-[#111318] truncate">Nguyễn Văn Hướng</p>
              <p className="text-xs text-[#606e8a] truncate">HDV Quốc tế</p>
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
            <Button variant="ghost" size="icon" className="lg:hidden mr-2">
              <Menu className="h-5 w-5" />
            </Button>
            <Home className="h-5 w-5" />
            <span>/</span>
            <span>Ví của tôi</span>
            <span>/</span>
            <span className="text-[#111318] font-medium">Rút tiền</span>
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
          <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Wallet Balance Card */}
              <Card className="md:col-span-2 bg-gradient-to-br from-[#0d59f2] to-[#063ba0] border-0 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <CardContent className="relative z-10 p-6 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Số dư khả dụng</p>
                      <h2 className="text-4xl font-bold tracking-tight">
                        15,450,000 <span className="text-2xl font-normal opacity-80">VND</span>
                      </h2>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-8 border-t border-white/20 pt-4">
                    <div>
                      <p className="text-blue-200 text-xs">Ký quỹ (Đang khóa)</p>
                      <p className="font-semibold text-lg">5,000,000 VND</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-xs">Thu nhập tháng 10</p>
                      <p className="font-semibold text-lg flex items-center gap-1">
                        + 2,100,000
                        <TrendingUp className="h-4 w-4" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="border border-gray-200">
                <CardContent className="p-6 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase">Đang xử lý</p>
                      <p className="text-xl font-bold text-gray-900">
                        0 <span className="text-xs font-normal text-gray-500">yêu cầu</span>
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-100"></div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase">Đã rút tháng này</p>
                      <p className="text-xl font-bold text-gray-900">
                        12,500,000 <span className="text-xs font-normal text-gray-500">VND</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawal Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Card className="border border-[#e5e7eb]">
                  <CardHeader className="px-6 md:px-8 py-6">
                    <CardTitle className="text-lg font-bold text-[#111318] flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Thông tin rút tiền
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 md:px-8 pb-6 space-y-6">
                    {/* Amount Input */}
                    <div>
                      <Label className="block text-sm font-medium text-[#111318] mb-2">
                        Nhập số tiền muốn rút
                      </Label>
                      <div className="relative">
                        <Input
                          className="w-full pl-4 pr-16 py-3 rounded-lg border-gray-300 focus:ring-primary focus:border-primary font-bold text-lg text-[#111318] placeholder:text-gray-300"
                          placeholder="0"
                          type="number"
                        />
                        <span className="absolute right-4 top-3.5 text-gray-500 font-medium">VND</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <p className="text-gray-500 ml-auto">Tối thiểu: 200,000 VND</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button variant="outline" size="sm" type="button">
                          1,000,000
                        </Button>
                        <Button variant="outline" size="sm" type="button">
                          2,000,000
                        </Button>
                        <Button variant="outline" size="sm" type="button">
                          5,000,000
                        </Button>
                        <Button variant="outline" size="sm" type="button">
                          Toàn bộ số dư
                        </Button>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label className="block text-sm font-medium text-[#111318] mb-3">
                        Chọn phương thức nhận tiền
                      </Label>
                      <RadioGroup defaultValue="bank" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer transition-all shadow-sm">
                          <RadioGroupItem value="bank" className="sr-only" />
                          <div className="size-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                            <Building className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-bold text-[#111318]">Ngân hàng</span>
                          <CheckCircle2 className="absolute top-2 right-2 text-primary h-5 w-5" />
                        </label>
                        <label className="relative flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all group">
                          <RadioGroupItem value="momo" className="sr-only" />
                          <div className="size-10 rounded-full bg-[#a50064] flex items-center justify-center text-white shadow-sm font-bold text-xs group-hover:scale-110 transition-transform">
                            MoMo
                          </div>
                          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                            Ví MoMo
                          </span>
                        </label>
                        <label className="relative flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all group">
                          <RadioGroupItem value="zalopay" className="sr-only" />
                          <div className="size-10 rounded-full bg-[#0068ff] flex items-center justify-center text-white shadow-sm font-bold text-xs group-hover:scale-110 transition-transform">
                            Zalo
                          </div>
                          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                            ZaloPay
                          </span>
                        </label>
                      </RadioGroup>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Ngân hàng thụ hưởng
                          </Label>
                          <Select defaultValue="vietcombank">
                            <SelectTrigger className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary py-2.5 text-sm text-[#111318]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vietcombank">
                                Vietcombank - TMCP Ngoại Thương VN
                              </SelectItem>
                              <SelectItem value="techcombank">Techcombank - TMCP Kỹ Thương VN</SelectItem>
                              <SelectItem value="mbbank">MBBank - TMCP Quân Đội</SelectItem>
                              <SelectItem value="acb">ACB - TMCP Á Châu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Số tài khoản
                          </Label>
                          <Input
                            className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary py-2.5 text-sm font-medium"
                            placeholder="VD: 1903..."
                            type="text"
                          />
                        </div>
                        <div>
                          <Label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Chủ tài khoản (Không dấu)
                          </Label>
                          <Input
                            className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary py-2.5 text-sm font-medium uppercase"
                            placeholder="NGUYEN VAN A"
                            type="text"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Nội dung (Tùy chọn)
                          </Label>
                          <Textarea
                            className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary py-2.5 text-sm"
                            placeholder="Rút tiền doanh thu tour..."
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-gray-500 pt-1">
                        <Info className="h-4 w-4 mt-0.5" />
                        <p>Hệ thống sẽ tự động lưu tài khoản này cho lần rút tiền sau.</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100">
                      <Button variant="ghost" type="button">
                        Hủy bỏ
                      </Button>
                      <Button className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-blue-200 transition-all active:scale-[0.98]">
                        Gửi yêu cầu
                        <Send className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Policy Card */}
                <Card className="bg-blue-50 border border-blue-100">
                  <CardContent className="p-5 relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="font-bold text-[#111318] flex items-center gap-2 mb-4">
                        <Info className="h-5 w-5 text-primary" />
                        Quy định rút tiền
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-[#111318]">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <span>
                            Tối thiểu mỗi lần rút: <strong>200,000 VND</strong>
                          </span>
                        </li>
                        <li className="flex gap-3 text-sm text-[#111318]">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <span>
                            Xử lý trong: <strong>24h</strong> làm việc (T2-T6).
                          </span>
                        </li>
                        <li className="flex gap-3 text-sm text-[#111318]">
                          <Info className="h-5 w-5 text-orange-500 shrink-0" />
                          <span className="text-gray-600 leading-tight">
                            Khoản tiền ký quỹ không thể rút cho đến khi chấm dứt hợp đồng đối tác.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent History */}
                <Card className="border border-[#e5e7eb]">
                  <CardHeader className="px-5 py-4 border-b border-[#f0f1f5] flex items-center justify-between">
                    <CardTitle className="font-bold text-sm text-[#111318]">Lịch sử gần đây</CardTitle>
                    <Link href="#" className="text-xs text-primary font-medium hover:underline">
                      Xem tất cả
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-[#f0f1f5]">
                    <div className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-[#606e8a]">20/10/2023 - 14:30</span>
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                          Chờ duyệt
                        </Badge>
                      </div>
                      <p className="font-bold text-[#111318] text-sm">- 5,000,000 VND</p>
                      <p className="text-xs text-[#606e8a] mt-0.5">Rút về VCB (0011...)</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-[#606e8a]">15/10/2023 - 09:15</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Thành công
                        </Badge>
                      </div>
                      <p className="font-bold text-[#111318] text-sm">- 2,500,000 VND</p>
                      <p className="text-xs text-[#606e8a] mt-0.5">Rút về MoMo</p>
                    </div>
                  </CardContent>
                  <div className="flex items-center justify-center gap-2 text-[#606e8a] text-xs p-4 opacity-80">
                    <Lock className="h-4 w-4" />
                    Giao dịch được mã hóa an toàn 256-bit
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

