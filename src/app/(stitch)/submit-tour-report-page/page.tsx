import Link from "next/link";
import Image from "next/image";
import {
  TravelExplore,
  Menu,
  LayoutDashboard,
  MapPin,
  FileText,
  Wallet,
  User,
  LogOut,
  Bell,
  HelpCircle,
  Users,
  Star,
  Image as ImageIcon,
  Upload,
  X,
  Send,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitTourReportPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] font-display antialiased overflow-hidden">
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <aside className="w-[280px] bg-white border-r border-[#f0f2f4] flex flex-col h-full shrink-0 z-20 hidden lg:flex">
          <div className="p-4 flex items-center gap-4 text-[#111418] border-b border-[#f0f2f4]">
            <div className="size-8 text-primary">
              <TravelExplore className="h-8 w-8" />
            </div>
            <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">
              VietGuide Connect
            </h2>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
            {/* User Profile Summary */}
            <div className="flex gap-3 items-center mb-2">
              <div className="relative size-12 rounded-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmB5c8wQLZQLoMTc6vE3kjqYeAr-NqqHPzleEYj6gLF6iUhNRMAUfCdxkaXJ7N-A18vM1L1TVZsLRmut44qdcHMPFAVwOwjMktyIs3gnXDlS3Ou2ikqcTWLwaSc4owiyu1__RnYtMuJNUn0z8qAu2GU1dpBa1ReqMbIkFHyw1SfgZ0V2mDYD3ja9zRa0TVi_qhLv7Y95EMLt2h3yEza4v_aA3hQrV6QOqseoRjwVss_622x43VibPw0ywHErXixCV1uGLm-2-R3w"
                  alt="Portrait of a smiling tour guide"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#111418] text-base font-medium leading-normal">Nguyen Van A</h1>
                <p className="text-[#617589] text-sm font-normal leading-normal">Licensed Guide</p>
              </div>
            </div>
            {/* Nav Menu */}
            <nav className="flex flex-col gap-2">
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] text-[#111418] transition-colors"
              >
                <LayoutDashboard className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Dashboard</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] text-[#111418] transition-colors"
              >
                <MapPin className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">My Tours</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors"
              >
                <FileText className="h-6 w-6 fill-primary" />
                <p className="text-sm font-medium leading-normal">Reports</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] text-[#111418] transition-colors"
              >
                <Wallet className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Earnings</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] text-[#111418] transition-colors"
              >
                <User className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Profile</p>
              </Link>
            </nav>
          </div>
          <div className="p-4 border-t border-[#f0f2f4]">
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-[#f0f2f4] text-[#617589]"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Log Out</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-[#f0f2f4] bg-white shrink-0 z-10">
            <div className="flex items-center gap-4 lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5 cursor-pointer" />
              </Button>
              <span className="font-bold text-lg">VietGuide</span>
            </div>
            <div className="hidden lg:flex w-full justify-between items-center">
              {/* Breadcrumbs in header for easy access */}
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="#"
                  className="text-[#617589] hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <span className="text-[#617589]">/</span>
                <Link
                  href="#"
                  className="text-[#617589] hover:text-primary transition-colors"
                >
                  My Tours
                </Link>
                <span className="text-[#617589]">/</span>
                <span className="text-[#111418] font-medium">Submit Report</span>
              </div>
              <div className="flex gap-4 items-center">
                <Button variant="ghost" size="icon" className="size-10 flex items-center justify-center rounded-full hover:bg-[#f0f2f4] text-[#111418]">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-10 flex items-center justify-center rounded-full hover:bg-[#f0f2f4] text-[#111418]">
                  <HelpCircle className="h-5 w-5" />
                </Button>
                <div className="relative w-9 h-9 rounded-full border border-[#f0f2f4] overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv2QXZLRnT3NROSPTKcqrbp5RouO3yOzK3-0e46SL6Z40FZ_7Iyltn3atkX22dsQceX4E3ujeIVgKOBzRXRKMwbb1F3a0uDqjA0Uy28dqOvKsp8yt-4HOFb1CMf-7rmmzRE8_zJXSAdbGa0rqFuuwDPOOHLJPyGvGs_it4p7wzqAe_n2mD5A5TCUIFsrlVIdRpsHQ9a9IqSL0F1FCvaSMjVQ5WbarZGCXJq2Li4166ouAxIq-jO_EY77qJDlntUbjAmSKiu8qJbw"
                    alt="User avatar small"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
            <div className="max-w-[960px] mx-auto flex flex-col gap-8 pb-20">
              {/* Page Heading */}
              <div className="flex flex-col gap-2">
                <h1 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  Báo cáo sau tour
                </h1>
                <p className="text-[#617589] text-base font-normal leading-normal">
                  Vui lòng điền đầy đủ thông tin để hoàn tất quy trình và thanh toán.
                </p>
              </div>

              {/* Tour Context Card */}
              <Card className="bg-white rounded-xl border border-[#dbe0e6] shadow-sm overflow-hidden">
                <CardHeader className="bg-[#f8fafc] px-6 py-4 border-b border-[#dbe0e6] flex justify-between items-center flex-wrap gap-2">
                  <CardTitle className="font-bold text-[#111418]">Thông tin Tour</CardTitle>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Completed
                  </span>
                </CardHeader>
                <CardContent className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider mb-1">
                      Tour Name
                    </p>
                    <p className="text-[#111418] font-medium">Amazing Ha Long Bay 3D2N</p>
                  </div>
                  <div>
                    <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider mb-1">
                      Date
                    </p>
                    <p className="text-[#111418] font-medium">Oct 12 - Oct 14, 2024</p>
                  </div>
                  <div>
                    <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider mb-1">
                      Booking Reference
                    </p>
                    <p className="text-[#111418] font-medium font-mono">HLB-2405-01</p>
                  </div>
                </CardContent>
              </Card>

              {/* Main Report Form */}
              <div className="flex flex-col gap-8">
                {/* Section 1: General Info */}
                <Card className="bg-white rounded-xl p-6 shadow-sm border border-[#f0f2f4]">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#111418] mb-6 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Thông tin chung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Guests Count */}
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="guests" className="text-[#111418] text-sm font-medium">
                          Số lượng khách thực tế
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-5 w-5 text-[#617589]" />
                          </div>
                          <Input
                            id="guests"
                            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-[#111418] shadow-sm ring-1 ring-inset ring-[#dbe0e6] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-[#f8fafc]"
                            placeholder="Nhập số lượng khách"
                            type="number"
                          />
                        </div>
                      </div>
                      {/* Rating */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-[#111418] text-sm font-medium">
                          Đánh giá chất lượng tour
                        </Label>
                        <div className="flex items-center gap-1 h-[42px]">
                          {[...Array(4)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-8 w-8 text-yellow-400 fill-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                            />
                          ))}
                          <Star className="h-8 w-8 text-[#dbe0e6] hover:text-yellow-400 transition-colors hover:scale-110 transition-transform cursor-pointer" />
                          <span className="ml-2 text-sm font-medium text-[#617589]">(Tốt)</span>
                        </div>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description" className="text-[#111418] text-sm font-medium">
                        Mô tả tour & Ghi chú
                      </Label>
                      <Textarea
                        id="description"
                        className="block w-full rounded-lg border-0 py-2.5 px-3 text-[#111418] shadow-sm ring-1 ring-inset ring-[#dbe0e6] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-[#f8fafc]"
                        placeholder="Mô tả chi tiết chuyến đi, phản hồi của khách hàng hoặc các sự cố phát sinh..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Uploads */}
                <Card className="bg-white rounded-xl p-6 shadow-sm border border-[#f0f2f4]">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#111418] mb-6 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Hình ảnh & Tài liệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Image Upload */}
                    <div className="flex flex-col gap-3">
                      <Label className="text-[#111418] text-sm font-medium">
                        Hình ảnh chuyến đi (Images)
                      </Label>
                      <div className="flex justify-center rounded-xl border border-dashed border-[#dbe0e6] px-6 py-10 hover:bg-[#f8fafc] transition-colors cursor-pointer group/upload">
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-[#9ca3af] group-hover/upload:text-primary mb-3 block" />
                          <div className="flex text-sm leading-6 text-[#617589] justify-center">
                            <Label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-blue-600"
                            >
                              <span>Upload files</span>
                              <Input
                                className="sr-only"
                                id="file-upload"
                                name="file-upload"
                                type="file"
                              />
                            </Label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-[#9ca3af]">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                      {/* Preview list (Mockup) */}
                      <div className="flex gap-4 mt-2 overflow-x-auto pb-2">
                        <div className="relative size-20 rounded-lg overflow-hidden shrink-0 group">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf-PDRBBj643xQVlwmAXaMHN5Dn5BGoEDYfRlGO-q3TpXU2AfaxHfeXvWWypMkrEDPIj-oY4MosENvMzGFL4iJJXUf0okWyD1Hfi6vFa0V-TpMqi5hlHR8-mhf3QROkyK_9fXTQdnVMTwx1wIQdF_eXmsCz6cJ3QEJvijCG65NToKVCHq63Wls5I8sqeN-KMItAHtGr6YNMMGhHQIurbq_psG_pp-DWss5fjdQ_wFVePuq7rgTX1H2ibmNHWGiTMpJPCdYzsH6Cw"
                            alt="Tour photo 1"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <X className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="relative size-20 rounded-lg overflow-hidden shrink-0 group">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhwxKV6F5i81ANaf3fPyH_1LuuawS5SdDm89RtpF41DgOJYjNJ1u--8m4u8fsYOkgulh9cPXO_azJgejseqLf_IaxEbbcFwZi0DcHKHmqaCiDLRxYhAIe9cfLitKJd4b_RI3w3SHarzQ10X4Pon5foFKv73R7To3zREht7V30HaXIUquv4D1n-_vhj4Nx_rfMaGbvBTSPL0xbSfleDuQnlkWTvx8wjjgLtE-XHr-PavYtNFqrNjYckiPoV9t__koFrWtS9T9Ihcw"
                            alt="Tour photo 2"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <X className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Doc Upload */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-[#111418] text-sm font-medium">
                          Tài liệu đính kèm (Documents)
                        </Label>
                        <div className="group relative flex items-center gap-1 cursor-help">
                          <Info className="h-[18px] w-[18px] text-[#617589]" />
                          <span className="text-xs text-[#617589] border-b border-dashed border-[#617589]">
                            Yêu cầu Luật Du Lịch 2025
                          </span>
                          {/* Tooltip */}
                          <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-[#111418] text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Vui lòng tải lên danh sách hành khách và nhật ký tour theo quy định mới.
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-[#dbe0e6] bg-[#f8fafc] p-4 flex items-center gap-4">
                        <Button
                          variant="outline"
                          className="bg-white hover:bg-gray-50 text-[#111418] font-medium py-2 px-4 border border-[#dbe0e6] rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2"
                        >
                          <Upload className="h-5 w-5" />
                          Select Files
                        </Button>
                        <p className="text-sm text-[#617589]">No file chosen</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Payment */}
                <Card className="bg-white rounded-xl p-6 shadow-sm border border-[#f0f2f4] ring-1 ring-primary/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#111418] mb-6 flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="relative flex gap-x-3">
                      <div className="flex h-6 items-center">
                        <Checkbox
                          defaultChecked
                          id="payment_request"
                          name="payment_request"
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <div className="text-sm leading-6">
                        <Label
                          htmlFor="payment_request"
                          className="font-medium text-[#111418] cursor-pointer"
                        >
                          Yêu cầu thanh toán
                        </Label>
                        <p className="text-[#617589]">
                          Tôi muốn gửi yêu cầu thanh toán cho tour này ngay sau khi báo cáo được duyệt.
                        </p>
                      </div>
                    </div>
                    <div className="pl-8 transition-all duration-300 ease-in-out">
                      <Label htmlFor="amount" className="block text-sm font-medium leading-6 text-[#111418]">
                        Số tiền yêu cầu (VND)
                      </Label>
                      <div className="relative mt-2 rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-[#617589] sm:text-sm">₫</span>
                        </div>
                        <Input
                          id="amount"
                          name="amount"
                          className="block w-full rounded-md border-0 py-3 pl-8 pr-12 text-[#111418] ring-1 ring-inset ring-[#dbe0e6] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-primary text-lg font-medium font-mono tracking-wide"
                          placeholder="0"
                          defaultValue="5.000.000"
                          type="text"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-[#617589] sm:text-sm">VND</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-[#617589]">
                        Đã bao gồm các chi phí phát sinh được chấp thuận.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#f0f2f4]">
                  <Button
                    variant="outline"
                    className="px-6 py-2.5 rounded-lg text-[#111418] font-bold text-sm bg-white border border-[#dbe0e6] hover:bg-[#f8fafc] transition-colors"
                  >
                    Hủy bỏ
                  </Button>
                  <Button className="px-8 py-2.5 rounded-lg text-white font-bold text-sm bg-primary hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Gửi báo cáo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

