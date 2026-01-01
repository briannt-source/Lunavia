"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  TravelExplore,
  LayoutDashboard,
  Calendar,
  Ticket,
  Wallet,
  History,
  User,
  Settings,
  Menu,
  Bell,
  Home,
  LogOut,
  Send,
  Upload,
  Copy,
  CheckCircle2,
  Building,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletTopupPage() {
  const [amount, setAmount] = useState("5,000,000");
  const [paymentMethod, setPaymentMethod] = useState("bank");

  const quickAmounts = ["500,000", "1,000,000", "2,000,000", "5,000,000", "10,000,000"];

  return (
    <div className="font-display bg-background-light text-[#111318] overflow-hidden h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#f0f1f5] flex flex-col h-full shrink-0 z-20 hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <TravelExplore className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-[#111318] text-lg font-bold leading-tight">Lunavia Partner</h1>
            <p className="text-[#606e8a] text-xs font-normal">Dành cho Đối tác</p>
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
            <p className="text-xs font-bold text-[#9aa2b1] uppercase tracking-wider">Hoạt động</p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Calendar className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Lịch Tour</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Ticket className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Booking & Đặt chỗ</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary"
          >
            <Wallet className="h-5 w-5 fill-primary" />
            <span className="text-sm font-medium">Ví & Thanh toán</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <History className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Lịch sử giao dịch</span>
          </Link>
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-bold text-[#9aa2b1] uppercase tracking-wider">Tài khoản</p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <User className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Hồ sơ năng lực</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#606e8a] hover:bg-background-light group transition-colors"
          >
            <Settings className="h-5 w-5 group-hover:text-primary" />
            <span className="text-sm font-medium">Cài đặt</span>
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
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-medium text-[#111318] truncate">Nguyễn Văn A</p>
              <p className="text-xs text-[#606e8a] truncate">Tour Guide</p>
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
            <span className="text-[#606e8a]">Ví của tôi</span>
            <span>/</span>
            <span className="text-[#111318] font-medium">Nạp tiền</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">2,450,000 VND</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-[#111318]">Yêu cầu Nạp tiền</h2>
              <p className="text-[#606e8a] text-sm">Nạp tiền vào ví Lunavia để thanh toán dịch vụ và nhận booking.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Step 1: Amount */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary size-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      Nhập số tiền cần nạp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Label className="block text-sm font-medium text-[#606e8a] mb-1.5">Số tiền (VND)</Label>
                      <Input
                        className="w-full pl-4 pr-16 py-3 text-lg font-bold"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <span className="absolute right-4 top-[38px] text-gray-500 font-bold">VND</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amt) => (
                        <Button
                          key={amt}
                          variant={amount === amt ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAmount(amt)}
                          className={amount === amt ? "border-primary bg-blue-50 text-primary" : ""}
                        >
                          {amt}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary size-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      Chọn phương thức thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" className="sr-only" />
                        <label
                          htmlFor="bank"
                          className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "bank"
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-gray-100 rounded-lg flex items-center justify-center text-[#606e8a]">
                              <Building className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[#111318] text-sm">Chuyển khoản Ngân hàng</div>
                              <div className="text-xs text-[#606e8a]">Duyệt thủ công (15-30p)</div>
                            </div>
                            {paymentMethod === "bank" && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="momo" id="momo" className="sr-only" />
                        <label
                          htmlFor="momo"
                          className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "momo"
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-[#a50064]/10 rounded-lg flex items-center justify-center text-[#a50064] font-bold text-xs">
                              MoMo
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[#111318] text-sm">Ví MoMo</div>
                              <div className="text-xs text-[#606e8a]">Nạp tự động</div>
                            </div>
                            {paymentMethod === "momo" && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="zalopay" id="zalopay" className="sr-only" />
                        <label
                          htmlFor="zalopay"
                          className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "zalopay"
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-[#0068ff]/10 rounded-lg flex items-center justify-center text-[#0068ff] font-bold text-xs">
                              Zalo
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[#111318] text-sm">ZaloPay</div>
                              <div className="text-xs text-[#606e8a]">Nạp tự động</div>
                            </div>
                            {paymentMethod === "zalopay" && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" className="sr-only" />
                        <label
                          htmlFor="card"
                          className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "card"
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-gray-100 rounded-lg flex items-center justify-center text-[#606e8a]">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[#111318] text-sm">Thẻ Quốc tế</div>
                              <div className="text-xs text-[#606e8a]">Visa/Master/JCB</div>
                            </div>
                            {paymentMethod === "card" && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Step 3: Receipt Upload */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary size-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        Xác minh thanh toán
                      </CardTitle>
                      <span className="text-xs font-medium text-[#606e8a] bg-gray-100 px-2 py-1 rounded">Không bắt buộc</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Upload className="h-6 w-6 text-[#606e8a]" />
                      </div>
                      <p className="text-sm font-medium text-[#111318]">Click để tải lên hình ảnh biên lai</p>
                      <p className="text-xs text-[#606e8a] mt-1">Hỗ trợ JPG, PNG, PDF (Tối đa 5MB)</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Bank Info & Summary */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Bank Transfer Info */}
                <Card className="bg-gradient-to-br from-[#0d59f2] to-[#053cb5] text-white border-0 shadow-lg shadow-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-white/10 blur-xl"></div>
                  <div className="absolute bottom-0 left-0 -ml-8 -mb-8 size-24 rounded-full bg-white/10 blur-xl"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-white">Thông tin chuyển khoản</CardTitle>
                    <p className="text-blue-100 text-xs opacity-90">Vui lòng chuyển khoản chính xác số tiền vào tài khoản dưới đây.</p>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white text-[#005c2a] font-bold text-xs px-2 py-1 rounded shadow-sm">VCB</div>
                        <span className="font-semibold text-sm">Vietcombank</span>
                        <Button variant="ghost" size="icon" className="ml-auto text-blue-100 hover:text-white h-6 w-6">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-blue-200">Số tài khoản</p>
                        <p className="font-mono text-xl font-bold tracking-wider">0011 0022 3344</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-blue-200">Chủ tài khoản</p>
                        <p className="text-sm font-medium uppercase mt-0.5">LUNAVIA COMPANY LTD</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-blue-200">Nội dung chuyển khoản</p>
                        <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white text-xs h-auto p-0">
                          <Copy className="h-3 w-3 mr-1" /> Sao chép
                        </Button>
                      </div>
                      <p className="font-mono font-bold text-yellow-300 text-lg">NAP LUNA8829</p>
                      <p className="text-[10px] text-blue-200 mt-1 italic">*Hệ thống tự động duyệt dựa trên nội dung này</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Summary */}
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Chi tiết giao dịch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between text-[#606e8a]">
                      <span>Số tiền nạp</span>
                      <span className="font-medium text-[#111318]">{amount} VND</span>
                    </div>
                    <div className="flex justify-between text-[#606e8a]">
                      <span>Phí giao dịch</span>
                      <span className="font-medium text-green-600">Miễn phí</span>
                    </div>
                    <div className="h-px bg-[#f0f1f5] my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#111318]">Tổng thanh toán</span>
                      <span className="font-bold text-primary text-lg">{amount} VND</span>
                    </div>
                    <Button className="w-full mt-6" size="lg">
                      <Send className="h-5 w-5 mr-2" />
                      Gửi yêu cầu nạp tiền
                    </Button>
                    <p className="text-center text-xs text-[#606e8a] mt-3">
                      Bằng việc gửi yêu cầu, bạn đồng ý với{" "}
                      <Link href="#" className="text-primary hover:underline">
                        điều khoản sử dụng
                      </Link>{" "}
                      của Lunavia.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

