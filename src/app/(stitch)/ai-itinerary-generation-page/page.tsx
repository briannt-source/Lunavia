import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Menu,
  LayoutDashboard,
  MapPin,
  FileText,
  BarChart3,
  ChevronRight,
  Sparkles,
  PlaneTakeoff,
  Calendar,
  Users,
  Clock,
  Edit,
  Save,
  PlusCircle,
  Settings,
  Sparkles as ColorsSpark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AiItineraryGenerationPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-body overflow-x-hidden min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f1f5] dark:border-gray-800 bg-white dark:bg-[#1a222e] px-10 py-3">
        <div className="flex items-center gap-4 text-[#111318] dark:text-white">
          <div className="size-8 flex items-center justify-center text-primary">
            <Globe className="h-8 w-8" />
          </div>
          <h2 className="text-[#111318] dark:text-white text-lg font-display font-bold leading-tight tracking-[-0.015em]">
            TourConnect B2B
          </h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Link
              href="#"
              className="text-[#111318] dark:text-gray-300 hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-[#111318] dark:text-gray-300 hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Quản lý Tour
            </Link>
            <Link
              href="#"
              className="text-[#111318] dark:text-gray-300 hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Booking
            </Link>
            <Link
              href="#"
              className="text-[#111318] dark:text-gray-300 hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Báo cáo
            </Link>
          </div>
          <div className="relative w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0jXEAbKw3ZjnTkFG2zaa9n1mCSC7GkC9Pa2fkMASPq5aaevAVlciUrZyjS7JcDa2sfVQP4_1HZONCGb543f0F65HO7a9g9jbqCZbxOYE0EDNd_q9a36yYR6UXzAyqc49yBxZTjmsltgp5GeELzNRuX1TsY4EunrIHvTJFGSkGwXujyurNmsZDyf0i9xtd73rCOEYpSF1KonaWp9S0OjOYPhO_vx0cqmKe8HNNEoCR82bAmwel_F2eMZXE3RISLXGW3pi-1z_E9w"
              alt="User avatar profile picture"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden text-[#111318] dark:text-white">
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex flex-col flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-10 py-6 gap-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 items-center">
          <Link
            href="#"
            className="text-[#606e8a] dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="text-[#606e8a] dark:text-gray-500 h-4 w-4" />
          <Link
            href="#"
            className="text-[#606e8a] dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Công cụ
          </Link>
          <ChevronRight className="text-[#606e8a] dark:text-gray-500 h-4 w-4" />
          <span className="text-[#111318] dark:text-white text-sm font-medium leading-normal">
            AI Itinerary
          </span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary p-2 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-[#111318] dark:text-white text-3xl md:text-4xl font-display font-black leading-tight tracking-[-0.033em]">
              Tạo lịch trình AI
            </h1>
          </div>
          <p className="text-[#606e8a] dark:text-gray-400 text-base font-normal leading-normal max-w-3xl">
            Công cụ lập kế hoạch tour tự động, tối ưu hóa trải nghiệm khách hàng và tuân thủ Luật
            Du lịch Việt Nam 2025.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (Control Center) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1a222e] rounded-xl p-5 shadow-sm border border-[#e5e7eb] dark:border-gray-800 flex flex-col gap-5 sticky top-24">
              <h3 className="text-lg font-bold font-display text-[#111318] dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Thông số tour
              </h3>

              {/* Departure */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">
                  Điểm khởi hành
                </span>
                <div className="relative">
                  <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 h-10 pl-10 pr-3 text-sm text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 transition-all"
                    placeholder="VD: TP. Hồ Chí Minh"
                    defaultValue="TP. Hồ Chí Minh"
                  />
                </div>
              </label>

              {/* Destination */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">
                  Điểm đến mong muốn
                </span>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 h-10 pl-10 pr-3 text-sm text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 transition-all"
                    placeholder="VD: Đà Nẵng, Hội An"
                    defaultValue="Đà Nẵng, Hội An"
                  />
                </div>
              </label>

              {/* Duration & Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Số ngày</span>
                  <Input
                    className="w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 h-10 px-3 text-sm text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 transition-all"
                    type="number"
                    defaultValue="4"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Loại hình</span>
                  <div className="relative">
                    <Select defaultValue="van-hoa">
                      <SelectTrigger className="w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 h-10 px-3 text-sm text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="van-hoa">Văn hóa</SelectItem>
                        <SelectItem value="nghi-duong">Nghỉ dưỡng</SelectItem>
                        <SelectItem value="mao-hiem">Mạo hiểm</SelectItem>
                        <SelectItem value="am-thuc">Ẩm thực</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </label>
              </div>

              {/* Budget */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">
                  Ngân sách ước tính / khách
                </span>
                <div className="relative">
                  <Input
                    className="w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 h-10 pl-3 pr-12 text-sm text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 transition-all"
                    placeholder="0"
                    defaultValue="5.000.000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    VND
                  </span>
                </div>
              </label>

              {/* Special Interests */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">
                  Sở thích / Yêu cầu đặc biệt
                </span>
                <Textarea
                  className="w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[100px] p-3 text-sm text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 transition-all resize-y"
                  placeholder="VD: Khách ăn chay, thích chụp ảnh, có trẻ em..."
                  defaultValue="Khách muốn trải nghiệm ẩm thực đường phố và tham quan các làng nghề truyền thống."
                />
              </label>

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>

              <Button className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold font-display shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
                <ColorsSpark className="h-5 w-5" />
                Tạo lịch trình AI
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Bằng việc tạo lịch trình, bạn đồng ý tuân thủ các quy định về an toàn lữ hành.
              </p>
            </div>
          </div>

          {/* Right Column: Result Canvas */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            {/* Result Header & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#1a222e] p-4 rounded-xl border border-[#e5e7eb] dark:border-gray-800 shadow-sm">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold font-display text-[#111318] dark:text-white">
                  Lịch trình gợi ý: Đà Nẵng - Hội An
                </h2>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> 4 ngày 3 đêm
                  <span className="mx-1">•</span>
                  <Users className="h-4 w-4" /> Khách ghép đoàn
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-[#111318] dark:text-white transition-colors"
                >
                  <Edit className="h-[18px] w-[18px]" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-[#111318] dark:text-white transition-colors"
                >
                  <Save className="h-[18px] w-[18px]" />
                  Lưu nháp
                </Button>
                <Button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium shadow-md hover:bg-blue-700 transition-colors">
                  <PlusCircle className="h-[18px] w-[18px]" />
                  Thêm vào Tour
                </Button>
              </div>
            </div>

            {/* Itinerary Timeline */}
            <div className="flex flex-col gap-6 pb-20">
              {/* Day 1 */}
              <div className="bg-white dark:bg-[#1a222e] rounded-xl overflow-hidden border border-[#e5e7eb] dark:border-gray-800 shadow-sm">
                <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                  <h4 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      NGÀY 1
                    </span>
                    Đón khách - Bán đảo Sơn Trà - Đà Nẵng
                  </h4>
                  <span className="text-sm text-gray-500 font-medium">Thứ Hai, 15/05/2025</span>
                </div>
                <div className="p-5 flex flex-col gap-6 relative">
                  {/* Timeline connector line */}
                  <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Activity Item 1 */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex-none size-3 rounded-full bg-primary ring-4 ring-white dark:ring-[#1a222e] mt-1.5 ml-3"></div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">
                          08:00 - 09:30
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          Di chuyển
                        </span>
                      </div>
                      <p className="text-base font-medium text-[#111318] dark:text-gray-200">
                        Đón khách tại sân bay Đà Nẵng
                      </p>
                      <p className="text-sm text-gray-500">
                        Xe và HDV đón khách tại điểm hẹn, đưa về khách sạn gửi hành lý (nếu có phòng
                        sớm sẽ check-in).
                      </p>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex-none size-3 rounded-full bg-primary ring-4 ring-white dark:ring-[#1a222e] mt-1.5 ml-3"></div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">
                          10:00 - 12:00
                        </span>
                        <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                          Tham quan
                        </span>
                      </div>
                      <p className="text-base font-medium text-[#111318] dark:text-gray-200">
                        Khám phá Bán đảo Sơn Trà & Chùa Linh Ứng
                      </p>
                      <p className="text-sm text-gray-500">
                        Viếng chùa Linh Ứng, chiêm ngưỡng tượng Phật Bà Quan Âm cao nhất Việt Nam.
                        Ngắm toàn cảnh thành phố biển Đà Nẵng từ trên cao.
                      </p>
                      {/* Image Gallery for Activity */}
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        <div className="relative h-24 w-36 flex-none rounded-lg overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX2y7HTI9_hN8YPPxZy-suhUVbLA3-Y507RS5tU2Q5XuJKkvthn0AoA4M22FDIVNK9GPI4MAPxcw8QDxylGc6XIQsauu7H-ZxIGkh2t5exbQ1t3adXGvrrjvLKQ2kYqM6lBFEFK0lRUKrPlyJ8CMnUL2AQEAyVOOXBK9QGSlbScTWtHKucyuzWFN7DmkNtFX04KmKFkPYfDL9Z1QAlP_ABQESv6zG1cWp4Xnrbq-qboQ1TsrIr0qc-8WLWTc3EeDweAJoz0aCncw"
                            alt="Chùa Linh Ứng Đà Nẵng"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="relative h-24 w-36 flex-none rounded-lg overflow-hidden bg-gray-200">
                          <Image
                            src="https://placeholder.pics/svg/300"
                            alt="View biển từ Sơn Trà"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex-none size-3 rounded-full bg-primary ring-4 ring-white dark:ring-[#1a222e] mt-1.5 ml-3"></div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">
                          12:30 - 13:30
                        </span>
                        <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                          Ẩm thực
                        </span>
                      </div>
                      <p className="text-base font-medium text-[#111318] dark:text-gray-200">
                        Ăn trưa đặc sản: Bánh tráng thịt heo
                      </p>
                      <p className="text-sm text-gray-500">
                        Thưởng thức đặc sản nổi tiếng tại nhà hàng Trần hoặc Mậu (đã bao gồm trong
                        ngân sách).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="bg-white dark:bg-[#1a222e] rounded-xl overflow-hidden border border-[#e5e7eb] dark:border-gray-800 shadow-sm">
                <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                  <h4 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      NGÀY 2
                    </span>
                    Ngũ Hành Sơn - Phố Cổ Hội An
                  </h4>
                  <span className="text-sm text-gray-500 font-medium">Thứ Ba, 16/05/2025</span>
                </div>
                <div className="p-5 flex flex-col gap-6 relative">
                  <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Activity Item 1 */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex-none size-3 rounded-full bg-primary ring-4 ring-white dark:ring-[#1a222e] mt-1.5 ml-3"></div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">
                          14:00 - 16:00
                        </span>
                        <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                          Tham quan
                        </span>
                      </div>
                      <p className="text-base font-medium text-[#111318] dark:text-gray-200">
                        Danh thắng Ngũ Hành Sơn
                      </p>
                      <p className="text-sm text-gray-500">
                        Thăm quan hệ thống hang động, chùa chiền và Làng đá mỹ nghệ Non Nước.
                      </p>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex-none size-3 rounded-full bg-primary ring-4 ring-white dark:ring-[#1a222e] mt-1.5 ml-3"></div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">
                          17:00 - 21:00
                        </span>
                        <span className="text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                          Văn hóa
                        </span>
                      </div>
                      <p className="text-base font-medium text-[#111318] dark:text-gray-200">
                        Khám phá Phố cổ Hội An
                      </p>
                      <p className="text-sm text-gray-500">
                        Bách bộ tham quan Chùa Cầu, Nhà Cổ Tấn Ký, Hội Quán Phước Kiến. Thả đèn hoa
                        đăng trên sông Hoài.
                      </p>
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        <div className="relative h-24 w-36 flex-none rounded-lg overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzcQ6noi9epcVZP8cMHw2tasLLBsMPoXGAcOY6LzXx8nTLvHZft-h5VffjPHVuWuDQX3vEJCsecO9TQcqNVJYj_jryVrRZAGZ23Qq9mKq8Tdlprj8oC7SYTdlm1DuG2zlV_T7g3nnNU_ISZpp91B9GvTB8HItxe4T1iqF64dqI27NeyWlQrYCIJIA8q1Q-1guVKiCxSbuGKED9knACOmKLeoEF9f6vDwjLRF9Q5lGCVIidlOpHOxW3GY5fiPci4X6KxgPCvhvQBg"
                            alt="Phố cổ Hội An ban đêm"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#1a222e] border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden z-40">
              <Button className="w-full h-12 rounded-lg bg-primary text-white font-bold font-display">
                Thêm vào Tour mới
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



