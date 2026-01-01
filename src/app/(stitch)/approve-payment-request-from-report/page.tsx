import Link from "next/link";
import Image from "next/image";
import {
  TravelExplore,
  Bell,
  Settings,
  Search,
  Verified,
  Users,
  Star,
  Clock,
  MapPin,
  Receipt,
  Eye,
  X,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApprovePaymentRequestFromReportPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen flex flex-col overflow-hidden text-slate-900 dark:text-white">
      {/* Top Navigation */}
      <header className="flex shrink-0 items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#283039] bg-white dark:bg-[#111418] px-6 py-3 z-20">
        <div className="flex items-center gap-4">
          <div className="size-8 text-primary">
            <TravelExplore className="h-8 w-8" />
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
            VietTour Admin
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#283039] text-slate-500 dark:text-white transition-colors"
          >
            <Bell className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#283039] text-slate-500 dark:text-white transition-colors"
          >
            <Settings className="h-6 w-6" />
          </Button>
          <div className="relative w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqHR88BLZrGOZKEiQ98fzyutIcAOzTEH0_GXLIHerZxiQ9zMzlz0r1xVrtROMhrRCs_JLWSVIKOMTV13VKOnI2WyEW6RQqIHg6lG04Yo3a2sfdQgFkHsvjLuvFZyHmvpwwSOW3TZCP10OqEATrQIvCw8DvaZrrlGOLicGMnjrUI2T1KVgm4lZR6-MdIJaNiRtL9IB29cn0nrP-as6qNLtoVxlasneM27ODg5rVEiXUobKGiuTOh__lJ96Zj4A9t1gKJW2JkzbvCQ"
              alt="Admin User Profile"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area (Split Pane) */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: List of Reports */}
        <aside className="flex flex-col w-[420px] shrink-0 border-r border-slate-200 dark:border-[#283039] bg-white dark:bg-[#111418]">
          {/* Filters & Search */}
          <div className="p-4 flex flex-col gap-4 border-b border-slate-200 dark:border-[#283039]">
            <div>
              <h1 className="text-xl font-bold dark:text-white">Duyệt yêu cầu thanh toán</h1>
              <p className="text-sm text-slate-500 dark:text-[#9dabb9]">
                Quản lý báo cáo tour & giải ngân
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <Input
                className="block w-full rounded-lg border-0 py-2.5 pl-10 bg-slate-100 dark:bg-[#283039] text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Tìm theo mã tour, HDV..."
                type="text"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <Button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-semibold whitespace-nowrap border border-primary/20">
                Chờ duyệt{" "}
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  4
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#283039] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#3d4650] text-sm font-medium whitespace-nowrap transition-colors"
              >
                Đã duyệt
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#283039] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#3d4650] text-sm font-medium whitespace-nowrap transition-colors"
              >
                Từ chối
              </Button>
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Item 1: Active */}
            <div className="group relative flex cursor-pointer flex-col gap-3 rounded-xl bg-primary/10 dark:bg-[#1e2832] p-4 border border-primary/40 shadow-sm transition-all hover:bg-primary/5">
              <div className="absolute right-3 top-3 flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2.5 bg-amber-500"></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-full shrink-0 overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFRtS_t6mrJ6JYq9KeoA9ze8F-piuf8_j57uL24T24gEmMpa0epEybKyh0zxUYBigPZd9Dr66D7kSJsKoUcSdnfwiqawGz6ry5hW0HVXjNFlVkFjtOLwOluuntX9KUbCK9owOaihX4j64wOrDyXt9U7e8FamerBgFixm1ia2xpHO_IQpRNPHNBhpP1KH7L7GDhwJsxzf95HUetM3YXpoCOwouLUbv7fleYFNR-XAmlZHnEcW2zYrHjT6qfPf8bd_7yGh69AeIPrw"
                    alt="Tour Guide Portrait"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    Nguyễn Văn A
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#9dabb9]">Mã HDV: VN-GUIDE-088</p>
                </div>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  Tour: Hạ Long Bay 2D1N Premium Cruise
                </p>
                <p className="text-xs text-slate-500 dark:text-[#9dabb9] mt-0.5">
                  Code: HL-2025-001 • 15/10/2025
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 mt-1">
                <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-400/20">
                  Chờ thanh toán
                </span>
                <span className="text-sm font-bold text-primary">4.500.000 ₫</span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group relative flex cursor-pointer flex-col gap-3 rounded-xl bg-white dark:bg-[#111418] hover:bg-slate-50 dark:hover:bg-[#1c2126] p-4 border border-slate-200 dark:border-[#283039] transition-all">
              <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-full shrink-0 overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVsqJCMjDZ1NS95EB4eygnBNaiIs16VbNZz37cDzo6YgNDVv6H2Iqa_zETGjYd1tD6ewAeI7SUMapOYu1En8uLNTGG6yETjCqBuJbye2I_MCqNprvHFfqIsdUHpfFdfu1islMYPQWbnadXhsR8IJV6NpWd5LueIITxAoZmRXSMOM4qcyOPRwyJ5PJtf6jb-x3IKztGYTPbEqHR4qvhqPh3hG374rhNE2osRmn0XApQ2LyDYFx1Umi27v3tP5by5tX_NDWdHcCfVA"
                    alt="Female Guide Portrait"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    Trần Thị B
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#9dabb9]">Mã HDV: VN-GUIDE-102</p>
                </div>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  Tour: Sai Gon City Tour & Cu Chi Tunnels
                </p>
                <p className="text-xs text-slate-500 dark:text-[#9dabb9] mt-0.5">
                  Code: SG-2025-442 • 14/10/2025
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 mt-1">
                <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-400/20">
                  Chờ thanh toán
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">1.200.000 ₫</span>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group relative flex cursor-pointer flex-col gap-3 rounded-xl bg-white dark:bg-[#111418] hover:bg-slate-50 dark:hover:bg-[#1c2126] p-4 border border-slate-200 dark:border-[#283039] transition-all">
              <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-full shrink-0 overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC-ru6T1TKjKYeMQd302Vf2QgOUANxyUrfpPqx0PaHdhLh1VtZZTTeh0vyyY4MiwrguvsyQajOQKAdj8FW6ALmmLiMK3J2tcsk2JGaNpIr2vc5Pu3hLJ88rEsg2B5fvgIx2H452tOi40IKD4ZjNHGwogMKXJtP_EXHgHyRMtz7rMq-W7zwhuQCHESvzNhXv1V5IUgw5swys7wXbe5AanbpzAAoUIKsoxOe9En-FNKRyryZlDbkmUTTGQ2Jr-HlNtwirKN3Nibvog"
                    alt="Male Guide Portrait"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Lê Văn C</p>
                  <p className="text-xs text-slate-500 dark:text-[#9dabb9]">Mã HDV: VN-GUIDE-005</p>
                </div>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  Tour: Da Nang - Hoi An Walking Tour
                </p>
                <p className="text-xs text-slate-500 dark:text-[#9dabb9] mt-0.5">
                  Code: DN-2025-112 • 12/10/2025
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 mt-1">
                <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-400/20">
                  Chờ thanh toán
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">850.000 ₫</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: Detailed View */}
        <section className="flex flex-1 flex-col h-full bg-slate-50 dark:bg-[#0f151b] overflow-hidden relative">
          {/* Detail Header */}
          <div className="shrink-0 px-8 py-5 border-b border-slate-200 dark:border-[#283039] bg-white dark:bg-[#111418]">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Verified className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                    Compliance Checked: Law 2025
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Báo cáo: Hạ Long Bay 2D1N Premium Cruise
                </h1>
                <p className="text-slate-500 dark:text-[#9dabb9]">
                  Tour ID: <span className="font-mono text-slate-700 dark:text-slate-300">HL-2025-001</span>{" "}
                  • Khởi hành: 15/10/2025
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-[#9dabb9]">Tổng yêu cầu thanh toán</p>
                <p className="text-3xl font-black text-primary tracking-tight">4.500.000 ₫</p>
              </div>
            </div>
            {/* Tabs */}
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="flex gap-6 border-b border-slate-100 dark:border-[#283039] bg-transparent h-auto p-0">
                <TabsTrigger
                  value="details"
                  className="pb-3 border-b-2 border-primary text-primary font-medium text-sm px-1 data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  Chi tiết Tour
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="pb-3 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 font-medium text-sm px-1 transition-colors data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  Tài chính & Hóa đơn
                </TabsTrigger>
                <TabsTrigger
                  value="attachments"
                  className="pb-3 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 font-medium text-sm px-1 transition-colors data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  Ảnh & Chứng từ (5)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Detail Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-5xl space-y-8 pb-32">
              {/* Guide Note & Warning */}
              <Alert className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <AlertDescription>
                  <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">
                    Ghi chú từ HDV (Quan trọng)
                  </p>
                  <p className="text-amber-900/80 dark:text-amber-100/70 text-sm mt-1">
                    &quot;Tour diễn ra tốt đẹp. Tuy nhiên có phát sinh phí vé thăm quan đảo Ti Tốp do giá
                    vé tăng đột xuất chưa kịp cập nhật trong hệ thống. Tôi đã ứng trước tiền mặt và đính
                    kèm hóa đơn đỏ bên dưới.&quot;
                  </p>
                </AlertDescription>
              </Alert>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1e2832] p-4 rounded-xl border border-slate-200 dark:border-[#283039]">
                  <p className="text-xs text-slate-500 dark:text-[#9dabb9] uppercase font-bold tracking-wider">
                    Đoàn khách
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="h-5 w-5 text-slate-400" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">15 pax</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1e2832] p-4 rounded-xl border border-slate-200 dark:border-[#283039]">
                  <p className="text-xs text-slate-500 dark:text-[#9dabb9] uppercase font-bold tracking-wider">
                    Đánh giá
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">4.8/5</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1e2832] p-4 rounded-xl border border-slate-200 dark:border-[#283039]">
                  <p className="text-xs text-slate-500 dark:text-[#9dabb9] uppercase font-bold tracking-wider">
                    Thời lượng
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">2N1Đ</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1e2832] p-4 rounded-xl border border-slate-200 dark:border-[#283039]">
                  <p className="text-xs text-slate-500 dark:text-[#9dabb9] uppercase font-bold tracking-wider">
                    Trạng thái GPS
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">Verified</span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="bg-white dark:bg-[#1e2832] rounded-xl border border-slate-200 dark:border-[#283039] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-[#283039]">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Chi tiết yêu cầu thanh toán
                  </h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-[#283039] hover:bg-slate-50 dark:hover:bg-[#283039]">
                      <TableHead className="px-6 py-3 font-medium text-slate-500 dark:text-[#9dabb9]">
                        Hạng mục
                      </TableHead>
                      <TableHead className="px-6 py-3 font-medium text-slate-500 dark:text-[#9dabb9]">
                        Diễn giải
                      </TableHead>
                      <TableHead className="px-6 py-3 font-medium text-slate-500 dark:text-[#9dabb9] text-right">
                        Số tiền (VND)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-[#283039] text-slate-700 dark:text-slate-300">
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-[#232d36]">
                      <TableCell className="px-6 py-4">Công tác phí HDV</TableCell>
                      <TableCell className="px-6 py-4">Theo hợp đồng (2 ngày)</TableCell>
                      <TableCell className="px-6 py-4 text-right tabular-nums">3.000.000 ₫</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-[#232d36]">
                      <TableCell className="px-6 py-4">Phụ cấp ăn uống</TableCell>
                      <TableCell className="px-6 py-4">4 bữa chính</TableCell>
                      <TableCell className="px-6 py-4 text-right tabular-nums">1.000.000 ₫</TableCell>
                    </TableRow>
                    <TableRow className="bg-amber-50/50 dark:bg-amber-900/5 hover:bg-amber-50 dark:hover:bg-amber-900/10">
                      <TableCell className="px-6 py-4 font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Phát sinh vé thăm quan
                      </TableCell>
                      <TableCell className="px-6 py-4 text-amber-700 dark:text-amber-400">
                        Vé đảo Ti Tốp (Có hóa đơn đính kèm)
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium text-amber-700 dark:text-amber-400 tabular-nums">
                        500.000 ₫
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-slate-50 dark:bg-[#283039] font-bold text-base">
                      <TableCell className="px-6 py-4 text-slate-900 dark:text-white" colSpan={2}>
                        Tổng cộng
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right text-primary tabular-nums">
                        4.500.000 ₫
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Attachments Gallery */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Chứng từ & Hình ảnh
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Image 1 */}
                  <div className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 dark:bg-[#283039] cursor-pointer">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnhjVzsdHW4cTFb7OZS0ETVk9Dv25T8pNwaiwCs6piEcwJth3VRYZYWmOGA8ENP98Ze_TX-WQoBL8SWgOCrGJddpZ_cuMuOPInvsGmR0bqgSVRAEFr2BTNQ-Uod5wVc1mjAdQKr3n3iEdLPq6SB9d3GEGKzGITC2puNrrec07DDakZxs-10btwiOGeY0GlXd9N0xANzfZNKjfEIZHv-qKYTGRPtpOVVCE7714-kHfKSHJO8G1dQ5oIyiIVW2FTTZGICQJX69lJBA"
                      alt="Red invoice receipt photo"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                        Hóa đơn đỏ #8291
                      </span>
                    </div>
                  </div>
                  {/* Image 2 */}
                  <div className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 dark:bg-[#283039] cursor-pointer">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ry4FMAliSdZ4rMfcOr5c6BsvmjdcIJe4uKxrpR4ViUrlJwer5BwxKZhVu7OT-GnXiIEPV2vgR6bRNK56bRheM90rRoWBfhoXrlCeThRjtoE2YFYFXIWPibChyB6aN2VK2mS407BDNQKqqQtYsisW2bAbGbbZTDOsVr3XzWJKUIL87eSHtNGn3sEn5SeG3srC6GLefnqAJ0UZtnMTBOP_wrounEDH70aHEU7xMuQ069XIKTbnmv2NT3C5Q3Ro6N9HiV3jILTQwg"
                      alt="Tour group photo at Halong Bay"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                        Check-in tại bến
                      </span>
                    </div>
                  </div>
                  {/* Image 3 */}
                  <div className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 dark:bg-[#283039] cursor-pointer">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW8a_De6rH_w1HnQ9Dt8GCfPSOL8MZgVaXqCNIonfhkmPucr_ex_IZj3Oxwo0ftK2vxPWr7NLzAJRKsb7Pd_dA1oZ4B83HERkAYcCZVhMGTqX9mRm8RnVKMVqkqSRtsZLspGdMxPBgym3rnYWkmJkh20jsqvA_g7rj1QNw_taKaQ8qblCNZ1yvmRZXuY5vyvr6D8JEVUJncGXJkoArhO2etDOPPfFQM_uacw_nx0znjuK8U5SHLxtwCQ2CF3OPzvHEOz_zCIDZYA"
                      alt="Ticket stub photo"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                        Vé thăm quan
                      </span>
                    </div>
                  </div>
                  {/* More placeholder */}
                  <div className="flex items-center justify-center aspect-[4/3] rounded-lg bg-slate-100 dark:bg-[#1e2832] border border-dashed border-slate-300 dark:border-[#283039] text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-[#283039] transition-colors">
                    <span className="text-sm font-medium">+2 Ảnh khác</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#111418] border-t border-slate-200 dark:border-[#283039] flex flex-col gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Input
                  className="w-full rounded-lg border-slate-300 dark:border-[#3d4650] bg-slate-50 dark:bg-[#1e2832] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary"
                  placeholder="Nhập ghi chú cho HDV (nếu cần)..."
                  type="text"
                />
              </div>
              <div className="flex gap-3 shrink-0">
                <Button
                  variant="outline"
                  className="px-6 py-2.5 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <X className="h-[18px] w-[18px]" />
                  Từ chối yêu cầu
                </Button>
                <Button className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                  <CheckCircle2 className="h-[18px] w-[18px]" />
                  Duyệt thanh toán
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

