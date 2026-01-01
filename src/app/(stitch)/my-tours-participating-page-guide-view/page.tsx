import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Compass,
  Verified,
  User,
  HelpCircle,
  Menu,
  MapPin,
  Bell,
  Settings,
  Search,
  Download,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function MyToursParticipatingPageGuideView() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display antialiased overflow-hidden">
      <div className="flex h-screen w-full flex-row">
        {/* Side Navigation */}
        <aside className="w-64 flex-shrink-0 border-r border-[#dbe0e6] bg-white dark:bg-[#1a2632] dark:border-[#2a3846] hidden lg:flex flex-col z-20 transition-colors">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              {/* User Profile Summary in Sidebar */}
              <div className="flex gap-3 items-center pb-4 border-b border-[#f0f2f4] dark:border-[#2a3846]">
                <div className="relative size-12 rounded-full shadow-sm overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9tjp7zTxHKlipv0eAbU0iNLlTGojO6pfV3udLOVpZF653SCLDkJi5C81Ov-vqjb_510Iw7zxTtW2qY09HpWO3bUkSx98pt8XTVRiZlH0kusc1TzRwCYbJSmMjAm2Po8AhWtPdTl2sR79b7iZz-btLWeDqPGKYorAHQ_f6nxq50e1Rkmi9Wv7xwEYSFJmxET_mbfJGy0_41WqMBCq0S8P_MZg8J9WpWI7IZNVEF02xmdL9yzICGb-Tz74gskZxSj5lUjHkfhIi0A"
                    alt="Portrait of a smiling tour guide"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h1 className="text-[#111418] dark:text-white text-base font-bold leading-tight truncate">
                    Nguyễn Văn A
                  </h1>
                  <p className="text-[#617589] dark:text-slate-400 text-xs font-normal leading-normal truncate">
                    Thẻ HDV: 123-456-789
                  </p>
                </div>
              </div>
              {/* Navigation Links */}
              <nav className="flex flex-col gap-2">
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#111418] dark:text-slate-200 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] transition-colors group"
                >
                  <LayoutDashboard className="h-5 w-5 text-[#617589] group-hover:text-primary dark:text-slate-400" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                {/* Active State */}
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors"
                >
                  <Calendar className="h-5 w-5 fill-primary" />
                  <span className="text-sm font-bold">Tour Của Tôi</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#111418] dark:text-slate-200 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] transition-colors group"
                >
                  <Compass className="h-5 w-5 text-[#617589] group-hover:text-primary dark:text-slate-400" />
                  <span className="text-sm font-medium">Tour Đang Mở</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#111418] dark:text-slate-200 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] transition-colors group"
                >
                  <Verified className="h-5 w-5 text-[#617589] group-hover:text-primary dark:text-slate-400" />
                  <span className="text-sm font-medium">Chứng Chỉ</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#111418] dark:text-slate-200 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] transition-colors group"
                >
                  <User className="h-5 w-5 text-[#617589] group-hover:text-primary dark:text-slate-400" />
                  <span className="text-sm font-medium">Hồ Sơ</span>
                </Link>
              </nav>
            </div>
            {/* Bottom Links */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[#f0f2f4] dark:border-[#2a3846]">
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#111418] dark:text-slate-200 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-[#617589] dark:text-slate-400" />
                <span className="text-sm font-medium">Hỗ Trợ</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark transition-colors overflow-hidden">
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between border-b border-[#dbe0e6] bg-white dark:bg-[#1a2632] dark:border-[#2a3846] px-6 lg:px-10 shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden p-2 text-[#111418] dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 text-[#111418] dark:text-white">
                <div className="bg-primary rounded-md p-1 flex items-center justify-center text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Guide Portal</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center justify-center rounded-full size-10 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] text-[#111418] dark:text-white transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632]"></span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center justify-center rounded-full size-10 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] text-[#111418] dark:text-white transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto max-w-6xl flex flex-col gap-6">
              {/* Page Heading */}
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                  <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-tight">
                    Tour Của Tôi
                  </h1>
                  <p className="text-[#617589] dark:text-slate-400 text-base font-normal">
                    Quản lý các tour bạn đang tham gia hoặc đã hoàn thành.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-[#2a3846] rounded-lg text-sm font-bold text-[#111418] dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Download className="h-[18px] w-[18px]" />
                    Xuất báo cáo
                  </Button>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-[#2a3846] shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="h-16 w-16 text-primary" />
                  </div>
                  <p className="text-[#617589] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                    Đang hoạt động
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">3</p>
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-[#2a3846] shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="h-16 w-16 text-orange-500" />
                  </div>
                  <p className="text-[#617589] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                    Sắp tới
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">2</p>
                    <span className="text-xs text-orange-600 font-medium bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                      Upcoming
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-[#2a3846] shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle2 className="h-16 w-16 text-slate-500" />
                  </div>
                  <p className="text-[#617589] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                    Đã hoàn thành
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">45</p>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                      Total
                    </span>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2a3846] shadow-sm items-center">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-[#617589]" />
                  </div>
                  <Input
                    className="block w-full pl-10 pr-3 py-2.5 border border-[#dbe0e6] dark:border-[#2a3846] rounded-lg leading-5 bg-[#f6f7f8] dark:bg-[#101922] text-[#111418] dark:text-white placeholder-[#617589] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Tìm kiếm theo tên tour hoặc mã tour..."
                    type="text"
                  />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative min-w-[160px] flex-1 md:flex-none">
                    <Select>
                      <SelectTrigger className="block w-full pl-3 pr-10 py-2.5 text-base border border-[#dbe0e6] dark:border-[#2a3846] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm rounded-lg appearance-none cursor-pointer">
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang diễn ra</SelectItem>
                        <SelectItem value="upcoming">Sắp tới</SelectItem>
                        <SelectItem value="completed">Đã hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors min-w-[100px]">
                    Lọc
                  </Button>
                </div>
              </div>

              {/* Tour Table/List */}
              <div className="bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-[#2a3846] rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <ther>
                      <tr className="bg-[#f9fafb] dark:bg-[#202d3a] border-b border-[#dbe0e6] dark:border-[#2a3846] hover:bg-[#f9fafb] dark:hover:bg-[#202d3a]">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-slate-400 w-[350px]">
                          Thông tin Tour
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-slate-400">
                          Đơn vị tổ chức
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-slate-400">
                          Thời gian
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-slate-400">
                          Vai trò
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-slate-400">
                          Trạng thái
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-slate-400 text-right">
                          Hành động
                        </th>
                      </tr>
                    </ther>
                    <tbody className="divide-y divide-[#dbe0e6] dark:divide-[#2a3846]">
                      {/* Row 1: Active */}
                      <tr className="group hover:bg-[#f6f7f8] dark:hover:bg-[#202d3a] transition-colors">
                        <td className="p-4">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 rounded-lg shrink-0 overflow-hidden">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuj77ykoiWKuuGVUW89O5Q1-wlNcAQvOpCQmR8hQWP1tBU-9u-_-anjJMSLyc-DHsO_Yci-WdFRE9tqRC-wZIo0tEnxy8IuhKcJLLAY5sBmBWA3oqaYU41WQ8-6SCIDVG6RXMTVc0PVgdpYNXDVhabmaZYmN6pdQJ2zk_5XuDgOFt9DQ-dqENrH9vXGURGOSjHCG1Z2QQIl3BFal9HhDt9K_HUo2mfI8ZS8IwhmySeV8Nc-QMHIHLNCm0DuRL61CgvxIVyKqX5Ww"
                                alt="Hanoi Old Quarter street scene"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <span className="text-sm font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">
                                Khám phá Phố Cổ Hà Nội
                              </span>
                              <span className="text-xs text-[#617589] dark:text-slate-400">Mã: HN-001</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-[18px] w-[18px] text-[#617589]" />
                            <span className="text-sm font-medium text-[#111418] dark:text-white">
                              Hanoi Travel Co.
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111418] dark:text-white">
                              15/05 - 18/05/2024
                            </span>
                            <span className="text-xs text-[#617589] dark:text-slate-400">4 ngày 3 đêm</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                            <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                            HDV Chính
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                            Đang diễn ra
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>

                      {/* Row 2: Active */}
                      <tr className="group hover:bg-[#f6f7f8] dark:hover:bg-[#202d3a] transition-colors">
                        <td className="p-4">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 rounded-lg shrink-0 overflow-hidden">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5Fli8xeg9_01rmcB6MXinv4Q9bu5W-O0C-SrcZxw4eiyEvT-DmrrRMIfE8QPJM0ZiKw7soaWrti12Hfi1PbqaMTOk4_UbEhha8cKRiE0BNPe1npI7DpZl6mQcZWGAaGB4XmuvZhom0EMVNDnyNXoYNDBK5SWIvQ-dwfi5HsBPPmY6K2WX1xNWyq5403Q27zDwjV0t3XCIXc8myiLYjeu8fxgzC-1WjGU8c3RZjDYlUXE6LoXFrP2CkrqtZyB1RfhMc3YETPUJsw"
                                alt="Ha Long Bay limestone karsts"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <span className="text-sm font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">
                                Du thuyền Vịnh Hạ Long
                              </span>
                              <span className="text-xs text-[#617589] dark:text-slate-400">Mã: HL-203</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-[18px] w-[18px] text-[#617589]" />
                            <span className="text-sm font-medium text-[#111418] dark:text-white">
                              Ocean Blue Tours
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111418] dark:text-white">
                              16/05 - 17/05/2024
                            </span>
                            <span className="text-xs text-[#617589] dark:text-slate-400">2 ngày 1 đêm</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800">
                            <span className="size-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></span>
                            HDV Phụ
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                            Đang diễn ra
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>

                      {/* Row 3: Upcoming */}
                      <tr className="group hover:bg-[#f6f7f8] dark:hover:bg-[#202d3a] transition-colors">
                        <td className="p-4">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 rounded-lg shrink-0 overflow-hidden">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChv7BNbgdeHEgFLKbgbVTy7X0plP2pMKwOOuknGm5-IhYEGev6XHf-_xQDlz__z9Mo47PPjnbiOk2gHJ22c710_PWB1ZbN6DK0WeRIcXx9vx34GCFSb9gKmKNl134fLMP8N064b9PLo8EN3EJOnIRHuYlmeMPJOUZyhe0-lUd2xpmvF4UiNT0HiNoZqasC32rMM5R6eoGFrqHapiyme0xhPHIy1OFdxXp5t6vCZxxzrQub24eMXTC2FTJwdfluY4m5yJMNoQFBrw"
                                alt="Hoi An ancient town lanterns"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <span className="text-sm font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">
                                Di sản Miền Trung (Đà Nẵng - Hội An)
                              </span>
                              <span className="text-xs text-[#617589] dark:text-slate-400">Mã: DN-099</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-[18px] w-[18px] text-[#617589]" />
                            <span className="text-sm font-medium text-[#111418] dark:text-white">Viet Heritage</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111418] dark:text-white">
                              25/05 - 28/05/2024
                            </span>
                            <span className="text-xs text-[#617589] dark:text-slate-400">4 ngày 3 đêm</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                            <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                            HDV Chính
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                            Sắp tới
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>

                      {/* Row 4: Completed */}
                      <tr className="group hover:bg-[#f6f7f8] dark:hover:bg-[#202d3a] transition-colors">
                        <td className="p-4">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 rounded-lg shrink-0 overflow-hidden grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-9HkqBt5GLZiA9plDwa0HZekVVeo3asoW4zRkpdIXAz8leuQfQWbBv7gf-Sxwui4OxTcdYVdwcx4K2M9UbYWQlwYaHZPCvdDyZ4YJuNRP9QVVt2JabEXMAcm9RhmN0s0thuqfI6PmBWJAQJnlzOn0oDpnyaW7PXHbXdpf1gb-aVLHKUOpLaalMqFrJ5wUyY48kQp6BL0JyDrlOBNttF86Z5ztOjBniadzAhZZrh0GP40KvcgsOH5at6QSysnGyLCdBxSCJu7sxg"
                                alt="Ninh Binh landscape"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <span className="text-sm font-bold text-[#617589] dark:text-slate-400 group-hover:text-[#111418] dark:group-hover:text-white transition-colors">
                                Tour Ninh Bình Trong Ngày
                              </span>
                              <span className="text-xs text-[#617589] dark:text-slate-400">Mã: NB-101</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-[18px] w-[18px] text-[#617589]" />
                            <span className="text-sm font-medium text-[#617589] dark:text-slate-400">
                              Explore Vietnam
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#617589] dark:text-slate-400">10/05/2024</span>
                            <span className="text-xs text-[#617589] dark:text-slate-400">1 ngày</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 opacity-75">
                            <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                            HDV Chính
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                            Hoàn thành
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-[#f0f2f4] dark:bg-[#2a3846] text-[#111418] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-all"
                          >
                            Xem lại
                          </Button>
                        </td>
                      </tr>

                      {/* Row 5: Cancelled */}
                      <tr className="group hover:bg-[#f6f7f8] dark:hover:bg-[#202d3a] transition-colors">
                        <td className="p-4">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 rounded-lg shrink-0 overflow-hidden grayscale opacity-80">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGX09XUJQ7wl1EhUdv7WPrCLZQkh39dYRhiTf395GuHfGHMIch36wiMOqR9Qg6AfKo8QE_YR0qR9dPAURTz9zDU6AqiYM4CxDLlehrK1VPKB5fK2NBlGg6gt76aXwO3YOMxCAMoWZQvD6G5Bit47iE5aFCXqI4sp2AMEqLscx6PWqxVvMNGoIJ3wgRKwmm8GsE4QtYjH16nmIt1XZWOO-nJQN-F_jIdVpfVWWefJeqyqipvPL0NkQGTyxUIc19bU8pQeDopXAFfw"
                                alt="Sa Pa terraced rice fields"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <span className="text-sm font-bold text-[#617589] dark:text-slate-400 line-through">
                                Sapa Trekking Adventure
                              </span>
                              <span className="text-xs text-[#617589] dark:text-slate-400">Mã: SP-055</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-[18px] w-[18px] text-[#617589]" />
                            <span className="text-sm font-medium text-[#617589] dark:text-slate-400">
                              Highland Tours
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#617589] dark:text-slate-400">
                              01/05 - 03/05/2024
                            </span>
                            <span className="text-xs text-[#617589] dark:text-slate-400">3 ngày 2 đêm</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800 opacity-75">
                            <span className="size-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></span>
                            HDV Phụ
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-100 dark:border-red-800">
                            Đã hủy
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-[#f0f2f4] dark:bg-[#2a3846] text-[#111418] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-all"
                          >
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#dbe0e6] dark:border-[#2a3846] bg-[#f9fafb] dark:bg-[#202d3a]">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      variant="outline"
                      className="relative inline-flex items-center rounded-md border border-[#dbe0e6] dark:border-[#2a3846] bg-white dark:bg-[#101922] px-4 py-2 text-sm font-medium text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="relative ml-3 inline-flex items-center rounded-md border border-[#dbe0e6] dark:border-[#2a3846] bg-white dark:bg-[#101922] px-4 py-2 text-sm font-medium text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846]"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-[#617589] dark:text-slate-400">
                        Hiển thị <span className="font-medium text-[#111418] dark:text-white">1</span> đến{" "}
                        <span className="font-medium text-[#111418] dark:text-white">5</span> trong số{" "}
                        <span className="font-medium text-[#111418] dark:text-white">50</span> kết quả
                      </p>
                    </div>
                    <div>
                      <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <Button
                          variant="outline"
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[#617589] ring-1 ring-inset ring-[#dbe0e6] dark:ring-[#2a3846] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] focus:z-20 focus:outline-offset-0"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                          1
                        </Button>
                        <Button
                          variant="outline"
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#111418] dark:text-white ring-1 ring-inset ring-[#dbe0e6] dark:ring-[#2a3846] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] focus:z-20 focus:outline-offset-0"
                        >
                          2
                        </Button>
                        <Button
                          variant="outline"
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#111418] dark:text-white ring-1 ring-inset ring-[#dbe0e6] dark:ring-[#2a3846] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] focus:z-20 focus:outline-offset-0"
                        >
                          3
                        </Button>
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#617589] ring-1 ring-inset ring-[#dbe0e6] dark:ring-[#2a3846] focus:outline-offset-0">
                          ...
                        </span>
                        <Button
                          variant="outline"
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#111418] dark:text-white ring-1 ring-inset ring-[#dbe0e6] dark:ring-[#2a3846] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] focus:z-20 focus:outline-offset-0"
                        >
                          10
                        </Button>
                        <Button
                          variant="outline"
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[#617589] ring-1 ring-inset ring-[#dbe0e6] dark:ring-[#2a3846] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3846] focus:z-20 focus:outline-offset-0"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

